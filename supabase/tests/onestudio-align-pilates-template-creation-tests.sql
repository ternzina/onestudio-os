\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

select is((select seed_template_id from public.site_template_registry where template_key = 'align-pilates-studio'), 'align-pilates-studio', 'ALIGN registry uses canonical seed identity');
select ok((select is_customer_creatable and is_active from public.site_template_registry where template_key = 'align-pilates-studio'), 'ALIGN registry is active and customer creatable');

insert into auth.users (id, email, raw_user_meta_data) values ('a1100000-0000-4000-8000-000000000001', 'align-creation@example.test', '{"full_name":"ALIGN Verification"}'::jsonb);
select set_config('request.jwt.claim.sub', 'a1100000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok($sql$
  select * from public.create_template_workspace('{
    "launch_id":"a1200000-0000-4000-8000-000000000001",
    "creation_mode":"template",
    "template_key":"align-pilates-studio",
    "template_seed":{"template_id":"align-pilates-studio","brand_name":"ALIGN Pilates Studio","hero_title":"Тело, в котором легко жить","layout_order":["native:align-pilates-studio:hero","native:align-pilates-studio:formats","native:align-pilates-studio:benefits","native:align-pilates-studio:schedule","native:align-pilates-studio:trainers","native:align-pilates-studio:trial","native:align-pilates-studio:memberships","native:align-pilates-studio:studio","native:align-pilates-studio:testimonial","native:align-pilates-studio:faq","native:align-pilates-studio:contacts","native:align-pilates-studio:footer"],"template_content":{"align-pilates-studio":{"hero":{"image":"/templates/align-pilates/hero.webp"},"trainers":[{"image":"/templates/align-pilates/trainer-elena.webp"}],"studio":[{"image":"/templates/align-pilates/studio-1.webp"}]}}},
    "template_seeds":{"ru":{"template_id":"align-pilates-studio","brand_name":"ALIGN Pilates Studio","layout_order":["native:align-pilates-studio:hero","native:align-pilates-studio:formats","native:align-pilates-studio:benefits","native:align-pilates-studio:schedule","native:align-pilates-studio:trainers","native:align-pilates-studio:trial","native:align-pilates-studio:memberships","native:align-pilates-studio:studio","native:align-pilates-studio:testimonial","native:align-pilates-studio:faq","native:align-pilates-studio:contacts","native:align-pilates-studio:footer"],"template_content":{"align-pilates-studio":{"hero":{"image":"/templates/align-pilates/hero.webp"}}}},"en":{"template_id":"align-pilates-studio","brand_name":"ALIGN Pilates Studio","layout_order":["native:align-pilates-studio:hero","native:align-pilates-studio:formats","native:align-pilates-studio:benefits","native:align-pilates-studio:schedule","native:align-pilates-studio:trainers","native:align-pilates-studio:trial","native:align-pilates-studio:memberships","native:align-pilates-studio:studio","native:align-pilates-studio:testimonial","native:align-pilates-studio:faq","native:align-pilates-studio:contacts","native:align-pilates-studio:footer"],"template_content":{"align-pilates-studio":{"hero":{"image":"/templates/align-pilates/hero.webp"}}}}},
    "business_name":"ALIGN Verification Studio","business_type":"other","timezone":"Europe/Kyiv","locale":"ru","locales":["ru","en"],"primary_locale":"ru","currency":"UAH","country_code":"UA","email":"align-creation@example.test","phone":"+380441234567","address":"Киев","service_title":"Reformer Start","service_kind":"class","pricing_model":"fixed","price_minor":65000,"duration_minutes":50,"service_capacity":6,"resource_name":"Reformer room","resource_kind":"space","resource_capacity":6,"open_time":"07:00","close_time":"21:00","work_days":[1,2,3,4,5,6],"enabled_modules":[]
  }'::jsonb)
$sql$, 'actual canonical customer creation succeeds without template_key_invalid');
reset role;

select is((select locale.draft_content->>'template_id' from public.public_site_locales locale join public.business_members member on member.business_id=locale.business_id where member.user_id='a1100000-0000-4000-8000-000000000001' and locale.locale='ru'), 'align-pilates-studio', 'created workspace has canonical template_id');
select is((select profile.demo_slug from public.business_launch_profiles profile join public.business_members member on member.business_id=profile.business_id where member.user_id='a1100000-0000-4000-8000-000000000001'), null, 'created package workspace keeps demo_slug NULL');
select is((select count(*) from public.public_site_locales locale join public.business_members member on member.business_id=locale.business_id where member.user_id='a1100000-0000-4000-8000-000000000001'), 2::bigint, 'RU and EN drafts are installed');
select is((select jsonb_array_length(locale.draft_content->'layout_order') from public.public_site_locales locale join public.business_members member on member.business_id=locale.business_id where member.user_id='a1100000-0000-4000-8000-000000000001' and locale.locale='ru'), 12, 'all canonical native tokens reach the editor draft');
select is((select locale.draft_content->'template_content'->'align-pilates-studio'->'hero'->>'image' from public.public_site_locales locale join public.business_members member on member.business_id=locale.business_id where member.user_id='a1100000-0000-4000-8000-000000000001' and locale.locale='ru'), '/templates/align-pilates/hero.webp', 'real ALIGN hero photo reaches the created draft');

set local role authenticated;
select lives_ok($sql$select public.save_public_site_draft((select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001'), 'ru', (select draft_content || '{"hero_title":"ALIGN saved"}'::jsonb from public.public_site_locales where business_id=(select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001') and locale='ru'), true)$sql$, 'editor save RPC accepts the created ALIGN draft');
reset role;
select is((select draft_content->>'hero_title' from public.public_site_locales where business_id=(select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001') and locale='ru'), 'ALIGN saved', 'saved content round-trips');
select is((select jsonb_array_length(draft_content->'layout_order') from public.public_site_locales where business_id=(select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001') and locale='ru'), 12, 'save retains canonical native layout order');

set local role authenticated;
select lives_ok($sql$select public.publish_public_site((select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001'), 'ru')$sql$, 'editor publish RPC succeeds locally');
reset role;
select is((select published_content->'layout_order' from public.public_site_locales where business_id=(select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001') and locale='ru'), (select draft_content->'layout_order' from public.public_site_locales where business_id=(select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001') and locale='ru'), 'publish retains canonical native layout order');
select ok((select is_published from public.public_site_settings where business_id=(select business_id from public.business_members where user_id='a1100000-0000-4000-8000-000000000001')), 'workspace is published locally');

select * from finish();
rollback;
