-- OneStudio OS GLOSS pages and booking 1.2
-- Adds sanitized public pages, a full GLOSS portfolio gallery and template-aware booking links.

create or replace function public.normalize_public_site_pages(p_pages jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with source as (
    select distinct on (item->>'type')
      item,
      ordinal
    from jsonb_array_elements(
      case
        when jsonb_typeof(p_pages) = 'array' then p_pages
        else '[]'::jsonb
      end
    ) with ordinality as page(item, ordinal)
    where item->>'type' = 'portfolio'
    order by item->>'type', ordinal
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', 'portfolio',
        'type', 'portfolio',
        'slug', case
          when coalesce(item->>'slug', '') ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
            then left(item->>'slug', 60)
          else 'portfolio'
        end,
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
      order by ordinal
    ),
    '[]'::jsonb
  )
  from source;
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
  normalized_pages jsonb;
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
  );

  requested_order := p_content->'section_order';
  if jsonb_typeof(requested_order) <> 'array'
    or jsonb_array_length(requested_order) not between 4 and 9
    or not (requested_order <@ '["services","portfolio","team","reviews","membership","gift","faq","about","contact"]'::jsonb)
    or not requested_order @> '["services","portfolio","about","contact"]'::jsonb
    or (
      select count(distinct value) <> jsonb_array_length(requested_order)
      from jsonb_array_elements_text(requested_order)
    )
  then
    requested_order := '["services","portfolio","about","contact"]'::jsonb;
  end if;

  normalized_pages := public.normalize_public_site_pages(p_content->'pages');
  normalized_content := jsonb_set(normalized_content, '{section_order}', requested_order, true);
  normalized_content := jsonb_set(normalized_content, '{pages}', normalized_pages, true);

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

revoke all on function public.normalize_public_site_pages(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean)
from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
to authenticated;

do $$
begin
  if to_regprocedure('public.apply_public_site_template_seed(uuid,text)') is not null
    and to_regprocedure('public.apply_public_site_template_seed_1_1_internal(uuid,text)') is null
  then
    execute
      'alter function public.apply_public_site_template_seed(uuid, text) '
      || 'rename to apply_public_site_template_seed_1_1_internal';
  end if;
end;
$$;

revoke all on function public.apply_public_site_template_seed_1_1_internal(uuid, text)
from public, anon, authenticated, service_role;

create or replace function public.seed_gloss_portfolio_gallery_internal(
  p_business_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_portfolio_category_id uuid;
begin
  insert into public.media_library (
    business_id, image_url, r2_key, original_filename, mime_type,
    width, height, alt_text, is_active, source
  )
  select
    p_business_id,
    seed.image_url,
    'template/gloss/' || p_business_id::text || '/' || seed.filename,
    seed.filename,
    'image/webp',
    seed.width,
    seed.height,
    seed.alt_text,
    true,
    'template'
  from (
    values
      ('/templates/gloss/gloss-gallery-3.webp', 'gloss-gallery-3.webp', 1122, 1402, 'Молочный маникюр с тонким бордовым френчем'),
      ('/templates/gloss/gloss-gallery-4.webp', 'gloss-gallery-4.webp', 1122, 1402, 'Вишнёвый маникюр с золотым акцентом'),
      ('/templates/gloss/gloss-gallery-5.webp', 'gloss-gallery-5.webp', 960, 1200, 'Нюдовый маникюр с бордовыми линиями и жемчужиной'),
      ('/templates/gloss/gloss-gallery-6.webp', 'gloss-gallery-6.webp', 1122, 1402, 'Маникюр с эффектом шампанского и бордовым акцентом'),
      ('/templates/gloss/gloss-gallery-7.webp', 'gloss-gallery-7.webp', 1122, 1402, 'Розовый маникюр с бордовым ботаническим рисунком'),
      ('/templates/gloss/gloss-gallery-8.webp', 'gloss-gallery-8.webp', 1120, 1400, 'Сливочно-ягодный маникюр с золотой линией')
  ) as seed(image_url, filename, width, height, alt_text)
  on conflict (r2_key) do update
  set image_url = excluded.image_url,
      original_filename = excluded.original_filename,
      mime_type = excluded.mime_type,
      width = excluded.width,
      height = excluded.height,
      alt_text = excluded.alt_text,
      is_active = true,
      updated_at = now();

  insert into public.portfolio_categories (
    business_id, name, slug, is_active, sort_order
  )
  values (p_business_id, 'Работы GLOSS', 'gloss-works', true, 110)
  on conflict (business_id, slug) do update
  set name = excluded.name,
      is_active = true,
      sort_order = excluded.sort_order,
      updated_at = now()
  returning id into v_portfolio_category_id;

  insert into public.portfolio_projects (
    business_id, category_id, slug, title, description,
    cover_media_id, is_active, sort_order
  )
  select
    p_business_id,
    v_portfolio_category_id,
    seed.slug,
    seed.title,
    seed.description,
    media.id,
    true,
    seed.sort_order
  from (
    values
      ('gloss-burgundy-french', 'Burgundy micro french', 'Молочная база и тонкая вишнёвая линия по свободному краю.', 'gloss-gallery-3.webp', 140),
      ('gloss-cherry-gold', 'Cherry & gold', 'Глубокий вишнёвый оттенок с деликатным золотым акцентом.', 'gloss-gallery-4.webp', 150),
      ('gloss-minimal-lines', 'Fine lines', 'Воздушная нюдовая база, винные линии и маленькая жемчужина.', 'gloss-gallery-5.webp', 160),
      ('gloss-champagne-glaze', 'Champagne glaze', 'Мягкое жемчужное сияние и один выразительный полумесяц.', 'gloss-gallery-6.webp', 170),
      ('gloss-botanical', 'Burgundy botanica', 'Тонкая ручная роспись на полупрозрачной розовой основе.', 'gloss-gallery-7.webp', 180),
      ('gloss-ivory-berry', 'Ivory & berry', 'Сливочный и ягодный оттенки с тонкой золотой линией.', 'gloss-gallery-8.webp', 190)
  ) as seed(slug, title, description, filename, sort_order)
  join public.media_library media
    on media.business_id = p_business_id
   and media.r2_key = 'template/gloss/' || p_business_id::text || '/' || seed.filename
  on conflict (business_id, slug) do update
  set category_id = excluded.category_id,
      title = excluded.title,
      description = excluded.description,
      cover_media_id = excluded.cover_media_id,
      is_active = true,
      sort_order = excluded.sort_order,
      updated_at = now();

  return jsonb_build_object('portfolio_projects_added', 6);
end;
$$;

revoke all on function public.seed_gloss_portfolio_gallery_internal(uuid)
from public, anon, authenticated, service_role;

create or replace function public.seed_gloss_booking_internal(
  p_business_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resource_category_id uuid;
  v_resource_id uuid;
begin
  insert into public.catalog_categories (
    business_id, kind, slug, name, description,
    is_public, is_active, sort_order, metadata
  )
  values (
    p_business_id, 'resource', 'gloss-team', 'Мастера GLOSS',
    'Редактируемый ресурс для календаря шаблона GLOSS.',
    true, true, 110, jsonb_build_object('template_id', 'gloss-nail-studio')
  )
  on conflict (business_id, kind, slug) do update
  set name = excluded.name,
      description = excluded.description,
      is_public = true,
      is_active = true,
      metadata = catalog_categories.metadata || excluded.metadata,
      updated_at = now()
  returning id into v_resource_category_id;

  insert into public.resources (
    business_id, category_id, slug, kind, name, description,
    capacity, timezone, is_bookable, is_public, is_active, sort_order, metadata
  )
  select
    p_business_id,
    v_resource_category_id,
    'gloss-master',
    'staff',
    'Мастер GLOSS',
    'Демонстрационный мастер. Измените имя и рабочие часы под свой салон.',
    1,
    business.timezone,
    true,
    true,
    true,
    110,
    jsonb_build_object('template_id', 'gloss-nail-studio', 'starter', true)
  from public.businesses business
  where business.id = p_business_id
  on conflict (business_id, slug) do update
  set category_id = excluded.category_id,
      kind = excluded.kind,
      is_bookable = true,
      is_public = true,
      is_active = true,
      metadata = resources.metadata || excluded.metadata,
      updated_at = now()
  returning id into v_resource_id;

  insert into public.service_resources (
    business_id, service_id, resource_id, allocation_mode, quantity, sort_order
  )
  select
    service.business_id,
    service.id,
    v_resource_id,
    'required',
    1,
    1
  from public.services service
  where service.business_id = p_business_id
    and service.slug like 'gloss-%'
    and service.is_active
    and not exists (
      select 1
      from public.service_resources existing
      where existing.business_id = service.business_id
        and existing.service_id = service.id
        and existing.allocation_mode = 'required'
    )
  on conflict (service_id, resource_id) do update
  set allocation_mode = 'required',
      quantity = 1,
      sort_order = 1;

  insert into public.availability_rules (
    business_id, resource_id, day_of_week, start_time, end_time,
    effective_from, effective_until, is_active
  )
  select
    p_business_id,
    v_resource_id,
    schedule.day_of_week::smallint,
    time '10:00',
    time '19:00',
    null,
    null,
    true
  from generate_series(1, 6) as schedule(day_of_week)
  where not exists (
    select 1
    from public.availability_rules existing
    where existing.business_id = p_business_id
      and existing.resource_id = v_resource_id
  );

  return jsonb_build_object(
    'booking_resource', 'gloss-master',
    'starter_hours', 'Mon-Sat 10:00-19:00'
  );
end;
$$;

revoke all on function public.seed_gloss_booking_internal(uuid)
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
  gallery_result jsonb;
  booking_result jsonb;
begin
  base_result := public.apply_public_site_template_seed_1_1_internal(
    p_business_id,
    p_template_id
  );
  gallery_result := public.seed_gloss_portfolio_gallery_internal(p_business_id);
  booking_result := public.seed_gloss_booking_internal(p_business_id);
  return base_result || gallery_result || booking_result;
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
    union
    select distinct category.business_id
    from public.portfolio_categories category
    where category.slug = 'gloss-works'
  loop
    perform public.seed_gloss_portfolio_gallery_internal(workspace.business_id);
    perform public.seed_gloss_booking_internal(workspace.business_id);
  end loop;
end;
$$;

update public.public_site_locales
set draft_content = jsonb_set(
      draft_content,
      '{pages}',
      jsonb_build_array(
        jsonb_build_object(
          'id', 'portfolio',
          'type', 'portfolio',
          'slug', 'portfolio',
          'nav_label', 'Портфолио',
          'eyebrow', 'GLOSS · SELECTED WORKS',
          'title', 'Ногти как маленькие произведения искусства',
          'intro', 'Френч, глубокие оттенки, деликатные линии и дизайны, созданные под ваш стиль. Откройте работу и выберите идею для следующего визита.',
          'show_in_navigation', true,
          'show_booking_cta', true
        )
      ),
      true
    ),
    updated_at = now()
where draft_content->>'template_id' = 'gloss-nail-studio'
  and (
    coalesce(jsonb_typeof(draft_content->'pages'), 'null') <> 'array'
    or jsonb_array_length(draft_content->'pages') = 0
  );
