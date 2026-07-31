begin;

select plan(5);

select has_function(
  'public',
  'save_public_site_draft',
  array['uuid','text','jsonb','boolean'],
  'legacy public-site save RPC exists'
);

select has_function(
  'public',
  'save_public_site_draft_v22',
  array['uuid','text','jsonb','boolean'],
  'null-safe public-site save RPC exists'
);

select function_privs_are(
  'public',
  'save_public_site_draft',
  array['uuid','text','jsonb','boolean'],
  'authenticated',
  array['EXECUTE'],
  'authenticated can execute the compatibility save RPC'
);

select function_privs_are(
  'public',
  'save_public_site_draft',
  array['uuid','text','jsonb','boolean'],
  'anon',
  array[]::text[],
  'anon cannot execute the compatibility save RPC'
);

select ok(
  position(
    'save_public_site_draft_v22'
    in pg_get_functiondef(
      'public.save_public_site_draft(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'legacy save delegates to the null-safe v22 implementation'
);

select * from finish();
rollback;
