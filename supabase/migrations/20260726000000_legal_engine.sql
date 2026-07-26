-- OneStudio OS Legal Engine 1.0


alter table public.business_modules
  drop constraint if exists business_modules_module_key_check;
alter table public.business_modules
  add constraint business_modules_module_key_check
  check (module_key in ('core','media','portfolio','catalog','scheduling','crm','payments','notifications','analytics','legal'));


create table if not exists public.legal_company_profiles (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  legal_name text not null default '',
  display_name text not null default '',
  entity_type text not null default 'sole_proprietor' check (entity_type in ('sole_proprietor','company','individual','other')),
  tax_id text not null default '',
  registration_id text not null default '',
  email text not null default '',
  phone text not null default '',
  website_url text not null default '',
  country_code text not null default 'UA' check (country_code ~ '^[A-Z]{2}$'),
  address text not null default '',
  bank_name text not null default '',
  iban text not null default '',
  support_email text not null default '',
  governing_law text not null default 'Ukraine',
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  document_type text not null check (document_type in ('public_offer','privacy','refund','cookies','terms')),
  locale text not null check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  title text not null,
  body_template text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version integer not null default 1 check (version > 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, document_type, locale)
);

create table if not exists public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.legal_documents(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  version integer not null,
  title text not null,
  body_template text not null,
  status text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create index if not exists legal_documents_public_idx on public.legal_documents (business_id, status, locale, document_type);
create index if not exists legal_versions_document_idx on public.legal_document_versions (document_id, version desc);

alter table public.legal_company_profiles enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_document_versions enable row level security;

create policy "legal profile view by members" on public.legal_company_profiles
for select using (public.can_view_business(business_id));
create policy "legal profile configure by managers" on public.legal_company_profiles
for all using (public.can_configure_business(business_id)) with check (public.can_configure_business(business_id));

create policy "legal documents view by members or public" on public.legal_documents
for select using (status = 'published' or public.can_view_business(business_id));
create policy "legal documents configure by managers" on public.legal_documents
for all using (public.can_configure_business(business_id)) with check (public.can_configure_business(business_id));

create policy "legal versions view by members" on public.legal_document_versions
for select using (public.can_view_business(business_id));
create policy "legal versions insert by managers" on public.legal_document_versions
for insert with check (public.can_configure_business(business_id));

create or replace function public.publish_legal_document(p_document_id uuid)
returns public.legal_documents
language plpgsql
security definer
set search_path = public
as $$
declare v_doc public.legal_documents%rowtype;
begin
  select * into v_doc from public.legal_documents where id = p_document_id for update;
  if not found then raise exception 'legal_document_not_found'; end if;
  if not public.can_configure_business(v_doc.business_id) then raise exception 'legal_document_forbidden'; end if;

  insert into public.legal_document_versions(document_id,business_id,version,title,body_template,status,created_by)
  values(v_doc.id,v_doc.business_id,v_doc.version,v_doc.title,v_doc.body_template,'published',auth.uid())
  on conflict (document_id,version) do update set title=excluded.title, body_template=excluded.body_template, status='published';

  update public.legal_documents
  set status='published', published_at=now(), updated_at=now(), version=version+1
  where id=p_document_id returning * into v_doc;
  return v_doc;
end;
$$;

grant execute on function public.publish_legal_document(uuid) to authenticated;


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
  join public.legal_company_profiles p on p.business_id = d.business_id
  where d.business_id = p_business_id
    and d.document_type = p_document_type
    and d.locale = p_locale
    and d.status = 'published'
  limit 1;
$$;

grant execute on function public.get_public_legal_page(uuid,text,text) to anon, authenticated;


insert into public.business_modules (business_id,module_key,enabled,version)
select id,'legal',true,'1.0.0' from public.businesses
on conflict (business_id,module_key) do update set enabled=true,version='1.0.0',updated_at=now();
