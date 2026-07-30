-- OneStudio OS Site Templates: GLOSS 1.1
-- Adds a real hero image, seeded catalog services and seeded portfolio projects.

create or replace function public.normalize_public_site_content(
  p_business_name text,
  p_locale text,
  p_content jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  defaults jsonb := public.default_public_site_content(p_business_name, p_locale);
  content jsonb := coalesce(p_content, '{}'::jsonb);
begin
  if jsonb_typeof(content) <> 'object' then
    raise exception 'public_site_content_must_be_object' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'template_id', left(trim(coalesce(content->>'template_id', '')), 80),
    'theme_accent', case when coalesce(content->>'theme_accent', '') ~ '^#[0-9a-fA-F]{6}$' then content->>'theme_accent' else '#9a742e' end,
    'theme_dark', case when coalesce(content->>'theme_dark', '') ~ '^#[0-9a-fA-F]{6}$' then content->>'theme_dark' else '#191b20' end,
    'theme_surface', case when coalesce(content->>'theme_surface', '') ~ '^#[0-9a-fA-F]{6}$' then content->>'theme_surface' else '#f3f0e9' end,
    'brand_name', left(trim(coalesce(content->>'brand_name', '')), 80),
    'hero_image_url', left(
      case
        when (
          left(coalesce(content->>'hero_image_url', ''), 1) = '/'
          and left(coalesce(content->>'hero_image_url', ''), 2) <> '//'
          and coalesce(content->>'hero_image_url', '') !~ '[[:space:]]'
        )
          or coalesce(content->>'hero_image_url', '') ~ '^https://[^[:space:]]+$'
        then trim(content->>'hero_image_url')
        else ''
      end,
      500
    ),
    'hero_eyebrow', left(trim(coalesce(nullif(content->>'hero_eyebrow', ''), defaults->>'hero_eyebrow')), 80),
    'hero_title', left(trim(coalesce(nullif(content->>'hero_title', ''), defaults->>'hero_title')), 140),
    'hero_text', left(trim(coalesce(content->>'hero_text', defaults->>'hero_text')), 500),
    'about_title', left(trim(coalesce(nullif(content->>'about_title', ''), defaults->>'about_title')), 120),
    'about_text', left(trim(coalesce(content->>'about_text', defaults->>'about_text')), 3000),
    'services_title', left(trim(coalesce(nullif(content->>'services_title', ''), defaults->>'services_title')), 120),
    'portfolio_title', left(trim(coalesce(nullif(content->>'portfolio_title', ''), defaults->>'portfolio_title')), 120),
    'contact_title', left(trim(coalesce(nullif(content->>'contact_title', ''), defaults->>'contact_title')), 120),
    'team_title', left(trim(coalesce(content->>'team_title', 'Our team')), 120),
    'reviews_title', left(trim(coalesce(content->>'reviews_title', 'What clients say')), 120),
    'membership_title', left(trim(coalesce(content->>'membership_title', 'Client club')), 120),
    'gift_title', left(trim(coalesce(content->>'gift_title', 'Gift certificates')), 120),
    'faq_title', left(trim(coalesce(content->>'faq_title', 'Questions and answers')), 120),
    'booking_label', left(trim(coalesce(nullif(content->>'booking_label', ''), defaults->>'booking_label')), 60),
    'services_label', left(trim(coalesce(nullif(content->>'services_label', ''), defaults->>'services_label')), 60),
    'portfolio_label', left(trim(coalesce(nullif(content->>'portfolio_label', ''), defaults->>'portfolio_label')), 60),
    'about_label', left(trim(coalesce(nullif(content->>'about_label', ''), defaults->>'about_label')), 60),
    'contact_label', left(trim(coalesce(nullif(content->>'contact_label', ''), defaults->>'contact_label')), 60),
    'team_label', left(trim(coalesce(content->>'team_label', 'Team')), 60),
    'reviews_label', left(trim(coalesce(content->>'reviews_label', 'Reviews')), 60),
    'membership_label', left(trim(coalesce(content->>'membership_label', 'Club')), 60),
    'gift_label', left(trim(coalesce(content->>'gift_label', 'Gifts')), 60),
    'faq_label', left(trim(coalesce(content->>'faq_label', 'FAQ')), 60),
    'team_items', left(trim(coalesce(content->>'team_items', '')), 4000),
    'reviews_items', left(trim(coalesce(content->>'reviews_items', '')), 6000),
    'membership_text', left(trim(coalesce(content->>'membership_text', '')), 2000),
    'gift_text', left(trim(coalesce(content->>'gift_text', '')), 2000),
    'faq_items', left(trim(coalesce(content->>'faq_items', '')), 8000),
    'show_services', case when jsonb_typeof(content->'show_services') = 'boolean' then (content->>'show_services')::boolean else (defaults->>'show_services')::boolean end,
    'show_portfolio', case when jsonb_typeof(content->'show_portfolio') = 'boolean' then (content->>'show_portfolio')::boolean else (defaults->>'show_portfolio')::boolean end,
    'show_about', case when jsonb_typeof(content->'show_about') = 'boolean' then (content->>'show_about')::boolean else (defaults->>'show_about')::boolean end,
    'show_contact', case when jsonb_typeof(content->'show_contact') = 'boolean' then (content->>'show_contact')::boolean else (defaults->>'show_contact')::boolean end,
    'show_team', case when jsonb_typeof(content->'show_team') = 'boolean' then (content->>'show_team')::boolean else false end,
    'show_reviews', case when jsonb_typeof(content->'show_reviews') = 'boolean' then (content->>'show_reviews')::boolean else false end,
    'show_membership', case when jsonb_typeof(content->'show_membership') = 'boolean' then (content->>'show_membership')::boolean else false end,
    'show_gift', case when jsonb_typeof(content->'show_gift') = 'boolean' then (content->>'show_gift')::boolean else false end,
    'show_faq', case when jsonb_typeof(content->'show_faq') = 'boolean' then (content->>'show_faq')::boolean else false end,
    'seo_title', left(trim(coalesce(nullif(content->>'seo_title', ''), defaults->>'seo_title')), 70),
    'seo_description', left(trim(coalesce(nullif(content->>'seo_description', ''), defaults->>'seo_description')), 170)
  );
end;
$$;

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
  v_currency text;
  v_service_category_id uuid;
  v_portfolio_category_id uuid;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'public_site_template_forbidden' using errcode = '42501';
  end if;

  if p_template_id <> 'gloss-nail-studio' then
    raise exception 'public_site_template_unknown' using errcode = '22023';
  end if;

  select business.default_currency
  into v_currency
  from public.businesses business
  where business.id = p_business_id
    and business.status <> 'archived';

  if v_currency is null then
    raise exception 'public_site_business_not_found' using errcode = '23503';
  end if;

  insert into public.catalog_categories (
    business_id, kind, slug, name, description,
    is_public, is_active, sort_order, metadata
  )
  values (
    p_business_id, 'service', 'gloss-services', 'Услуги GLOSS',
    'Готовая редактируемая категория шаблона GLOSS.',
    true, true, 110, jsonb_build_object('template_id', p_template_id)
  )
  on conflict (business_id, kind, slug) do update
  set name = excluded.name,
      description = excluded.description,
      is_public = true,
      is_active = true,
      metadata = catalog_categories.metadata || excluded.metadata,
      updated_at = now()
  returning id into v_service_category_id;

  insert into public.services (
    business_id, category_id, slug, kind, title, description,
    pricing_model, price_minor, currency,
    duration_min_minutes, duration_max_minutes, duration_step_minutes,
    capacity, requires_confirmation, is_public, is_active, sort_order, metadata
  )
  select
    p_business_id,
    v_service_category_id,
    seed.slug,
    'appointment',
    seed.title,
    seed.description,
    'fixed',
    seed.price_minor,
    v_currency,
    seed.duration_minutes,
    seed.duration_minutes,
    15,
    1,
    false,
    true,
    true,
    seed.sort_order,
    jsonb_build_object('template_id', p_template_id, 'starter', true)
  from (
    values
      ('gloss-signature-manicure', 'Маникюр с покрытием', 'Снятие, бережный маникюр, выравнивание и однотонное покрытие.', 4500, 90, 110),
      ('gloss-clean-manicure', 'Маникюр без покрытия', 'Идеальная форма, обработка кутикулы и уход за кожей рук.', 2800, 60, 120),
      ('gloss-strengthening', 'Укрепление ногтей', 'Укрепление гелем с архитектурой и покрытием выбранного оттенка.', 5500, 120, 130),
      ('gloss-pedicure', 'Педикюр с покрытием', 'Полный уход, обработка стоп и стойкое покрытие.', 5200, 90, 140),
      ('gloss-nail-art', 'Nail art', 'Френч, минималистичные линии и дизайн по вашему референсу.', 800, 30, 150),
      ('gloss-spa-care', 'SPA-уход для рук', 'Мягкий пилинг, маска и расслабляющий массаж.', 1800, 30, 160)
  ) as seed(slug, title, description, price_minor, duration_minutes, sort_order)
  on conflict (business_id, slug) do update
  set category_id = excluded.category_id,
      title = excluded.title,
      description = excluded.description,
      pricing_model = excluded.pricing_model,
      price_minor = excluded.price_minor,
      currency = excluded.currency,
      duration_min_minutes = excluded.duration_min_minutes,
      duration_max_minutes = excluded.duration_max_minutes,
      duration_step_minutes = excluded.duration_step_minutes,
      is_public = true,
      is_active = true,
      sort_order = excluded.sort_order,
      metadata = services.metadata || excluded.metadata,
      updated_at = now();

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
      ('/templates/gloss/gloss-gallery-1.webp', 'gloss-gallery-1.webp', 1086, 1448, 'Молочный маникюр с тонким вишнёвым френчем'),
      ('/templates/gloss/gloss-gallery-2.webp', 'gloss-gallery-2.webp', 1086, 1448, 'Вишнёвый маникюр с молочным и золотым акцентом'),
      ('/templates/gloss/gloss-hero.webp', 'gloss-hero.webp', 1823, 863, 'Глянцевый маникюр глубокого вишнёвого цвета')
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
      ('gloss-milky-french', 'Молочный френч', 'Тонкая вишнёвая линия и естественная форма.', 'gloss-gallery-1.webp', 110),
      ('gloss-cherry-detail', 'Cherry detail', 'Глубокий оттенок вишни с деликатным золотым акцентом.', 'gloss-gallery-2.webp', 120),
      ('gloss-signature-red', 'Signature red', 'Безупречное глянцевое покрытие в фирменной палитре GLOSS.', 'gloss-hero.webp', 130)
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

  return jsonb_build_object(
    'template_id', p_template_id,
    'services_added', 6,
    'portfolio_projects_added', 3
  );
end;
$$;

revoke all on function public.normalize_public_site_content(text, text, jsonb)
from public, anon, authenticated;
revoke all on function public.apply_public_site_template_seed(uuid, text)
from public, anon, authenticated;
grant execute on function public.apply_public_site_template_seed(uuid, text)
to authenticated;
