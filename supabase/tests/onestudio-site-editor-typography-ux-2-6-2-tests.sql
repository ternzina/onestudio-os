begin;
select plan(9);

select is(
  public.normalize_public_site_system_section_settings('{"about":{"heading_font":"editorial","heading_size":"large","heading_weight":"bold"}}'::jsonb) #>> '{about,heading_font}',
  'editorial',
  'keeps valid per-section heading font'
);
select is(public.normalize_public_site_system_section_settings('{"about":{"heading_size":"large"}}'::jsonb) #>> '{about,heading_size}', '72', 'keeps valid heading size after 2.6.3 normalization');
select is(public.normalize_public_site_system_section_settings('{"about":{"heading_weight":"semibold"}}'::jsonb) #>> '{about,heading_weight}', 'semibold', 'keeps valid heading weight');
select is(public.normalize_public_site_system_section_settings('{"hero":{"heading_font":"system"}}'::jsonb) #>> '{hero,heading_font}', 'system', 'hero supports heading typography');
select is(public.normalize_public_site_system_section_settings('{"contact":{"heading_size":"display"}}'::jsonb) #>> '{contact,heading_size}', '104', 'contact supports display heading after 2.6.3 normalization');
select is(public.normalize_public_site_system_section_settings('{"about":{"heading_font":"Comic Sans"}}'::jsonb) #>> '{about,heading_font}', 'template', 'invalid heading font falls back safely');
select is(public.normalize_public_site_system_section_settings('{"about":{"heading_size":"999"}}'::jsonb) #>> '{about,heading_size}', 'template', 'invalid heading size falls back safely');
select is(public.normalize_public_site_system_section_settings('{"about":{"heading_weight":"900"}}'::jsonb) #>> '{about,heading_weight}', 'template', 'invalid heading weight falls back safely');
select is(public.normalize_public_site_system_section_settings('{"about":{"heading_font":"editorial","layout":"panel"}}'::jsonb) #>> '{about,layout}', 'panel', 'existing section settings remain preserved');

select * from finish();
rollback;
