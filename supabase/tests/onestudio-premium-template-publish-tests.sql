\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(17);

insert into auth.users (id, email)
values ('fa100000-0000-4000-8000-000000000001', 'premium.publish@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  'fa200000-0000-4000-8000-000000000001',
  'premium-publish-test',
  'Premium Publish Test',
  'Europe/Kyiv',
  'en',
  'EUR',
  'active'
);

insert into public.business_members (business_id, user_id, role, is_default)
values (
  'fa200000-0000-4000-8000-000000000001',
  'fa100000-0000-4000-8000-000000000001',
  'owner',
  true
);

select set_config('request.jwt.claim.sub', 'fa100000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.save_public_site_draft(
      'fa200000-0000-4000-8000-000000000001',
      'en',
      '{
        "template_id":"premium-kids-center",
        "brand_name":"BEMBI",
        "hero_title":"Legacy title",
        "layout_order":["section:hero","section:about"],
        "template_content":{
          "premium-kids-center":{
            "blocks":[
              {"id":"bembi-header","type":"header","visible":true,"props":{"brand_name":"BEMBI"}},
              {"id":"bembi-hero","type":"hero","visible":true,"props":{"hero_title":"Published Premium title"}},
              {"id":"universal-text-a","type":"text","visible":true,"props":{"universal_block":{"id":"universal-text-a","kind":"text","title":"Published universal text","text":"Body"}}},
              {"id":"universal-columns-a","type":"columns","visible":true,"props":{"universal_block":{"id":"universal-columns-a","kind":"columns","title":"Two columns","columns_count":2,"cards":[{"id":"card-a","title":"A","text":"A"},{"id":"card-b","title":"B","text":"B"},{"id":"card-c","title":"C","text":"C"}]}}},
              {"id":"hidden-review-a","type":"reviews","visible":false,"props":{"reviews_title":"Hidden reviews"}},
              {"id":"bembi-footer","type":"footer","visible":true,"props":{"footer_description":"Footer"}}
            ]
          }
        }
      }'::jsonb,
      true
    )
  $sql$,
  'Premium draft with universal blocks saves through the real RPC'
);

reset role;

select isnt(
  (select published_content from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'),
  (select draft_content from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'),
  'draft save leaves the prior published snapshot unchanged'
);

set local role authenticated;

select lives_ok(
  $sql$
    select public.publish_public_site('fa200000-0000-4000-8000-000000000001', 'en')
  $sql$,
  'explicit Publish accepts the saved Premium draft'
);

reset role;

select is(
  (select published_content from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'),
  (select draft_content from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'),
  'Publish promotes the complete validated draft snapshot'
);
select is((select published_content->>'template_id' from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), 'premium-kids-center', 'template id publishes');
select ok((select published_content ? 'layout_order' from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), 'existing Standard namespace publishes alongside Premium content');
select ok((select published_content->'template_content' ? 'premium-kids-center' from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), 'Premium template namespace publishes');
select is((select jsonb_array_length(published_content->'template_content'->'premium-kids-center'->'blocks') from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), 6, 'ordered block composition publishes without filtering');
select is((select published_content->'template_content'->'premium-kids-center'->'blocks'->2->>'id' from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), 'universal-text-a', 'stable universal block id publishes');
select is((select published_content->'template_content'->'premium-kids-center'->'blocks'->2->'props'->'universal_block'->>'title' from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), 'Published universal text', 'modified universal content publishes');
select is((select (published_content->'template_content'->'premium-kids-center'->'blocks'->3->'props'->'universal_block'->>'columns_count')::integer from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), 2, 'two-column setting publishes');
select is((select (published_content->'template_content'->'premium-kids-center'->'blocks'->4->>'visible')::boolean from public.public_site_locales where business_id = 'fa200000-0000-4000-8000-000000000001' and locale = 'en'), false, 'visibility publishes');
select is(public.get_public_site('premium-publish-test', null)->'content'->'template_content'->'premium-kids-center'->'blocks'->2->>'id', 'universal-text-a', 'public runtime receives the published universal block');
select is(public.get_public_site('premium-publish-test', null)->'content'->'template_content'->'premium-kids-center'->'blocks'->3->'props'->'universal_block'->>'title', 'Two columns', 'public runtime receives universal block props');
select is(public.get_public_site('premium-publish-test', null)->'content'->>'hero_title', 'Legacy title', 'old flat Premium fields remain backward compatible');
select function_privs_are('public', 'publish_public_site', array['uuid','text'], 'authenticated', array['EXECUTE'], 'authenticated retains Publish access');
select function_privs_are('public', 'publish_public_site', array['uuid','text'], 'service_role', array['EXECUTE'], 'service role retains Publish access');

select * from finish();
rollback;
