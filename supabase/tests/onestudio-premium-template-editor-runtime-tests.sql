begin;
select plan(6);

select has_function('public', 'normalize_public_site_template_content', array['jsonb'], 'template content normalizer exists');
select has_function('public', 'save_public_site_draft_v263', array['uuid','text','jsonb','boolean'], '2.6 save pipeline is preserved');
select function_privs_are('public', 'save_public_site_draft', array['uuid','text','jsonb','boolean'], 'authenticated', array['EXECUTE'], 'authenticated can save through current entry point');
select is(public.normalize_public_site_template_content('{"premium-kids-center":{"hero_title":"Draft title"}}'::jsonb)->'premium-kids-center'->>'hero_title', 'Draft title', 'premium namespace is preserved');
select is(public.normalize_public_site_template_content('{"Bad Key":{"hero_title":"x"}}'::jsonb), '{}'::jsonb, 'invalid template keys are rejected');
select is(public.normalize_public_site_template_content('[]'::jsonb), '{}'::jsonb, 'non-object namespaces are rejected');

select * from finish();
rollback;
