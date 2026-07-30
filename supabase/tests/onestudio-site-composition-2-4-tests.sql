begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"story","kind":"media_text","media_type":"image","media_position":"left"}]'::jsonb
  )->0->>'kind',
  'media_text',
  'split media and text blocks are preserved'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"story","kind":"media_text","media_position":"unknown"}]'::jsonb
  )->0->>'media_position',
  'right',
  'invalid media positions use the right-side default'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"story","kind":"media_text","media_url":"javascript:alert(1)"}]'::jsonb
  )->0->>'media_url',
  '',
  'unsafe split block media URLs are removed'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"story","kind":"media_text","media_url":"https://cdn.example.test/photo.webp"}]'::jsonb
  )->0->>'media_url',
  'https://cdn.example.test/photo.webp',
  'HTTPS split block media URLs are preserved'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"story","kind":"media_text","media_alt":"  Nail studio interior  "}]'::jsonb
  )->0->>'media_alt',
  'Nail studio interior',
  'split block alternative text is normalized'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"cards","kind":"columns","columns_count":2}]'::jsonb
  )->0->>'kind',
  'columns',
  'column blocks are preserved'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"cards","kind":"columns","columns_count":2}]'::jsonb
  )->0->>'columns_count',
  '2',
  'two-column layout is preserved'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"cards","kind":"columns","columns_count":9}]'::jsonb
  )->0->>'columns_count',
  '3',
  'invalid column counts use the three-column default'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"story","kind":"media_text","media_type":"file"}]'::jsonb
  )->0->>'media_type',
  'image',
  'arbitrary file types cannot become public media'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"story","kind":"media_text","video_url":"data:text/html,bad"}]'::jsonb
  )->0->>'video_url',
  '',
  'unsafe video URLs are removed'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.normalize_public_site_custom_blocks(jsonb)',
    'EXECUTE'
  ),
  'anonymous visitors cannot execute internal block normalization'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.save_public_site_draft(uuid,text,jsonb,boolean)',
    'EXECUTE'
  ),
  'authenticated configurators keep protected draft save access'
);

select * from finish();

rollback;
