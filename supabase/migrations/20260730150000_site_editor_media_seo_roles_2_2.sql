-- OneStudio OS Site Editor 2.2
-- Fixes the ambiguous `value` identifier that blocked every draft save.
-- Adds sliders, video blocks, editable map fields, page-level SEO and
-- protected workspace member role management.

create or replace function public.normalize_public_site_media_urls(p_values jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_item jsonb;
  v_normalized_value text;
  v_result jsonb := '[]'::jsonb;
  v_item_count integer := 0;
begin
  if jsonb_typeof(p_values) <> 'array' then
    return v_result;
  end if;

  for v_item in
    select media_element
    from jsonb_array_elements(p_values) as media_items(media_element)
  loop
    exit when v_item_count >= 12;
    v_normalized_value := public.normalize_public_site_media_url(
      case
        when jsonb_typeof(v_item) = 'string' then v_item #>> '{}'
        else ''
      end
    );
    v_result := v_result || jsonb_build_array(v_normalized_value);
    v_item_count := v_item_count + 1;
  end loop;

  return v_result;
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
  v_item jsonb;
  v_result jsonb := '[]'::jsonb;
  v_block_id text;
  v_block_kind text;
  v_block_tone text;
  v_block_url text;
  v_video_url text;
  v_video_poster_url text;
  v_slide_interval integer;
  v_seen_ids text[] := '{}'::text[];
  v_item_count integer := 0;
begin
  if jsonb_typeof(p_blocks) <> 'array' then
    return v_result;
  end if;

  for v_item in
    select block_element
    from jsonb_array_elements(p_blocks) as block_items(block_element)
  loop
    exit when v_item_count >= 12;
    if jsonb_typeof(v_item) <> 'object' then
      continue;
    end if;

    v_block_id := lower(trim(coalesce(v_item->>'id', '')));
    if v_block_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      v_block_id := 'block-' || (v_item_count + 1)::text;
    end if;
    v_block_id := left(v_block_id, 72);
    if v_block_id = any(v_seen_ids) then
      continue;
    end if;

    v_block_kind := case
      when v_item->>'kind' in ('text', 'features', 'cta', 'slider', 'video')
        then v_item->>'kind'
      else 'text'
    end;
    v_block_tone := case
      when v_item->>'tone' in ('light', 'accent', 'dark')
        then v_item->>'tone'
      else 'light'
    end;
    v_block_url := trim(coalesce(v_item->>'button_url', ''));
    if v_block_url !~ '^(#[A-Za-z0-9_-]+|/[A-Za-z0-9_/?&=.#%:-]*|https://[^[:space:]]+)$' then
      v_block_url := '';
    end if;

    begin
      v_slide_interval := greatest(
        2,
        least(30, coalesce((v_item->>'slide_interval_seconds')::integer, 4))
      );
    exception when others then
      v_slide_interval := 4;
    end;

    v_video_url := public.normalize_public_site_media_url(
      v_item->>'video_url'
    );
    v_video_poster_url := public.normalize_public_site_media_url(
      v_item->>'video_poster_url'
    );

    v_result := v_result || jsonb_build_array(
      jsonb_build_object(
        'id', v_block_id,
        'kind', v_block_kind,
        'eyebrow', left(trim(coalesce(v_item->>'eyebrow', '')), 100),
        'title', left(trim(coalesce(v_item->>'title', '')), 180),
        'text', left(trim(coalesce(v_item->>'text', '')), 4000),
        'items', left(trim(coalesce(v_item->>'items', '')), 5000),
        'button_label', left(trim(coalesce(v_item->>'button_label', '')), 80),
        'button_url', left(v_block_url, 500),
        'tone', v_block_tone,
        'is_visible', case
          when jsonb_typeof(v_item->'is_visible') = 'boolean'
            then (v_item->>'is_visible')::boolean
          else true
        end,
        'media_urls', public.normalize_public_site_media_urls(
          v_item->'media_urls'
        ),
        'slide_interval_seconds', v_slide_interval,
        'video_url', v_video_url,
        'video_poster_url', v_video_poster_url
      )
    );
    v_seen_ids := array_append(v_seen_ids, v_block_id);
    v_item_count := v_item_count + 1;
  end loop;

  return v_result;
end;
$$;

create or replace function public.normalize_public_site_pages(p_pages jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_item jsonb;
  v_result jsonb := '[]'::jsonb;
  v_page_type text;
  v_page_slug text;
  v_page_id text;
  v_seen_slugs text[] := '{}'::text[];
  v_custom_count integer := 0;
  v_portfolio_added boolean := false;
begin
  if jsonb_typeof(p_pages) <> 'array' then
    return v_result;
  end if;

  for v_item in
    select page_element
    from jsonb_array_elements(p_pages) as page_items(page_element)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      continue;
    end if;
    v_page_type := v_item->>'type';

    if v_page_type = 'portfolio' and not v_portfolio_added then
      v_page_slug := case
        when coalesce(v_item->>'slug', '') ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
          then left(v_item->>'slug', 60)
        else 'portfolio'
      end;
      if v_page_slug = any(v_seen_slugs) then
        continue;
      end if;

      v_result := v_result || jsonb_build_array(
        jsonb_build_object(
          'id', 'portfolio',
          'type', 'portfolio',
          'slug', v_page_slug,
          'nav_label', left(trim(coalesce(nullif(v_item->>'nav_label', ''), 'Portfolio')), 60),
          'eyebrow', left(trim(coalesce(v_item->>'eyebrow', 'Selected works')), 100),
          'title', left(trim(coalesce(nullif(v_item->>'title', ''), 'Portfolio')), 160),
          'intro', left(trim(coalesce(v_item->>'intro', '')), 1000),
          'is_visible', case
            when jsonb_typeof(v_item->'is_visible') = 'boolean'
              then (v_item->>'is_visible')::boolean
            else true
          end,
          'show_in_navigation', case
            when jsonb_typeof(v_item->'show_in_navigation') = 'boolean'
              then (v_item->>'show_in_navigation')::boolean
            else true
          end,
          'show_booking_cta', case
            when jsonb_typeof(v_item->'show_booking_cta') = 'boolean'
              then (v_item->>'show_booking_cta')::boolean
            else true
          end,
          'seo_title', left(trim(coalesce(v_item->>'seo_title', '')), 70),
          'seo_description', left(trim(coalesce(v_item->>'seo_description', '')), 170),
          'seo_image_url', public.normalize_public_site_media_url(
            v_item->>'seo_image_url'
          ),
          'seo_no_index', case
            when jsonb_typeof(v_item->'seo_no_index') = 'boolean'
              then (v_item->>'seo_no_index')::boolean
            else false
          end
        )
      );
      v_portfolio_added := true;
      v_seen_slugs := array_append(v_seen_slugs, v_page_slug);
      continue;
    end if;

    if v_page_type <> 'custom' or v_custom_count >= 6 then
      continue;
    end if;

    v_page_slug := lower(trim(coalesce(v_item->>'slug', '')));
    if v_page_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      or v_page_slug in ('portfolio', 'p')
    then
      v_page_slug := 'page-' || (v_custom_count + 1)::text;
    end if;
    v_page_slug := left(v_page_slug, 60);
    if v_page_slug = any(v_seen_slugs) then
      continue;
    end if;

    v_page_id := lower(trim(coalesce(v_item->>'id', '')));
    if v_page_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      v_page_id := 'custom-' || v_page_slug;
    end if;

    v_result := v_result || jsonb_build_array(
      jsonb_build_object(
        'id', left(v_page_id, 72),
        'type', 'custom',
        'slug', v_page_slug,
        'nav_label', left(trim(coalesce(nullif(v_item->>'nav_label', ''), 'Page')), 60),
        'eyebrow', left(trim(coalesce(v_item->>'eyebrow', '')), 100),
        'title', left(trim(coalesce(nullif(v_item->>'title', ''), 'Page')), 160),
        'intro', left(trim(coalesce(v_item->>'intro', '')), 1000),
        'is_visible', case
          when jsonb_typeof(v_item->'is_visible') = 'boolean'
            then (v_item->>'is_visible')::boolean
          else true
        end,
        'show_in_navigation', case
          when jsonb_typeof(v_item->'show_in_navigation') = 'boolean'
            then (v_item->>'show_in_navigation')::boolean
          else true
        end,
        'show_booking_cta', case
          when jsonb_typeof(v_item->'show_booking_cta') = 'boolean'
            then (v_item->>'show_booking_cta')::boolean
          else true
        end,
        'seo_title', left(trim(coalesce(v_item->>'seo_title', '')), 70),
        'seo_description', left(trim(coalesce(v_item->>'seo_description', '')), 170),
        'seo_image_url', public.normalize_public_site_media_url(
          v_item->>'seo_image_url'
        ),
        'seo_no_index', case
          when jsonb_typeof(v_item->'seo_no_index') = 'boolean'
            then (v_item->>'seo_no_index')::boolean
          else false
        end,
        'blocks', public.normalize_public_site_custom_blocks(v_item->'blocks')
      )
    );
    v_seen_slugs := array_append(v_seen_slugs, v_page_slug);
    v_custom_count := v_custom_count + 1;
  end loop;

  return v_result;
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

  v_normalized_content := public.normalize_public_site_content(
    v_business_name,
    v_normalized_locale,
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
    'gift_image_url', public.normalize_public_site_media_url(
      p_content->>'gift_image_url'
    ),
    'reviews', public.normalize_public_site_reviews(p_content->'reviews'),
    'custom_blocks', public.normalize_public_site_custom_blocks(
      p_content->'custom_blocks'
    ),
    'pages', public.normalize_public_site_pages(p_content->'pages')
  );

  v_requested_order := p_content->'section_order';
  if jsonb_typeof(v_requested_order) <> 'array'
    or jsonb_array_length(v_requested_order) not between 4 and 11
    or not (
      v_requested_order <@
      '["services","portfolio","team","booking","membership","safety","reviews","gift","faq","about","contact"]'::jsonb
    )
    or not v_requested_order @> '["services","portfolio","about","contact"]'::jsonb
    or (
      select count(distinct order_item) <> jsonb_array_length(v_requested_order)
      from jsonb_array_elements_text(v_requested_order) as order_items(order_item)
    )
  then
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

create or replace function public.list_business_members(
  p_business_id uuid default null
)
returns table (
  membership_id uuid,
  user_id uuid,
  display_name text,
  email text,
  role text,
  is_active boolean,
  is_default boolean,
  member_since timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_business_id uuid := coalesce(p_business_id, public.current_business_id());
begin
  if v_business_id is null or not public.can_manage_business(v_business_id) then
    raise exception 'workspace_member_management_forbidden' using errcode = '42501';
  end if;

  return query
  select
    m.id,
    m.user_id,
    coalesce(nullif(trim(p.name), ''), split_part(u.email, '@', 1), 'User'),
    coalesce(p.email, u.email, ''),
    m.role,
    m.is_active,
    m.is_default,
    m.created_at
  from public.business_members m
  join auth.users u on u.id = m.user_id
  left join public.profiles p on p.id = m.user_id
  where m.business_id = v_business_id
  order by
    m.is_active desc,
    case m.role
      when 'owner' then 1
      when 'admin' then 2
      when 'manager' then 3
      when 'staff' then 4
      else 5
    end,
    lower(coalesce(p.name, u.email, '')),
    m.id;
end;
$$;

create or replace function public.upsert_business_member_by_email(
  p_business_id uuid,
  p_email text,
  p_role text default 'staff'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_role text := lower(trim(coalesce(p_role, 'staff')));
  v_user_id uuid;
  v_membership_id uuid;
  v_existing_role text;
  v_actor_role text;
  v_make_default boolean := false;
begin
  if not public.can_manage_business(p_business_id) then
    raise exception 'workspace_member_management_forbidden' using errcode = '42501';
  end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'workspace_member_email_invalid' using errcode = '22023';
  end if;
  if v_role not in ('owner', 'admin', 'manager', 'staff', 'viewer') then
    raise exception 'workspace_member_role_invalid' using errcode = '22023';
  end if;

  v_actor_role := public.business_role(p_business_id);
  if v_role = 'owner'
    and v_actor_role <> 'owner'
    and not coalesce(public.is_admin(auth.uid()), false)
  then
    raise exception 'only_owner_can_assign_owner' using errcode = '42501';
  end if;

  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  order by u.created_at
  limit 1;

  if v_user_id is null then
    raise exception 'workspace_user_not_registered' using errcode = '23503';
  end if;

  select m.id, m.role
  into v_membership_id, v_existing_role
  from public.business_members m
  where m.business_id = p_business_id
    and m.user_id = v_user_id
  for update;

  if v_existing_role = 'owner'
    and v_actor_role <> 'owner'
    and not coalesce(public.is_admin(auth.uid()), false)
  then
    raise exception 'only_owner_can_change_owner' using errcode = '42501';
  end if;

  if v_existing_role = 'owner'
    and v_role <> 'owner'
    and not exists (
      select 1
      from public.business_members other_owner
      where other_owner.business_id = p_business_id
        and other_owner.id <> v_membership_id
        and other_owner.role = 'owner'
        and other_owner.is_active = true
    )
  then
    raise exception 'workspace_requires_active_owner' using errcode = '23514';
  end if;

  if v_membership_id is not null then
    update public.business_members
    set role = v_role,
        is_active = true,
        updated_at = now()
    where id = v_membership_id;
    return v_membership_id;
  end if;

  v_make_default := not exists (
    select 1
    from public.business_members existing_default
    where existing_default.user_id = v_user_id
      and existing_default.is_active = true
      and existing_default.is_default = true
  );

  insert into public.business_members (
    business_id,
    user_id,
    role,
    is_active,
    is_default
  )
  values (
    p_business_id,
    v_user_id,
    v_role,
    true,
    v_make_default
  )
  returning id into v_membership_id;

  return v_membership_id;
end;
$$;

create or replace function public.update_business_member_role(
  p_business_id uuid,
  p_membership_id uuid,
  p_role text,
  p_is_active boolean default true
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := lower(trim(coalesce(p_role, '')));
  v_target_role text;
  v_target_user_id uuid;
  v_actor_role text;
begin
  if not public.can_manage_business(p_business_id) then
    raise exception 'workspace_member_management_forbidden' using errcode = '42501';
  end if;
  if v_role not in ('owner', 'admin', 'manager', 'staff', 'viewer') then
    raise exception 'workspace_member_role_invalid' using errcode = '22023';
  end if;

  select m.role, m.user_id
  into v_target_role, v_target_user_id
  from public.business_members m
  where m.id = p_membership_id
    and m.business_id = p_business_id
  for update;

  if v_target_user_id is null then
    raise exception 'workspace_member_not_found' using errcode = '23503';
  end if;

  v_actor_role := public.business_role(p_business_id);
  if (v_target_role = 'owner' or v_role = 'owner')
    and v_actor_role <> 'owner'
    and not coalesce(public.is_admin(auth.uid()), false)
  then
    raise exception 'only_owner_can_change_owner' using errcode = '42501';
  end if;

  if v_target_role = 'owner'
    and (v_role <> 'owner' or not p_is_active)
    and not exists (
      select 1
      from public.business_members other_owner
      where other_owner.business_id = p_business_id
        and other_owner.id <> p_membership_id
        and other_owner.role = 'owner'
        and other_owner.is_active = true
    )
  then
    raise exception 'workspace_requires_active_owner' using errcode = '23514';
  end if;

  update public.business_members
  set role = v_role,
      is_active = p_is_active,
      is_default = case when p_is_active then is_default else false end,
      updated_at = now()
  where id = p_membership_id
    and business_id = p_business_id;

  return found;
end;
$$;

revoke all on function public.normalize_public_site_media_urls(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_custom_blocks(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.normalize_public_site_pages(jsonb)
from public, anon, authenticated, service_role;
revoke all on function public.save_public_site_draft(uuid, text, jsonb, boolean)
from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
to authenticated;

revoke all on function public.list_business_members(uuid)
from public, anon, authenticated;
revoke all on function public.upsert_business_member_by_email(uuid, text, text)
from public, anon, authenticated;
revoke all on function public.update_business_member_role(uuid, uuid, text, boolean)
from public, anon, authenticated;
grant execute on function public.list_business_members(uuid)
to authenticated;
grant execute on function public.upsert_business_member_by_email(uuid, text, text)
to authenticated;
grant execute on function public.update_business_member_role(uuid, uuid, text, boolean)
to authenticated;
