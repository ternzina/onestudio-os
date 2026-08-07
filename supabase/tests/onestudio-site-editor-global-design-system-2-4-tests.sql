begin;

select plan(24);

select is(
  public.normalize_public_site_design_system(null),
  '{}'::jsonb,
  'null design system preserves template defaults'
);

select is(
  public.normalize_public_site_design_system('[]'::jsonb),
  '{}'::jsonb,
  'non-object design system is ignored'
);

create temporary table design_system_valid as
select public.normalize_public_site_design_system(
  jsonb_build_object(
    'typography', jsonb_build_object(
      'body_font', 'humanist',
      'heading_font', 'editorial',
      'heading_weight', 'semibold',
      'heading_tracking', 'tight'
    ),
    'buttons', jsonb_build_object(
      'radius', 'pill',
      'shadow', 'strong'
    ),
    'cards', jsonb_build_object(
      'radius', 'rounded',
      'border', 'subtle',
      'shadow', 'soft'
    )
  )
) as design;

select is((select design#>>'{typography,body_font}' from design_system_valid), 'humanist', 'keeps body font');
select is((select design#>>'{typography,heading_font}' from design_system_valid), 'editorial', 'keeps heading font');
select is((select design#>>'{typography,heading_weight}' from design_system_valid), 'semibold', 'keeps heading weight');
select is((select design#>>'{typography,heading_tracking}' from design_system_valid), 'tight', 'keeps heading tracking');
select is((select design#>>'{buttons,radius}' from design_system_valid), 'pill', 'keeps button radius');
select is((select design#>>'{buttons,shadow}' from design_system_valid), 'strong', 'keeps button shadow');
select is((select design#>>'{cards,radius}' from design_system_valid), 'rounded', 'keeps card radius');
select is((select design#>>'{cards,border}' from design_system_valid), 'subtle', 'keeps card border');
select is((select design#>>'{cards,shadow}' from design_system_valid), 'soft', 'keeps card shadow');

create temporary table design_system_invalid as
select public.normalize_public_site_design_system(
  jsonb_build_object(
    'typography', jsonb_build_object(
      'body_font', 'comic',
      'heading_font', 'display',
      'heading_weight', '900',
      'heading_tracking', 'huge'
    ),
    'buttons', jsonb_build_object('radius', 'circle', 'shadow', 'glow'),
    'cards', jsonb_build_object('radius', 'bubble', 'border', 'double', 'shadow', 'neon'),
    'unknown', jsonb_build_object('anything', true)
  )
) as design;

select ok(not (select design ? 'typography' from design_system_invalid), 'drops invalid typography group');
select ok(not (select design ? 'buttons' from design_system_invalid), 'drops invalid buttons group');
select ok(not (select design ? 'cards' from design_system_invalid), 'drops invalid cards group');
select ok(not (select design ? 'unknown' from design_system_invalid), 'drops unknown groups');

create temporary table design_system_template as
select public.normalize_public_site_design_system(
  jsonb_build_object(
    'typography', jsonb_build_object(
      'body_font', 'template',
      'heading_font', 'template',
      'heading_weight', 'template',
      'heading_tracking', 'template'
    ),
    'buttons', jsonb_build_object('radius', 'template', 'shadow', 'template'),
    'cards', jsonb_build_object('radius', 'template', 'border', 'template', 'shadow', 'template')
  )
) as design;

select is((select design from design_system_template), '{}'::jsonb, 'template choices remain sparse and preserve original template styling');

create temporary table design_system_sparse as
select public.normalize_public_site_design_system(
  jsonb_build_object('cards', jsonb_build_object('shadow', 'none'))
) as design;

select is(
  (select count(*)::integer from design_system_sparse cross join lateral jsonb_object_keys(design)),
  1,
  'sparse design system keeps only configured group'
);
select is(
  (select count(*)::integer from design_system_sparse cross join lateral jsonb_object_keys(design->'cards')),
  1,
  'sparse design group keeps only configured token'
);
select is((select design#>>'{cards,shadow}' from design_system_sparse), 'none', 'sparse value is preserved');

select is(
  public.normalize_public_site_design_system(jsonb_build_object('buttons', jsonb_build_object('radius', 'PILL')))#>>'{buttons,radius}',
  'pill',
  'normalizes valid values to lowercase'
);

select ok(
  not (
    public.normalize_public_site_design_system(
      jsonb_build_object('typography', jsonb_build_object('body_font', 'system', 'unknown_token', 'x'))
    )#>'{typography}' ? 'unknown_token'
  ),
  'drops unknown typography tokens'
);

select ok(
  not (
    public.normalize_public_site_design_system(
      jsonb_build_object('cards', jsonb_build_object('radius', 'soft', 'glow_color', '#ffffff'))
    )#>'{cards}' ? 'glow_color'
  ),
  'drops unknown card tokens'
);

create temporary table design_system_mixed as
select public.normalize_public_site_design_system(
  jsonb_build_object(
    'typography', jsonb_build_object('body_font', 'template', 'heading_font', 'editorial')
  )
) as design;

select ok(not (select design#>'{typography}' ? 'body_font' from design_system_mixed), 'drops template token inside otherwise configured group');
select is((select design#>>'{typography,heading_font}' from design_system_mixed), 'editorial', 'keeps configured token beside template reset');

select * from finish();
rollback;
