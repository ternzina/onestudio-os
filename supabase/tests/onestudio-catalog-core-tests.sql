\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(55);

select has_table('public', 'catalog_categories', 'catalog category table exists');
select has_column('public', 'catalog_categories', 'kind', 'catalog categories distinguish services and resources');
select has_column('public', 'services', 'category_id', 'services can belong to a catalog category');
select has_column('public', 'resources', 'category_id', 'resources can belong to a catalog category');
select has_function('public', 'replace_service_resources', array['uuid', 'uuid[]'], 'resource assignment RPC exists');
select has_function('public', 'seed_business_modules', array[]::text[], 'new workspace module seed function exists');
select has_trigger('public', 'businesses', 'seed_business_modules_after_insert', 'new workspaces receive module rows');
select has_trigger('public', 'catalog_categories', 'guard_catalog_category_identity', 'category scope cannot drift');
select has_trigger('public', 'services', 'guard_service_category', 'service categories are scope checked');
select has_trigger('public', 'resources', 'guard_resource_category', 'resource categories are scope checked');
select ok((select relrowsecurity from pg_class where oid = 'public.catalog_categories'::regclass), 'RLS is enabled on catalog categories');
select ok(has_table_privilege('anon', 'public.catalog_categories', 'SELECT'), 'anonymous visitors may read public categories');
select ok(not has_table_privilege('anon', 'public.catalog_categories', 'INSERT'), 'anonymous visitors cannot create categories');
select ok(has_function_privilege('authenticated', 'public.replace_service_resources(uuid,uuid[])', 'EXECUTE'), 'authenticated managers may call guarded resource replacement');
select ok(not has_function_privilege('anon', 'public.replace_service_resources(uuid,uuid[])', 'EXECUTE'), 'anonymous visitors cannot replace service resources');

insert into auth.users (id, email) values
  ('41000000-0000-4000-8000-000000000001', 'catalog.manager@example.test'),
  ('41000000-0000-4000-8000-000000000002', 'catalog.staff@example.test'),
  ('41000000-0000-4000-8000-000000000003', 'catalog.viewer@example.test'),
  ('41000000-0000-4000-8000-000000000004', 'catalog.outsider@example.test');

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency) values
  ('42000000-0000-4000-8000-000000000001', 'catalog-alpha', 'Catalog Alpha', 'Europe/Warsaw', 'pl', 'PLN'),
  ('42000000-0000-4000-8000-000000000002', 'catalog-beta', 'Catalog Beta', 'Europe/Kyiv', 'uk', 'UAH');

insert into public.business_members (business_id, user_id, role, is_default) values
  ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', 'manager', true),
  ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000002', 'staff', true),
  ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000003', 'viewer', true);

insert into public.catalog_categories (
  id, business_id, kind, slug, name, is_public, is_active, sort_order
) values
  ('43000000-0000-4000-8000-000000000005', '42000000-0000-4000-8000-000000000001', 'service', 'private-offers', 'Private offers', false, true, 90),
  ('43000000-0000-4000-8000-000000000006', '42000000-0000-4000-8000-000000000001', 'service', 'inactive-offers', 'Inactive offers', true, false, 100),
  ('43000000-0000-4000-8000-000000000007', '42000000-0000-4000-8000-000000000002', 'service', 'beta-offers', 'Beta offers', true, true, 10);

insert into public.services (
  id, business_id, category_id, slug, kind, title, pricing_model, price_minor, currency,
  duration_min_minutes, duration_max_minutes, duration_step_minutes, is_public, is_active
) values
  ('44000000-0000-4000-8000-000000000002', '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000005', 'private-service', 'appointment', 'Private service', 'fixed', 2500, 'PLN', 30, 30, 30, false, true),
  ('44000000-0000-4000-8000-000000000003', '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000006', 'inactive-service', 'appointment', 'Inactive service', 'fixed', 2500, 'PLN', 30, 30, 30, true, false);

insert into public.resources (
  id, business_id, slug, kind, name, is_public, is_active
) values
  ('45000000-0000-4000-8000-000000000002', '42000000-0000-4000-8000-000000000001', 'private-resource', 'equipment', 'Private resource', false, true),
  ('45000000-0000-4000-8000-000000000003', '42000000-0000-4000-8000-000000000001', 'inactive-resource', 'equipment', 'Inactive resource', true, false),
  ('45000000-0000-4000-8000-000000000004', '42000000-0000-4000-8000-000000000002', 'beta-resource', 'space', 'Beta resource', true, true);

select is(
  (select enabled from public.business_modules where business_id = '42000000-0000-4000-8000-000000000001' and module_key = 'catalog'),
  true,
  'new workspaces receive the enabled catalog module'
);
select is(
  (select version from public.business_modules where business_id = '42000000-0000-4000-8000-000000000001' and module_key = 'catalog'),
  '1.0.0',
  'new workspace catalog module records the stable version'
);

select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select ok(public.can_configure_business('42000000-0000-4000-8000-000000000001'), 'manager may configure the workspace catalog');
select lives_ok($sql$
  insert into public.catalog_categories (
    id, business_id, kind, slug, name, sort_order
  ) values (
    '43000000-0000-4000-8000-000000000001', '42000000-0000-4000-8000-000000000001',
    'service', 'offers', 'Offers', 10
  )
$sql$, 'manager can create a service category');
select lives_ok($sql$
  insert into public.catalog_categories (
    id, business_id, kind, slug, name, sort_order
  ) values (
    '43000000-0000-4000-8000-000000000002', '42000000-0000-4000-8000-000000000001',
    'resource', 'offers', 'Offer resources', 20
  )
$sql$, 'the same slug may exist in the other catalog scope');
select throws_ok($sql$
  insert into public.catalog_categories (business_id, kind, slug, name)
  values ('42000000-0000-4000-8000-000000000001', 'service', 'offers', 'Duplicate offers')
$sql$, '23505', null, 'category slugs remain unique inside one workspace and scope');
select lives_ok($sql$
  insert into public.services (
    id, business_id, category_id, slug, kind, title, pricing_model, price_minor, currency,
    duration_min_minutes, duration_max_minutes, duration_step_minutes, sort_order
  ) values (
    '44000000-0000-4000-8000-000000000001', '42000000-0000-4000-8000-000000000001',
    '43000000-0000-4000-8000-000000000001', 'main-service', 'appointment', 'Main service',
    'fixed', 5000, 'PLN', 60, 60, 30, 10
  )
$sql$, 'manager can create a categorized service');
select lives_ok($sql$
  insert into public.resources (
    id, business_id, category_id, slug, kind, name, sort_order
  ) values (
    '45000000-0000-4000-8000-000000000001', '42000000-0000-4000-8000-000000000001',
    '43000000-0000-4000-8000-000000000002', 'main-room', 'space', 'Main room', 10
  )
$sql$, 'manager can create a categorized resource');
select throws_ok($sql$
  insert into public.services (
    business_id, category_id, slug, kind, title, pricing_model, price_minor, currency
  ) values (
    '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000002',
    'wrong-service-category', 'appointment', 'Wrong service category', 'fixed', 1000, 'PLN'
  )
$sql$, '23514', 'catalog_category_kind_mismatch', 'a service cannot use a resource category');
select throws_ok($sql$
  insert into public.resources (
    business_id, category_id, slug, kind, name
  ) values (
    '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000001',
    'wrong-resource-category', 'space', 'Wrong resource category'
  )
$sql$, '23514', 'catalog_category_kind_mismatch', 'a resource cannot use a service category');
select throws_ok($sql$
  update public.catalog_categories
  set kind = 'resource'
  where id = '43000000-0000-4000-8000-000000000001'
$sql$, '23514', 'catalog_category_kind_is_immutable', 'a category cannot change scope after creation');
select throws_ok($sql$
  insert into public.services (
    business_id, category_id, slug, kind, title, pricing_model, price_minor, currency
  ) values (
    '42000000-0000-4000-8000-000000000001', '43000000-0000-4000-8000-000000000007',
    'cross-workspace-category', 'appointment', 'Cross workspace category', 'fixed', 1000, 'PLN'
  )
$sql$, '23503', 'catalog_category_workspace_mismatch', 'catalog items cannot use a category from another workspace');
select is(
  public.replace_service_resources(
    '44000000-0000-4000-8000-000000000001',
    array['45000000-0000-4000-8000-000000000001'::uuid, '45000000-0000-4000-8000-000000000001'::uuid]
  ),
  1,
  'resource replacement removes duplicate identifiers'
);
select is(
  (select count(*) from public.service_resources where service_id = '44000000-0000-4000-8000-000000000001'),
  1::bigint,
  'service resource assignment is stored once'
);
select throws_ok($sql$
  select public.replace_service_resources(
    '44000000-0000-4000-8000-000000000001',
    array['45000000-0000-4000-8000-000000000004'::uuid]
  )
$sql$, '23503', 'catalog_resource_workspace_mismatch', 'resource replacement rejects another workspace resource');
select lives_ok($sql$
  update public.services set sort_order = 25 where id = '44000000-0000-4000-8000-000000000001'
$sql$, 'manager can reorder services');
select lives_ok($sql$
  update public.resources set sort_order = 30 where id = '45000000-0000-4000-8000-000000000001'
$sql$, 'manager can reorder resources');

reset role;
select is((select sort_order from public.services where id = '44000000-0000-4000-8000-000000000001'), 25, 'service order persists');
select is((select sort_order from public.resources where id = '45000000-0000-4000-8000-000000000001'), 30, 'resource order persists');

select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.catalog_categories where business_id = '42000000-0000-4000-8000-000000000001'), 4::bigint, 'staff can read every category in its workspace');
select throws_ok($sql$
  insert into public.catalog_categories (business_id, kind, slug, name)
  values ('42000000-0000-4000-8000-000000000001', 'service', 'staff-category', 'Staff category')
$sql$, '42501', null, 'staff cannot create catalog categories');
select throws_ok($sql$
  insert into public.services (business_id, slug, kind, title, pricing_model, price_minor, currency)
  values ('42000000-0000-4000-8000-000000000001', 'staff-service', 'appointment', 'Staff service', 'fixed', 1000, 'PLN')
$sql$, '42501', null, 'staff cannot create services');

reset role;
select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.services where business_id = '42000000-0000-4000-8000-000000000001'), 3::bigint, 'viewer sees private and inactive workspace services');
select is((select count(*) from public.resources where business_id = '42000000-0000-4000-8000-000000000001'), 3::bigint, 'viewer sees private and inactive workspace resources');
select throws_ok($sql$
  insert into public.resources (business_id, slug, kind, name)
  values ('42000000-0000-4000-8000-000000000001', 'viewer-resource', 'space', 'Viewer resource')
$sql$, '42501', null, 'viewer cannot create resources');

reset role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;
select is((select count(*) from public.catalog_categories where business_id = '42000000-0000-4000-8000-000000000001'), 2::bigint, 'anonymous visitors see only active public categories');
select is((select count(*) from public.services where business_id = '42000000-0000-4000-8000-000000000001'), 1::bigint, 'anonymous visitors see only active public services');
select is((select count(*) from public.resources where business_id = '42000000-0000-4000-8000-000000000001'), 1::bigint, 'anonymous visitors see only active public resources');
select throws_ok($sql$
  insert into public.catalog_categories (business_id, kind, slug, name)
  values ('42000000-0000-4000-8000-000000000001', 'service', 'anonymous-category', 'Anonymous category')
$sql$, '42501', null, 'anonymous visitors cannot write the catalog');

reset role;
select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*) from public.catalog_categories where business_id = '42000000-0000-4000-8000-000000000001'), 2::bigint, 'authenticated outsiders see only public categories');
select is((select count(*) from public.services where business_id = '42000000-0000-4000-8000-000000000001'), 1::bigint, 'authenticated outsiders cannot see private services');
select is((select count(*) from public.resources where business_id = '42000000-0000-4000-8000-000000000001'), 1::bigint, 'authenticated outsiders cannot see private resources');
select throws_ok($sql$
  select public.replace_service_resources('44000000-0000-4000-8000-000000000001', '{}'::uuid[])
$sql$, '42501', 'catalog_configuration_forbidden', 'outsiders cannot replace service resources');

reset role;
select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select lives_ok($sql$
  delete from public.catalog_categories where id = '43000000-0000-4000-8000-000000000001'
$sql$, 'manager can remove a service category');
select lives_ok($sql$
  delete from public.catalog_categories where id = '43000000-0000-4000-8000-000000000002'
$sql$, 'manager can remove a resource category');

reset role;
select is((select category_id from public.services where id = '44000000-0000-4000-8000-000000000001'), null::uuid, 'deleting a category preserves the service and clears its category');
select is((select category_id from public.resources where id = '45000000-0000-4000-8000-000000000001'), null::uuid, 'deleting a category preserves the resource and clears its category');
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'catalog_categories_business_kind_active_idx'
  ),
  'catalog category ordering index exists'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'services_business_category_active_idx'
  ),
  'service category ordering index exists'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'resources_business_category_active_idx'
  ),
  'resource category ordering index exists'
);

select * from finish();
rollback;
