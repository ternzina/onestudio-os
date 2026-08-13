\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(16);

select has_function('public', 'normalize_public_site_native_action_styles', array['jsonb'], 'shared native action style validator exists');
select has_function('public', 'save_public_site_draft_v_native_action_styles_3_2_7', array['uuid','text','jsonb','boolean'], 'complete Rich Heading predecessor is retained');

select is(
  public.normalize_public_site_native_action_styles('{
    "gloss-nail-studio:hero:gloss-hero-primary-action":{"size":"large","background_color":"#ABCDEF","text_color":"invalid"},
    "bad key":{"size":"small"},
    "velora-event-venue:hero:header-cta":{"size":"huge","background_color":"#12345g"},
    "premium-studio:hero:hero-cta":"poison"
  }'::jsonb),
  '{"gloss-nail-studio:hero:gloss-hero-primary-action":{"size":"large","background_color":"#abcdef"}}'::jsonb,
  'invalid keys, entries and properties are ignored while valid properties normalize safely'
);

insert into auth.users (id, email)
values ('32700000-0000-4000-8000-000000000001', 'native-actions@example.test');

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency, status)
values ('32700000-0000-4000-8000-000000000002', 'native-actions-test', 'Native Actions', 'Europe/Kyiv', 'en', 'EUR', 'active');

insert into public.business_members (business_id, user_id, role, is_default)
values ('32700000-0000-4000-8000-000000000002', '32700000-0000-4000-8000-000000000001', 'owner', true);

select set_config('request.jwt.claim.sub', '32700000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok($sql$
  select public.save_public_site_draft(
    '32700000-0000-4000-8000-000000000002', 'en',
    '{
      "template_id":"gloss-nail-studio",
      "brand_name":"Round trip",
      "layout_order":["section:services","section:portfolio","section:about","section:contact"],
      "native_action_styles":{
        "gloss-nail-studio:hero:gloss-hero-primary-action":{"size":"large","background_color":"#112233","text_color":"#ffffff"},
        "gloss-nail-studio:about:gloss-about-action":{"size":"small"},
        "velora-event-venue:hero:velora-hero-primary-action":{"size":"medium","background_color":"#abcdef"},
        "premium-studio:hero:hero-cta":{"size":"large","text_color":"#fedcba"}
      }
    }'::jsonb, true
  )
$sql$, 'GLOSS, VELORA and NOIR styles save together through the real RPC');

reset role;

select is((select draft_content->'native_action_styles'->'gloss-nail-studio:hero:gloss-hero-primary-action' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), '{"size":"large","background_color":"#112233","text_color":"#ffffff"}'::jsonb, 'GLOSS appearance round-trips');
select is((select draft_content->'native_action_styles'->'velora-event-venue:hero:velora-hero-primary-action' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), '{"size":"medium","background_color":"#abcdef"}'::jsonb, 'VELORA appearance round-trips');
select is((select draft_content->'native_action_styles'->'premium-studio:hero:hero-cta' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), '{"size":"large","text_color":"#fedcba"}'::jsonb, 'NOIR Premium Studio appearance round-trips');
select is((select jsonb_object_length(draft_content->'native_action_styles') from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), 4, 'multiple action styles survive one draft');

set local role authenticated;
select lives_ok($sql$
  select public.save_public_site_draft(
    '32700000-0000-4000-8000-000000000002', 'en',
    (select draft_content || jsonb_build_object('brand_name', 'Unrelated edit') from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), false
  )
$sql$, 'an unrelated full-document save succeeds');
reset role;

select is((select draft_content->'native_action_styles'->'premium-studio:hero:hero-cta'->>'text_color' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), '#fedcba', 'unrelated save does not corrupt button styles');

set local role authenticated;
select lives_ok($sql$select public.publish_public_site('32700000-0000-4000-8000-000000000002', 'en')$sql$, 'publish promotes the saved action styles');
reset role;

select is((select published_content->'native_action_styles' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), (select draft_content->'native_action_styles' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), 'publish retains all saved native action styles');

set local role authenticated;
select public.save_public_site_draft('32700000-0000-4000-8000-000000000002', 'en', '{"template_id":"gloss-nail-studio","native_action_styles":{}}'::jsonb, false);
reset role;
select ok(not (select draft_content ? 'native_action_styles' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), 'explicit empty map clears saved overrides');

set local role authenticated;
select public.save_public_site_draft('32700000-0000-4000-8000-000000000002', 'en', '{"template_id":"gloss-nail-studio","native_action_styles":{"gloss-nail-studio:hero:gloss-hero-primary-action":{"size":"small"}}}'::jsonb, false);
select public.save_public_site_draft('32700000-0000-4000-8000-000000000002', 'en', '{"template_id":"gloss-nail-studio"}'::jsonb, false);
reset role;
select ok(not (select draft_content ? 'native_action_styles' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), 'absent map is also an authoritative reset and does not resurrect prior styles');

set local role authenticated;
select public.save_public_site_draft('32700000-0000-4000-8000-000000000002', 'en', '{"template_id":"premium-kids-center","template_content":{"premium-kids-center":{"blocks":[{"id":"bembi-hero","type":"hero","props":{"native_buttons":{"primary_cta_label":{"size":"large","backgroundColor":"#123456"}}}}]}}}'::jsonb, false);
reset role;
select is((select draft_content->'template_content'->'premium-kids-center'->'blocks'->0->'props'->'native_buttons'->'primary_cta_label'->>'size' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), 'large', 'BEMBI native_buttons remains compatible on template_content');
select ok(not (select draft_content ? 'native_action_styles' from public.public_site_locales where business_id='32700000-0000-4000-8000-000000000002' and locale='en'), 'BEMBI save does not acquire a replacement shared-map persistence path');

select * from finish();
rollback;
