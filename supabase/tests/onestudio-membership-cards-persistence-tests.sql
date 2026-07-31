begin;

select plan(6);

select has_function(
  'public',
  'save_public_site_draft',
  array['uuid','text','jsonb','boolean'],
  'save_public_site_draft exists'
);

select has_function(
  'public',
  'save_public_site_draft_v22',
  array['uuid','text','jsonb','boolean'],
  'save_public_site_draft_v22 exists'
);

select function_privs_are(
  'public',
  'save_public_site_draft',
  array['uuid','text','jsonb','boolean'],
  'authenticated',
  array['EXECUTE'],
  'authenticated can save public site drafts'
);

select function_privs_are(
  'public',
  'save_public_site_draft',
  array['uuid','text','jsonb','boolean'],
  'anon',
  array[]::text[],
  'anon cannot save public site drafts'
);

select ok(
  position(
    'save_public_site_draft_v22'
    in pg_get_functiondef(
      'public.save_public_site_draft(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'legacy save delegates to save_public_site_draft_v22'
);

select ok(
  position(
    'membership_items'
    in pg_get_functiondef(
      'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0
  and position(
    'membership_image_urls'
    in pg_get_functiondef(
      'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'save_public_site_draft_v22 persists membership cards and images'
);

select * from finish();
rollback;
