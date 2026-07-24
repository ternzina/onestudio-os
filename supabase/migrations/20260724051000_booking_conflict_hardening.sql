-- OneStudio OS Booking Core 1.0 conflict hardening
-- Prevents double-submit races and active bookings without required allocations.


create or replace function public.lock_booking_resource_scope(
  p_business_id uuid,
  p_service_id uuid,
  p_booking_id uuid default null
)
returns integer
language plpgsql
volatile
security definer
set search_path = public, pg_catalog
as $$
declare
  v_resource_id uuid;
  v_locked integer := 0;
  v_required integer := 0;
begin
  select count(*)
  into v_required
  from public.service_resources link
  join public.resources resource
    on resource.id = link.resource_id
   and resource.business_id = link.business_id
  where link.business_id = p_business_id
    and link.service_id = p_service_id
    and link.allocation_mode = 'required'
    and resource.is_active = true
    and resource.is_bookable = true;

  if v_required = 0 then
    raise exception 'booking_requires_resource' using errcode = '23514';
  end if;

  for v_resource_id in
    select scope.resource_id
    from (
      select link.resource_id
      from public.service_resources link
      join public.resources resource
        on resource.id = link.resource_id
       and resource.business_id = link.business_id
      where link.business_id = p_business_id
        and link.service_id = p_service_id
        and link.allocation_mode = 'required'
        and resource.is_active = true
        and resource.is_bookable = true

      union

      select allocation.resource_id
      from public.booking_allocations allocation
      where p_booking_id is not null
        and allocation.business_id = p_business_id
        and allocation.booking_id = p_booking_id
    ) scope
    order by scope.resource_id
  loop
    perform pg_advisory_xact_lock(hashtextextended(v_resource_id::text, 0));
    v_locked := v_locked + 1;
  end loop;

  return v_locked;
end;
$$;

revoke all on function public.lock_booking_resource_scope(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.lock_booking_resource_scope(uuid, uuid, uuid)
  to service_role;

comment on function public.lock_booking_resource_scope(uuid, uuid, uuid) is
  'Serializes booking writes per required resource so two concurrent requests cannot reserve the same resource window.';

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

  perform public.lock_booking_resource_scope(
    p_business_id,
    p_service_id,
    null
  );

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

  perform public.lock_booking_resource_scope(
    v_booking.business_id,
    p_service_id,
    p_booking_id
  );

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

  if p_status in ('hold', 'pending', 'confirmed') then
    perform public.lock_booking_resource_scope(
      v_booking.business_id,
      v_booking.service_id,
      v_booking.id
    );
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


create or replace function public.assert_active_booking_allocations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_required integer := 0;
  v_missing integer := 0;
begin
  if new.status not in ('hold', 'pending', 'confirmed') then
    return new;
  end if;

  select count(*)
  into v_required
  from public.service_resources link
  join public.resources resource
    on resource.id = link.resource_id
   and resource.business_id = link.business_id
  where link.business_id = new.business_id
    and link.service_id = new.service_id
    and link.allocation_mode = 'required'
    and resource.is_active = true
    and resource.is_bookable = true;

  if v_required = 0 then
    raise exception 'booking_requires_resource' using errcode = '23514';
  end if;

  select count(*)
  into v_missing
  from public.service_resources link
  join public.resources resource
    on resource.id = link.resource_id
   and resource.business_id = link.business_id
  join public.services service
    on service.id = new.service_id
   and service.business_id = new.business_id
  where link.business_id = new.business_id
    and link.service_id = new.service_id
    and link.allocation_mode = 'required'
    and resource.is_active = true
    and resource.is_bookable = true
    and not exists (
      select 1
      from public.booking_allocations allocation
      where allocation.business_id = new.business_id
        and allocation.booking_id = new.id
        and allocation.resource_id = link.resource_id
        and allocation.status in ('held', 'confirmed')
        and allocation.starts_at = new.starts_at - make_interval(mins => service.buffer_before_minutes)
        and allocation.ends_at = new.ends_at + make_interval(mins => service.buffer_after_minutes)
    );

  if v_missing > 0 then
    raise exception 'booking_active_allocation_missing' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.assert_active_booking_allocations()
  from public, anon, authenticated;

drop trigger if exists bookings_active_allocations_guard on public.bookings;
create constraint trigger bookings_active_allocations_guard
after insert or update on public.bookings
deferrable initially deferred
for each row
execute function public.assert_active_booking_allocations();

comment on function public.assert_active_booking_allocations() is
  'Deferred invariant: every active booking must finish its transaction with all required resource allocations.';
