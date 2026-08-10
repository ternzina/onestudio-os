-- OneStudio OS
-- NOIR FRAME layout-order persistence 1.0
--
-- The existing Site Editor save pipeline validates layout_order but predates
-- premium-studio native section ids. It strips noir:* entries on every save.
-- This compatibility wrapper preserves the same bounded validation contract and
-- additionally allows the fixed NOIR section ids only for premium-studio.

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
      or item ~ '^custom:[A-Za-z0-9._:-]{1,160}$'
      or (
        lower(trim(coalesce(p_template_id, ''))) = 'premium-studio'
        and item ~ '^noir:(hero|manifest|light|services|portfolio|retouch|film|team|process|equipment|tour|reviews|faq|contact|footer)$'
      )
    group by item
    order by min(position)
    limit 96
  ) ordered_items;
$$;

alter function public.save_public_site_draft(uuid, text, jsonb, boolean)
  rename to save_public_site_draft_v_noir_layout_1_0;

create function public.save_public_site_draft(
  p_business_id uuid,
  p_locale text,
  p_content jsonb,
  p_make_primary boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locale text := lower(trim(coalesce(p_locale, '')));
  v_previous jsonb := '{}'::jsonb;
  v_saved jsonb;
  v_template_id text;
  v_layout_source jsonb := '[]'::jsonb;
  v_layout jsonb := '[]'::jsonb;
begin
  select coalesce(locale_row.draft_content, locale_row.published_content, '{}'::jsonb)
    into v_previous
  from public.public_site_locales locale_row
  where locale_row.business_id = p_business_id
    and locale_row.locale = v_locale
  limit 1;

  v_previous := coalesce(v_previous, '{}'::jsonb);

  v_saved := public.save_public_site_draft_v_noir_layout_1_0(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );

  v_template_id := lower(trim(coalesce(
    nullif(p_content->>'template_id', ''),
    nullif(v_previous->>'template_id', '')
  )));

  if jsonb_typeof(p_content->'layout_order') = 'array' then
    v_layout_source := p_content->'layout_order';
  elsif jsonb_typeof(v_previous->'layout_order') = 'array' then
    v_layout_source := v_previous->'layout_order';
  end if;

  v_layout := public.normalize_public_site_layout_order_v2(
    v_layout_source,
    v_template_id
  );

  v_saved := coalesce(v_saved, '{}'::jsonb)
    || jsonb_build_object('layout_order', v_layout);

  update public.public_site_locales
  set draft_content = v_saved,
      updated_at = now()
  where business_id = p_business_id
    and locale = v_locale;

  if not found then
    raise exception 'public_site_locale_not_found' using errcode = '23503';
  end if;

  return v_saved;
end;
$$;

revoke all on function public.normalize_public_site_layout_order_v2(jsonb, text)
  from public, anon, authenticated, service_role;

revoke all on function public.save_public_site_draft_v_noir_layout_1_0(
  uuid, text, jsonb, boolean
) from public, anon, authenticated, service_role;

revoke execute on function public.save_public_site_draft(
  uuid, text, jsonb, boolean
) from public, anon, authenticated;

grant execute on function public.save_public_site_draft(
  uuid, text, jsonb, boolean
) to authenticated;

grant execute on function public.save_public_site_draft(
  uuid, text, jsonb, boolean
) to service_role;

comment on function public.normalize_public_site_layout_order_v2(jsonb, text) is
  'Validates bounded public-site layout order and allows premium-studio noir:* native section ids only for that template.';

comment on function public.save_public_site_draft(uuid, text, jsonb, boolean) is
  'Site Editor save pipeline with generic template content preservation and NOIR FRAME native layout-order persistence.';
