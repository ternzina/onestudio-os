-- OneStudio OS Public Booking UI 1.0
-- Adds a guarded anonymous booking contract on top of Catalog, Availability and Booking Core.

alter table public.bookings
  add column if not exists public_request_key uuid;

create unique index if not exists bookings_business_public_request_key_unique
  on public.bookings (business_id, public_request_key)
  where public_request_key is not null;

create or replace function public.get_public_booking_context(
  p_business_slug text
)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select jsonb_build_object(
    'business', jsonb_build_object(
      'id', business.id,
      'slug', business.slug,
      'name', business.name,
      'timezone', business.timezone,
      'default_locale', business.default_locale,
      'default_currency', business.default_currency
    ),
    'date_bounds', jsonb_build_object(
      'minimum_date', (now() at time zone business.timezone)::date,
      'maximum_date', (now() at time zone business.timezone)::date + settings.booking_horizon_days
    ),
    'services', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', service.id,
          'slug', service.slug,
          'title', service.title,
          'description', service.description,
          'kind', service.kind,
          'category_name', category.name,
          'pricing_model', service.pricing_model,
          'price_minor', service.price_minor,
          'currency', service.currency,
          'duration_min_minutes', service.duration_min_minutes,
          'duration_max_minutes', service.duration_max_minutes,
          'duration_step_minutes', service.duration_step_minutes,
          'capacity', service.capacity,
          'requires_confirmation', service.requires_confirmation
        )
        order by coalesce(category.sort_order, 2147483647), service.sort_order, service.title
      )
      from public.services service
      left join public.catalog_categories category
        on category.id = service.category_id
       and category.business_id = service.business_id
       and category.kind = 'service'
       and category.is_active = true
       and category.is_public = true
      where service.business_id = business.id
        and service.is_active = true
        and service.is_public = true
        and service.duration_min_minutes is not null
        and service.duration_min_minutes > 0
        and exists (
          select 1
          from public.service_resources link
          join public.resources resource
            on resource.id = link.resource_id
           and resource.business_id = link.business_id
          where link.business_id = business.id
            and link.service_id = service.id
            and link.allocation_mode = 'required'
            and resource.is_active = true
            and resource.is_bookable = true
        )
    ), '[]'::jsonb)
  )
  from public.businesses business
  join public.business_availability_settings settings
    on settings.business_id = business.id
  join public.business_modules scheduling
    on scheduling.business_id = business.id
   and scheduling.module_key = 'scheduling'
   and scheduling.enabled = true
  where business.slug = lower(trim(coalesce(p_business_slug, '')))
    and business.status = 'active';
$$;

revoke all on function public.get_public_booking_context(text)
  from public, anon, authenticated;
grant execute on function public.get_public_booking_context(text)
  to anon, authenticated, service_role;

create or replace function public.create_public_booking(
  p_business_slug text,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_duration_minutes integer,
  p_party_size integer,
  p_client_name text,
  p_client_email text,
  p_client_phone text default null,
  p_locale text default null,
  p_customer_notes text default '',
  p_request_key uuid default null
)
returns table (
  booking_id uuid,
  reference text,
  status text,
  starts_at timestamptz,
  ends_at timestamptz,
  total_minor integer,
  currency text,
  timezone text
)
language plpgsql
volatile
security definer
set search_path = public, pg_catalog
as $$
declare
  v_business public.businesses%rowtype;
  v_service public.services%rowtype;
  v_existing public.bookings%rowtype;
  v_booking public.bookings%rowtype;
  v_client_id uuid;
  v_name text := trim(coalesce(p_client_name, ''));
  v_email text := lower(trim(coalesce(p_client_email, '')));
  v_phone text := nullif(trim(coalesce(p_client_phone, '')), '');
  v_locale text;
  v_status text;
  v_ends_at timestamptz;
  v_subtotal integer;
begin
  if p_request_key is null then
    raise exception 'public_booking_request_key_required' using errcode = '22023';
  end if;

  select business.*
  into v_business
  from public.businesses business
  join public.business_modules scheduling
    on scheduling.business_id = business.id
   and scheduling.module_key = 'scheduling'
   and scheduling.enabled = true
  where business.slug = lower(trim(coalesce(p_business_slug, '')))
    and business.status = 'active';

  if not found then
    raise exception 'public_booking_business_not_found' using errcode = '23503';
  end if;

  select booking.*
  into v_existing
  from public.bookings booking
  where booking.business_id = v_business.id
    and booking.public_request_key = p_request_key;

  if found then
    return query
    select
      v_existing.id,
      v_existing.reference,
      v_existing.status,
      v_existing.starts_at,
      v_existing.ends_at,
      v_existing.total_minor,
      v_existing.currency,
      v_existing.timezone;
    return;
  end if;

  if char_length(v_name) not between 1 and 160 then
    raise exception 'invalid_public_booking_client_name' using errcode = '22023';
  end if;

  if char_length(v_email) not between 5 and 254
     or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_public_booking_client_email' using errcode = '22023';
  end if;

  if v_phone is not null and char_length(v_phone) not between 5 and 40 then
    raise exception 'invalid_public_booking_client_phone' using errcode = '22023';
  end if;

  if p_starts_at is null then
    raise exception 'invalid_public_booking_start' using errcode = '22023';
  end if;

  select service.*
  into v_service
  from public.services service
  where service.id = p_service_id
    and service.business_id = v_business.id
    and service.is_active = true
    and service.is_public = true
    and exists (
      select 1
      from public.service_resources link
      join public.resources resource
        on resource.id = link.resource_id
       and resource.business_id = link.business_id
      where link.business_id = v_business.id
        and link.service_id = service.id
        and link.allocation_mode = 'required'
        and resource.is_active = true
        and resource.is_bookable = true
    );

  if not found then
    raise exception 'public_booking_service_not_found' using errcode = '23503';
  end if;

  if p_duration_minutes is null
     or p_duration_minutes <= 0
     or (v_service.duration_min_minutes is not null and p_duration_minutes < v_service.duration_min_minutes)
     or (v_service.duration_max_minutes is not null and p_duration_minutes > v_service.duration_max_minutes)
     or (
       v_service.duration_step_minutes is not null
       and v_service.duration_min_minutes is not null
       and mod(p_duration_minutes - v_service.duration_min_minutes, v_service.duration_step_minutes) <> 0
     ) then
    raise exception 'invalid_public_booking_duration' using errcode = '22023';
  end if;

  if p_party_size is null or p_party_size < 1 or p_party_size > v_service.capacity then
    raise exception 'invalid_public_booking_party_size' using errcode = '22023';
  end if;

  v_locale := lower(coalesce(nullif(trim(p_locale), ''), v_business.default_locale));
  if v_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'invalid_public_booking_locale' using errcode = '22023';
  end if;

  perform public.lock_booking_resource_scope(v_business.id, v_service.id, null);

  if not public.service_slot_is_available(
    v_business.id,
    v_service.id,
    p_starts_at,
    p_duration_minutes,
    p_party_size,
    null
  ) then
    raise exception 'booking_slot_unavailable' using errcode = 'P0001';
  end if;

  select client.id
  into v_client_id
  from public.clients client
  where client.business_id = v_business.id
    and lower(client.email) = v_email
  for update;

  if v_client_id is null then
    begin
      insert into public.clients (
        business_id,
        name,
        email,
        phone,
        locale,
        metadata
      ) values (
        v_business.id,
        v_name,
        v_email,
        v_phone,
        v_locale,
        jsonb_build_object('created_from', 'public_booking')
      )
      returning id into v_client_id;
    exception
      when unique_violation then
        select client.id
        into v_client_id
        from public.clients client
        where client.business_id = v_business.id
          and lower(client.email) = v_email
        for update;
    end;
  end if;

  if v_client_id is null then
    raise exception 'public_booking_client_resolution_failed' using errcode = 'P0001';
  end if;

  v_status := case when v_service.requires_confirmation then 'pending' else 'confirmed' end;
  v_ends_at := p_starts_at + make_interval(mins => p_duration_minutes);
  v_subtotal := public.calculate_booking_subtotal(v_service.id, p_duration_minutes, p_party_size);

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
    created_by,
    public_request_key
  ) values (
    v_business.id,
    v_client_id,
    v_service.id,
    v_status,
    'public',
    p_starts_at,
    v_ends_at,
    v_business.timezone,
    v_locale,
    p_party_size,
    v_subtotal,
    0,
    v_subtotal,
    v_service.currency,
    'not_required',
    left(coalesce(p_customer_notes, ''), 4000),
    '',
    jsonb_build_object(
      'service_title', v_service.title,
      'pricing_model', v_service.pricing_model,
      'duration_minutes', p_duration_minutes,
      'public_contact_name', v_name,
      'public_contact_email', v_email,
      'public_contact_phone', v_phone
    ),
    null,
    p_request_key
  )
  returning * into v_booking;

  perform public.insert_required_booking_allocations(
    v_booking.id,
    v_business.id,
    v_service.id,
    p_starts_at,
    v_ends_at
  );

  return query
  select
    v_booking.id,
    v_booking.reference,
    v_booking.status,
    v_booking.starts_at,
    v_booking.ends_at,
    v_booking.total_minor,
    v_booking.currency,
    v_booking.timezone;
exception
  when exclusion_violation then
    raise exception 'booking_slot_conflict' using errcode = '23P01';
  when unique_violation then
    select booking.*
    into v_existing
    from public.bookings booking
    where booking.business_id = v_business.id
      and booking.public_request_key = p_request_key;

    if found then
      return query
      select
        v_existing.id,
        v_existing.reference,
        v_existing.status,
        v_existing.starts_at,
        v_existing.ends_at,
        v_existing.total_minor,
        v_existing.currency,
        v_existing.timezone;
      return;
    end if;

    raise;
end;
$$;

revoke all on function public.create_public_booking(text, uuid, timestamptz, integer, integer, text, text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.create_public_booking(text, uuid, timestamptz, integer, integer, text, text, text, text, text, uuid)
  to anon, authenticated, service_role;

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
    (new.id, 'scheduling', true, '1.2.0', jsonb_build_object('booking_core', true, 'public_booking_ui', true)),
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
    version = '1.2.0',
    config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object('booking_core', true, 'public_booking_ui', true),
    updated_at = now()
where module_key = 'scheduling';

comment on column public.bookings.public_request_key is
  'Client-generated idempotency key for guarded public booking retries.';
comment on function public.get_public_booking_context(text) is
  'Returns public business identity, date bounds and safely publishable bookable services without exposing schedule internals.';
comment on function public.create_public_booking(text, uuid, timestamptz, integer, integer, text, text, text, text, text, uuid) is
  'Creates one conflict-safe anonymous booking with an idempotency key, client record and required resource allocations.';
