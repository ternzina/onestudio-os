-- OneStudio OS
-- Portfolio gallery foundation 1.0.
--
-- Keeps Portfolio as the single source of truth while adding public layout,
-- category filters, image lightbox settings and real project data to the visual
-- builder. The existing save RPC remains delegated to v22.

create or replace function public.save_public_site_draft_v22(
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
  v_normalized_locale text := lower(trim(coalesce(p_locale, '')));
  v_business_name text;
  v_normalized_content jsonb;
  v_requested_order jsonb;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'public_site_configuration_forbidden' using errcode = '42501';
  end if;

  if v_normalized_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'public_site_locale_invalid' using errcode = '22023';
  end if;

  select b.name into v_business_name
  from public.businesses b
  where b.id = p_business_id and b.status <> 'archived';

  if v_business_name is null then
    raise exception 'public_site_business_not_found' using errcode = '23503';
  end if;

  v_normalized_content := coalesce(
    public.normalize_public_site_content(
      v_business_name,
      v_normalized_locale,
      p_content
    ),
    public.default_public_site_content(
      v_business_name,
      v_normalized_locale
    ),
    '{}'::jsonb
  ) || jsonb_build_object(
    'announcement_text', left(trim(coalesce(p_content->>'announcement_text', '')), 180),
    'popular_title', left(trim(coalesce(p_content->>'popular_title', '')), 100),
    'work_filters', left(trim(coalesce(p_content->>'work_filters', '')), 500),
    'booking_title', left(trim(coalesce(p_content->>'booking_title', '')), 160),
    'booking_text', left(trim(coalesce(p_content->>'booking_text', '')), 1000),
    'safety_title', left(trim(coalesce(p_content->>'safety_title', '')), 160),
    'safety_label', left(trim(coalesce(p_content->>'safety_label', '')), 80),
    'safety_items', left(trim(coalesce(p_content->>'safety_items', '')), 5000),
    'about_image_url', public.normalize_public_site_media_url(
      p_content->>'about_image_url'
    ),
    'about_facts', left(
      regexp_replace(
        trim(coalesce(p_content->>'about_facts', '')),
        '[[:cntrl:]&&[^\n]]',
        '',
        'g'
      ),
      5000
    ),
    'about_button_label', left(
      trim(coalesce(p_content->>'about_button_label', '')),
      120
    ),
    'about_button_url', left(
      regexp_replace(
        trim(coalesce(p_content->>'about_button_url', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      500
    ),
    'contact_hours', left(trim(coalesce(p_content->>'contact_hours', '')), 160),
    'contact_address', left(trim(coalesce(p_content->>'contact_address', '')), 300),
    'contact_email', left(
      regexp_replace(
        trim(coalesce(p_content->>'contact_email', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      254
    ),
    'contact_phone', left(
      regexp_replace(
        trim(coalesce(p_content->>'contact_phone', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      80
    ),
    'contact_note', left(
      regexp_replace(
        trim(coalesce(p_content->>'contact_note', '')),
        '[[:cntrl:]&&[^\n]]',
        '',
        'g'
      ),
      1000
    ),
    'contact_route_label', left(
      regexp_replace(
        trim(coalesce(p_content->>'contact_route_label', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      100
    ),
    'map_query', left(
      regexp_replace(
        trim(coalesce(p_content->>'map_query', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      300
    ),
    'footer_note', left(
      regexp_replace(
        trim(coalesce(p_content->>'footer_note', '')),
        '[[:cntrl:]&&[^\n]]',
        '',
        'g'
      ),
      1000
    ),
    'seo_image_url', public.normalize_public_site_media_url(
      p_content->>'seo_image_url'
    ),
    'seo_no_index', case
      when jsonb_typeof(p_content->'seo_no_index') = 'boolean'
        then (p_content->>'seo_no_index')::boolean
      else false
    end,
    'show_hero', case
      when jsonb_typeof(p_content->'show_hero') = 'boolean'
        then (p_content->>'show_hero')::boolean
      else true
    end,
    'header_sticky', case
      when jsonb_typeof(p_content->'header_sticky') = 'boolean'
        then (p_content->>'header_sticky')::boolean
      else false
    end,
    'header_logo_size', case
      when coalesce(p_content->>'header_logo_size', '') in ('small', 'medium', 'large')
        then p_content->>'header_logo_size'
      else 'medium'
    end,
    'header_logo_position', case
      when coalesce(p_content->>'header_logo_position', '') in ('left', 'center')
        then p_content->>'header_logo_position'
      else 'left'
    end,
    'hero_layout', case
      when coalesce(p_content->>'hero_layout', '') in ('split', 'cover', 'text')
        then p_content->>'hero_layout'
      else 'split'
    end,
    'hero_image_placement', case
      when coalesce(p_content->>'hero_image_placement', '') in ('left', 'right')
        then p_content->>'hero_image_placement'
      else 'right'
    end,
    'hero_image_position', case
      when coalesce(p_content->>'hero_image_position', '') in ('top', 'center', 'bottom')
        then p_content->>'hero_image_position'
      else 'center'
    end,
    'hero_image_fit', case
      when coalesce(p_content->>'hero_image_fit', '') in ('cover', 'contain')
        then p_content->>'hero_image_fit'
      else 'cover'
    end,
    'hero_primary_label', left(
      regexp_replace(trim(coalesce(p_content->>'hero_primary_label', '')), '[[:cntrl:]]', '', 'g'),
      120
    ),
    'hero_primary_url', left(
      regexp_replace(trim(coalesce(p_content->>'hero_primary_url', '')), '[[:cntrl:]]', '', 'g'),
      500
    ),
    'hero_secondary_label', left(
      regexp_replace(trim(coalesce(p_content->>'hero_secondary_label', '')), '[[:cntrl:]]', '', 'g'),
      120
    ),
    'hero_secondary_url', left(
      regexp_replace(trim(coalesce(p_content->>'hero_secondary_url', '')), '[[:cntrl:]]', '', 'g'),
      500
    ),
    'show_hero_secondary', case
      when jsonb_typeof(p_content->'show_hero_secondary') = 'boolean'
        then (p_content->>'show_hero_secondary')::boolean
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
    )
  ) || jsonb_build_object(
    'service_card_images', public.normalize_public_site_service_images(
      p_content->'service_card_images'
    ),
    'services_layout', case
      when coalesce(p_content->>'services_layout', '') in ('cards', 'list')
        then p_content->>'services_layout'
      else 'cards'
    end,
    'services_columns', case
      when coalesce(p_content->>'services_columns', '') in ('2', '3', '4')
        then (p_content->>'services_columns')::integer
      else 4
    end,
    'services_show_description', case
      when jsonb_typeof(p_content->'services_show_description') = 'boolean'
        then (p_content->>'services_show_description')::boolean
      else true
    end,
    'services_show_price', case
      when jsonb_typeof(p_content->'services_show_price') = 'boolean'
        then (p_content->>'services_show_price')::boolean
      else true
    end,
    'services_show_duration', case
      when jsonb_typeof(p_content->'services_show_duration') = 'boolean'
        then (p_content->>'services_show_duration')::boolean
      else true
    end,
    'services_button_label', left(
      regexp_replace(
        trim(coalesce(p_content->>'services_button_label', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      120
    ),
    'team_image_urls', public.normalize_public_site_media_urls(
      p_content->'team_image_urls'
    ),
    'membership_image_url', public.normalize_public_site_media_url(
      p_content->>'membership_image_url'
    ),
    'membership_items', left(
      regexp_replace(
        trim(coalesce(p_content->>'membership_items', '')),
        '[[:cntrl:]&&[^\n]]',
        '',
        'g'
      ),
      12000
    ),
    'membership_image_urls', public.normalize_public_site_media_urls(
      p_content->'membership_image_urls'
    ),
    'gift_image_url', public.normalize_public_site_media_url(
      p_content->>'gift_image_url'
    ),
    'gift_items', left(
      regexp_replace(
        trim(coalesce(p_content->>'gift_items', '')),
        '[[:cntrl:]&&[^\n]]',
        '',
        'g'
      ),
      12000
    ),
    'gift_image_urls', public.normalize_public_site_media_urls(
      p_content->'gift_image_urls'
    ),
    'reviews', public.normalize_public_site_reviews(p_content->'reviews'),
    'custom_blocks', public.normalize_public_site_custom_blocks(
      p_content->'custom_blocks'
    ),
    'pages', public.normalize_public_site_pages(p_content->'pages')
  ) || jsonb_build_object(
    'portfolio_layout', case
      when coalesce(p_content->>'portfolio_layout', '') in ('grid', 'masonry')
        then p_content->>'portfolio_layout'
      else 'masonry'
    end,
    'portfolio_columns', case
      when coalesce(p_content->>'portfolio_columns', '') in ('2', '3', '4')
        then (p_content->>'portfolio_columns')::integer
      else 3
    end,
    'portfolio_card_aspect', case
      when coalesce(p_content->>'portfolio_card_aspect', '') in (
        'auto',
        'square',
        'landscape',
        'portrait'
      )
        then p_content->>'portfolio_card_aspect'
      else 'auto'
    end,
    'portfolio_show_filters', case
      when jsonb_typeof(p_content->'portfolio_show_filters') = 'boolean'
        then (p_content->>'portfolio_show_filters')::boolean
      else true
    end,
    'portfolio_lightbox', case
      when jsonb_typeof(p_content->'portfolio_lightbox') = 'boolean'
        then (p_content->>'portfolio_lightbox')::boolean
      else true
    end,
    'portfolio_show_category', case
      when jsonb_typeof(p_content->'portfolio_show_category') = 'boolean'
        then (p_content->>'portfolio_show_category')::boolean
      else true
    end,
    'portfolio_show_title', case
      when jsonb_typeof(p_content->'portfolio_show_title') = 'boolean'
        then (p_content->>'portfolio_show_title')::boolean
      else true
    end,
    'portfolio_show_description', case
      when jsonb_typeof(p_content->'portfolio_show_description') = 'boolean'
        then (p_content->>'portfolio_show_description')::boolean
      else false
    end,
    'portfolio_home_limit', case
      when coalesce(p_content->>'portfolio_home_limit', '') in ('0', '6', '9', '12')
        then (p_content->>'portfolio_home_limit')::integer
      else 9
    end
  );

  v_requested_order := p_content->'section_order';

  if jsonb_typeof(v_requested_order) is distinct from 'array' then
    v_requested_order := '["services","portfolio","about","contact"]'::jsonb;
  elsif jsonb_array_length(v_requested_order) not between 4 and 11 then
    v_requested_order := '["services","portfolio","about","contact"]'::jsonb;
  elsif not (
    v_requested_order <@
    '["services","portfolio","team","booking","membership","safety","reviews","gift","faq","about","contact"]'::jsonb
  ) then
    v_requested_order := '["services","portfolio","about","contact"]'::jsonb;
  elsif not v_requested_order @> '["services","portfolio","about","contact"]'::jsonb then
    v_requested_order := '["services","portfolio","about","contact"]'::jsonb;
  elsif (
    select count(distinct order_item) <> jsonb_array_length(v_requested_order)
    from jsonb_array_elements_text(v_requested_order) as order_items(order_item)
  ) then
    v_requested_order := '["services","portfolio","about","contact"]'::jsonb;
  end if;

  v_normalized_content := jsonb_set(
    v_normalized_content,
    '{section_order}',
    v_requested_order,
    true
  );

  insert into public.public_site_locales (business_id, locale, draft_content)
  values (p_business_id, v_normalized_locale, v_normalized_content)
  on conflict (business_id, locale) do update
  set draft_content = excluded.draft_content,
      updated_at = now();

  if p_make_primary then
    update public.public_site_settings
    set primary_locale = v_normalized_locale,
        updated_at = now()
    where business_id = p_business_id;
  end if;

  return v_normalized_content;
end;
$$;

create or replace function public.get_public_site_editor(p_business_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case
    when not public.can_configure_business(p_business_id) then null
    else jsonb_build_object(
      'company', jsonb_build_object(
        'display_name', coalesce(nullif(profile.display_name, ''), b.name),
        'logo_url', coalesce(profile.logo_url, '')
      ),
      'business', jsonb_build_object(
        'id', b.id,
        'slug', b.slug,
        'name', b.name,
        'default_locale', b.default_locale,
        'default_currency', b.default_currency
      ),
      'site', jsonb_build_object(
        'is_published', settings.is_published,
        'primary_locale', settings.primary_locale,
        'published_at', settings.published_at,
        'logo_draft_url', settings.draft_logo_url,
        'logo_published_url', settings.published_logo_url
      ),
      'services', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', service.id,
            'slug', service.slug,
            'kind', service.kind,
            'title', service.title,
            'description', service.description,
            'pricing_model', service.pricing_model,
            'price_minor', service.price_minor,
            'currency', service.currency,
            'duration_min_minutes', service.duration_min_minutes,
            'duration_max_minutes', service.duration_max_minutes,
            'capacity', service.capacity,
            'requires_confirmation', service.requires_confirmation
          )
          order by service.sort_order, service.title, service.id
        )
        from public.services service
        where service.business_id = b.id
          and service.is_active
          and service.is_public
      ), '[]'::jsonb),
      'portfolio', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'id', project.id,
            'slug', project.slug,
            'title', project.title,
            'description', project.description,
            'category', category.name,
            'image_url', media.image_url,
            'image_alt', coalesce(nullif(media.alt_text, ''), project.title),
            'width', media.width,
            'height', media.height,
            'images', coalesce((
              select jsonb_agg(
                jsonb_build_object(
                  'id', project_image.id,
                  'image_url', project_media.image_url,
                  'image_alt', coalesce(
                    nullif(project_media.alt_text, ''),
                    project.title
                  ),
                  'width', project_media.width,
                  'height', project_media.height
                )
                order by project_image.sort_order, project_image.id
              )
              from public.portfolio_project_images project_image
              join public.media_library project_media
                on project_media.id = project_image.media_id
                and project_media.business_id = project_image.business_id
                and project_media.is_active
              where project_image.business_id = project.business_id
                and project_image.project_id = project.id
                and project_image.is_active
            ), '[]'::jsonb)
          )
          order by project.sort_order, project.created_at desc, project.id
        )
        from public.portfolio_projects project
        join public.portfolio_categories category
          on category.id = project.category_id
          and category.business_id = project.business_id
          and category.is_active
        left join public.media_library media
          on media.id = project.cover_media_id
          and media.business_id = project.business_id
          and media.is_active
        where project.business_id = b.id
          and project.is_active
      ), '[]'::jsonb),
      'locales', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'locale', locale_row.locale,
            'draft_content', locale_row.draft_content,
            'published_content', locale_row.published_content,
            'published_at', locale_row.published_at
          )
          order by (locale_row.locale = settings.primary_locale) desc, locale_row.locale
        )
        from public.public_site_locales locale_row
        where locale_row.business_id = b.id
      ), '[]'::jsonb)
    )
  end
  from public.businesses b
  join public.public_site_settings settings on settings.business_id = b.id
  left join public.company_profiles profile on profile.business_id = b.id
  where b.id = p_business_id
  limit 1;
$$;

create or replace function public.get_public_site(
  p_business_slug text,
  p_locale text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  business_row public.businesses%rowtype;
  site_row public.public_site_settings%rowtype;
  requested_locale text;
  locale_row public.public_site_locales%rowtype;
  content jsonb;
  company jsonb;
  services jsonb := '[]'::jsonb;
  projects jsonb := '[]'::jsonb;
  enabled_modules jsonb := '[]'::jsonb;
  catalog_enabled boolean := false;
  portfolio_enabled boolean := false;
  scheduling_enabled boolean := false;
begin
  select b.* into business_row
  from public.businesses b
  where b.slug = lower(trim(coalesce(p_business_slug, '')))
    and b.status = 'active'
  limit 1;

  if business_row.id is null then return null; end if;

  select settings.* into site_row
  from public.public_site_settings settings
  where settings.business_id = business_row.id
    and settings.is_published = true;

  if site_row.business_id is null then return null; end if;

  requested_locale := lower(trim(coalesce(p_locale, site_row.primary_locale)));
  if requested_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then return null; end if;

  select locale_data.* into locale_row
  from public.public_site_locales locale_data
  where locale_data.business_id = business_row.id
    and locale_data.locale = requested_locale
    and locale_data.published_content is not null;

  if locale_row.business_id is null and requested_locale <> site_row.primary_locale then
    select locale_data.* into locale_row
    from public.public_site_locales locale_data
    where locale_data.business_id = business_row.id
      and locale_data.locale = site_row.primary_locale
      and locale_data.published_content is not null;
  end if;

  if locale_row.business_id is null then return null; end if;
  content := locale_row.published_content;

  select coalesce(jsonb_agg(module.module_key order by module.module_key), '[]'::jsonb)
    into enabled_modules
  from public.business_modules module
  where module.business_id = business_row.id and module.enabled;

  catalog_enabled := enabled_modules ? 'catalog';
  portfolio_enabled := enabled_modules ? 'portfolio';
  scheduling_enabled := enabled_modules ? 'scheduling';

  select jsonb_build_object(
    'display_name', coalesce(nullif(profile.display_name, ''), business_row.name),
    'email', profile.email,
    'phone', profile.phone,
    'address', profile.address,
    'website_url', profile.website_url,
    'logo_url', site_row.published_logo_url
  ) into company
  from public.company_profiles profile
  where profile.business_id = business_row.id;

  if company is null then
    company := jsonb_build_object(
      'display_name', business_row.name,
      'logo_url', site_row.published_logo_url
    );
  end if;

  if coalesce((content->>'show_services')::boolean, true) and catalog_enabled then
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', service.id,
        'slug', service.slug,
        'kind', service.kind,
        'title', service.title,
        'description', service.description,
        'pricing_model', service.pricing_model,
        'price_minor', service.price_minor,
        'currency', service.currency,
        'duration_min_minutes', service.duration_min_minutes,
        'duration_max_minutes', service.duration_max_minutes,
        'capacity', service.capacity,
        'requires_confirmation', service.requires_confirmation
      )
      order by service.sort_order, service.title, service.id
    ), '[]'::jsonb) into services
    from public.services service
    where service.business_id = business_row.id
      and service.is_public
      and service.is_active;
  end if;

  if coalesce((content->>'show_portfolio')::boolean, true) and portfolio_enabled then
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', project.id,
        'slug', project.slug,
        'title', project.title,
        'description', project.description,
        'category', category.name,
        'image_url', media.image_url,
        'image_alt', coalesce(nullif(media.alt_text, ''), project.title),
        'width', media.width,
        'height', media.height,
        'images', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', project_image.id,
              'image_url', project_media.image_url,
              'image_alt', coalesce(
                nullif(project_media.alt_text, ''),
                project.title
              ),
              'width', project_media.width,
              'height', project_media.height
            )
            order by project_image.sort_order, project_image.id
          )
          from public.portfolio_project_images project_image
          join public.media_library project_media
            on project_media.id = project_image.media_id
            and project_media.business_id = project_image.business_id
            and project_media.is_active
          where project_image.business_id = project.business_id
            and project_image.project_id = project.id
            and project_image.is_active
        ), '[]'::jsonb)
      )
      order by project.sort_order, project.created_at desc, project.id
    ), '[]'::jsonb) into projects
    from public.portfolio_projects project
    join public.portfolio_categories category
      on category.id = project.category_id
      and category.business_id = project.business_id
      and category.is_active
    left join public.media_library media
      on media.id = project.cover_media_id
      and media.business_id = project.business_id
      and media.is_active
    where project.business_id = business_row.id
      and project.is_active;
  end if;

  return jsonb_build_object(
    'business', jsonb_build_object(
      'id', business_row.id,
      'slug', business_row.slug,
      'name', business_row.name,
      'locale', locale_row.locale,
      'primary_locale', site_row.primary_locale,
      'currency', business_row.default_currency,
      'timezone', business_row.timezone
    ),
    'content', content,
    'company', coalesce(company, '{}'::jsonb),
    'services', services,
    'portfolio', projects,
    'capabilities', jsonb_build_object(
      'booking', scheduling_enabled,
      'catalog', catalog_enabled,
      'portfolio', portfolio_enabled
    ),
    'available_locales', coalesce((
      select jsonb_agg(locale_data.locale order by (locale_data.locale = site_row.primary_locale) desc, locale_data.locale)
      from public.public_site_locales locale_data
      where locale_data.business_id = business_row.id
        and locale_data.published_content is not null
    ), '[]'::jsonb),
    'published_at', site_row.published_at
  );
end;
$$;

revoke all on function public.get_public_site(text, text)
from public, anon, authenticated;

grant execute on function public.get_public_site(text, text)
to anon, authenticated;

revoke all on function public.get_public_site_editor(uuid)
from public, anon, authenticated;

grant execute on function public.get_public_site_editor(uuid)
to authenticated;

comment on function public.save_public_site_draft_v22(uuid, text, jsonb, boolean) is
  'Normalizes and saves public-site drafts with hero, contacts, services, portfolio presentation, club and gift fields without exceeding PostgreSQL argument limits.';

comment on function public.get_public_site_editor(uuid) is
  'Returns editable public-site content plus canonical catalog services and portfolio projects, including ordered project images, for the visual builder.';

comment on function public.get_public_site(text, text) is
  'Returns the published public site with ordered portfolio project galleries.';
