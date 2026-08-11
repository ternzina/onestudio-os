-- OneStudio OS
-- Unified Text Editor 3.1.
-- The local heading typography contract now accepts the same twenty safe font
-- families as Rich Text 2.6 while preserving the four legacy design tokens.

create or replace function public.normalize_public_site_typography(p_value jsonb)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'font_family', case when p_value->>'font_family' in (
      'template','system','humanist','editorial',
      'Arial','Helvetica','Verdana','Tahoma','Trebuchet MS','Gill Sans','Century Gothic',
      'Georgia','Times New Roman','Palatino Linotype','Garamond','Baskerville','Book Antiqua',
      'Courier New','Lucida Console','Monaco','Impact','Arial Black','Comic Sans MS','Brush Script MT'
    ) then p_value->>'font_family' end,
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

revoke all on function public.normalize_public_site_typography(jsonb) from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_typography(jsonb) is
  'Validates sparse local typography with the shared twenty-font Site Editor 3.1 allow-list.';
