-- OneStudio OS Site Analytics Dashboard 1.2
-- Tenant-safe aggregated website traffic analytics.

create index if not exists site_analytics_events_real_page_time_idx
  on public.site_analytics_events (
    business_id,
    occurred_at desc
  )
  where event_name = 'page_view'
    and is_technical_host = false;

create or replace function public.get_admin_site_analytics(
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
    raise exception 'analytics_read_forbidden'
      using errcode = '42501';
  end if;

  if p_start_date is null
     or p_end_date is null
     or p_end_date < p_start_date
     or p_end_date - p_start_date > 365 then
    raise exception 'invalid_analytics_period'
      using errcode = '22023';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = p_business_id
    and business.status <> 'archived';

  if not found then
    raise exception 'analytics_business_not_found'
      using errcode = '23503';
  end if;

  with
  real_page_views as (
    select
      event.*,
      (
        event.occurred_at
        at time zone v_business.timezone
      )::date as local_date,

      case
        when nullif(trim(event.utm_source), '') is not null
          then lower(trim(event.utm_source))

        when nullif(trim(event.referrer_host), '') is not null
          then lower(trim(event.referrer_host))

        else 'direct'
      end as traffic_source,

      case
        when nullif(trim(event.utm_medium), '') is not null
          then lower(trim(event.utm_medium))

        when nullif(trim(event.referrer_host), '') is not null
          then 'referral'

        else 'direct'
      end as traffic_medium

    from public.site_analytics_events event
    where event.business_id = p_business_id
      and event.event_name = 'page_view'
      and event.is_technical_host = false
      and lower(coalesce(event.utm_source, ''))
        <> 'onestudio_test'
      and (
        event.occurred_at
        at time zone v_business.timezone
      )::date between p_start_date and p_end_date
  ),

  days as (
    select value::date as local_date
    from generate_series(
      p_start_date,
      p_end_date,
      interval '1 day'
    ) value
  ),

  daily_rows as (
    select
      local_date,
      count(*)::bigint as page_views,
      count(distinct session_id)::bigint as visits
    from real_page_views
    group by local_date
  ),

  daily as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'date', days.local_date,
          'page_views',
            coalesce(daily_rows.page_views, 0),
          'visits',
            coalesce(daily_rows.visits, 0)
        )
        order by days.local_date
      ),
      '[]'::jsonb
    ) as value

    from days
    left join daily_rows using (local_date)
  ),

  summary as (
    select jsonb_build_object(
      'page_views',
        count(*)::bigint,

      'visits',
        count(distinct session_id)::bigint,

      'pages_per_visit',
        case
          when count(distinct session_id) = 0
            then 0
          else round(
            count(*)::numeric
            / count(distinct session_id)::numeric,
            2
          )
        end
    ) as value
    from real_page_views
  ),

  page_rows as (
    select
      path,
      count(*)::bigint as page_views,
      count(distinct session_id)::bigint as visits
    from real_page_views
    group by path
    order by page_views desc, visits desc, path
    limit 10
  ),

  pages as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'path', path,
          'page_views', page_views,
          'visits', visits
        )
        order by page_views desc, visits desc, path
      ),
      '[]'::jsonb
    ) as value
    from page_rows
  ),

  source_rows as (
    select
      traffic_source as source,
      traffic_medium as medium,
      count(*)::bigint as page_views,
      count(distinct session_id)::bigint as visits
    from real_page_views
    group by traffic_source, traffic_medium
    order by visits desc, page_views desc, source
    limit 10
  ),

  sources as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'source', source,
          'medium', medium,
          'page_views', page_views,
          'visits', visits
        )
        order by visits desc, page_views desc, source
      ),
      '[]'::jsonb
    ) as value
    from source_rows
  ),

  device_rows as (
    select
      device_class,
      count(*)::bigint as page_views,
      count(distinct session_id)::bigint as visits
    from real_page_views
    group by device_class
    order by visits desc, page_views desc, device_class
  ),

  devices as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'device_class', device_class,
          'page_views', page_views,
          'visits', visits
        )
        order by visits desc, page_views desc, device_class
      ),
      '[]'::jsonb
    ) as value
    from device_rows
  ),

  country_rows as (
    select
      coalesce(
        nullif(country_code, ''),
        'unknown'
      ) as country_code,

      count(*)::bigint as page_views,
      count(distinct session_id)::bigint as visits

    from real_page_views

    group by coalesce(
      nullif(country_code, ''),
      'unknown'
    )

    order by
      visits desc,
      page_views desc,
      country_code

    limit 10
  ),

  countries as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'country_code', country_code,
          'page_views', page_views,
          'visits', visits
        )
        order by visits desc, page_views desc, country_code
      ),
      '[]'::jsonb
    ) as value
    from country_rows
  ),

  city_rows as (
    select
      coalesce(
        nullif(city, ''),
        'unknown'
      ) as city,

      coalesce(
        nullif(country_code, ''),
        'unknown'
      ) as country_code,

      count(*)::bigint as page_views,
      count(distinct session_id)::bigint as visits

    from real_page_views

    group by
      coalesce(nullif(city, ''), 'unknown'),
      coalesce(nullif(country_code, ''), 'unknown')

    order by
      visits desc,
      page_views desc,
      city

    limit 10
  ),

  cities as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'city', city,
          'country_code', country_code,
          'page_views', page_views,
          'visits', visits
        )
        order by visits desc, page_views desc, city
      ),
      '[]'::jsonb
    ) as value
    from city_rows
  )

  select jsonb_build_object(
    'period',
      jsonb_build_object(
        'start_date', p_start_date,
        'end_date', p_end_date,
        'timezone', v_business.timezone
      ),

    'summary', summary.value,
    'daily', daily.value,
    'pages', pages.value,
    'sources', sources.value,
    'devices', devices.value,
    'countries', countries.value,
    'cities', cities.value
  )
  into v_result

  from
    summary,
    daily,
    pages,
    sources,
    devices,
    countries,
    cities;

  return v_result;
end;
$$;

revoke all
  on function public.get_admin_site_analytics(
    uuid,
    date,
    date
  )
  from public, anon, authenticated;

grant execute
  on function public.get_admin_site_analytics(
    uuid,
    date,
    date
  )
  to authenticated, service_role;

comment on function
  public.get_admin_site_analytics(
    uuid,
    date,
    date
  )
is
  'Returns tenant-safe first-party website traffic analytics excluding technical hosts and OneStudio test traffic.';
