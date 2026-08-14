-- OneStudio OS
-- Canonical template layout-order persistence 3.5
--
-- New template contracts use:
--   native:<template-key>:<section-id>
--
-- The older DB normalizer only accepted standard section:*, custom:*,
-- and the legacy premium-studio noir:* tokens.
-- This migration makes canonical native tokens persist generically while
-- ensuring that a native token can only belong to the active template.

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
      case
        when jsonb_typeof(p_value) = 'array' then p_value
        else '[]'::jsonb
      end
    ) with ordinality as requested(item, position)
    where
      -- Legacy standard OneStudio sections.
      item ~ '^section:(services|portfolio|booking|team|reviews|membership|gift|faq|safety|about|contact)$'

      -- Universal customer-added blocks.
      or item ~ '^custom:[A-Za-z0-9._:-]{1,160}$'

      -- Legacy NOIR composition kept for existing premium-studio sites.
      or (
        lower(trim(coalesce(p_template_id, ''))) = 'premium-studio'
        and item ~ '^noir:(hero|manifest|light|services|portfolio|retouch|film|team|process|equipment|tour|reviews|faq|contact|footer)$'
      )

      -- Canonical template-native composition.
      -- Token must belong to the template currently being saved.
      or (
        lower(trim(coalesce(p_template_id, '')))
          ~ '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'
        and item
          ~ '^native:[a-z][a-z0-9]*(?:-[a-z0-9]+)*:[a-z][a-z0-9]*(?:-[a-z0-9]+)*$'
        and split_part(item, ':', 2)
          = lower(trim(coalesce(p_template_id, '')))
      )
    group by item
    order by min(position)
    limit 96
  ) ordered_items;
$$;

comment on function public.normalize_public_site_layout_order_v2(jsonb, text) is
  'Validates standard, custom, legacy NOIR, and canonical native:<template>:<section> layout tokens while binding native tokens to the active template.';
