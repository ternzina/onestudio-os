-- OneStudio OS
-- Site Editor System Sections 2.3.
--
-- Adds validated visual settings for built-in public-site sections and
-- preserves them through the compatibility draft-save path.

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
  if p_settings is null or jsonb_typeof(p_settings) <> 'object' then
    return v_result;
  end if;

  foreach v_section in array array[
    'hero', 'services', 'portfolio', 'booking', 'about', 'team',
    'reviews', 'membership', 'gift', 'faq', 'safety', 'contact'
  ]
  loop
    if not (p_settings ? v_section) then
      continue;
    end if;

    v_item := p_settings->v_section;
    if jsonb_typeof(v_item) <> 'object' then
      continue;
    end if;

    -- Keep the document sparse. Unchanged settings must continue to inherit
    -- each template's original spacing, alignment and background.
    v_normalized := '{}'::jsonb;

    if v_item ? 'layout' then
      v_normalized := v_normalized || jsonb_build_object(
        'layout', case
          when v_item->>'layout' = 'panel' then 'panel'
          else 'default'
        end
      );
    end if;

    if v_item ? 'content_width' then
      v_normalized := v_normalized || jsonb_build_object(
        'content_width', case
          when v_item->>'content_width' in ('full', 'wide', 'medium', 'narrow')
            then v_item->>'content_width'
          else 'wide'
        end
      );
    end if;

    if v_item ? 'padding_top' then
      v_normalized := v_normalized || jsonb_build_object(
        'padding_top', case
          when v_item->>'padding_top' in ('none', 'compact', 'normal', 'airy')
            then v_item->>'padding_top'
          else 'normal'
        end
      );
    end if;

    if v_item ? 'padding_bottom' then
      v_normalized := v_normalized || jsonb_build_object(
        'padding_bottom', case
          when v_item->>'padding_bottom' in ('none', 'compact', 'normal', 'airy')
            then v_item->>'padding_bottom'
          else 'normal'
        end
      );
    end if;

    if v_item ? 'section_height' then
      v_normalized := v_normalized || jsonb_build_object(
        'section_height', case
          when v_item->>'section_height' in ('auto', 'compact', 'medium', 'tall', 'screen')
            then v_item->>'section_height'
          else 'auto'
        end
      );
    end if;

    if v_item ? 'text_align' then
      v_normalized := v_normalized || jsonb_build_object(
        'text_align', case
          when v_item->>'text_align' in ('left', 'center', 'right')
            then v_item->>'text_align'
          else 'left'
        end
      );
    end if;

    if v_item ? 'background_mode' then
      v_normalized := v_normalized || jsonb_build_object(
        'background_mode', case
          when v_item->>'background_mode' in ('theme', 'color', 'image', 'transparent')
            then v_item->>'background_mode'
          else 'theme'
        end
      );
    end if;

    if v_item ? 'background_image_url' then
      v_background_url := public.normalize_public_site_media_url(
        v_item->>'background_image_url'
      );
      v_normalized := v_normalized || jsonb_build_object(
        'background_image_url', v_background_url
      );
    end if;

    if v_item ? 'background_position' then
      v_normalized := v_normalized || jsonb_build_object(
        'background_position', case
          when v_item->>'background_position' in ('top', 'center', 'bottom')
            then v_item->>'background_position'
          else 'center'
        end
      );
    end if;

    if v_item ? 'background_overlay' then
      v_normalized := v_normalized || jsonb_build_object(
        'background_overlay', case
          when v_item->>'background_overlay' in ('none', 'soft', 'strong')
            then v_item->>'background_overlay'
          else 'soft'
        end
      );
    end if;

    if v_item ? 'animation' then
      v_normalized := v_normalized || jsonb_build_object(
        'animation', case
          when v_item->>'animation' in ('none', 'fade', 'rise', 'scale')
            then v_item->>'animation'
          else 'none'
        end
      );
    end if;

    if v_item ? 'animate_on_mobile' then
      v_normalized := v_normalized || jsonb_build_object(
        'animate_on_mobile', case
          when jsonb_typeof(v_item->'animate_on_mobile') = 'boolean'
            then (v_item->>'animate_on_mobile')::boolean
          else true
        end
      );
    end if;

    if v_item ? 'hide_on_desktop' then
      v_normalized := v_normalized || jsonb_build_object(
        'hide_on_desktop', case
          when jsonb_typeof(v_item->'hide_on_desktop') = 'boolean'
            then (v_item->>'hide_on_desktop')::boolean
          else false
        end
      );
    end if;

    if v_item ? 'hide_on_tablet' then
      v_normalized := v_normalized || jsonb_build_object(
        'hide_on_tablet', case
          when jsonb_typeof(v_item->'hide_on_tablet') = 'boolean'
            then (v_item->>'hide_on_tablet')::boolean
          else false
        end
      );
    end if;

    if v_item ? 'hide_on_mobile' then
      v_normalized := v_normalized || jsonb_build_object(
        'hide_on_mobile', case
          when jsonb_typeof(v_item->'hide_on_mobile') = 'boolean'
            then (v_item->>'hide_on_mobile')::boolean
          else false
        end
      );
    end if;

    if v_normalized <> '{}'::jsonb then
      v_result := v_result || jsonb_build_object(v_section, v_normalized);
    end if;
  end loop;

  return v_result;
end;
$$;

create or replace function public.save_public_site_draft(
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
  v_layout_source jsonb := '[]'::jsonb;
  v_layout jsonb := '[]'::jsonb;
  v_template_id text;
  v_brand_name text;
  v_accent text;
  v_dark text;
  v_surface text;
  v_mobile_title_size text;
  v_section_colors jsonb := '{}'::jsonb;
  v_system_section_settings jsonb := '{}'::jsonb;
  v_palette_index integer := 0;
begin
  select coalesce(locale_row.draft_content, locale_row.published_content, '{}'::jsonb)
    into v_previous
  from public.public_site_locales locale_row
  where locale_row.business_id = p_business_id
    and locale_row.locale = v_locale
  limit 1;

  v_previous := coalesce(v_previous, '{}'::jsonb);

  v_saved := public.save_public_site_draft_v22(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );

  v_template_id := lower(trim(coalesce(
    nullif(p_content->>'template_id', ''),
    nullif(v_previous->>'template_id', '')
  )));
  if v_template_id !~ '^[a-z0-9][a-z0-9-]{0,79}$' then
    v_template_id := null;
  end if;

  v_brand_name := left(trim(coalesce(
    nullif(p_content->>'brand_name', ''),
    nullif(v_previous->>'brand_name', '')
  )), 160);
  if v_brand_name = '' then
    v_brand_name := null;
  end if;

  v_accent := lower(trim(coalesce(
    nullif(p_content->>'theme_accent', ''),
    nullif(v_previous->>'theme_accent', ''),
    '#9d3151'
  )));
  if v_accent !~ '^#[0-9a-f]{6}$' then
    v_accent := '#9d3151';
  end if;

  v_dark := lower(trim(coalesce(
    nullif(p_content->>'theme_dark', ''),
    nullif(v_previous->>'theme_dark', ''),
    '#321722'
  )));
  if v_dark !~ '^#[0-9a-f]{6}$' then
    v_dark := '#321722';
  end if;

  v_surface := lower(trim(coalesce(
    nullif(p_content->>'theme_surface', ''),
    nullif(v_previous->>'theme_surface', ''),
    '#fff7f5'
  )));
  if v_surface !~ '^#[0-9a-f]{6}$' then
    v_surface := '#fff7f5';
  end if;

  v_mobile_title_size := lower(trim(coalesce(
    nullif(p_content->>'hero_title_mobile_size', ''),
    nullif(v_previous->>'hero_title_mobile_size', ''),
    'medium'
  )));
  if v_mobile_title_size not in ('small', 'medium', 'large') then
    v_mobile_title_size := 'medium';
  end if;

  v_section_colors := public.normalize_public_site_section_colors(
    case
      when jsonb_typeof(p_content->'section_colors') = 'object'
        then p_content->'section_colors'
      when jsonb_typeof(v_previous->'section_colors') = 'object'
        then v_previous->'section_colors'
      else '{}'::jsonb
    end
  );

  v_system_section_settings := public.normalize_public_site_system_section_settings(
    case
      when jsonb_typeof(p_content->'system_section_settings') = 'object'
        then p_content->'system_section_settings'
      when jsonb_typeof(v_previous->'system_section_settings') = 'object'
        then v_previous->'system_section_settings'
      else '{}'::jsonb
    end
  );

  if coalesce(p_content->>'palette_index', '') ~ '^[0-9]+$' then
    v_palette_index := least(3, greatest(0, (p_content->>'palette_index')::integer));
  elsif coalesce(v_previous->>'palette_index', '') ~ '^[0-9]+$' then
    v_palette_index := least(3, greatest(0, (v_previous->>'palette_index')::integer));
  end if;

  if jsonb_typeof(p_content->'layout_order') = 'array' then
    v_layout_source := p_content->'layout_order';
  elsif jsonb_typeof(v_previous->'layout_order') = 'array' then
    v_layout_source := v_previous->'layout_order';
  end if;

  select coalesce(jsonb_agg(item order by first_position), '[]'::jsonb)
    into v_layout
  from (
    select item, min(position) as first_position
    from jsonb_array_elements_text(v_layout_source)
      with ordinality as requested(item, position)
    where item ~ '^section:(services|portfolio|booking|team|reviews|membership|gift|faq|safety|about|contact)$'
       or item ~ '^custom:[A-Za-z0-9._:-]{1,160}$'
    group by item
    order by min(position)
    limit 64
  ) ordered_items;

  v_saved := coalesce(v_saved, '{}'::jsonb)
    || jsonb_strip_nulls(jsonb_build_object(
      'template_id', v_template_id,
      'brand_name', v_brand_name,
      'theme_accent', v_accent,
      'theme_dark', v_dark,
      'theme_surface', v_surface,
      'palette_index', v_palette_index,
      'hero_title_mobile_size', v_mobile_title_size,
      'section_colors', v_section_colors,
      'system_section_settings', v_system_section_settings,
      'layout_order', v_layout
    ));

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

revoke all on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) from public, anon, authenticated;

grant execute on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) to authenticated;

comment on function public.normalize_public_site_system_section_settings(jsonb) is
  'Validates sparse layout, background, animation and device visibility settings for built-in public-site sections.';

comment on function public.save_public_site_draft(uuid, text, jsonb, boolean) is
  'Delegates validated fields to save_public_site_draft_v22 and preserves template, palette, layout order, section colors and normalized built-in section settings.';
