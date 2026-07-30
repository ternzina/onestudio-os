begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select is(
  jsonb_array_length(
    public.normalize_public_site_custom_blocks(
      '[
        {"id":"intro","kind":"text","title":"Story","tone":"light"},
        {"id":"benefits","kind":"features","items":"One\nTwo","tone":"dark"},
        {"id":"reserve","kind":"cta","button_label":"Book","button_url":"#booking","tone":"accent"}
      ]'::jsonb
    )
  ),
  3,
  'custom block normalizer keeps supported blocks'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"bad id","kind":"unknown","tone":"unknown"}]'::jsonb
  )->0->>'id',
  'block-1',
  'invalid custom block ids receive a safe fallback'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"safe","kind":"unknown","tone":"unknown"}]'::jsonb
  )->0->>'kind',
  'text',
  'unknown custom block kinds fall back to text'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"safe","kind":"cta","button_url":"javascript:alert(1)"}]'::jsonb
  )->0->>'button_url',
  '',
  'unsafe custom block links are removed'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"safe","kind":"cta","button_url":"https://example.com/path"}]'::jsonb
  )->0->>'button_url',
  'https://example.com/path',
  'https custom block links are preserved'
);

select is(
  jsonb_array_length(
    public.normalize_public_site_pages(
      '[
        {
          "id":"portfolio",
          "type":"portfolio",
          "slug":"portfolio",
          "nav_label":"Works"
        },
        {
          "id":"custom-care",
          "type":"custom",
          "slug":"care",
          "nav_label":"Care",
          "blocks":[{"id":"care-text","kind":"text","title":"Care"}]
        }
      ]'::jsonb
    )
  ),
  2,
  'page normalizer keeps portfolio and custom pages'
);

select is(
  public.normalize_public_site_pages(
    '[
      {
        "id":"custom-care",
        "type":"custom",
        "slug":"care",
        "blocks":[{"id":"care-text","kind":"text","title":"Care"}]
      }
    ]'::jsonb
  )->0->>'type',
  'custom',
  'custom page type is preserved'
);

select is(
  jsonb_array_length(
    public.normalize_public_site_pages(
      '[
        {
          "id":"custom-care",
          "type":"custom",
          "slug":"care",
          "blocks":[{"id":"care-text","kind":"text","title":"Care"}]
        }
      ]'::jsonb
    )->0->'blocks'
  ),
  1,
  'custom page blocks are normalized'
);

select is(
  jsonb_array_length(
    public.normalize_public_site_pages(
      '[
        {"type":"custom","slug":"same"},
        {"type":"custom","slug":"same"}
      ]'::jsonb
    )
  ),
  1,
  'duplicate public page slugs are removed'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.normalize_public_site_custom_blocks(jsonb)',
    'EXECUTE'
  ),
  'anonymous role cannot execute the custom block normalizer'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.normalize_public_site_pages(jsonb)',
    'EXECUTE'
  ),
  'authenticated role cannot execute internal page normalization directly'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.save_public_site_draft(uuid,text,jsonb,boolean)',
    'EXECUTE'
  ),
  'authenticated role can execute the protected draft save function'
);

select * from finish();

rollback;
