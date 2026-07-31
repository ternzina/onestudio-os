begin;

select plan(3);

select has_function(
  'public',
  'save_public_site_draft_v22',
  array['uuid', 'text', 'jsonb', 'boolean'],
  'save_public_site_draft_v22 exists'
);

select ok(
  position('hero_image_placement' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists hero image side'
);

select ok(
  position('(''left'', ''right'')' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'hero image side accepts left and right'
);

select * from finish();
rollback;
