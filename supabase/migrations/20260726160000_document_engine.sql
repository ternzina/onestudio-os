-- OneStudio OS Document Engine 1.0
-- Workspace-safe templates and immutable generated document snapshots.

create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  template_key text not null check (template_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  document_type text not null check (document_type in ('contract','invoice','act','commercial_offer','privacy_consent','other')),
  locale text not null default 'uk' check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  title_template text not null,
  body_template text not null,
  version integer not null default 1 check (version > 0),
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, template_key, locale, version),
  unique (id, business_id)
);

create table if not exists public.generated_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  template_id uuid not null,
  client_id uuid,
  booking_id uuid,
  document_type text not null check (document_type in ('contract','invoice','act','commercial_offer','privacy_consent','other')),
  locale text not null check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  document_number text not null,
  title_snapshot text not null,
  content_snapshot text not null,
  variables_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(variables_snapshot) = 'object'),
  status text not null default 'final' check (status in ('draft','final','void')),
  issued_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (business_id, document_number),
  foreign key (template_id, business_id) references public.document_templates(id, business_id) on delete restrict,
  foreign key (client_id, business_id) references public.clients(id, business_id) on delete restrict,
  foreign key (booking_id, business_id) references public.bookings(id, business_id) on delete restrict
);

create index if not exists document_templates_business_type_idx
  on public.document_templates (business_id, document_type, locale, status);
create index if not exists generated_documents_business_created_idx
  on public.generated_documents (business_id, created_at desc);
create index if not exists generated_documents_client_idx
  on public.generated_documents (client_id, created_at desc) where client_id is not null;
create index if not exists generated_documents_booking_idx
  on public.generated_documents (booking_id, created_at desc) where booking_id is not null;

alter table public.document_templates enable row level security;
alter table public.generated_documents enable row level security;

create policy "document templates view by members" on public.document_templates
for select to authenticated using (public.can_view_business(business_id));
create policy "document templates configure by managers" on public.document_templates
for all to authenticated using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create policy "generated documents view by members" on public.generated_documents
for select to authenticated using (public.can_view_business(business_id));
create policy "generated documents create by operators" on public.generated_documents
for insert to authenticated with check (public.can_operate_business(business_id));
create policy "generated documents update by managers" on public.generated_documents
for update to authenticated using (public.can_configure_business(business_id))
with check (public.can_configure_business(business_id));

create trigger document_templates_set_updated_at
before update on public.document_templates
for each row execute function public.set_updated_at();

revoke all on table public.document_templates from public, anon;
revoke all on table public.generated_documents from public, anon;
grant select, insert, update on table public.document_templates to authenticated, service_role;
grant select, insert, update on table public.generated_documents to authenticated, service_role;

create or replace function public.render_document_text(p_template text, p_variables jsonb)
returns text
language plpgsql
immutable
set search_path = public
as $$
declare
  v_result text := coalesce(p_template, '');
  v_key text;
  v_value text;
begin
  if p_variables is null or jsonb_typeof(p_variables) <> 'object' then
    return v_result;
  end if;
  for v_key, v_value in select key, value from jsonb_each_text(p_variables)
  loop
    v_result := replace(v_result, '{{' || v_key || '}}', coalesce(v_value, ''));
  end loop;
  return v_result;
end;
$$;

grant execute on function public.render_document_text(text,jsonb) to authenticated, service_role;

create or replace function public.seed_document_templates(p_business_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is not null and not public.can_configure_business(p_business_id) then
    raise exception 'document_template_seed_forbidden' using errcode = '42501';
  end if;

  insert into public.document_templates (business_id, template_key, document_type, locale, title_template, body_template, status)
  values
    (p_business_id, 'service_contract', 'contract', 'uk',
      'Договір № {{document.number}}',
      E'ДОГОВІР ПРО НАДАННЯ ПОСЛУГ\n\nВиконавець: {{company.legal_name}}, РНОКПП/ЄДРПОУ {{company.tax_id}}.\nКлієнт: {{client.name}}, email: {{client.email}}, телефон: {{client.phone}}.\n\nПредмет: надання послуги «{{service.title}}».\nБронювання: {{booking.reference}} від {{booking.date}}.\nВартість: {{booking.total}} {{booking.currency}}.\n\nБанківські реквізити Виконавця: {{company.bank_name}}, IBAN {{company.iban}}.\nКонтакти: {{company.email}}, {{company.website}}.',
      'active'),
    (p_business_id, 'invoice', 'invoice', 'uk',
      'Рахунок № {{document.number}}',
      E'РАХУНОК НА ОПЛАТУ\n\nПостачальник: {{company.legal_name}}\nРНОКПП/ЄДРПОУ: {{company.tax_id}}\nIBAN: {{company.iban}}\nБанк: {{company.bank_name}}\n\nПлатник: {{client.name}}\nПослуга: {{service.title}}\nБронювання: {{booking.reference}}\nДо сплати: {{booking.total}} {{booking.currency}}\nДата: {{document.date}}',
      'active'),
    (p_business_id, 'service_act', 'act', 'uk',
      'Акт № {{document.number}}',
      E'АКТ НАДАНИХ ПОСЛУГ\n\nМи, {{company.legal_name}} та {{client.name}}, підтверджуємо надання послуги «{{service.title}}» за бронюванням {{booking.reference}}.\n\nСума: {{booking.total}} {{booking.currency}}.\nДата складання: {{document.date}}.\nСторони не мають взаємних претензій щодо обсягу та якості послуг.',
      'active')
  on conflict (business_id, template_key, locale, version) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.seed_document_templates(uuid) to authenticated, service_role;

-- Seed current workspaces. The migration runs as a trusted database role.
do $$
declare v_business_id uuid;
begin
  for v_business_id in select id from public.businesses loop
    perform public.seed_document_templates(v_business_id);
  end loop;
end $$;

create or replace function public.create_generated_document(
  p_template_id uuid,
  p_client_id uuid default null,
  p_booking_id uuid default null,
  p_status text default 'final'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_template public.document_templates%rowtype;
  v_profile public.company_profiles%rowtype;
  v_client public.clients%rowtype;
  v_booking public.bookings%rowtype;
  v_service public.services%rowtype;
  v_id uuid;
  v_number text;
  v_vars jsonb;
  v_title text;
  v_body text;
begin
  select * into v_template from public.document_templates where id = p_template_id;
  if not found then raise exception 'document_template_not_found' using errcode = '23503'; end if;
  if not public.can_operate_business(v_template.business_id) then
    raise exception 'document_generation_forbidden' using errcode = '42501';
  end if;
  if p_status not in ('draft','final') then
    raise exception 'invalid_document_status' using errcode = '22023';
  end if;

  select * into v_profile from public.company_profiles where business_id = v_template.business_id;

  if p_client_id is not null then
    select * into v_client from public.clients where id = p_client_id and business_id = v_template.business_id;
    if not found then raise exception 'document_client_not_found' using errcode = '23503'; end if;
  end if;

  if p_booking_id is not null then
    select * into v_booking from public.bookings where id = p_booking_id and business_id = v_template.business_id;
    if not found then raise exception 'document_booking_not_found' using errcode = '23503'; end if;
    if p_client_id is null then select * into v_client from public.clients where id = v_booking.client_id; end if;
    select * into v_service from public.services where id = v_booking.service_id;
  end if;

  v_number := upper(substr(v_template.document_type,1,3)) || '-' || to_char(now(),'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  v_vars := jsonb_build_object(
    'document.number', v_number,
    'document.date', to_char(current_date, 'DD.MM.YYYY'),
    'company.display_name', coalesce(v_profile.display_name,''),
    'company.legal_name', coalesce(v_profile.legal_name,''),
    'company.tax_id', coalesce(v_profile.tax_id,''),
    'company.email', coalesce(v_profile.email,''),
    'company.website', coalesce(v_profile.website_url,''),
    'company.bank_name', coalesce(v_profile.bank_name,''),
    'company.iban', coalesce(v_profile.iban,''),
    'company.address', coalesce(v_profile.address,''),
    'client.name', coalesce(v_client.name,''),
    'client.email', coalesce(v_client.email,''),
    'client.phone', coalesce(v_client.phone,''),
    'booking.reference', coalesce(v_booking.reference,''),
    'booking.date', coalesce(to_char(v_booking.starts_at at time zone coalesce(v_booking.timezone,'UTC'),'DD.MM.YYYY HH24:MI'),''),
    'booking.total', case when v_booking.id is null then '' else trim(to_char(v_booking.total_minor::numeric / 100, 'FM999999990.00')) end,
    'booking.currency', coalesce(v_booking.currency,''),
    'service.title', coalesce(v_service.title,'')
  );
  v_title := public.render_document_text(v_template.title_template, v_vars);
  v_body := public.render_document_text(v_template.body_template, v_vars);

  insert into public.generated_documents (
    business_id, template_id, client_id, booking_id, document_type, locale,
    document_number, title_snapshot, content_snapshot, variables_snapshot,
    status, created_by
  ) values (
    v_template.business_id, v_template.id, coalesce(p_client_id, v_booking.client_id), p_booking_id,
    v_template.document_type, v_template.locale, v_number, v_title, v_body, v_vars,
    p_status, auth.uid()
  ) returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_generated_document(uuid,uuid,uuid,text) to authenticated, service_role;
