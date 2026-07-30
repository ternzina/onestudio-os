-- OneStudio OS Site Builder Polish 2.3
-- Adds a unified home layout order, media presentation controls and
-- Bookero-class site basics without weakening existing tenant permissions.

create or replace function public.normalize_public_site_custom_blocks(
  p_blocks jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_item jsonb;
  v_result jsonb := '[]'::jsonb;
  v_block_id text;
  v_block_kind text;
  v_block_tone text;
  v_block_url text;
  v_video_url text;
  v_video_poster_url text;
  v_slide_interval integer;
  v_media_size text;
  v_media_aspect text;
  v_media_fit text;
  v_media_frame text;
  v_seen_ids text[] := '{}'::text[];
  v_item_count integer := 0;
begin
  if jsonb_typeof(p_blocks) <> 'array' then
    return v_result;
  end if;

  for v_item in
    select block_element
    from jsonb_array_elements(p_blocks) as block_items(block_element)
  loop
    exit when v_item_count >= 12;
    if jsonb_typeof(v_item) <> 'object' then
      continue;
    end if;

    v_block_id := lower(trim(coalesce(v_item->>'id', '')));
    if v_block_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      v_block_id := 'block-' || (v_item_count + 1)::text;
    end if;
    v_block_id := left(v_block_id, 72);
    if v_block_id = any(v_seen_ids) then
      continue;
    end if;

    v_block_kind := case
      when v_item->>'kind' in ('text', 'features', 'cta', 'slider', 'video')
        then v_item->>'kind'
      else 'text'
    end;
    v_block_tone := case
      when v_item->>'tone' in ('light', 'accent', 'dark')
        then v_item->>'tone'
      else 'light'
    end;
    v_media_size := case
      when v_item->>'media_size' in ('full', 'wide', 'medium', 'compact')
        then v_item->>'media_size'
      else 'wide'
    end;
    v_media_aspect := case
      when v_item->>'media_aspect' in ('landscape', 'classic', 'square', 'portrait')
        then v_item->>'media_aspect'
      else 'landscape'
    end;
    v_media_fit := case
      when v_item->>'media_fit' in ('cover', 'contain')
        then v_item->>'media_fit'
      else 'cover'
    end;
    v_media_frame := case
      when v_item->>'media_frame' in ('none', 'line', 'card')
        then v_item->>'media_frame'
      else 'line'
    end;

    v_block_url := trim(coalesce(v_item->>'button_url', ''));
    if v_block_url !~ '^(#[A-Za-z0-9_-]+|/[A-Za-z0-9_/?&=.#%:-]*|https://[^[:space:]]+)$' then
      v_block_url := '';
    end if;

    begin
      v_slide_interval := greatest(
        2,
        least(30, coalesce((v_item->>'slide_interval_seconds')::integer, 4))
      );
    exception when others then
      v_slide_interval := 4;
    end;

    v_video_url := public.normalize_public_site_media_url(
      v_item->>'video_url'
    );
    v_video_poster_url := public.normalize_public_site_media_url(
      v_item->>'video_poster_url'
    );

    v_result := v_result || jsonb_build_array(
      jsonb_build_object(
        'id', v_block_id,
        'kind', v_block_kind,
        'eyebrow', left(trim(coalesce(v_item->>'eyebrow', '')), 100),
        'title', left(trim(coalesce(v_item->>'title', '')), 180),
        'text', left(trim(coalesce(v_item->>'text', '')), 4000),
        'items', left(trim(coalesce(v_item->>'items', '')), 5000),
        'button_label', left(trim(coalesce(v_item->>'button_label', '')), 80),
        'button_url', left(v_block_url, 500),
        'tone', v_block_tone,
        'is_visible', case
          when jsonb_typeof(v_item->'is_visible') = 'boolean'
            then (v_item->>'is_visible')::boolean
          else true
        end,
        'media_urls', public.normalize_public_site_media_urls(
          v_item->'media_urls'
        ),
        'slide_interval_seconds', v_slide_interval,
        'video_url', v_video_url,
        'video_poster_url', v_video_poster_url,
        'media_size', v_media_size,
        'media_aspect', v_media_aspect,
        'media_fit', v_media_fit,
        'media_frame', v_media_frame
      )
    );
    v_seen_ids := array_append(v_seen_ids, v_block_id);
    v_item_count := v_item_count + 1;
  end loop;

  return v_result;
end;
$$;

create or replace function public.normalize_public_site_social_links(
  p_links jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_item jsonb;
  v_result jsonb := '[]'::jsonb;
  v_id text;
  v_platform text;
  v_url text;
  v_seen_ids text[] := '{}'::text[];
  v_item_count integer := 0;
begin
  if jsonb_typeof(p_links) <> 'array' then
    return v_result;
  end if;

  for v_item in
    select social_element
    from jsonb_array_elements(p_links) as social_items(social_element)
  loop
    exit when v_item_count >= 12;
    if jsonb_typeof(v_item) <> 'object' then
      continue;
    end if;

    v_id := lower(trim(coalesce(v_item->>'id', '')));
    if v_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      v_id := 'social-' || (v_item_count + 1)::text;
    end if;
    v_id := left(v_id, 72);
    if v_id = any(v_seen_ids) then
      continue;
    end if;

    v_platform := left(
      regexp_replace(
        trim(coalesce(v_item->>'platform', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      40
    );
    v_url := left(trim(coalesce(v_item->>'url', '')), 500);
    if v_platform = '' or v_url !~ '^https://[^[:space:]]+$' then
      continue;
    end if;

    v_result := v_result || jsonb_build_array(
      jsonb_build_object(
        'id', v_id,
        'platform', v_platform,
        'url', v_url
      )
    );
    v_seen_ids := array_append(v_seen_ids, v_id);
    v_item_count := v_item_count + 1;
  end loop;

  return v_result;
end;
$$;

create or replace function public.normalize_public_site_layout_order(
  p_order jsonb,
  p_section_order jsonb,
  p_blocks jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_item text;
  v_result jsonb := '[]'::jsonb;
  v_seen text[] := '{}'::text[];
  v_allowed_sections text[] := array[
    'services', 'portfolio', 'team', 'booking', 'membership', 'safety',
    'reviews', 'gift', 'faq', 'about', 'contact'
  ];
  v_block_id text;
begin
  if jsonb_typeof(p_order) = 'array' then
    for v_item in
      select layout_element
      from jsonb_array_elements_text(p_order) as layout_items(layout_element)
    loop
      exit when cardinality(v_seen) >= 23;
      if v_item = any(v_seen) then
        continue;
      end if;
      if left(v_item, 8) = 'section:'
        and substring(v_item from 9) = any(v_allowed_sections)
      then
        v_result := v_result || jsonb_build_array(v_item);
        v_seen := array_append(v_seen, v_item);
        continue;
      end if;
      if left(v_item, 7) = 'custom:'
        and exists (
          select 1
          from jsonb_array_elements(
            case when jsonb_typeof(p_blocks) = 'array' then p_blocks else '[]'::jsonb end
          ) as block_items(block_item)
          where block_item->>'id' = substring(v_item from 8)
        )
      then
        v_result := v_result || jsonb_build_array(v_item);
        v_seen := array_append(v_seen, v_item);
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_section_order) = 'array' then
    for v_item in
      select 'section:' || section_element
      from jsonb_array_elements_text(p_section_order)
        as section_items(section_element)
    loop
      if v_item <> all(v_seen) then
        v_result := v_result || jsonb_build_array(v_item);
        v_seen := array_append(v_seen, v_item);
      end if;
    end loop;
  end if;

  foreach v_item in array v_allowed_sections
  loop
    v_item := 'section:' || v_item;
    if v_item <> all(v_seen) then
      v_result := v_result || jsonb_build_array(v_item);
      v_seen := array_append(v_seen, v_item);
    end if;
  end loop;

  if jsonb_typeof(p_blocks) = 'array' then
    for v_block_id in
      select block_item->>'id'
      from jsonb_array_elements(p_blocks) as block_items(block_item)
    loop
      v_item := 'custom:' || v_block_id;
      if v_item <> all(v_seen) then
        v_result := v_result || jsonb_build_array(v_item);
        v_seen := array_append(v_seen, v_item);
      end if;
    end loop;
  end if;

  return v_result;
end;
$$;

alter function public.save_public_site_draft(uuid, text, jsonb, boolean)
  rename to save_public_site_draft_v22;

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
  v_content jsonb;
  v_google_analytics_id text;
  v_meta_pixel_id text;
begin
  v_content := public.save_public_site_draft_v22(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );

  v_google_analytics_id := upper(trim(coalesce(
    p_content->>'google_analytics_id',
    ''
  )));
  if v_google_analytics_id !~ '^G-[A-Z0-9]{4,20}$' then
    v_google_analytics_id := '';
  end if;

  v_meta_pixel_id := trim(coalesce(p_content->>'meta_pixel_id', ''));
  if v_meta_pixel_id !~ '^[0-9]{5,32}$' then
    v_meta_pixel_id := '';
  end if;

  v_content := v_content || jsonb_build_object(
    'site_summary', left(
      regexp_replace(
        trim(coalesce(p_content->>'site_summary', '')),
        '[[:cntrl:]]',
        ' ',
        'g'
      ),
      500
    ),
    'seo_keywords', left(
      regexp_replace(
        trim(coalesce(p_content->>'seo_keywords', '')),
        '[[:cntrl:]]',
        ' ',
        'g'
      ),
      500
    ),
    'favicon_url', public.normalize_public_site_media_url(
      p_content->>'favicon_url'
    ),
    'show_social_icons', case
      when jsonb_typeof(p_content->'show_social_icons') = 'boolean'
        then (p_content->>'show_social_icons')::boolean
      else false
    end,
    'social_links', public.normalize_public_site_social_links(
      p_content->'social_links'
    ),
    'google_analytics_id', v_google_analytics_id,
    'meta_pixel_id', v_meta_pixel_id,
    'layout_order', public.normalize_public_site_layout_order(
      p_content->'layout_order',
      v_content->'section_order',
      v_content->'custom_blocks'
    )
  );

  update public.public_site_locales
  set draft_content = v_content,
      updated_at = now()
  where business_id = p_business_id
    and locale = lower(trim(coalesce(p_locale, '')));

  return v_content;
end;
$$;

revoke all on function public.save_public_site_draft_v22(
  uuid,
  text,
  jsonb,
  boolean
) from public, anon, authenticated;
revoke all on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) from public, anon;
grant execute on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) to authenticated;

comment on function public.normalize_public_site_layout_order(jsonb, jsonb, jsonb)
is 'Returns a stable, unique interleaved order for built-in and custom public-site blocks.';

comment on function public.save_public_site_draft(uuid, text, jsonb, boolean)
is 'Saves a tenant-safe public-site draft with media presentation, unified layout, social, SEO and analytics settings.';
