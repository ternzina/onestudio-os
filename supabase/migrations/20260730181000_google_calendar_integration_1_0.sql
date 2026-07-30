-- OneStudio OS Google Calendar Integration 1.0
-- Stores encrypted OAuth tokens server-side, maps OneStudio bookings to Google
-- events and imports external busy windows as ordinary resource exceptions.

create table public.google_calendar_integrations (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  resource_id uuid,
  calendar_id text not null default 'primary',
  access_token_ciphertext text not null,
  refresh_token_ciphertext text not null,
  token_expires_at timestamptz,
  granted_scope text not null default '',
  status text not null default 'connected'
    check (status in ('connected', 'error')),
  last_import_at timestamptz,
  last_export_at timestamptz,
  last_error text,
  connected_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (resource_id, business_id)
    references public.resources(id, business_id) on delete restrict
);

create table public.google_calendar_booking_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid not null,
  external_event_id text not null,
  external_etag text,
  synced_at timestamptz not null default now(),
  foreign key (booking_id, business_id)
    references public.bookings(id, business_id) on delete cascade,
  unique (business_id, booking_id),
  unique (business_id, external_event_id)
);

create table public.google_calendar_busy_windows (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  external_event_id text not null,
  exception_id uuid not null references public.availability_exceptions(id) on delete cascade,
  event_updated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, external_event_id),
  unique (exception_id)
);

create index google_calendar_booking_links_business_booking_idx
  on public.google_calendar_booking_links (business_id, booking_id);
create index google_calendar_busy_windows_business_idx
  on public.google_calendar_busy_windows (business_id);

alter table public.google_calendar_integrations enable row level security;
alter table public.google_calendar_booking_links enable row level security;
alter table public.google_calendar_busy_windows enable row level security;

revoke all on table public.google_calendar_integrations
  from public, anon, authenticated;
revoke all on table public.google_calendar_booking_links
  from public, anon, authenticated;
revoke all on table public.google_calendar_busy_windows
  from public, anon, authenticated;
grant select, insert, update, delete
  on table public.google_calendar_integrations to service_role;
grant select, insert, update, delete
  on table public.google_calendar_booking_links to service_role;
grant select, insert, update, delete
  on table public.google_calendar_busy_windows to service_role;

create or replace function public.is_google_calendar_service_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() ->> 'role',
    current_setting('request.jwt.claim.role', true),
    ''
  ) = 'service_role';
$$;

create or replace function public.replace_google_calendar_busy_windows(
  p_business_id uuid,
  p_resource_id uuid,
  p_windows jsonb
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_timezone text;
  v_window jsonb;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
  v_exception_id uuid;
  v_external_event_id text;
  v_inserted integer := 0;
begin
  if not public.is_google_calendar_service_role() then
    raise exception 'google_calendar_service_role_required' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_windows, '[]'::jsonb)) <> 'array' then
    raise exception 'google_calendar_windows_must_be_array' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_business_id::text, 0));

  select business.timezone
  into v_business_timezone
  from public.businesses business
  join public.resources resource
    on resource.business_id = business.id
   and resource.id = p_resource_id
   and resource.is_active = true
  where business.id = p_business_id
    and business.status = 'active';

  if v_business_timezone is null then
    raise exception 'google_calendar_resource_not_found' using errcode = '23503';
  end if;

  delete from public.availability_exceptions exception_row
  where exception_row.id in (
    select busy.exception_id
    from public.google_calendar_busy_windows busy
    where busy.business_id = p_business_id
  );

  for v_window in
    select window_element
    from jsonb_array_elements(coalesce(p_windows, '[]'::jsonb))
      as window_items(window_element)
  loop
    exit when v_inserted >= 500;
    if jsonb_typeof(v_window) <> 'object' then
      continue;
    end if;

    v_external_event_id := left(trim(coalesce(v_window->>'event_id', '')), 512);
    if v_external_event_id = '' then
      continue;
    end if;

    begin
      if nullif(trim(coalesce(v_window->>'start_at', '')), '') is not null then
        v_starts_at := (v_window->>'start_at')::timestamptz;
      else
        v_starts_at :=
          (v_window->>'start_date')::date::timestamp
          at time zone v_business_timezone;
      end if;

      if nullif(trim(coalesce(v_window->>'end_at', '')), '') is not null then
        v_ends_at := (v_window->>'end_at')::timestamptz;
      else
        v_ends_at :=
          (v_window->>'end_date')::date::timestamp
          at time zone v_business_timezone;
      end if;
    exception when others then
      continue;
    end;

    if v_starts_at is null or v_ends_at is null or v_starts_at >= v_ends_at then
      continue;
    end if;

    insert into public.availability_exceptions (
      business_id,
      resource_id,
      kind,
      starts_at,
      ends_at,
      reason
    )
    values (
      p_business_id,
      p_resource_id,
      'blocked',
      v_starts_at,
      v_ends_at,
      left(
        'Google Calendar · ' ||
        coalesce(nullif(trim(v_window->>'summary'), ''), 'Занято'),
        500
      )
    )
    returning id into v_exception_id;

    insert into public.google_calendar_busy_windows (
      business_id,
      external_event_id,
      exception_id,
      event_updated_at
    )
    values (
      p_business_id,
      v_external_event_id,
      v_exception_id,
      case
        when coalesce(v_window->>'updated_at', '') ~
          '^[0-9]{4}-[0-9]{2}-[0-9]{2}T'
          then (v_window->>'updated_at')::timestamptz
        else null
      end
    );
    v_inserted := v_inserted + 1;
  end loop;

  return v_inserted;
end;
$$;

revoke all on function public.is_google_calendar_service_role()
  from public, anon, authenticated;
revoke all on function public.replace_google_calendar_busy_windows(
  uuid,
  uuid,
  jsonb
) from public, anon, authenticated;

grant execute on function public.is_google_calendar_service_role()
  to service_role;
grant execute on function public.replace_google_calendar_busy_windows(
  uuid,
  uuid,
  jsonb
) to service_role;

comment on table public.google_calendar_integrations is
  'Server-only Google Calendar OAuth connections. Token fields contain AES-GCM ciphertext.';
comment on table public.google_calendar_booking_links is
  'Maps canonical OneStudio bookings to Google Calendar events.';
comment on table public.google_calendar_busy_windows is
  'Maps external Google busy events to OneStudio availability exceptions.';
