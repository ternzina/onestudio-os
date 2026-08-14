begin;
select plan(9);

select has_table('public', 'site_template_registry', 'canonical template registry exists');
select has_function('public', 'is_registered_site_template', array['text', 'text'], 'registry validator exists');
select is(public.is_registered_site_template('standard', 'standard'), true, 'Standard is registered');
select is(public.is_registered_site_template('gloss-nail-studio', 'gloss-nail-studio'), true, 'GLOSS is registered');
select is(public.is_registered_site_template('premium-kids-center', 'premium-kids-center'), true, 'BEMBI is registered');
select is(public.is_registered_site_template('premium-studio', 'premium-studio'), true, 'NOIR FRAME is registered');
select is(public.is_registered_site_template('velora-event-venue', 'velora-event-venue'), true, 'VELORA HOUSE is registered');
select is(public.is_registered_site_template('lumea-beauty', 'lumea-beauty'), true, 'LUMEA is registered');
select is(public.is_registered_site_template('unsupported-template', 'unsupported-template'), false, 'unknown templates are rejected');

select * from finish();
rollback;
