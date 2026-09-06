-- OneStudio OS
-- Public-site settings terminal persistence 1.1.
--
-- Preserve the generic settings exposed by the Site Settings modal after the
-- complete specialized save pipeline has validated its own state. Missing keys
-- retain their previous values; submitted empty values deliberately clear them.

do $$
begin
  if to_regprocedure(
    'public.save_public_site_draft_v_site_settings_terminal_1_1(uuid,text,jsonb,boolean)'
  ) is null then
    alter function public.save_public_site_draft(uuid, text, jsonb, boolean)
      rename to save_public_site_draft_v_site_settings_terminal_1_1;
  end if;
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
  v_locale text := lower(trim(coalesce(p_locale, '')));
  v_source jsonb := coalesce(p_content, '{}'::jsonb);
  v_previous jsonb := '{}'::jsonb;
  v_saved jsonb;
  v_site_summary text;
  v_seo_keywords text;
  v_favicon_url text;
  v_show_social_icons boolean;
  v_social_links jsonb;
  v_google_analytics_id text;
  v_meta_pixel_id text;
begin
  select coalesce(locale_row.draft_content, locale_row.published_content, '{}'::jsonb)
    into v_previous
  from public.public_site_locales as locale_row
  where locale_row.business_id = p_business_id
    and locale_row.locale = v_locale
  limit 1;

  v_previous := coalesce(v_previous, '{}'::jsonb);

  -- Preserve the complete Native Action → Rich Heading → premium runtime save
  -- chain. This wrapper owns only the generic Site Settings fields below.
  v_saved := public.save_public_site_draft_v_site_settings_terminal_1_1(
    p_business_id,
    p_locale,
    p_content,
    p_make_primary
  );

  v_site_summary := left(regexp_replace(trim(case
    when v_source ? 'site_summary' then coalesce(v_source->>'site_summary', '')
    else coalesce(v_previous->>'site_summary', '')
  end), '[[:cntrl:]]', ' ', 'g'), 500);

  v_seo_keywords := left(regexp_replace(trim(case
    when v_source ? 'seo_keywords' then coalesce(v_source->>'seo_keywords', '')
    else coalesce(v_previous->>'seo_keywords', '')
  end), '[[:cntrl:]]', ' ', 'g'), 500);

  v_favicon_url := public.normalize_public_site_media_url(case
    when v_source ? 'favicon_url' then v_source->>'favicon_url'
    else v_previous->>'favicon_url'
  end);

  v_show_social_icons := case
    when v_source ? 'show_social_icons' and jsonb_typeof(v_source->'show_social_icons') = 'boolean'
      then (v_source->>'show_social_icons')::boolean
    when not (v_source ? 'show_social_icons')
      and jsonb_typeof(v_previous->'show_social_icons') = 'boolean'
      then (v_previous->>'show_social_icons')::boolean
    else false
  end;

  v_social_links := public.normalize_public_site_social_links(case
    when v_source ? 'social_links' then v_source->'social_links'
    else v_previous->'social_links'
  end);

  v_google_analytics_id := upper(trim(case
    when v_source ? 'google_analytics_id' then coalesce(v_source->>'google_analytics_id', '')
    else coalesce(v_previous->>'google_analytics_id', '')
  end));
  if v_google_analytics_id !~ '^G-[A-Z0-9]{4,20}$' then
    v_google_analytics_id := '';
  end if;

  v_meta_pixel_id := trim(case
    when v_source ? 'meta_pixel_id' then coalesce(v_source->>'meta_pixel_id', '')
    else coalesce(v_previous->>'meta_pixel_id', '')
  end);
  if v_meta_pixel_id !~ '^[0-9]{5,32}$' then
    v_meta_pixel_id := '';
  end if;

  v_saved := coalesce(v_saved, '{}'::jsonb) || jsonb_build_object(
    'site_summary', v_site_summary,
    'seo_keywords', v_seo_keywords,
    'favicon_url', v_favicon_url,
    'show_social_icons', v_show_social_icons,
    'social_links', v_social_links,
    'google_analytics_id', v_google_analytics_id,
    'meta_pixel_id', v_meta_pixel_id
  );

  update public.public_site_locales
  set draft_content = v_saved,
      updated_at = now()
  where business_id = p_business_id
    and locale = v_locale;

  if not found then
    raise exception 'public_site_locale_not_found' using errcode = '23503';
  end if;

  return v_saved;
end;
$$;

revoke all on function public.save_public_site_draft_v_site_settings_terminal_1_1(
  uuid, text, jsonb, boolean
) from public, anon, authenticated, service_role;
revoke execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
  from public, anon, authenticated;
grant execute on function public.save_public_site_draft(uuid, text, jsonb, boolean)
  to authenticated, service_role;

comment on function public.save_public_site_draft(uuid, text, jsonb, boolean) is
  'Complete specialized public-site save pipeline with terminal persistence for generic Site Settings 1.1.';
