begin;
select plan(11);

select has_function('public', 'normalize_public_site_template_content', array['jsonb'], 'template content normalizer exists');
select has_function('public', 'save_public_site_draft_v263', array['uuid','text','jsonb','boolean'], '2.6 save pipeline is preserved');
select function_privs_are('public', 'save_public_site_draft', array['uuid','text','jsonb','boolean'], 'authenticated', array['EXECUTE'], 'authenticated can save through current entry point');
select function_privs_are('public', 'save_public_site_draft', array['uuid','text','jsonb','boolean'], 'service_role', array['EXECUTE'], 'service role retains draft save access');
select is(
  (select coalesce(bool_or(acl.grantee = 0 and acl.privilege_type = 'EXECUTE'), false)
   from pg_proc procedure
   cross join lateral aclexplode(coalesce(procedure.proacl, acldefault('f', procedure.proowner))) acl
   where procedure.oid = 'public.save_public_site_draft(uuid,text,jsonb,boolean)'::regprocedure),
  false,
  'PUBLIC cannot execute the draft save RPC'
);
select function_privs_are('public', 'normalize_public_site_template_content', array['jsonb'], 'authenticated', array[]::text[], 'authenticated cannot call the internal normalizer');
select function_privs_are('public', 'normalize_public_site_template_content', array['jsonb'], 'service_role', array[]::text[], 'service role cannot call the internal normalizer directly');
select is(
  (select coalesce(bool_or(acl.grantee = 0 and acl.privilege_type = 'EXECUTE'), false)
   from pg_proc procedure
   cross join lateral aclexplode(coalesce(procedure.proacl, acldefault('f', procedure.proowner))) acl
   where procedure.oid = 'public.normalize_public_site_template_content(jsonb)'::regprocedure),
  false,
  'PUBLIC cannot execute the internal normalizer'
);
select is(public.normalize_public_site_template_content('{"premium-kids-center":{"hero_title":"Draft title"}}'::jsonb)->'premium-kids-center'->>'hero_title', 'Draft title', 'premium namespace is preserved');
select is(public.normalize_public_site_template_content('{"Bad Key":{"hero_title":"x"}}'::jsonb), '{}'::jsonb, 'invalid template keys are rejected');
select is(public.normalize_public_site_template_content('[]'::jsonb), '{}'::jsonb, 'non-object namespaces are rejected');

select * from finish();
rollback;
