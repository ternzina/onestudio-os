-- OneStudio OS Clients CRM 1.0
-- Adds a first-class client workspace on top of canonical booking clients.

alter table public.clients
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null;

create index if not exists clients_business_archived_name_idx
  on public.clients (business_id, archived_at, lower(name));

create index if not exists clients_business_phone_identity_idx
  on public.clients (
    business_id,
    lower(name),
    regexp_replace(coalesce(phone, ''), '[^0-9]+', '', 'g')
  )
  where phone is not null;

create table if not exists public.client_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  client_id uuid not null,
  event_type text not null
    check (event_type in ('created', 'updated', 'archived', 'restored', 'merged')),
  actor_user_id uuid references auth.users(id) on delete set null,
  changes jsonb not null default '{}'::jsonb
    check (jsonb_typeof(changes) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (client_id, business_id)
    references public.clients(id, business_id) on delete cascade
);

create index if not exists client_events_client_created_idx
  on public.client_events (client_id, created_at desc);

create index if not exists client_events_business_created_idx
  on public.client_events (business_id, created_at desc);

alter table public.client_events enable row level security;

drop policy if exists "Members read client events" on public.client_events;
create policy "Members read client events" on public.client_events
for select to authenticated
using (public.can_view_business(business_id));

revoke all on table public.client_events from public, anon, authenticated;
grant select on table public.client_events to authenticated, service_role;
grant insert, update, delete on table public.client_events to service_role;

-- Client mutations now go through guarded CRM RPCs.
revoke insert, update, delete on table public.clients from authenticated;
grant select on table public.clients to authenticated;
grant insert, update, delete on table public.clients to service_role;

create or replace function public.normalize_client_phone(p_phone text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9]+', '', 'g'), '');
$$;

create or replace function public.normalize_client_tags(p_tags text[])
returns text[]
language sql
immutable
set search_path = public
as $$
  select coalesce(
    array_agg(normalized_tag order by normalized_tag),
    '{}'::text[]
  )
  from (
    select distinct lower(trim(tag)) as normalized_tag
    from unnest(coalesce(p_tags, '{}'::text[])) as input(tag)
    where char_length(trim(tag)) between 1 and 50
    order by lower(trim(tag))
    limit 30
  ) normalized;
$$;

create or replace function public.create_admin_client(
  p_business_id uuid,
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_locale text default null,
  p_notes text default '',
  p_tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
  v_name text := trim(coalesce(p_name, ''));
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_phone_key text := public.normalize_client_phone(p_phone);
  v_locale text;
  v_existing_id uuid;
  v_client_id uuid;
begin
  if not public.can_operate_business(p_business_id) then
    raise exception 'client_operation_forbidden' using errcode = '42501';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = p_business_id
    and business.status <> 'archived';

  if not found then
    raise exception 'client_business_not_found' using errcode = '23503';
  end if;

  if char_length(v_name) not between 1 and 160 then
    raise exception 'invalid_client_name' using errcode = '22023';
  end if;

  if v_email is not null
     and (
       char_length(v_email) not between 5 and 254
       or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     ) then
    raise exception 'invalid_client_email' using errcode = '22023';
  end if;

  if v_phone is not null and char_length(v_phone) not between 5 and 40 then
    raise exception 'invalid_client_phone' using errcode = '22023';
  end if;

  v_locale := lower(coalesce(nullif(trim(p_locale), ''), v_business.default_locale));
  if v_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'invalid_client_locale' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_business_id::text || ':' ||
      coalesce(v_email, lower(v_name) || ':' || coalesce(v_phone_key, '')),
      0
    )
  );

  select client.id
  into v_existing_id
  from public.clients client
  where client.business_id = p_business_id
    and (
      (v_email is not null and lower(client.email) = v_email)
      or (
        v_email is null
        and v_phone_key is not null
        and char_length(v_phone_key) >= 7
        and lower(client.name) = lower(v_name)
        and public.normalize_client_phone(client.phone) = v_phone_key
      )
    )
  order by client.archived_at nulls first, client.created_at
  limit 1
  for update;

  if v_existing_id is not null then
    raise exception 'client_already_exists' using errcode = '23505';
  end if;

  insert into public.clients (
    business_id,
    name,
    email,
    phone,
    locale,
    notes,
    tags,
    metadata
  ) values (
    p_business_id,
    v_name,
    v_email,
    v_phone,
    v_locale,
    left(coalesce(p_notes, ''), 8000),
    public.normalize_client_tags(p_tags),
    jsonb_build_object('created_from', 'clients_crm')
  )
  returning id into v_client_id;

  insert into public.client_events (
    business_id,
    client_id,
    event_type,
    actor_user_id,
    changes
  ) values (
    p_business_id,
    v_client_id,
    'created',
    auth.uid(),
    jsonb_build_object(
      'name', v_name,
      'email', v_email,
      'phone', v_phone,
      'locale', v_locale
    )
  );

  return v_client_id;
exception
  when unique_violation then
    raise exception 'client_already_exists' using errcode = '23505';
end;
$$;

create or replace function public.update_admin_client(
  p_client_id uuid,
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_locale text default null,
  p_notes text default '',
  p_tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client public.clients%rowtype;
  v_business public.businesses%rowtype;
  v_name text := trim(coalesce(p_name, ''));
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_phone_key text := public.normalize_client_phone(p_phone);
  v_locale text;
  v_duplicate_id uuid;
begin
  select client.*
  into v_client
  from public.clients client
  where client.id = p_client_id
  for update;

  if not found then
    raise exception 'client_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_client.business_id) then
    raise exception 'client_operation_forbidden' using errcode = '42501';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = v_client.business_id;

  if char_length(v_name) not between 1 and 160 then
    raise exception 'invalid_client_name' using errcode = '22023';
  end if;

  if v_email is not null
     and (
       char_length(v_email) not between 5 and 254
       or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     ) then
    raise exception 'invalid_client_email' using errcode = '22023';
  end if;

  if v_phone is not null and char_length(v_phone) not between 5 and 40 then
    raise exception 'invalid_client_phone' using errcode = '22023';
  end if;

  v_locale := lower(coalesce(nullif(trim(p_locale), ''), v_business.default_locale));
  if v_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'invalid_client_locale' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      v_client.business_id::text || ':' ||
      coalesce(v_email, lower(v_name) || ':' || coalesce(v_phone_key, '')),
      0
    )
  );

  select client.id
  into v_duplicate_id
  from public.clients client
  where client.business_id = v_client.business_id
    and client.id <> p_client_id
    and (
      (v_email is not null and lower(client.email) = v_email)
      or (
        v_email is null
        and v_phone_key is not null
        and char_length(v_phone_key) >= 7
        and lower(client.name) = lower(v_name)
        and public.normalize_client_phone(client.phone) = v_phone_key
      )
    )
  order by client.archived_at nulls first, client.created_at
  limit 1;

  if v_duplicate_id is not null then
    raise exception 'client_already_exists' using errcode = '23505';
  end if;

  update public.clients
  set name = v_name,
      email = v_email,
      phone = v_phone,
      locale = v_locale,
      notes = left(coalesce(p_notes, ''), 8000),
      tags = public.normalize_client_tags(p_tags),
      updated_at = now()
  where id = p_client_id;

  insert into public.client_events (
    business_id,
    client_id,
    event_type,
    actor_user_id,
    changes
  ) values (
    v_client.business_id,
    p_client_id,
    'updated',
    auth.uid(),
    jsonb_build_object(
      'name', jsonb_build_object('from', v_client.name, 'to', v_name),
      'email', jsonb_build_object('from', v_client.email, 'to', v_email),
      'phone', jsonb_build_object('from', v_client.phone, 'to', v_phone),
      'locale', jsonb_build_object('from', v_client.locale, 'to', v_locale),
      'tags', jsonb_build_object('from', v_client.tags, 'to', public.normalize_client_tags(p_tags))
    )
  );

  return p_client_id;
exception
  when unique_violation then
    raise exception 'client_already_exists' using errcode = '23505';
end;
$$;

create or replace function public.set_admin_client_archived(
  p_client_id uuid,
  p_archived boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client public.clients%rowtype;
begin
  select client.*
  into v_client
  from public.clients client
  where client.id = p_client_id
  for update;

  if not found then
    raise exception 'client_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_client.business_id) then
    raise exception 'client_operation_forbidden' using errcode = '42501';
  end if;

  if coalesce(p_archived, false)
     and exists (
       select 1
       from public.bookings booking
       where booking.client_id = p_client_id
         and booking.business_id = v_client.business_id
         and booking.status in ('hold', 'pending', 'confirmed')
         and booking.ends_at > now()
     ) then
    raise exception 'client_has_active_bookings' using errcode = '55000';
  end if;

  update public.clients
  set archived_at = case when coalesce(p_archived, false) then now() else null end,
      archived_by = case when coalesce(p_archived, false) then auth.uid() else null end,
      updated_at = now()
  where id = p_client_id;

  insert into public.client_events (
    business_id,
    client_id,
    event_type,
    actor_user_id,
    changes
  ) values (
    v_client.business_id,
    p_client_id,
    case when coalesce(p_archived, false) then 'archived' else 'restored' end,
    auth.uid(),
    jsonb_build_object('archived', coalesce(p_archived, false))
  );

  return true;
end;
$$;

create or replace function public.merge_admin_clients(
  p_keep_client_id uuid,
  p_merge_client_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_keep public.clients%rowtype;
  v_merge public.clients%rowtype;
  v_moved_bookings integer;
  v_notes text;
begin
  if p_keep_client_id is null
     or p_merge_client_id is null
     or p_keep_client_id = p_merge_client_id then
    raise exception 'invalid_client_merge' using errcode = '22023';
  end if;

  perform 1
  from public.clients client
  where client.id in (p_keep_client_id, p_merge_client_id)
  order by client.id
  for update;

  select client.*
  into v_keep
  from public.clients client
  where client.id = p_keep_client_id;

  select client.*
  into v_merge
  from public.clients client
  where client.id = p_merge_client_id;

  if v_keep.id is null or v_merge.id is null then
    raise exception 'client_not_found' using errcode = '23503';
  end if;

  if v_keep.business_id <> v_merge.business_id then
    raise exception 'client_merge_cross_business' using errcode = '42501';
  end if;

  if not public.can_operate_business(v_keep.business_id) then
    raise exception 'client_operation_forbidden' using errcode = '42501';
  end if;

  if v_keep.auth_user_id is not null
     and v_merge.auth_user_id is not null
     and v_keep.auth_user_id <> v_merge.auth_user_id then
    raise exception 'client_merge_auth_conflict' using errcode = '55000';
  end if;

  update public.clients
  set email = null,
      auth_user_id = null,
      updated_at = now()
  where id = v_merge.id;

  update public.bookings
  set client_id = v_keep.id,
      updated_at = now()
  where client_id = v_merge.id
    and business_id = v_keep.business_id;

  get diagnostics v_moved_bookings = row_count;

  update public.client_events
  set client_id = v_keep.id
  where client_id = v_merge.id
    and business_id = v_keep.business_id;

  v_notes := case
    when trim(coalesce(v_keep.notes, '')) = '' then coalesce(v_merge.notes, '')
    when trim(coalesce(v_merge.notes, '')) = '' then coalesce(v_keep.notes, '')
    else left(v_keep.notes || E'\n\n---\n' || v_merge.notes, 8000)
  end;

  update public.clients
  set auth_user_id = coalesce(v_keep.auth_user_id, v_merge.auth_user_id),
      email = coalesce(v_keep.email, v_merge.email),
      phone = coalesce(v_keep.phone, v_merge.phone),
      notes = v_notes,
      tags = public.normalize_client_tags(
        coalesce(v_keep.tags, '{}'::text[]) || coalesce(v_merge.tags, '{}'::text[])
      ),
      metadata = coalesce(v_merge.metadata, '{}'::jsonb)
        || coalesce(v_keep.metadata, '{}'::jsonb)
        || jsonb_build_object('last_merged_client_id', v_merge.id),
      archived_at = case
        when v_keep.archived_at is null or v_merge.archived_at is null then null
        else least(v_keep.archived_at, v_merge.archived_at)
      end,
      archived_by = case
        when v_keep.archived_at is null or v_merge.archived_at is null then null
        else coalesce(v_keep.archived_by, v_merge.archived_by)
      end,
      updated_at = now()
  where id = v_keep.id;

  delete from public.clients
  where id = v_merge.id;

  insert into public.client_events (
    business_id,
    client_id,
    event_type,
    actor_user_id,
    changes
  ) values (
    v_keep.business_id,
    v_keep.id,
    'merged',
    auth.uid(),
    jsonb_build_object(
      'merged_client_id', v_merge.id,
      'merged_client_name', v_merge.name,
      'moved_bookings', v_moved_bookings
    )
  );

  return v_keep.id;
end;
$$;

create or replace function public.get_admin_clients_crm(
  p_business_id uuid,
  p_include_archived boolean default true
)
returns table (
  id uuid,
  business_id uuid,
  auth_user_id uuid,
  name text,
  email text,
  phone text,
  locale text,
  notes text,
  tags text[],
  archived_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  booking_count bigint,
  upcoming_count bigint,
  completed_count bigint,
  no_show_count bigint,
  cancelled_count bigint,
  next_booking_at timestamptz,
  last_booking_at timestamptz,
  booked_value_minor bigint,
  currency text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    client.id,
    client.business_id,
    client.auth_user_id,
    client.name,
    client.email,
    client.phone,
    client.locale,
    client.notes,
    client.tags,
    client.archived_at,
    client.created_at,
    client.updated_at,
    stats.booking_count,
    stats.upcoming_count,
    stats.completed_count,
    stats.no_show_count,
    stats.cancelled_count,
    stats.next_booking_at,
    stats.last_booking_at,
    stats.booked_value_minor,
    business.default_currency
  from public.clients client
  join public.businesses business on business.id = client.business_id
  cross join lateral (
    select
      count(booking.id)::bigint as booking_count,
      count(booking.id) filter (
        where booking.status in ('hold', 'pending', 'confirmed')
          and booking.ends_at > now()
      )::bigint as upcoming_count,
      count(booking.id) filter (where booking.status = 'completed')::bigint as completed_count,
      count(booking.id) filter (where booking.status = 'no_show')::bigint as no_show_count,
      count(booking.id) filter (where booking.status = 'cancelled')::bigint as cancelled_count,
      min(booking.starts_at) filter (
        where booking.status in ('hold', 'pending', 'confirmed')
          and booking.ends_at > now()
      ) as next_booking_at,
      max(booking.starts_at) filter (where booking.starts_at <= now()) as last_booking_at,
      coalesce(
        sum(booking.total_minor) filter (
          where booking.status <> 'cancelled'
            and booking.currency = business.default_currency
        ),
        0
      )::bigint as booked_value_minor
    from public.bookings booking
    where booking.client_id = client.id
      and booking.business_id = client.business_id
  ) stats
  where client.business_id = p_business_id
    and public.can_view_business(client.business_id)
    and (coalesce(p_include_archived, true) or client.archived_at is null)
  order by client.archived_at nulls first, client.name, client.id;
$$;

create or replace function public.get_admin_client_bookings(p_client_id uuid)
returns table (
  id uuid,
  reference text,
  service_id uuid,
  service_title text,
  status text,
  source text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  party_size integer,
  total_minor integer,
  currency text,
  payment_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    booking.id,
    booking.reference,
    booking.service_id,
    service.title,
    booking.status,
    booking.source,
    booking.starts_at,
    booking.ends_at,
    booking.timezone,
    booking.party_size,
    booking.total_minor,
    booking.currency,
    booking.payment_status
  from public.bookings booking
  join public.services service
    on service.id = booking.service_id
   and service.business_id = booking.business_id
  join public.clients client
    on client.id = booking.client_id
   and client.business_id = booking.business_id
  where client.id = p_client_id
    and public.can_view_business(client.business_id)
  order by booking.starts_at desc, booking.id;
$$;

create or replace function public.get_admin_client_events(p_client_id uuid)
returns table (
  id uuid,
  event_type text,
  actor_user_id uuid,
  changes jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    event.id,
    event.event_type,
    event.actor_user_id,
    event.changes,
    event.created_at
  from public.client_events event
  join public.clients client
    on client.id = event.client_id
   and client.business_id = event.business_id
  where client.id = p_client_id
    and public.can_view_business(client.business_id)
  order by event.created_at desc, event.id
  limit 100;
$$;

-- Make booking client resolution reuse an existing identity and reactivate it.
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
  v_phone_key text := public.normalize_client_phone(p_phone);
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

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_business_id::text || ':' ||
      coalesce(v_email, lower(v_name) || ':' || coalesce(v_phone_key, '')),
      0
    )
  );

  if v_email is not null then
    select client.id
    into v_client_id
    from public.clients client
    where client.business_id = p_business_id
      and lower(client.email) = v_email
    order by client.archived_at nulls first, client.created_at
    limit 1
    for update;
  elsif v_phone_key is not null and char_length(v_phone_key) >= 7 then
    select client.id
    into v_client_id
    from public.clients client
    where client.business_id = p_business_id
      and lower(client.name) = lower(v_name)
      and public.normalize_client_phone(client.phone) = v_phone_key
    order by client.archived_at nulls first, client.created_at
    limit 1
    for update;
  end if;

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
        p_business_id,
        v_name,
        v_email,
        v_phone,
        v_locale,
        jsonb_build_object('created_from', 'admin_booking')
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
        order by client.archived_at nulls first, client.created_at
        limit 1
        for update;

        if v_client_id is null then
          raise;
        end if;
      end;
  end if;

  update public.clients
  set name = v_name,
      phone = coalesce(v_phone, phone),
      locale = lower(v_locale),
      archived_at = null,
      archived_by = null,
      updated_at = now()
  where id = v_client_id
    and business_id = p_business_id;

  return v_client_id;
end;
$$;


create or replace function public.reactivate_booking_client()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reactivated boolean := false;
begin
  update public.clients
  set archived_at = null,
      archived_by = null,
      updated_at = now()
  where id = new.client_id
    and business_id = new.business_id
    and archived_at is not null
  returning true into v_reactivated;

  if coalesce(v_reactivated, false) then
    insert into public.client_events (
      business_id,
      client_id,
      event_type,
      actor_user_id,
      changes
    ) values (
      new.business_id,
      new.client_id,
      'restored',
      auth.uid(),
      jsonb_build_object('restored_by_booking_id', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists reactivate_booking_client_on_booking on public.bookings;
create trigger reactivate_booking_client_on_booking
before insert or update of client_id on public.bookings
for each row
execute function public.reactivate_booking_client();

revoke all on function public.normalize_client_phone(text) from public, anon, authenticated;
revoke all on function public.normalize_client_tags(text[]) from public, anon, authenticated;
revoke all on function public.create_admin_client(uuid, text, text, text, text, text, text[]) from public, anon, authenticated;
revoke all on function public.update_admin_client(uuid, text, text, text, text, text, text[]) from public, anon, authenticated;
revoke all on function public.set_admin_client_archived(uuid, boolean) from public, anon, authenticated;
revoke all on function public.merge_admin_clients(uuid, uuid) from public, anon, authenticated;
revoke all on function public.get_admin_clients_crm(uuid, boolean) from public, anon, authenticated;
revoke all on function public.get_admin_client_bookings(uuid) from public, anon, authenticated;
revoke all on function public.get_admin_client_events(uuid) from public, anon, authenticated;
revoke all on function public.reactivate_booking_client() from public, anon, authenticated;

grant execute on function public.create_admin_client(uuid, text, text, text, text, text, text[]) to authenticated, service_role;
grant execute on function public.update_admin_client(uuid, text, text, text, text, text, text[]) to authenticated, service_role;
grant execute on function public.set_admin_client_archived(uuid, boolean) to authenticated, service_role;
grant execute on function public.merge_admin_clients(uuid, uuid) to authenticated, service_role;
grant execute on function public.get_admin_clients_crm(uuid, boolean) to authenticated, service_role;
grant execute on function public.get_admin_client_bookings(uuid) to authenticated, service_role;
grant execute on function public.get_admin_client_events(uuid) to authenticated, service_role;
grant execute on function public.normalize_client_phone(text) to service_role;
grant execute on function public.normalize_client_tags(text[]) to service_role;

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
    (
      new.id,
      'scheduling',
      true,
      '1.3.0',
      jsonb_build_object(
        'booking_core', true,
        'public_booking_ui', true,
        'booking_calendar', true
      )
    ),
    (
      new.id,
      'crm',
      true,
      '1.1.0',
      jsonb_build_object(
        'booking_clients', true,
        'clients_crm', true,
        'client_merge', true,
        'client_archive', true
      )
    ),
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
    config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'booking_clients', true,
        'clients_crm', true,
        'client_merge', true,
        'client_archive', true
      ),
    updated_at = now()
where module_key = 'crm';

comment on table public.client_events is
  'Append-only operational history for canonical OneStudio CRM clients.';
comment on function public.create_admin_client(uuid, text, text, text, text, text, text[]) is
  'Creates one workspace-scoped CRM client while preventing duplicate email or matching name and phone identities.';
comment on function public.update_admin_client(uuid, text, text, text, text, text, text[]) is
  'Updates a canonical CRM client with normalized tags and duplicate protection.';
comment on function public.merge_admin_clients(uuid, uuid) is
  'Moves bookings and history from one duplicate client into another canonical client.';
comment on function public.get_admin_clients_crm(uuid, boolean) is
  'Returns workspace-scoped client summaries and booking statistics for the Clients CRM admin interface.';

comment on function public.reactivate_booking_client() is
  'Restores an archived canonical client whenever a new booking starts using that client identity.';
