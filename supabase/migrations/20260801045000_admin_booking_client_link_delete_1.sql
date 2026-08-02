-- OneStudio OS Admin Booking Client Link + Guarded Delete 1.0
-- Adds customer self-service links to admin-created bookings and a protected
-- permanent-delete RPC for test or erroneous bookings without financial history.

create or replace function public.ensure_admin_booking_management_link(
  p_booking_id uuid,
  p_base_url text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_client public.clients%rowtype;
  v_link public.booking_management_links%rowtype;
  v_expires_at timestamptz;
  v_base_url text;
  v_manage_url text;
  v_management_token uuid;
begin
  if p_booking_id is null then
    raise exception 'invalid_booking_management_token' using errcode = '22023';
  end if;

  v_base_url := regexp_replace(trim(coalesce(p_base_url, '')), '/+$', '');
  if char_length(v_base_url) not between 1 and 500
     or v_base_url !~ '^https?://' then
    raise exception 'invalid_booking_management_url' using errcode = '22023';
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    raise exception 'booking_management_booking_not_found' using errcode = 'P0002';
  end if;

  if not public.can_operate_business(v_booking.business_id) then
    raise exception 'booking_operation_forbidden' using errcode = '42501';
  end if;

  select client.*
  into v_client
  from public.clients client
  where client.id = v_booking.client_id
    and client.business_id = v_booking.business_id;

  if v_client.id is null or nullif(trim(coalesce(v_client.email, '')), '') is null then
    raise exception 'booking_management_client_email_required' using errcode = '23514';
  end if;

  v_expires_at := greatest(
    v_booking.ends_at + interval '30 days',
    now() + interval '7 days'
  );

  select link.*
  into v_link
  from public.booking_management_links link
  where link.booking_id = v_booking.id
  for update;

  if not found then
    v_management_token := gen_random_uuid();
    v_manage_url := v_base_url || '/book/manage/' || v_management_token::text;

    insert into public.booking_management_links (
      booking_id,
      business_id,
      token,
      manage_url,
      expires_at
    ) values (
      v_booking.id,
      v_booking.business_id,
      v_management_token,
      v_manage_url,
      v_expires_at
    )
    returning * into v_link;
  else
    v_manage_url := v_base_url || '/book/manage/' || v_link.token::text;
    update public.booking_management_links
    set manage_url = v_manage_url,
        expires_at = greatest(expires_at, v_expires_at),
        updated_at = now()
    where booking_id = v_booking.id
    returning * into v_link;
  end if;

  v_manage_url := v_link.manage_url;

  update public.notification_jobs job
  set payload = coalesce(job.payload, '{}'::jsonb)
        || jsonb_build_object('booking_manage_url', v_manage_url),
      body = case
        when position(v_manage_url in coalesce(job.body, '')) > 0
          then job.body
        when lower(coalesce(job.locale, '')) like 'ru%'
          and char_length(coalesce(job.body, ''))
              + char_length(E'\n\nУправлять бронированием: ' || v_manage_url) <= 20000
          then coalesce(job.body, '')
               || E'\n\nУправлять бронированием: '
               || v_manage_url
        when lower(coalesce(job.locale, '')) not like 'ru%'
          and char_length(coalesce(job.body, ''))
              + char_length(E'\n\nManage your booking: ' || v_manage_url) <= 20000
          then coalesce(job.body, '')
               || E'\n\nManage your booking: '
               || v_manage_url
        else job.body
      end,
      updated_at = now()
  where job.booking_id = v_booking.id
    and job.business_id = v_booking.business_id
    and job.event_type in (
      'booking_pending',
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder'
    )
    and job.status in ('scheduled', 'pending', 'failed');

  return jsonb_build_object(
    'booking_id', v_booking.id,
    'token', v_link.token,
    'manage_url', v_manage_url,
    'expires_at', v_link.expires_at
  );
end;
$$;

revoke all on function public.ensure_admin_booking_management_link(uuid, text)
  from public, anon, authenticated;
grant execute on function public.ensure_admin_booking_management_link(uuid, text)
  to authenticated, service_role;

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

comment on function public.ensure_admin_booking_management_link(uuid, text) is
  'Issues or refreshes a customer self-service link for an operator-managed booking and enriches queued emails.';
comment on function public.delete_admin_booking(uuid) is
  'Permanently removes an erroneous booking only when no payment, document or external-calendar history must be preserved.';
