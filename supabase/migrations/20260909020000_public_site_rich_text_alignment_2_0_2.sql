-- Public-site rich-text persistence 2.0.2.
--
-- The 2.0.1 wrapper paired normalized blocks with raw input by ordinality.
-- The inherited canonicalizer may skip non-object and duplicate-ID inputs, so
-- reconstruct its stable final IDs before restoring rich-text fields.

create or replace function public.is_valid_public_site_rich_text_node(
  p_node jsonb,
  p_depth integer default 0
)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  v_type text;
  v_child jsonb;
begin
  if jsonb_typeof(p_node) <> 'object' or p_depth > 32
    or exists (
      select 1 from jsonb_object_keys(p_node) as key
      where key not in ('type', 'text', 'align', 'color', 'fontFamily', 'fontSize', 'href', 'children')
    ) then
    return false;
  end if;

  v_type := p_node->>'type';
  if v_type is null
    or v_type not in ('root', 'p', 'ul', 'ol', 'li', 'br', 'strong', 'em', 'u', 'span', 'a', 'text')
    or (p_node ? 'text' and jsonb_typeof(p_node->'text') <> 'string')
    or (p_node ? 'align' and p_node->>'align' not in ('left', 'center', 'right', 'justify'))
    or (p_node ? 'color' and jsonb_typeof(p_node->'color') <> 'string')
    or (p_node ? 'fontFamily' and jsonb_typeof(p_node->'fontFamily') <> 'string')
    or (p_node ? 'fontSize' and jsonb_typeof(p_node->'fontSize') <> 'number')
    or (p_node ? 'href' and jsonb_typeof(p_node->'href') <> 'string') then
    return false;
  end if;

  if v_type = 'text' then
    return p_node ? 'text' and not p_node ? 'children';
  end if;
  if v_type = 'br' then
    return not p_node ? 'children';
  end if;
  if coalesce(jsonb_typeof(p_node->'children'), '') <> 'array'
    or jsonb_array_length(p_node->'children') > 10000 then
    return false;
  end if;
  for v_child in select value from jsonb_array_elements(p_node->'children') loop
    if not public.is_valid_public_site_rich_text_node(v_child, p_depth + 1) then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

create or replace function public.normalize_public_site_rich_text_cards(
  p_source_cards jsonb,
  p_normalized_cards jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_source_card jsonb;
  v_normalized_card jsonb;
  v_sources jsonb[] := '{}'::jsonb[];
  v_result jsonb := '[]'::jsonb;
  v_index integer := 0;
begin
  -- normalize_public_site_column_cards skips only non-objects, retains the
  -- remaining order, and caps output at three cards. Mirror that source shape
  -- before pairing it with the already-canonical normalized cards.
  if jsonb_typeof(p_source_cards) = 'array' then
    for v_source_card in select value from jsonb_array_elements(p_source_cards) loop
      exit when array_length(v_sources, 1) >= 3;
      if jsonb_typeof(v_source_card) = 'object' then
        v_sources := array_append(v_sources, v_source_card);
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_normalized_cards) <> 'array' then
    return v_result;
  end if;
  for v_normalized_card in select value from jsonb_array_elements(p_normalized_cards) loop
    v_index := v_index + 1;
    v_source_card := v_sources[v_index];
    if v_source_card is null then
      v_result := v_result || jsonb_build_array(v_normalized_card);
    else
      v_result := v_result || jsonb_build_array(v_normalized_card || jsonb_build_object(
        'title', public.normalize_public_site_rich_text_value(v_source_card->>'title', 180, 20000),
        'text', public.normalize_public_site_rich_text_value(v_source_card->>'text', 2000, 40000)
      ));
    end if;
  end loop;
  return v_result;
end;
$$;

do $$
begin
  if to_regprocedure(
    'public.normalize_public_site_custom_blocks_v_richtext_202(jsonb)'
  ) is null then
    alter function public.normalize_public_site_custom_blocks(jsonb)
      rename to normalize_public_site_custom_blocks_v_richtext_202;
  end if;
end;
$$;

create or replace function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_item jsonb;
  v_normalized jsonb;
  v_source_ids text[] := '{}'::text[];
  v_sources jsonb[] := '{}'::jsonb[];
  v_result jsonb := '[]'::jsonb;
  v_block_id text;
  v_source_index integer;
  v_output_count integer := 0;
begin
  -- Bypass the 2.0.1 ordinal wrapper and delegate directly to its preserved
  -- pre-wrapper canonicalizer, so no block is lost before ID matching starts.
  v_normalized := public.normalize_public_site_custom_blocks_v_richtext_201(p_blocks);
  if jsonb_typeof(v_normalized) <> 'array' then
    return v_result;
  end if;

  -- This is the inherited page-block-capacity identity contract: invalid IDs
  -- receive a fallback based on surviving output count, and duplicates drop.
  if jsonb_typeof(p_blocks) = 'array' then
    for v_item in select value from jsonb_array_elements(p_blocks) loop
      if jsonb_typeof(v_item) <> 'object' then
        continue;
      end if;
      v_block_id := lower(trim(coalesce(v_item->>'id', '')));
      if v_block_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
        v_block_id := 'block-' || (v_output_count + 1)::text;
      end if;
      v_block_id := left(v_block_id, 72);
      if v_block_id = any(v_source_ids) then
        continue;
      end if;
      v_source_ids := array_append(v_source_ids, v_block_id);
      v_sources := array_append(v_sources, v_item);
      v_output_count := v_output_count + 1;
    end loop;
  end if;

  for v_item in select value from jsonb_array_elements(v_normalized) loop
    v_source_index := array_position(v_source_ids, v_item->>'id');
    if v_source_index is null then
      v_result := v_result || jsonb_build_array(v_item);
    else
      v_result := v_result || jsonb_build_array(
        public.normalize_public_site_rich_text_block(v_sources[v_source_index], v_item)
      );
    end if;
  end loop;
  return v_result;
end;
$$;

revoke all on function public.is_valid_public_site_rich_text_node(jsonb, integer) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_rich_text_cards(jsonb, jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks_v_richtext_202(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb) from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_custom_blocks(jsonb) is
  'Complete custom-block normalizer with atomic rich-text preservation mapped by inherited final block IDs.';
