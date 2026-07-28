-- OneStudio OS Analytics Core 1.0
-- Tenant-safe operational analytics derived from canonical bookings, clients and payments.

create or replace function public.get_admin_analytics(
  p_business_id uuid,
  p_start_date date,
  p_end_date date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
  v_result jsonb;
begin
  if not public.can_view_business(p_business_id) then
    raise exception 'analytics_read_forbidden' using errcode = '42501';
  end if;

  if p_start_date is null
     or p_end_date is null
     or p_end_date < p_start_date
     or p_end_date - p_start_date > 365 then
    raise exception 'invalid_analytics_period' using errcode = '22023';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = p_business_id
    and business.status <> 'archived';

  if not found then
    raise exception 'analytics_business_not_found' using errcode = '23503';
  end if;

  with
  period_bookings as (
    select
      booking.*,
      (booking.starts_at at time zone v_business.timezone)::date as local_date
    from public.bookings booking
    where booking.business_id = p_business_id
      and (booking.starts_at at time zone v_business.timezone)::date
        between p_start_date and p_end_date
      and booking.status <> 'draft'
  ),
  active_bookings as (
    select *
    from period_bookings
    where status <> 'cancelled'
  ),
  period_transactions as (
    select
      payment_tx.*,
      (payment_tx.occurred_at at time zone v_business.timezone)::date as local_date
    from public.payment_transactions payment_tx
    where payment_tx.business_id = p_business_id
      and payment_tx.currency = v_business.default_currency
      and (payment_tx.occurred_at at time zone v_business.timezone)::date
        between p_start_date and p_end_date
  ),
  days as (
    select day_value::date as local_date
    from generate_series(p_start_date, p_end_date, interval '1 day') day_value
  ),
  daily_bookings as (
    select
      local_date,
      count(*) filter (where status <> 'cancelled')::integer as bookings_count,
      count(*) filter (where status = 'cancelled')::integer as cancelled_count,
      coalesce(sum(total_minor) filter (
        where status <> 'cancelled'
          and currency = v_business.default_currency
      ), 0)::bigint as booked_minor
    from period_bookings
    group by local_date
  ),
  daily_payments as (
    select
      local_date,
      coalesce(sum(
        case when kind = 'payment' then amount_minor else -amount_minor end
      ), 0)::bigint as collected_minor
    from period_transactions
    group by local_date
  ),
  summary as (
    select jsonb_build_object(
      'bookings_count', (select count(*) from active_bookings),
      'cancelled_count', (select count(*) from period_bookings where status = 'cancelled'),
      'completed_count', (select count(*) from active_bookings where status = 'completed'),
      'upcoming_count', (
        select count(*)
        from active_bookings
        where starts_at >= now()
          and status in ('hold', 'pending', 'confirmed')
      ),
      'unique_clients', (select count(distinct client_id) from active_bookings),
      'new_clients', (
        select count(*)
        from public.clients client
        where client.business_id = p_business_id
          and (client.created_at at time zone v_business.timezone)::date
            between p_start_date and p_end_date
      ),
      'booked_hours', (
        select round(coalesce(sum(extract(epoch from (ends_at - starts_at))) / 3600, 0)::numeric, 1)
        from active_bookings
      ),
      'booked_value_minor', (
        select coalesce(sum(total_minor), 0)::bigint
        from active_bookings
        where currency = v_business.default_currency
      ),
      'collected_minor', (
        select coalesce(sum(
          case when kind = 'payment' then amount_minor else -amount_minor end
        ), 0)::bigint
        from period_transactions
      ),
      'outstanding_minor', (
        select coalesce(sum(
          greatest(0, total_minor - greatest(0, paid_minor - refunded_minor))
        ), 0)::bigint
        from active_bookings
        where currency = v_business.default_currency
      ),
      'foreign_currency_booking_count', (
        select count(*)
        from active_bookings
        where total_minor > 0
          and currency <> v_business.default_currency
      )
    ) as value
  ),
  daily as (
    select jsonb_agg(
      jsonb_build_object(
        'date', days.local_date,
        'bookings_count', coalesce(daily_bookings.bookings_count, 0),
        'cancelled_count', coalesce(daily_bookings.cancelled_count, 0),
        'booked_minor', coalesce(daily_bookings.booked_minor, 0),
        'collected_minor', coalesce(daily_payments.collected_minor, 0)
      )
      order by days.local_date
    ) as value
    from days
    left join daily_bookings using (local_date)
    left join daily_payments using (local_date)
  ),
  service_rows as (
    select
      service.id,
      service.title,
      count(*)::integer as bookings_count,
      coalesce(sum(booking.total_minor) filter (
        where booking.currency = v_business.default_currency
      ), 0)::bigint as booked_minor
    from active_bookings booking
    join public.services service
      on service.id = booking.service_id
     and service.business_id = booking.business_id
    group by service.id, service.title
    order by bookings_count desc, booked_minor desc, service.title
    limit 8
  ),
  services as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'service_id', service_rows.id,
          'title', service_rows.title,
          'bookings_count', service_rows.bookings_count,
          'booked_minor', service_rows.booked_minor
        )
        order by service_rows.bookings_count desc, service_rows.booked_minor desc, service_rows.title
      ),
      '[]'::jsonb
    ) as value
    from service_rows
  ),
  status_rows as (
    select status, count(*)::integer as bookings_count
    from period_bookings
    group by status
  ),
  statuses as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'status', status_rows.status,
          'bookings_count', status_rows.bookings_count
        )
        order by status_rows.status
      ),
      '[]'::jsonb
    ) as value
    from status_rows
  ),
  source_rows as (
    select source, count(*)::integer as bookings_count
    from active_bookings
    group by source
  ),
  sources as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'source', source_rows.source,
          'bookings_count', source_rows.bookings_count
        )
        order by source_rows.bookings_count desc, source_rows.source
      ),
      '[]'::jsonb
    ) as value
    from source_rows
  )
  select jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date,
      'timezone', v_business.timezone,
      'currency', v_business.default_currency
    ),
    'summary', summary.value,
    'daily', daily.value,
    'services', services.value,
    'statuses', statuses.value,
    'sources', sources.value
  )
  into v_result
  from summary, daily, services, statuses, sources;

  return v_result;
end;
$$;

revoke all on function public.get_admin_analytics(uuid, date, date)
  from public, anon, authenticated;
grant execute on function public.get_admin_analytics(uuid, date, date)
  to authenticated, service_role;

create or replace function public.seed_business_modules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_modules (business_id, module_key, enabled, version, config)
  values
    (new.id, 'core', true, '1.1.0', '{}'::jsonb),
    (new.id, 'media', true, '1.0.0', '{}'::jsonb),
    (new.id, 'portfolio', true, '1.0.0', '{}'::jsonb),
    (new.id, 'catalog', true, '1.0.0', '{}'::jsonb),
    (
      new.id,
      'scheduling',
      true,
      '1.3.0',
      jsonb_build_object(
        'booking_core', true,
        'public_booking_ui', true,
        'booking_calendar', true
      )
    ),
    (
      new.id,
      'crm',
      true,
      '1.1.0',
      jsonb_build_object(
        'booking_clients', true,
        'clients_crm', true,
        'client_merge', true,
        'client_archive', true
      )
    ),
    (
      new.id,
      'payments',
      true,
      '1.0.0',
      jsonb_build_object(
        'provider_neutral_ledger', true,
        'manual_payments', true,
        'manual_refunds', true,
        'immutable_transactions', true
      )
    ),
    (
      new.id,
      'notifications',
      true,
      '1.1.0',
      jsonb_build_object(
        'provider_neutral_queue', true,
        'language_aware_templates', true,
        'booking_reminders', true,
        'delivery_attempts', true,
        'resend_adapter', true,
        'idempotent_provider_requests', true,
        'processing_recovery', true
      )
    ),
    (
      new.id,
      'analytics',
      true,
      '1.0.0',
      jsonb_build_object(
        'booking_metrics', true,
        'client_metrics', true,
        'payment_metrics', true,
        'daily_series', true,
        'tenant_safe', true
      )
    )
  on conflict (business_id, module_key) do update set
    enabled = excluded.enabled,
    version = excluded.version,
    config = excluded.config,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.seed_business_modules()
  from public, anon, authenticated;

update public.business_modules
set enabled = true,
    version = '1.0.0',
    config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'booking_metrics', true,
        'client_metrics', true,
        'payment_metrics', true,
        'daily_series', true,
        'tenant_safe', true
      ),
    updated_at = now()
where module_key = 'analytics';

comment on function public.get_admin_analytics(uuid, date, date) is
  'Returns tenant-safe operational booking, client and payment analytics for a workspace-local date range of at most 366 days.';
