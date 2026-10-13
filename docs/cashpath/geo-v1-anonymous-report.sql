-- CashPath only: compact 30-day, session-level source and request-funnel view.
-- This is read-only and intentionally does not join to LeadsGate or lead records.
-- Session IDs are random first-party analytics IDs; referrer is hostname only.
with cashpath_events as (
  select
    e.session_id,
    e.event_name,
    e.path,
    e.country_code,
    nullif(e.referrer_host, '') as referrer_host,
    nullif(e.utm_source, '') as utm_source,
    nullif(e.utm_medium, '') as utm_medium,
    nullif(e.utm_campaign, '') as utm_campaign,
    e.occurred_at
  from public.site_analytics_events e
  join public.businesses b on b.id = e.business_id
  where b.slug = 'cashpath'
    and e.occurred_at >= now() - interval '30 days'
),
per_session as (
  select
    session_id,
    (array_agg(path order by occurred_at)
      filter (where event_name = 'page_view'))[1] as entry_page,
    coalesce(max(country_code), 'unknown') as country,
    coalesce(max(referrer_host), max(utm_source), 'unknown') as referrer_or_source,
    coalesce(max(utm_source), 'unknown') as utm_source,
    coalesce(max(utm_medium), 'unknown') as utm_medium,
    coalesce(max(utm_campaign), 'unknown') as utm_campaign,
    count(*) filter (where event_name = 'cta_click') as request_cta_clicks,
    count(*) filter (where event_name = 'leadsgate_form_ready') as leadsgate_form_ready
  from cashpath_events
  group by session_id
)
select
  coalesce(entry_page, 'unknown') as entry_page,
  country,
  referrer_or_source,
  utm_source,
  utm_medium,
  utm_campaign,
  count(*) as anonymous_sessions,
  sum(request_cta_clicks) as request_cta_clicks,
  sum(leadsgate_form_ready) as leadsgate_form_ready
from per_session
group by entry_page, country, referrer_or_source, utm_source, utm_medium, utm_campaign
order by anonymous_sessions desc, entry_page;
