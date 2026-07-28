-- OneStudio OS Client Launch 1.0
-- Turns the one-time installation bootstrap into an atomic, client-ready launch:
-- workspace identity, company contacts, first offer, first resource, weekly hours
-- and a dependency-safe module selection.

create table if not exists public.business_launch_profiles (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  business_type text not null default 'other'
    check (business_type in (
      'photo_studio', 'beauty_salon', 'school', 'venue',
      'creative_service', 'other'
    )),
  enabled_modules text[] not null default '{}'::text[],
  first_service_id uuid references public.services(id) on delete set null,
  first_resource_id uuid references public.resources(id) on delete set null,
  completed_at timestamptz,
  completed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_launch_profiles enable row level security;

drop policy if exists "Members view business launch profile"
  on public.business_launch_profiles;
drop policy if exists "Owners manage business launch profile"
  on public.business_launch_profiles;

create policy "Members view business launch profile"
on public.business_launch_profiles
for select to authenticated
using (public.can_view_business(business_id));

create policy "Owners manage business launch profile"
on public.business_launch_profiles
for all to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

revoke all on table public.business_launch_profiles from anon, authenticated;
grant select, insert, update on table public.business_launch_profiles to authenticated;
grant all on table public.business_launch_profiles to service_role;

drop trigger if exists set_business_launch_profiles_updated_at
  on public.business_launch_profiles;
create trigger set_business_launch_profiles_updated_at
before update on public.business_launch_profiles
for each row execute function public.set_updated_at();

-- Current installations are already launched and must never be sent through
-- the first-client wizard after this migration.
insert into public.business_launch_profiles (
  business_id,
  business_type,
  enabled_modules,
  completed_at
)
select
  business.id,
  'other',
  coalesce((
    select array_agg(module.module_key order by module.module_key)
    from public.business_modules module
    where module.business_id = business.id
      and module.enabled
  ), '{}'::text[]),
  case
    when exists (
      select 1
      from public.business_members member
      where member.business_id = business.id
        and member.is_active
    ) then now()
    else null
  end
from public.businesses business
on conflict (business_id) do nothing;

create or replace function public.configure_business_modules(
  p_business_id uuid,
  p_enabled_module_keys text[] default '{}'::text[]
)
returns table (
  module_key text,
  enabled boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requested text[] := coalesce(p_enabled_module_keys, '{}'::text[]);
  v_enabled text[];
begin
  if not public.can_manage_business(p_business_id) then
    raise exception 'module_configuration_forbidden' using errcode = '42501';
  end if;

  if exists (
    select 1
    from unnest(v_requested) requested(module_key)
    where requested.module_key not in (
      'core', 'media', 'portfolio', 'catalog', 'scheduling',
      'crm', 'payments', 'notifications', 'documents', 'analytics'
    )
  ) then
    raise exception 'unknown_module_key' using errcode = '22023';
  end if;

  -- Core operations are always present. Optional dependencies are expanded
  -- here so a workspace can never save an impossible module combination.
  select array_agg(distinct key order by key)
  into v_enabled
  from unnest(
    array['core', 'catalog', 'scheduling', 'crm']::text[]
    || v_requested
    || case when 'portfolio' = any(v_requested)
      then array['media']::text[] else '{}'::text[] end
    || case when 'notifications' = any(v_requested)
      then array['payments']::text[] else '{}'::text[] end
    || case when 'documents' = any(v_requested)
      then array['payments', 'notifications']::text[] else '{}'::text[] end
  ) enabled_keys(key);

  update public.business_modules module
  set enabled = module.module_key = any(v_enabled),
      updated_at = now()
  where module.business_id = p_business_id;

  insert into public.business_launch_profiles (
    business_id,
    enabled_modules
  )
  values (
    p_business_id,
    v_enabled
  )
  on conflict (business_id) do update set
    enabled_modules = excluded.enabled_modules,
    updated_at = now();

  return query
  select module.module_key, module.enabled
  from public.business_modules module
  where module.business_id = p_business_id
  order by module.module_key;
end;
$$;

revoke all on function public.configure_business_modules(uuid, text[])
  from public, anon, authenticated;
grant execute on function public.configure_business_modules(uuid, text[])
  to authenticated, service_role;

create or replace function public.launch_first_workspace(
  p_setup jsonb
)
returns table (
  business_id uuid,
  business_role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_business_id uuid;
  v_business_name text := btrim(coalesce(p_setup ->> 'business_name', ''));
  v_business_type text := lower(btrim(coalesce(p_setup ->> 'business_type', 'other')));
  v_timezone text := btrim(coalesce(p_setup ->> 'timezone', 'UTC'));
  v_locale text := lower(btrim(coalesce(p_setup ->> 'locale', 'en')));
  v_currency text := upper(btrim(coalesce(p_setup ->> 'currency', 'EUR')));
  v_country_code text := upper(btrim(coalesce(p_setup ->> 'country_code', '')));
  v_email text := lower(btrim(coalesce(p_setup ->> 'email', '')));
  v_phone text := btrim(coalesce(p_setup ->> 'phone', ''));
  v_address text := btrim(coalesce(p_setup ->> 'address', ''));
  v_service_title text := btrim(coalesce(p_setup ->> 'service_title', ''));
  v_service_kind text := lower(btrim(coalesce(p_setup ->> 'service_kind', 'appointment')));
  v_pricing_model text := lower(btrim(coalesce(p_setup ->> 'pricing_model', 'fixed')));
  v_price_minor integer;
  v_duration_minutes integer;
  v_service_capacity integer;
  v_resource_name text := btrim(coalesce(p_setup ->> 'resource_name', ''));
  v_resource_kind text := lower(btrim(coalesce(p_setup ->> 'resource_kind', 'other')));
  v_resource_capacity integer;
  v_open_time time;
  v_close_time time;
  v_work_days smallint[];
  v_requested_modules text[];
  v_service_id uuid;
  v_resource_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_setup, '{}'::jsonb)) <> 'object' then
    raise exception 'launch_setup_invalid' using errcode = '22023';
  end if;

  if v_business_type not in (
    'photo_studio', 'beauty_salon', 'school', 'venue',
    'creative_service', 'other'
  ) then
    raise exception 'business_type_invalid' using errcode = '22023';
  end if;

  if v_country_code !~ '^[A-Z]{2}$' then
    raise exception 'country_code_invalid' using errcode = '22023';
  end if;

  if v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'business_email_invalid' using errcode = '22023';
  end if;

  if char_length(v_phone) > 40 or char_length(v_address) > 500 then
    raise exception 'business_contacts_invalid' using errcode = '22023';
  end if;

  if char_length(v_service_title) < 1 or char_length(v_service_title) > 160 then
    raise exception 'service_title_invalid' using errcode = '22023';
  end if;

  if v_service_kind not in (
    'appointment', 'rental', 'class', 'event', 'membership', 'other'
  ) then
    raise exception 'service_kind_invalid' using errcode = '22023';
  end if;

  if v_pricing_model not in ('fixed', 'per_hour', 'per_person', 'free', 'quote') then
    raise exception 'pricing_model_invalid' using errcode = '22023';
  end if;

  begin
    v_price_minor := coalesce((p_setup ->> 'price_minor')::integer, 0);
    v_duration_minutes := (p_setup ->> 'duration_minutes')::integer;
    v_service_capacity := (p_setup ->> 'service_capacity')::integer;
    v_resource_capacity := (p_setup ->> 'resource_capacity')::integer;
    v_open_time := (p_setup ->> 'open_time')::time;
    v_close_time := (p_setup ->> 'close_time')::time;
  exception when others then
    raise exception 'launch_numbers_invalid' using errcode = '22023';
  end;

  if v_price_minor < 0
    or (v_pricing_model not in ('free', 'quote') and v_price_minor is null)
  then
    raise exception 'service_price_invalid' using errcode = '22023';
  end if;

  if v_duration_minutes < 15 or v_duration_minutes > 1440
    or v_service_capacity < 1 or v_service_capacity > 100000
  then
    raise exception 'service_configuration_invalid' using errcode = '22023';
  end if;

  if char_length(v_resource_name) < 1 or char_length(v_resource_name) > 160 then
    raise exception 'resource_name_invalid' using errcode = '22023';
  end if;

  if v_resource_kind not in ('staff', 'space', 'equipment', 'seat', 'asset', 'other')
    or v_resource_capacity < 1 or v_resource_capacity > 100000
  then
    raise exception 'resource_configuration_invalid' using errcode = '22023';
  end if;

  if v_open_time >= v_close_time then
    raise exception 'working_hours_invalid' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_setup -> 'work_days', '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_setup -> 'work_days', '[]'::jsonb)) = 0
  then
    raise exception 'work_days_invalid' using errcode = '22023';
  end if;

  begin
    select array_agg(distinct day_value::smallint order by day_value::smallint)
    into v_work_days
    from jsonb_array_elements_text(p_setup -> 'work_days') days(day_value);
  exception when others then
    raise exception 'work_days_invalid' using errcode = '22023';
  end;

  if exists (
    select 1 from unnest(v_work_days) day_value where day_value not between 0 and 6
  ) then
    raise exception 'work_days_invalid' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_setup -> 'enabled_modules', '[]'::jsonb)) <> 'array' then
    raise exception 'enabled_modules_invalid' using errcode = '22023';
  end if;

  select coalesce(array_agg(distinct module_key order by module_key), '{}'::text[])
  into v_requested_modules
  from jsonb_array_elements_text(
    coalesce(p_setup -> 'enabled_modules', '[]'::jsonb)
  ) modules(module_key);

  select bootstrap.business_id
  into v_business_id
  from public.bootstrap_first_workspace(
    v_business_name,
    v_timezone,
    v_locale,
    v_currency
  ) bootstrap;

  insert into public.company_profiles (
    business_id,
    display_name,
    legal_name,
    email,
    support_email,
    phone,
    country_code,
    default_currency,
    timezone,
    address
  )
  values (
    v_business_id,
    v_business_name,
    v_business_name,
    v_email,
    v_email,
    v_phone,
    v_country_code,
    v_currency,
    v_timezone,
    v_address
  )
  on conflict on constraint company_profiles_pkey do update set
    display_name = excluded.display_name,
    legal_name = excluded.legal_name,
    email = excluded.email,
    support_email = excluded.support_email,
    phone = excluded.phone,
    country_code = excluded.country_code,
    default_currency = excluded.default_currency,
    timezone = excluded.timezone,
    address = excluded.address,
    updated_at = now();

  insert into public.services (
    business_id,
    slug,
    kind,
    title,
    pricing_model,
    price_minor,
    currency,
    duration_min_minutes,
    duration_max_minutes,
    duration_step_minutes,
    capacity,
    is_public,
    is_active
  )
  values (
    v_business_id,
    'launch-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
    v_service_kind,
    v_service_title,
    v_pricing_model,
    case when v_pricing_model in ('free', 'quote') then null else v_price_minor end,
    v_currency,
    v_duration_minutes,
    v_duration_minutes,
    greatest(15, least(v_duration_minutes, 60)),
    v_service_capacity,
    true,
    true
  )
  returning id into v_service_id;

  insert into public.resources (
    business_id,
    slug,
    kind,
    name,
    capacity,
    timezone,
    is_bookable,
    is_public,
    is_active
  )
  values (
    v_business_id,
    'launch-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
    v_resource_kind,
    v_resource_name,
    v_resource_capacity,
    v_timezone,
    true,
    true,
    true
  )
  returning id into v_resource_id;

  insert into public.service_resources (
    business_id,
    service_id,
    resource_id,
    allocation_mode,
    quantity
  )
  values (
    v_business_id,
    v_service_id,
    v_resource_id,
    'required',
    1
  );

  insert into public.availability_rules (
    business_id,
    resource_id,
    day_of_week,
    start_time,
    end_time,
    is_active
  )
  select
    v_business_id,
    v_resource_id,
    day_value,
    v_open_time,
    v_close_time,
    true
  from unnest(v_work_days) day_value;

  perform public.configure_business_modules(
    v_business_id,
    v_requested_modules
  );

  update public.business_launch_profiles launch
  set business_type = v_business_type,
      first_service_id = v_service_id,
      first_resource_id = v_resource_id,
      completed_at = now(),
      completed_by = v_user_id,
      updated_at = now()
  where launch.business_id = v_business_id;

  return query select v_business_id, 'owner'::text;
end;
$$;

revoke all on function public.launch_first_workspace(jsonb)
  from public, anon, authenticated;
grant execute on function public.launch_first_workspace(jsonb)
  to authenticated, service_role;

comment on table public.business_launch_profiles is
  'Workspace-scoped audit record for the completed client launch wizard and its initial module selection.';
comment on function public.configure_business_modules(uuid, text[]) is
  'Applies an owner-managed module selection while automatically preserving required module dependencies.';
comment on function public.launch_first_workspace(jsonb) is
  'Atomically creates the first client-ready workspace, company profile, offer, resource, weekly availability and module selection.';
