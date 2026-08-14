-- OneStudio OS
-- Package template layout-order save contract 3.5.1
--
-- VELORA introduced normalize_public_site_layout_order_v3 as the final layout
-- normalizer in the current save wrapper chain. The generic native-token change
-- later updated v2 only, so v3 could still strip canonical tokens belonging to
-- every package except VELORA. Keep one validation contract by delegating v3 to
-- the generic v2 implementation used by all current and future packages.

create or replace function public.normalize_public_site_layout_order_v2(
  p_value jsonb,
  p_template_id text
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select coalesce(jsonb_agg(item order by first_position), '[]'::jsonb)
  from (
    select item, min(position) as first_position
    from jsonb_array_elements_text(
      case when jsonb_typeof(p_value) = 'array' then p_value else '[]'::jsonb end
    ) with ordinality as requested(item, position)
    where
      item ~ '^section:(services|portfolio|booking|team|reviews|membership|gift|faq|safety|about|contact)$'
      or item ~ '^custom:[A-Za-z0-9][A-Za-z0-9._-]{0,159}$'
      or (
        lower(trim(coalesce(p_template_id, ''))) = 'premium-studio'
        and item ~ '^noir:(hero|manifest|light|services|portfolio|retouch|film|team|process|equipment|tour|reviews|faq|contact|footer)$'
      )
      or (
        lower(trim(coalesce(p_template_id, ''))) ~ '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'
        and item ~ '^native:[a-z][a-z0-9]*(?:-[a-z0-9]+)*:[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'
        and split_part(item, ':', 2) = lower(trim(coalesce(p_template_id, '')))
      )
    group by item
    order by min(position)
    limit 96
  ) ordered_items;
$$;

create or replace function public.normalize_public_site_layout_order_v3(
  p_value jsonb,
  p_template_id text
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select public.normalize_public_site_layout_order_v2(p_value, p_template_id);
$$;

revoke all on function public.normalize_public_site_layout_order_v2(jsonb, text)
  from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_layout_order_v3(jsonb, text)
  from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_layout_order_v2(jsonb, text) is
  'Canonical layout validator for standard, custom, legacy NOIR, and template-bound native:<template>:<section> tokens.';
comment on function public.normalize_public_site_layout_order_v3(jsonb, text) is
  'Compatibility alias for the canonical package-template layout-order validator v2.';
