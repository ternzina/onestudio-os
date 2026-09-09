-- OneStudio OS Site Analytics Funnel 1.3
-- Anonymous conversion funnel linked to canonical bookings.

alter table public.site_analytics_events
  add column if not exists booking_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'site_analytics_events_booking_id_fkey'
      and conrelid =
        'public.site_analytics_events'::regclass
  ) then
    alter table public.site_analytics_events
      add constraint
        site_analytics_events_booking_id_fkey
      foreign key (booking_id)
      references public.bookings(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists
  site_analytics_events_business_booking_time_idx
on public.site_analytics_events (
  business_id,
  booking_id,
  occurred_at desc
)
where booking_id is not null;

comment on column
  public.site_analytics_events.booking_id
is
  'Optional tenant-validated canonical booking linked to a public conversion event.';

create or replace function
  public.get_admin_site_funnel_analytics(
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

  v_period_days integer;
  v_previous_start date;
  v_previous_end date;

  v_result jsonb;
begin
  if not public.can_view_business(
    p_business_id
  ) then
    raise exception
      'analytics_read_forbidden'
      using errcode = '42501';
  end if;

  if
    p_start_date is null
    or p_end_date is null
    or p_end_date < p_start_date
    or p_end_date - p_start_date > 365
  then
    raise exception
      'invalid_analytics_period'
      using errcode = '22023';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = p_business_id
    and business.status <> 'archived';

  if not found then
    raise exception
      'analytics_business_not_found'
      using errcode = '23503';
  end if;

  v_period_days :=
    p_end_date - p_start_date + 1;

  v_previous_end :=
    p_start_date - 1;

  v_previous_start :=
    v_previous_end
    - (v_period_days - 1);

  with
  bounds as (
    select
      'current'::text as period_key,
      p_start_date as start_date,
      p_end_date as end_date

    union all

    select
      'previous'::text,
      v_previous_start,
      v_previous_end
  ),

  analytics_events as (
    select
      event.*,

      (
        event.occurred_at
        at time zone v_business.timezone
      )::date as local_date

    from public.site_analytics_events event

    where
      event.business_id =
        p_business_id

      and event.is_technical_host =
        false

      and lower(
        coalesce(
          event.utm_source,
          ''
        )
      ) <> 'onestudio_test'

      and (
        event.occurred_at
        at time zone v_business.timezone
      )::date
        between
          v_previous_start
          and p_end_date
  ),

  stage_rows as (
    select
      bounds.period_key,

      (
        count(
          distinct event.session_id
        ) filter (
          where
            event.event_name =
              'page_view'
        )
      )::bigint
        as visits,

      (
        count(
          distinct event.session_id
        ) filter (
          where
            event.event_name =
              'cta_click'
        )
      )::bigint
        as cta_clicks,

      (
        count(
          distinct event.session_id
        ) filter (
          where
            event.event_name =
              'booking_started'
        )
      )::bigint
        as booking_started,

      (
        count(
          distinct event.session_id
        ) filter (
          where
            event.event_name =
              'form_submit'
        )
      )::bigint
        as form_submit,

      (
        count(
          distinct event.session_id
        ) filter (
          where
            event.event_name =
              'booking_completed'

            and event.booking_id
              is not null
        )
      )::bigint
        as booking_completed,

      (
        count(
          distinct event.session_id
        ) filter (
          where
            event.event_name =
              'booking_completed'

            and event.booking_id
              is not null

            and booking.payment_status =
              'paid'
        )
      )::bigint
        as paid

    from bounds

    left join analytics_events event
      on event.local_date
        between
          bounds.start_date
          and bounds.end_date

    left join public.bookings booking
      on booking.id =
        event.booking_id

      and booking.business_id =
        p_business_id

    group by
      bounds.period_key
  ),

  current_row as (
    select jsonb_build_object(
      'visits',
        coalesce(visits, 0),

      'cta_clicks',
        coalesce(cta_clicks, 0),

      'booking_started',
        coalesce(booking_started, 0),

      'form_submit',
        coalesce(form_submit, 0),

      'booking_completed',
        coalesce(booking_completed, 0),

      'paid',
        coalesce(paid, 0)
    ) as value

    from stage_rows

    where period_key =
      'current'
  ),

  previous_row as (
    select jsonb_build_object(
      'visits',
        coalesce(visits, 0),

      'cta_clicks',
        coalesce(cta_clicks, 0),

      'booking_started',
        coalesce(booking_started, 0),

      'form_submit',
        coalesce(form_submit, 0),

      'booking_completed',
        coalesce(booking_completed, 0),

      'paid',
        coalesce(paid, 0)
    ) as value

    from stage_rows

    where period_key =
      'previous'
  )

  select jsonb_build_object(
    'period',
      jsonb_build_object(
        'start_date',
          p_start_date,

        'end_date',
          p_end_date,

        'timezone',
          v_business.timezone
      ),

    'previous_period',
      jsonb_build_object(
        'start_date',
          v_previous_start,

        'end_date',
          v_previous_end,

        'timezone',
          v_business.timezone
      ),

    'current',
      current_row.value,

    'previous',
      previous_row.value
  )
  into v_result

  from
    current_row
    cross join previous_row;

  return v_result;
end;
$$;

revoke all
on function
  public.get_admin_site_funnel_analytics(
    uuid,
    date,
    date
  )
from
  public,
  anon,
  authenticated;

grant execute
on function
  public.get_admin_site_funnel_analytics(
    uuid,
    date,
    date
  )
to authenticated;

comment on function
  public.get_admin_site_funnel_analytics(
    uuid,
    date,
    date
  )
is
  'Returns tenant-authorized anonymous conversion funnel with an equal previous period. Paid conversions use canonical booking payment status.';
