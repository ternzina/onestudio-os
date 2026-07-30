-- OneStudio OS site editor content controls 2.1
-- Adds sanitized editable image slots, structured reviews, and reversible
-- visibility controls for hero, custom blocks, and public pages.

create or replace function public.normalize_public_site_media_url(p_value text)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  value text := trim(coalesce(p_value, ''));
begin
  if (
    left(value, 1) = '/'
    and left(value, 2) <> '//'
    and value !~ '[[:space:]]'
  ) or value ~ '^https://[^[:space:]]+$'
  then
    return left(value, 500);
  end if;
  return '';
end;
$$;

create or replace function public.normalize_public_site_media_urls(p_values jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  item jsonb;
  value text;
  result jsonb := '[]'::jsonb;
  item_count integer := 0;
begin
  if jsonb_typeof(p_values) <> 'array' then
    return result;
  end if;

  for item in select value from jsonb_array_elements(p_values)
  loop
    exit when item_count >= 12;
    value := public.normalize_public_site_media_url(
      case when jsonb_typeof(item) = 'string' then item #>> '{}' else '' end
    );
    result := result || jsonb_build_array(value);
    item_count := item_count + 1;
  end loop;

  return result;
end;
$$;

create or replace function public.normalize_public_site_reviews(p_reviews jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  item jsonb;
  result jsonb := '[]'::jsonb;
  review_id text;
  source_url text;
  rating integer;
  seen_ids text[] := '{}'::text[];
  item_count integer := 0;
begin
  if jsonb_typeof(p_reviews) <> 'array' then
    return result;
  end if;

  for item in select value from jsonb_array_elements(p_reviews)
  loop
    exit when item_count >= 12;
    if jsonb_typeof(item) <> 'object' then
      continue;
    end if;

    review_id := lower(trim(coalesce(item->>'id', '')));
    if review_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      review_id := 'review-' || (item_count + 1)::text;
    end if;
    review_id := left(review_id, 72);
    if review_id = any(seen_ids) then
      continue;
    end if;

    if trim(coalesce(item->>'author', '')) = ''
      or trim(coalesce(item->>'text', '')) = ''
    then
      continue;
    end if;

    begin
      rating := greatest(
        1,
        least(5, coalesce((item->>'rating')::integer, 5))
      );
    exception when others then
      rating := 5;
    end;

    source_url := trim(coalesce(item->>'source_url', ''));
    if source_url !~ '^https://[^[:space:]]+$' then
      source_url := '';
    end if;

    result := result || jsonb_build_array(
      jsonb_build_object(
        'id', review_id,
        'author', left(trim(item->>'author'), 100),
        'text', left(trim(item->>'text'), 2000),
        'rating', rating,
        'source', left(trim(coalesce(item->>'source', '')), 80),
        'source_url', left(source_url, 500)
      )
    );
    seen_ids := array_append(seen_ids, review_id);
    item_count := item_count + 1;
  end loop;

  return result;
end;
$$;

create or replace function public.normalize_public_site_custom_blocks(
  p_blocks jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  item jsonb;
  result jsonb := '[]'::jsonb;
  block_id text;
  block_kind text;
  block_tone text;
  block_url text;
  seen_ids text[] := '{}'::text[];
  item_count integer := 0;
begin
  if jsonb_typeof(p_blocks) <> 'array' then
    return result;
  end if;

  for item in select value from jsonb_array_elements(p_blocks)
  loop
    exit when item_count >= 12;
    if jsonb_typeof(item) <> 'object' then
      continue;
    end if;

    block_id := lower(trim(coalesce(item->>'id', '')));
    if block_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      block_id := 'block-' || (item_count + 1)::text;
    end if;
    block_id := left(block_id, 72);
    if block_id = any(seen_ids) then
      continue;
    end if;

    block_kind := case
      when item->>'kind' in ('text', 'features', 'cta') then item->>'kind'
      else 'text'
    end;
    block_tone := case
      when item->>'tone' in ('light', 'accent', 'dark') then item->>'tone'
      else 'light'
    end;
    block_url := trim(coalesce(item->>'button_url', ''));
    if block_url !~ '^(#[A-Za-z0-9_-]+|/[A-Za-z0-9_/?&=.#%:-]*|https://[^[:space:]]+)$' then
      block_url := '';
    end if;

    result := result || jsonb_build_array(
      jsonb_build_object(
        'id', block_id,
        'kind', block_kind,
        'eyebrow', left(trim(coalesce(item->>'eyebrow', '')), 100),
        'title', left(trim(coalesce(item->>'title', '')), 180),
        'text', left(trim(coalesce(item->>'text', '')), 4000),
        'items', left(trim(coalesce(item->>'items', '')), 5000),
        'button_label', left(trim(coalesce(item->>'button_label', '')), 80),
        'button_url', left(block_url, 500),
        'tone', block_tone,
        'is_visible', case
          when jsonb_typeof(item->'is_visible') = 'boolean'
            then (item->>'is_visible')::boolean
          else true
        end
      )
    );
    seen_ids := array_append(seen_ids, block_id);
    item_count := item_count + 1;
  end loop;

  return result;
end;
$$;

create or replace function public.normalize_public_site_pages(p_pages jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  item jsonb;
  result jsonb := '[]'::jsonb;
  page_type text;
  page_slug text;
  page_id text;
  seen_slugs text[] := '{}'::text[];
  custom_count integer := 0;
  portfolio_added boolean := false;
begin
  if jsonb_typeof(p_pages) <> 'array' then
    return result;
  end if;

  for item in select value from jsonb_array_elements(p_pages)
  loop
    if jsonb_typeof(item) <> 'object' then
      continue;
    end if;
    page_type := item->>'type';

    if page_type = 'portfolio' and not portfolio_added then
      page_slug := case
        when coalesce(item->>'slug', '') ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
          then left(item->>'slug', 60)
        else 'portfolio'
      end;
      if page_slug = any(seen_slugs) then
        continue;
      end if;

      result := result || jsonb_build_array(
        jsonb_build_object(
          'id', 'portfolio',
          'type', 'portfolio',
          'slug', page_slug,
          'nav_label', left(trim(coalesce(nullif(item->>'nav_label', ''), 'Portfolio')), 60),
          'eyebrow', left(trim(coalesce(item->>'eyebrow', 'Selected works')), 100),
          'title', left(trim(coalesce(nullif(item->>'title', ''), 'Portfolio')), 160),
          'intro', left(trim(coalesce(item->>'intro', '')), 1000),
          'is_visible', case
            when jsonb_typeof(item->'is_visible') = 'boolean'
              then (item->>'is_visible')::boolean
            else true
          end,
          'show_in_navigation', case
            when jsonb_typeof(item->'show_in_navigation') = 'boolean'
              then (item->>'show_in_navigation')::boolean
            else true
          end,
          'show_booking_cta', case
            when jsonb_typeof(item->'show_booking_cta') = 'boolean'
              then (item->>'show_booking_cta')::boolean
            else true
          end
        )
      );
      portfolio_added := true;
      seen_slugs := array_append(seen_slugs, page_slug);
      continue;
    end if;

    if page_type <> 'custom' or custom_count >= 6 then
      continue;
    end if;

    page_slug := lower(trim(coalesce(item->>'slug', '')));
    if page_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      or page_slug in ('portfolio', 'p')
    then
      page_slug := 'page-' || (custom_count + 1)::text;
    end if;
    page_slug := left(page_slug, 60);
    if page_slug = any(seen_slugs) then
      continue;
    end if;

    page_id := lower(trim(coalesce(item->>'id', '')));
    if page_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      page_id := 'custom-' || page_slug;
    end if;

    result := result || jsonb_build_array(
      jsonb_build_object(
        'id', left(page_id, 72),
        'type', 'custom',
        'slug', page_slug,
        'nav_label', left(trim(coalesce(nullif(item->>'nav_label', ''), 'Page')), 60),
        'eyebrow', left(trim(coalesce(item->>'eyebrow', '')), 100),
        'title', left(trim(coalesce(nullif(item->>'title', ''), 'Page')), 160),
        'intro', left(trim(coalesce(item->>'intro', '')), 1000),
        'is_visible', case
          when jsonb_typeof(item->'is_visible') = 'boolean'
            then (item->>'is_visible')::boolean
          else true
        end,
        'show_in_navigation', case
          when jsonb_typeof(item->'show_in_navigation') = 'boolean'
            then (item->>'show_in_navigation')::boolean
          else true
        end,
        'show_booking_cta', case
          when jsonb_typeof(item->'show_booking_cta') = 'boolean'
            then (item->>'show_booking_cta')::boolean
          else true
        end,
        'blocks', public.normalize_public_site_custom_blocks(item->'blocks')
      )
    );
    seen_slugs := array_append(seen_slugs, page_slug);
    custom_count := custom_count + 1;
  end loop;

  return result;
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
  normalized_locale text := lower(trim(coalesce(p_locale, '')));
  business_name text;
  normalized_content jsonb;
  requested_order jsonb;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'public_site_configuration_forbidden' using errcode = '42501';
  end if;

  if normalized_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'public_site_locale_invalid' using errcode = '22023';
  end if;

  select b.name into business_name
  from public.businesses b
  where b.id = p_business_id and b.status <> 'archived';

  if business_name is null then
    raise exception 'public_site_business_not_found' using errcode = '23503';
  end if;

  normalized_content := public.normalize_public_site_content(
    business_name,
    normalized_locale,
    p_content
  ) || jsonb_build_object(
    'announcement_text', left(trim(coalesce(p_content->>'announcement_text', '')), 180),
    'popular_title', left(trim(coalesce(p_content->>'popular_title', '')), 100),
    'work_filters', left(trim(coalesce(p_content->>'work_filters', '')), 500),
    'booking_title', left(trim(coalesce(p_content->>'booking_title', '')), 160),
    'booking_text', left(trim(coalesce(p_content->>'booking_text', '')), 1000),
    'safety_title', left(trim(coalesce(p_content->>'safety_title', '')), 160),
    'safety_label', left(trim(coalesce(p_content->>'safety_label', '')), 80),
    'safety_items', left(trim(coalesce(p_content->>'safety_items', '')), 5000),
    'show_hero', case
      when jsonb_typeof(p_content->'show_hero') = 'boolean'
        then (p_content->>'show_hero')::boolean
      else true
    end,
    'show_announcement', case
      when jsonb_typeof(p_content->'show_announcement') = 'boolean'
        then (p_content->>'show_announcement')::boolean
      else false
    end,
    'show_booking', case
      when jsonb_typeof(p_content->'show_booking') = 'boolean'
        then (p_content->>'show_booking')::boolean
      else false
    end,
    'show_safety', case
      when jsonb_typeof(p_content->'show_safety') = 'boolean'
        then (p_content->>'show_safety')::boolean
      else false
    end,
    'service_image_urls', public.normalize_public_site_media_urls(
      p_content->'service_image_urls'
    ),
    'team_image_urls', public.normalize_public_site_media_urls(
      p_content->'team_image_urls'
    ),
    'membership_image_url', public.normalize_public_site_media_url(
      p_content->>'membership_image_url'
    ),
    'gift_image_url', public.normalize_public_site_media_url(
      p_content->>'gift_image_url'
    ),
    'reviews', public.normalize_public_site_reviews(p_content->'reviews'),
    'custom_blocks', public.normalize_public_site_custom_blocks(
      p_content->'custom_blocks'
    ),
    'pages', public.normalize_public_site_pages(p_content->'pages')
  );

  requested_order := p_content->'section_order';
  if jsonb_typeof(requested_order) <> 'array'
    or jsonb_array_length(requested_order) not between 4 and 11
    or not (
      requested_order <@
      '["services","portfolio","team","booking","membership","safety","reviews","gift","faq","about","contact"]'::jsonb
    )
    or not requested_order @> '["services","portfolio","about","contact"]'::jsonb
    or (
      select count(distinct value) <> jsonb_array_length(requested_order)
      from jsonb_array_elements_text(requested_order)
    )
  then
    requested_order := '["services","portfolio","about","contact"]'::jsonb;
  end if;

  normalized_content := jsonb_set(
    normalized_content,
    '{section_order}',
    requested_order,
    true
  );

  insert into public.public_site_locales (business_id, locale, draft_content)
  values (p_business_id, normalized_locale, normalized_content)
  on conflict (business_id, locale) do update
  set draft_content = excluded.draft_content,
      updated_at = now();

  if p_make_primary then
    update public.public_site_settings
    set primary_locale = normalized_locale,
        updated_at = now()
    where business_id = p_business_id;
  end if;

  return normalized_content;
end;
$$;

revoke all on function public.normalize_public_site_media_url(text)
from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_media_urls(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_reviews(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_pages(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean)
from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
to authenticated;

update public.public_site_locales
set draft_content = draft_content || jsonb_build_object(
      'show_hero',
        case
          when jsonb_typeof(draft_content->'show_hero') = 'boolean'
            then (draft_content->>'show_hero')::boolean
          else true
        end,
      'service_image_urls',
        coalesce(
          draft_content->'service_image_urls',
          '[
            "/templates/gloss/gloss-gallery-4.webp",
            "/templates/gloss/gloss-gallery-1.webp",
            "/templates/gloss/gloss-gallery-3.webp",
            "/templates/gloss/gloss-gallery-8.webp"
          ]'::jsonb
        ),
      'team_image_urls',
        coalesce(
          draft_content->'team_image_urls',
          '[
            "/templates/gloss/gloss-master-anna.webp",
            "/templates/gloss/gloss-master-maria.webp",
            "/templates/gloss/gloss-master-elena.webp"
          ]'::jsonb
        ),
      'membership_image_url',
        coalesce(
          nullif(draft_content->>'membership_image_url', ''),
          '/templates/gloss/gloss-club.webp'
        ),
      'gift_image_url',
        coalesce(
          nullif(draft_content->>'gift_image_url', ''),
          '/templates/gloss/gloss-gift.webp'
        ),
      'reviews',
        coalesce(
          draft_content->'reviews',
          '[
            {
              "id": "review-ekaterina",
              "author": "Екатерина",
              "text": "Наконец-то нашла место, где тонкие ногти не перепиливают, а покрытие действительно держится.",
              "rating": 5,
              "source": "Google",
              "source_url": ""
            },
            {
              "id": "review-alina",
              "author": "Алина",
              "text": "Очень аккуратно и спокойно. Маникюр идеальный даже через три недели.",
              "rating": 5,
              "source": "Instagram",
              "source_url": ""
            },
            {
              "id": "review-victoria",
              "author": "Виктория",
              "text": "Красивый салон, приятная команда и безупречная чистота.",
              "rating": 5,
              "source": "Google",
              "source_url": ""
            }
          ]'::jsonb
        )
    ),
    updated_at = now()
where draft_content->>'template_id' = 'gloss-nail-studio';
