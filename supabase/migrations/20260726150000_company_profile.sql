-- OneStudio OS Company Profile 1.0
-- Canonical workspace-scoped company identity shared by Legal, Payments, Email and future invoices.

create table if not exists public.company_profiles (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  display_name text not null default '',
  legal_name text not null default '',
  entity_type text not null default 'sole_proprietor'
    check (entity_type in ('sole_proprietor','company','individual','nonprofit','other')),
  owner_name text not null default '',
  tax_id text not null default '',
  registration_id text not null default '',
  vat_number text not null default '',
  email text not null default '',
  support_email text not null default '',
  phone text not null default '',
  website_url text not null default '',
  country_code text not null default 'UA' check (country_code ~ '^[A-Z]{2}$'),
  default_currency text not null default 'UAH' check (default_currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'Europe/Kyiv',
  address text not null default '',
  bank_name text not null default '',
  iban text not null default '',
  swift_bic text not null default '',
  logo_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_profiles enable row level security;

create policy "company profiles view by members" on public.company_profiles
for select using (public.can_view_business(business_id));

create policy "company profiles configure by managers" on public.company_profiles
for all using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create trigger company_profiles_set_updated_at
before update on public.company_profiles
for each row execute function public.set_updated_at();

-- Preserve values already entered in Legal Engine 1.0.
insert into public.company_profiles (
  business_id, display_name, legal_name, entity_type, tax_id, registration_id,
  email, support_email, phone, website_url, country_code, address, bank_name, iban
)
select
  business_id, display_name, legal_name, entity_type, tax_id, registration_id,
  email, support_email, phone, website_url, country_code, address, bank_name, iban
from public.legal_company_profiles
on conflict (business_id) do nothing;

-- Every workspace receives one canonical profile, even before Legal is initialized.
insert into public.company_profiles (
  business_id, display_name, legal_name, email, support_email, website_url,
  country_code, default_currency, timezone
)
select
  b.id, b.name, b.name, '', '', '',
  'UA', b.default_currency, b.timezone
from public.businesses b
on conflict (business_id) do nothing;

-- Legal Engine 1.1 renders from the canonical Company Profile.
create or replace function public.get_public_legal_page(
  p_business_id uuid,
  p_document_type text,
  p_locale text
)
returns table(title text, body text, published_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.title,
    replace(replace(replace(replace(replace(replace(replace(replace(
      d.body_template,
      '{{legal_name}}', p.legal_name),
      '{{tax_id}}', p.tax_id),
      '{{email}}', p.email),
      '{{support_email}}', p.support_email),
      '{{website_url}}', p.website_url),
      '{{bank_name}}', p.bank_name),
      '{{iban}}', p.iban),
      '{{address}}', p.address) as body,
    d.published_at
  from public.legal_documents d
  join public.company_profiles p on p.business_id = d.business_id
  where d.business_id = p_business_id
    and d.document_type = p_document_type
    and d.locale = p_locale
    and d.status = 'published'
  limit 1;
$$;

grant execute on function public.get_public_legal_page(uuid,text,text) to anon, authenticated;
