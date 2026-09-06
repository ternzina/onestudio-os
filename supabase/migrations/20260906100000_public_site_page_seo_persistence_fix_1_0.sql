-- Generic public-site persistence: permit up to 32 custom pages while retaining
-- the existing slug, portfolio, block and page-SEO validation contract.
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
      result := result || jsonb_build_array(jsonb_build_object('id','portfolio','type','portfolio','slug',page_slug,'nav_label',left(trim(coalesce(nullif(item->>'nav_label',''),'Portfolio')),60),'eyebrow',left(trim(coalesce(item->>'eyebrow','Selected works')),100),'title',left(trim(coalesce(nullif(item->>'title',''),'Portfolio')),160),'intro',left(trim(coalesce(item->>'intro','')),1000),'is_visible',case when jsonb_typeof(item->'is_visible')='boolean' then (item->>'is_visible')::boolean else true end,'show_in_navigation',case when jsonb_typeof(item->'show_in_navigation')='boolean' then (item->>'show_in_navigation')::boolean else true end,'show_booking_cta',case when jsonb_typeof(item->'show_booking_cta')='boolean' then (item->>'show_booking_cta')::boolean else true end,'seo_title',left(trim(coalesce(item->>'seo_title','')),70),'seo_description',left(trim(coalesce(item->>'seo_description','')),170),'seo_image_url',public.normalize_public_site_media_url(item->>'seo_image_url'),'seo_no_index',case when jsonb_typeof(item->'seo_no_index')='boolean' then (item->>'seo_no_index')::boolean else false end)); portfolio_added := true; seen := array_append(seen,page_slug); continue;
    end if;
    if page_type <> 'custom' then continue; end if;
    page_slug := left(lower(trim(coalesce(item->>'slug',''))),60); if page_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or page_slug in ('portfolio','p') then page_slug := 'page-' || (custom_count + 1)::text; end if; if page_slug = any(seen) then continue; end if;
    page_id := lower(trim(coalesce(item->>'id',''))); if page_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then page_id := 'custom-' || page_slug; end if;
    result := result || jsonb_build_array(jsonb_build_object('id',left(page_id,72),'type','custom','slug',page_slug,'nav_label',left(trim(coalesce(nullif(item->>'nav_label',''),'Page')),60),'eyebrow',left(trim(coalesce(item->>'eyebrow','')),100),'title',left(trim(coalesce(nullif(item->>'title',''),'Page')),160),'intro',left(trim(coalesce(item->>'intro','')),1000),'is_visible',case when jsonb_typeof(item->'is_visible')='boolean' then (item->>'is_visible')::boolean else true end,'show_in_navigation',case when jsonb_typeof(item->'show_in_navigation')='boolean' then (item->>'show_in_navigation')::boolean else true end,'show_booking_cta',case when jsonb_typeof(item->'show_booking_cta')='boolean' then (item->>'show_booking_cta')::boolean else true end,'seo_title',left(trim(coalesce(item->>'seo_title','')),70),'seo_description',left(trim(coalesce(item->>'seo_description','')),170),'seo_image_url',public.normalize_public_site_media_url(item->>'seo_image_url'),'seo_no_index',case when jsonb_typeof(item->'seo_no_index')='boolean' then (item->>'seo_no_index')::boolean else false end,'blocks',public.normalize_public_site_custom_blocks(item->'blocks')));
    seen := array_append(seen,page_slug); custom_count := custom_count + 1;
  end loop; return result;
end; $$;

revoke all on function public.normalize_public_site_pages(jsonb) from public, anon, authenticated;
