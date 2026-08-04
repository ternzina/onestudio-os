begin;

select plan(12);

select has_column(
  'public',
  'site_monetization_settings',
  'adsense_enabled',
  'site_monetization_settings has adsense_enabled'
);

select col_type_is(
  'public',
  'site_monetization_settings',
  'adsense_enabled',
  'boolean',
  'adsense_enabled is boolean'
);

select col_not_null(
  'public',
  'site_monetization_settings',
  'adsense_enabled',
  'adsense_enabled is not null'
);

select col_has_default(
  'public',
  'site_monetization_settings',
  'adsense_enabled',
  'adsense_enabled has a default'
);

select has_function(
  'public',
  'save_site_monetization_settings_v2',
  array['uuid', 'text', 'boolean', 'text', 'boolean'],
  'v2 save function exists'
);

select function_returns(
  'public',
  'save_site_monetization_settings_v2',
  array['uuid', 'text', 'boolean', 'text', 'boolean'],
  'jsonb',
  'v2 save function returns jsonb'
);

select has_function(
  'public',
  'resolve_public_site_adsense',
  array['text'],
  'public AdSense resolver exists'
);

select function_returns(
  'public',
  'resolve_public_site_adsense',
  array['text'],
  'jsonb',
  'public AdSense resolver returns jsonb'
);

select has_function(
  'public',
  'get_site_monetization_settings',
  array['uuid'],
  'monetization getter still exists'
);

select function_returns(
  'public',
  'get_site_monetization_settings',
  array['uuid'],
  'jsonb',
  'monetization getter still returns jsonb'
);

select ok(
  has_function_privilege(
    'anon',
    'public.resolve_public_site_adsense(text)',
    'EXECUTE'
  ),
  'anon may execute public AdSense resolver'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.save_site_monetization_settings_v2(uuid,text,boolean,text,boolean)',
    'EXECUTE'
  ),
  'anon may not save AdSense settings'
);

select * from finish();

rollback;
