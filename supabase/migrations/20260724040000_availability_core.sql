-- OneStudio OS Availability Core 1.0
-- Activates weekly resource hours, date exceptions and service slot calculation.
-- Booking creation, checkout and notifications remain outside this layer.

create table if not exists public.business_availability_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  minimum_notice_minutes integer not null default 120
    check (minimum_notice_minutes between 0 and 525600),
  booking_horizon_days integer not null default 90
    check (booking_horizon_days between 1 and 730),
  slot_interval_minutes integer not null default 30
    check (slot_interval_minutes between 5 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.business_availability_settings (business_id)
select business.id
from public.businesses business
on conflict (business_id) do nothing;

create or replace function public.seed_business_availability_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_availability_settings (business_id)
  values (new.id)
  on conflict (business_id) do nothing;
  return new;
end;
$$;

revoke all on function public.seed_business_availability_settings() from public, anon, authenticated;

drop trigger if exists seed_business_availability_settings_after_insert on public.businesses;
create trigger seed_business_availability_settings_after_insert
after insert on public.businesses
for each row execute function public.seed_business_availability_settings();

drop trigger if exists set_business_availability_settings_updated_at on public.business_availability_settings;
create trigger set_business_availability_settings_updated_at
before update on public.business_availability_settings
for each row execute function public.set_updated_at();

create index if not exists availability_rules_business_resource_day_idx
  on public.availability_rules (business_id, resource_id, day_of_week, is_active, start_time);

create index if not exists availability_exceptions_business_resource_window_idx
  on public.availability_exceptions (business_id, resource_id, starts_at, ends_at);

create index if not exists booking_allocations_resource_window_idx
  on public.booking_allocations (resource_id, starts_at, ends_at)
  where status in ('held', 'confirmed');

create or replace function public.replace_resource_weekly_availability(
  p_resource_id uuid,
  p_rules jsonb default '[]'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_inserted integer := 0;
begin
  if jsonb_typeof(coalesce(p_rules, '[]'::jsonb)) <> 'array' then
    raise exception 'availability_rules_must_be_an_array' using errcode = '22023';
  end if;

  select resource.business_id
  into v_business_id
  from public.resources resource
  where resource.id = p_resource_id;

  if v_business_id is null then
    raise exception 'availability_resource_not_found' using errcode = '23503';
  end if;

  if not public.can_configure_business(v_business_id) then
    raise exception 'availability_configuration_forbidden' using errcode = '42501';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(coalesce(p_rules, '[]'::jsonb)) rule
    where not (
      rule ? 'day_of_week'
      and rule ? 'start_time'
      and rule ? 'end_time'
      and (rule ->> 'day_of_week') ~ '^[0-6]$'
      and (rule ->> 'start_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      and (rule ->> 'end_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      and (rule ->> 'start_time')::time < (rule ->> 'end_time')::time
    )
  ) then
    raise exception 'invalid_availability_rule' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(coalesce(p_rules, '[]'::jsonb)) with ordinality first_rule(rule, ordinal)
    join jsonb_array_elements(coalesce(p_rules, '[]'::jsonb)) with ordinality second_rule(rule, ordinal)
      on second_rule.ordinal > first_rule.ordinal
     and (second_rule.rule ->> 'day_of_week')::smallint = (first_rule.rule ->> 'day_of_week')::smallint
     and (second_rule.rule ->> 'start_time')::time < (first_rule.rule ->> 'end_time')::time
     and (second_rule.rule ->> 'end_time')::time > (first_rule.rule ->> 'start_time')::time
  ) then
    raise exception 'availability_rules_overlap' using errcode = '22023';
  end if;

  delete from public.availability_rules rule
  where rule.resource_id = p_resource_id
    and rule.business_id = v_business_id
    and rule.effective_from is null
    and rule.effective_until is null;

  insert into public.availability_rules (
    business_id,
    resource_id,
    day_of_week,
    start_time,
    end_time,
    effective_from,
    effective_until,
    is_active
  )
  select
    v_business_id,
    p_resource_id,
    (rule ->> 'day_of_week')::smallint,
    (rule ->> 'start_time')::time,
    (rule ->> 'end_time')::time,
    null,
    null,
    true
  from jsonb_array_elements(coalesce(p_rules, '[]'::jsonb)) rule;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

revoke all on function public.replace_resource_weekly_availability(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_resource_weekly_availability(uuid, jsonb) to authenticated, service_role;

create or replace function public.create_resource_availability_exception(
  p_resource_id uuid,
  p_kind text,
  p_local_date date,
  p_start_time time,
  p_end_time time,
  p_reason text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_timezone text;
  v_exception_id uuid;
begin
  select
    resource.business_id,
    coalesce(nullif(resource.timezone, ''), business.timezone)
  into v_business_id, v_timezone
  from public.resources resource
  join public.businesses business on business.id = resource.business_id
  where resource.id = p_resource_id;

  if v_business_id is null then
    raise exception 'availability_resource_not_found' using errcode = '23503';
  end if;

  if not public.can_configure_business(v_business_id) then
    raise exception 'availability_configuration_forbidden' using errcode = '42501';
  end if;

  if p_kind not in ('available', 'blocked') then
    raise exception 'invalid_availability_exception_kind' using errcode = '22023';
  end if;

  if p_start_time >= p_end_time then
    raise exception 'invalid_availability_exception_window' using errcode = '22023';
  end if;

  insert into public.availability_exceptions (
    business_id,
    resource_id,
    kind,
    starts_at,
    ends_at,
    reason
  ) values (
    v_business_id,
    p_resource_id,
    p_kind,
    (p_local_date + p_start_time) at time zone v_timezone,
    (p_local_date + p_end_time) at time zone v_timezone,
    left(coalesce(p_reason, ''), 500)
  )
  returning id into v_exception_id;

  return v_exception_id;
end;
$$;

revoke all on function public.create_resource_availability_exception(uuid, text, date, time, time, text) from public, anon, authenticated;
grant execute on function public.create_resource_availability_exception(uuid, text, date, time, time, text) to authenticated, service_role;

create or replace function public.resource_is_available(
  p_resource_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_ignore_booking_id uuid default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_timezone text;
  v_local_start timestamp;
  v_local_end timestamp;
  v_local_date date;
  v_day_of_week smallint;
  v_has_base_window boolean;
  v_has_available_exception boolean;
  v_has_blocked_exception boolean;
  v_has_booking_conflict boolean;
begin
  if p_starts_at is null or p_ends_at is null or p_starts_at >= p_ends_at then
    return false;
  end if;

  select
    resource.business_id,
    coalesce(nullif(resource.timezone, ''), business.timezone)
  into v_business_id, v_timezone
  from public.resources resource
  join public.businesses business on business.id = resource.business_id
  where resource.id = p_resource_id
    and resource.is_active = true
    and resource.is_bookable = true;

  if v_business_id is null then
    return false;
  end if;

  v_local_start := p_starts_at at time zone v_timezone;
  v_local_end := p_ends_at at time zone v_timezone;

  if v_local_start::date <> v_local_end::date then
    return false;
  end if;

  v_local_date := v_local_start::date;
  v_day_of_week := extract(dow from v_local_date)::smallint;

  select exists (
    select 1
    from public.availability_rules rule
    where rule.resource_id = p_resource_id
      and rule.business_id = v_business_id
      and rule.day_of_week = v_day_of_week
      and rule.is_active = true
      and (rule.effective_from is null or rule.effective_from <= v_local_date)
      and (rule.effective_until is null or rule.effective_until >= v_local_date)
      and rule.start_time <= v_local_start::time
      and rule.end_time >= v_local_end::time
  ) into v_has_base_window;

  select exists (
    select 1
    from public.availability_exceptions exception
    where exception.resource_id = p_resource_id
      and exception.business_id = v_business_id
      and exception.kind = 'available'
      and exception.starts_at <= p_starts_at
      and exception.ends_at >= p_ends_at
  ) into v_has_available_exception;

  select exists (
    select 1
    from public.availability_exceptions exception
    where exception.resource_id = p_resource_id
      and exception.business_id = v_business_id
      and exception.kind = 'blocked'
      and tstzrange(exception.starts_at, exception.ends_at, '[)')
          && tstzrange(p_starts_at, p_ends_at, '[)')
  ) into v_has_blocked_exception;

  if not (v_has_base_window or v_has_available_exception) or v_has_blocked_exception then
    return false;
  end if;

  select exists (
    select 1
    from public.booking_allocations allocation
    where allocation.resource_id = p_resource_id
      and allocation.business_id = v_business_id
      and allocation.status in ('held', 'confirmed')
      and (p_ignore_booking_id is null or allocation.booking_id <> p_ignore_booking_id)
      and tstzrange(allocation.starts_at, allocation.ends_at, '[)')
          && tstzrange(p_starts_at, p_ends_at, '[)')
  ) into v_has_booking_conflict;

  return not v_has_booking_conflict;
end;
$$;

revoke all on function public.resource_is_available(uuid, timestamptz, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.resource_is_available(uuid, timestamptz, timestamptz, uuid) to service_role;

create or replace function public.service_slot_is_available(
  p_business_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_duration_minutes integer default null,
  p_party_size integer default 1,
  p_ignore_booking_id uuid default null
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_settings public.business_availability_settings%rowtype;
  v_timezone text;
  v_duration integer;
  v_occupied_starts_at timestamptz;
  v_occupied_ends_at timestamptz;
  v_required_resources integer;
begin
  select service.*
  into v_service
  from public.services service
  where service.id = p_service_id
    and service.business_id = p_business_id
    and service.is_active = true
    and (service.is_public = true or public.can_view_business(service.business_id));

  if not found or p_starts_at is null then
    return false;
  end if;

  select settings.*
  into v_settings
  from public.business_availability_settings settings
  where settings.business_id = p_business_id;

  if not found then
    return false;
  end if;

  select business.timezone
  into v_timezone
  from public.businesses business
  where business.id = p_business_id
    and business.status = 'active';

  if v_timezone is null then
    return false;
  end if;

  v_duration := coalesce(p_duration_minutes, v_service.duration_min_minutes);

  if v_duration is null or v_duration <= 0 then
    return false;
  end if;

  if v_service.duration_min_minutes is not null and v_duration < v_service.duration_min_minutes then
    return false;
  end if;

  if v_service.duration_max_minutes is not null and v_duration > v_service.duration_max_minutes then
    return false;
  end if;

  if v_service.duration_step_minutes is not null
     and v_service.duration_min_minutes is not null
     and mod(v_duration - v_service.duration_min_minutes, v_service.duration_step_minutes) <> 0 then
    return false;
  end if;

  if p_party_size < 1 or p_party_size > v_service.capacity then
    return false;
  end if;

  if p_starts_at < now() + make_interval(mins => v_settings.minimum_notice_minutes) then
    return false;
  end if;

  if (p_starts_at at time zone v_timezone)::date
     > (now() at time zone v_timezone)::date + v_settings.booking_horizon_days then
    return false;
  end if;

  v_occupied_starts_at := p_starts_at - make_interval(mins => v_service.buffer_before_minutes);
  v_occupied_ends_at := p_starts_at
    + make_interval(mins => v_duration + v_service.buffer_after_minutes);

  select count(*)
  into v_required_resources
  from public.service_resources link
  join public.resources resource
    on resource.id = link.resource_id
   and resource.business_id = link.business_id
  where link.service_id = p_service_id
    and link.business_id = p_business_id
    and link.allocation_mode = 'required'
    and resource.is_active = true
    and resource.is_bookable = true;

  if v_required_resources = 0 then
    return false;
  end if;

  return not exists (
    select 1
    from public.service_resources link
    left join public.resources resource
      on resource.id = link.resource_id
     and resource.business_id = link.business_id
    where link.service_id = p_service_id
      and link.business_id = p_business_id
      and link.allocation_mode = 'required'
      and (
        resource.id is null
        or resource.is_active = false
        or resource.is_bookable = false
        or not public.resource_is_available(
          link.resource_id,
          v_occupied_starts_at,
          v_occupied_ends_at,
          p_ignore_booking_id
        )
      )
  );
end;
$$;

revoke all on function public.service_slot_is_available(uuid, uuid, timestamptz, integer, integer, uuid) from public, anon, authenticated;
grant execute on function public.service_slot_is_available(uuid, uuid, timestamptz, integer, integer, uuid) to authenticated, service_role;

create or replace function public.get_service_available_slots(
  p_business_id uuid,
  p_service_id uuid,
  p_date date,
  p_duration_minutes integer default null,
  p_party_size integer default 1
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
  select service.*
  into v_service
  from public.services service
  where service.id = p_service_id
    and service.business_id = p_business_id
    and service.is_active = true
    and (service.is_public = true or public.can_view_business(service.business_id));

  if not found or p_date is null then
    return;
  end if;

  select business.timezone, settings.slot_interval_minutes
  into v_timezone, v_slot_interval
  from public.businesses business
  join public.business_availability_settings settings on settings.business_id = business.id
  where business.id = p_business_id
    and business.status = 'active';

  if v_timezone is null or v_slot_interval is null then
    return;
  end if;

  v_duration := coalesce(p_duration_minutes, v_service.duration_min_minutes);
  if v_duration is null or v_duration <= 0 or v_duration > 1440 then
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
    null
  )
  order by candidate.candidate_starts_at;
end;
$$;

revoke all on function public.get_service_available_slots(uuid, uuid, date, integer, integer) from public, anon, authenticated;
grant execute on function public.get_service_available_slots(uuid, uuid, date, integer, integer) to anon, authenticated, service_role;

alter table public.business_availability_settings enable row level security;

drop policy if exists "Members read availability settings" on public.business_availability_settings;
drop policy if exists "Managers configure availability settings" on public.business_availability_settings;

create policy "Members read availability settings" on public.business_availability_settings
for select to authenticated
using (public.can_view_business(business_id));

create policy "Managers configure availability settings" on public.business_availability_settings
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

revoke all on table public.business_availability_settings from anon, authenticated;
grant select, insert, update, delete on public.business_availability_settings to authenticated;

-- Availability internals remain private. The public storefront only receives calculated slots.
revoke select on public.availability_rules, public.availability_exceptions from anon;

create or replace function public.seed_business_modules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_modules (business_id, module_key, enabled, version)
  values
    (new.id, 'core', true, '1.1.0'),
    (new.id, 'media', true, '1.0.0'),
    (new.id, 'portfolio', true, '1.0.0'),
    (new.id, 'catalog', true, '1.0.0'),
    (new.id, 'scheduling', true, '1.0.0'),
    (new.id, 'crm', false, '1.0.0'),
    (new.id, 'payments', false, '0.0.0'),
    (new.id, 'notifications', false, '0.0.0'),
    (new.id, 'analytics', false, '0.0.0')
  on conflict (business_id, module_key) do update set
    enabled = excluded.enabled,
    version = excluded.version,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.seed_business_modules() from public, anon, authenticated;

insert into public.business_modules (business_id, module_key, enabled, version)
select business.id, 'scheduling', true, '1.0.0'
from public.businesses business
on conflict (business_id, module_key) do update set
  enabled = true,
  version = '1.0.0',
  updated_at = now();

comment on table public.business_availability_settings is
  'Workspace-level booking notice, horizon and slot cadence used by Availability Core.';
comment on function public.get_service_available_slots(uuid, uuid, date, integer, integer) is
  'Returns public-safe service start times after weekly rules, exceptions, buffers, notice, horizon and allocation conflicts are applied.';
comment on function public.replace_resource_weekly_availability(uuid, jsonb) is
  'Atomically replaces one resource weekly schedule after role and overlap validation.';
