begin;
create extension if not exists pgtap;
select plan(11);

select is(
  public.normalize_public_site_system_section_settings('{"hero":{"heading_size":"48"}}'::jsonb)->'hero'->>'heading_size',
  '48',
  '2.6.3 preserves an explicit 48 px hero heading size'
);

select is(
  public.normalize_public_site_system_section_settings('{"about":{"heading_typography":{"font_family":"editorial","font_size":46,"font_weight":600,"italic":true,"underline":true,"text_align":"center","color":"#AABBCC","line_height":1.2,"letter_spacing":-0.5}}}'::jsonb)->'about'->'heading_typography',
  '{"font_family":"editorial","font_size":46,"font_weight":600,"italic":true,"underline":true,"text_align":"center","color":"#aabbcc","line_height":1.2,"letter_spacing":-0.5}'::jsonb,
  '2.6.3 normalizes the complete local heading typography model'
);

select is(
  public.normalize_public_site_custom_blocks('[{"id":"text-1","kind":"text","title":"Title","title_typography":{"font_size":42,"color":"#112233"}}]'::jsonb)->0->'title_typography',
  '{"font_size":42,"color":"#112233"}'::jsonb,
  '2.6.3 preserves local typography for custom block titles'
);

select is(
  public.normalize_public_site_pages('[{"id":"page-1","type":"custom","slug":"about-us","nav_label":"About","eyebrow":"","title":"About","intro":"Text","show_in_navigation":true,"show_booking_cta":false,"title_typography":{"font_size":52}}]'::jsonb)->0->'title_typography',
  '{"font_size":52}'::jsonb,
  '2.6.3 preserves local typography for custom page titles'
);

select is(
  public.normalize_public_site_system_section_settings('{"about":{"heading_size":"104"}}'::jsonb)->'about'->>'heading_size',
  '104',
  '2.6.3 preserves an explicit 104 px section heading size'
);

select is(
  public.normalize_public_site_system_section_settings('{"services":{"heading_font":"editorial"}}'::jsonb)->'services'->>'heading_font',
  'editorial',
  '2.6.3 preserves section heading font'
);

select is(
  public.normalize_public_site_system_section_settings('{"portfolio":{"heading_weight":"bold"}}'::jsonb)->'portfolio'->>'heading_weight',
  'bold',
  '2.6.3 preserves section heading weight'
);

select is(
  public.normalize_public_site_system_section_settings('{"hero":{"heading_size":"small"}}'::jsonb)->'hero'->>'heading_size',
  '32',
  '2.6.3 migrates legacy small to 32 px'
);

select is(
  public.normalize_public_site_system_section_settings('{"hero":{"heading_size":"medium"}}'::jsonb)->'hero'->>'heading_size',
  '48',
  '2.6.3 migrates legacy medium to 48 px'
);

select is(
  public.normalize_public_site_system_section_settings('{"hero":{"heading_size":"large"}}'::jsonb)->'hero'->>'heading_size',
  '72',
  '2.6.3 migrates legacy large to 72 px'
);

select is(
  public.normalize_public_site_system_section_settings('{"hero":{"heading_size":"display"}}'::jsonb)->'hero'->>'heading_size',
  '104',
  '2.6.3 migrates legacy display to 104 px'
);

select * from finish();
rollback;
