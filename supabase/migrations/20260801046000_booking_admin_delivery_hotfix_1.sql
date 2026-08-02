-- OneStudio OS Booking Admin Delivery Hotfix 1.0
-- Repairs existing customer-management contexts, preserves immutable delivery
-- history during guarded booking deletion, and supports exact one-job dispatch.

insert into public.business_availability_settings (business_id)
select business.id
from public.businesses business
on conflict (business_id) do nothing;

create or replace function public.delete_admin_booking(
  p_booking_id uuid
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
begin
  if p_booking_id is null then
    raise exception 'booking_not_found' using errcode = '23503';
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    raise exception 'booking_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_booking.business_id) then
    raise exception 'booking_operation_forbidden' using errcode = '42501';
  end if;

  if coalesce(v_booking.paid_minor, 0) > 0
     or v_booking.payment_status in ('partially_paid', 'paid', 'refunded')
     or exists (
       select 1
       from public.payment_transactions payment_tx
       where payment_tx.booking_id = v_booking.id
         and payment_tx.business_id = v_booking.business_id
     )
     or exists (
       select 1
       from public.generated_documents document_row
       where document_row.booking_id = v_booking.id
         and document_row.business_id = v_booking.business_id
     ) then
    raise exception 'booking_delete_protected_history' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.google_calendar_booking_links calendar_link
    where calendar_link.booking_id = v_booking.id
      and calendar_link.business_id = v_booking.business_id
  ) then
    raise exception 'booking_delete_calendar_linked' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.notification_jobs job
    where job.booking_id = v_booking.id
      and job.business_id = v_booking.business_id
      and job.status = 'processing'
  ) then
    raise exception 'booking_delete_notification_processing' using errcode = '55000';
  end if;

  -- Delivery attempts are intentionally append-only. Detach their parent jobs
  -- from the booking before deleting it, preserving the audit history.
  update public.notification_jobs job
  set booking_id = null,
      status = case
        when job.status in ('scheduled', 'pending', 'failed') then 'cancelled'
        else job.status
      end,
      cancelled_at = case
        when job.status in ('scheduled', 'pending', 'failed')
          then coalesce(job.cancelled_at, now())
        else job.cancelled_at
      end,
      last_error = case
        when job.status in ('scheduled', 'pending', 'failed')
          then 'booking_deleted_by_admin'
        else job.last_error
      end,
      payload = coalesce(job.payload, '{}'::jsonb) || jsonb_build_object(
        'deleted_booking_id', v_booking.id,
        'deleted_booking_reference', v_booking.reference
      ),
      updated_at = now()
  where job.booking_id = v_booking.id
    and job.business_id = v_booking.business_id;

  delete from public.bookings booking
  where booking.id = v_booking.id
    and booking.business_id = v_booking.business_id;

  return v_booking.id;
end;
$$;

revoke all on function public.delete_admin_booking(uuid)
  from public, anon, authenticated;
grant execute on function public.delete_admin_booking(uuid)
  to authenticated, service_role;

create or replace function public.claim_notification_job(
  p_job_id uuid,
  p_provider text
)
returns table (
  id uuid,
  business_id uuid,
  booking_id uuid,
  event_type text,
  channel text,
  locale text,
  recipient_email text,
  subject text,
  body text,
  payload jsonb,
  attempt_number integer,
  idempotency_key text,
  from_name text,
  reply_to_email text
)
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.is_notification_service_role() then
    raise exception 'notification_provider_forbidden' using errcode = '42501';
  end if;

  if p_job_id is null then
    raise exception 'notification_job_not_found' using errcode = '23503';
  end if;

  if char_length(trim(coalesce(p_provider, ''))) not between 1 and 80 then
    raise exception 'invalid_notification_provider' using errcode = '22023';
  end if;

  return query
  with candidate as (
    select job.id
    from public.notification_jobs job
    where job.id = p_job_id
      and job.status in ('scheduled', 'pending')
      and job.attempt_count < job.max_attempts
    for update skip locked
  ),
  claimed as (
    update public.notification_jobs job
    set status = 'processing',
        attempt_count = job.attempt_count + 1,
        provider = trim(p_provider),
        last_error = '',
        scheduled_for = least(job.scheduled_for, now()),
        updated_at = now()
    from candidate
    where job.id = candidate.id
    returning job.*
  ),
  attempts as (
    insert into public.notification_attempts (
      business_id,
      job_id,
      attempt_number,
      provider,
      status
    )
    select
      claimed.business_id,
      claimed.id,
      claimed.attempt_count,
      trim(p_provider),
      'processing'
    from claimed
    returning job_id
  )
  select
    claimed.id,
    claimed.business_id,
    claimed.booking_id,
    claimed.event_type,
    claimed.channel,
    claimed.locale,
    claimed.recipient_email,
    claimed.subject,
    claimed.body,
    claimed.payload,
    claimed.attempt_count,
    claimed.idempotency_key,
    coalesce(nullif(trim(settings.from_name), ''), 'OneStudio OS'),
    settings.reply_to_email
  from claimed
  join attempts on attempts.job_id = claimed.id
  left join public.business_notification_settings settings
    on settings.business_id = claimed.business_id;
end;
$$;

revoke all on function public.claim_notification_job(uuid, text)
  from public, anon, authenticated;
grant execute on function public.claim_notification_job(uuid, text)
  to service_role;

comment on function public.delete_admin_booking(uuid) is
  'Permanently removes an unprotected booking while preserving immutable notification delivery history.';
comment on function public.claim_notification_job(uuid, text) is
  'Claims one exact queued notification for an explicit operator-triggered delivery, regardless of its scheduled time.';
