begin;

create table public.public_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  request_key uuid not null,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'answered', 'closed')),
  client_name text not null,
  client_email text not null,
  client_phone text,
  client_locale text not null default 'ru',
  business_type text,
  subject text,
  message text not null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_requests_business_request_key_unique unique (business_id, request_key),
  constraint public_requests_client_name_not_blank check (length(btrim(client_name)) between 2 and 160),
  constraint public_requests_client_email_not_blank check (length(btrim(client_email)) between 5 and 320),
  constraint public_requests_message_not_blank check (length(btrim(message)) between 3 and 5000)
);

create index public_requests_business_created_idx
  on public.public_requests (business_id, created_at desc);
create index public_requests_business_status_idx
  on public.public_requests (business_id, status, created_at desc);

alter table public.public_requests enable row level security;

create policy "Workspace members read public requests"
on public.public_requests for select to authenticated
using (business_id = public.current_business_id());

create policy "Workspace managers update public requests"
on public.public_requests for update to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

revoke all on table public.public_requests from public, anon, authenticated;
grant select on table public.public_requests to authenticated;
grant update (status, internal_notes, updated_at) on table public.public_requests to authenticated;

create or replace function public.get_public_request_context(p_business_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'business', jsonb_build_object(
      'id', business.id,
      'slug', business.slug,
      'name', business.name,
      'default_locale', business.default_locale
    )
  )
  from public.businesses business
  where business.slug = lower(btrim(p_business_slug))
    and business.status = 'active'
  limit 1;
$$;

create or replace function public.create_public_request(
  p_business_slug text,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_client_locale text,
  p_business_type text,
  p_subject text,
  p_message text,
  p_request_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business public.businesses%rowtype;
  v_request public.public_requests%rowtype;
  v_email text := lower(btrim(coalesce(p_client_email, '')));
begin
  select * into v_business
  from public.businesses
  where slug = lower(btrim(p_business_slug))
    and status = 'active';

  if v_business.id is null then
    raise exception using errcode = 'P0002', message = 'public_request_business_not_found';
  end if;
  if length(btrim(coalesce(p_client_name, ''))) < 2 then
    raise exception using errcode = '22023', message = 'invalid_public_request_client_name';
  end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'invalid_public_request_client_email';
  end if;
  if length(btrim(coalesce(p_message, ''))) < 3 then
    raise exception using errcode = '22023', message = 'invalid_public_request_message';
  end if;

  insert into public.public_requests (
    business_id, request_key, client_name, client_email, client_phone,
    client_locale, business_type, subject, message
  ) values (
    v_business.id, p_request_key, btrim(p_client_name), v_email,
    nullif(btrim(coalesce(p_client_phone, '')), ''),
    case when lower(coalesce(p_client_locale, 'ru')) like 'en%' then 'en' else 'ru' end,
    nullif(btrim(coalesce(p_business_type, '')), ''),
    nullif(btrim(coalesce(p_subject, '')), ''),
    btrim(p_message)
  )
  on conflict (business_id, request_key) do update
    set request_key = excluded.request_key
  returning * into v_request;

  return jsonb_build_object(
    'id', v_request.id,
    'status', v_request.status,
    'created_at', v_request.created_at
  );
end;
$$;

create or replace function public.get_admin_public_requests()
returns setof public.public_requests
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select request.*
  from public.public_requests request
  where request.business_id = public.current_business_id()
  order by request.created_at desc;
$$;

create or replace function public.update_admin_public_request(
  p_request_id uuid,
  p_status text,
  p_internal_notes text
)
returns public.public_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request public.public_requests%rowtype;
begin
  if p_status not in ('new', 'in_progress', 'answered', 'closed') then
    raise exception using errcode = '22023', message = 'invalid_public_request_status';
  end if;

  update public.public_requests request
  set status = p_status,
      internal_notes = nullif(btrim(coalesce(p_internal_notes, '')), ''),
      updated_at = now()
  where request.id = p_request_id
    and request.business_id = public.current_business_id()
    and public.can_manage_business(request.business_id)
  returning * into v_request;

  if v_request.id is null then
    raise exception using errcode = '42501', message = 'public_request_operation_forbidden';
  end if;
  return v_request;
end;
$$;

revoke all on function public.get_public_request_context(text) from public;
revoke all on function public.create_public_request(text,text,text,text,text,text,text,text,uuid) from public;
revoke all on function public.get_admin_public_requests() from public;
revoke all on function public.update_admin_public_request(uuid,text,text) from public;

grant execute on function public.get_public_request_context(text) to anon, authenticated;
grant execute on function public.create_public_request(text,text,text,text,text,text,text,text,uuid) to anon, authenticated;
grant execute on function public.get_admin_public_requests() to authenticated, service_role;
grant execute on function public.update_admin_public_request(uuid,text,text) to authenticated, service_role;

comment on table public.public_requests is
  'Written enquiries that do not reserve a date, time or resource.';

commit;
