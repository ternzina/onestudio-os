begin;

select plan(4);

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

select * from finish();
rollback;
