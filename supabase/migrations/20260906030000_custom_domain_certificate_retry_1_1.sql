begin;

alter table public.public_site_domains
  add column if not exists certificate_retry_at timestamptz,
  add column if not exists certificate_retry_count integer not null default 0
    check (certificate_retry_count >= 0);

comment on column public.public_site_domains.certificate_retry_at is
  'Last bounded server-side Vercel certificate issue request.';
comment on column public.public_site_domains.certificate_retry_count is
  'Bounded automatic Vercel certificate issue attempts for the current domain.';

commit;
