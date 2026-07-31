-- OneStudio OS
-- Public site logo draft/publish hotfix.
-- Keeps logo edits in a global site draft and promotes them only on publish.

alter table public.public_site_settings
  add column if not exists draft_logo_url text not null default '',
  add column if not exists published_logo_url text not null default '';

update public.public_site_settings settings
set draft_logo_url = coalesce(profile.logo_url, ''),
    published_logo_url = case
      when settings.is_published then coalesce(profile.logo_url, '')
      else ''
    end,
    updated_at = now()
from public.company_profiles profile
where profile.business_id = settings.business_id
  and settings.draft_logo_url = ''
  and settings.published_logo_url = '';

create or replace function public.save_public_site_logo_draft(
  p_business_id uuid,
  p_logo_url text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_logo_url text := public.normalize_public_site_media_url(p_logo_url);
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'public_site_configuration_forbidden' using errcode = '42501';
  end if;

  update public.public_site_settings
  set draft_logo_url = v_logo_url,
      updated_at = now()
  where business_id = p_business_id;

  if not found then
    raise exception 'public_site_settings_not_found' using errcode = '23503';
  end if;

  return v_logo_url;
end;
$$;

create or replace function public.publish_public_site(
  p_business_id uuid,
  p_locale text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_locale text := lower(trim(coalesce(p_locale, '')));
  published jsonb;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'public_site_publication_forbidden' using errcode = '42501';
  end if;

  update public.public_site_locales
  set published_content = draft_content,
      published_at = now(),
      updated_at = now()
  where business_id = p_business_id
    and locale = normalized_locale
  returning published_content into published;

  if published is null then
    raise exception 'public_site_locale_not_found' using errcode = '23503';
  end if;

  update public.public_site_settings
  set is_published = true,
      published_logo_url = draft_logo_url,
      published_at = now(),
      updated_at = now()
  where business_id = p_business_id;

  return published;
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
        'height', media.height
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

revoke all on function public.save_public_site_logo_draft(uuid, text)
from public, anon, authenticated;

grant execute on function public.save_public_site_logo_draft(uuid, text)
to authenticated;

revoke all on function public.get_public_site_editor(uuid)
from public, anon, authenticated;

grant execute on function public.get_public_site_editor(uuid)
to authenticated;

revoke all on function public.publish_public_site(uuid, text)
from public, anon, authenticated;

grant execute on function public.publish_public_site(uuid, text)
to authenticated;

revoke all on function public.get_public_site(text, text)
from public, anon, authenticated;

grant execute on function public.get_public_site(text, text)
to anon, authenticated;

comment on function public.save_public_site_logo_draft(uuid, text) is
  'Saves the global public-site logo draft without changing the published logo.';
