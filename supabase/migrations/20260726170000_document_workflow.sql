-- OneStudio OS Document Workflow 1.1

alter table public.generated_documents
  add column if not exists recipient_email text,
  add column if not exists sent_at timestamptz,
  add column if not exists delivery_provider text,
  add column if not exists delivery_id text,
  add column if not exists delivery_error text;

alter table public.generated_documents
  drop constraint if exists generated_documents_status_check;

alter table public.generated_documents
  add constraint generated_documents_status_check
  check (status in ('draft','final','sent','void'));

alter table public.generated_documents
  drop constraint if exists generated_documents_id_business_unique;

alter table public.generated_documents
  add constraint generated_documents_id_business_unique
  unique (id, business_id);

create table if not exists public.document_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  document_id uuid not null,
  event_type text not null check (event_type in ('created','sent','send_failed','voided')),
  recipient_email text,
  provider text,
  provider_message_id text,
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (document_id, business_id)
    references public.generated_documents(id, business_id) on delete cascade
);

create index if not exists document_events_document_created_idx
  on public.document_events (document_id, created_at desc);
create index if not exists document_events_business_created_idx
  on public.document_events (business_id, created_at desc);

alter table public.document_events enable row level security;

create policy "document events view by members" on public.document_events
for select to authenticated using (public.can_view_business(business_id));

create policy "document events create by operators" on public.document_events
for insert to authenticated with check (public.can_operate_business(business_id));

revoke all on table public.document_events from public, anon;
grant select, insert on table public.document_events to authenticated, service_role;

grant select, insert, update on table public.generated_documents to authenticated, service_role;

create or replace function public.record_document_delivery(
  p_document_id uuid,
  p_success boolean,
  p_recipient_email text,
  p_provider text default 'resend',
  p_provider_message_id text default null,
  p_error_message text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_document public.generated_documents%rowtype;
begin
  select * into v_document
  from public.generated_documents
  where id = p_document_id;

  if not found then
    raise exception 'generated_document_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_document.business_id) then
    raise exception 'document_delivery_forbidden' using errcode = '42501';
  end if;

  if p_success then
    update public.generated_documents
    set status = 'sent',
        recipient_email = nullif(trim(p_recipient_email), ''),
        sent_at = now(),
        delivery_provider = nullif(trim(p_provider), ''),
        delivery_id = nullif(trim(p_provider_message_id), ''),
        delivery_error = null
    where id = p_document_id;

    insert into public.document_events (
      business_id, document_id, event_type, recipient_email,
      provider, provider_message_id, created_by
    ) values (
      v_document.business_id, v_document.id, 'sent', nullif(trim(p_recipient_email), ''),
      nullif(trim(p_provider), ''), nullif(trim(p_provider_message_id), ''), auth.uid()
    );
  else
    update public.generated_documents
    set recipient_email = nullif(trim(p_recipient_email), ''),
        delivery_provider = nullif(trim(p_provider), ''),
        delivery_error = left(coalesce(p_error_message, 'document_delivery_failed'), 4000)
    where id = p_document_id;

    insert into public.document_events (
      business_id, document_id, event_type, recipient_email,
      provider, error_message, created_by
    ) values (
      v_document.business_id, v_document.id, 'send_failed', nullif(trim(p_recipient_email), ''),
      nullif(trim(p_provider), ''), left(coalesce(p_error_message, 'document_delivery_failed'), 4000), auth.uid()
    );
  end if;
end;
$$;

grant execute on function public.record_document_delivery(uuid,boolean,text,text,text,text)
to authenticated, service_role;

-- Backfill recipient email for existing linked documents where possible.
update public.generated_documents d
set recipient_email = c.email
from public.clients c
where d.client_id = c.id
  and d.business_id = c.business_id
  and d.recipient_email is null
  and c.email is not null;

-- Document events are append-only for authenticated workspace users.
revoke all privileges on table public.document_events from anon;
revoke all privileges on table public.document_events from authenticated;

grant select, insert
on table public.document_events
to authenticated;
