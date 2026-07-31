begin;

select plan(8);

select has_function(
  'public',
  'save_public_site_draft_v22',
  array['uuid', 'text', 'jsonb', 'boolean'],
  'save_public_site_draft_v22 exists'
);

select ok(
  position('header_sticky' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists sticky header state'
);

select ok(
  position('header_logo_size' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists logo size'
);

select ok(
  position('header_logo_position' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists logo position'
);

select ok(
  position('hero_layout' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists hero layout'
);

select ok(
  position('hero_image_position' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('hero_image_fit' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists hero image presentation'
);

select ok(
  position('hero_primary_label' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('hero_primary_url' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists primary hero action'
);

select ok(
  position('hero_secondary_label' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('hero_secondary_url' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0
  and position('show_hero_secondary' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists secondary hero action'
);

select * from finish();
rollback;
