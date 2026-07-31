begin;

create extension if not exists pgtap with schema extensions;

select plan(6);

select has_function(
  'public',
  'ensure_required_public_site_locales',
  array[]::text[],
  'required locale trigger function exists'
);

select has_trigger(
  'public',
  'business_launch_profiles',
  'ensure_required_public_site_locales_before_write',
  'required locale trigger exists'
);

select ok(
  (
    select bool_and('ru' = any(profile.locales))
    from public.business_launch_profiles profile
  ),
  'all configured workspaces include Russian'
);

select ok(
  (
    select bool_and('en' = any(profile.locales))
    from public.business_launch_profiles profile
  ),
  'all configured workspaces include English'
);

select is(
  (
    select count(*)::integer
    from public.business_launch_profiles profile
    where profile.locales[1:2] <> array['ru', 'en']::text[]
  ),
  0,
  'RU and EN are the first two system site languages'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.ensure_required_public_site_locales()',
    'EXECUTE'
  ),
  'authenticated users cannot invoke the trigger function directly'
);

select * from finish();
rollback;
