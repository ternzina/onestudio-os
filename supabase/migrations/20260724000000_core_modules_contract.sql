-- OneStudio OS Core Modules Contract 1.0
-- Canonical business, catalog, CRM and scheduling primitives.
-- This migration is additive: legacy booking tables remain available only as a compatibility layer.

create extension if not exists btree_gist with schema extensions;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 2 and 120),
  timezone text not null default 'UTC' check (char_length(timezone) between 1 and 80),
  default_locale text not null default 'en' check (default_locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  default_currency text not null default 'EUR' check (default_currency ~ '^[A-Z]{3}$'),
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'admin', 'staff', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  email text,
  phone text,
  locale text not null default 'en' check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  notes text not null default '',
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  check (phone is null or char_length(trim(phone)) between 5 and 40),
  unique (id, business_id)
);

create unique index if not exists clients_business_email_unique
  on public.clients (business_id, lower(email)) where email is not null;
create unique index if not exists clients_business_auth_user_unique
  on public.clients (business_id, auth_user_id) where auth_user_id is not null;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  kind text not null default 'appointment'
    check (kind in ('appointment', 'rental', 'class', 'event', 'membership', 'other')),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '',
  pricing_model text not null default 'fixed'
    check (pricing_model in ('fixed', 'per_hour', 'per_person', 'free', 'quote')),
  price_minor integer check (price_minor is null or price_minor >= 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  duration_min_minutes integer check (duration_min_minutes is null or duration_min_minutes > 0),
  duration_max_minutes integer check (duration_max_minutes is null or duration_max_minutes > 0),
  duration_step_minutes integer check (duration_step_minutes is null or duration_step_minutes > 0),
  buffer_before_minutes integer not null default 0 check (buffer_before_minutes between 0 and 1440),
  buffer_after_minutes integer not null default 0 check (buffer_after_minutes between 0 and 1440),
  capacity integer not null default 1 check (capacity between 1 and 100000),
  requires_confirmation boolean not null default false,
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, slug),
  unique (id, business_id),
  check (duration_max_minutes is null or duration_min_minutes is null or duration_max_minutes >= duration_min_minutes),
  check (pricing_model in ('free', 'quote') or price_minor is not null)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  kind text not null default 'other'
    check (kind in ('staff', 'space', 'equipment', 'seat', 'asset', 'other')),
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text not null default '',
  capacity integer not null default 1 check (capacity between 1 and 100000),
  timezone text check (timezone is null or char_length(timezone) between 1 and 80),
  is_bookable boolean not null default true,
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, slug),
  unique (id, business_id)
);

create table if not exists public.service_resources (
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid not null,
  resource_id uuid not null,
  allocation_mode text not null default 'required'
    check (allocation_mode in ('required', 'optional', 'choice')),
  quantity integer not null default 1 check (quantity between 1 and 100000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (service_id, resource_id),
  foreign key (service_id, business_id) references public.services(id, business_id) on delete cascade,
  foreign key (resource_id, business_id) references public.resources(id, business_id) on delete cascade
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  resource_id uuid not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  effective_from date,
  effective_until date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time),
  check (effective_until is null or effective_from is null or effective_until >= effective_from),
  foreign key (resource_id, business_id) references public.resources(id, business_id) on delete cascade
);

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  resource_id uuid not null,
  kind text not null default 'blocked' check (kind in ('available', 'blocked')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  foreign key (resource_id, business_id) references public.resources(id, business_id) on delete cascade
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  reference text not null default ('BK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  client_id uuid not null,
  service_id uuid not null,
  status text not null default 'pending'
    check (status in ('draft', 'hold', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  source text not null default 'public' check (source in ('public', 'admin', 'import', 'api')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null check (char_length(timezone) between 1 and 80),
  locale text not null default 'en' check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  party_size integer not null default 1 check (party_size between 1 and 100000),
  subtotal_minor integer not null default 0 check (subtotal_minor >= 0),
  discount_minor integer not null default 0 check (discount_minor >= 0),
  total_minor integer not null default 0 check (total_minor >= 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  payment_status text not null default 'not_required'
    check (payment_status in ('not_required', 'pending', 'partially_paid', 'paid', 'refunded', 'failed')),
  customer_notes text not null default '',
  internal_notes text not null default '',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, reference),
  unique (id, business_id),
  foreign key (client_id, business_id) references public.clients(id, business_id) on delete restrict,
  foreign key (service_id, business_id) references public.services(id, business_id) on delete restrict,
  check (starts_at < ends_at),
  check (discount_minor <= subtotal_minor),
  check (total_minor = subtotal_minor - discount_minor)
);

create table if not exists public.booking_allocations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid not null,
  resource_id uuid not null,
  status text not null default 'held' check (status in ('held', 'confirmed', 'released')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  quantity integer not null default 1 check (quantity between 1 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  foreign key (booking_id, business_id) references public.bookings(id, business_id) on delete cascade,
  foreign key (resource_id, business_id) references public.resources(id, business_id) on delete restrict,
  constraint booking_allocations_no_overlap
    exclude using gist (
      resource_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    ) where (status in ('held', 'confirmed'))
);

create table if not exists public.business_modules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  module_key text not null
    check (module_key in ('core', 'media', 'portfolio', 'catalog', 'scheduling', 'crm', 'payments', 'notifications', 'analytics')),
  enabled boolean not null default false,
  version text not null default '0.0.0' check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, module_key)
);

create index if not exists business_members_user_idx on public.business_members(user_id);
create index if not exists clients_business_name_idx on public.clients(business_id, name);
create index if not exists services_business_active_idx on public.services(business_id, is_active, sort_order);
create index if not exists resources_business_active_idx on public.resources(business_id, is_active, sort_order);
create index if not exists availability_rules_resource_day_idx on public.availability_rules(resource_id, day_of_week);
create index if not exists availability_exceptions_resource_start_idx on public.availability_exceptions(resource_id, starts_at);
create index if not exists bookings_business_start_idx on public.bookings(business_id, starts_at);
create index if not exists bookings_client_start_idx on public.bookings(client_id, starts_at desc);
create index if not exists booking_allocations_booking_idx on public.booking_allocations(booking_id);

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency
) values (
  '00000000-0000-4000-8000-000000000001',
  'main',
  'Main workspace',
  'UTC',
  'en',
  'EUR'
) on conflict (id) do nothing;

insert into public.business_members (business_id, user_id, role)
select '00000000-0000-4000-8000-000000000001', p.id, 'owner'
from public.profiles p
where p.role = 'admin'
on conflict (business_id, user_id) do nothing;

insert into public.business_modules (business_id, module_key, enabled, version)
select '00000000-0000-4000-8000-000000000001', module_key, enabled, version
from (values
  ('core', true, '1.0.0'),
  ('media', true, '1.0.0'),
  ('portfolio', true, '1.0.0'),
  ('catalog', false, '1.0.0'),
  ('scheduling', false, '1.0.0'),
  ('crm', false, '1.0.0'),
  ('payments', false, '0.0.0'),
  ('notifications', false, '0.0.0'),
  ('analytics', false, '0.0.0')
) as modules(module_key, enabled, version)
on conflict (business_id, module_key) do update set
  version = excluded.version,
  updated_at = now();

create or replace function public.can_manage_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.is_admin(auth.uid()), false)
    or exists (
      select 1
      from public.business_members m
      where m.business_id = p_business_id
        and m.user_id = auth.uid()
        and m.is_active = true
        and m.role in ('owner', 'admin')
    );
$$;

revoke all on function public.can_manage_business(uuid) from public;
grant execute on function public.can_manage_business(uuid) to anon, authenticated, service_role;

create or replace function public.prepare_booking_allocation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare booking_status text;
begin
  select b.status into booking_status
  from public.bookings b
  where b.id = new.booking_id and b.business_id = new.business_id;

  if booking_status is null then
    raise exception 'booking_allocation_business_mismatch' using errcode = '23503';
  end if;

  if not exists (
    select 1 from public.resources r
    where r.id = new.resource_id and r.business_id = new.business_id
  ) then
    raise exception 'booking_resource_business_mismatch' using errcode = '23503';
  end if;

  new.status := case
    when booking_status = 'hold' then 'held'
    when booking_status in ('pending', 'confirmed') then 'confirmed'
    else 'released'
  end;
  return new;
end;
$$;

create or replace function public.sync_booking_allocation_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.booking_allocations
  set status = case
    when new.status = 'hold' then 'held'
    when new.status in ('pending', 'confirmed') then 'confirmed'
    else 'released'
  end,
  updated_at = now()
  where booking_id = new.id and business_id = new.business_id;
  return new;
end;
$$;

revoke all on function public.prepare_booking_allocation() from public;
revoke all on function public.sync_booking_allocation_status() from public;

-- Reuse the foundation's neutral updated_at trigger function.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'businesses', 'business_members', 'clients', 'services', 'resources',
    'availability_rules', 'availability_exceptions', 'bookings',
    'booking_allocations', 'business_modules'
  ] loop
    execute format('drop trigger if exists %I on public.%I', 'set_' || table_name || '_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'set_' || table_name || '_updated_at', table_name
    );
  end loop;
end;
$$;

drop trigger if exists booking_allocations_prepare on public.booking_allocations;
create trigger booking_allocations_prepare
before insert or update of booking_id, business_id, resource_id on public.booking_allocations
for each row execute function public.prepare_booking_allocation();

drop trigger if exists bookings_sync_allocation_status on public.bookings;
create trigger bookings_sync_allocation_status
after update of status on public.bookings
for each row when (old.status is distinct from new.status)
execute function public.sync_booking_allocation_status();

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.resources enable row level security;
alter table public.service_resources enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_allocations enable row level security;
alter table public.business_modules enable row level security;

create policy "Public reads active businesses" on public.businesses
for select to anon, authenticated using (status = 'active' or public.can_manage_business(id));
create policy "Admins manage businesses" on public.businesses
for all to authenticated using (public.can_manage_business(id)) with check (public.can_manage_business(id));

create policy "Members read business membership" on public.business_members
for select to authenticated using (user_id = auth.uid() or public.can_manage_business(business_id));
create policy "Admins manage business membership" on public.business_members
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy "Clients read own CRM record" on public.clients
for select to authenticated using (auth_user_id = auth.uid() or public.can_manage_business(business_id));
create policy "Admins manage clients" on public.clients
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy "Public reads active services" on public.services
for select to anon, authenticated using ((is_active and is_public) or public.can_manage_business(business_id));
create policy "Admins manage services" on public.services
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy "Public reads active resources" on public.resources
for select to anon, authenticated using ((is_active and is_public) or public.can_manage_business(business_id));
create policy "Admins manage resources" on public.resources
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy "Public reads service resource links" on public.service_resources
for select to anon, authenticated using (
  public.can_manage_business(business_id)
  or exists (
    select 1 from public.services s
    join public.resources r on r.id = service_resources.resource_id
    where s.id = service_resources.service_id
      and s.business_id = service_resources.business_id
      and r.business_id = service_resources.business_id
      and s.is_active and s.is_public and r.is_active and r.is_public
  )
);
create policy "Admins manage service resource links" on public.service_resources
for all to authenticated using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

create policy "Admins manage availability rules" on public.availability_rules
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));
create policy "Admins manage availability exceptions" on public.availability_exceptions
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy "Clients read own bookings" on public.bookings
for select to authenticated using (
  public.can_manage_business(business_id)
  or exists (select 1 from public.clients c where c.id = client_id and c.auth_user_id = auth.uid())
);
create policy "Admins manage bookings" on public.bookings
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

create policy "Clients read own allocations" on public.booking_allocations
for select to authenticated using (
  exists (
    select 1 from public.bookings b
    join public.clients c on c.id = b.client_id
    where b.id = booking_allocations.booking_id
      and (c.auth_user_id = auth.uid() or public.can_manage_business(b.business_id))
  )
);
create policy "Admins manage booking allocations" on public.booking_allocations
for all to authenticated using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

create policy "Admins read business modules" on public.business_modules
for select to authenticated using (public.can_manage_business(business_id));
create policy "Admins manage business modules" on public.business_modules
for all to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));

revoke all on table public.businesses, public.business_members, public.clients, public.services,
  public.resources, public.service_resources, public.availability_rules, public.availability_exceptions,
  public.bookings, public.booking_allocations, public.business_modules from anon, authenticated;

grant select on public.businesses, public.services, public.resources, public.service_resources to anon, authenticated;
grant select on public.business_members, public.clients, public.bookings, public.booking_allocations,
  public.business_modules to authenticated;
grant insert, update, delete on public.businesses, public.business_members, public.clients, public.services,
  public.resources, public.service_resources, public.availability_rules, public.availability_exceptions,
  public.bookings, public.booking_allocations, public.business_modules to authenticated;
grant select on public.availability_rules, public.availability_exceptions to authenticated;

comment on table public.service_bookings is 'Compatibility table from the prototype booking engine. New modules must use public.bookings.';
comment on table public.resource_bookings is 'Compatibility table from the prototype booking engine. New modules must use public.bookings.';
comment on table public.packages is 'Compatibility catalog table. New modules must use public.services.';
comment on table public.service_options is 'Compatibility catalog table. New modules must use public.services and public.resources.';
comment on table public.team is 'Compatibility team table. Bookable staff belong in public.resources.';
comment on table public.service_catalog_items is 'Compatibility storefront catalog. New modules must use public.services.';
