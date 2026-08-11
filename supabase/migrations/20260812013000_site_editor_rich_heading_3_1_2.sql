-- OneStudio OS
-- Rich Heading Formatting 3.1.2.
-- Preserve bounded Rich Text 2.6 documents in heading fields while keeping the
-- existing short plain-text limits and the established draft/publish lifecycle.

create or replace function public.normalize_public_site_rich_heading(p_value text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v_document jsonb;
begin
  if p_value is null
    or left(p_value, 10) <> '__osrt1__:'
    or octet_length(p_value) > 16384 then
    return null;
  end if;
  begin
    v_document := substr(p_value, 11)::jsonb;
  exception when others then
    return null;
  end;
  if v_document->>'version' <> '1'
    or v_document->'root'->>'type' <> 'root'
    or jsonb_typeof(v_document->'root'->'children') <> 'array' then
    return null;
  end if;
  return p_value;
end;
$$;

create or replace function public.merge_public_site_rich_block_titles(
  p_normalized jsonb,
  p_source jsonb
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as block, ordinality
    from jsonb_array_elements(
      case when jsonb_typeof(p_normalized) = 'array' then p_normalized else '[]'::jsonb end
    ) with ordinality
  ), source as (
    select value as block, ordinality
    from jsonb_array_elements(
      case when jsonb_typeof(p_source) = 'array' then p_source else '[]'::jsonb end
    ) with ordinality
    where jsonb_typeof(value) = 'object'
  )
  select coalesce(jsonb_agg(
    normalized.block || case
      when public.normalize_public_site_rich_heading(matched.block->>'title') is not null
        then jsonb_build_object('title', public.normalize_public_site_rich_heading(matched.block->>'title'))
      else '{}'::jsonb
    end
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized
  left join lateral (
    select source.block
    from source
    where source.block->>'id' = normalized.block->>'id'
    order by source.ordinality
    limit 1
  ) matched on true;
$$;

create or replace function public.merge_public_site_rich_page_titles(
  p_normalized jsonb,
  p_source jsonb
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as page, ordinality
    from jsonb_array_elements(
      case when jsonb_typeof(p_normalized) = 'array' then p_normalized else '[]'::jsonb end
    ) with ordinality
  ), source as (
    select value as page, ordinality
    from jsonb_array_elements(
      case when jsonb_typeof(p_source) = 'array' then p_source else '[]'::jsonb end
    ) with ordinality
    where jsonb_typeof(value) = 'object'
  )
  select coalesce(jsonb_agg(
    normalized.page
      || case
        when public.normalize_public_site_rich_heading(matched.page->>'title') is not null
          then jsonb_build_object('title', public.normalize_public_site_rich_heading(matched.page->>'title'))
        else '{}'::jsonb
      end
      || case
        when jsonb_typeof(normalized.page->'blocks') = 'array' then jsonb_build_object(
          'blocks',
          public.merge_public_site_rich_block_titles(
            normalized.page->'blocks',
            matched.page->'blocks'
          )
        )
        else '{}'::jsonb
      end
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized
  left join lateral (
    select source.page
    from source
    where source.page->>'id' = normalized.page->>'id'
    order by source.ordinality
    limit 1
  ) matched on true;
$$;

do $$
begin
  if to_regprocedure(
    'public.save_public_site_draft_v_rich_heading_3_1_2(uuid,text,jsonb,boolean)'
  ) is null then
    alter function public.save_public_site_draft(uuid, text, jsonb, boolean)
      rename to save_public_site_draft_v_rich_heading_3_1_2;
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
  v_previous jsonb := '{}'::jsonb;
  v_source jsonb := coalesce(p_content, '{}'::jsonb);
  v_saved jsonb;
  v_key text;
  v_heading text;
begin
  select coalesce(locale_row.draft_content, locale_row.published_content, '{}'::jsonb)
    into v_previous
  from public.public_site_locales as locale_row
  where locale_row.business_id = p_business_id
    and locale_row.locale = v_locale
  limit 1;

  v_previous := coalesce(v_previous, '{}'::jsonb);
  v_saved := public.save_public_site_draft_v_rich_heading_3_1_2(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );

  foreach v_key in array array[
    'hero_title','services_title','portfolio_title','booking_title','about_title',
    'team_title','reviews_title','membership_title','gift_title','faq_title',
    'safety_title','contact_title'
  ] loop
    v_heading := public.normalize_public_site_rich_heading(v_source->>v_key);
    if v_heading is null and not (v_source ? v_key) then
      v_heading := public.normalize_public_site_rich_heading(v_previous->>v_key);
    end if;
    if v_heading is not null then
      v_saved := jsonb_set(coalesce(v_saved, '{}'::jsonb), array[v_key], to_jsonb(v_heading), true);
    end if;
  end loop;

  v_saved := jsonb_set(
    coalesce(v_saved, '{}'::jsonb),
    '{custom_blocks}',
    public.merge_public_site_rich_block_titles(
      v_saved->'custom_blocks',
      case when jsonb_typeof(v_source->'custom_blocks') = 'array'
        then v_source->'custom_blocks' else v_previous->'custom_blocks' end
    ),
    true
  );
  v_saved := jsonb_set(
    v_saved,
    '{pages}',
    public.merge_public_site_rich_page_titles(
      v_saved->'pages',
      case when jsonb_typeof(v_source->'pages') = 'array'
        then v_source->'pages' else v_previous->'pages' end
    ),
    true
  );

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

revoke all on function public.normalize_public_site_rich_heading(text)
  from public, anon, authenticated, service_role;
revoke all on function public.merge_public_site_rich_block_titles(jsonb, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.merge_public_site_rich_page_titles(jsonb, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.save_public_site_draft_v_rich_heading_3_1_2(uuid, text, jsonb, boolean)
  from public, anon, authenticated, service_role;
revoke execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
  to authenticated, service_role;

comment on function public.normalize_public_site_rich_heading(text) is
  'Accepts only bounded Rich Text 2.6 documents for inline heading formatting.';
comment on function public.save_public_site_draft(uuid, text, jsonb, boolean) is
  'Site Editor save pipeline with bounded rich-heading round-trip preservation for system sections, pages and manual blocks.';
