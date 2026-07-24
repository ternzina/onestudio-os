-- OneStudio OS Booking Calendar 1.0
-- Adds a read-only, workspace-scoped calendar projection for authenticated members.

create or replace function public.get_admin_booking_calendar(
  p_start_date date,
  p_days integer default 7,
  p_resource_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_business public.businesses%rowtype;
  v_start_at timestamptz;
  v_end_at timestamptz;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'booking_calendar_authentication_required' using errcode = '42501';
  end if;

  if p_start_date is null then
    raise exception 'booking_calendar_start_date_required' using errcode = '22023';
  end if;

  if p_days is null or p_days < 1 or p_days > 14 then
    raise exception 'booking_calendar_days_out_of_range' using errcode = '22023';
  end if;

  v_business_id := public.current_business_id();

  if v_business_id is null or not public.can_view_business(v_business_id) then
    raise exception 'booking_calendar_workspace_forbidden' using errcode = '42501';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = v_business_id
    and business.status = 'active';

  if not found then
    raise exception 'booking_calendar_workspace_unavailable' using errcode = '42501';
  end if;

  if p_resource_id is not null and not exists (
    select 1
    from public.resources resource
    where resource.id = p_resource_id
      and resource.business_id = v_business_id
      and resource.is_active = true
      and resource.is_bookable = true
  ) then
    raise exception 'booking_calendar_resource_forbidden' using errcode = '42501';
  end if;

  v_start_at := p_start_date::timestamp at time zone v_business.timezone;
  v_end_at := (p_start_date + p_days)::timestamp at time zone v_business.timezone;

  with
  calendar_dates as (
    select generated_date::date as local_date
    from generate_series(
      p_start_date::timestamp,
      (p_start_date + p_days - 1)::timestamp,
      interval '1 day'
    ) generated_date
  ),
  resource_scope as (
    select
      resource.id,
      resource.name,
      resource.kind,
      coalesce(nullif(resource.timezone, ''), v_business.timezone) as timezone,
      resource.sort_order
    from public.resources resource
    where resource.business_id = v_business_id
      and resource.is_active = true
      and resource.is_bookable = true
      and (p_resource_id is null or resource.id = p_resource_id)
  ),
  resource_dates as (
    select
      resource.*,
      generated_date::date as resource_local_date
    from resource_scope resource
    cross join generate_series(
      (p_start_date - 1)::timestamp,
      (p_start_date + p_days)::timestamp,
      interval '1 day'
    ) generated_date
  ),
  weekly_instances as (
    select
      resource.id as resource_id,
      resource.name as resource_name,
      (
        resource.resource_local_date + rule.start_time
      ) at time zone resource.timezone as starts_at,
      (
        resource.resource_local_date + rule.end_time
      ) at time zone resource.timezone as ends_at
    from resource_dates resource
    join public.availability_rules rule
      on rule.resource_id = resource.id
     and rule.business_id = v_business_id
     and rule.day_of_week = extract(dow from resource.resource_local_date)::smallint
     and rule.is_active = true
     and (rule.effective_from is null or rule.effective_from <= resource.resource_local_date)
     and (rule.effective_until is null or rule.effective_until >= resource.resource_local_date)
  ),
  weekly_windows as (
    select
      instance.resource_id,
      instance.resource_name,
      calendar_date.local_date,
      greatest(
        0,
        floor(
          extract(
            epoch from (
              (greatest(
                instance.starts_at,
                calendar_date.local_date::timestamp at time zone v_business.timezone
              ) at time zone v_business.timezone)
              - calendar_date.local_date::timestamp
            )
          ) / 60
        )::integer
      ) as start_minute,
      least(
        1440,
        ceil(
          extract(
            epoch from (
              (least(
                instance.ends_at,
                (calendar_date.local_date + 1)::timestamp at time zone v_business.timezone
              ) at time zone v_business.timezone)
              - calendar_date.local_date::timestamp
            )
          ) / 60
        )::integer
      ) as end_minute,
      'weekly'::text as source,
      ''::text as reason
    from calendar_dates calendar_date
    join weekly_instances instance
      on tstzrange(instance.starts_at, instance.ends_at, '[)')
         && tstzrange(
              calendar_date.local_date::timestamp at time zone v_business.timezone,
              (calendar_date.local_date + 1)::timestamp at time zone v_business.timezone,
              '[)'
            )
  ),
  exception_windows as (
    select
      resource.id as resource_id,
      resource.name as resource_name,
      calendar_date.local_date,
      greatest(
        0,
        floor(extract(epoch from (
          (greatest(
            exception.starts_at,
            calendar_date.local_date::timestamp at time zone v_business.timezone
          ) at time zone v_business.timezone)
          - calendar_date.local_date::timestamp
        )) / 60)::integer
      ) as start_minute,
      least(
        1440,
        ceil(extract(epoch from (
          (least(
            exception.ends_at,
            (calendar_date.local_date + 1)::timestamp at time zone v_business.timezone
          ) at time zone v_business.timezone)
          - calendar_date.local_date::timestamp
        )) / 60)::integer
      ) as end_minute,
      exception.kind as source,
      exception.reason
    from calendar_dates calendar_date
    join resource_scope resource on true
    join public.availability_exceptions exception
      on exception.resource_id = resource.id
     and exception.business_id = v_business_id
     and tstzrange(exception.starts_at, exception.ends_at, '[)')
         && tstzrange(
              calendar_date.local_date::timestamp at time zone v_business.timezone,
              (calendar_date.local_date + 1)::timestamp at time zone v_business.timezone,
              '[)'
            )
  ),
  booking_scope as (
    select
      booking.*,
      client.name as client_name,
      client.email as client_email,
      client.phone as client_phone,
      service.title as service_title,
      (booking.starts_at at time zone v_business.timezone)::date as local_date,
      (
        extract(hour from booking.starts_at at time zone v_business.timezone)::integer * 60
        + extract(minute from booking.starts_at at time zone v_business.timezone)::integer
      ) as start_minute,
      case
        when (booking.ends_at at time zone v_business.timezone)::date
             > (booking.starts_at at time zone v_business.timezone)::date
          then 1440
        else (
          extract(hour from booking.ends_at at time zone v_business.timezone)::integer * 60
          + extract(minute from booking.ends_at at time zone v_business.timezone)::integer
        )
      end as end_minute
    from public.bookings booking
    join public.clients client
      on client.id = booking.client_id
     and client.business_id = booking.business_id
    join public.services service
      on service.id = booking.service_id
     and service.business_id = booking.business_id
    where booking.business_id = v_business_id
      and booking.starts_at < v_end_at
      and booking.ends_at > v_start_at
      and (
        p_resource_id is null
        or exists (
          select 1
          from public.booking_allocations allocation
          where allocation.booking_id = booking.id
            and allocation.business_id = booking.business_id
            and allocation.resource_id = p_resource_id
        )
      )
  )
  select jsonb_build_object(
    'business', jsonb_build_object(
      'id', v_business.id,
      'name', v_business.name,
      'slug', v_business.slug,
      'timezone', v_business.timezone,
      'default_locale', v_business.default_locale,
      'default_currency', v_business.default_currency
    ),
    'range', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_start_date + p_days - 1,
      'days', p_days
    ),
    'resources', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', resource.id,
          'name', resource.name,
          'kind', resource.kind,
          'timezone', resource.timezone
        )
        order by resource.sort_order, resource.name
      )
      from resource_scope resource
    ), '[]'::jsonb),
    'working_windows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'resource_id', calendar_window.resource_id,
          'resource_name', calendar_window.resource_name,
          'local_date', calendar_window.local_date,
          'start_minute', calendar_window.start_minute,
          'end_minute', calendar_window.end_minute,
          'source', calendar_window.source,
          'reason', calendar_window.reason
        )
        order by calendar_window.local_date, calendar_window.start_minute, calendar_window.resource_name
      )
      from (
        select * from weekly_windows
        union all
        select * from exception_windows where source = 'available'
      ) calendar_window
      where calendar_window.start_minute < calendar_window.end_minute
    ), '[]'::jsonb),
    'blocked_windows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'resource_id', calendar_window.resource_id,
          'resource_name', calendar_window.resource_name,
          'local_date', calendar_window.local_date,
          'start_minute', calendar_window.start_minute,
          'end_minute', calendar_window.end_minute,
          'reason', calendar_window.reason
        )
        order by calendar_window.local_date, calendar_window.start_minute, calendar_window.resource_name
      )
      from exception_windows calendar_window
      where calendar_window.source = 'blocked'
        and calendar_window.start_minute < calendar_window.end_minute
    ), '[]'::jsonb),
    'bookings', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', booking.id,
          'reference', booking.reference,
          'status', booking.status,
          'source', booking.source,
          'starts_at', booking.starts_at,
          'ends_at', booking.ends_at,
          'local_date', booking.local_date,
          'start_minute', booking.start_minute,
          'end_minute', booking.end_minute,
          'timezone', booking.timezone,
          'party_size', booking.party_size,
          'total_minor', booking.total_minor,
          'currency', booking.currency,
          'payment_status', booking.payment_status,
          'client_name', booking.client_name,
          'client_email', booking.client_email,
          'client_phone', booking.client_phone,
          'service_title', booking.service_title,
          'occupies_resource', booking.status in ('hold', 'pending', 'confirmed'),
          'resources', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', allocation.resource_id,
                'name', resource.name,
                'status', allocation.status
              )
              order by resource.sort_order, resource.name
            )
            from public.booking_allocations allocation
            join public.resources resource
              on resource.id = allocation.resource_id
             and resource.business_id = allocation.business_id
            where allocation.booking_id = booking.id
              and allocation.business_id = booking.business_id
          ), '[]'::jsonb)
        )
        order by booking.starts_at, booking.reference
      )
      from booking_scope booking
    ), '[]'::jsonb),
    'summary', jsonb_build_object(
      'total', (select count(*) from booking_scope),
      'occupying', (select count(*) from booking_scope where status in ('hold', 'pending', 'confirmed')),
      'pending', (select count(*) from booking_scope where status = 'pending'),
      'confirmed', (select count(*) from booking_scope where status = 'confirmed'),
      'completed', (select count(*) from booking_scope where status = 'completed'),
      'cancelled', (select count(*) from booking_scope where status = 'cancelled')
    )
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_admin_booking_calendar(date, integer, uuid)
  from public, anon, authenticated;
grant execute on function public.get_admin_booking_calendar(date, integer, uuid)
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
    (new.id, 'crm', true, '1.0.0', jsonb_build_object('booking_clients', true)),
    (new.id, 'payments', false, '0.0.0', '{}'::jsonb),
    (new.id, 'notifications', false, '0.0.0', '{}'::jsonb),
    (new.id, 'analytics', false, '0.0.0', '{}'::jsonb)
  on conflict (business_id, module_key) do update set
    enabled = excluded.enabled,
    version = excluded.version,
    config = excluded.config,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.seed_business_modules() from public, anon, authenticated;

update public.business_modules
set enabled = true,
    version = '1.3.0',
    config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'booking_core', true,
        'public_booking_ui', true,
        'booking_calendar', true
      ),
    updated_at = now()
where module_key = 'scheduling';

comment on function public.get_admin_booking_calendar(date, integer, uuid) is
  'Returns a read-only workspace calendar projection with resources, availability windows, blocked intervals, bookings and summary counts.';
