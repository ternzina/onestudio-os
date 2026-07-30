-- OneStudio OS Site Templates: GLOSS 1.0
-- Extends public site content with theme tokens and reusable editorial blocks.

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

  normalized_content := jsonb_set(normalized_content, '{section_order}', requested_order, true);

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

revoke all on function public.normalize_public_site_content(text, text, jsonb)
from public, anon, authenticated;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean)
from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
to authenticated;
