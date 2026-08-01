-- OneStudio OS
-- Services save runtime hotfix 1.0.
--
-- The services presentation migration expanded one jsonb_build_object call
-- beyond PostgreSQL's function-argument limit. Split the normalized draft
-- into two JSONB objects and keep the legacy save RPC delegated to v22.

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

create or replace function public.save_public_site_draft(
  p_business_id uuid,
  p_locale text,
  p_content jsonb,
  p_make_primary boolean default false
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select public.save_public_site_draft_v22(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );
$$;

revoke all on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) from public, anon, authenticated;

grant execute on function public.save_public_site_draft(
  uuid,
  text,
  jsonb,
  boolean
) to authenticated;

comment on function public.save_public_site_draft_v22(uuid, text, jsonb, boolean) is
  'Normalizes and saves public-site drafts with hero, contacts, club, gifts, and service presentation fields without exceeding PostgreSQL argument limits.';

comment on function public.save_public_site_draft(uuid, text, jsonb, boolean) is
  'Compatibility entry point delegated to the runtime-safe save_public_site_draft_v22 implementation.';
