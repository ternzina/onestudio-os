-- OneStudio OS Admin Access & Bootstrap 1.0
-- Creates the first owner safely, exposes a deterministic admin access state,
-- and keeps the existing legacy admin role limited to the first installation owner.

create table if not exists public.system_installation (
  id smallint primary key default 1 check (id = 1),
  bootstrapped_at timestamptz,
  owner_user_id uuid references auth.users(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.system_installation (id)
values (1)
on conflict (id) do nothing;

-- Preserve an already configured installation when this layer is added later.
with existing_owner as (
  select m.user_id, m.business_id
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.is_active = true
    and m.role in ('owner', 'admin')
    and b.status <> 'archived'
  order by
    case m.role when 'owner' then 1 else 2 end,
    m.created_at,
    m.id
  limit 1
)
update public.system_installation installation
set bootstrapped_at = coalesce(installation.bootstrapped_at, now()),
    owner_user_id = coalesce(installation.owner_user_id, existing_owner.user_id),
    business_id = coalesce(installation.business_id, existing_owner.business_id),
    updated_at = now()
from existing_owner
where installation.id = 1
  and installation.bootstrapped_at is null;

alter table public.system_installation enable row level security;
revoke all on table public.system_installation from anon, authenticated;
grant all on table public.system_installation to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    phone,
    email,
    avatar_url,
    role
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1),
      'User'
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'phone', ''),
      nullif(new.phone, ''),
      ''
    ),
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', '')
    ),
    'client'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    avatar_url = coalesce(nullif(public.profiles.avatar_url, ''), excluded.avatar_url);

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.admin_bootstrap_available()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select installation.bootstrapped_at is null
     from public.system_installation installation
     where installation.id = 1),
    false
  );
$$;

create or replace function public.get_admin_access_state()
returns table (
  access_state text,
  business_id uuid,
  business_role text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return query select 'signed_out'::text, null::uuid, null::text;
    return;
  end if;

  return query
  select
    'ready'::text,
    m.business_id,
    m.role
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.user_id = v_user_id
    and m.is_active = true
    and b.status <> 'archived'
  order by
    m.is_default desc,
    case m.role
      when 'owner' then 1
      when 'admin' then 2
      when 'manager' then 3
      when 'staff' then 4
      else 5
    end,
    m.created_at,
    m.id
  limit 1;

  if found then
    return;
  end if;

  if public.admin_bootstrap_available() then
    return query select 'bootstrap_required'::text, null::uuid, null::text;
  else
    return query select 'denied'::text, null::uuid, null::text;
  end if;
end;
$$;

create or replace function public.bootstrap_first_workspace(
  p_name text,
  p_timezone text default 'UTC',
  p_locale text default 'en',
  p_currency text default 'EUR'
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
  v_business_id constant uuid := '00000000-0000-4000-8000-000000000001';
  v_name text := btrim(coalesce(p_name, ''));
  v_timezone text := btrim(coalesce(p_timezone, 'UTC'));
  v_locale text := lower(btrim(coalesce(p_locale, 'en')));
  v_currency text := upper(btrim(coalesce(p_currency, 'EUR')));
  v_email text;
  v_display_name text;
  v_claimed boolean := false;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'workspace_name_invalid' using errcode = '22023';
  end if;

  if v_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'workspace_locale_invalid' using errcode = '22023';
  end if;

  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'workspace_currency_invalid' using errcode = '22023';
  end if;

  if not exists (
    select 1 from pg_timezone_names where name = v_timezone
  ) then
    raise exception 'workspace_timezone_invalid' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.business_members m
    where m.user_id = v_user_id
      and m.is_active = true
  ) then
    raise exception 'account_already_has_workspace' using errcode = '23505';
  end if;

  update public.system_installation installation
  set bootstrapped_at = now(),
      owner_user_id = v_user_id,
      business_id = v_business_id,
      updated_at = now()
  where installation.id = 1
    and installation.bootstrapped_at is null
  returning true into v_claimed;

  if not coalesce(v_claimed, false) then
    raise exception 'bootstrap_already_completed' using errcode = '42501';
  end if;

  select
    u.email,
    coalesce(
      nullif(u.raw_user_meta_data->>'full_name', ''),
      nullif(u.raw_user_meta_data->>'name', ''),
      split_part(u.email, '@', 1),
      'Owner'
    )
  into v_email, v_display_name
  from auth.users u
  where u.id = v_user_id;

  if v_email is null then
    raise exception 'authenticated_user_not_found' using errcode = '23503';
  end if;

  insert into public.profiles (id, name, email, role)
  values (v_user_id, v_display_name, v_email, 'admin')
  on conflict (id) do update set
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    email = excluded.email,
    role = 'admin';

  insert into public.businesses (
    id,
    slug,
    name,
    timezone,
    default_locale,
    default_currency,
    status
  )
  values (
    v_business_id,
    'main',
    v_name,
    v_timezone,
    v_locale,
    v_currency,
    'active'
  )
  on conflict (id) do update set
    name = excluded.name,
    timezone = excluded.timezone,
    default_locale = excluded.default_locale,
    default_currency = excluded.default_currency,
    status = 'active',
    updated_at = now();

  update public.business_members
  set is_default = false,
      updated_at = now()
  where user_id = v_user_id
    and is_default = true;

  insert into public.business_members (
    business_id,
    user_id,
    role,
    is_active,
    is_default
  )
  values (
    v_business_id,
    v_user_id,
    'owner',
    true,
    true
  )
  on conflict on constraint business_members_business_id_user_id_key do update set
    role = 'owner',
    is_active = true,
    is_default = true,
    updated_at = now();

  return query select v_business_id, 'owner'::text;
end;
$$;

-- Clear both inherited PUBLIC privileges and any direct grants left by older layers.
revoke all on function public.admin_bootstrap_available() from public, anon, authenticated;
revoke all on function public.get_admin_access_state() from public, anon, authenticated;
revoke all on function public.bootstrap_first_workspace(text, text, text, text) from public, anon, authenticated;

grant execute on function public.admin_bootstrap_available() to anon, authenticated, service_role;
grant execute on function public.get_admin_access_state() to authenticated, service_role;
grant execute on function public.bootstrap_first_workspace(text, text, text, text) to authenticated, service_role;
