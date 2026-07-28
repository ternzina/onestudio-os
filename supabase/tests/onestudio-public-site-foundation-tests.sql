\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(44);

select has_table('public', 'public_site_settings', 'public site settings table exists');
select has_table('public', 'public_site_locales', 'public site locale table exists');
select has_column('public', 'media_library', 'business_id', 'media records are tenant scoped');
select has_column('public', 'portfolio_projects', 'business_id', 'portfolio projects are tenant scoped');
select has_column('public', 'portfolio_project_images', 'business_id', 'portfolio project media is tenant scoped');
select has_function('public', 'get_public_site', array['text','text'], 'published site projection RPC exists');
select has_function('public', 'get_public_site_editor', array['uuid'], 'protected site editor RPC exists');
select has_function('public', 'save_public_site_draft', array['uuid','text','jsonb','boolean'], 'draft save RPC exists');
select has_function('public', 'publish_public_site', array['uuid','text'], 'site publication RPC exists');
select has_function('public', 'unpublish_public_site', array['uuid'], 'site unpublish RPC exists');
select has_function('public', 'list_public_site_paths', array[]::text[], 'public sitemap projection RPC exists');

select ok(
  has_function_privilege('anon', 'public.get_public_site(text,text)', 'EXECUTE'),
  'anonymous visitors can load a published site'
);
select ok(
  has_function_privilege('anon', 'public.list_public_site_paths()', 'EXECUTE'),
  'anonymous crawlers can list published paths'
);
select ok(
  not has_function_privilege('anon', 'public.save_public_site_draft(uuid,text,jsonb,boolean)', 'EXECUTE'),
  'anonymous visitors cannot save site drafts'
);
select ok(
  not has_table_privilege('anon', 'public.public_site_locales', 'SELECT'),
  'anonymous visitors cannot inspect draft rows'
);
select ok(
  not has_table_privilege('anon', 'public.media_library', 'SELECT'),
  'anonymous visitors cannot inspect media rows directly'
);

insert into auth.users (id, email) values
  ('e1000000-0000-4000-8000-000000000001', 'alpha.owner@example.test'),
  ('e1000000-0000-4000-8000-000000000002', 'beta.owner@example.test'),
  ('e1000000-0000-4000-8000-000000000099', 'outsider@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values
  ('e2000000-0000-4000-8000-000000000001', 'site-alpha', 'Site Alpha', 'Europe/Kyiv', 'en', 'EUR', 'active'),
  ('e2000000-0000-4000-8000-000000000002', 'site-beta', 'Site Beta', 'Europe/Warsaw', 'pl', 'PLN', 'active');

insert into public.business_members (
  business_id, user_id, role, is_default
) values
  ('e2000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'owner', true),
  ('e2000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000002', 'owner', true);

insert into public.company_profiles (
  business_id, display_name, email, phone, address, default_currency, timezone
) values
  ('e2000000-0000-4000-8000-000000000001', 'Alpha Studio', 'hello@alpha.test', '+380111111111', 'Kyiv', 'EUR', 'Europe/Kyiv'),
  ('e2000000-0000-4000-8000-000000000002', 'Beta Studio', 'hello@beta.test', '+48111111111', 'Warsaw', 'PLN', 'Europe/Warsaw')
on conflict (business_id) do update set
  display_name = excluded.display_name,
  email = excluded.email,
  phone = excluded.phone,
  address = excluded.address;

insert into public.business_modules (business_id, module_key, enabled, version) values
  ('e2000000-0000-4000-8000-000000000001', 'core', true, '1.1.0'),
  ('e2000000-0000-4000-8000-000000000001', 'catalog', true, '1.0.0'),
  ('e2000000-0000-4000-8000-000000000001', 'scheduling', true, '1.3.0'),
  ('e2000000-0000-4000-8000-000000000001', 'portfolio', true, '1.0.0'),
  ('e2000000-0000-4000-8000-000000000001', 'media', true, '1.0.0'),
  ('e2000000-0000-4000-8000-000000000002', 'core', true, '1.1.0'),
  ('e2000000-0000-4000-8000-000000000002', 'catalog', true, '1.0.0'),
  ('e2000000-0000-4000-8000-000000000002', 'portfolio', true, '1.0.0'),
  ('e2000000-0000-4000-8000-000000000002', 'media', true, '1.0.0')
on conflict (business_id, module_key) do update set enabled = excluded.enabled;

insert into public.services (
  id, business_id, slug, kind, title, description, pricing_model,
  price_minor, currency, duration_min_minutes, duration_max_minutes,
  duration_step_minutes, capacity, is_public, is_active, sort_order
) values
  ('e3000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000001', 'alpha-public', 'appointment', 'Alpha public service', 'Visible service', 'fixed', 10000, 'EUR', 60, 60, 30, 1, true, true, 1),
  ('e3000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000001', 'alpha-private', 'appointment', 'Alpha private service', 'Hidden service', 'fixed', 20000, 'EUR', 60, 60, 30, 1, false, true, 2),
  ('e3000000-0000-4000-8000-000000000003', 'e2000000-0000-4000-8000-000000000002', 'beta-public', 'appointment', 'Beta public service', 'Other workspace', 'fixed', 30000, 'PLN', 60, 60, 30, 1, true, true, 1);

insert into public.media_library (
  id, business_id, image_url, r2_key, original_filename, mime_type, is_active
) values
  ('e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000001', 'https://cdn.example.test/alpha.webp', 'businesses/alpha/alpha.webp', 'alpha.webp', 'image/webp', true),
  ('e4000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000002', 'https://cdn.example.test/beta.webp', 'businesses/beta/beta.webp', 'beta.webp', 'image/webp', true);

insert into public.portfolio_categories (
  id, business_id, name, slug, is_active, sort_order
) values
  ('e5000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000001', 'Alpha category', 'work', true, 1),
  ('e5000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000002', 'Beta category', 'work', true, 1);

insert into public.portfolio_projects (
  id, business_id, category_id, slug, title, description, cover_media_id, is_active, sort_order
) values
  ('e6000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000001', 'alpha-project', 'Alpha project', 'Visible project', 'e4000000-0000-4000-8000-000000000001', true, 1),
  ('e6000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000002', 'e5000000-0000-4000-8000-000000000002', 'beta-project', 'Beta project', 'Other workspace', 'e4000000-0000-4000-8000-000000000002', true, 1);

select ok(
  exists (
    select 1 from public.public_site_locales
    where business_id = 'e2000000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'new workspaces automatically receive a default language draft'
);
select ok(
  public.get_public_site('site-alpha', null) is null,
  'an unpublished workspace has no public site'
);

select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.save_public_site_draft(
      'e2000000-0000-4000-8000-000000000001',
      'en',
      '{"hero_title":"Alpha published title","hero_text":"Alpha public introduction","about_text":"Alpha about","seo_title":"Alpha SEO","seo_description":"Alpha description","show_services":true,"show_portfolio":true}'::jsonb,
      true
    )
  $sql$,
  'workspace owner saves a normalized draft'
);
select is(
  public.get_public_site_editor('e2000000-0000-4000-8000-000000000001')->'business'->>'slug',
  'site-alpha',
  'workspace owner can load the protected editor projection'
);
select lives_ok(
  $sql$
    select public.publish_public_site(
      'e2000000-0000-4000-8000-000000000001',
      'en'
    )
  $sql$,
  'workspace owner publishes one locale atomically'
);

reset role;

select is(
  public.get_public_site('site-alpha', null)->'content'->>'hero_title',
  'Alpha published title',
  'public site returns the published content'
);
select is(
  public.get_public_site(' SITE-ALPHA ', null)->'business'->>'slug',
  'site-alpha',
  'public site normalizes the business slug'
);
select is(
  public.get_public_site('site-alpha', null)->'company'->>'email',
  'hello@alpha.test',
  'public site exposes only the intended company contact'
);
select is(
  jsonb_array_length(public.get_public_site('site-alpha', null)->'services'),
  1,
  'public site includes only active public services from its workspace'
);
select ok(
  not exists (
    select 1
    from jsonb_array_elements(public.get_public_site('site-alpha', null)->'services') service
    where service->>'title' in ('Alpha private service', 'Beta public service')
  ),
  'private and cross-workspace services never leak'
);
select is(
  jsonb_array_length(public.get_public_site('site-alpha', null)->'portfolio'),
  1,
  'public site includes its active portfolio project'
);
select is(
  public.get_public_site('site-alpha', null)->'portfolio'->0->>'title',
  'Alpha project',
  'public portfolio stays inside the resolved workspace'
);
select is(
  public.get_public_site('site-alpha', null)->'capabilities'->>'booking',
  'true',
  'public projection advertises enabled booking'
);
select ok(
  public.get_public_site('missing-site', null) is null,
  'unknown workspace slugs return no public data'
);

select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.save_public_site_draft(
      'e2000000-0000-4000-8000-000000000001',
      'en',
      '{"hero_title":"Unpublished replacement","show_services":true,"show_portfolio":true}'::jsonb,
      true
    )
  $sql$,
  'owner may continue editing after publication'
);

reset role;

select is(
  public.get_public_site('site-alpha', null)->'content'->>'hero_title',
  'Alpha published title',
  'saved drafts do not overwrite the live site'
);

select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.save_public_site_draft(
      'e2000000-0000-4000-8000-000000000001',
      'uk',
      '{"hero_title":"Українська версія","show_services":true,"show_portfolio":true}'::jsonb,
      false
    )
  $sql$,
  'owner can add another language draft'
);

reset role;

select ok(
  public.get_public_site('site-alpha', 'uk')->'business'->>'locale' = 'en',
  'an unpublished requested locale falls back to the published primary locale'
);

select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.publish_public_site(
      'e2000000-0000-4000-8000-000000000001',
      'uk'
    )
  $sql$,
  'owner publishes the second language'
);

reset role;

select is(
  public.get_public_site('site-alpha', 'uk')->'content'->>'hero_title',
  'Українська версія',
  'published locale returns its own content'
);
select is(
  (
    select count(*)
    from public.list_public_site_paths()
    where business_slug = 'site-alpha'
  ),
  2::bigint,
  'sitemap projection lists every published locale'
);

update public.business_modules
set enabled = false
where business_id = 'e2000000-0000-4000-8000-000000000001'
  and module_key = 'portfolio';

select is(
  jsonb_array_length(public.get_public_site('site-alpha', null)->'portfolio'),
  0,
  'disabled portfolio module removes portfolio from the public projection'
);

select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  (select count(*) from public.media_library),
  1::bigint,
  'workspace RLS exposes only the current owner media'
);
select is(
  (select count(*) from public.portfolio_projects),
  1::bigint,
  'workspace RLS exposes only the current owner projects'
);

reset role;
select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000099', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $sql$
    select public.save_public_site_draft(
      'e2000000-0000-4000-8000-000000000001',
      'en',
      '{}'::jsonb,
      false
    )
  $sql$,
  '42501',
  'public_site_configuration_forbidden',
  'outsider cannot edit another workspace site'
);

reset role;
select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.unpublish_public_site(
      'e2000000-0000-4000-8000-000000000001'
    )
  $sql$,
  'owner may unpublish the complete site'
);

reset role;

select ok(
  public.get_public_site('site-alpha', null) is null,
  'unpublished site disappears without deleting drafts or published snapshots'
);
select is(
  (
    select count(*)
    from public.list_public_site_paths()
    where business_slug = 'site-alpha'
  ),
  0::bigint,
  'unpublished site disappears from the sitemap projection'
);

select * from finish();
rollback;
