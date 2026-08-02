\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(8);

select has_function(
  'public',
  'demo_public_site_content',
  array['text', 'integer', 'text', 'text', 'text', 'boolean', 'text[]'],
  'demo palette content function exists'
);

select is(
  public.demo_public_site_content(
    'frame-house', 3, 'Bordeaux Studio', 'Test', 'ru', true, array['core']
  )->>'theme_accent',
  '#9d3151',
  'Bordeaux accent is available as palette index 3'
);

select is(
  public.demo_public_site_content(
    'frame-house', 3, 'Bordeaux Studio', 'Test', 'ru', true, array['core']
  )->>'theme_dark',
  '#321722',
  'Bordeaux dark color is available as palette index 3'
);

select is(
  public.demo_public_site_content(
    'frame-house', 3, 'Bordeaux Studio', 'Test', 'ru', true, array['core']
  )->>'theme_surface',
  '#fff7f5',
  'Bordeaux surface color is available as palette index 3'
);

select is(
  public.demo_public_site_content(
    'frame-house', 3, 'Bordeaux Studio', 'Test', 'ru', true, array['core']
  )->>'palette_index',
  '3',
  'Bordeaux palette index is stored in generated site content'
);

select is(
  public.demo_public_site_content(
    'lumiere', 3, 'Bordeaux Beauty', 'Test', 'ru', true, array['core']
  )->>'theme_accent',
  '#9d3151',
  'Bordeaux palette is shared by other demos'
);

select is(
  public.demo_public_site_content(
    'frame-house', 99, 'Clamped Studio', 'Test', 'ru', true, array['core']
  )->>'palette_index',
  '3',
  'palette indexes above the supported range clamp to Bordeaux'
);

select is(
  public.demo_public_site_content(
    'frame-house', 1, 'Nordic Studio', 'Test', 'ru', true, array['core']
  )->>'theme_accent',
  '#a8c5c8',
  'existing Nordic palette remains unchanged'
);

select * from finish();
rollback;
