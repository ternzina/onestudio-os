-- Record the anonymous point at which the LeadsGate form has rendered.
-- The browser sends no form values, identifiers, or provider payloads.
alter table public.site_analytics_events
  drop constraint if exists site_analytics_events_event_name_check;

alter table public.site_analytics_events
  add constraint site_analytics_events_event_name_check
  check (
    event_name in (
      'page_view',
      'cta_click',
      'form_submit',
      'leadsgate_form_ready',
      'booking_started',
      'booking_completed',
      'booking_cancelled',
      'payment_started',
      'payment_succeeded'
    )
  );
