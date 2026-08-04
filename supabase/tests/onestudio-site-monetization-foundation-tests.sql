begin;

select plan(12);

select has_table('public', 'site_monetization_settings', 'site monetization settings table exists');
select has_column('public', 'site_monetization_settings', 'business_id', 'site monetization settings are workspace-scoped');
select has_column('public', 'site_monetization_settings', 'ads_txt_content', 'ads.txt content is stored');
select has_column('public', 'site_monetization_settings', 'ads_txt_enabled', 'ads.txt publication switch exists');
select has_column('public', 'site_monetization_settings', 'adsense_publisher_id', 'AdSense publisher id is stored');

select has_function('public', 'get_site_monetization_settings', array['uuid'], 'workspace monetization settings can be read safely');
select has_function('public', 'save_site_monetization_settings', array['uuid', 'text', 'boolean', 'text'], 'workspace monetization settings can be saved safely');
select has_function('public', 'resolve_public_site_ads_txt', array['text'], 'public ads.txt can be resolved by domain');

select function_privs_are('public', 'get_site_monetization_settings', array['uuid'], 'authenticated', array['EXECUTE'], 'authenticated users may read settings through RPC');
select function_privs_are('public', 'save_site_monetization_settings', array['uuid', 'text', 'boolean', 'text'], 'authenticated', array['EXECUTE'], 'authenticated users may save settings through RPC');
select function_privs_are('public', 'resolve_public_site_ads_txt', array['text'], 'anon', array['EXECUTE'], 'anonymous visitors may resolve public ads.txt');
select table_privs_are('public', 'site_monetization_settings', 'authenticated', array[]::text[], 'authenticated users have no direct table privileges');

select * from finish();

rollback;
