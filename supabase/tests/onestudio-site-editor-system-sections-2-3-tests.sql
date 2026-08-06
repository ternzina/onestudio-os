begin;

select plan(33);

create temporary table system_sections_valid as
select public.normalize_public_site_system_section_settings(
  jsonb_build_object(
    'services', jsonb_build_object(
      'layout', 'panel',
      'content_width', 'narrow',
      'padding_top', 'none',
      'padding_bottom', 'airy',
      'section_height', 'screen',
      'text_align', 'center',
      'background_mode', 'image',
      'background_image_url', 'https://example.com/background.webp',
      'background_position', 'bottom',
      'background_overlay', 'strong',
      'animation', 'rise',
      'animate_on_mobile', false,
      'hide_on_desktop', true,
      'hide_on_tablet', false,
      'hide_on_mobile', true
    )
  )
)->'services' as section;

select is((select section->>'layout' from system_sections_valid), 'panel', 'keeps valid panel layout');
select is((select section->>'content_width' from system_sections_valid), 'narrow', 'keeps valid width');
select is((select section->>'padding_top' from system_sections_valid), 'none', 'keeps valid top spacing');
select is((select section->>'padding_bottom' from system_sections_valid), 'airy', 'keeps valid bottom spacing');
select is((select section->>'section_height' from system_sections_valid), 'screen', 'keeps valid height');
select is((select section->>'text_align' from system_sections_valid), 'center', 'keeps valid alignment');
select is((select section->>'background_mode' from system_sections_valid), 'image', 'keeps valid background mode');
select is((select section->>'background_image_url' from system_sections_valid), 'https://example.com/background.webp', 'keeps safe background image');
select is((select section->>'background_position' from system_sections_valid), 'bottom', 'keeps valid background position');
select is((select section->>'background_overlay' from system_sections_valid), 'strong', 'keeps valid overlay');
select is((select section->>'animation' from system_sections_valid), 'rise', 'keeps valid animation');
select is((select (section->>'animate_on_mobile')::boolean from system_sections_valid), false, 'keeps mobile animation switch');
select is((select (section->>'hide_on_desktop')::boolean from system_sections_valid), true, 'keeps desktop visibility');
select is((select (section->>'hide_on_tablet')::boolean from system_sections_valid), false, 'keeps tablet visibility');
select is((select (section->>'hide_on_mobile')::boolean from system_sections_valid), true, 'keeps mobile visibility');

create temporary table system_sections_invalid as
select public.normalize_public_site_system_section_settings(
  jsonb_build_object(
    'services', jsonb_build_object(
      'layout', 'floating',
      'content_width', 'gigantic',
      'padding_top', 'negative',
      'padding_bottom', 'endless',
      'section_height', 'tower',
      'text_align', 'diagonal',
      'background_mode', 'video',
      'background_image_url', 'javascript:alert(1)',
      'background_position', 'sideways',
      'background_overlay', 'opaque',
      'animation', 'spin',
      'animate_on_mobile', 'no',
      'hide_on_desktop', 'yes',
      'hide_on_tablet', 1,
      'hide_on_mobile', null
    ),
    'unknown-section', jsonb_build_object('layout', 'panel')
  )
)->'services' as section;

select is((select section->>'layout' from system_sections_invalid), 'default', 'defaults invalid layout');
select is((select section->>'content_width' from system_sections_invalid), 'wide', 'defaults invalid width');
select is((select section->>'padding_top' from system_sections_invalid), 'normal', 'defaults invalid top spacing');
select is((select section->>'padding_bottom' from system_sections_invalid), 'normal', 'defaults invalid bottom spacing');
select is((select section->>'section_height' from system_sections_invalid), 'auto', 'defaults invalid height');
select is((select section->>'text_align' from system_sections_invalid), 'left', 'defaults invalid alignment');
select is((select section->>'background_mode' from system_sections_invalid), 'theme', 'defaults invalid background mode');
select is((select section->>'background_image_url' from system_sections_invalid), '', 'removes unsafe background image');
select is((select section->>'background_position' from system_sections_invalid), 'center', 'defaults invalid position');
select is((select section->>'background_overlay' from system_sections_invalid), 'soft', 'defaults invalid overlay');
select is((select section->>'animation' from system_sections_invalid), 'none', 'defaults invalid animation');
select is((select (section->>'animate_on_mobile')::boolean from system_sections_invalid), true, 'defaults invalid mobile animation switch');
select is((select (section->>'hide_on_desktop')::boolean from system_sections_invalid), false, 'defaults invalid desktop visibility');
select is((select (section->>'hide_on_tablet')::boolean from system_sections_invalid), false, 'defaults invalid tablet visibility');
select is((select (section->>'hide_on_mobile')::boolean from system_sections_invalid), false, 'defaults invalid mobile visibility');
select ok(
  not (public.normalize_public_site_system_section_settings(
    jsonb_build_object('unknown-section', jsonb_build_object('layout', 'panel'))
  ) ? 'unknown-section'),
  'drops unknown system section names'
);

create temporary table system_sections_sparse as
select public.normalize_public_site_system_section_settings(
  jsonb_build_object(
    'reviews', jsonb_build_object('animation', 'fade')
  )
)->'reviews' as section;

select is(
  (
    select count(*)::integer
    from system_sections_sparse
    cross join lateral jsonb_object_keys(section)
  ),
  1,
  'keeps system section settings sparse'
);
select ok(
  not (select section ? 'padding_top' from system_sections_sparse),
  'does not overwrite inherited template spacing'
);

select * from finish();
rollback;
