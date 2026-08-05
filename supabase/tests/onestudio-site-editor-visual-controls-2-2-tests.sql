begin;

select plan(14);

create temporary table visual_controls_valid as
select public.normalize_public_site_custom_blocks(
  jsonb_build_array(
    jsonb_build_object(
      'id', 'visual-controls',
      'kind', 'text',
      'title', 'Visual controls',
      'content_width', 'narrow',
      'padding_top', 'none',
      'padding_bottom', 'airy',
      'section_height', 'screen',
      'media_height', 'tall',
      'animation', 'rise',
      'animate_on_mobile', false
    )
  )
)->0 as block;

select is((select block->>'content_width' from visual_controls_valid), 'narrow', 'keeps valid content width');
select is((select block->>'padding_top' from visual_controls_valid), 'none', 'keeps valid top spacing');
select is((select block->>'padding_bottom' from visual_controls_valid), 'airy', 'keeps valid bottom spacing');
select is((select block->>'section_height' from visual_controls_valid), 'screen', 'keeps valid section height');
select is((select block->>'media_height' from visual_controls_valid), 'tall', 'keeps valid media height');
select is((select block->>'animation' from visual_controls_valid), 'rise', 'keeps valid reveal animation');
select is((select (block->>'animate_on_mobile')::boolean from visual_controls_valid), false, 'keeps mobile animation switch');

create temporary table visual_controls_invalid as
select public.normalize_public_site_custom_blocks(
  jsonb_build_array(
    jsonb_build_object(
      'id', 'invalid-controls',
      'kind', 'text',
      'title', 'Invalid controls',
      'content_width', 'gigantic',
      'padding_top', 'negative',
      'padding_bottom', 'endless',
      'section_height', 'tower',
      'media_height', 'cinema',
      'animation', 'spin',
      'animate_on_mobile', 'not-a-boolean'
    )
  )
)->0 as block;

select is((select block->>'content_width' from visual_controls_invalid), 'wide', 'defaults invalid content width');
select is((select block->>'padding_top' from visual_controls_invalid), 'normal', 'defaults invalid top spacing');
select is((select block->>'padding_bottom' from visual_controls_invalid), 'normal', 'defaults invalid bottom spacing');
select is((select block->>'section_height' from visual_controls_invalid), 'auto', 'defaults invalid section height');
select is((select block->>'media_height' from visual_controls_invalid), 'auto', 'defaults invalid media height');
select is((select block->>'animation' from visual_controls_invalid), 'none', 'defaults invalid animation');
select is((select (block->>'animate_on_mobile')::boolean from visual_controls_invalid), true, 'defaults invalid mobile animation switch');

select * from finish();
rollback;
