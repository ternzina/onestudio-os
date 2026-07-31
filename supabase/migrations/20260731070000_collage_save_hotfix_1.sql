-- OneStudio OS collage save hotfix 1
-- Preserves the new collage block and its left/center/right alignment
-- when public-site drafts are normalized before saving.

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
  v_media_url text;
  v_media_alt text;
  v_slide_interval integer;
  v_media_size text;
  v_media_aspect text;
  v_media_fit text;
  v_media_frame text;
  v_media_type text;
  v_media_position text;
  v_columns_count integer;
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
      when v_item->>'kind' in (
        'text',
        'features',
        'cta',
        'slider',
        'collage',
        'video',
        'media_text',
        'columns'
      )
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
      when v_item->>'media_aspect' in (
        'landscape',
        'classic',
        'square',
        'portrait'
      )
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

    v_media_type := case
      when v_item->>'media_type' in ('video', 'calendar')
        then v_item->>'media_type'
      else 'image'
    end;

    v_media_position := case
      when v_item->>'media_position' in ('left', 'center', 'right')
        then v_item->>'media_position'
      else 'right'
    end;

    begin
      v_columns_count := case
        when (v_item->>'columns_count')::integer = 2 then 2
        else 3
      end;
    exception when others then
      v_columns_count := 3;
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
    v_media_url := public.normalize_public_site_media_url(
      v_item->>'media_url'
    );
    v_media_alt := left(
      regexp_replace(
        trim(coalesce(v_item->>'media_alt', '')),
        '[[:cntrl:]]',
        ' ',
        'g'
      ),
      180
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
        'media_url', v_media_url,
        'media_alt', v_media_alt,
        'media_type', v_media_type,
        'media_position', v_media_position,
        'columns_count', v_columns_count,
        'cards', public.normalize_public_site_column_cards(v_item->'cards'),
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
