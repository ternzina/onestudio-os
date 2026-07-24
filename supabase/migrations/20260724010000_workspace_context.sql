-- OneStudio OS Workspace Context 1.0
-- Activates the business workspace contract added by Core Modules 1.0.
-- Adds deterministic workspace selection, role tiers and tenant-safe RLS rules.

alter table public.business_members
  add column if not exists is_default boolean not null default false;

alter table public.business_members
  drop constraint if exists business_members_role_check;

alter table public.business_members
  add constraint business_members_role_check
  check (role in ('owner', 'admin', 'manager', 'staff', 'viewer'));

alter table public.business_members
  drop constraint if exists business_members_default_requires_active;

alter table public.business_members
  add constraint business_members_default_requires_active
  check (is_active = true or is_default = false);

-- An inactive membership can never remain the user's preferred workspace.
update public.business_members
set is_default = false
where is_active = false and is_default = true;

-- Give every existing member one deterministic preferred workspace.
with ranked_memberships as (
  select
    m.id,
    m.user_id,
    row_number() over (
      partition by m.user_id
      order by
        case m.role
          when 'owner' then 1
          when 'admin' then 2
          when 'manager' then 3
          when 'staff' then 4
          else 5
        end,
        m.created_at,
        m.id
    ) as membership_rank
  from public.business_members m
  where m.is_active = true
), users_without_default as (
  select distinct m.user_id
  from public.business_members m
  where m.is_active = true
    and not exists (
      select 1
      from public.business_members current_default
      where current_default.user_id = m.user_id
        and current_default.is_active = true
        and current_default.is_default = true
    )
)
update public.business_members m
set is_default = true,
    updated_at = now()
from ranked_memberships ranked
join users_without_default missing
  on missing.user_id = ranked.user_id
where m.id = ranked.id
  and ranked.membership_rank = 1;

create unique index if not exists business_members_one_default_per_user
  on public.business_members (user_id)
  where is_active = true and is_default = true;

create index if not exists business_members_active_user_idx
  on public.business_members (user_id, is_active, is_default);

create or replace function public.business_role(p_business_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.business_members m
  where m.business_id = p_business_id
    and m.user_id = auth.uid()
    and m.is_active = true
  limit 1;
$$;

create or replace function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.business_id
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.user_id = auth.uid()
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
$$;

create or replace function public.can_view_business(p_business_id uuid)
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
    );
$$;

create or replace function public.can_operate_business(p_business_id uuid)
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
        and m.role in ('owner', 'admin', 'manager', 'staff')
    );
$$;

create or replace function public.can_configure_business(p_business_id uuid)
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
        and m.role in ('owner', 'admin', 'manager')
    );
$$;

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

create or replace function public.list_my_businesses()
returns table (
  business_id uuid,
  slug text,
  name text,
  timezone text,
  default_locale text,
  default_currency text,
  status text,
  role text,
  is_default boolean,
  member_since timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id,
    b.slug,
    b.name,
    b.timezone,
    b.default_locale,
    b.default_currency,
    b.status,
    m.role,
    m.is_default,
    m.created_at
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.user_id = auth.uid()
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
    b.name,
    b.id;
$$;

create or replace function public.set_default_business(p_business_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.business_members m
    join public.businesses b on b.id = m.business_id
    where m.business_id = p_business_id
      and m.user_id = auth.uid()
      and m.is_active = true
      and b.status <> 'archived'
  ) then
    return false;
  end if;

  update public.business_members
  set is_default = false,
      updated_at = now()
  where user_id = auth.uid()
    and is_default = true
    and business_id <> p_business_id;

  update public.business_members
  set is_default = true,
      updated_at = now()
  where user_id = auth.uid()
    and business_id = p_business_id
    and is_active = true;

  return found;
end;
$$;

revoke all on function public.business_role(uuid) from public;
revoke all on function public.current_business_id() from public;
revoke all on function public.can_view_business(uuid) from public;
revoke all on function public.can_operate_business(uuid) from public;
revoke all on function public.can_configure_business(uuid) from public;
revoke all on function public.can_manage_business(uuid) from public;
revoke all on function public.list_my_businesses() from public;
revoke all on function public.set_default_business(uuid) from public;

grant execute on function public.business_role(uuid) to authenticated, service_role;
grant execute on function public.current_business_id() to authenticated, service_role;
grant execute on function public.can_view_business(uuid) to anon, authenticated, service_role;
grant execute on function public.can_operate_business(uuid) to authenticated, service_role;
grant execute on function public.can_configure_business(uuid) to authenticated, service_role;
grant execute on function public.can_manage_business(uuid) to authenticated, service_role;
grant execute on function public.list_my_businesses() to authenticated, service_role;
grant execute on function public.set_default_business(uuid) to authenticated, service_role;

-- Replace the first-pass Core Modules policies with explicit role tiers.
drop policy if exists "Public reads active businesses" on public.businesses;
drop policy if exists "Admins manage businesses" on public.businesses;
drop policy if exists "Members read business membership" on public.business_members;
drop policy if exists "Admins manage business membership" on public.business_members;
drop policy if exists "Clients read own CRM record" on public.clients;
drop policy if exists "Admins manage clients" on public.clients;
drop policy if exists "Public reads active services" on public.services;
drop policy if exists "Admins manage services" on public.services;
drop policy if exists "Public reads active resources" on public.resources;
drop policy if exists "Admins manage resources" on public.resources;
drop policy if exists "Public reads service resource links" on public.service_resources;
drop policy if exists "Admins manage service resource links" on public.service_resources;
drop policy if exists "Admins manage availability rules" on public.availability_rules;
drop policy if exists "Admins manage availability exceptions" on public.availability_exceptions;
drop policy if exists "Clients read own bookings" on public.bookings;
drop policy if exists "Admins manage bookings" on public.bookings;
drop policy if exists "Clients read own allocations" on public.booking_allocations;
drop policy if exists "Admins manage booking allocations" on public.booking_allocations;
drop policy if exists "Admins read business modules" on public.business_modules;
drop policy if exists "Admins manage business modules" on public.business_modules;

create policy "Public reads active businesses" on public.businesses
for select to anon, authenticated
using (status = 'active' or public.can_view_business(id));

create policy "Owners and admins manage businesses" on public.businesses
for all to authenticated
using (public.can_manage_business(id))
with check (public.can_manage_business(id));

create policy "Members read workspace membership" on public.business_members
for select to authenticated
using (user_id = auth.uid() or public.can_view_business(business_id));

create policy "Owners and admins manage workspace membership" on public.business_members
for all to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

create policy "Members read workspace clients" on public.clients
for select to authenticated
using (auth_user_id = auth.uid() or public.can_view_business(business_id));

create policy "Operators manage workspace clients" on public.clients
for all to authenticated
using (public.can_operate_business(business_id))
with check (public.can_operate_business(business_id));

create policy "Public reads active services" on public.services
for select to anon, authenticated
using ((is_active and is_public) or public.can_view_business(business_id));

create policy "Managers configure services" on public.services
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Public reads active resources" on public.resources
for select to anon, authenticated
using ((is_active and is_public) or public.can_view_business(business_id));

create policy "Managers configure resources" on public.resources
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Public reads active service resource links" on public.service_resources
for select to anon, authenticated
using (
  public.can_view_business(business_id)
  or exists (
    select 1
    from public.services s
    join public.resources r on r.id = service_resources.resource_id
    where s.id = service_resources.service_id
      and s.business_id = service_resources.business_id
      and r.business_id = service_resources.business_id
      and s.is_active = true
      and s.is_public = true
      and r.is_active = true
      and r.is_public = true
  )
);

create policy "Managers configure service resource links" on public.service_resources
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Members read availability rules" on public.availability_rules
for select to authenticated
using (public.can_view_business(business_id));

create policy "Managers configure availability rules" on public.availability_rules
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Members read availability exceptions" on public.availability_exceptions
for select to authenticated
using (public.can_view_business(business_id));

create policy "Managers configure availability exceptions" on public.availability_exceptions
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Members and clients read bookings" on public.bookings
for select to authenticated
using (
  public.can_view_business(business_id)
  or exists (
    select 1
    from public.clients c
    where c.id = bookings.client_id
      and c.auth_user_id = auth.uid()
  )
);

create policy "Operators manage bookings" on public.bookings
for all to authenticated
using (public.can_operate_business(business_id))
with check (public.can_operate_business(business_id));

create policy "Members and clients read allocations" on public.booking_allocations
for select to authenticated
using (
  public.can_view_business(business_id)
  or exists (
    select 1
    from public.bookings b
    join public.clients c on c.id = b.client_id
    where b.id = booking_allocations.booking_id
      and c.auth_user_id = auth.uid()
  )
);

create policy "Operators manage booking allocations" on public.booking_allocations
for all to authenticated
using (public.can_operate_business(business_id))
with check (public.can_operate_business(business_id));

create policy "Members read business modules" on public.business_modules
for select to authenticated
using (public.can_view_business(business_id));

create policy "Owners and admins manage business modules" on public.business_modules
for all to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

comment on column public.business_members.is_default is
  'Preferred workspace for this user. At most one active membership may be preferred.';
comment on function public.current_business_id() is
  'Returns the authenticated user preferred active workspace, with a deterministic fallback.';
comment on function public.list_my_businesses() is
  'Returns only active non-archived workspaces assigned to the authenticated user.';
comment on function public.set_default_business(uuid) is
  'Changes the authenticated user preferred workspace after validating active membership.';
