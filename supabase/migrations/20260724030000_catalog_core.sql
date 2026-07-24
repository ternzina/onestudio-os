-- OneStudio OS Catalog Core 1.0
-- Activates the canonical service and resource catalog without touching booking flows.

create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null check (kind in ('service', 'resource')),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text not null default '',
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, kind, slug),
  unique (id, business_id)
);

alter table public.services
  add column if not exists category_id uuid;

alter table public.resources
  add column if not exists category_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'services_category_id_fkey'
  ) then
    alter table public.services
      add constraint services_category_id_fkey
      foreign key (category_id) references public.catalog_categories(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'resources_category_id_fkey'
  ) then
    alter table public.resources
      add constraint resources_category_id_fkey
      foreign key (category_id) references public.catalog_categories(id) on delete set null;
  end if;
end;
$$;

create index if not exists catalog_categories_business_kind_active_idx
  on public.catalog_categories (business_id, kind, is_active, sort_order, name);
create index if not exists services_business_category_active_idx
  on public.services (business_id, category_id, is_active, sort_order, title);
create index if not exists resources_business_category_active_idx
  on public.resources (business_id, category_id, is_active, sort_order, name);

create or replace function public.guard_catalog_category_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.business_id is distinct from old.business_id then
    raise exception 'catalog_category_business_is_immutable' using errcode = '23514';
  end if;

  if new.kind is distinct from old.kind then
    raise exception 'catalog_category_kind_is_immutable' using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.guard_catalog_item_category()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_category_business_id uuid;
  v_category_kind text;
begin
  if new.category_id is null then
    return new;
  end if;

  select category.business_id, category.kind
  into v_category_business_id, v_category_kind
  from public.catalog_categories category
  where category.id = new.category_id;

  if not found then
    raise exception 'catalog_category_not_found' using errcode = '23503';
  end if;

  if v_category_business_id <> new.business_id then
    raise exception 'catalog_category_workspace_mismatch' using errcode = '23503';
  end if;

  if v_category_kind <> tg_argv[0] then
    raise exception 'catalog_category_kind_mismatch' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_catalog_category_identity() from public, anon, authenticated;
revoke all on function public.guard_catalog_item_category() from public, anon, authenticated;

drop trigger if exists set_catalog_categories_updated_at on public.catalog_categories;
create trigger set_catalog_categories_updated_at
before update on public.catalog_categories
for each row execute function public.set_updated_at();

drop trigger if exists guard_catalog_category_identity on public.catalog_categories;
create trigger guard_catalog_category_identity
before update of business_id, kind on public.catalog_categories
for each row execute function public.guard_catalog_category_identity();

drop trigger if exists guard_service_category on public.services;
create trigger guard_service_category
before insert or update of business_id, category_id on public.services
for each row execute function public.guard_catalog_item_category('service');

drop trigger if exists guard_resource_category on public.resources;
create trigger guard_resource_category
before insert or update of business_id, category_id on public.resources
for each row execute function public.guard_catalog_item_category('resource');

create or replace function public.replace_service_resources(
  p_service_id uuid,
  p_resource_ids uuid[] default '{}'::uuid[]
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
  select service.business_id
  into v_business_id
  from public.services service
  where service.id = p_service_id;

  if v_business_id is null or not public.can_configure_business(v_business_id) then
    raise exception 'catalog_configuration_forbidden' using errcode = '42501';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_resource_ids, '{}'::uuid[])) requested(resource_id)
    left join public.resources resource
      on resource.id = requested.resource_id
     and resource.business_id = v_business_id
    where resource.id is null
  ) then
    raise exception 'catalog_resource_workspace_mismatch' using errcode = '23503';
  end if;

  delete from public.service_resources link
  where link.service_id = p_service_id
    and link.business_id = v_business_id;

  insert into public.service_resources (
    business_id,
    service_id,
    resource_id,
    allocation_mode,
    quantity,
    sort_order
  )
  select
    v_business_id,
    p_service_id,
    requested.resource_id,
    'required',
    1,
    row_number() over (order by requested.resource_id)::integer
  from (
    select distinct resource_id
    from unnest(coalesce(p_resource_ids, '{}'::uuid[])) resource_ids(resource_id)
  ) requested;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

revoke all on function public.replace_service_resources(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.replace_service_resources(uuid, uuid[]) to authenticated, service_role;

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
    (new.id, 'scheduling', false, '1.0.0'),
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

drop trigger if exists seed_business_modules_after_insert on public.businesses;
create trigger seed_business_modules_after_insert
after insert on public.businesses
for each row execute function public.seed_business_modules();

insert into public.business_modules (business_id, module_key, enabled, version)
select business.id, defaults.module_key, defaults.enabled, defaults.version
from public.businesses business
cross join (values
  ('core', true, '1.1.0'),
  ('media', true, '1.0.0'),
  ('portfolio', true, '1.0.0'),
  ('catalog', true, '1.0.0'),
  ('scheduling', false, '1.0.0'),
  ('crm', false, '1.0.0'),
  ('payments', false, '0.0.0'),
  ('notifications', false, '0.0.0'),
  ('analytics', false, '0.0.0')
) as defaults(module_key, enabled, version)
on conflict (business_id, module_key) do nothing;

insert into public.business_modules (business_id, module_key, enabled, version)
select business.id, 'catalog', true, '1.0.0'
from public.businesses business
on conflict (business_id, module_key) do update set
  enabled = true,
  version = '1.0.0',
  updated_at = now();

alter table public.catalog_categories enable row level security;

drop policy if exists "Public reads active catalog categories" on public.catalog_categories;
drop policy if exists "Managers configure catalog categories" on public.catalog_categories;

create policy "Public reads active catalog categories" on public.catalog_categories
for select to anon, authenticated
using ((is_active and is_public) or public.can_view_business(business_id));

create policy "Managers configure catalog categories" on public.catalog_categories
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

revoke all on table public.catalog_categories from anon, authenticated;
grant select on table public.catalog_categories to anon, authenticated;
grant insert, update, delete on table public.catalog_categories to authenticated;
grant all on table public.catalog_categories to service_role;

comment on table public.catalog_categories is
  'Workspace-scoped presentation groups for canonical services and resources.';
comment on column public.services.category_id is
  'Optional service category. The database enforces the same workspace and service scope.';
comment on column public.resources.category_id is
  'Optional resource category. The database enforces the same workspace and resource scope.';
comment on function public.replace_service_resources(uuid, uuid[]) is
  'Atomically replaces the required resources assigned to one service after workspace permission checks.';
