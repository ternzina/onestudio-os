-- OneStudio OS Generated Documents 1.0
-- Record document creation in the document event timeline.

create or replace function public.record_generated_document_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.document_events (
    business_id,
    document_id,
    event_type,
    recipient_email,
    provider,
    provider_message_id,
    error_message,
    created_by
  ) values (
    new.business_id,
    new.id,
    'created',
    new.recipient_email,
    null,
    null,
    null,
    new.created_by
  );

  return new;
end;
$$;

drop trigger if exists generated_documents_record_created_event
on public.generated_documents;

create trigger generated_documents_record_created_event
after insert on public.generated_documents
for each row
execute function public.record_generated_document_created();

insert into public.document_events (
  business_id,
  document_id,
  event_type,
  recipient_email,
  provider,
  provider_message_id,
  error_message,
  created_by,
  created_at
)
select
  document.business_id,
  document.id,
  'created',
  document.recipient_email,
  null,
  null,
  null,
  document.created_by,
  document.created_at
from public.generated_documents document
where not exists (
  select 1
  from public.document_events event
  where event.document_id = document.id
    and event.business_id = document.business_id
    and event.event_type = 'created'
);

grant execute on function public.record_generated_document_created()
to authenticated, service_role;
