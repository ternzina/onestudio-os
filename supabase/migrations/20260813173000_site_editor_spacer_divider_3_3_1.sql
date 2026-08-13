-- OneStudio OS Site Editor 3.3.1: persisted Spacer / Divider appearance.
-- Additive wrapper: retain the complete 3.3 normalized block, then append only
-- bounded Divider fields for Spacer blocks from the corresponding source item.

create function public.sanitize_public_site_inline_style_3_3_1(p_value text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  declaration text;
  property_name text;
  property_value text;
  value_part text;
  value_parts text[];
  numeric_match text[];
  amount numeric;
  unit_name text;
  safe_declarations text[] := array[]::text[];
begin
  <<declarations>>
  foreach declaration in array string_to_array(left(coalesce(p_value, ''), 2000), ';') loop
    property_name := lower(trim(split_part(declaration, ':', 1)));
    property_value := trim(substr(declaration, strpos(declaration, ':') + 1));
    if property_name not in (
      'color','background-color','font-size','font-weight','font-style','text-align','line-height','letter-spacing','text-decoration',
      'margin','margin-top','margin-right','margin-bottom','margin-left','padding','padding-top','padding-right','padding-bottom','padding-left',
      'border','border-width','border-style','border-color','border-radius','width','max-width','min-width','height','max-height','min-height',
      'display','gap','justify-content','align-items'
    ) then continue; end if;
    if strpos(declaration, ':') < 2 or property_value = '' or length(property_value) > 160
      or property_value ~* '(url\s*\(|expression\s*\(|javascript\s*:|data\s*:|!important|@import|-moz-binding|behavior\s*:|position\s*:|/\*|[{}\\])'
      or property_value !~ '^[#a-zA-Z0-9(),.%[:space:]-]+$'
    then continue; end if;
    if property_name in ('color','background-color','border-color') then
      if property_value !~* '^(#[0-9a-f]{3,8}|rgba?\([[:space:]]*[0-9]{1,3}[[:space:]]*,[[:space:]]*[0-9]{1,3}[[:space:]]*,[[:space:]]*[0-9]{1,3}([[:space:]]*,[[:space:]]*(0|1|0?\.[0-9]+))?[[:space:]]*\)|hsla?\([[:space:]]*[0-9]{1,3}(deg)?[[:space:]]*,[[:space:]]*[0-9]{1,3}%[[:space:]]*,[[:space:]]*[0-9]{1,3}%([[:space:]]*,[[:space:]]*(0|1|0?\.[0-9]+))?[[:space:]]*\)|[a-z]{3,20})$' then continue; end if;
    elsif property_name = 'display' then if property_value !~* '^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|none)$' then continue; end if;
    elsif property_name = 'font-style' then if property_value !~* '^(normal|italic|oblique)$' then continue; end if;
    elsif property_name = 'font-weight' then if property_value !~* '^(normal|bold|bolder|lighter|[1-9]00)$' then continue; end if;
    elsif property_name = 'text-align' then if property_value !~* '^(left|right|center|justify|start|end)$' then continue; end if;
    elsif property_name = 'text-decoration' then if property_value !~* '^(none|underline|line-through)$' then continue; end if;
    elsif property_name = 'justify-content' then if property_value !~* '^(start|end|center|stretch|space-between|space-around|space-evenly)$' then continue; end if;
    elsif property_name = 'align-items' then if property_value !~* '^(start|end|center|stretch|baseline)$' then continue; end if;
    elsif property_name = 'border-style' then if property_value !~* '^(none|solid|dashed|dotted|double)$' then continue; end if;
    elsif property_name = 'border' then
      if property_value !~* '^(0|([0-9]+(\.[0-9]+)?(px|rem|em)[[:space:]]+)?(none|solid|dashed|dotted|double)([[:space:]]+(#[0-9a-f]{3,8}|[a-z]{3,20}))?)$' then continue; end if;
      numeric_match := regexp_match(property_value, '^([0-9]+(\.[0-9]+)?)(px|rem|em)[[:space:]]+', 'i');
      if numeric_match is not null then
        amount := numeric_match[1]::numeric;
        unit_name := lower(numeric_match[3]);
        if unit_name = 'px' then
          if amount > 2000 then continue; end if;
        elsif amount > 100 then
          continue;
        end if;
      end if;
    else
      value_parts := regexp_split_to_array(property_value, '[[:space:]]+');
      if cardinality(value_parts) > 4 then continue; end if;
      foreach value_part in array value_parts loop
        if value_part ~* '^[0-9]+(\.[0-9]+)?(px|rem|em|%|vh|vw)$' then
          numeric_match := regexp_match(value_part, '^([0-9]+(\.[0-9]+)?)(px|rem|em|%|vh|vw)$', 'i');
          amount := numeric_match[1]::numeric;
          unit_name := lower(numeric_match[3]);
          if property_name = 'font-size' then
            if unit_name = 'px' then
              if amount > 120 then continue declarations; end if;
            elsif amount > 10 then
              continue declarations;
            end if;
          elsif unit_name = 'px' then
            if amount > 2000 then continue declarations; end if;
          elsif amount > 100 then
            continue declarations;
          end if;
        elsif value_part !~* '^(0|auto|none|normal|inherit|initial|transparent|currentcolor|block|inline|inline-block|flex|inline-flex|grid|inline-grid|start|end|center|left|right|justify|stretch|space-between|space-around|space-evenly|baseline|bold|bolder|lighter|italic|oblique|underline|line-through|solid|dashed|dotted|double)$' then
          continue declarations;
        end if;
      end loop;
    end if;
    safe_declarations := array_append(safe_declarations, property_name || ': ' || regexp_replace(property_value, '\s+', ' ', 'g'));
  end loop;
  return array_to_string(safe_declarations, '; ');
end;
$$;

create or replace function public.sanitize_public_site_html_3_3(p_value text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  source text := left(coalesce(p_value, ''), 20000);
  style_match text[];
  safe_style text;
  attribute_name text;
  attribute_match text[];
  attribute_value text;
begin
  source := regexp_replace(source, '<!--[\s\S]*?-->', '', 'gi');
  source := regexp_replace(source, '<(script|style|iframe|object|embed|form|svg|math|template|link|meta|base)\b[^>]*>[\s\S]*?</\1\s*>', '', 'gi');
  source := regexp_replace(source, '</?(script|style|iframe|object|embed|form|svg|math|template|link|meta|base)\b[^>]*>', '', 'gi');
  source := regexp_replace(source, '\s(on[a-z]+|srcdoc|formaction|xmlns)\s*=\s*("[^"]*"|''[^'']*''|[^\s>]+)', '', 'gi');
  loop
    style_match := regexp_match(source, '\sstyle\s*=\s*"([^"]*)"', 'i');
    exit when style_match is null;
    safe_style := public.sanitize_public_site_inline_style_3_3_1(style_match[1]);
    source := regexp_replace(source, '\sstyle\s*=\s*"[^"]*"', case when safe_style = '' then '' else ' data-os-sanitized-style="' || safe_style || '"' end, 'i');
  end loop;
  loop
    style_match := regexp_match(source, '\sstyle\s*=\s*''([^'']*)''', 'i');
    exit when style_match is null;
    safe_style := public.sanitize_public_site_inline_style_3_3_1(style_match[1]);
    source := regexp_replace(source, '\sstyle\s*=\s*''[^'']*''', case when safe_style = '' then '' else ' data-os-sanitized-style="' || safe_style || '"' end, 'i');
  end loop;
  loop
    style_match := regexp_match(source, '\sstyle\s*=\s*([^\s"''=<>`]+)', 'i');
    exit when style_match is null;
    safe_style := public.sanitize_public_site_inline_style_3_3_1(style_match[1]);
    source := regexp_replace(source, '\sstyle\s*=\s*[^\s"''=<>`]+', case when safe_style = '' then '' else ' data-os-sanitized-style="' || safe_style || '"' end, 'i');
  end loop;
  source := replace(source, ' data-os-sanitized-style="', ' style="');
  foreach attribute_name in array array['href','src'] loop
    loop
      attribute_match := regexp_match(source, '\s' || attribute_name || '\s*=\s*"([^"]*)"', 'i');
      exit when attribute_match is null;
      attribute_value := trim(attribute_match[1]);
      source := regexp_replace(source, '\s' || attribute_name || '\s*=\s*"[^"]*"', case when attribute_value ~* '^(https?:|mailto:|tel:|/|#)' then ' data-os-safe-' || attribute_name || '="' || replace(replace(attribute_value, '&', '&amp;'), '"', '&quot;') || '"' else '' end, 'i');
    end loop;
    loop
      attribute_match := regexp_match(source, '\s' || attribute_name || '\s*=\s*''([^'']*)''', 'i');
      exit when attribute_match is null;
      attribute_value := trim(attribute_match[1]);
      source := regexp_replace(source, '\s' || attribute_name || '\s*=\s*''[^'']*''', case when attribute_value ~* '^(https?:|mailto:|tel:|/|#)' then ' data-os-safe-' || attribute_name || '="' || replace(replace(attribute_value, '&', '&amp;'), '"', '&quot;') || '"' else '' end, 'i');
    end loop;
    loop
      attribute_match := regexp_match(source, '\s' || attribute_name || '\s*=\s*([^\s"''=<>`]+)', 'i');
      exit when attribute_match is null;
      attribute_value := trim(attribute_match[1]);
      source := regexp_replace(source, '\s' || attribute_name || '\s*=\s*[^\s"''=<>`]+', case when attribute_value ~* '^(https?:|mailto:|tel:|/|#)' then ' data-os-safe-' || attribute_name || '="' || replace(replace(attribute_value, '&', '&amp;'), '"', '&quot;') || '"' else '' end, 'i');
    end loop;
    source := replace(source, ' data-os-safe-' || attribute_name || '="', ' ' || attribute_name || '="');
  end loop;
  return left(source, 20000);
end;
$$;

alter function public.normalize_public_site_custom_blocks(jsonb)
  rename to normalize_public_site_custom_blocks_v331_base;

create function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as block, ordinality
    from jsonb_array_elements(public.normalize_public_site_custom_blocks_v331_base(p_blocks)) with ordinality
  ), source as (
    select value as block, ordinality
    from jsonb_array_elements(case when jsonb_typeof(p_blocks) = 'array' then p_blocks else '[]'::jsonb end) with ordinality
    where jsonb_typeof(value) = 'object'
  )
  select coalesce(jsonb_agg(
    normalized.block
    || case when source.block->>'kind' = 'spacer' then
      jsonb_build_object(
        'divider_thickness', case when source.block->>'divider_thickness' in ('1','2','3') then (source.block->>'divider_thickness')::integer else 1 end,
        'divider_color_mode', case when source.block->>'divider_color_mode' in ('template','accent','custom') then source.block->>'divider_color_mode' else 'template' end
      )
      || case
        when source.block->>'divider_color_mode' = 'custom'
          and coalesce(source.block->>'divider_custom_color', '') ~ '^#[0-9a-fA-F]{6}$'
        then jsonb_build_object('divider_custom_color', lower(source.block->>'divider_custom_color'))
        else '{}'::jsonb
      end
    else '{}'::jsonb end
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized join source using (ordinality);
$$;

revoke all on function public.normalize_public_site_custom_blocks_v331_base(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.sanitize_public_site_inline_style_3_3_1(text) from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_custom_blocks(jsonb) is
  'Preserves the complete Site Editor 3.3 custom-block normalizer and adds bounded Spacer / Divider appearance fields for Site Editor 3.3.1.';
