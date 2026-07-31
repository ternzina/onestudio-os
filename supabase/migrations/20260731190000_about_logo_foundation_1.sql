-- OneStudio OS
-- About section + canonical company logo foundation.
-- Adds structured About content to the existing section and exposes the
-- existing company_profiles.logo_url to the site editor.

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
    'map_query', left(
      regexp_replace(
        trim(coalesce(p_content->>'map_query', '')),
        '[[:cntrl:]]',
        '',
        'g'
      ),
      300
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
  left join public.company_profiles profile on profile.business_id = b.id
  where b.id = p_business_id
  limit 1;
$$;

revoke all on function public.get_public_site_editor(uuid)
from public, anon, authenticated;

grant execute on function public.get_public_site_editor(uuid)
to authenticated;

revoke all on function public.save_public_site_draft_v22(
  uuid,
  text,
  jsonb,
  boolean
) from public, anon, authenticated;

comment on function public.save_public_site_draft_v22(
  uuid,
  text,
  jsonb,
  boolean
) is
  'Persists public-site drafts including about media, facts, CTA, club and gift cards.';
