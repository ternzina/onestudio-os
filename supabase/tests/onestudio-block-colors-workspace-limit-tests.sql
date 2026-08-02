\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

select has_function(
  'public',
  'normalize_public_site_block_colors',
  array['jsonb'],
  'block color normalizer exists'
);
select has_function(
  'public',
  'normalize_public_site_section_colors',
  array['jsonb'],
  'section color normalizer exists'
);
select has_trigger(
  'public',
  'businesses',
  'enforce_owned_workspace_limit_trigger',
  'workspace limit trigger exists'
);

select is(
  public.normalize_public_site_block_colors(
    '{"mode":"custom","background":"#112233","text":"#FfFfFf","accent":"#AABBCC"}'::jsonb
  ),
  '{"mode":"custom","background":"#112233","text":"#ffffff","accent":"#aabbcc"}'::jsonb,
  'custom block colors are normalized and preserved'
);

select is(
  public.normalize_public_site_block_colors('{"mode":"theme"}'::jsonb),
  '{"mode":"theme"}'::jsonb,
  'theme mode does not persist redundant colors'
);

select is(
  public.normalize_public_site_section_colors(
    '{"hero":{"mode":"custom","background":"#112233","text":"#ffffff","accent":"#aabbcc"},"unknown":{"mode":"custom"}}'::jsonb
  ) ? 'unknown',
  false,
  'unknown section color keys are removed'
);

select is(
  public.normalize_public_site_content(
    'Color Test',
    'ru',
    jsonb_build_object(
      'section_colors',
      '{"services":{"mode":"custom","background":"#101010","text":"#fefefe","accent":"#ddaa44"}}'::jsonb
    )
  ) #>> '{section_colors,services,background}',
  '#101010',
  'standard section colors survive content normalization'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"color-block","kind":"text","title":"Color","tone":"light","colors":{"mode":"custom","background":"#202020","text":"#ffffff","accent":"#cc8844"}}]'::jsonb
  ) #>> '{0,colors,background}',
  '#202020',
  'custom block colors survive block normalization'
);

select matches(
  pg_get_functiondef(
    'public.save_public_site_draft(uuid,text,jsonb,boolean)'::regprocedure
  ),
  'section_colors',
  'public site draft save explicitly preserves section colors'
);

select * from finish();
rollback;
