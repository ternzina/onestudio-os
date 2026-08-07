-- OneStudio OS
-- Site Editor Heading Controls 2.6.3.
-- Replace vague heading-size presets with explicit pixel-size tokens.

create or replace function public.normalize_public_site_typography(p_value jsonb)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'font_family', case when p_value->>'font_family' in ('template','system','humanist','editorial') then p_value->>'font_family' end,
    'font_size', case when (p_value->>'font_size') ~ '^[0-9]+$' and (p_value->>'font_size')::int between 10 and 160 then (p_value->>'font_size')::int end,
    'font_weight', case when p_value->>'font_weight' in ('400','500','600','700') then (p_value->>'font_weight')::int end,
    'italic', case when jsonb_typeof(p_value->'italic')='boolean' and (p_value->>'italic')::boolean then true end,
    'underline', case when jsonb_typeof(p_value->'underline')='boolean' and (p_value->>'underline')::boolean then true end,
    'text_align', case when p_value->>'text_align' in ('left','center','right','justify') then p_value->>'text_align' end,
    'color', case when p_value->>'color' ~* '^#[0-9a-f]{6}$' then lower(p_value->>'color') end,
    'line_height', case when (p_value->>'line_height') ~ '^[0-9]+([.][0-9]+)?$' and (p_value->>'line_height')::numeric between 0.8 and 3 then (p_value->>'line_height')::numeric end,
    'letter_spacing', case when (p_value->>'letter_spacing') ~ '^-?[0-9]+([.][0-9]+)?$' and (p_value->>'letter_spacing')::numeric between -5 and 20 then (p_value->>'letter_spacing')::numeric end
  ));
$$;

create or replace function public.normalize_public_site_system_section_settings(
  p_settings jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_section text;
  v_item jsonb;
  v_normalized jsonb;
  v_background_url text;
begin
  if p_settings is null or jsonb_typeof(p_settings) <> 'object' then return v_result; end if;

  foreach v_section in array array['hero','services','portfolio','booking','about','team','reviews','membership','gift','faq','safety','contact'] loop
    if not (p_settings ? v_section) then continue; end if;
    v_item := p_settings->v_section;
    if jsonb_typeof(v_item) <> 'object' then continue; end if;
    v_normalized := '{}'::jsonb;

    if v_item ? 'layout' then v_normalized := v_normalized || jsonb_build_object('layout', case when v_item->>'layout'='panel' then 'panel' else 'default' end); end if;
    if v_item ? 'content_width' then v_normalized := v_normalized || jsonb_build_object('content_width', case when v_item->>'content_width' in ('full','wide','medium','narrow') then v_item->>'content_width' else 'wide' end); end if;
    if v_item ? 'padding_top' then v_normalized := v_normalized || jsonb_build_object('padding_top', case when v_item->>'padding_top' in ('none','compact','normal','airy') then v_item->>'padding_top' else 'normal' end); end if;
    if v_item ? 'padding_bottom' then v_normalized := v_normalized || jsonb_build_object('padding_bottom', case when v_item->>'padding_bottom' in ('none','compact','normal','airy') then v_item->>'padding_bottom' else 'normal' end); end if;
    if v_item ? 'section_height' then v_normalized := v_normalized || jsonb_build_object('section_height', case when v_item->>'section_height' in ('auto','compact','medium','tall','screen') then v_item->>'section_height' else 'auto' end); end if;
    if v_item ? 'text_align' then v_normalized := v_normalized || jsonb_build_object('text_align', case when v_item->>'text_align' in ('left','center','right') then v_item->>'text_align' else 'left' end); end if;
    if v_item ? 'heading_font' then v_normalized := v_normalized || jsonb_build_object('heading_font', case when v_item->>'heading_font' in ('template','system','humanist','editorial') then v_item->>'heading_font' else 'template' end); end if;
    if v_item ? 'heading_size' then v_normalized := v_normalized || jsonb_build_object('heading_size', case
      when v_item->>'heading_size' in ('24','32','40','48','56','64','72','88','104') then v_item->>'heading_size'
      when v_item->>'heading_size'='small' then '32'
      when v_item->>'heading_size'='medium' then '48'
      when v_item->>'heading_size'='large' then '72'
      when v_item->>'heading_size'='display' then '104'
      else 'template' end); end if;
    if v_item ? 'heading_weight' then v_normalized := v_normalized || jsonb_build_object('heading_weight', case when v_item->>'heading_weight' in ('template','regular','medium','semibold','bold') then v_item->>'heading_weight' else 'template' end); end if;
    if v_item ? 'heading_typography' and public.normalize_public_site_typography(v_item->'heading_typography') <> '{}'::jsonb then v_normalized := v_normalized || jsonb_build_object('heading_typography', public.normalize_public_site_typography(v_item->'heading_typography')); end if;
    if v_item ? 'background_mode' then v_normalized := v_normalized || jsonb_build_object('background_mode', case when v_item->>'background_mode' in ('theme','color','image','transparent') then v_item->>'background_mode' else 'theme' end); end if;
    if v_item ? 'background_image_url' then v_background_url := public.normalize_public_site_media_url(v_item->>'background_image_url'); v_normalized := v_normalized || jsonb_build_object('background_image_url', v_background_url); end if;
    if v_item ? 'background_position' then v_normalized := v_normalized || jsonb_build_object('background_position', case when v_item->>'background_position' in ('top','center','bottom') then v_item->>'background_position' else 'center' end); end if;
    if v_item ? 'background_overlay' then v_normalized := v_normalized || jsonb_build_object('background_overlay', case when v_item->>'background_overlay' in ('none','soft','strong') then v_item->>'background_overlay' else 'soft' end); end if;
    if v_item ? 'animation' then v_normalized := v_normalized || jsonb_build_object('animation', case when v_item->>'animation' in ('none','fade','rise','scale') then v_item->>'animation' else 'none' end); end if;
    if v_item ? 'animate_on_mobile' then v_normalized := v_normalized || jsonb_build_object('animate_on_mobile', case when jsonb_typeof(v_item->'animate_on_mobile')='boolean' then (v_item->>'animate_on_mobile')::boolean else true end); end if;
    if v_item ? 'hide_on_desktop' then v_normalized := v_normalized || jsonb_build_object('hide_on_desktop', case when jsonb_typeof(v_item->'hide_on_desktop')='boolean' then (v_item->>'hide_on_desktop')::boolean else false end); end if;
    if v_item ? 'hide_on_tablet' then v_normalized := v_normalized || jsonb_build_object('hide_on_tablet', case when jsonb_typeof(v_item->'hide_on_tablet')='boolean' then (v_item->>'hide_on_tablet')::boolean else false end); end if;
    if v_item ? 'hide_on_mobile' then v_normalized := v_normalized || jsonb_build_object('hide_on_mobile', case when jsonb_typeof(v_item->'hide_on_mobile')='boolean' then (v_item->>'hide_on_mobile')::boolean else false end); end if;
    if v_normalized <> '{}'::jsonb then v_result := v_result || jsonb_build_object(v_section, v_normalized); end if;
  end loop;
  return v_result;
end;
$$;

comment on function public.normalize_public_site_system_section_settings(jsonb) is
  'Validates sparse built-in section layout, explicit heading typography, background, animation and device visibility settings (Site Editor 2.6.3).';

-- Preserve the same local heading model on custom blocks without rewriting the
-- proven 2.2 block validator. Matching is positional after its validation pass.
alter function public.normalize_public_site_custom_blocks(jsonb)
  rename to normalize_public_site_custom_blocks_v263_base;

create function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb language sql immutable set search_path = public as $$
  with normalized as (
    select value as block, ordinality from jsonb_array_elements(public.normalize_public_site_custom_blocks_v263_base(p_blocks)) with ordinality
  ), source as (
    select value as block, ordinality from jsonb_array_elements(case when jsonb_typeof(p_blocks)='array' then p_blocks else '[]'::jsonb end) with ordinality
  )
  select coalesce(jsonb_agg(
    case when public.normalize_public_site_typography(source.block->'title_typography') = '{}'::jsonb
      then normalized.block
      else normalized.block || jsonb_build_object('title_typography', public.normalize_public_site_typography(source.block->'title_typography'))
    end order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized left join source using (ordinality);
$$;

alter function public.normalize_public_site_pages(jsonb)
  rename to normalize_public_site_pages_v263_base;

create function public.normalize_public_site_pages(p_pages jsonb)
returns jsonb language sql immutable set search_path = public as $$
  with normalized as (
    select value as page, ordinality from jsonb_array_elements(public.normalize_public_site_pages_v263_base(p_pages)) with ordinality
  ), source as (
    select value as page, ordinality from jsonb_array_elements(case when jsonb_typeof(p_pages)='array' then p_pages else '[]'::jsonb end) with ordinality
  )
  select coalesce(jsonb_agg(
    case when public.normalize_public_site_typography(source.page->'title_typography') = '{}'::jsonb
      then normalized.page
      else normalized.page || jsonb_build_object('title_typography', public.normalize_public_site_typography(source.page->'title_typography'))
    end order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized left join source using (ordinality);
$$;

revoke all on function public.normalize_public_site_typography(jsonb) from public, anon, authenticated;
revoke all on function public.normalize_public_site_custom_blocks_v263_base(jsonb) from public, anon, authenticated;
revoke all on function public.normalize_public_site_custom_blocks(jsonb) from public, anon, authenticated;
revoke all on function public.normalize_public_site_pages_v263_base(jsonb) from public, anon, authenticated;
revoke all on function public.normalize_public_site_pages(jsonb) from public, anon, authenticated;
