-- OneStudio OS GLOSS polish and flexible content 2.0
-- Adds safe custom blocks/pages, the visible booking and safety sections,
-- and the tenth editable GLOSS portfolio project.

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
        'tone', block_tone
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

revoke all on function public.normalize_public_site_custom_blocks(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_pages(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean)
from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
to authenticated;

create or replace function public.seed_gloss_polish_assets_internal(
  p_business_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  portfolio_category_id uuid;
  media_id uuid;
begin
  insert into public.media_library (
    business_id, image_url, r2_key, original_filename, mime_type,
    width, height, alt_text, is_active, source
  )
  values (
    p_business_id,
    '/templates/gloss/gloss-gallery-9.webp',
    'template/gloss/' || p_business_id::text || '/gloss-gallery-9.webp',
    'gloss-gallery-9.webp',
    'image/webp',
    900,
    1125,
    'Вишнёвый маникюр с нюдовым микрофренчем',
    true,
    'template'
  )
  on conflict (r2_key) do update
  set image_url = excluded.image_url,
      original_filename = excluded.original_filename,
      mime_type = excluded.mime_type,
      width = excluded.width,
      height = excluded.height,
      alt_text = excluded.alt_text,
      is_active = true,
      updated_at = now()
  returning id into media_id;

  select category.id
  into portfolio_category_id
  from public.portfolio_categories category
  where category.business_id = p_business_id
    and category.slug = 'gloss-works';

  if portfolio_category_id is null then
    insert into public.portfolio_categories (
      business_id, name, slug, is_active, sort_order
    )
    values (p_business_id, 'Работы GLOSS', 'gloss-works', true, 110)
    returning id into portfolio_category_id;
  end if;

  insert into public.portfolio_projects (
    business_id, category_id, slug, title, description,
    cover_media_id, is_active, sort_order
  )
  values (
    p_business_id,
    portfolio_category_id,
    'gloss-cherry-micro-french',
    'Cherry micro french',
    'Глубокий вишнёвый глянец и тонкая линия на нюдовой базе.',
    media_id,
    true,
    200
  )
  on conflict (business_id, slug) do update
  set category_id = excluded.category_id,
      title = excluded.title,
      description = excluded.description,
      cover_media_id = excluded.cover_media_id,
      is_active = true,
      sort_order = excluded.sort_order,
      updated_at = now();

  return jsonb_build_object('portfolio_projects_added', 1);
end;
$$;

revoke all on function public.seed_gloss_polish_assets_internal(uuid)
from public, anon, authenticated, service_role;

do $$
begin
  if to_regprocedure('public.apply_public_site_template_seed(uuid,text)') is not null
    and to_regprocedure('public.apply_public_site_template_seed_1_2_internal(uuid,text)') is null
  then
    execute
      'alter function public.apply_public_site_template_seed(uuid, text) '
      || 'rename to apply_public_site_template_seed_1_2_internal';
  end if;
end;
$$;

revoke all on function public.apply_public_site_template_seed_1_2_internal(uuid, text)
from public, anon, authenticated, service_role;

create or replace function public.apply_public_site_template_seed(
  p_business_id uuid,
  p_template_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  base_result jsonb;
  polish_result jsonb;
begin
  base_result := public.apply_public_site_template_seed_1_2_internal(
    p_business_id,
    p_template_id
  );
  polish_result := public.seed_gloss_polish_assets_internal(p_business_id);
  return base_result || polish_result;
end;
$$;

revoke all on function public.apply_public_site_template_seed(uuid, text)
from public, anon, authenticated;
grant execute on function public.apply_public_site_template_seed(uuid, text)
to authenticated;

do $$
declare
  workspace record;
begin
  for workspace in
    select distinct locale_data.business_id
    from public.public_site_locales locale_data
    where locale_data.draft_content->>'template_id' = 'gloss-nail-studio'
       or locale_data.published_content->>'template_id' = 'gloss-nail-studio'
  loop
    perform public.seed_gloss_polish_assets_internal(workspace.business_id);
  end loop;
end;
$$;

update public.public_site_locales
set draft_content = (
      jsonb_build_object(
        'announcement_text', 'Первое посещение — дизайн двух ногтей в подарок',
        'popular_title', 'Чаще выбирают',
        'work_filters', E'Все\nМинимализм\nFrench\nЯркие\nNail Art\nКороткие',
        'booking_title', 'Красивые руки — в удобное время',
        'booking_text', 'Выберите услугу, мастера и дату. Свободные окна обновляются автоматически.',
        'safety_label', 'ЗАБОТА В ДЕТАЛЯХ',
        'safety_title', 'Красиво и безопасно',
        'safety_items', E'Стерилизация · Полный цикл обработки инструментов\nОдноразовые материалы · Для вашего комфорта и безопасности\nПремиальные покрытия · Стойкость и насыщенный цвет',
        'show_announcement', true,
        'show_booking', true,
        'show_safety', true,
        'custom_blocks', '[]'::jsonb
      )
      || draft_content
      || jsonb_build_object(
        'section_order',
        '["services","portfolio","team","booking","membership","safety","reviews","gift","faq","about","contact"]'::jsonb
      )
    ),
    updated_at = now()
where draft_content->>'template_id' = 'gloss-nail-studio';
