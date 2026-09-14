\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(14);

insert into auth.users (id, email)
values ('fb100000-0000-4000-8000-000000000001', 'bulk.pages.owner@example.test');

insert into public.businesses (
  id, slug, name, timezone, default_locale, default_currency, status
) values (
  'fb200000-0000-4000-8000-000000000001',
  'bulk-page-save-test',
  'Bulk Page Save Test',
  'Europe/Kyiv', 'en', 'USD', 'active'
);

insert into public.business_members (business_id, user_id, role, is_default)
values (
  'fb200000-0000-4000-8000-000000000001',
  'fb100000-0000-4000-8000-000000000001',
  'owner', true
);

select set_config('request.jwt.claim.sub', 'fb100000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
set local statement_timeout = '30s';

select lives_ok(
  $sql$
    with pages as (
      select jsonb_agg(
        jsonb_build_object(
          'id', format('guide-%s', lpad(series::text, 3, '0')),
          'type', 'custom',
          'slug', format('cashpath-bulk-guide-%s', lpad(series::text, 3, '0')),
          'nav_label', format('CashPath bulk guide %s', series),
          'title', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"strong","children":[{"type":"text","text":"Rich page title"}]}]}]}}',
          'intro', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"text","text":"CashPath generated guide introduction."}]}]}}',
          'blocks', jsonb_build_array(jsonb_build_object(
            'id', format('guide-%s-text', lpad(series::text, 3, '0')),
            'kind', 'text',
            'title', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"em","children":[{"type":"text","text":"Rich block title"}]}]}]}}',
            'text', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"text","text":"CashPath generated guide body."}]}]}}'
          )),
          'show_in_navigation', false,
          'show_booking_cta', false
        ) order by series
      ) as value
      from generate_series(1, 100) as series
    )
    select public.save_public_site_draft(
      'fb200000-0000-4000-8000-000000000001',
      'en',
      jsonb_build_object(
        'template_id', 'cashpath',
        'hero_title', 'CashPath bulk library',
        'site_summary', 'Bulk page save regression',
        'seo_keywords', 'cashpath, bulk',
        'layout_order', jsonb_build_array('section:hero', 'section:faq'),
        'native_action_styles', jsonb_build_object('cashpath:hero:primary', jsonb_build_object('size', 'large')),
        'pages', (select value from pages)
      ),
      false
    )
  $sql$,
  '100-page draft save completes under a local 30-second statement timeout'
);

reset role;

select is(
  (select jsonb_array_length(draft_content->'pages') from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  100,
  'bulk save preserves all 100 pages'
);
select is(
  (select draft_content->'pages'->0->>'slug' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  'cashpath-bulk-guide-001',
  'bulk save preserves the first page slug'
);
select is(
  (select draft_content->'pages'->49->>'slug' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  'cashpath-bulk-guide-050',
  'bulk save preserves a middle page slug'
);
select is(
  (select draft_content->'pages'->99->>'slug' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  'cashpath-bulk-guide-100',
  'bulk save preserves the last page slug'
);
select like(
  (select draft_content->'pages'->0->>'title' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  '__osrt1__:%Rich page title%',
  'bulk save preserves the rich page title'
);
select like(
  (select draft_content->'pages'->0->'blocks'->0->>'title' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  '__osrt1__:%Rich block title%',
  'bulk save preserves nested rich block titles'
);
select is(
  (select draft_content->>'hero_title' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  'CashPath bulk library',
  'bulk save preserves non-page editor content'
);
select is(
  (select draft_content->'layout_order' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  '["section:hero", "section:faq"]'::jsonb,
  'bulk save preserves layout order'
);

create temporary table bulk_page_snapshot as
select draft_content as content
from public.public_site_locales
where business_id = 'fb200000-0000-4000-8000-000000000001'
  and locale = 'en';

select is(
  (
    with source as (
      select jsonb_build_object(
        'template_id', 'cashpath',
        'hero_title', 'Parity hero',
        'layout_order', jsonb_build_array('section:hero'),
        'pages', jsonb_build_array(jsonb_build_object(
          'id', 'parity-page', 'type', 'custom', 'slug', 'parity-page',
          'nav_label', 'Parity page',
          'title', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"strong","children":[{"type":"text","text":"Parity page title"}]}]}]}}',
          'intro', 'Parity intro',
          'blocks', jsonb_build_array(jsonb_build_object(
            'id', 'parity-block', 'kind', 'text',
            'title', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"em","children":[{"type":"text","text":"Parity block title"}]}]}]}}',
            'text', 'Parity block text'
          )),
          'show_in_navigation', false, 'show_booking_cta', false
        ))
      ) as value
    )
    select public.save_public_site_draft_v_site_settings_terminal_1_1(
      'fb200000-0000-4000-8000-000000000001', 'en', value, false
    )->'pages' from source
  ),
  (
    with source as (
      select jsonb_build_object(
        'template_id', 'cashpath',
        'hero_title', 'Parity hero',
        'layout_order', jsonb_build_array('section:hero'),
        'pages', jsonb_build_array(jsonb_build_object(
          'id', 'parity-page', 'type', 'custom', 'slug', 'parity-page',
          'nav_label', 'Parity page',
          'title', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"strong","children":[{"type":"text","text":"Parity page title"}]}]}]}}',
          'intro', 'Parity intro',
          'blocks', jsonb_build_array(jsonb_build_object(
            'id', 'parity-block', 'kind', 'text',
            'title', '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"em","children":[{"type":"text","text":"Parity block title"}]}]}]}}',
            'text', 'Parity block text'
          )),
          'show_in_navigation', false, 'show_booking_cta', false
        ))
      ) as value
    )
    select public.save_public_site_draft(
      'fb200000-0000-4000-8000-000000000001', 'en', value, false
    )->'pages' from source
  ),
  'small-page legacy and optimized normalization produce identical pages'
);

select is(
  (select draft_content->'pages'->0->>'title' from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"strong","children":[{"type":"text","text":"Parity page title"}]}]}]}}',
  'parity save retains the rich page title exactly'
);

select set_config('request.jwt.claim.sub', 'fb100000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select is(
  public.save_public_site_draft(
    'fb200000-0000-4000-8000-000000000001',
    'en',
    (select content from bulk_page_snapshot),
    false
  ),
  (select content from bulk_page_snapshot),
  'a second bulk save is idempotent'
);

select lives_ok(
  $sql$
    select public.publish_public_site('fb200000-0000-4000-8000-000000000001', 'en')
  $sql$,
  'Publish accepts the successful bulk draft without changing the save pipeline'
);

reset role;

select is(
  (select jsonb_array_length(published_content->'pages') from public.public_site_locales where business_id = 'fb200000-0000-4000-8000-000000000001' and locale = 'en'),
  100,
  'Publish copies exactly the 100 saved pages'
);

select * from finish();
rollback;
