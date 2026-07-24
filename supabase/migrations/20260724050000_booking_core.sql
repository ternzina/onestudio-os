-- OneStudio OS Booking Core 1.0
-- Creates conflict-safe administrative bookings on top of Catalog and Availability Core.
-- Payments, public checkout and notifications remain outside this layer.

alter table public.bookings
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null,
  add column if not exists cancellation_reason text not null default '';

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid not null,
  event_type text not null
    check (event_type in ('created', 'updated', 'status_changed', 'cancelled')),
  actor_user_id uuid references auth.users(id) on delete set null,
  previous_status text,
  new_status text,
  changes jsonb not null default '{}'::jsonb check (jsonb_typeof(changes) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (booking_id, business_id) references public.bookings(id, business_id) on delete cascade
);

create index if not exists booking_events_booking_created_idx
  on public.booking_events (booking_id, created_at desc);
create index if not exists booking_events_business_created_idx
  on public.booking_events (business_id, created_at desc);
create index if not exists bookings_business_status_start_idx
  on public.bookings (business_id, status, starts_at desc);

create or replace function public.calculate_booking_subtotal(
  p_service_id uuid,
  p_duration_minutes integer,
  p_party_size integer
)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_amount numeric;
begin
  select service.*
  into v_service
  from public.services service
  where service.id = p_service_id;

  if not found then
    raise exception 'booking_service_not_found' using errcode = '23503';
  end if;

  if p_duration_minutes is null or p_duration_minutes <= 0 then
    raise exception 'invalid_booking_duration' using errcode = '22023';
  end if;

  if p_party_size is null or p_party_size <= 0 then
    raise exception 'invalid_booking_party_size' using errcode = '22023';
  end if;

  if v_service.pricing_model in ('free', 'quote') then
    return 0;
  end if;

  if v_service.price_minor is null then
    raise exception 'booking_service_price_missing' using errcode = '23514';
  end if;

  v_amount := case v_service.pricing_model
    when 'fixed' then v_service.price_minor
    when 'per_hour' then (v_service.price_minor::numeric * p_duration_minutes::numeric / 60)
    when 'per_person' then v_service.price_minor::numeric * p_party_size::numeric
    else 0
  end;

  return greatest(0, round(v_amount)::integer);
end;
$$;

create or replace function public.resolve_booking_client(
  p_business_id uuid,
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_locale text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_locale text;
  v_client_id uuid;
begin
  if not public.can_operate_business(p_business_id) then
    raise exception 'booking_operation_forbidden' using errcode = '42501';
  end if;

  if char_length(v_name) not between 1 and 160 then
    raise exception 'invalid_booking_client_name' using errcode = '22023';
  end if;

  select coalesce(nullif(p_locale, ''), business.default_locale)
  into v_locale
  from public.businesses business
  where business.id = p_business_id;

  if v_locale is null then
    raise exception 'booking_business_not_found' using errcode = '23503';
  end if;

  if v_email is not null then
    select client.id
    into v_client_id
    from public.clients client
    where client.business_id = p_business_id
      and lower(client.email) = v_email
    for update;
  end if;

  if v_client_id is null then
    begin
      insert into public.clients (
        business_id,
        name,
        email,
        phone,
        locale
      ) values (
        p_business_id,
        v_name,
        v_email,
        v_phone,
        v_locale
      )
      returning id into v_client_id;
    exception
      when unique_violation then
        if v_email is null then
          raise;
        end if;

        select client.id
        into v_client_id
        from public.clients client
        where client.business_id = p_business_id
          and lower(client.email) = v_email
        for update;

        if v_client_id is null then
          raise;
        end if;
      end;
  end if;

  update public.clients
  set name = v_name,
      phone = coalesce(v_phone, phone),
      locale = v_locale,
      updated_at = now()
  where id = v_client_id
    and business_id = p_business_id;

  return v_client_id;
end;
$$;

create or replace function public.insert_required_booking_allocations(
  p_booking_id uuid,
  p_business_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buffer_before integer;
  v_buffer_after integer;
  v_inserted integer;
begin
  select service.buffer_before_minutes, service.buffer_after_minutes
  into v_buffer_before, v_buffer_after
  from public.services service
  where service.id = p_service_id
    and service.business_id = p_business_id;

  if not found then
    raise exception 'booking_service_not_found' using errcode = '23503';
  end if;

  insert into public.booking_allocations (
    business_id,
    booking_id,
    resource_id,
    starts_at,
    ends_at,
    quantity
  )
  select
    p_business_id,
    p_booking_id,
    link.resource_id,
    p_starts_at - make_interval(mins => v_buffer_before),
    p_ends_at + make_interval(mins => v_buffer_after),
    link.quantity
  from public.service_resources link
  join public.resources resource
    on resource.id = link.resource_id
   and resource.business_id = link.business_id
  where link.business_id = p_business_id
    and link.service_id = p_service_id
    and link.allocation_mode = 'required'
    and resource.is_active = true
    and resource.is_bookable = true;

  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    raise exception 'booking_requires_resource' using errcode = '23514';
  end if;

  return v_inserted;
end;
$$;

create or replace function public.create_admin_booking(
  p_business_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_duration_minutes integer,
  p_party_size integer,
  p_client_name text,
  p_client_email text default null,
  p_client_phone text default null,
  p_locale text default null,
  p_status text default 'confirmed',
  p_customer_notes text default '',
  p_internal_notes text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_business public.businesses%rowtype;
  v_client_id uuid;
  v_booking_id uuid;
  v_ends_at timestamptz;
  v_subtotal integer;
  v_status text := coalesce(p_status, 'confirmed');
begin
  if not public.can_operate_business(p_business_id) then
    raise exception 'booking_operation_forbidden' using errcode = '42501';
  end if;

  if v_status not in ('hold', 'pending', 'confirmed') then
    raise exception 'invalid_initial_booking_status' using errcode = '22023';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = p_business_id
    and business.status = 'active';

  if not found then
    raise exception 'booking_business_not_found' using errcode = '23503';
  end if;

  select service.*
  into v_service
  from public.services service
  where service.id = p_service_id
    and service.business_id = p_business_id
    and service.is_active = true;

  if not found then
    raise exception 'booking_service_not_found' using errcode = '23503';
  end if;

  if not public.service_slot_is_available(
    p_business_id,
    p_service_id,
    p_starts_at,
    p_duration_minutes,
    p_party_size,
    null
  ) then
    raise exception 'booking_slot_unavailable' using errcode = 'P0001';
  end if;

  v_client_id := public.resolve_booking_client(
    p_business_id,
    p_client_name,
    p_client_email,
    p_client_phone,
    coalesce(nullif(p_locale, ''), v_business.default_locale)
  );
  v_ends_at := p_starts_at + make_interval(mins => p_duration_minutes);
  v_subtotal := public.calculate_booking_subtotal(p_service_id, p_duration_minutes, p_party_size);

  insert into public.bookings (
    business_id,
    client_id,
    service_id,
    status,
    source,
    starts_at,
    ends_at,
    timezone,
    locale,
    party_size,
    subtotal_minor,
    discount_minor,
    total_minor,
    currency,
    payment_status,
    customer_notes,
    internal_notes,
    metadata,
    created_by
  ) values (
    p_business_id,
    v_client_id,
    p_service_id,
    v_status,
    'admin',
    p_starts_at,
    v_ends_at,
    v_business.timezone,
    coalesce(nullif(p_locale, ''), v_business.default_locale),
    p_party_size,
    v_subtotal,
    0,
    v_subtotal,
    v_service.currency,
    'not_required',
    left(coalesce(p_customer_notes, ''), 4000),
    left(coalesce(p_internal_notes, ''), 4000),
    jsonb_build_object(
      'service_title', v_service.title,
      'pricing_model', v_service.pricing_model,
      'duration_minutes', p_duration_minutes
    ),
    auth.uid()
  )
  returning id into v_booking_id;

  perform public.insert_required_booking_allocations(
    v_booking_id,
    p_business_id,
    p_service_id,
    p_starts_at,
    v_ends_at
  );

  return v_booking_id;
exception
  when exclusion_violation then
    raise exception 'booking_slot_conflict' using errcode = '23P01';
end;
$$;

create or replace function public.update_admin_booking(
  p_booking_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_duration_minutes integer,
  p_party_size integer,
  p_client_name text,
  p_client_email text default null,
  p_client_phone text default null,
  p_locale text default null,
  p_customer_notes text default '',
  p_internal_notes text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_service public.services%rowtype;
  v_business public.businesses%rowtype;
  v_client_id uuid;
  v_ends_at timestamptz;
  v_subtotal integer;
begin
  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    raise exception 'booking_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_booking.business_id) then
    raise exception 'booking_operation_forbidden' using errcode = '42501';
  end if;

  if v_booking.status not in ('hold', 'pending', 'confirmed') then
    raise exception 'booking_is_final' using errcode = '55000';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = v_booking.business_id
    and business.status = 'active';

  if not found then
    raise exception 'booking_business_not_found' using errcode = '23503';
  end if;

  select service.*
  into v_service
  from public.services service
  where service.id = p_service_id
    and service.business_id = v_booking.business_id
    and service.is_active = true;

  if not found then
    raise exception 'booking_service_not_found' using errcode = '23503';
  end if;

  if not public.service_slot_is_available(
    v_booking.business_id,
    p_service_id,
    p_starts_at,
    p_duration_minutes,
    p_party_size,
    p_booking_id
  ) then
    raise exception 'booking_slot_unavailable' using errcode = 'P0001';
  end if;

  v_client_id := public.resolve_booking_client(
    v_booking.business_id,
    p_client_name,
    p_client_email,
    p_client_phone,
    coalesce(nullif(p_locale, ''), v_booking.locale)
  );
  v_ends_at := p_starts_at + make_interval(mins => p_duration_minutes);
  v_subtotal := public.calculate_booking_subtotal(p_service_id, p_duration_minutes, p_party_size);

  delete from public.booking_allocations allocation
  where allocation.booking_id = p_booking_id
    and allocation.business_id = v_booking.business_id;

  update public.bookings
  set client_id = v_client_id,
      service_id = p_service_id,
      starts_at = p_starts_at,
      ends_at = v_ends_at,
      timezone = v_business.timezone,
      locale = coalesce(nullif(p_locale, ''), v_booking.locale),
      party_size = p_party_size,
      subtotal_minor = v_subtotal,
      discount_minor = 0,
      total_minor = v_subtotal,
      currency = v_service.currency,
      customer_notes = left(coalesce(p_customer_notes, ''), 4000),
      internal_notes = left(coalesce(p_internal_notes, ''), 4000),
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
        'service_title', v_service.title,
        'pricing_model', v_service.pricing_model,
        'duration_minutes', p_duration_minutes
      ),
      updated_at = now()
  where id = p_booking_id;

  perform public.insert_required_booking_allocations(
    p_booking_id,
    v_booking.business_id,
    p_service_id,
    p_starts_at,
    v_ends_at
  );

  return p_booking_id;
exception
  when exclusion_violation then
    raise exception 'booking_slot_conflict' using errcode = '23P01';
end;
$$;

create or replace function public.set_admin_booking_status(
  p_booking_id uuid,
  p_status text,
  p_reason text default ''
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_allowed boolean := false;
begin
  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    raise exception 'booking_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_booking.business_id) then
    raise exception 'booking_operation_forbidden' using errcode = '42501';
  end if;

  v_allowed := case v_booking.status
    when 'draft' then p_status in ('hold', 'pending', 'confirmed', 'cancelled')
    when 'hold' then p_status in ('pending', 'confirmed', 'cancelled')
    when 'pending' then p_status in ('confirmed', 'cancelled')
    when 'confirmed' then p_status in ('completed', 'cancelled', 'no_show')
    else false
  end;

  if not v_allowed then
    raise exception 'invalid_booking_status_transition' using errcode = '22023';
  end if;

  if p_status in ('hold', 'pending', 'confirmed') and not public.service_slot_is_available(
    v_booking.business_id,
    v_booking.service_id,
    v_booking.starts_at,
    extract(epoch from (v_booking.ends_at - v_booking.starts_at))::integer / 60,
    v_booking.party_size,
    v_booking.id
  ) then
    raise exception 'booking_slot_unavailable' using errcode = 'P0001';
  end if;

  update public.bookings
  set status = p_status,
      cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
      cancelled_by = case when p_status = 'cancelled' then auth.uid() else cancelled_by end,
      cancellation_reason = case when p_status = 'cancelled' then left(coalesce(p_reason, ''), 1000) else cancellation_reason end,
      updated_at = now()
  where id = p_booking_id;

  return p_status;
exception
  when exclusion_violation then
    raise exception 'booking_slot_conflict' using errcode = '23P01';
end;
$$;

create or replace function public.cancel_admin_booking(
  p_booking_id uuid,
  p_reason text default ''
)
returns text
language sql
security definer
set search_path = public
as $$
  select public.set_admin_booking_status(p_booking_id, 'cancelled', p_reason);
$$;

create or replace function public.get_admin_service_available_slots(
  p_business_id uuid,
  p_service_id uuid,
  p_date date,
  p_duration_minutes integer default null,
  p_party_size integer default 1,
  p_ignore_booking_id uuid default null
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
  v_timezone text;
  v_slot_interval integer;
  v_duration integer;
  v_service public.services%rowtype;
  v_max_slot_index integer;
begin
  if not public.can_operate_business(p_business_id) then
    raise exception 'booking_operation_forbidden' using errcode = '42501';
  end if;

  select service.*
  into v_service
  from public.services service
  where service.id = p_service_id
    and service.business_id = p_business_id
    and service.is_active = true;

  if not found or p_date is null then
    return;
  end if;

  select business.timezone, settings.slot_interval_minutes
  into v_timezone, v_slot_interval
  from public.businesses business
  join public.business_availability_settings settings on settings.business_id = business.id
  where business.id = p_business_id
    and business.status = 'active';

  v_duration := coalesce(p_duration_minutes, v_service.duration_min_minutes);
  if v_timezone is null or v_slot_interval is null or v_duration is null or v_duration <= 0 or v_duration > 1440 then
    return;
  end if;

  v_max_slot_index := floor((1440 - v_duration)::numeric / v_slot_interval)::integer;
  if v_max_slot_index < 0 then
    return;
  end if;

  return query
  with candidates as (
    select
      ((p_date + time '00:00') + make_interval(mins => slot_index * v_slot_interval))
        at time zone v_timezone as candidate_starts_at
    from generate_series(0, v_max_slot_index) slot_index
  )
  select
    candidate.candidate_starts_at,
    candidate.candidate_starts_at + make_interval(mins => v_duration),
    (candidate.candidate_starts_at at time zone v_timezone)::time,
    ((candidate.candidate_starts_at + make_interval(mins => v_duration)) at time zone v_timezone)::time,
    v_timezone
  from candidates candidate
  where public.service_slot_is_available(
    p_business_id,
    p_service_id,
    candidate.candidate_starts_at,
    v_duration,
    p_party_size,
    p_ignore_booking_id
  )
  order by candidate.candidate_starts_at;
end;
$$;

create or replace function public.audit_booking_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_type text;
  v_changes jsonb;
begin
  if tg_op = 'INSERT' then
    v_event_type := 'created';
    v_changes := jsonb_build_object(
      'status', new.status,
      'service_id', new.service_id,
      'client_id', new.client_id,
      'starts_at', new.starts_at,
      'ends_at', new.ends_at,
      'party_size', new.party_size,
      'total_minor', new.total_minor
    );

    insert into public.booking_events (
      business_id, booking_id, event_type, actor_user_id, previous_status, new_status, changes
    ) values (
      new.business_id, new.id, v_event_type, auth.uid(), null, new.status, v_changes
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    v_event_type := case when new.status = 'cancelled' then 'cancelled' else 'status_changed' end;
  else
    v_event_type := 'updated';
  end if;

  v_changes := jsonb_strip_nulls(jsonb_build_object(
    'service_id', case when old.service_id is distinct from new.service_id then jsonb_build_object('from', old.service_id, 'to', new.service_id) end,
    'client_id', case when old.client_id is distinct from new.client_id then jsonb_build_object('from', old.client_id, 'to', new.client_id) end,
    'starts_at', case when old.starts_at is distinct from new.starts_at then jsonb_build_object('from', old.starts_at, 'to', new.starts_at) end,
    'ends_at', case when old.ends_at is distinct from new.ends_at then jsonb_build_object('from', old.ends_at, 'to', new.ends_at) end,
    'party_size', case when old.party_size is distinct from new.party_size then jsonb_build_object('from', old.party_size, 'to', new.party_size) end,
    'total_minor', case when old.total_minor is distinct from new.total_minor then jsonb_build_object('from', old.total_minor, 'to', new.total_minor) end,
    'status', case when old.status is distinct from new.status then jsonb_build_object('from', old.status, 'to', new.status) end
  ));

  insert into public.booking_events (
    business_id, booking_id, event_type, actor_user_id, previous_status, new_status, changes
  ) values (
    new.business_id,
    new.id,
    v_event_type,
    auth.uid(),
    old.status,
    new.status,
    v_changes
  );

  return new;
end;
$$;

drop trigger if exists bookings_audit_change on public.bookings;
create trigger bookings_audit_change
after insert or update on public.bookings
for each row execute function public.audit_booking_change();

alter table public.booking_events enable row level security;

drop policy if exists "Members read booking events" on public.booking_events;
create policy "Members read booking events" on public.booking_events
for select to authenticated
using (public.can_view_business(business_id));

revoke all on table public.booking_events from anon, authenticated;
grant select on public.booking_events to authenticated;
grant select, insert, update, delete on public.booking_events to service_role;

revoke insert, update, delete on public.bookings, public.booking_allocations from authenticated;
grant select on public.bookings, public.booking_allocations to authenticated;

revoke all on function public.calculate_booking_subtotal(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.resolve_booking_client(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.insert_required_booking_allocations(uuid, uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.create_admin_booking(uuid, uuid, timestamptz, integer, integer, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.update_admin_booking(uuid, uuid, timestamptz, integer, integer, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.set_admin_booking_status(uuid, text, text) from public, anon, authenticated;
revoke all on function public.cancel_admin_booking(uuid, text) from public, anon, authenticated;
revoke all on function public.get_admin_service_available_slots(uuid, uuid, date, integer, integer, uuid) from public, anon, authenticated;
revoke all on function public.audit_booking_change() from public, anon, authenticated;

grant execute on function public.create_admin_booking(uuid, uuid, timestamptz, integer, integer, text, text, text, text, text, text, text) to authenticated, service_role;
grant execute on function public.update_admin_booking(uuid, uuid, timestamptz, integer, integer, text, text, text, text, text, text) to authenticated, service_role;
grant execute on function public.set_admin_booking_status(uuid, text, text) to authenticated, service_role;
grant execute on function public.cancel_admin_booking(uuid, text) to authenticated, service_role;
grant execute on function public.get_admin_service_available_slots(uuid, uuid, date, integer, integer, uuid) to authenticated, service_role;
grant execute on function public.calculate_booking_subtotal(uuid, integer, integer) to service_role;
grant execute on function public.resolve_booking_client(uuid, text, text, text, text) to service_role;
grant execute on function public.insert_required_booking_allocations(uuid, uuid, uuid, timestamptz, timestamptz) to service_role;

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
    (new.id, 'scheduling', true, '1.1.0', jsonb_build_object('booking_core', true)),
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
    version = '1.1.0',
    config = coalesce(config, '{}'::jsonb) || jsonb_build_object('booking_core', true),
    updated_at = now()
where module_key = 'scheduling';

update public.business_modules
set enabled = true,
    version = '1.0.0',
    config = coalesce(config, '{}'::jsonb) || jsonb_build_object('booking_clients', true),
    updated_at = now()
where module_key = 'crm';

comment on table public.booking_events is
  'Append-only operational history for canonical OneStudio bookings.';
comment on function public.create_admin_booking(uuid, uuid, timestamptz, integer, integer, text, text, text, text, text, text, text) is
  'Creates one conflict-safe administrative booking, client and required resource allocations in a single transaction.';
comment on function public.update_admin_booking(uuid, uuid, timestamptz, integer, integer, text, text, text, text, text, text) is
  'Reschedules an active booking and atomically replaces its required resource allocations.';
comment on function public.get_admin_service_available_slots(uuid, uuid, date, integer, integer, uuid) is
  'Returns calculated service slots to an authorized operator and may ignore one booking during edits.';
