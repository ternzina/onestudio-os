\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

select has_function(
  'public',
  'save_public_site_draft',
  array['uuid','text','jsonb','boolean'],
  'public site draft save RPC exists'
);

select ok(
  position(
    'save_public_site_draft_v22'
    in pg_get_functiondef(
      'public.save_public_site_draft(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'save RPC still delegates validated fields to v22'
);

insert into auth.users (id, email)
values ('f1000000-0000-4000-8000-000000000001', 'palette.owner@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  'f2000000-0000-4000-8000-000000000001',
  'palette-site-test',
  'Palette Site Test',
  'Europe/Kyiv',
  'en',
  'EUR',
  'active'
);

insert into public.business_members (
  business_id, user_id, role, is_default
) values (
  'f2000000-0000-4000-8000-000000000001',
  'f1000000-0000-4000-8000-000000000001',
  'owner',
  true
);

select set_config(
  'request.jwt.claim.sub',
  'f1000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.save_public_site_draft(
      'f2000000-0000-4000-8000-000000000001',
      'en',
      '{
        "template_id":"gloss-nail-studio",
        "brand_name":"Bordeaux Studio",
        "theme_accent":"#9d3151",
        "theme_dark":"#321722",
        "theme_surface":"#fff7f5",
        "palette_index":3,
        "hero_title_mobile_size":"small",
        "hero_title":"Bordeaux title",
        "hero_text":"Bordeaux introduction",
        "about_text":"About Bordeaux Studio",
        "seo_title":"Bordeaux Studio",
        "seo_description":"Bordeaux Studio public website",
        "show_services":true,
        "show_portfolio":true,
        "section_order":["services","portfolio","about","contact"],
        "layout_order":[
          "custom:block-1700000000000",
          "section:services",
          "section:portfolio",
          "section:about",
          "section:contact"
        ]
      }'::jsonb,
      true
    )
  $sql$,
  'owner saves palette and layout editor state'
);

select is(
  (
    select draft_content->>'template_id'
    from public.public_site_locales
    where business_id = 'f2000000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'gloss-nail-studio',
  'template id survives draft normalization'
);

select is(
  (
    select draft_content->>'theme_accent'
    from public.public_site_locales
    where business_id = 'f2000000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  '#9d3151',
  'Bordeaux accent survives draft normalization'
);

select is(
  (
    select draft_content->>'theme_dark'
    from public.public_site_locales
    where business_id = 'f2000000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  '#321722',
  'Bordeaux dark color survives draft normalization'
);

select is(
  (
    select draft_content->'layout_order'->>0
    from public.public_site_locales
    where business_id = 'f2000000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'custom:block-1700000000000',
  'custom block position survives draft normalization'
);

select is(
  (
    select draft_content->>'hero_title_mobile_size'
    from public.public_site_locales
    where business_id = 'f2000000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'small',
  'mobile title size survives draft normalization'
);

select lives_ok(
  $sql$
    select public.publish_public_site(
      'f2000000-0000-4000-8000-000000000001',
      'en'
    )
  $sql$,
  'owner publishes the saved editor state'
);

reset role;

select is(
  public.get_public_site('palette-site-test', null)->'content'->>'template_id',
  'gloss-nail-studio',
  'published site keeps the selected template'
);

select is(
  public.get_public_site('palette-site-test', null)->'content'->>'theme_accent',
  '#9d3151',
  'published site keeps the Bordeaux accent'
);

select is(
  public.get_public_site('palette-site-test', null)->'content'->'layout_order'->>0,
  'custom:block-1700000000000',
  'published site keeps the custom block order'
);

select * from finish();
rollback;
