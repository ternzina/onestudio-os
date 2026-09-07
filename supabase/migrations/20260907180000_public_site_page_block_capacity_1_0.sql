-- Generic public-site custom-page block capacity 1.0.
--
-- The original Site Editor 2.2 validator intentionally capped an array at
-- twelve blocks. Later 2.9, 3.0, 3.3, 3.3.1, and LeadsGate wrappers preserve
-- that complete validator, so custom pages with more than twelve valid blocks
-- were silently shortened. Keep the full terminal validator and invoke it for
-- each globally canonicalized block instead. This preserves every later
-- validation contract while raising a clear error above the technical limit.

do $$
begin
  if to_regprocedure(
    'public.normalize_public_site_custom_blocks_v_page_block_capacity_1_0(jsonb)'
  ) is null then
    alter function public.normalize_public_site_custom_blocks(jsonb)
      rename to normalize_public_site_custom_blocks_v_page_block_capacity_1_0;
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
  v_normalized_item jsonb;
  v_normalized jsonb;
  v_result jsonb := '[]'::jsonb;
  v_block_id text;
  v_seen_ids text[] := '{}'::text[];
  v_output_count integer := 0;
begin
  if jsonb_typeof(p_blocks) <> 'array' then
    return v_result;
  end if;

  if jsonb_array_length(p_blocks) > 64 then
    raise exception 'public_site_block_limit_exceeded' using errcode = '22023';
  end if;

  -- Canonicalize IDs once across the whole array before delegating each item.
  -- This deliberately retains the old validator's fallback-ID and duplicate-ID
  -- behavior without allowing each delegated one-item call to reset it.
  for v_item in
    select value
    from jsonb_array_elements(p_blocks)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      continue;
    end if;

    v_block_id := lower(trim(coalesce(v_item->>'id', '')));
    if v_block_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      v_block_id := 'block-' || (v_output_count + 1)::text;
    end if;
    v_block_id := left(v_block_id, 72);

    if v_block_id = any(v_seen_ids) then
      continue;
    end if;

    v_normalized_item := v_item || jsonb_build_object('id', v_block_id);
    v_normalized := public.normalize_public_site_custom_blocks_v_page_block_capacity_1_0(
      jsonb_build_array(v_normalized_item)
    );

    if jsonb_typeof(v_normalized) = 'array' and jsonb_array_length(v_normalized) = 1 then
      v_result := v_result || jsonb_build_array(v_normalized->0);
      v_seen_ids := array_append(v_seen_ids, v_block_id);
      v_output_count := v_output_count + 1;
    end if;
  end loop;

  return v_result;
end;
$$;

revoke all on function public.normalize_public_site_custom_blocks_v_page_block_capacity_1_0(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb)
  from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_custom_blocks(jsonb) is
  'Complete custom-block normalizer with a 64-block technical guardrail. Preserves the 2.9/3.0/3.3/3.3.1 and LeadsGate validation chain without silent truncation.';
