-- OneStudio OS
-- Site Editor Typography & UX 2.6.2.
-- Preserve sparse per-section heading typography in the existing system-section settings object.

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
    if v_item ? 'heading_size' then v_normalized := v_normalized || jsonb_build_object('heading_size', case when v_item->>'heading_size' in ('template','small','medium','large','display') then v_item->>'heading_size' else 'template' end); end if;
    if v_item ? 'heading_weight' then v_normalized := v_normalized || jsonb_build_object('heading_weight', case when v_item->>'heading_weight' in ('template','regular','medium','semibold','bold') then v_item->>'heading_weight' else 'template' end); end if;
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
  'Validates sparse built-in section layout, heading typography, background, animation and device visibility settings (Site Editor 2.6.2).';
