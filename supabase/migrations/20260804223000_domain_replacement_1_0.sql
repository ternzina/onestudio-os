begin;

create table if not exists public.public_site_domain_replacements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  current_domain text not null,
  current_redirect_domain text,
  candidate_domain text not null,
  candidate_redirect_domain text,
  phase text not null default 'preparing'
    check (phase in ('preparing', 'ready', 'cleanup_pending', 'error')),
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
  constraint public_site_domain_replacements_business_unique unique (business_id),
  constraint public_site_domain_replacements_candidate_unique unique (candidate_domain),
  constraint public_site_domain_replacements_domains_differ
    check (candidate_domain <> current_domain),
  constraint public_site_domain_replacements_current_normalized check (
    current_domain = lower(current_domain)
    and current_domain !~ '[/:]'
  ),
  constraint public_site_domain_replacements_current_redirect_normalized check (
    current_redirect_domain is null
    or (
      current_redirect_domain = lower(current_redirect_domain)
      and current_redirect_domain !~ '[/:]'
    )
  ),
  constraint public_site_domain_replacements_candidate_normalized check (
    candidate_domain = lower(candidate_domain)
    and candidate_domain !~ '[/:]'
    and candidate_domain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$'
  ),
  constraint public_site_domain_replacements_candidate_redirect_normalized check (
    candidate_redirect_domain is null
    or (
      candidate_redirect_domain = lower(candidate_redirect_domain)
      and candidate_redirect_domain !~ '[/:]'
    )
  )
);

create index if not exists public_site_domain_replacements_phase_idx
  on public.public_site_domain_replacements (phase, updated_at desc);

alter table public.public_site_domain_replacements enable row level security;

revoke all on table public.public_site_domain_replacements
  from public, anon, authenticated;

grant select, insert, update, delete on table public.public_site_domain_replacements
  to service_role;

drop trigger if exists public_site_domain_replacements_set_updated_at
  on public.public_site_domain_replacements;

create trigger public_site_domain_replacements_set_updated_at
before update on public.public_site_domain_replacements
for each row execute function public.set_updated_at();

create or replace function public.promote_public_site_domain_replacement(
  p_business_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.public_site_domains%rowtype;
  replacement_row public.public_site_domain_replacements%rowtype;
  promoted_row public.public_site_domains%rowtype;
begin
  select *
  into current_row
  from public.public_site_domains
  where business_id = p_business_id
  for update;

  if current_row.id is null then
    raise exception using
      errcode = 'P0002',
      message = 'current_domain_not_found';
  end if;

  select *
  into replacement_row
  from public.public_site_domain_replacements
  where business_id = p_business_id
  for update;

  if replacement_row.id is null then
    raise exception using
      errcode = 'P0002',
      message = 'domain_replacement_not_found';
  end if;

  if replacement_row.phase <> 'ready'
    or replacement_row.status <> 'active'
    or replacement_row.vercel_verified is not true
    or replacement_row.dns_configured is not true
    or replacement_row.ssl_ready is not true
  then
    raise exception using
      errcode = 'P0001',
      message = 'replacement_domain_not_ready';
  end if;

  if exists (
    select 1
    from public.public_site_domains d
    where d.domain = replacement_row.candidate_domain
      and d.business_id <> p_business_id
  ) then
    raise exception using
      errcode = '23505',
      message = 'replacement_domain_in_use';
  end if;

  update public.public_site_domains
  set
    domain = replacement_row.candidate_domain,
    redirect_domain = replacement_row.candidate_redirect_domain,
    status = replacement_row.status,
    ownership_verification_required = replacement_row.ownership_verification_required,
    vercel_verified = replacement_row.vercel_verified,
    dns_configured = replacement_row.dns_configured,
    ssl_ready = replacement_row.ssl_ready,
    verification = replacement_row.verification,
    dns_records = replacement_row.dns_records,
    last_error = null,
    last_checked_at = replacement_row.last_checked_at
  where business_id = p_business_id
  returning * into promoted_row;

  update public.public_site_domain_replacements
  set
    current_domain = current_row.domain,
    current_redirect_domain = current_row.redirect_domain,
    phase = 'cleanup_pending',
    last_error = null
  where business_id = p_business_id
  returning * into replacement_row;

  return jsonb_build_object(
    'oldDomain', current_row.domain,
    'oldRedirectDomain', current_row.redirect_domain,
    'domain', to_jsonb(promoted_row),
    'replacement', to_jsonb(replacement_row)
  );
end;
$$;

revoke all on function public.promote_public_site_domain_replacement(uuid)
  from public, anon, authenticated;

grant execute on function public.promote_public_site_domain_replacement(uuid)
  to service_role;

comment on table public.public_site_domain_replacements is
  'Staged custom-domain replacement. The current domain remains live until the candidate domain is active with HTTPS.';

comment on column public.public_site_domain_replacements.phase is
  'preparing, ready, cleanup_pending, or error.';

comment on function public.promote_public_site_domain_replacement(uuid) is
  'Atomically promotes a verified candidate domain while preserving the previous domain for safe Vercel cleanup.';

commit;
