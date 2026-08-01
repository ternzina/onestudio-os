-- OneStudio OS Public Booking Management 1.0
-- Secure self-service booking details, calendar export, rescheduling and cancellation.
-- Payment collection remains outside this layer.

create table if not exists public.booking_management_links (
  booking_id uuid primary key,
  business_id uuid not null,
  token uuid not null default gen_random_uuid() unique,
  manage_url text not null
    check (
      char_length(manage_url) between 1 and 1000
      and manage_url ~ '^https?://'
    ),
  expires_at timestamptz not null,
  reschedule_count integer not null default 0
    check (reschedule_count between 0 and 20),
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (booking_id, business_id)
    references public.bookings(id, business_id)
    on delete cascade
);

create index if not exists booking_management_links_business_expiry_idx
  on public.booking_management_links (business_id, expires_at);

drop trigger if exists booking_management_links_touch
  on public.booking_management_links;
create trigger booking_management_links_touch
before update on public.booking_management_links
for each row execute function public.set_updated_at();

alter table public.booking_management_links enable row level security;

revoke all on table public.booking_management_links
  from public, anon, authenticated;
grant select, insert, update, delete on table public.booking_management_links
  to service_role;

create or replace function public.is_public_booking_management_service()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role';
$$;

revoke all on function public.is_public_booking_management_service()
  from public, anon, authenticated;
grant execute on function public.is_public_booking_management_service()
  to service_role;

create or replace function public.append_booking_management_link_to_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_manage_url text;
  v_suffix text;
begin
  if new.booking_id is null
     or new.event_type not in (
       'booking_pending',
       'booking_confirmed',
       'booking_cancelled',
       'booking_reminder'
     ) then
    return new;
  end if;

  select link.manage_url
  into v_manage_url
  from public.booking_management_links link
  where link.booking_id = new.booking_id
    and link.business_id = new.business_id
    and link.expires_at > now();

  if v_manage_url is null then
    return new;
  end if;

  new.payload := coalesce(new.payload, '{}'::jsonb)
    || jsonb_build_object('booking_manage_url', v_manage_url);

  if position(v_manage_url in coalesce(new.body, '')) = 0 then
    v_suffix := case
      when lower(coalesce(new.locale, '')) like 'ru%'
        then E'\n\nУправлять бронированием: ' || v_manage_url
      else E'\n\nManage your booking: ' || v_manage_url
    end;

    if char_length(coalesce(new.body, '')) + char_length(v_suffix) <= 20000 then
      new.body := coalesce(new.body, '') || v_suffix;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.append_booking_management_link_to_notification()
  from public, anon, authenticated;

drop trigger if exists notification_jobs_append_booking_management_link
  on public.notification_jobs;
create trigger notification_jobs_append_booking_management_link
before insert on public.notification_jobs
for each row execute function public.append_booking_management_link_to_notification();

create or replace function public.ensure_public_booking_management_link(
  p_booking_id uuid,
  p_request_key uuid,
  p_base_url text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_link public.booking_management_links%rowtype;
  v_expires_at timestamptz;
  v_base_url text;
  v_manage_url text;
  v_management_token uuid;
begin
  if not public.is_public_booking_management_service() then
    raise exception 'booking_management_forbidden' using errcode = '42501';
  end if;

  if p_booking_id is null or p_request_key is null then
    raise exception 'invalid_booking_management_token' using errcode = '22023';
  end if;

  v_base_url := regexp_replace(trim(coalesce(p_base_url, '')), '/+$', '');
  if char_length(v_base_url) not between 1 and 500
     or v_base_url !~ '^https?://' then
    raise exception 'invalid_booking_management_url' using errcode = '22023';
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
    and booking.source = 'public'
    and booking.public_request_key = p_request_key
  for update;

  if not found then
    raise exception 'booking_management_booking_not_found' using errcode = 'P0002';
  end if;

  v_expires_at := greatest(
    v_booking.ends_at + interval '30 days',
    now() + interval '7 days'
  );

  select link.*
  into v_link
  from public.booking_management_links link
  where link.booking_id = v_booking.id
  for update;

  if not found then
    v_management_token := gen_random_uuid();

    insert into public.booking_management_links (
      booking_id,
      business_id,
      token,
      manage_url,
      expires_at
    ) values (
      v_booking.id,
      v_booking.business_id,
      v_management_token,
      v_base_url || '/book/manage/' || v_management_token::text,
      v_expires_at
    )
    returning * into v_link;
  else
    v_manage_url := v_base_url || '/book/manage/' || v_link.token::text;
    update public.booking_management_links
    set manage_url = v_manage_url,
        expires_at = greatest(expires_at, v_expires_at),
        updated_at = now()
    where booking_id = v_booking.id
    returning * into v_link;
  end if;

  v_manage_url := v_link.manage_url;

  update public.notification_jobs job
  set payload = coalesce(job.payload, '{}'::jsonb)
        || jsonb_build_object('booking_manage_url', v_manage_url),
      body = case
        when position(v_manage_url in coalesce(job.body, '')) > 0
          then job.body
        else
          case
            when lower(coalesce(job.locale, '')) like 'ru%'
              then case
                when char_length(coalesce(job.body, ''))
                     + char_length(E'\n\nУправлять бронированием: ' || v_manage_url) <= 20000
                  then coalesce(job.body, '')
                       || E'\n\nУправлять бронированием: '
                       || v_manage_url
                else job.body
              end
            else case
              when char_length(coalesce(job.body, ''))
                   + char_length(E'\n\nManage your booking: ' || v_manage_url) <= 20000
                then coalesce(job.body, '')
                     || E'\n\nManage your booking: '
                     || v_manage_url
              else job.body
            end
          end
      end,
      updated_at = now()
  where job.booking_id = v_booking.id
    and job.business_id = v_booking.business_id
    and job.event_type in (
      'booking_pending',
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder'
    )
    and job.status in ('scheduled', 'pending', 'failed');

  return jsonb_build_object(
    'booking_id', v_booking.id,
    'token', v_link.token,
    'manage_url', v_manage_url,
    'expires_at', v_link.expires_at
  );
end;
$$;

create or replace function public.get_public_booking_management_context(
  p_token uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_link public.booking_management_links%rowtype;
  v_booking public.bookings%rowtype;
  v_business public.businesses%rowtype;
  v_service public.services%rowtype;
  v_client public.clients%rowtype;
  v_settings public.business_availability_settings%rowtype;
  v_local_today date;
  v_duration integer;
  v_can_reschedule boolean;
  v_can_cancel boolean;
begin
  if not public.is_public_booking_management_service() then
    raise exception 'booking_management_forbidden' using errcode = '42501';
  end if;

  if p_token is null then
    raise exception 'invalid_booking_management_token' using errcode = '22023';
  end if;

  select link.*
  into v_link
  from public.booking_management_links link
  where link.token = p_token
    and link.expires_at > now();

  if not found then
    raise exception 'booking_management_link_not_found' using errcode = 'P0002';
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = v_link.booking_id
    and booking.business_id = v_link.business_id;

  select business.*
  into v_business
  from public.businesses business
  where business.id = v_booking.business_id
    and business.status = 'active';

  select service.*
  into v_service
  from public.services service
  where service.id = v_booking.service_id
    and service.business_id = v_booking.business_id;

  select client.*
  into v_client
  from public.clients client
  where client.id = v_booking.client_id
    and client.business_id = v_booking.business_id;

  select settings.*
  into v_settings
  from public.business_availability_settings settings
  where settings.business_id = v_booking.business_id;

  if v_business.id is null
     or v_service.id is null
     or v_client.id is null
     or v_settings.business_id is null then
    raise exception 'booking_management_context_incomplete' using errcode = 'P0002';
  end if;

  v_local_today := (now() at time zone v_business.timezone)::date;
  v_duration := greatest(
    1,
    extract(epoch from (v_booking.ends_at - v_booking.starts_at))::integer / 60
  );
  v_can_reschedule :=
    v_booking.status in ('hold', 'pending', 'confirmed')
    and v_booking.starts_at > now()
    and v_link.reschedule_count < 5;
  v_can_cancel :=
    v_booking.status in ('hold', 'pending', 'confirmed')
    and v_booking.starts_at > now()
    and coalesce(v_booking.paid_minor, 0) = 0
    and v_booking.payment_status <> 'paid';

  return jsonb_build_object(
    'business', jsonb_build_object(
      'id', v_business.id,
      'slug', v_business.slug,
      'name', v_business.name,
      'timezone', v_business.timezone,
      'default_locale', v_business.default_locale
    ),
    'service', jsonb_build_object(
      'id', v_service.id,
      'slug', v_service.slug,
      'title', v_service.title
    ),
    'client', jsonb_build_object(
      'name', v_client.name,
      'email', v_client.email
    ),
    'booking', jsonb_build_object(
      'id', v_booking.id,
      'reference', v_booking.reference,
      'status', v_booking.status,
      'starts_at', v_booking.starts_at,
      'ends_at', v_booking.ends_at,
      'duration_minutes', v_duration,
      'party_size', v_booking.party_size,
      'total_minor', v_booking.total_minor,
      'currency', v_booking.currency,
      'locale', v_booking.locale,
      'cancellation_reason', v_booking.cancellation_reason
    ),
    'date_bounds', jsonb_build_object(
      'minimum_date', v_local_today,
      'maximum_date', v_local_today + v_settings.booking_horizon_days
    ),
    'actions', jsonb_build_object(
      'can_reschedule', v_can_reschedule,
      'can_cancel', v_can_cancel,
      'reschedules_remaining', greatest(0, 5 - v_link.reschedule_count)
    ),
    'manage_url', v_link.manage_url,
    'expires_at', v_link.expires_at
  );
end;
$$;

create or replace function public.get_public_booking_management_slots(
  p_token uuid,
  p_date date
)
returns table (
  starts_at timestamptz,
  ends_at timestamptz,
  local_start_time time,
  local_end_time time,
  timezone text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_link public.booking_management_links%rowtype;
  v_booking public.bookings%rowtype;
  v_business public.businesses%rowtype;
  v_settings public.business_availability_settings%rowtype;
  v_duration integer;
  v_slot_interval integer;
  v_max_slot_index integer;
  v_local_today date;
begin
  if not public.is_public_booking_management_service() then
    raise exception 'booking_management_forbidden' using errcode = '42501';
  end if;

  select link.*
  into v_link
  from public.booking_management_links link
  where link.token = p_token
    and link.expires_at > now();

  if not found or p_date is null then
    return;
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = v_link.booking_id
    and booking.business_id = v_link.business_id;

  if v_booking.status not in ('hold', 'pending', 'confirmed')
     or v_booking.starts_at <= now()
     or v_link.reschedule_count >= 5 then
    return;
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = v_booking.business_id
    and business.status = 'active';

  select settings.*
  into v_settings
  from public.business_availability_settings settings
  where settings.business_id = v_booking.business_id;

  if v_business.id is null or v_settings.business_id is null then
    return;
  end if;

  v_local_today := (now() at time zone v_business.timezone)::date;
  if p_date < v_local_today
     or p_date > v_local_today + v_settings.booking_horizon_days then
    return;
  end if;

  v_duration := greatest(
    1,
    extract(epoch from (v_booking.ends_at - v_booking.starts_at))::integer / 60
  );
  v_slot_interval := v_settings.slot_interval_minutes;
  v_max_slot_index := floor(
    (1440 - v_duration)::numeric / v_slot_interval
  )::integer;

  if v_max_slot_index < 0 then
    return;
  end if;

  return query
  with candidates as (
    select
      ((p_date + time '00:00')
        + make_interval(mins => slot_index * v_slot_interval))
        at time zone v_business.timezone as candidate_starts_at
    from generate_series(0, v_max_slot_index) slot_index
  )
  select
    candidate.candidate_starts_at,
    candidate.candidate_starts_at + make_interval(mins => v_duration),
    (candidate.candidate_starts_at at time zone v_business.timezone)::time,
    (
      (candidate.candidate_starts_at + make_interval(mins => v_duration))
      at time zone v_business.timezone
    )::time,
    v_business.timezone
  from candidates candidate
  where candidate.candidate_starts_at <> v_booking.starts_at
    and public.service_slot_is_available(
    v_booking.business_id,
    v_booking.service_id,
    candidate.candidate_starts_at,
    v_duration,
    v_booking.party_size,
    v_booking.id
  )
  order by candidate.candidate_starts_at;
end;
$$;

create or replace function public.reschedule_public_booking(
  p_token uuid,
  p_starts_at timestamptz
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_link public.booking_management_links%rowtype;
  v_booking public.bookings%rowtype;
  v_duration integer;
  v_ends_at timestamptz;
  v_next_count integer;
  v_event_type text;
begin
  if not public.is_public_booking_management_service() then
    raise exception 'booking_management_forbidden' using errcode = '42501';
  end if;

  if p_token is null or p_starts_at is null then
    raise exception 'invalid_booking_management_request' using errcode = '22023';
  end if;

  select link.*
  into v_link
  from public.booking_management_links link
  where link.token = p_token
    and link.expires_at > now()
  for update;

  if not found then
    raise exception 'booking_management_link_not_found' using errcode = 'P0002';
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = v_link.booking_id
    and booking.business_id = v_link.business_id
  for update;

  if v_booking.status not in ('hold', 'pending', 'confirmed')
     or v_booking.starts_at <= now() then
    raise exception 'booking_management_reschedule_not_allowed' using errcode = '55000';
  end if;

  if v_link.reschedule_count >= 5 then
    raise exception 'booking_management_reschedule_limit' using errcode = '55000';
  end if;

  v_duration := greatest(
    1,
    extract(epoch from (v_booking.ends_at - v_booking.starts_at))::integer / 60
  );
  v_ends_at := p_starts_at + make_interval(mins => v_duration);

  perform public.lock_booking_resource_scope(
    v_booking.business_id,
    v_booking.service_id,
    v_booking.id
  );

  if not public.service_slot_is_available(
    v_booking.business_id,
    v_booking.service_id,
    p_starts_at,
    v_duration,
    v_booking.party_size,
    v_booking.id
  ) then
    raise exception 'booking_slot_unavailable' using errcode = 'P0001';
  end if;

  delete from public.booking_allocations allocation
  where allocation.booking_id = v_booking.id
    and allocation.business_id = v_booking.business_id;

  update public.bookings
  set starts_at = p_starts_at,
      ends_at = v_ends_at,
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object(
          'last_public_rescheduled_at', now(),
          'previous_starts_at', v_booking.starts_at
        ),
      updated_at = now()
  where id = v_booking.id
    and business_id = v_booking.business_id;

  perform public.insert_required_booking_allocations(
    v_booking.id,
    v_booking.business_id,
    v_booking.service_id,
    p_starts_at,
    v_ends_at
  );

  update public.booking_management_links
  set reschedule_count = reschedule_count + 1,
      last_used_at = now(),
      updated_at = now()
  where booking_id = v_booking.id
  returning reschedule_count into v_next_count;

  update public.notification_jobs
  set status = 'cancelled',
      cancelled_at = now(),
      updated_at = now()
  where booking_id = v_booking.id
    and event_type = 'booking_reminder'
    and status in ('scheduled', 'pending', 'failed');

  v_event_type := case
    when v_booking.status in ('hold', 'pending') then 'booking_pending'
    else 'booking_confirmed'
  end;

  perform public.create_notification_job(
    v_booking.id,
    v_event_type,
    now(),
    concat(
      'booking:',
      v_booking.id::text,
      ':public-rescheduled:',
      v_next_count::text
    ),
    jsonb_build_object(
      'change_type', 'rescheduled',
      'previous_starts_at', v_booking.starts_at
    ),
    null
  );

  return public.get_public_booking_management_context(p_token);
exception
  when exclusion_violation then
    raise exception 'booking_slot_conflict' using errcode = '23P01';
end;
$$;

create or replace function public.cancel_public_booking(
  p_token uuid,
  p_reason text default ''
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_link public.booking_management_links%rowtype;
  v_booking public.bookings%rowtype;
begin
  if not public.is_public_booking_management_service() then
    raise exception 'booking_management_forbidden' using errcode = '42501';
  end if;

  if p_token is null then
    raise exception 'invalid_booking_management_token' using errcode = '22023';
  end if;

  select link.*
  into v_link
  from public.booking_management_links link
  where link.token = p_token
    and link.expires_at > now()
  for update;

  if not found then
    raise exception 'booking_management_link_not_found' using errcode = 'P0002';
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = v_link.booking_id
    and booking.business_id = v_link.business_id
  for update;

  if v_booking.status not in ('hold', 'pending', 'confirmed')
     or v_booking.starts_at <= now()
     or coalesce(v_booking.paid_minor, 0) > 0
     or v_booking.payment_status = 'paid' then
    raise exception 'booking_management_cancel_not_allowed' using errcode = '55000';
  end if;

  update public.bookings
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = null,
      cancellation_reason = left(
        coalesce(nullif(trim(coalesce(p_reason, '')), ''), ''),
        1000
      ),
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object(
          'cancelled_from', 'public_booking_management'
        ),
      updated_at = now()
  where id = v_booking.id
    and business_id = v_booking.business_id;

  update public.booking_management_links
  set last_used_at = now(),
      updated_at = now()
  where booking_id = v_booking.id;

  return public.get_public_booking_management_context(p_token);
end;
$$;

revoke all on function public.ensure_public_booking_management_link(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.get_public_booking_management_context(uuid)
  from public, anon, authenticated;
revoke all on function public.get_public_booking_management_slots(uuid, date)
  from public, anon, authenticated;
revoke all on function public.reschedule_public_booking(uuid, timestamptz)
  from public, anon, authenticated;
revoke all on function public.cancel_public_booking(uuid, text)
  from public, anon, authenticated;

grant execute on function public.ensure_public_booking_management_link(uuid, uuid, text)
  to service_role;
grant execute on function public.get_public_booking_management_context(uuid)
  to service_role;
grant execute on function public.get_public_booking_management_slots(uuid, date)
  to service_role;
grant execute on function public.reschedule_public_booking(uuid, timestamptz)
  to service_role;
grant execute on function public.cancel_public_booking(uuid, text)
  to service_role;

create or replace function public.apply_public_booking_calendar_module_capabilities()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.module_key = 'scheduling' then
    new.config := coalesce(new.config, '{}'::jsonb)
      || jsonb_build_object(
        'public_booking_calendar_availability', true,
        'public_booking_calendar_privacy_safe', true,
        'public_booking_management', true,
        'public_booking_calendar_export', true,
        'public_booking_reschedule', true,
        'public_booking_cancel', true
      );
  end if;

  return new;
end;
$$;

revoke all on function public.apply_public_booking_calendar_module_capabilities()
  from public, anon, authenticated;

update public.business_modules
set config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'public_booking_management', true,
        'public_booking_calendar_export', true,
        'public_booking_reschedule', true,
        'public_booking_cancel', true
      ),
    updated_at = now()
where module_key = 'scheduling';

comment on table public.booking_management_links is
  'Opaque, service-only links for customer self-service booking details, calendar export, rescheduling and cancellation.';
comment on function public.ensure_public_booking_management_link(uuid, uuid, text) is
  'Idempotently issues one opaque self-service token for a public booking request and enriches queued booking emails.';
comment on function public.get_public_booking_management_context(uuid) is
  'Returns the minimum booking details required by the protected public management page.';
comment on function public.get_public_booking_management_slots(uuid, date) is
  'Returns conflict-safe replacement slots for one token-authorized booking without exposing schedule internals.';
comment on function public.reschedule_public_booking(uuid, timestamptz) is
  'Moves one token-authorized unpaid future booking, reallocates resources and queues an updated confirmation.';
comment on function public.cancel_public_booking(uuid, text) is
  'Cancels one token-authorized unpaid future booking and releases its allocations.';
