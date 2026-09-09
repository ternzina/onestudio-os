-- OneStudio OS Site Analytics 1.1
-- Privacy-first first-party website analytics.
-- Raw events contain no name, email, phone number or raw IP address.

create table if not exists public.site_analytics_events (
  id bigint generated always as identity primary key,
  business_id uuid not null
    references public.businesses(id)
    on delete cascade,

  event_name text not null,
  session_id text not null,
  path text not null,

  host text,
  referrer_host text,

  utm_source text,
  utm_medium text,
  utm_campaign text,

  device_class text not null default 'unknown',
  locale text,

  country_code text,
  region text,
  city text,

  is_technical_host boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,

  occurred_at timestamptz not null default now(),

  constraint site_analytics_events_event_name_check
    check (
      event_name in (
        'page_view',
        'cta_click',
        'form_submit',
        'booking_started',
        'booking_completed',
        'booking_cancelled',
        'payment_started',
        'payment_succeeded'
      )
    ),

  constraint site_analytics_events_session_id_check
    check (char_length(session_id) between 8 and 96),

  constraint site_analytics_events_path_check
    check (char_length(path) between 1 and 512),

  constraint site_analytics_events_device_check
    check (device_class in ('desktop', 'tablet', 'mobile', 'unknown')),

  constraint site_analytics_events_metadata_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists site_analytics_events_business_time_idx
  on public.site_analytics_events (business_id, occurred_at desc);

create index if not exists site_analytics_events_business_event_time_idx
  on public.site_analytics_events (
    business_id,
    event_name,
    occurred_at desc
  );

create index if not exists site_analytics_events_business_session_time_idx
  on public.site_analytics_events (
    business_id,
    session_id,
    occurred_at desc
  );

alter table public.site_analytics_events enable row level security;

revoke all on table public.site_analytics_events
  from public, anon, authenticated;

grant select, insert, delete
  on table public.site_analytics_events
  to service_role;

grant usage, select
  on sequence public.site_analytics_events_id_seq
  to service_role;

comment on table public.site_analytics_events is
  'Privacy-first first-party site analytics. No raw IP, client name, email or phone is stored.';
