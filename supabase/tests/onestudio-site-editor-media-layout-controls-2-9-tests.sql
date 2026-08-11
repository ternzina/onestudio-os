begin;

select plan(24);

create temporary table media_layout_valid as
select public.normalize_public_site_custom_blocks(jsonb_build_array(jsonb_build_object(
  'id', 'media-layout', 'kind', 'collage', 'title', 'Media layout',
  'media_radius', 'rounded', 'media_focal_x', 24, 'media_focal_y', 88,
  'media_opacity', 77, 'media_overlay', 35, 'media_gap', 'airy', 'media_columns', 3,
  'media_mobile_aspect', 'square', 'media_mobile_height', 'compact',
  'media_mobile_fit', 'contain', 'media_mobile_focal_x', 11,
  'media_mobile_focal_y', 99, 'media_mobile_position', 'before',
  'media_mobile_columns', 1
)))->0 as block;

select is((select block->>'media_radius' from media_layout_valid), 'rounded', 'keeps radius');
select is((select (block->>'media_focal_x')::numeric from media_layout_valid), 24::numeric, 'keeps focal x');
select is((select (block->>'media_focal_y')::numeric from media_layout_valid), 88::numeric, 'keeps focal y');
select is((select (block->>'media_opacity')::numeric from media_layout_valid), 77::numeric, 'keeps opacity');
select is((select (block->>'media_overlay')::numeric from media_layout_valid), 35::numeric, 'keeps overlay');
select is((select block->>'media_gap' from media_layout_valid), 'airy', 'keeps gap');
select is((select (block->>'media_columns')::integer from media_layout_valid), 3, 'keeps desktop columns');
select is((select block->>'media_mobile_aspect' from media_layout_valid), 'square', 'keeps mobile aspect');
select is((select block->>'media_mobile_height' from media_layout_valid), 'compact', 'keeps mobile height');
select is((select block->>'media_mobile_fit' from media_layout_valid), 'contain', 'keeps mobile fit');
select is((select (block->>'media_mobile_focal_x')::numeric from media_layout_valid), 11::numeric, 'keeps mobile focal x');
select is((select (block->>'media_mobile_focal_y')::numeric from media_layout_valid), 99::numeric, 'keeps mobile focal y');
select is((select block->>'media_mobile_position' from media_layout_valid), 'before', 'keeps mobile placement');
select is((select (block->>'media_mobile_columns')::integer from media_layout_valid), 1, 'keeps mobile columns');

create temporary table media_layout_system as
select public.normalize_public_site_system_section_settings(jsonb_build_object(
  'services', jsonb_build_object(
    'media_fit', 'contain', 'media_focal_x', 18, 'media_overlay', 42,
    'media_mobile_fit', 'cover'
  )
))->'services' as section;

select is((select section->>'media_fit' from media_layout_system), 'contain', 'keeps background fit');
select is((select (section->>'media_focal_x')::numeric from media_layout_system), 18::numeric, 'keeps background focal point');
select is((select (section->>'media_overlay')::numeric from media_layout_system), 42::numeric, 'keeps background overlay');
select is((select section->>'media_mobile_fit' from media_layout_system), 'cover', 'keeps mobile background fit');
select is((select count(*)::integer from media_layout_system cross join lateral jsonb_object_keys(section)), 4, 'new-only system settings stay sparse');

create temporary table media_layout_invalid as
select public.normalize_public_site_custom_blocks(jsonb_build_array(jsonb_build_object(
  'id', 'media-invalid', 'kind', 'slider', 'title', 'Invalid',
  'media_radius', 'blob', 'media_gap', 'negative', 'media_columns', 9,
  'media_focal_x', 150, 'media_opacity', -20
)))->0 as block;

select ok(not (select block ? 'media_radius' from media_layout_invalid), 'drops invalid radius');
select ok(not (select block ? 'media_gap' from media_layout_invalid), 'drops invalid gap');
select ok(not (select block ? 'media_columns' from media_layout_invalid), 'drops invalid columns');
select is((select (block->>'media_focal_x')::numeric from media_layout_invalid), 100::numeric, 'clamps focal point');
select is((select (block->>'media_opacity')::numeric from media_layout_invalid), 0::numeric, 'clamps opacity');

select * from finish();
rollback;
