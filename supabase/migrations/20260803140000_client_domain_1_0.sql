
begin;

create table if not exists public.public_site_domains (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  domain text not null,
  redirect_domain text,
  status text not null default 'pending'
    check (status in ('pending', 'verification_required', 'dns_pending', 'active', 'error')),
  ownership_verification_required boolean not null default false,
  vercel_verified boolean not null default false,
  dns_configured boolean not null default false,
  ssl_ready boolean not null default false,
  verification jsonb not null default '[]'::jsonb
    check (jsonb_typeof(verification) = 'array'),
  dns_records jsonb not null default '[]'::jsonb
    check (jsonb_typeof(dns_records) = 'array'),
  last_error text,
  last_checked_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_site_domains_business_unique unique (business_id),
  constraint public_site_domains_domain_unique unique (domain),
  constraint public_site_domains_domain_normalized check (
    domain = lower(domain)
    and domain !~ '[/:]'
    and domain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$'
  ),
  constraint public_site_domains_redirect_domain_normalized check (
    redirect_domain is null
    or (
      redirect_domain = lower(redirect_domain)
      and redirect_domain !~ '[/:]'
      and redirect_domain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$'
    )
  )
);

create index if not exists public_site_domains_active_domain_idx
  on public.public_site_domains (domain, business_id)
  where status = 'active';

alter table public.public_site_domains enable row level security;

revoke all on table public.public_site_domains from public, anon, authenticated;
grant all on table public.public_site_domains to service_role;

create trigger public_site_domains_set_updated_at
before update on public.public_site_domains
for each row execute function public.set_updated_at();

create or replace function public.can_manage_public_site_domain(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and public.can_configure_business(p_business_id);
$$;

create or replace function public.get_public_site_domain_management(p_business_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.can_manage_public_site_domain(p_business_id) then
    raise exception using
      errcode = '42501',
      message = 'public_site_domain_access_denied';
  end if;

  select to_jsonb(d)
  into result
  from public.public_site_domains d
  where d.business_id = p_business_id;

  return result;
end;
$$;

create or replace function public.resolve_public_site_domain(p_domain text)
returns table (
  business_id uuid,
  business_slug text,
  primary_locale text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id,
    b.slug,
    s.primary_locale
  from public.public_site_domains d
  join public.businesses b on b.id = d.business_id
  join public.public_site_settings s on s.business_id = b.id
  where d.domain = lower(trim(trailing '.' from coalesce(p_domain, '')))
    and d.status = 'active'
    and d.vercel_verified = true
    and d.dns_configured = true
    and b.status = 'active'
    and s.is_published = true
  limit 1;
$$;

revoke all on function public.can_manage_public_site_domain(uuid)
  from public, anon, authenticated;
grant execute on function public.can_manage_public_site_domain(uuid)
  to authenticated;

revoke all on function public.get_public_site_domain_management(uuid)
  from public, anon, authenticated;
grant execute on function public.get_public_site_domain_management(uuid)
  to authenticated;

revoke all on function public.resolve_public_site_domain(text)
  from public, anon, authenticated;
grant execute on function public.resolve_public_site_domain(text)
  to anon, authenticated;

comment on table public.public_site_domains is
  'Client-managed custom domain state synchronized with Vercel.';
comment on function public.resolve_public_site_domain(text) is
  'Resolves only active, verified custom domains for published public sites.';

commit;
