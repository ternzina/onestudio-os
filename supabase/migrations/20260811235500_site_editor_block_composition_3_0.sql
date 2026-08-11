-- OneStudio OS
-- Site Editor Block Composition 3.0.
-- Adds an opt-in internal block layout without rewriting existing drafts.

create function public.normalize_public_site_composition_order(p_value jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_agg(item order by first_ordinality), '[]'::jsonb)
  from (
    select item, min(ordinality) as first_ordinality
    from jsonb_array_elements_text(
      case when jsonb_typeof(p_value) = 'array' then p_value else '[]'::jsonb end
    ) with ordinality as source(item, ordinality)
    where item in ('eyebrow','title','text','media','cards','action')
    group by item
    order by min(ordinality)
    limit 6
  ) normalized;
$$;

create function public.normalize_public_site_block_composition(p_value jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_order jsonb;
begin
  if jsonb_typeof(p_value) <> 'object' then return v_result; end if;

  if jsonb_typeof(p_value->'composition_enabled') = 'boolean' then
    v_result := v_result || jsonb_build_object('composition_enabled', (p_value->>'composition_enabled')::boolean);
  end if;
  if p_value->>'composition_layout' in ('stack','split','grid') then
    v_result := v_result || jsonb_build_object('composition_layout', p_value->>'composition_layout');
  end if;
  if p_value->>'composition_columns' in ('1','2','3','4') then
    v_result := v_result || jsonb_build_object('composition_columns', (p_value->>'composition_columns')::integer);
  end if;
  if p_value->>'composition_gap' in ('none','compact','normal','airy') then
    v_result := v_result || jsonb_build_object('composition_gap', p_value->>'composition_gap');
  end if;
  if p_value->>'composition_align' in ('start','center','end','stretch') then
    v_result := v_result || jsonb_build_object('composition_align', p_value->>'composition_align');
  end if;
  if p_value->>'composition_text_align' in ('left','center','right') then
    v_result := v_result || jsonb_build_object('composition_text_align', p_value->>'composition_text_align');
  end if;
  if p_value->>'composition_split_ratio' in ('balanced','content_wide','media_wide') then
    v_result := v_result || jsonb_build_object('composition_split_ratio', p_value->>'composition_split_ratio');
  end if;
  if p_value->>'composition_card_layout' in ('vertical','horizontal') then
    v_result := v_result || jsonb_build_object('composition_card_layout', p_value->>'composition_card_layout');
  end if;
  v_order := public.normalize_public_site_composition_order(p_value->'composition_order');
  if jsonb_array_length(v_order) > 0 then
    v_result := v_result || jsonb_build_object('composition_order', v_order);
  end if;

  if p_value->>'composition_mobile_layout' in ('stack','split','grid') then
    v_result := v_result || jsonb_build_object('composition_mobile_layout', p_value->>'composition_mobile_layout');
  end if;
  if p_value->>'composition_mobile_columns' in ('1','2') then
    v_result := v_result || jsonb_build_object('composition_mobile_columns', (p_value->>'composition_mobile_columns')::integer);
  end if;
  if p_value->>'composition_mobile_gap' in ('none','compact','normal','airy') then
    v_result := v_result || jsonb_build_object('composition_mobile_gap', p_value->>'composition_mobile_gap');
  end if;
  if p_value->>'composition_mobile_align' in ('start','center','end','stretch') then
    v_result := v_result || jsonb_build_object('composition_mobile_align', p_value->>'composition_mobile_align');
  end if;
  if p_value->>'composition_mobile_text_align' in ('left','center','right') then
    v_result := v_result || jsonb_build_object('composition_mobile_text_align', p_value->>'composition_mobile_text_align');
  end if;
  if p_value->>'composition_mobile_card_layout' in ('vertical','horizontal') then
    v_result := v_result || jsonb_build_object('composition_mobile_card_layout', p_value->>'composition_mobile_card_layout');
  end if;
  v_order := public.normalize_public_site_composition_order(p_value->'composition_mobile_order');
  if jsonb_array_length(v_order) > 0 then
    v_result := v_result || jsonb_build_object('composition_mobile_order', v_order);
  end if;

  return v_result;
end;
$$;

alter function public.normalize_public_site_custom_blocks(jsonb)
  rename to normalize_public_site_custom_blocks_v30_base;

create function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as block, ordinality
    from jsonb_array_elements(public.normalize_public_site_custom_blocks_v30_base(p_blocks)) with ordinality
  ), source as (
    select value as block, ordinality
    from jsonb_array_elements(case when jsonb_typeof(p_blocks)='array' then p_blocks else '[]'::jsonb end) with ordinality
    where jsonb_typeof(value)='object'
  )
  select coalesce(jsonb_agg(
    normalized.block || public.normalize_public_site_block_composition(coalesce((
      select source.block
      from source
      where left(lower(trim(source.block->>'id')), 72) = normalized.block->>'id'
      order by source.ordinality
      limit 1
    ), '{}'::jsonb))
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized;
$$;

revoke all on function public.normalize_public_site_composition_order(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_block_composition(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks_v30_base(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb) from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_block_composition(jsonb) is
  'Validates the opt-in desktop and mobile inner-layout tokens for Site Editor 3.0.';
comment on function public.normalize_public_site_custom_blocks(jsonb) is
  'Preserves the Site Editor 2.9 custom-block validator and adds opt-in Block Composition 3.0 tokens.';
