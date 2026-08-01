\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(18);

select has_function(
  'public',
  'save_public_site_draft_v22',
  array['uuid', 'text', 'jsonb', 'boolean'],
  'save_public_site_draft_v22 exists'
);

select has_function(
  'public',
  'get_public_site_editor',
  array['uuid'],
  'public-site editor function exists'
);

select has_function(
  'public',
  'get_public_site',
  array['text', 'text'],
  'published public-site function exists'
);

select ok(
  position('portfolio_layout' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists portfolio layout'
);

select ok(
  position('portfolio_columns' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('portfolio_card_aspect' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists portfolio columns and card proportions'
);

select ok(
  position('portfolio_show_filters' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('portfolio_lightbox' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists portfolio filters and lightbox'
);

select ok(
  position('portfolio_show_category' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('portfolio_show_title' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('portfolio_show_description' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists portfolio metadata visibility'
);

select ok(
  position('portfolio_home_limit' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists portfolio home-page limit'
);

select ok(
  position('from public.portfolio_projects project' in pg_get_functiondef(
    'public.get_public_site_editor(uuid)'::regprocedure
  )) > 0,
  'visual editor receives canonical portfolio projects'
);

select ok(
  position('from public.portfolio_project_images project_image' in pg_get_functiondef(
    'public.get_public_site_editor(uuid)'::regprocedure
  )) > 0,
  'visual editor receives ordered images for every portfolio project'
);

select ok(
  position('from public.portfolio_project_images project_image' in pg_get_functiondef(
    'public.get_public_site(text,text)'::regprocedure
  )) > 0,
  'published public site receives ordered images for every portfolio project'
);

select ok(
  position('order by project.sort_order' in pg_get_functiondef(
    'public.get_public_site_editor(uuid)'::regprocedure
  )) > 0,
  'visual editor keeps canonical project order'
);

select ok(
  position('join public.portfolio_categories category' in pg_get_functiondef(
    'public.get_public_site_editor(uuid)'::regprocedure
  )) > 0
  and position('left join public.media_library media' in pg_get_functiondef(
    'public.get_public_site_editor(uuid)'::regprocedure
  )) > 0,
  'visual editor receives active category and cover-media data'
);

insert into auth.users (id, email)
values (
  'e8100000-0000-4000-8000-000000000001',
  'portfolio.gallery.owner@example.test'
);

insert into public.businesses (
  id,
  slug,
  name,
  timezone,
  default_locale,
  default_currency,
  status
) values (
  'e8200000-0000-4000-8000-000000000001',
  'portfolio-gallery-runtime-test',
  'Portfolio Gallery Runtime Test',
  'Europe/Kyiv',
  'en',
  'EUR',
  'active'
);

insert into public.business_members (
  business_id,
  user_id,
  role,
  is_default
) values (
  'e8200000-0000-4000-8000-000000000001',
  'e8100000-0000-4000-8000-000000000001',
  'owner',
  true
);

select set_config(
  'request.jwt.claim.sub',
  'e8100000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $sql$
    select public.save_public_site_draft(
      'e8200000-0000-4000-8000-000000000001',
      'en',
      '{
        "hero_title":"Portfolio runtime draft",
        "portfolio_layout":"grid",
        "portfolio_columns":4,
        "portfolio_card_aspect":"square",
        "portfolio_show_filters":false,
        "portfolio_lightbox":true,
        "portfolio_show_description":true,
        "portfolio_home_limit":12
      }'::jsonb,
      true
    )
  $sql$,
  'legacy draft save executes with portfolio presentation fields'
);

reset role;

select is(
  (
    select draft_content->>'portfolio_layout'
    from public.public_site_locales
    where business_id = 'e8200000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'grid',
  'portfolio layout is persisted'
);

select is(
  (
    select draft_content->>'portfolio_columns'
    from public.public_site_locales
    where business_id = 'e8200000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  '4',
  'portfolio column count is persisted'
);

select is(
  (
    select draft_content->>'portfolio_show_description'
    from public.public_site_locales
    where business_id = 'e8200000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  'true',
  'portfolio description visibility is persisted'
);

select is(
  (
    select draft_content->>'portfolio_home_limit'
    from public.public_site_locales
    where business_id = 'e8200000-0000-4000-8000-000000000001'
      and locale = 'en'
  ),
  '12',
  'portfolio home-page limit is persisted'
);

select * from finish();
rollback;
