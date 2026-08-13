-- Site Editor Core Block Library 3.3: additive semantic preset identity and
-- bounded advanced-block fields. Existing block schemas remain unchanged.

create function public.sanitize_public_site_html_3_3(p_value text)
returns text language sql immutable set search_path = public as $$
  select left(
    regexp_replace(
      regexp_replace(
        regexp_replace(coalesce(p_value, ''), '<!--[\s\S]*?-->', '', 'gi'),
        '<\/?(script|style|iframe|object|embed|form|svg|math|template|link|meta|base)\b[^>]*>', '', 'gi'
      ),
      '\s(on[a-z]+|style|srcdoc|formaction)\s*=\s*("[^"]*"|''[^'']*''|[^\s>]+)', '', 'gi'
    ), 20000
  );
$$;

alter function public.normalize_public_site_custom_blocks(jsonb)
  rename to normalize_public_site_custom_blocks_v33_base;

create function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb language sql immutable set search_path = public as $$
  with normalized as (
    select value as block, ordinality
    from jsonb_array_elements(public.normalize_public_site_custom_blocks_v33_base(p_blocks)) with ordinality
  ), source as (
    select value as block, ordinality
    from jsonb_array_elements(case when jsonb_typeof(p_blocks) = 'array' then p_blocks else '[]'::jsonb end) with ordinality
    where jsonb_typeof(value) = 'object'
  )
  select coalesce(jsonb_agg(
    normalized.block
    || case when source.block->>'kind' in ('html_embed','spacer') then jsonb_build_object('kind', source.block->>'kind') else '{}'::jsonb end
    || case when source.block->>'preset_id' in ('about','services','team','pricing','contact','portfolio','gallery','reviews','faq','text','text-media','cards','video','cta','html-embed','spacer-divider') then jsonb_build_object('preset_id', source.block->>'preset_id') else '{}'::jsonb end
    || case when source.block->>'kind' = 'html_embed' then jsonb_build_object(
      'html_source', public.sanitize_public_site_html_3_3(source.block->>'html_source'),
      'embed_url', case when left(lower(trim(coalesce(source.block->>'embed_url',''))), 8) = 'https://' then left(trim(source.block->>'embed_url'), 2048) else '' end,
      'embed_title', left(trim(coalesce(source.block->>'embed_title','')), 160),
      'embed_height', greatest(180, least(900, case when coalesce(source.block->>'embed_height','') ~ '^\d+$' then (source.block->>'embed_height')::integer else 420 end))
    ) else '{}'::jsonb end
    || case when source.block->>'kind' = 'spacer' then jsonb_build_object(
      'spacer_size', case when source.block->>'spacer_size' in ('compact','normal','airy') then source.block->>'spacer_size' else 'normal' end,
      'show_divider', case when jsonb_typeof(source.block->'show_divider')='boolean' then (source.block->>'show_divider')::boolean else false end
    ) else '{}'::jsonb end
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized join source using (ordinality);
$$;

revoke all on function public.sanitize_public_site_html_3_3(text) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks_v33_base(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb) from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_custom_blocks(jsonb) is
  'Preserves the full Site Editor 3.0 normalizer and adds bounded Core Block Library 3.3 preset, safe HTML/embed and spacer fields.';
