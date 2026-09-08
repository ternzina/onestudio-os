-- Public-site rich-text persistence 2.0.1.
--
-- Serialized OneStudio rich text is a complete JSON document prefixed with
-- __osrt1__:. It must never be shortened in the middle of that document.

create or replace function public.is_valid_public_site_rich_text_node(
  p_node jsonb,
  p_depth integer default 0
)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  v_type text;
  v_child jsonb;
begin
  if jsonb_typeof(p_node) <> 'object' or p_depth > 32
    or exists (
      select 1 from jsonb_object_keys(p_node) as key
      where key not in ('type', 'text', 'align', 'color', 'fontFamily', 'fontSize', 'href', 'children')
    ) then
    return false;
  end if;

  v_type := p_node->>'type';
  if v_type is null
    or v_type not in ('root', 'p', 'ul', 'ol', 'li', 'br', 'strong', 'em', 'u', 'span', 'a', 'text')
    or (p_node ? 'text' and jsonb_typeof(p_node->'text') <> 'string')
    or (p_node ? 'align' and p_node->>'align' not in ('left', 'center', 'right', 'justify'))
    or (p_node ? 'color' and jsonb_typeof(p_node->'color') <> 'string')
    or (p_node ? 'fontFamily' and jsonb_typeof(p_node->'fontFamily') <> 'string')
    or (p_node ? 'fontSize' and jsonb_typeof(p_node->'fontSize') <> 'number')
    or (p_node ? 'href' and jsonb_typeof(p_node->'href') <> 'string') then
    return false;
  end if;

  if v_type = 'text' then
    return p_node ? 'text' and not p_node ? 'children';
  end if;
  if v_type = 'br' then
    return not p_node ? 'children';
  end if;
  if jsonb_typeof(p_node->'children') <> 'array'
    or jsonb_array_length(p_node->'children') > 10000 then
    return false;
  end if;
  for v_child in select value from jsonb_array_elements(p_node->'children') loop
    if not public.is_valid_public_site_rich_text_node(v_child, p_depth + 1) then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

create or replace function public.normalize_public_site_rich_text_value(
  p_value text,
  p_plain_limit integer,
  p_rich_text_limit integer
)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v_document jsonb;
begin
  if coalesce(p_value, '') not like '__osrt1__:%' then
    return left(trim(coalesce(p_value, '')), p_plain_limit);
  end if;

  if length(p_value) > p_rich_text_limit then
    raise exception 'public_site_rich_text_limit_exceeded' using errcode = '22023';
  end if;

  begin
    v_document := substring(p_value from length('__osrt1__:') + 1)::jsonb;
  exception when others then
    raise exception 'public_site_rich_text_invalid' using errcode = '22023';
  end;

  if jsonb_typeof(v_document) <> 'object'
    or exists (select 1 from jsonb_object_keys(v_document) as key where key not in ('version', 'root'))
    or jsonb_typeof(v_document->'version') <> 'number'
    or v_document->>'version' <> '1'
    or jsonb_typeof(v_document->'root') <> 'object'
    or v_document->'root'->>'type' <> 'root' then
    raise exception 'public_site_rich_text_invalid' using errcode = '22023';
  end if;
  if not public.is_valid_public_site_rich_text_node(v_document->'root') then
    raise exception 'public_site_rich_text_invalid' using errcode = '22023';
  end if;

  -- Return the original serialized value, byte-for-byte: JSONB is validation
  -- only and must not be used to reserialize the editor's document.
  return p_value;
end;
$$;

create or replace function public.normalize_public_site_rich_text_cards(
  p_source_cards jsonb,
  p_normalized_cards jsonb
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as card, ordinality
    from jsonb_array_elements(case when jsonb_typeof(p_normalized_cards) = 'array' then p_normalized_cards else '[]'::jsonb end)
      with ordinality
  ), source as (
    select value as card, ordinality
    from jsonb_array_elements(case when jsonb_typeof(p_source_cards) = 'array' then p_source_cards else '[]'::jsonb end)
      with ordinality
  )
  select coalesce(jsonb_agg(
    normalized.card || case when source.card is null then '{}'::jsonb else jsonb_build_object(
      'title', public.normalize_public_site_rich_text_value(source.card->>'title', 180, 20000),
      'text', public.normalize_public_site_rich_text_value(source.card->>'text', 1000, 40000)
    ) end
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized
  left join source using (ordinality);
$$;

create or replace function public.normalize_public_site_rich_text_block(
  p_source jsonb,
  p_normalized jsonb
)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select p_normalized || jsonb_build_object(
    'title', public.normalize_public_site_rich_text_value(p_source->>'title', 180, 20000),
    'text', public.normalize_public_site_rich_text_value(p_source->>'text', 4000, 40000),
    'items', public.normalize_public_site_rich_text_value(p_source->>'items', 5000, 40000),
    'cards', public.normalize_public_site_rich_text_cards(p_source->'cards', p_normalized->'cards')
  );
$$;

do $$
begin
  if to_regprocedure(
    'public.normalize_public_site_custom_blocks_v_richtext_201(jsonb)'
  ) is null then
    alter function public.normalize_public_site_custom_blocks(jsonb)
      rename to normalize_public_site_custom_blocks_v_richtext_201;
  end if;
end;
$$;

create or replace function public.normalize_public_site_custom_blocks(p_blocks jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with normalized as (
    select value as block, ordinality
    from jsonb_array_elements(
      public.normalize_public_site_custom_blocks_v_richtext_201(p_blocks)
    ) with ordinality
  ), source as (
    select value as block, ordinality
    from jsonb_array_elements(case when jsonb_typeof(p_blocks) = 'array' then p_blocks else '[]'::jsonb end)
      with ordinality
    where jsonb_typeof(value) = 'object'
  )
  select coalesce(jsonb_agg(
    public.normalize_public_site_rich_text_block(source.block, normalized.block)
    order by normalized.ordinality
  ), '[]'::jsonb)
  from normalized
  join source using (ordinality);
$$;

create or replace function public.normalize_public_site_pages(p_pages jsonb)
returns jsonb language plpgsql immutable set search_path = public as $$
declare item jsonb; result jsonb := '[]'::jsonb; page_type text; page_slug text; page_id text; seen text[] := '{}'::text[]; custom_count integer := 0; portfolio_added boolean := false;
begin
  if jsonb_typeof(p_pages) <> 'array' then return result; end if;
  if (select count(*) from jsonb_array_elements(p_pages) as pages(value) where value->>'type' = 'custom') > 200 then
    raise exception 'public_site_page_limit_exceeded' using errcode = '22023';
  end if;
  for item in select value from jsonb_array_elements(p_pages) loop
    if jsonb_typeof(item) <> 'object' then continue; end if;
    page_type := item->>'type';
    if page_type = 'portfolio' and not portfolio_added then
      page_slug := case when coalesce(item->>'slug','') ~ '^[a-z0-9]+(-[a-z0-9]+)*$' then left(item->>'slug',60) else 'portfolio' end;
      if page_slug = any(seen) then continue; end if;
      result := result || jsonb_build_array(jsonb_build_object('id','portfolio','type','portfolio','slug',page_slug,'nav_label',left(trim(coalesce(nullif(item->>'nav_label',''),'Portfolio')),60),'eyebrow',left(trim(coalesce(item->>'eyebrow','Selected works')),100),'title',public.normalize_public_site_rich_text_value(coalesce(nullif(item->>'title',''),'Portfolio'),160,20000),'intro',public.normalize_public_site_rich_text_value(item->>'intro',1000,20000),'is_visible',case when jsonb_typeof(item->'is_visible')='boolean' then (item->>'is_visible')::boolean else true end,'show_in_navigation',case when jsonb_typeof(item->'show_in_navigation')='boolean' then (item->>'show_in_navigation')::boolean else true end,'show_booking_cta',case when jsonb_typeof(item->'show_booking_cta')='boolean' then (item->>'show_booking_cta')::boolean else true end,'seo_title',left(trim(coalesce(item->>'seo_title','')),70),'seo_description',left(trim(coalesce(item->>'seo_description','')),170),'seo_image_url',public.normalize_public_site_media_url(item->>'seo_image_url'),'seo_no_index',case when jsonb_typeof(item->'seo_no_index')='boolean' then (item->>'seo_no_index')::boolean else false end)); portfolio_added := true; seen := array_append(seen,page_slug); continue;
    end if;
    if page_type <> 'custom' then continue; end if;
    page_slug := left(lower(trim(coalesce(item->>'slug',''))),60); if page_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or page_slug in ('portfolio','p') then page_slug := 'page-' || (custom_count + 1)::text; end if; if page_slug = any(seen) then continue; end if;
    page_id := lower(trim(coalesce(item->>'id',''))); if page_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then page_id := 'custom-' || page_slug; end if;
    result := result || jsonb_build_array(jsonb_build_object('id',left(page_id,72),'type','custom','slug',page_slug,'nav_label',left(trim(coalesce(nullif(item->>'nav_label',''),'Page')),60),'eyebrow',left(trim(coalesce(item->>'eyebrow','')),100),'title',public.normalize_public_site_rich_text_value(coalesce(nullif(item->>'title',''),'Page'),160,20000),'intro',public.normalize_public_site_rich_text_value(item->>'intro',1000,20000),'is_visible',case when jsonb_typeof(item->'is_visible')='boolean' then (item->>'is_visible')::boolean else true end,'show_in_navigation',case when jsonb_typeof(item->'show_in_navigation')='boolean' then (item->>'show_in_navigation')::boolean else true end,'show_booking_cta',case when jsonb_typeof(item->'show_booking_cta')='boolean' then (item->>'show_booking_cta')::boolean else true end,'seo_title',left(trim(coalesce(item->>'seo_title','')),70),'seo_description',left(trim(coalesce(item->>'seo_description','')),170),'seo_image_url',public.normalize_public_site_media_url(item->>'seo_image_url'),'seo_no_index',case when jsonb_typeof(item->'seo_no_index')='boolean' then (item->>'seo_no_index')::boolean else false end,'blocks',public.normalize_public_site_custom_blocks(item->'blocks')));
    seen := array_append(seen,page_slug); custom_count := custom_count + 1;
  end loop; return result;
end; $$;

revoke all on function public.is_valid_public_site_rich_text_node(jsonb, integer) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_rich_text_value(text, integer, integer) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_rich_text_cards(jsonb, jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_rich_text_block(jsonb, jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks_v_richtext_201(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_pages(jsonb) from public, anon, authenticated, service_role;

comment on function public.normalize_public_site_rich_text_value(text, integer, integer) is
  'Preserves complete valid __osrt1__: rich-text documents atomically; oversized or malformed documents are rejected rather than truncated.';
