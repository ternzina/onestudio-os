begin;
select plan(3);

select is(
  public.normalize_public_site_typography('{"font_family":"Brush Script MT"}'::jsonb)->>'font_family',
  'Brush Script MT',
  'heading typography accepts a font shared with rich text'
);

select is(
  public.normalize_public_site_typography('{"font_family":"editorial"}'::jsonb)->>'font_family',
  'editorial',
  'legacy heading font tokens remain compatible'
);

select is(
  public.normalize_public_site_typography('{"font_family":"url(javascript:bad)"}'::jsonb)->>'font_family',
  null,
  'unknown font values are removed'
);

select * from finish();
rollback;
