begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"mood","kind":"collage","media_position":"center"}]'::jsonb
  )->0->>'kind',
  'collage',
  'collage block kind is preserved'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"mood","kind":"collage","media_position":"center"}]'::jsonb
  )->0->>'media_position',
  'center',
  'center collage alignment is preserved'
);

select is(
  jsonb_array_length(
    public.normalize_public_site_custom_blocks(
      '[{"id":"mood","kind":"collage","media_urls":["/one.webp","https://cdn.example.test/two.webp","javascript:bad"]}]'::jsonb
    )->0->'media_urls'
  ),
  3,
  'collage photo slots survive normalization'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"mood","kind":"collage","media_urls":["/one.webp","https://cdn.example.test/two.webp","javascript:bad"]}]'::jsonb
  )->0->'media_urls'->>2,
  '',
  'unsafe collage photo URL is removed'
);

select * from finish();
rollback;
