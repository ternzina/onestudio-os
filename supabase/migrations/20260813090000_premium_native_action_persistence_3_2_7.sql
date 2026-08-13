-- OneStudio OS
-- Premium native action persistence 3.2.7.
-- Preserve one shared, bounded native-action appearance map around the complete
-- Rich Heading 3.1.2 save pipeline. The submitted full document is authoritative:
-- an absent or empty map clears previously saved overrides.

create or replace function public.normalize_public_site_native_action_styles(p_value jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with candidates as (
    select
      source.key as action_key,
      jsonb_strip_nulls(jsonb_build_object(
        'size', case
          when source.value->>'size' in ('small', 'medium', 'large')
            then source.value->>'size'
        end,
        'background_color', case
          when source.value->>'background_color' ~* '^#[0-9a-f]{6}$'
            then lower(source.value->>'background_color')
        end,
        'text_color', case
          when source.value->>'text_color' ~* '^#[0-9a-f]{6}$'
            then lower(source.value->>'text_color')
        end
      )) as normalized_style
    from jsonb_each(
      case
        when jsonb_typeof(p_value) = 'object'
          and octet_length(p_value::text) <= 262144 then p_value
        else '{}'::jsonb
      end
    ) as source(key, value)
    where source.key ~ '^[a-z0-9][a-z0-9-]{0,79}:[a-z0-9][a-z0-9-]{0,79}:[a-z0-9][a-z0-9-]{0,77}$'
      and jsonb_typeof(source.value) = 'object'
  ), bounded as (
    select action_key, normalized_style
    from candidates
    where normalized_style <> '{}'::jsonb
    order by action_key
    limit 128
  )
  select coalesce(jsonb_object_agg(action_key, normalized_style order by action_key), '{}'::jsonb)
  from bounded;
$$;

do $$
begin
  if to_regprocedure(
    'public.save_public_site_draft_v_native_action_styles_3_2_7(uuid,text,jsonb,boolean)'
  ) is null then
    alter function public.save_public_site_draft(uuid, text, jsonb, boolean)
      rename to save_public_site_draft_v_native_action_styles_3_2_7;
  end if;
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
  v_saved jsonb;
  v_native_action_styles jsonb;
begin
  v_saved := public.save_public_site_draft_v_native_action_styles_3_2_7(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );

  -- Never consult the previous draft here. Reset/restore removes this field,
  -- and that absence must clear stored overrides instead of resurrecting them.
  v_native_action_styles := public.normalize_public_site_native_action_styles(
    coalesce(p_content->'native_action_styles', '{}'::jsonb)
  );

  v_saved := coalesce(v_saved, '{}'::jsonb) - 'native_action_styles';
  if v_native_action_styles <> '{}'::jsonb then
    v_saved := v_saved || jsonb_build_object(
      'native_action_styles',
      v_native_action_styles
    );
  end if;

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

revoke all on function public.normalize_public_site_native_action_styles(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.save_public_site_draft_v_native_action_styles_3_2_7(uuid, text, jsonb, boolean)
  from public, anon, authenticated, service_role;
revoke execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
  to authenticated, service_role;

comment on function public.normalize_public_site_native_action_styles(jsonb) is
  'Validates up to 128 stable template:section:action appearance overrides; invalid entries or properties are ignored.';
comment on function public.save_public_site_draft(uuid, text, jsonb, boolean) is
  'Complete Rich Heading 3.1.2 save pipeline with authoritative Premium native-action appearance persistence 3.2.7.';
