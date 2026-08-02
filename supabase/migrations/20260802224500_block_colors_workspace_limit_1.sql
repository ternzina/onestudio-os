-- OneStudio OS: per-block colors, workspace deletion visibility and site limit 1.0
-- Adds individual section/custom-block colors, restores safe deletion for empty
-- demo workspaces and enforces a maximum of three non-archived owned sites.

create or replace function public.normalize_public_site_block_colors(
  p_colors jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_colors jsonb := coalesce(p_colors, '{}'::jsonb);
  v_mode text;
begin
  if jsonb_typeof(v_colors) <> 'object' then
    return jsonb_build_object('mode', 'theme');
  end if;

  v_mode := case
    when v_colors->>'mode' = 'custom' then 'custom'
    else 'theme'
  end;

  if v_mode = 'theme' then
    return jsonb_build_object('mode', 'theme');
  end if;

  return jsonb_build_object(
    'mode', 'custom',
    'background', case
      when coalesce(v_colors->>'background', '') ~ '^#[0-9a-fA-F]{6}$'
        then lower(v_colors->>'background')
      else '#ffffff'
    end,
    'text', case
      when coalesce(v_colors->>'text', '') ~ '^#[0-9a-fA-F]{6}$'
        then lower(v_colors->>'text')
      else '#191b20'
    end,
    'accent', case
      when coalesce(v_colors->>'accent', '') ~ '^#[0-9a-fA-F]{6}$'
        then lower(v_colors->>'accent')
      else '#9d3151'
    end
  );
end;
$$;

create or replace function public.normalize_public_site_section_colors(
  p_colors jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_key text;
begin
  if jsonb_typeof(p_colors) <> 'object' then
    return v_result;
  end if;

  foreach v_key in array array[
    'hero', 'services', 'portfolio', 'booking', 'about', 'team',
    'reviews', 'membership', 'gift', 'faq', 'safety', 'contact'
  ]
  loop
    if p_colors ? v_key then
      v_result := v_result || jsonb_build_object(
        v_key,
        public.normalize_public_site_block_colors(p_colors->v_key)
      );
    end if;
  end loop;

  return v_result;
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
    'template_id', left(trim(coalesce(content->>'template_id', '')), 80),
    'theme_accent', case when coalesce(content->>'theme_accent', '') ~ '^#[0-9a-fA-F]{6}$' then content->>'theme_accent' else '#9a742e' end,
    'theme_dark', case when coalesce(content->>'theme_dark', '') ~ '^#[0-9a-fA-F]{6}$' then content->>'theme_dark' else '#191b20' end,
    'theme_surface', case when coalesce(content->>'theme_surface', '') ~ '^#[0-9a-fA-F]{6}$' then content->>'theme_surface' else '#f3f0e9' end,
    'section_colors', public.normalize_public_site_section_colors(content->'section_colors'),
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
  v_media_url text;
  v_media_alt text;
  v_slide_interval integer;
  v_media_size text;
  v_media_aspect text;
  v_media_fit text;
  v_media_frame text;
  v_media_type text;
  v_media_position text;
  v_columns_count integer;
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
      when v_item->>'kind' in (
        'text',
        'features',
        'cta',
        'slider',
        'collage',
        'video',
        'media_text',
        'columns'
      )
        then v_item->>'kind'
      else 'text'
    end;

    v_block_tone := case
      when v_item->>'tone' in ('light', 'accent', 'dark')
        then v_item->>'tone'
      else 'light'
    end;

    v_media_size := case
      when v_item->>'media_size' in ('full', 'wide', 'medium', 'compact')
        then v_item->>'media_size'
      else 'wide'
    end;

    v_media_aspect := case
      when v_item->>'media_aspect' in (
        'landscape',
        'classic',
        'square',
        'portrait'
      )
        then v_item->>'media_aspect'
      else 'landscape'
    end;

    v_media_fit := case
      when v_item->>'media_fit' in ('cover', 'contain')
        then v_item->>'media_fit'
      else 'cover'
    end;

    v_media_frame := case
      when v_item->>'media_frame' in ('none', 'line', 'card')
        then v_item->>'media_frame'
      else 'line'
    end;

    v_media_type := case
      when v_item->>'media_type' in ('video', 'calendar')
        then v_item->>'media_type'
      else 'image'
    end;

    v_media_position := case
      when v_item->>'media_position' in ('left', 'center', 'right')
        then v_item->>'media_position'
      else 'right'
    end;

    begin
      v_columns_count := case
        when (v_item->>'columns_count')::integer = 2 then 2
        else 3
      end;
    exception when others then
      v_columns_count := 3;
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
    v_media_url := public.normalize_public_site_media_url(
      v_item->>'media_url'
    );
    v_media_alt := left(
      regexp_replace(
        trim(coalesce(v_item->>'media_alt', '')),
        '[[:cntrl:]]',
        ' ',
        'g'
      ),
      180
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
        'colors', public.normalize_public_site_block_colors(v_item->'colors'),
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
        'video_poster_url', v_video_poster_url,
        'media_url', v_media_url,
        'media_alt', v_media_alt,
        'media_type', v_media_type,
        'media_position', v_media_position,
        'columns_count', v_columns_count,
        'cards', public.normalize_public_site_column_cards(v_item->'cards'),
        'media_size', v_media_size,
        'media_aspect', v_media_aspect,
        'media_fit', v_media_fit,
        'media_frame', v_media_frame
      )
    );

    v_seen_ids := array_append(v_seen_ids, v_block_id);
    v_item_count := v_item_count + 1;
  end loop;

  return v_result;
end;
$$;

create or replace function public.enforce_owned_workspace_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_owned_count integer;
begin
  -- Platform seeds and service-role maintenance do not represent an end-user launch.
  if v_user_id is null then
    return new;
  end if;

  if new.status = 'archived' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status <> 'archived' then
      return new;
    end if;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('workspace-limit:' || v_user_id::text, 0)
  );

  select count(*)::integer
  into v_owned_count
  from public.business_members membership
  join public.businesses business
    on business.id = membership.business_id
  where membership.user_id = v_user_id
    and membership.is_active = true
    and membership.role = 'owner'
    and business.status <> 'archived'
    and business.id <> new.id;

  if v_owned_count >= 3 then
    raise exception 'workspace_limit_reached' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_owned_workspace_limit_trigger
  on public.businesses;
create trigger enforce_owned_workspace_limit_trigger
before insert or update of status on public.businesses
for each row execute function public.enforce_owned_workspace_limit();

create or replace function public.list_my_workspace_management()
returns table (
  business_id uuid,
  slug text,
  name text,
  timezone text,
  default_locale text,
  default_currency text,
  status text,
  role text,
  is_default boolean,
  member_since timestamptz,
  booking_count bigint,
  client_count bigint,
  payment_count bigint,
  request_count bigint,
  document_count bigint,
  notification_count bigint,
  google_calendar_connected boolean,
  can_archive boolean,
  can_delete boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    b.id,
    b.slug,
    b.name,
    b.timezone,
    b.default_locale,
    b.default_currency,
    b.status,
    m.role,
    m.is_default,
    m.created_at,
    coalesce(booking_stats.total, 0),
    coalesce(client_stats.total, 0),
    coalesce(payment_stats.total, 0),
    coalesce(request_stats.total, 0),
    coalesce(document_stats.total, 0),
    coalesce(notification_stats.total, 0),
    coalesce(calendar_stats.connected, false),
    (
      m.role = 'owner'
      and b.status <> 'archived'
      and exists (
        select 1
        from public.business_members other_membership
        join public.businesses other_business
          on other_business.id = other_membership.business_id
        where other_membership.user_id = auth.uid()
          and other_membership.is_active = true
          and other_membership.business_id <> b.id
          and other_business.status <> 'archived'
      )
    ) as can_archive,
    (
      m.role = 'owner'
      and b.id <> '00000000-0000-4000-8000-000000000001'::uuid
      and coalesce(booking_stats.total, 0) = 0
      and coalesce(client_stats.total, 0) = 0
      and coalesce(payment_stats.total, 0) = 0
      and coalesce(request_stats.total, 0) = 0
      and coalesce(document_stats.total, 0) = 0
      and coalesce(notification_stats.total, 0) = 0
      and coalesce(calendar_stats.connected, false) = false
    ) as can_delete
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  left join lateral (
    select count(*)::bigint as total
    from public.bookings booking
    where booking.business_id = b.id
  ) booking_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.clients client
    where client.business_id = b.id
  ) client_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.payment_transactions payment_row
    where payment_row.business_id = b.id
  ) payment_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.public_requests request_row
    where request_row.business_id = b.id
  ) request_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.generated_documents document_row
    where document_row.business_id = b.id
  ) document_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.notification_jobs job
    where job.business_id = b.id
  ) notification_stats on true
  left join lateral (
    select exists (
      select 1
      from public.google_calendar_integrations integration
      where integration.business_id = b.id
    ) as connected
  ) calendar_stats on true
  where m.user_id = auth.uid()
    and m.is_active = true
  order by
    case when b.status = 'archived' then 1 else 0 end,
    m.is_default desc,
    b.name,
    b.id;
$$;

create or replace function public.delete_my_empty_workspace(
  p_business_id uuid,
  p_confirmation_name text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_name text;
  v_target_is_default boolean;
  v_replacement_id uuid;
  v_has_operational_data boolean;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if p_business_id = '00000000-0000-4000-8000-000000000001'::uuid then
    raise exception 'workspace_foundation_cannot_be_deleted' using errcode = 'P0001';
  end if;

  select b.name, m.is_default
  into v_target_name, v_target_is_default
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.business_id = p_business_id
    and m.user_id = v_user_id
    and m.is_active = true
    and m.role = 'owner';

  if not found then
    raise exception 'workspace_owner_required' using errcode = '42501';
  end if;

  if btrim(coalesce(p_confirmation_name, '')) <> v_target_name then
    raise exception 'workspace_confirmation_mismatch' using errcode = '22023';
  end if;

  select m.business_id
  into v_replacement_id
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.user_id = v_user_id
    and m.is_active = true
    and m.business_id <> p_business_id
    and b.status <> 'archived'
  order by
    m.is_default desc,
    case m.role
      when 'owner' then 1
      when 'admin' then 2
      when 'manager' then 3
      when 'staff' then 4
      else 5
    end,
    m.created_at,
    m.business_id
  limit 1;

  select
    exists (select 1 from public.bookings row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.clients row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.payment_transactions row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.public_requests row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.generated_documents row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.notification_jobs row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.google_calendar_integrations row_data where row_data.business_id = p_business_id)
  into v_has_operational_data;

  if v_has_operational_data then
    raise exception 'workspace_has_operational_data' using errcode = 'P0001';
  end if;

  if v_target_is_default
     or not exists (
       select 1
       from public.business_members m
       join public.businesses b on b.id = m.business_id
       where m.user_id = v_user_id
         and m.is_active = true
         and m.is_default = true
         and m.business_id <> p_business_id
         and b.status <> 'archived'
     ) then
    update public.business_members
    set is_default = false,
        updated_at = now()
    where user_id = v_user_id
      and is_default = true;

    if v_replacement_id is not null then
      update public.business_members
      set is_default = true,
          updated_at = now()
      where user_id = v_user_id
        and business_id = v_replacement_id
        and is_active = true;
    end if;
  end if;

  delete from public.businesses
  where id = p_business_id;

  if not found then
    raise exception 'workspace_not_found' using errcode = 'P0002';
  end if;

  return v_replacement_id;
end;
$$;

revoke all on function public.normalize_public_site_block_colors(jsonb)
  from public, anon, authenticated;
revoke all on function public.normalize_public_site_section_colors(jsonb)
  from public, anon, authenticated;
revoke all on function public.enforce_owned_workspace_limit()
  from public, anon, authenticated;
revoke all on function public.list_my_workspace_management()
  from public, anon, authenticated;
revoke all on function public.delete_my_empty_workspace(uuid, text)
  from public, anon, authenticated;

grant execute on function public.normalize_public_site_block_colors(jsonb)
  to service_role;
grant execute on function public.normalize_public_site_section_colors(jsonb)
  to service_role;
grant execute on function public.list_my_workspace_management()
  to authenticated, service_role;
grant execute on function public.delete_my_empty_workspace(uuid, text)
  to authenticated, service_role;

comment on function public.enforce_owned_workspace_limit() is
  'Enforces a maximum of three non-archived workspaces owned by the signed-in user.';
comment on function public.delete_my_empty_workspace(uuid, text) is
  'Permanently deletes an empty disposable workspace, including the final empty demo workspace, after exact-name confirmation.';
