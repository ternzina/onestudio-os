-- OneStudio OS LiqPay Adapter 1.0
-- Authorized booking balance seam for LiqPay Checkout.

create or replace function public.get_liqpay_checkout_booking(p_booking_id uuid)
returns table (
  business_id uuid,
  booking_id uuid,
  reference text,
  booking_status text,
  client_name text,
  client_email text,
  service_title text,
  due_minor integer,
  currency text,
  payment_required boolean,
  locale text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  select
    booking.business_id,
    booking.id,
    booking.reference,
    booking.status,
    client.name,
    client.email,
    service.title,
    greatest(0, booking.total_minor - greatest(0, booking.paid_minor - booking.refunded_minor))::integer,
    booking.currency,
    booking.payment_required,
    coalesce(booking.locale, 'uk')
  from public.bookings booking
  join public.clients client
    on client.id = booking.client_id
   and client.business_id = booking.business_id
  join public.services service
    on service.id = booking.service_id
   and service.business_id = booking.business_id
  where booking.id = p_booking_id
    and booking.status not in ('draft', 'cancelled')
    and public.can_operate_business(booking.business_id);
end;
$$;

revoke all on function public.get_liqpay_checkout_booking(uuid) from public, anon;
grant execute on function public.get_liqpay_checkout_booking(uuid) to authenticated, service_role;

comment on function public.get_liqpay_checkout_booking(uuid) is
  'Returns one authorized booking balance for server-side LiqPay Checkout creation.';
