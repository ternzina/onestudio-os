-- OneStudio OS: public booking calendar availability 1.0
-- Exposes only aggregate day status for the public storefront calendar.

create or replace function public.get_public_service_availability_calendar(
  p_business_slug text,
  p_service_slug text,
  p_start_date date,
  p_end_date date,
  p_duration_minutes integer default null,
  p_party_size integer default 1
)
returns table (
  calendar_date date,
  available_slot_count bigint,
  has_bookings boolean,
  availability_status text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_service_id uuid;
  v_timezone text;
  v_duration integer;
  v_capacity integer;
begin
  if p_start_date is null
     or p_end_date is null
     or p_end_date < p_start_date
     or p_end_date - p_start_date > 62
     or coalesce(p_party_size, 0) <= 0 then
    return;
  end if;

  select
    business.id,
    service.id,
    business.timezone,
    coalesce(p_duration_minutes, service.duration_min_minutes),
    service.capacity
  into
    v_business_id,
    v_service_id,
    v_timezone,
    v_duration,
    v_capacity
  from public.businesses business
  join public.services service
    on service.business_id = business.id
  where business.slug = lower(trim(coalesce(p_business_slug, '')))
    and business.status = 'active'
    and service.slug = lower(trim(coalesce(p_service_slug, '')))
    and service.is_active = true
    and service.is_public = true
    and exists (
      select 1
      from public.service_resources link
      join public.resources resource
        on resource.id = link.resource_id
       and resource.business_id = link.business_id
      where link.business_id = business.id
        and link.service_id = service.id
        and link.allocation_mode = 'required'
        and resource.is_active = true
        and resource.is_bookable = true
    );

  if v_business_id is null
     or v_service_id is null
     or v_timezone is null
     or v_duration is null
     or v_duration <= 0
     or v_duration > 1440
     or p_party_size > v_capacity then
    return;
  end if;

  return query
  with days as (
    select generated.day_value::date as day_value
    from generate_series(
      p_start_date::timestamp,
      p_end_date::timestamp,
      interval '1 day'
    ) generated(day_value)
  ),
  summaries as (
    select
      day.day_value,
      (
        select count(*)
        from public.get_service_available_slots(
          v_business_id,
          v_service_id,
          day.day_value,
          v_duration,
          p_party_size
        )
      )::bigint as slot_count,
      exists (
        select 1
        from public.booking_allocations allocation
        join public.service_resources link
          on link.business_id = allocation.business_id
         and link.resource_id = allocation.resource_id
         and link.service_id = v_service_id
         and link.allocation_mode = 'required'
        where allocation.business_id = v_business_id
          and allocation.status in ('held', 'confirmed')
          and allocation.starts_at < ((day.day_value + 1)::timestamp at time zone v_timezone)
          and allocation.ends_at > (day.day_value::timestamp at time zone v_timezone)
      ) as contains_booking
    from days day
  )
  select
    summary.day_value,
    summary.slot_count,
    summary.contains_booking,
    case
      when summary.slot_count > 0 and summary.contains_booking then 'partial'
      when summary.slot_count > 0 then 'available'
      when summary.contains_booking then 'full'
      else 'closed'
    end
  from summaries summary
  order by summary.day_value;
end;
$$;

revoke all on function public.get_public_service_availability_calendar(
  text,
  text,
  date,
  date,
  integer,
  integer
) from public, anon, authenticated;

grant execute on function public.get_public_service_availability_calendar(
  text,
  text,
  date,
  date,
  integer,
  integer
) to anon, authenticated, service_role;

update public.business_modules
set config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
      'public_booking_calendar_availability', true,
      'public_booking_calendar_privacy_safe', true
    ),
    updated_at = now()
where module_key = 'scheduling';

comment on function public.get_public_service_availability_calendar(
  text,
  text,
  date,
  date,
  integer,
  integer
) is
  'Returns privacy-safe daily availability states for a public service calendar without exposing booking or client records.';
