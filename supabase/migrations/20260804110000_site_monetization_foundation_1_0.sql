begin;

create table if not exists public.site_monetization_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  ads_txt_content text not null default '',
  ads_txt_enabled boolean not null default false,
  adsense_publisher_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_monetization_ads_txt_size_check
    check (octet_length(ads_txt_content) <= 100000),
  constraint site_monetization_adsense_publisher_id_check
    check (
      adsense_publisher_id is null
      or adsense_publisher_id = ''
      or adsense_publisher_id ~ '^ca-pub-[0-9]{16}$'
    )
);

alter table public.site_monetization_settings enable row level security;

revoke all on table public.site_monetization_settings
  from public, anon, authenticated;
grant all on table public.site_monetization_settings
  to service_role;

drop trigger if exists site_monetization_settings_set_updated_at
  on public.site_monetization_settings;

create trigger site_monetization_settings_set_updated_at
before update on public.site_monetization_settings
for each row execute function public.set_updated_at();

create or replace function public.get_site_monetization_settings(
  p_business_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result jsonb;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception using
      errcode = '42501',
      message = 'site_monetization_access_denied';
  end if;

  select jsonb_build_object(
    'business_id', p_business_id,
    'ads_txt_content', coalesce(settings.ads_txt_content, ''),
    'ads_txt_enabled', coalesce(settings.ads_txt_enabled, false),
    'adsense_publisher_id', coalesce(settings.adsense_publisher_id, ''),
    'updated_at', settings.updated_at
  )
  into result
  from public.site_monetization_settings settings
  where settings.business_id = p_business_id;

  return coalesce(
    result,
    jsonb_build_object(
      'business_id', p_business_id,
      'ads_txt_content', '',
      'ads_txt_enabled', false,
      'adsense_publisher_id', '',
      'updated_at', null
    )
  );
end;
$$;

create or replace function public.save_site_monetization_settings(
  p_business_id uuid,
  p_ads_txt_content text,
  p_ads_txt_enabled boolean,
  p_adsense_publisher_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  normalized_content text;
  normalized_publisher_id text;
begin
  if not public.can_configure_business(p_business_id) then
    raise exception using
      errcode = '42501',
      message = 'site_monetization_access_denied';
  end if;

  normalized_content := replace(
    replace(coalesce(p_ads_txt_content, ''), E'\r\n', E'\n'),
    E'\r',
    E'\n'
  );

  if octet_length(normalized_content) > 100000 then
    raise exception using
      errcode = '22001',
      message = 'ads_txt_content_too_large';
  end if;

  normalized_publisher_id := trim(coalesce(p_adsense_publisher_id, ''));

  if normalized_publisher_id <> ''
     and normalized_publisher_id !~ '^ca-pub-[0-9]{16}$' then
    raise exception using
      errcode = '22023',
      message = 'adsense_publisher_id_invalid';
  end if;

  if coalesce(p_ads_txt_enabled, false)
     and btrim(normalized_content) = '' then
    raise exception using
      errcode = '22023',
      message = 'ads_txt_content_required';
  end if;

  insert into public.site_monetization_settings (
    business_id,
    ads_txt_content,
    ads_txt_enabled,
    adsense_publisher_id
  )
  values (
    p_business_id,
    normalized_content,
    coalesce(p_ads_txt_enabled, false),
    nullif(normalized_publisher_id, '')
  )
  on conflict (business_id) do update
  set ads_txt_content = excluded.ads_txt_content,
      ads_txt_enabled = excluded.ads_txt_enabled,
      adsense_publisher_id = excluded.adsense_publisher_id,
      updated_at = now();

  return public.get_site_monetization_settings(p_business_id);
end;
$$;

create or replace function public.resolve_public_site_ads_txt(
  p_domain text
)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select settings.ads_txt_content
  from public.public_site_domains domain_row
  join public.businesses business
    on business.id = domain_row.business_id
  join public.public_site_settings site
    on site.business_id = business.id
  join public.site_monetization_settings settings
    on settings.business_id = business.id
  where (
      domain_row.domain = lower(trim(trailing '.' from coalesce(p_domain, '')))
      or domain_row.redirect_domain = lower(trim(trailing '.' from coalesce(p_domain, '')))
    )
    and domain_row.status = 'active'
    and domain_row.vercel_verified = true
    and domain_row.dns_configured = true
    and business.status = 'active'
    and site.is_published = true
    and settings.ads_txt_enabled = true
    and btrim(settings.ads_txt_content) <> ''
  limit 1;
$$;

revoke all on function public.get_site_monetization_settings(uuid)
  from public, anon, authenticated;
grant execute on function public.get_site_monetization_settings(uuid)
  to authenticated;

revoke all on function public.save_site_monetization_settings(uuid, text, boolean, text)
  from public, anon, authenticated;
grant execute on function public.save_site_monetization_settings(uuid, text, boolean, text)
  to authenticated;

revoke all on function public.resolve_public_site_ads_txt(text)
  from public, anon, authenticated;
grant execute on function public.resolve_public_site_ads_txt(text)
  to anon, authenticated;

comment on table public.site_monetization_settings is
  'Per-workspace public advertising and monetization settings.';
comment on function public.resolve_public_site_ads_txt(text) is
  'Returns ads.txt only for an active verified domain and a published active site.';

commit;
