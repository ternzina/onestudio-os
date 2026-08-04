-- OneStudio OS
-- Custom Domain SEO Runtime 1.0
--
-- Gives the runtime a public, tenant-safe list of published SEO paths together
-- with an active custom domain when one exists. Platform sitemaps can then
-- omit custom-domain sites, while each custom domain receives only its own
-- clean URLs.

create or replace function public.list_public_site_seo_paths(
  p_business_slug text default null
)
returns table (
  business_slug text,
  locale text,
  is_primary boolean,
  updated_at timestamptz,
  custom_domain text
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
    greatest(settings.updated_at, locale_data.updated_at),
    case
      when domain.status = 'active'
        and domain.vercel_verified
        and domain.dns_configured
        and domain.ssl_ready
      then domain.domain
      else null
    end
  from public.public_site_settings settings
  join public.businesses business
    on business.id = settings.business_id
  join public.public_site_locales locale_data
    on locale_data.business_id = settings.business_id
  left join public.public_site_domains domain
    on domain.business_id = settings.business_id
  where settings.is_published
    and business.status = 'active'
    and locale_data.published_content is not null
    and (
      p_business_slug is null
      or business.slug = lower(trim(p_business_slug))
    )
  order by
    business.slug,
    (locale_data.locale = settings.primary_locale) desc,
    locale_data.locale;
$$;

revoke all on function public.list_public_site_seo_paths(text)
from public, anon, authenticated;

grant execute on function public.list_public_site_seo_paths(text)
to anon, authenticated;

comment on function public.list_public_site_seo_paths(text) is
  'Lists published locale paths and the active primary custom domain for host-aware robots and sitemap generation.';
