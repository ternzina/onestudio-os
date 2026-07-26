-- OneStudio OS Beta 1: unified booking and client activity timelines.

create or replace function public.get_admin_booking_timeline(p_booking_id uuid)
returns table (
  event_key text,
  source text,
  event_type text,
  title text,
  detail text,
  occurred_at timestamptz,
  related_id uuid,
  status text,
  amount_minor integer,
  currency text,
  metadata jsonb
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select booking.business_id
  into v_business_id
  from public.bookings booking
  where booking.id = p_booking_id;

  if v_business_id is null or not public.can_view_business(v_business_id) then
    raise exception 'booking_timeline_forbidden' using errcode = '42501';
  end if;

  return query
  select *
  from (
    select
      'booking:' || event.id::text,
      'booking'::text,
      event.event_type,
      case event.event_type
        when 'created' then 'Booking created'
        when 'updated' then 'Booking updated'
        when 'status_changed' then 'Booking status changed'
        when 'cancelled' then 'Booking cancelled'
        else 'Booking updated'
      end,
      case
        when event.previous_status is not null or event.new_status is not null
          then concat_ws(' → ', event.previous_status, event.new_status)
        else ''
      end,
      event.created_at,
      event.booking_id,
      coalesce(event.new_status, event.previous_status),
      null::integer,
      null::text,
      coalesce(event.changes, '{}'::jsonb)
    from public.booking_events event
    where event.booking_id = p_booking_id
      and event.business_id = v_business_id

    union all

    select
      'payment:' || payment_tx.id::text,
      'payment'::text,
      payment_tx.kind,
      case payment_tx.kind when 'refund' then 'Refund issued' else 'Payment received' end,
      concat_ws(' · ', payment_tx.provider, payment_tx.method, nullif(payment_tx.note, '')),
      payment_tx.occurred_at,
      payment_tx.id,
      payment_tx.kind,
      payment_tx.amount_minor,
      payment_tx.currency,
      coalesce(payment_tx.metadata, '{}'::jsonb)
    from public.payment_transactions payment_tx
    where payment_tx.booking_id = p_booking_id
      and payment_tx.business_id = v_business_id

    union all

    select
      'document:' || document.id::text,
      'document'::text,
      'created'::text,
      'Document generated'::text,
      concat_ws(' · ', document.document_number, document.document_type),
      document.created_at,
      document.id,
      document.status,
      null::integer,
      null::text,
      jsonb_build_object('document_number', document.document_number, 'document_type', document.document_type)
    from public.generated_documents document
    where document.booking_id = p_booking_id
      and document.business_id = v_business_id

    union all

    select
      'document_event:' || event.id::text,
      'document'::text,
      event.event_type,
      case event.event_type
        when 'sent' then 'Document sent'
        when 'send_failed' then 'Document delivery failed'
        when 'voided' then 'Document voided'
        else 'Document updated'
      end,
      coalesce(nullif(event.error_message, ''), event.recipient_email, ''),
      event.created_at,
      event.document_id,
      event.event_type,
      null::integer,
      null::text,
      jsonb_build_object('provider', event.provider, 'provider_message_id', event.provider_message_id)
    from public.document_events event
    join public.generated_documents document
      on document.id = event.document_id
     and document.business_id = event.business_id
    where document.booking_id = p_booking_id
      and event.business_id = v_business_id

    union all

    select
      'notification:' || job.id::text,
      'notification'::text,
      job.event_type,
      case job.status
        when 'sent' then 'Notification sent'
        when 'failed' then 'Notification failed'
        when 'scheduled' then 'Notification scheduled'
        when 'cancelled' then 'Notification cancelled'
        else 'Notification queued'
      end,
      job.subject,
      coalesce(job.sent_at, job.cancelled_at, job.updated_at, job.created_at),
      job.id,
      job.status,
      null::integer,
      null::text,
      jsonb_build_object('recipient_email', job.recipient_email, 'scheduled_for', job.scheduled_for)
    from public.notification_jobs job
    where job.booking_id = p_booking_id
      and job.business_id = v_business_id
  ) timeline(
    event_key,
    source,
    event_type,
    title,
    detail,
    occurred_at,
    related_id,
    status,
    amount_minor,
    currency,
    metadata
  )
  order by timeline.occurred_at desc, timeline.event_key desc
  limit 200;
end;
$$;

create or replace function public.get_admin_client_timeline(p_client_id uuid)
returns table (
  event_key text,
  source text,
  event_type text,
  title text,
  detail text,
  occurred_at timestamptz,
  related_id uuid,
  status text,
  amount_minor integer,
  currency text,
  metadata jsonb
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select client.business_id
  into v_business_id
  from public.clients client
  where client.id = p_client_id;

  if v_business_id is null or not public.can_view_business(v_business_id) then
    raise exception 'client_timeline_forbidden' using errcode = '42501';
  end if;

  return query
  select *
  from (
    select
      'client:' || event.id::text,
      'client'::text,
      event.event_type,
      case event.event_type
        when 'created' then 'Client created'
        when 'updated' then 'Client updated'
        when 'archived' then 'Client archived'
        when 'restored' then 'Client restored'
        when 'merged' then 'Clients merged'
        else 'Client updated'
      end,
      ''::text,
      event.created_at,
      event.client_id,
      event.event_type,
      null::integer,
      null::text,
      coalesce(event.changes, '{}'::jsonb)
    from public.client_events event
    where event.client_id = p_client_id
      and event.business_id = v_business_id

    union all

    select
      'booking:' || event.id::text,
      'booking'::text,
      event.event_type,
      case event.event_type
        when 'created' then 'Booking created'
        when 'updated' then 'Booking updated'
        when 'status_changed' then 'Booking status changed'
        when 'cancelled' then 'Booking cancelled'
        else 'Booking updated'
      end,
      booking.reference,
      event.created_at,
      event.booking_id,
      coalesce(event.new_status, event.previous_status),
      null::integer,
      booking.currency,
      coalesce(event.changes, '{}'::jsonb)
    from public.booking_events event
    join public.bookings booking
      on booking.id = event.booking_id
     and booking.business_id = event.business_id
    where booking.client_id = p_client_id
      and event.business_id = v_business_id

    union all

    select
      'payment:' || payment_tx.id::text,
      'payment'::text,
      payment_tx.kind,
      case payment_tx.kind when 'refund' then 'Refund issued' else 'Payment received' end,
      concat_ws(' · ', booking.reference, payment_tx.provider, payment_tx.method),
      payment_tx.occurred_at,
      payment_tx.id,
      payment_tx.kind,
      payment_tx.amount_minor,
      payment_tx.currency,
      coalesce(payment_tx.metadata, '{}'::jsonb)
    from public.payment_transactions payment_tx
    join public.bookings booking
      on booking.id = payment_tx.booking_id
     and booking.business_id = payment_tx.business_id
    where payment_tx.client_id = p_client_id
      and payment_tx.business_id = v_business_id

    union all

    select
      'document:' || document.id::text,
      'document'::text,
      'created'::text,
      'Document generated'::text,
      concat_ws(' · ', document.document_number, document.document_type),
      document.created_at,
      document.id,
      document.status,
      null::integer,
      null::text,
      jsonb_build_object('document_number', document.document_number, 'document_type', document.document_type)
    from public.generated_documents document
    where document.client_id = p_client_id
      and document.business_id = v_business_id

    union all

    select
      'document_event:' || event.id::text,
      'document'::text,
      event.event_type,
      case event.event_type
        when 'sent' then 'Document sent'
        when 'send_failed' then 'Document delivery failed'
        when 'voided' then 'Document voided'
        else 'Document updated'
      end,
      coalesce(nullif(event.error_message, ''), event.recipient_email, ''),
      event.created_at,
      event.document_id,
      event.event_type,
      null::integer,
      null::text,
      jsonb_build_object('provider', event.provider, 'provider_message_id', event.provider_message_id)
    from public.document_events event
    join public.generated_documents document
      on document.id = event.document_id
     and document.business_id = event.business_id
    where document.client_id = p_client_id
      and event.business_id = v_business_id

    union all

    select
      'notification:' || job.id::text,
      'notification'::text,
      job.event_type,
      case job.status
        when 'sent' then 'Notification sent'
        when 'failed' then 'Notification failed'
        when 'scheduled' then 'Notification scheduled'
        when 'cancelled' then 'Notification cancelled'
        else 'Notification queued'
      end,
      job.subject,
      coalesce(job.sent_at, job.cancelled_at, job.updated_at, job.created_at),
      job.id,
      job.status,
      null::integer,
      null::text,
      jsonb_build_object('recipient_email', job.recipient_email, 'scheduled_for', job.scheduled_for)
    from public.notification_jobs job
    where job.client_id = p_client_id
      and job.business_id = v_business_id
  ) timeline(
    event_key,
    source,
    event_type,
    title,
    detail,
    occurred_at,
    related_id,
    status,
    amount_minor,
    currency,
    metadata
  )
  order by timeline.occurred_at desc, timeline.event_key desc
  limit 300;
end;
$$;

revoke all on function public.get_admin_booking_timeline(uuid) from public, anon, authenticated;
revoke all on function public.get_admin_client_timeline(uuid) from public, anon, authenticated;
grant execute on function public.get_admin_booking_timeline(uuid) to authenticated, service_role;
grant execute on function public.get_admin_client_timeline(uuid) to authenticated, service_role;

comment on function public.get_admin_booking_timeline(uuid) is
  'Unified Beta 1 timeline for booking operations, payments, documents and notifications.';
comment on function public.get_admin_client_timeline(uuid) is
  'Unified Beta 1 timeline for client activity across bookings, payments, documents and notifications.';
