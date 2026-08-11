begin;
select plan(6);

create temporary table rich_heading_fixture(value text);
insert into rich_heading_fixture values (
  '__osrt1__:{"version":1,"root":{"type":"root","children":[{"type":"p","children":[{"type":"text","text":"One"},{"type":"span","color":"#ff0000","children":[{"type":"text","text":"S"}]}]}]}}'
);

select is(
  public.normalize_public_site_rich_heading((select value from rich_heading_fixture)),
  (select value from rich_heading_fixture),
  'accepts a bounded rich heading document'
);

select is(
  public.normalize_public_site_rich_heading('__osrt1__:{bad json'),
  null,
  'rejects malformed rich heading JSON'
);

select is(
  public.normalize_public_site_rich_heading('Plain heading'),
  null,
  'plain headings continue through the existing scalar validator'
);

select is(
  public.merge_public_site_rich_block_titles(
    '[{"id":"block-1","kind":"text","title":"truncated"}]'::jsonb,
    jsonb_build_array(jsonb_build_object('id','block-1','kind','text','title',(select value from rich_heading_fixture)))
  )->0->>'title',
  (select value from rich_heading_fixture),
  'restores rich titles on manually assembled blocks'
);

select is(
  public.merge_public_site_rich_page_titles(
    '[{"id":"page-1","title":"short","blocks":[{"id":"nested-1","kind":"text","title":"short"}]}]'::jsonb,
    jsonb_build_array(jsonb_build_object(
      'id','page-1','title',(select value from rich_heading_fixture),
      'blocks',jsonb_build_array(jsonb_build_object('id','nested-1','kind','text','title',(select value from rich_heading_fixture)))
    ))
  )->0->>'title',
  (select value from rich_heading_fixture),
  'restores rich page titles'
);

select is(
  public.merge_public_site_rich_page_titles(
    '[{"id":"page-1","title":"short","blocks":[{"id":"nested-1","kind":"text","title":"short"}]}]'::jsonb,
    jsonb_build_array(jsonb_build_object(
      'id','page-1','title','Plain title',
      'blocks',jsonb_build_array(jsonb_build_object('id','nested-1','kind','text','title',(select value from rich_heading_fixture)))
    ))
  )->0->'blocks'->0->>'title',
  (select value from rich_heading_fixture),
  'restores rich titles on blocks nested inside pages'
);

select * from finish();
rollback;
