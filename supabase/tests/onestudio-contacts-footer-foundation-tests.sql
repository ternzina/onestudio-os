begin;

select plan(7);

select has_function(
  'public',
  'save_public_site_draft_v22',
  array['uuid', 'text', 'jsonb', 'boolean'],
  'save_public_site_draft_v22 exists'
);

select ok(
  position('contact_email' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'save_public_site_draft_v22 persists contact_email'
);

select ok(
  position('contact_phone' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'save_public_site_draft_v22 persists contact_phone'
);

select ok(
  position('contact_note' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'save_public_site_draft_v22 persists contact_note'
);

select ok(
  position('contact_route_label' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'save_public_site_draft_v22 persists contact_route_label'
);

select ok(
  position('footer_note' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'save_public_site_draft_v22 persists footer_note'
);

select ok(
  position('save_public_site_draft_v22' in pg_get_functiondef(
    'public.save_public_site_draft(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'legacy save_public_site_draft still delegates to v22'
);

select * from finish();
rollback;
