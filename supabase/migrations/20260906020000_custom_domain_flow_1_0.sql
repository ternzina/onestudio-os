begin;

-- PostgreSQL cannot change a function's OUT-column row type in place.
-- This migration is intentionally still unapplied; replace the exact old
-- text-argument signature before creating the redirect-aware resolver.
drop function if exists public.resolve_public_site_domain(text);

create function public.resolve_public_site_domain(p_domain text)
returns table (
  business_id uuid,
  business_slug text,
  primary_locale text,
  canonical_domain text,
  is_redirect boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id,
    b.slug,
    s.primary_locale,
    d.domain,
    d.redirect_domain = lower(trim(trailing '.' from coalesce(p_domain, '')))
  from public.public_site_domains d
  join public.businesses b on b.id = d.business_id
  join public.public_site_settings s on s.business_id = b.id
  where (
      d.domain = lower(trim(trailing '.' from coalesce(p_domain, '')))
      or d.redirect_domain = lower(trim(trailing '.' from coalesce(p_domain, '')))
    )
    and d.status = 'active'
    and d.vercel_verified = true
    and d.dns_configured = true
    and d.ssl_ready = true
    and b.status = 'active'
    and s.is_published = true
  limit 1;
$$;

revoke all on function public.resolve_public_site_domain(text)
  from public, anon, authenticated;
grant execute on function public.resolve_public_site_domain(text)
  to anon, authenticated;

comment on function public.resolve_public_site_domain(text) is
  'Resolves active canonical domains and verified redirect domains for published public sites.';

commit;
