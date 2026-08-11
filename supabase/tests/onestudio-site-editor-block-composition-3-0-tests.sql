begin;

select plan(23);

create temporary table composition_valid as
select public.normalize_public_site_custom_blocks(jsonb_build_array(jsonb_build_object(
  'id', 'composition-valid', 'kind', 'columns', 'title', 'Composition',
  'composition_enabled', true,
  'composition_layout', 'grid', 'composition_columns', 4,
  'composition_gap', 'airy', 'composition_align', 'center',
  'composition_text_align', 'right', 'composition_split_ratio', 'content_wide',
  'composition_card_layout', 'horizontal',
  'composition_order', jsonb_build_array('cards','title','title','bogus','text'),
  'composition_mobile_layout', 'stack', 'composition_mobile_columns', 2,
  'composition_mobile_gap', 'compact', 'composition_mobile_align', 'stretch',
  'composition_mobile_text_align', 'center',
  'composition_mobile_card_layout', 'vertical',
  'composition_mobile_order', jsonb_build_array('title','cards','text')
)))->0 as block;

select is((select block->>'composition_enabled' from composition_valid), 'true', 'keeps opt-in flag');
select is((select block->>'composition_layout' from composition_valid), 'grid', 'keeps desktop layout');
select is((select (block->>'composition_columns')::integer from composition_valid), 4, 'keeps desktop columns');
select is((select block->>'composition_gap' from composition_valid), 'airy', 'keeps desktop gap');
select is((select block->>'composition_align' from composition_valid), 'center', 'keeps desktop alignment');
select is((select block->>'composition_text_align' from composition_valid), 'right', 'keeps desktop text alignment');
select is((select block->>'composition_split_ratio' from composition_valid), 'content_wide', 'keeps split ratio');
select is((select block->>'composition_card_layout' from composition_valid), 'horizontal', 'keeps desktop card layout');
select is((select block->'composition_order' from composition_valid), '["cards", "title", "text"]'::jsonb, 'deduplicates and bounds desktop order');
select is((select block->>'composition_mobile_layout' from composition_valid), 'stack', 'keeps mobile layout');
select is((select (block->>'composition_mobile_columns')::integer from composition_valid), 2, 'keeps mobile columns');
select is((select block->>'composition_mobile_gap' from composition_valid), 'compact', 'keeps mobile gap');
select is((select block->>'composition_mobile_align' from composition_valid), 'stretch', 'keeps mobile alignment');
select is((select block->>'composition_mobile_text_align' from composition_valid), 'center', 'keeps mobile text alignment');
select is((select block->>'composition_mobile_card_layout' from composition_valid), 'vertical', 'keeps mobile card layout');
select is((select block->'composition_mobile_order' from composition_valid), '["title", "cards", "text"]'::jsonb, 'keeps mobile order');

create temporary table composition_invalid as
select public.normalize_public_site_custom_blocks(jsonb_build_array(jsonb_build_object(
  'id', 'composition-invalid', 'kind', 'text', 'title', 'Invalid',
  'composition_enabled', 'yes', 'composition_layout', 'freeform',
  'composition_columns', 9, 'composition_gap', 'huge',
  'composition_align', 'middle', 'composition_mobile_columns', 4
)))->0 as block;

select ok(not (select block ? 'composition_enabled' from composition_invalid), 'drops a non-boolean flag');
select ok(not (select block ? 'composition_layout' from composition_invalid), 'drops invalid layout');
select ok(not (select block ? 'composition_columns' from composition_invalid), 'drops invalid desktop columns');
select ok(not (select block ? 'composition_gap' from composition_invalid), 'drops invalid gap');
select ok(not (select block ? 'composition_align' from composition_invalid), 'drops invalid alignment');
select ok(not (select block ? 'composition_mobile_columns' from composition_invalid), 'drops invalid mobile columns');

create temporary table composition_legacy as
select public.normalize_public_site_custom_blocks(jsonb_build_array(jsonb_build_object(
  'id', 'composition-legacy', 'kind', 'text', 'title', 'Legacy'
)))->0 as block;

select ok(not (select block ? 'composition_enabled' from composition_legacy), 'legacy blocks remain composition-free');

select * from finish();
rollback;
