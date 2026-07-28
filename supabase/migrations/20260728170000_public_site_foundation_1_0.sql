-- OneStudio OS Public Site Foundation 1.0
-- Published workspace storefronts, locale drafts, SEO and tenant-safe portfolio media.

-- ---------------------------------------------------------------------------
-- Finish tenant isolation for the legacy Media and Portfolio tables.
-- Existing records belong to the stable installation workspace.
-- ---------------------------------------------------------------------------

alter table public.media_library
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.portfolio_categories
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.portfolio_category_images
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.portfolio_projects
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.portfolio_project_images
  add column if not exists business_id uuid references public.businesses(id) on delete cascade;

update public.media_library
set business_id = '00000000-0000-4000-8000-000000000001'
where business_id is null;

update public.portfolio_categories
set business_id = '00000000-0000-4000-8000-000000000001'
where business_id is null;

update public.portfolio_projects project
set business_id = category.business_id
from public.portfolio_categories category
where project.category_id = category.id
  and project.business_id is null;

update public.portfolio_category_images link
set business_id = category.business_id
from public.portfolio_categories category
where link.category_id = category.id
  and link.business_id is null;

update public.portfolio_project_images link
set business_id = project.business_id
from public.portfolio_projects project
where link.project_id = project.id
  and link.business_id is null;

alter table public.media_library alter column business_id set not null;
alter table public.portfolio_categories alter column business_id set not null;
alter table public.portfolio_category_images alter column business_id set not null;
alter table public.portfolio_projects alter column business_id set not null;
alter table public.portfolio_project_images alter column business_id set not null;

alter table public.media_library
  add constraint media_library_id_business_unique unique (id, business_id);
alter table public.portfolio_categories
  add constraint portfolio_categories_id_business_unique unique (id, business_id);
alter table public.portfolio_projects
  add constraint portfolio_projects_id_business_unique unique (id, business_id);

alter table public.portfolio_categories
  drop constraint if exists portfolio_categories_slug_key;
alter table public.portfolio_categories
  add constraint portfolio_categories_business_slug_unique unique (business_id, slug);

alter table public.portfolio_projects
  drop constraint if exists portfolio_projects_slug_key;
alter table public.portfolio_projects
  add constraint portfolio_projects_business_slug_unique unique (business_id, slug);

alter table public.portfolio_category_images
  drop constraint if exists portfolio_category_images_category_id_fkey;
alter table public.portfolio_category_images
  drop constraint if exists portfolio_category_images_media_id_fkey;
alter table public.portfolio_category_images
  add constraint portfolio_category_images_category_business_fkey
    foreign key (category_id, business_id)
    references public.portfolio_categories(id, business_id) on delete cascade;
alter table public.portfolio_category_images
  add constraint portfolio_category_images_media_business_fkey
    foreign key (media_id, business_id)
    references public.media_library(id, business_id) on delete cascade;

alter table public.portfolio_projects
  drop constraint if exists portfolio_projects_category_id_fkey;
alter table public.portfolio_projects
  drop constraint if exists portfolio_projects_cover_media_id_fkey;
alter table public.portfolio_projects
  add constraint portfolio_projects_category_business_fkey
    foreign key (category_id, business_id)
    references public.portfolio_categories(id, business_id) on delete restrict;
alter table public.portfolio_projects
  add constraint portfolio_projects_cover_media_business_fkey
    foreign key (cover_media_id, business_id)
    references public.media_library(id, business_id) on delete set null (cover_media_id);

alter table public.portfolio_project_images
  drop constraint if exists portfolio_project_images_project_id_fkey;
alter table public.portfolio_project_images
  drop constraint if exists portfolio_project_images_media_id_fkey;
alter table public.portfolio_project_images
  add constraint portfolio_project_images_project_business_fkey
    foreign key (project_id, business_id)
    references public.portfolio_projects(id, business_id) on delete cascade;
alter table public.portfolio_project_images
  add constraint portfolio_project_images_media_business_fkey
    foreign key (media_id, business_id)
    references public.media_library(id, business_id) on delete cascade;

create index if not exists media_library_business_created_idx
  on public.media_library (business_id, created_at desc);
create index if not exists portfolio_categories_business_order_idx
  on public.portfolio_categories (business_id, is_active, sort_order);
create index if not exists portfolio_projects_business_order_idx
  on public.portfolio_projects (business_id, is_active, sort_order, created_at desc);
create index if not exists portfolio_category_images_business_idx
  on public.portfolio_category_images (business_id, category_id, sort_order);
create index if not exists portfolio_project_images_business_idx
  on public.portfolio_project_images (business_id, project_id, sort_order);

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'media_library',
        'portfolio_categories',
        'portfolio_category_images',
        'portfolio_projects',
        'portfolio_project_images'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end;
$$;

create policy "Workspace members read media" on public.media_library
for select to authenticated
using (public.can_view_business(business_id));

create policy "Workspace managers manage media" on public.media_library
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Workspace members read portfolio categories" on public.portfolio_categories
for select to authenticated
using (public.can_view_business(business_id));

create policy "Workspace managers manage portfolio categories" on public.portfolio_categories
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Workspace members read portfolio category media" on public.portfolio_category_images
for select to authenticated
using (public.can_view_business(business_id));

create policy "Workspace managers manage portfolio category media" on public.portfolio_category_images
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Workspace members read portfolio projects" on public.portfolio_projects
for select to authenticated
using (public.can_view_business(business_id));

create policy "Workspace managers manage portfolio projects" on public.portfolio_projects
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "Workspace members read portfolio project media" on public.portfolio_project_images
for select to authenticated
using (public.can_view_business(business_id));

create policy "Workspace managers manage portfolio project media" on public.portfolio_project_images
for all to authenticated
using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

revoke all on table public.media_library from anon;
revoke all on table public.portfolio_categories from anon;
revoke all on table public.portfolio_category_images from anon;
revoke all on table public.portfolio_projects from anon;
revoke all on table public.portfolio_project_images from anon;

grant select, insert, update, delete on table public.media_library to authenticated;
grant select, insert, update, delete on table public.portfolio_categories to authenticated;
grant select, insert, update, delete on table public.portfolio_category_images to authenticated;
grant select, insert, update, delete on table public.portfolio_projects to authenticated;
grant select, insert, update, delete on table public.portfolio_project_images to authenticated;

-- ---------------------------------------------------------------------------
-- Draft and published public-site state.
-- Anonymous visitors never receive direct access to these tables.
-- ---------------------------------------------------------------------------

create table public.public_site_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  is_published boolean not null default false,
  primary_locale text not null
    check (primary_locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.public_site_locales (
  business_id uuid not null references public.businesses(id) on delete cascade,
  locale text not null check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  draft_content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(draft_content) = 'object'),
  published_content jsonb
    check (published_content is null or jsonb_typeof(published_content) = 'object'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (business_id, locale)
);

create index public_site_locales_published_idx
  on public.public_site_locales (business_id, locale, published_at)
  where published_content is not null;

alter table public.public_site_settings enable row level security;
alter table public.public_site_locales enable row level security;

revoke all on table public.public_site_settings from public, anon, authenticated;
revoke all on table public.public_site_locales from public, anon, authenticated;
grant all on table public.public_site_settings to service_role;
grant all on table public.public_site_locales to service_role;

create trigger public_site_settings_set_updated_at
before update on public.public_site_settings
for each row execute function public.set_updated_at();

create trigger public_site_locales_set_updated_at
before update on public.public_site_locales
for each row execute function public.set_updated_at();

create or replace function public.default_public_site_content(
  p_business_name text,
  p_locale text
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  safe_name text := trim(coalesce(p_business_name, ''));
  locale_base text := split_part(lower(coalesce(p_locale, 'en')), '-', 1);
begin
  if locale_base = 'ru' then
    return jsonb_build_object(
      'hero_eyebrow', 'Добро пожаловать',
      'hero_title', safe_name,
      'hero_text', 'Услуги, работы и удобная запись — в одном месте.',
      'about_title', 'О нас',
      'about_text', 'Расскажите здесь, чем ваш бизнес отличается и почему клиенты выбирают вас.',
      'services_title', 'Услуги',
      'portfolio_title', 'Наши работы',
      'contact_title', 'Контакты',
      'booking_label', 'Записаться',
      'services_label', 'Услуги',
      'portfolio_label', 'Портфолио',
      'about_label', 'О нас',
      'contact_label', 'Контакты',
      'show_services', true,
      'show_portfolio', true,
      'show_about', true,
      'show_contact', true,
      'seo_title', safe_name,
      'seo_description', 'Услуги, портфолио, контакты и онлайн-запись.'
    );
  elsif locale_base = 'uk' then
    return jsonb_build_object(
      'hero_eyebrow', 'Ласкаво просимо',
      'hero_title', safe_name,
      'hero_text', 'Послуги, роботи та зручний запис — в одному місці.',
      'about_title', 'Про нас',
      'about_text', 'Розкажіть тут, чим ваш бізнес відрізняється і чому клієнти обирають вас.',
      'services_title', 'Послуги',
      'portfolio_title', 'Наші роботи',
      'contact_title', 'Контакти',
      'booking_label', 'Записатися',
      'services_label', 'Послуги',
      'portfolio_label', 'Портфоліо',
      'about_label', 'Про нас',
      'contact_label', 'Контакти',
      'show_services', true,
      'show_portfolio', true,
      'show_about', true,
      'show_contact', true,
      'seo_title', safe_name,
      'seo_description', 'Послуги, портфоліо, контакти та онлайн-запис.'
    );
  elsif locale_base = 'pl' then
    return jsonb_build_object(
      'hero_eyebrow', 'Witamy',
      'hero_title', safe_name,
      'hero_text', 'Usługi, realizacje i wygodna rezerwacja w jednym miejscu.',
      'about_title', 'O nas',
      'about_text', 'Opowiedz tutaj, co wyróżnia Twoją firmę i dlaczego klienci ją wybierają.',
      'services_title', 'Usługi',
      'portfolio_title', 'Nasze realizacje',
      'contact_title', 'Kontakt',
      'booking_label', 'Zarezerwuj',
      'services_label', 'Usługi',
      'portfolio_label', 'Portfolio',
      'about_label', 'O nas',
      'contact_label', 'Kontakt',
      'show_services', true,
      'show_portfolio', true,
      'show_about', true,
      'show_contact', true,
      'seo_title', safe_name,
      'seo_description', 'Usługi, portfolio, kontakt i rezerwacja online.'
    );
  else
    return jsonb_build_object(
      'hero_eyebrow', 'Welcome',
      'hero_title', safe_name,
      'hero_text', 'Services, selected work and simple online booking in one place.',
      'about_title', 'About',
      'about_text', 'Tell visitors what makes your business different and why clients choose you.',
      'services_title', 'Services',
      'portfolio_title', 'Selected work',
      'contact_title', 'Contact',
      'booking_label', 'Book now',
      'services_label', 'Services',
      'portfolio_label', 'Portfolio',
      'about_label', 'About',
      'contact_label', 'Contact',
      'show_services', true,
      'show_portfolio', true,
      'show_about', true,
      'show_contact', true,
      'seo_title', safe_name,
      'seo_description', 'Services, portfolio, contact details and online booking.'
    );
  end if;
end;
$$;

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
    'hero_eyebrow', left(trim(coalesce(nullif(content->>'hero_eyebrow', ''), defaults->>'hero_eyebrow')), 80),
    'hero_title', left(trim(coalesce(nullif(content->>'hero_title', ''), defaults->>'hero_title')), 140),
    'hero_text', left(trim(coalesce(content->>'hero_text', defaults->>'hero_text')), 500),
    'about_title', left(trim(coalesce(nullif(content->>'about_title', ''), defaults->>'about_title')), 120),
    'about_text', left(trim(coalesce(content->>'about_text', defaults->>'about_text')), 3000),
    'services_title', left(trim(coalesce(nullif(content->>'services_title', ''), defaults->>'services_title')), 120),
    'portfolio_title', left(trim(coalesce(nullif(content->>'portfolio_title', ''), defaults->>'portfolio_title')), 120),
    'contact_title', left(trim(coalesce(nullif(content->>'contact_title', ''), defaults->>'contact_title')), 120),
    'booking_label', left(trim(coalesce(nullif(content->>'booking_label', ''), defaults->>'booking_label')), 60),
    'services_label', left(trim(coalesce(nullif(content->>'services_label', ''), defaults->>'services_label')), 60),
    'portfolio_label', left(trim(coalesce(nullif(content->>'portfolio_label', ''), defaults->>'portfolio_label')), 60),
    'about_label', left(trim(coalesce(nullif(content->>'about_label', ''), defaults->>'about_label')), 60),
    'contact_label', left(trim(coalesce(nullif(content->>'contact_label', ''), defaults->>'contact_label')), 60),
    'show_services', case
      when jsonb_typeof(content->'show_services') = 'boolean' then (content->>'show_services')::boolean
      else (defaults->>'show_services')::boolean
    end,
    'show_portfolio', case
      when jsonb_typeof(content->'show_portfolio') = 'boolean' then (content->>'show_portfolio')::boolean
      else (defaults->>'show_portfolio')::boolean
    end,
    'show_about', case
      when jsonb_typeof(content->'show_about') = 'boolean' then (content->>'show_about')::boolean
      else (defaults->>'show_about')::boolean
    end,
    'show_contact', case
      when jsonb_typeof(content->'show_contact') = 'boolean' then (content->>'show_contact')::boolean
      else (defaults->>'show_contact')::boolean
    end,
    'seo_title', left(trim(coalesce(nullif(content->>'seo_title', ''), defaults->>'seo_title')), 70),
    'seo_description', left(trim(coalesce(nullif(content->>'seo_description', ''), defaults->>'seo_description')), 170)
  );
end;
$$;

create or replace function public.ensure_public_site_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.public_site_settings (business_id, primary_locale)
  values (new.id, new.default_locale)
  on conflict (business_id) do nothing;

  insert into public.public_site_locales (business_id, locale, draft_content)
  values (
    new.id,
    new.default_locale,
    public.default_public_site_content(new.name, new.default_locale)
  )
  on conflict (business_id, locale) do nothing;

  return new;
end;
$$;

create trigger businesses_ensure_public_site
after insert on public.businesses
for each row execute function public.ensure_public_site_workspace();

create or replace function public.refresh_unpublished_public_site_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  settings_row public.public_site_settings%rowtype;
  old_draft jsonb;
begin
  if old.name = new.name and old.default_locale = new.default_locale then
    return new;
  end if;

  select settings.* into settings_row
  from public.public_site_settings settings
  where settings.business_id = new.id;

  if settings_row.business_id is null or settings_row.is_published then
    return new;
  end if;

  select locale_data.draft_content into old_draft
  from public.public_site_locales locale_data
  where locale_data.business_id = new.id
    and locale_data.locale = settings_row.primary_locale
    and locale_data.published_content is null;

  if old_draft is distinct from public.default_public_site_content(old.name, old.default_locale) then
    return new;
  end if;

  delete from public.public_site_locales
  where business_id = new.id
    and locale = settings_row.primary_locale
    and published_content is null;

  insert into public.public_site_locales (business_id, locale, draft_content)
  values (
    new.id,
    new.default_locale,
    public.default_public_site_content(new.name, new.default_locale)
  )
  on conflict (business_id, locale) do update
  set draft_content = excluded.draft_content,
      updated_at = now();

  update public.public_site_settings
  set primary_locale = new.default_locale,
      updated_at = now()
  where business_id = new.id;

  return new;
end;
$$;

create trigger businesses_refresh_unpublished_public_site
after update of name, default_locale on public.businesses
for each row execute function public.refresh_unpublished_public_site_identity();

insert into public.public_site_settings (business_id, primary_locale)
select b.id, b.default_locale
from public.businesses b
on conflict (business_id) do nothing;

insert into public.public_site_locales (business_id, locale, draft_content)
select
  b.id,
  b.default_locale,
  public.default_public_site_content(b.name, b.default_locale)
from public.businesses b
on conflict (business_id, locale) do nothing;

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
        'published_at', settings.published_at
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
  where b.id = p_business_id
  limit 1;
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
      published_at = now(),
      updated_at = now()
  where business_id = p_business_id;

  return published;
end;
$$;

create or replace function public.unpublish_public_site(p_business_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'public_site_publication_forbidden' using errcode = '42501';
  end if;

  update public.public_site_settings
  set is_published = false,
      updated_at = now()
  where business_id = p_business_id;

  return found;
end;
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
    'logo_url', profile.logo_url
  ) into company
  from public.company_profiles profile
  where profile.business_id = business_row.id;

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

create or replace function public.list_public_site_paths()
returns table (
  business_slug text,
  locale text,
  is_primary boolean,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    business.slug,
    locale_data.locale,
    locale_data.locale = settings.primary_locale,
    greatest(settings.updated_at, locale_data.updated_at)
  from public.public_site_settings settings
  join public.businesses business on business.id = settings.business_id
  join public.public_site_locales locale_data on locale_data.business_id = settings.business_id
  where settings.is_published
    and business.status = 'active'
    and locale_data.published_content is not null
  order by
    business.slug,
    (locale_data.locale = settings.primary_locale) desc,
    locale_data.locale;
$$;

-- The clean-base default privileges grant new functions directly to anon and
-- authenticated. Revoke those explicit grants as well as PUBLIC, then expose
-- only the intended API below.
revoke all on function public.default_public_site_content(text, text) from public, anon, authenticated;
revoke all on function public.normalize_public_site_content(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.ensure_public_site_workspace() from public, anon, authenticated;
revoke all on function public.refresh_unpublished_public_site_identity() from public, anon, authenticated;
revoke all on function public.get_public_site_editor(uuid) from public, anon, authenticated;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean) from public, anon, authenticated;
revoke all on function public.publish_public_site(uuid, text) from public, anon, authenticated;
revoke all on function public.unpublish_public_site(uuid) from public, anon, authenticated;
revoke all on function public.get_public_site(text, text) from public, anon, authenticated;
revoke all on function public.list_public_site_paths() from public, anon, authenticated;

grant execute on function public.get_public_site_editor(uuid) to authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean) to authenticated;
grant execute on function public.publish_public_site(uuid, text) to authenticated;
grant execute on function public.unpublish_public_site(uuid) to authenticated;
grant execute on function public.get_public_site(text, text) to anon, authenticated;
grant execute on function public.list_public_site_paths() to anon, authenticated;

-- Record the new public-site capability without creating an eleventh optional module.
update public.business_modules
set config = config || jsonb_build_object('public_site_foundation', true),
    updated_at = now()
where module_key = 'core';
