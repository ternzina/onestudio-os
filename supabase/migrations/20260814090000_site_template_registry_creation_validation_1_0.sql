-- OneStudio OS: registry-driven template creation validation 1.0
-- Keeps template support data-driven while requiring every submitted seed to identify
-- the same canonical, active, customer-creatable template.

create table if not exists public.site_template_registry (
  template_key text primary key,
  seed_template_id text not null unique,
  legacy_demo_slug text not null,
  is_customer_creatable boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_template_registry_key_format check (template_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint site_template_registry_seed_matches_key check (seed_template_id = template_key)
);

revoke all on table public.site_template_registry from public, anon, authenticated;
grant select on table public.site_template_registry to service_role;

insert into public.site_template_registry (
  template_key, seed_template_id, legacy_demo_slug, is_customer_creatable, is_active
)
values
  ('standard', 'standard', 'lumiere', true, true),
  ('gloss-nail-studio', 'gloss-nail-studio', 'lumiere', true, true),
  ('premium-kids-center', 'premium-kids-center', 'little-orbit', true, true),
  ('premium-studio', 'premium-studio', 'frame-house', true, true),
  ('velora-event-venue', 'velora-event-venue', 'lumiere', true, true),
  ('lumea-beauty', 'lumea-beauty', 'lumiere', true, true)
on conflict (template_key) do update set
  seed_template_id = excluded.seed_template_id,
  legacy_demo_slug = excluded.legacy_demo_slug,
  is_customer_creatable = excluded.is_customer_creatable,
  is_active = excluded.is_active,
  updated_at = now();

create or replace function public.is_registered_site_template(
  p_template_key text,
  p_seed_template_id text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.site_template_registry as registry
    where registry.template_key = lower(btrim(coalesce(p_template_key, '')))
      and registry.seed_template_id = lower(btrim(coalesce(p_seed_template_id, '')))
      and registry.is_customer_creatable = true
      and registry.is_active = true
  );
$$;

revoke all on function public.is_registered_site_template(text, text) from public, anon, authenticated;
grant execute on function public.is_registered_site_template(text, text) to service_role;

create or replace function public.create_template_workspace(p_request jsonb)
returns table (business_id uuid, business_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_launch_key uuid;
  v_existing_business_id uuid;
  v_existing_slug text;
  v_mode text := lower(btrim(coalesce(p_request ->> 'creation_mode', '')));
  v_template text := lower(btrim(coalesce(p_request ->> 'template_key', '')));
  v_legacy_demo text;
  v_result record;
  v_name text := btrim(coalesce(p_request ->> 'business_name', ''));
  v_business_type text := lower(btrim(coalesce(p_request ->> 'business_type', 'other')));
  v_timezone text := btrim(coalesce(p_request ->> 'timezone', 'UTC'));
  v_locale text := lower(btrim(coalesce(p_request ->> 'locale', 'ru')));
  v_currency text := upper(btrim(coalesce(p_request ->> 'currency', 'EUR')));
  v_country_code text := upper(btrim(coalesce(p_request ->> 'country_code', '')));
  v_email text := lower(btrim(coalesce(p_request ->> 'email', '')));
  v_phone text := btrim(coalesce(p_request ->> 'phone', ''));
  v_address text := btrim(coalesce(p_request ->> 'address', ''));
  v_service_title text := btrim(coalesce(p_request ->> 'service_title', ''));
  v_service_kind text := lower(btrim(coalesce(p_request ->> 'service_kind', 'appointment')));
  v_pricing_model text := lower(btrim(coalesce(p_request ->> 'pricing_model', 'fixed')));
  v_resource_name text := btrim(coalesce(p_request ->> 'resource_name', ''));
  v_resource_kind text := lower(btrim(coalesce(p_request ->> 'resource_kind', 'other')));
  v_price_minor integer;
  v_duration_minutes integer;
  v_service_capacity integer;
  v_resource_capacity integer;
  v_open_time time;
  v_close_time time;
  v_work_days smallint[];
  v_requested_modules text[];
  v_service_id uuid;
  v_resource_id uuid;
  v_seed jsonb;
  v_locale_seeds jsonb;
begin
  if v_user_id is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if jsonb_typeof(coalesce(p_request, '{}'::jsonb)) <> 'object' then raise exception 'creation_request_invalid' using errcode = '22023'; end if;

  begin
    v_launch_key := nullif(btrim(coalesce(p_request ->> 'launch_id', '')), '')::uuid;
  exception when invalid_text_representation then
    raise exception 'launch_id_invalid' using errcode = '22023';
  end;
  if v_launch_key is null then raise exception 'launch_id_required' using errcode = '22023'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || v_launch_key::text, 0));

  select launch_profile.business_id, existing_business.slug
  into v_existing_business_id, v_existing_slug
  from public.business_launch_profiles as launch_profile
  join public.business_members as existing_member
    on existing_member.business_id = launch_profile.business_id
   and existing_member.user_id = v_user_id
   and existing_member.is_active = true
  join public.businesses as existing_business
    on existing_business.id = launch_profile.business_id
   and existing_business.status <> 'archived'
  where launch_profile.launch_key = v_launch_key
  limit 1;

  if v_existing_business_id is not null then
    perform public.set_default_business(v_existing_business_id);
    return query select v_existing_business_id, v_existing_slug;
    return;
  end if;

  if v_mode not in ('blank', 'template') then raise exception 'creation_mode_invalid' using errcode = '22023'; end if;
  if v_mode = 'blank' then v_template := 'standard'; end if;
  if not public.is_registered_site_template(v_template, p_request -> 'template_seed' ->> 'template_id') then raise exception 'template_key_invalid' using errcode = '22023'; end if;
  if v_mode = 'blank' and v_template <> 'standard' then raise exception 'blank_template_invalid' using errcode = '22023'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 120 then raise exception 'workspace_name_invalid' using errcode = '22023'; end if;
  if v_business_type not in ('photo_studio', 'beauty_salon', 'school', 'venue', 'creative_service', 'other') then raise exception 'business_type_invalid' using errcode = '22023'; end if;
  if not exists (select 1 from pg_timezone_names as timezone_name where timezone_name.name = v_timezone) then raise exception 'workspace_timezone_invalid' using errcode = '22023'; end if;
  if v_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then raise exception 'workspace_locale_invalid' using errcode = '22023'; end if;
  if v_currency !~ '^[A-Z]{3}$' then raise exception 'workspace_currency_invalid' using errcode = '22023'; end if;
  if v_country_code !~ '^[A-Z]{2}$' then raise exception 'country_code_invalid' using errcode = '22023'; end if;
  if v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'business_email_invalid' using errcode = '22023'; end if;
  if char_length(v_phone) > 40 or char_length(v_address) > 500 then raise exception 'business_contacts_invalid' using errcode = '22023'; end if;
  if char_length(v_service_title) < 1 or char_length(v_service_title) > 160 then raise exception 'service_title_invalid' using errcode = '22023'; end if;
  if v_service_kind not in ('appointment', 'rental', 'class', 'event', 'membership', 'other') then raise exception 'service_kind_invalid' using errcode = '22023'; end if;
  if v_pricing_model not in ('fixed', 'per_hour', 'per_person', 'free', 'quote') then raise exception 'pricing_model_invalid' using errcode = '22023'; end if;
  if char_length(v_resource_name) < 1 or char_length(v_resource_name) > 160 then raise exception 'resource_name_invalid' using errcode = '22023'; end if;
  if v_resource_kind not in ('staff', 'space', 'equipment', 'seat', 'asset', 'other') then raise exception 'resource_kind_invalid' using errcode = '22023'; end if;

  begin
    v_price_minor := coalesce((p_request ->> 'price_minor')::integer, 0);
    v_duration_minutes := (p_request ->> 'duration_minutes')::integer;
    v_service_capacity := (p_request ->> 'service_capacity')::integer;
    v_resource_capacity := (p_request ->> 'resource_capacity')::integer;
    v_open_time := (p_request ->> 'open_time')::time;
    v_close_time := (p_request ->> 'close_time')::time;
  exception when others then raise exception 'launch_numbers_invalid' using errcode = '22023';
  end;
  if v_price_minor < 0 then raise exception 'service_price_invalid' using errcode = '22023'; end if;
  if v_duration_minutes not between 15 and 1440 or v_service_capacity not between 1 and 100000 or v_resource_capacity not between 1 and 100000 then raise exception 'service_configuration_invalid' using errcode = '22023'; end if;
  if v_open_time >= v_close_time then raise exception 'working_hours_invalid' using errcode = '22023'; end if;
  if jsonb_typeof(coalesce(p_request -> 'work_days', '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_request -> 'work_days', '[]'::jsonb)) = 0 then raise exception 'work_days_invalid' using errcode = '22023'; end if;
  begin
    select array_agg(distinct requested_day.day_value::smallint order by requested_day.day_value::smallint)
    into v_work_days
    from jsonb_array_elements_text(p_request -> 'work_days') as requested_day(day_value);
  exception when others then raise exception 'work_days_invalid' using errcode = '22023';
  end;
  if exists (select 1 from unnest(v_work_days) as work_day(day_value) where work_day.day_value not between 0 and 6) then raise exception 'work_days_invalid' using errcode = '22023'; end if;
  if jsonb_typeof(coalesce(p_request -> 'enabled_modules', '[]'::jsonb)) <> 'array' then raise exception 'enabled_modules_invalid' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct requested_module.module_key order by requested_module.module_key), '{}'::text[])
  into v_requested_modules
  from jsonb_array_elements_text(coalesce(p_request -> 'enabled_modules', '[]'::jsonb)) as requested_module(module_key);
  if jsonb_typeof(coalesce(p_request -> 'template_seeds', '{}'::jsonb)) <> 'object' then raise exception 'template_seeds_invalid' using errcode = '22023'; end if;
  v_locale_seeds := coalesce(p_request -> 'template_seeds', '{}'::jsonb);
  if exists (
    select 1
    from jsonb_each(v_locale_seeds) as locale_seed(locale, seed)
    where jsonb_typeof(locale_seed.seed) <> 'object'
       or not public.is_registered_site_template(v_template, locale_seed.seed ->> 'template_id')
  ) then raise exception 'template_seeds_invalid' using errcode = '22023'; end if;

  select registry.legacy_demo_slug into v_legacy_demo
  from public.site_template_registry as registry
  where registry.template_key = v_template
    and registry.is_customer_creatable = true
    and registry.is_active = true;
  select created.business_id, created.business_slug into v_result
  from public.create_configured_workspace(jsonb_build_object(
    'launch_id', v_launch_key, 'business_name', v_name, 'demo_slug', v_legacy_demo, 'tagline', '', 'palette_index', 0,
    'locales', coalesce(p_request -> 'locales', jsonb_build_array(v_locale, case when v_locale = 'ru' then 'en' else 'ru' end)),
    'primary_locale', v_locale, 'currency', v_currency, 'enabled_modules', coalesce(p_request -> 'enabled_modules', '[]'::jsonb)
  )) as created;

  update public.businesses as created_business
  set timezone = v_timezone, default_locale = v_locale, default_currency = v_currency, updated_at = now()
  where created_business.id = v_result.business_id;

  update public.system_installation as installation
  set bootstrapped_at = coalesce(installation.bootstrapped_at, now()),
      owner_user_id = coalesce(installation.owner_user_id, v_user_id),
      business_id = coalesce(installation.business_id, v_result.business_id),
      updated_at = now()
  where installation.id = 1 and installation.bootstrapped_at is null;

  insert into public.company_profiles (business_id, display_name, legal_name, email, support_email, phone, country_code, default_currency, timezone, address)
  values (v_result.business_id, v_name, v_name, v_email, v_email, v_phone, v_country_code, v_currency, v_timezone, v_address)
  on conflict on constraint company_profiles_pkey do update set
    display_name = excluded.display_name, legal_name = excluded.legal_name, email = excluded.email,
    support_email = excluded.support_email, phone = excluded.phone, country_code = excluded.country_code,
    default_currency = excluded.default_currency, timezone = excluded.timezone, address = excluded.address, updated_at = now();

  delete from public.availability_rules as starter_rule where starter_rule.business_id = v_result.business_id;
  delete from public.service_resources as starter_link where starter_link.business_id = v_result.business_id;
  delete from public.services as starter_service where starter_service.business_id = v_result.business_id;
  delete from public.resources as starter_resource where starter_resource.business_id = v_result.business_id;

  insert into public.services (business_id, slug, kind, title, pricing_model, price_minor, currency, duration_min_minutes, duration_max_minutes, duration_step_minutes, capacity, is_public, is_active)
  values (v_result.business_id, 'launch-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12), v_service_kind, v_service_title, v_pricing_model,
    case when v_pricing_model in ('free', 'quote') then null else v_price_minor end, v_currency, v_duration_minutes, v_duration_minutes,
    greatest(15, least(v_duration_minutes, 60)), v_service_capacity, true, true)
  returning id into v_service_id;

  insert into public.resources (business_id, slug, kind, name, capacity, timezone, is_bookable, is_public, is_active)
  values (v_result.business_id, 'launch-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12), v_resource_kind, v_resource_name, v_resource_capacity, v_timezone, true, true, true)
  returning id into v_resource_id;

  insert into public.service_resources (business_id, service_id, resource_id, allocation_mode, quantity)
  values (v_result.business_id, v_service_id, v_resource_id, 'required', 1);
  insert into public.availability_rules (business_id, resource_id, day_of_week, start_time, end_time, is_active)
  select v_result.business_id, v_resource_id, work_day.day_value, v_open_time, v_close_time, true
  from unnest(v_work_days) as work_day(day_value);

  perform public.configure_business_modules(v_result.business_id, v_requested_modules);
  update public.business_launch_profiles as launch_profile
  set business_type = v_business_type, first_service_id = v_service_id, first_resource_id = v_resource_id,
      completed_at = now(), completed_by = v_user_id, updated_at = now()
  where launch_profile.business_id = v_result.business_id;

  v_seed := coalesce(p_request -> 'template_seed', '{}'::jsonb) || jsonb_build_object(
    'template_id', v_template, 'brand_name', coalesce(nullif(p_request -> 'template_seed' ->> 'brand_name', ''), v_name),
    'hero_title', coalesce(nullif(p_request -> 'template_seed' ->> 'hero_title', ''), v_name),
    'seo_title', coalesce(nullif(p_request -> 'template_seed' ->> 'seo_title', ''), v_name)
  );
  update public.public_site_locales as site_locale
  set draft_content = coalesce(v_locale_seeds -> site_locale.locale, v_seed)
        || jsonb_build_object('template_id', v_template),
      published_content = null,
      published_at = null,
      updated_at = now()
  where site_locale.business_id = v_result.business_id;
  update public.public_site_settings as site_setting
  set primary_locale = v_locale, is_published = false, published_at = null, updated_at = now()
  where site_setting.business_id = v_result.business_id;

  return query select v_result.business_id, v_result.business_slug;
end;
$$;

revoke all on function public.create_template_workspace(jsonb) from public, anon, authenticated;
grant execute on function public.create_template_workspace(jsonb) to authenticated, service_role;
comment on function public.create_template_workspace(jsonb) is
  'Canonical idempotent and atomic customer creation contract with registry-driven template and locale-seed validation.';
