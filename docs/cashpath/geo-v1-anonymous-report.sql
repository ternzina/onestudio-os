-- CashPath-only first-touch acquisition report (read-only).
-- Identifies received signals, not a customer's true origin if referrer is hidden.
-- No loan data, PII, click tokens or provider lead/payout joins.
WITH cashpath_events AS (
  SELECT
    e.session_id, e.event_name, e.path, e.country_code,
    NULLIF(e.traffic_source, '') AS traffic_source,
    NULLIF(e.traffic_channel, '') AS traffic_channel,
    NULLIF(e.attribution_evidence, '') AS attribution_evidence,
    NULLIF(e.click_marker_type, '') AS click_marker_type,
    NULLIF(e.landing_path, '') AS landing_path,
    NULLIF(e.referrer_host, '') AS referrer_host,
    NULLIF(e.utm_source, '') AS utm_source,
    NULLIF(e.utm_medium, '') AS utm_medium,
    NULLIF(e.utm_campaign, '') AS utm_campaign,
    e.occurred_at
  FROM public.site_analytics_events e
  JOIN public.businesses b ON b.id = e.business_id
  WHERE b.slug = 'cashpath-909c00c9'
    AND e.is_technical_host = false
    AND lower(coalesce(e.utm_source, '')) <> 'onestudio_test'
    AND e.occurred_at >= now() - interval '30 days'
), per_session AS (
  SELECT
    session_id,
    COALESCE(
      (array_agg(landing_path ORDER BY occurred_at) FILTER (WHERE landing_path IS NOT NULL))[1],
      (array_agg(path ORDER BY occurred_at) FILTER (WHERE event_name = 'page_view'))[1],
      'unknown'
    ) AS entry_page,
    COALESCE(MAX(country_code), 'unknown') AS country,
    COALESCE(
      MAX(traffic_source),
      MAX(utm_source),
      MAX(referrer_host),
      'unknown'
    ) AS source,
    COALESCE(
      MAX(traffic_channel),
      MAX(utm_medium),
      CASE WHEN MAX(referrer_host) IS NOT NULL THEN 'referral' END,
      'unknown'
    ) AS channel,
    COALESCE(
      MAX(attribution_evidence),
      CASE WHEN MAX(utm_source) IS NOT NULL OR MAX(utm_medium) IS NOT NULL THEN 'utm' END,
      CASE WHEN MAX(referrer_host) IS NOT NULL THEN 'referrer' END,
      'none'
    ) AS source_evidence,
    COALESCE(MAX(click_marker_type), 'none') AS click_marker_type,
    COALESCE(MAX(utm_campaign), 'none') AS utm_campaign,
    COUNT(*) FILTER (WHERE event_name = 'cta_click') AS request_cta_clicks,
    COUNT(*) FILTER (WHERE event_name = 'leadsgate_form_ready') AS leadsgate_form_ready
  FROM cashpath_events
  GROUP BY session_id
)
SELECT
  entry_page,
  country,
  source,
  channel,
  source_evidence,
  click_marker_type,
  utm_campaign,
  COUNT(*) AS anonymous_sessions,
  SUM(request_cta_clicks) AS request_cta_clicks,
  SUM(leadsgate_form_ready) AS leadsgate_form_ready
FROM per_session
GROUP BY entry_page, country, source, channel, source_evidence, click_marker_type, utm_campaign
ORDER BY anonymous_sessions DESC, entry_page;
