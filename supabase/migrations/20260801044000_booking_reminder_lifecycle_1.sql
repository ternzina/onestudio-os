-- OneStudio OS Booking Reminder Lifecycle 1.0
-- Keeps reminder jobs aligned with the current booking date, language and status.
-- The protected cron prepares missing reminders before delivering due queue items.

create or replace function public.refresh_booking_reminder(p_booking_id uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_settings public.business_notification_settings%rowtype;
  v_reminder_at timestamptz;
  v_key text;
  v_job_id uuid;
begin
  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id;

  if not found then
    return null;
  end if;

  select settings.*
  into v_settings
  from public.business_notification_settings settings
  where settings.business_id = v_booking.business_id;

  if v_booking.status not in ('pending', 'confirmed')
     or v_booking.starts_at <= now()
     or v_settings.business_id is null
     or not v_settings.reminder_enabled then
    update public.notification_jobs
    set status = 'cancelled',
        cancelled_at = coalesce(cancelled_at, now()),
        updated_at = now()
    where booking_id = v_booking.id
      and business_id = v_booking.business_id
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending', 'failed');

    return null;
  end if;

  v_reminder_at := greatest(
    now(),
    v_booking.starts_at - make_interval(mins => v_settings.reminder_minutes)
  );

  v_key := concat(
    'booking:', v_booking.id::text,
    ':reminder:', v_settings.reminder_minutes::text,
    ':start:', floor(extract(epoch from v_booking.starts_at))::bigint::text,
    ':locale:', lower(coalesce(nullif(v_booking.locale, ''), 'en')),
    ':client:', v_booking.client_id::text,
    ':service:', v_booking.service_id::text
  );

  update public.notification_jobs
  set status = 'cancelled',
      cancelled_at = coalesce(cancelled_at, now()),
      updated_at = now()
  where booking_id = v_booking.id
    and business_id = v_booking.business_id
    and event_type = 'booking_reminder'
    and status in ('scheduled', 'pending', 'failed')
    and idempotency_key <> v_key;

  select job.id
  into v_job_id
  from public.notification_jobs job
  where job.business_id = v_booking.business_id
    and job.idempotency_key = v_key;

  if found then
    return v_job_id;
  end if;

  return public.create_notification_job(
    v_booking.id,
    'booking_reminder',
    v_reminder_at,
    v_key,
    jsonb_build_object(
      'reminder_minutes', v_settings.reminder_minutes,
      'booking_starts_at', v_booking.starts_at::text
    ),
    null
  );
end;
$$;

create or replace function public.enqueue_booking_notification_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event text;
  v_key text;
begin
  if tg_op = 'INSERT' then
    v_event := case
      when new.status = 'confirmed' then 'booking_confirmed'
      when new.status in ('pending', 'hold') then 'booking_pending'
      else null
    end;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    v_event := case
      when new.status = 'confirmed' then 'booking_confirmed'
      when new.status in ('pending', 'hold') then 'booking_pending'
      when new.status = 'cancelled' then 'booking_cancelled'
      else null
    end;
  end if;

  if v_event is not null then
    v_key := concat('booking:', new.id::text, ':', v_event, ':', new.status);
    perform public.create_notification_job(
      new.id,
      v_event,
      now(),
      v_key,
      '{}'::jsonb,
      null
    );
  end if;

  perform public.refresh_booking_reminder(new.id);
  return new;
exception
  when others then
    -- Notification preparation must never make a booking mutation fail.
    return new;
end;
$$;

drop trigger if exists bookings_enqueue_notification on public.bookings;
create trigger bookings_enqueue_notification
after insert or update of status, starts_at, ends_at, locale, client_id, service_id
on public.bookings
for each row execute function public.enqueue_booking_notification_trigger();

create or replace function public.schedule_booking_reminders(
  p_business_id uuid,
  p_until timestamptz default (now() + interval '30 days')
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.business_notification_settings%rowtype;
  v_booking record;
  v_count integer := 0;
  v_job_id uuid;
begin
  if not (
    public.can_operate_business(p_business_id)
    or public.is_notification_service_role()
  ) then
    raise exception 'notification_operation_forbidden' using errcode = '42501';
  end if;

  if p_until is null or p_until < now() or p_until > now() + interval '366 days' then
    raise exception 'invalid_notification_schedule_window' using errcode = '22023';
  end if;

  select settings.*
  into v_settings
  from public.business_notification_settings settings
  where settings.business_id = p_business_id;

  if v_settings.business_id is null or not v_settings.reminder_enabled then
    return 0;
  end if;

  update public.notification_jobs job
  set status = 'cancelled',
      cancelled_at = coalesce(job.cancelled_at, now()),
      updated_at = now()
  where job.business_id = p_business_id
    and job.event_type = 'booking_reminder'
    and job.status in ('scheduled', 'pending', 'failed')
    and not exists (
      select 1
      from public.bookings booking
      where booking.id = job.booking_id
        and booking.business_id = job.business_id
        and booking.status in ('pending', 'confirmed')
        and booking.starts_at > now()
    );

  for v_booking in
    select booking.id
    from public.bookings booking
    join public.clients client
      on client.id = booking.client_id
     and client.business_id = booking.business_id
    where booking.business_id = p_business_id
      and booking.status in ('pending', 'confirmed')
      and booking.starts_at > now()
      and booking.starts_at
            - make_interval(mins => v_settings.reminder_minutes) <= p_until
      and client.email is not null
      and trim(client.email) <> ''
    order by booking.starts_at
  loop
    v_job_id := public.refresh_booking_reminder(v_booking.id);

    if v_job_id is not null
       and exists (
         select 1
         from public.notification_jobs job
         where job.id = v_job_id
           and job.status in ('scheduled', 'pending', 'processing', 'sent')
       ) then
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

create or replace function public.schedule_all_booking_reminders(
  p_until timestamptz default (now() + interval '30 days')
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business record;
  v_count integer := 0;
begin
  if not public.is_notification_service_role() then
    raise exception 'notification_provider_forbidden' using errcode = '42501';
  end if;

  if p_until is null or p_until < now() or p_until > now() + interval '366 days' then
    raise exception 'invalid_notification_schedule_window' using errcode = '22023';
  end if;

  for v_business in
    select settings.business_id
    from public.business_notification_settings settings
    join public.businesses business on business.id = settings.business_id
    where settings.reminder_enabled = true
      and business.status <> 'archived'
    order by settings.business_id
  loop
    v_count := v_count
      + public.schedule_booking_reminders(v_business.business_id, p_until);
  end loop;

  return v_count;
end;
$$;

create or replace function public.update_admin_notification_settings(
  p_business_id uuid,
  p_from_name text,
  p_reply_to_email text,
  p_reminder_enabled boolean,
  p_reminder_minutes integer,
  p_max_attempts integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reply text := nullif(lower(trim(coalesce(p_reply_to_email, ''))), '');
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'notification_operation_forbidden' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_from_name, ''))) not between 1 and 160 then
    raise exception 'invalid_notification_from_name' using errcode = '22023';
  end if;

  if v_reply is not null
    and v_reply !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_notification_reply_to' using errcode = '22023';
  end if;

  if p_reminder_minutes not between 5 and 10080 then
    raise exception 'invalid_notification_reminder_minutes' using errcode = '22023';
  end if;

  if p_max_attempts not between 1 and 10 then
    raise exception 'invalid_notification_max_attempts' using errcode = '22023';
  end if;

  insert into public.business_notification_settings (
    business_id,
    from_name,
    reply_to_email,
    reminder_enabled,
    reminder_minutes,
    max_attempts
  ) values (
    p_business_id,
    trim(p_from_name),
    v_reply,
    coalesce(p_reminder_enabled, true),
    p_reminder_minutes,
    p_max_attempts
  )
  on conflict (business_id) do update set
    from_name = excluded.from_name,
    reply_to_email = excluded.reply_to_email,
    reminder_enabled = excluded.reminder_enabled,
    reminder_minutes = excluded.reminder_minutes,
    max_attempts = excluded.max_attempts,
    updated_at = now();

  update public.notification_jobs
  set status = 'cancelled',
      cancelled_at = coalesce(cancelled_at, now()),
      updated_at = now()
  where business_id = p_business_id
    and event_type = 'booking_reminder'
    and status in ('scheduled', 'pending', 'failed')
    and (
      not coalesce(p_reminder_enabled, true)
      or coalesce((payload->>'reminder_minutes')::integer, -1) <> p_reminder_minutes
    );

  if coalesce(p_reminder_enabled, true) then
    perform public.schedule_booking_reminders(
      p_business_id,
      now() + interval '365 days'
    );
  end if;

  return true;
end;
$$;

drop function if exists public.claim_notification_jobs(text, integer);

create function public.claim_notification_jobs(
  p_provider text,
  p_limit integer default 25
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
security definer
set search_path = public
as $$
begin
  if not public.is_notification_service_role() then
    raise exception 'notification_provider_forbidden' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_provider, ''))) not between 1 and 80 then
    raise exception 'invalid_notification_provider' using errcode = '22023';
  end if;

  if p_limit not between 1 and 100 then
    raise exception 'invalid_notification_claim_limit' using errcode = '22023';
  end if;

  update public.notification_jobs job
  set status = 'cancelled',
      cancelled_at = coalesce(job.cancelled_at, now()),
      updated_at = now()
  where job.event_type = 'booking_reminder'
    and job.status in ('scheduled', 'pending', 'failed')
    and not exists (
      select 1
      from public.bookings booking
      join public.business_notification_settings settings
        on settings.business_id = booking.business_id
       and settings.reminder_enabled = true
      where booking.id = job.booking_id
        and booking.business_id = job.business_id
        and booking.status in ('pending', 'confirmed')
        and booking.starts_at > now()
        and (
          not (job.payload ? 'booking_starts_at')
          or job.payload->>'booking_starts_at' = booking.starts_at::text
        )
    );

  return query
  with candidates as (
    select job.id
    from public.notification_jobs job
    where job.status in ('scheduled', 'pending')
      and job.scheduled_for <= now()
      and job.attempt_count < job.max_attempts
      and (
        job.event_type <> 'booking_reminder'
        or exists (
          select 1
          from public.bookings booking
          join public.business_notification_settings settings
            on settings.business_id = booking.business_id
           and settings.reminder_enabled = true
          where booking.id = job.booking_id
            and booking.business_id = job.business_id
            and booking.status in ('pending', 'confirmed')
            and booking.starts_at > now()
            and (
              not (job.payload ? 'booking_starts_at')
              or job.payload->>'booking_starts_at' = booking.starts_at::text
            )
        )
      )
    order by job.scheduled_for, job.created_at
    for update skip locked
    limit p_limit
  ),
  claimed as (
    update public.notification_jobs job
    set status = 'processing',
        attempt_count = job.attempt_count + 1,
        provider = trim(p_provider),
        last_error = '',
        updated_at = now()
    from candidates
    where job.id = candidates.id
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
    on settings.business_id = claimed.business_id
  order by claimed.scheduled_for, claimed.created_at;
end;
$$;

create or replace function public.apply_booking_reminder_module_capabilities()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.module_key = 'notifications' then
    new.config := coalesce(new.config, '{}'::jsonb)
      || jsonb_build_object(
        'booking_reminders', true,
        'reschedule_safe_reminders', true,
        'cancel_safe_reminders', true,
        'cron_reminder_preparation', true
      );
  end if;

  return new;
end;
$$;

drop trigger if exists apply_booking_reminder_module_capabilities
  on public.business_modules;

create trigger apply_booking_reminder_module_capabilities
before insert or update of module_key, version, config
on public.business_modules
for each row
execute function public.apply_booking_reminder_module_capabilities();

update public.business_modules
set config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'booking_reminders', true,
        'reschedule_safe_reminders', true,
        'cancel_safe_reminders', true,
        'cron_reminder_preparation', true
      ),
    updated_at = now()
where module_key = 'notifications';

select public.refresh_booking_reminder(booking.id)
from public.bookings booking
where booking.status in ('pending', 'confirmed')
  and booking.starts_at > now();

revoke all on function public.refresh_booking_reminder(uuid)
  from public, anon, authenticated;
revoke all on function public.schedule_all_booking_reminders(timestamptz)
  from public, anon, authenticated;
revoke all on function public.claim_notification_jobs(text, integer)
  from public, anon, authenticated;
revoke all on function public.apply_booking_reminder_module_capabilities()
  from public, anon, authenticated;

grant execute on function public.schedule_all_booking_reminders(timestamptz)
  to service_role;
grant execute on function public.claim_notification_jobs(text, integer)
  to service_role;

comment on function public.refresh_booking_reminder(uuid) is
  'Keeps exactly one current unsent reminder generation for an active future booking and cancels stale generations after rescheduling, locale changes or cancellation.';
comment on function public.schedule_all_booking_reminders(timestamptz) is
  'Service-role cron seam that prepares missing reminders across every active workspace before provider delivery.';
comment on function public.claim_notification_jobs(text, integer) is
  'Service-role provider seam that excludes stale or cancelled booking reminders before claiming due notification jobs.';
