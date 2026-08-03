
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(15);

select has_table('public', 'public_site_domains', 'client domain table exists');
select has_column('public', 'public_site_domains', 'domain', 'domain column exists');
select has_column('public', 'public_site_domains', 'dns_records', 'DNS records column exists');
select has_column('public', 'public_site_domains', 'status', 'domain status column exists');
select has_function('public', 'can_manage_public_site_domain', array['uuid'], 'domain access RPC exists');
select has_function('public', 'resolve_public_site_domain', array['text'], 'public domain resolver exists');
select has_function('public', 'get_public_site_domain_management', array['uuid'], 'domain management RPC exists');

insert into auth.users (id, email) values
  ('91000000-0000-4000-8000-000000000001', 'domain.owner@example.test'),
  ('91000000-0000-4000-8000-000000000002', 'domain.other@example.test');

insert into public.profiles (id, name, email, role) values
  ('91000000-0000-4000-8000-000000000001', 'Domain Owner', 'domain.owner@example.test', 'client'),
  ('91000000-0000-4000-8000-000000000002', 'Domain Other', 'domain.other@example.test', 'client')
on conflict (id) do update set email = excluded.email;

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  '92000000-0000-4000-8000-000000000001',
  'domain-studio',
  'Domain Studio',
  'Europe/Kyiv',
  'ru',
  'EUR',
  'active'
);

insert into public.business_members (
  business_id, user_id, role, is_active, is_default
) values (
  '92000000-0000-4000-8000-000000000001',
  '91000000-0000-4000-8000-000000000001',
  'owner',
  true,
  true
);

update public.public_site_settings
set
  is_published = true,
  primary_locale = 'ru',
  published_at = now()
where business_id = '92000000-0000-4000-8000-000000000001';

insert into public.public_site_domains (
  business_id,
  domain,
  status,
  vercel_verified,
  dns_configured,
  ssl_ready,
  created_by
) values (
  '92000000-0000-4000-8000-000000000001',
  'domain-studio.example',
  'dns_pending',
  true,
  false,
  false,
  '91000000-0000-4000-8000-000000000001'
);

select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select ok(
  public.can_manage_public_site_domain('92000000-0000-4000-8000-000000000001'),
  'workspace owner can manage custom domain'
);
select is(
  (select count(*) from public.resolve_public_site_domain('domain-studio.example')),
  0::bigint,
  'pending DNS domain is not publicly resolved'
);
select is(
  public.get_public_site_domain_management('92000000-0000-4000-8000-000000000001')->>'domain',
  'domain-studio.example',
  'owner reads domain management state'
);

reset role;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select isnt(
  public.can_manage_public_site_domain('92000000-0000-4000-8000-000000000001'),
  true,
  'unassigned user cannot manage custom domain'
);

reset role;

update public.public_site_domains
set status = 'active', dns_configured = true, ssl_ready = true
where business_id = '92000000-0000-4000-8000-000000000001';

set local role anon;

select is(
  (select business_slug from public.resolve_public_site_domain('DOMAIN-STUDIO.EXAMPLE.')),
  'domain-studio',
  'active domain resolves case-insensitively with trailing dot'
);
select is(
  (select primary_locale from public.resolve_public_site_domain('domain-studio.example')),
  'ru',
  'domain resolver returns primary locale'
);
select is(
  (select count(*) from public.resolve_public_site_domain('unknown.example')),
  0::bigint,
  'unknown domain does not resolve'
);

reset role;
update public.public_site_settings
set is_published = false, published_at = null
where business_id = '92000000-0000-4000-8000-000000000001';
set local role anon;

select is(
  (select count(*) from public.resolve_public_site_domain('domain-studio.example')),
  0::bigint,
  'unpublished site is not exposed through custom domain'
);

reset role;


select * from finish();
rollback;
