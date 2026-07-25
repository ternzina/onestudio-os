-- OneStudio OS Notifications Core 1.0
-- Provider-neutral notification templates, queue, delivery attempts and reminder scheduling.

create table if not exists public.business_notification_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  from_name text not null default 'OneStudio OS'
    check (char_length(trim(from_name)) between 1 and 160),
  reply_to_email text,
  reminder_enabled boolean not null default true,
  reminder_minutes integer not null default 1440
    check (reminder_minutes between 5 and 10080),
  max_attempts integer not null default 3
    check (max_attempts between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    reply_to_email is null
    or reply_to_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'booking_pending',
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'payment_received',
      'refund_issued'
    )
  ),
  channel text not null default 'email' check (channel in ('email')),
  locale text not null check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  subject_template text not null
    check (char_length(trim(subject_template)) between 1 and 240),
  body_template text not null
    check (char_length(trim(body_template)) between 1 and 20000),
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, event_type, channel, locale),
  unique (id, business_id)
);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid,
  client_id uuid references public.clients(id) on delete set null,
  payment_transaction_id uuid references public.payment_transactions(id) on delete set null,
  template_id uuid references public.notification_templates(id) on delete set null,
  event_type text not null check (
    event_type in (
      'booking_pending',
      'booking_confirmed',
      'booking_cancelled',
      'booking_reminder',
      'payment_received',
      'refund_issued'
    )
  ),
  channel text not null default 'email' check (channel in ('email')),
  locale text not null check (locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'),
  recipient_email text not null
    check (recipient_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject text not null check (char_length(trim(subject)) between 1 and 240),
  body text not null check (char_length(trim(body)) between 1 and 20000),
  status text not null default 'pending'
    check (status in ('scheduled', 'pending', 'processing', 'sent', 'failed', 'cancelled')),
  scheduled_for timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count between 0 and 100),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  provider text,
  provider_message_id text,
  last_error text not null default '',
  idempotency_key text not null check (char_length(trim(idempotency_key)) between 1 and 240),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  sent_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (booking_id, business_id) references public.bookings(id, business_id) on delete cascade,
  unique (business_id, idempotency_key)
);

create table if not exists public.notification_attempts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  job_id uuid not null references public.notification_jobs(id) on delete cascade,
  attempt_number integer not null check (attempt_number between 1 and 100),
  provider text not null check (char_length(trim(provider)) between 1 and 80),
  status text not null check (status in ('processing', 'sent', 'failed')),
  provider_message_id text,
  error_message text not null default '',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, attempt_number)
);

create index if not exists notification_jobs_business_status_schedule_idx
  on public.notification_jobs (business_id, status, scheduled_for, created_at);
create index if not exists notification_jobs_booking_created_idx
  on public.notification_jobs (booking_id, created_at desc);
create index if not exists notification_jobs_client_created_idx
  on public.notification_jobs (client_id, created_at desc);
create index if not exists notification_attempts_job_created_idx
  on public.notification_attempts (job_id, created_at desc);
create index if not exists notification_templates_business_event_idx
  on public.notification_templates (business_id, event_type, locale);

create or replace function public.is_notification_service_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role';
$$;

create or replace function public.render_notification_text(
  p_template text,
  p_payload jsonb
)
returns text
language plpgsql
immutable
as $$
declare
  v_result text := coalesce(p_template, '');
  v_pair record;
begin
  if jsonb_typeof(coalesce(p_payload, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_notification_payload' using errcode = '22023';
  end if;

  for v_pair in
    select key, value
    from jsonb_each_text(coalesce(p_payload, '{}'::jsonb))
  loop
    v_result := replace(v_result, '{{' || v_pair.key || '}}', coalesce(v_pair.value, ''));
  end loop;

  return v_result;
end;
$$;

create or replace function public.notification_payload_for_booking(
  p_booking_id uuid,
  p_extra jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
begin
  if jsonb_typeof(coalesce(p_extra, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_notification_payload' using errcode = '22023';
  end if;

  select jsonb_build_object(
    'business_name', business.name,
    'client_name', client.name,
    'booking_reference', booking.reference,
    'service_title', service.title,
    'booking_date', to_char(booking.starts_at at time zone booking.timezone, 'YYYY-MM-DD'),
    'booking_time', to_char(booking.starts_at at time zone booking.timezone, 'HH24:MI'),
    'booking_end_time', to_char(booking.ends_at at time zone booking.timezone, 'HH24:MI'),
    'timezone', booking.timezone,
    'total', trim(to_char(booking.total_minor::numeric / 100, 'FM999999990.00')),
    'currency', booking.currency,
    'payment_status', booking.payment_status,
    'booking_status', booking.status
  )
  into v_payload
  from public.bookings booking
  join public.businesses business on business.id = booking.business_id
  join public.clients client on client.id = booking.client_id
  join public.services service on service.id = booking.service_id
  where booking.id = p_booking_id;

  if v_payload is null then
    raise exception 'notification_booking_not_found' using errcode = '23503';
  end if;

  return v_payload || coalesce(p_extra, '{}'::jsonb);
end;
$$;

create or replace function public.create_notification_job(
  p_booking_id uuid,
  p_event_type text,
  p_scheduled_for timestamptz default now(),
  p_idempotency_key text default null,
  p_extra_payload jsonb default '{}'::jsonb,
  p_payment_transaction_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_business public.businesses%rowtype;
  v_client public.clients%rowtype;
  v_settings public.business_notification_settings%rowtype;
  v_template public.notification_templates%rowtype;
  v_locale text;
  v_payload jsonb;
  v_subject text;
  v_body text;
  v_job_id uuid;
  v_key text;
  v_schedule timestamptz := coalesce(p_scheduled_for, now());
begin
  if p_event_type not in (
    'booking_pending',
    'booking_confirmed',
    'booking_cancelled',
    'booking_reminder',
    'payment_received',
    'refund_issued'
  ) then
    raise exception 'invalid_notification_event_type' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_extra_payload, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_notification_payload' using errcode = '22023';
  end if;

  select booking.* into v_booking
  from public.bookings booking
  where booking.id = p_booking_id;

  if not found then
    raise exception 'notification_booking_not_found' using errcode = '23503';
  end if;

  select business.* into v_business
  from public.businesses business
  where business.id = v_booking.business_id;

  select client.* into v_client
  from public.clients client
  where client.id = v_booking.client_id
    and client.business_id = v_booking.business_id;

  if v_client.email is null or trim(v_client.email) = '' then
    return null;
  end if;

  insert into public.business_notification_settings (business_id, from_name)
  values (v_business.id, v_business.name)
  on conflict (business_id) do nothing;

  select settings.* into v_settings
  from public.business_notification_settings settings
  where settings.business_id = v_business.id;

  v_locale := lower(coalesce(
    nullif(v_booking.locale, ''),
    nullif(v_client.locale, ''),
    nullif(v_business.default_locale, ''),
    'en'
  ));

  select template.* into v_template
  from public.notification_templates template
  where template.business_id = v_business.id
    and template.event_type = p_event_type
    and template.channel = 'email'
    and template.is_enabled = true
  order by case
    when template.locale = v_locale then 1
    when template.locale = split_part(v_locale, '-', 1) then 2
    when template.locale = v_business.default_locale then 3
    when template.locale = split_part(v_business.default_locale, '-', 1) then 4
    when template.locale = 'en' then 5
    else 6
  end,
  template.created_at
  limit 1;

  if v_template.id is null then
    return null;
  end if;

  v_payload := public.notification_payload_for_booking(
    p_booking_id,
    coalesce(p_extra_payload, '{}'::jsonb)
  );

  v_subject := public.render_notification_text(v_template.subject_template, v_payload);
  v_body := public.render_notification_text(v_template.body_template, v_payload);
  v_key := nullif(trim(coalesce(p_idempotency_key, '')), '');

  if v_key is null then
    v_key := concat(
      'booking:', p_booking_id::text,
      ':', p_event_type,
      ':', floor(extract(epoch from v_schedule))::bigint::text
    );
  end if;

  insert into public.notification_jobs (
    business_id,
    booking_id,
    client_id,
    payment_transaction_id,
    template_id,
    event_type,
    channel,
    locale,
    recipient_email,
    subject,
    body,
    status,
    scheduled_for,
    max_attempts,
    idempotency_key,
    payload
  ) values (
    v_business.id,
    v_booking.id,
    v_client.id,
    p_payment_transaction_id,
    v_template.id,
    p_event_type,
    'email',
    v_locale,
    lower(trim(v_client.email)),
    v_subject,
    v_body,
    case when v_schedule > now() then 'scheduled' else 'pending' end,
    v_schedule,
    v_settings.max_attempts,
    v_key,
    v_payload
  )
  on conflict (business_id, idempotency_key) do nothing
  returning id into v_job_id;

  if v_job_id is null then
    select job.id into v_job_id
    from public.notification_jobs job
    where job.business_id = v_business.id
      and job.idempotency_key = v_key;
  end if;

  return v_job_id;
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
  v_settings public.business_notification_settings%rowtype;
  v_reminder_at timestamptz;
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

  if new.status = 'cancelled' then
    update public.notification_jobs
    set status = 'cancelled',
        cancelled_at = now(),
        updated_at = now()
    where booking_id = new.id
      and event_type = 'booking_reminder'
      and status in ('scheduled', 'pending', 'failed');
  elsif new.status in ('pending', 'confirmed') and new.starts_at > now() then
    select settings.* into v_settings
    from public.business_notification_settings settings
    where settings.business_id = new.business_id;

    if v_settings.business_id is not null and v_settings.reminder_enabled then
      v_reminder_at := new.starts_at - make_interval(mins => v_settings.reminder_minutes);
      perform public.create_notification_job(
        new.id,
        'booking_reminder',
        greatest(now(), v_reminder_at),
        concat('booking:', new.id::text, ':reminder:', v_settings.reminder_minutes::text),
        jsonb_build_object('reminder_minutes', v_settings.reminder_minutes),
        null
      );
    end if;
  end if;

  return new;
exception
  when others then
    -- Notification preparation must never make a booking mutation fail.
    return new;
end;
$$;

drop trigger if exists bookings_enqueue_notification on public.bookings;
create trigger bookings_enqueue_notification
after insert or update of status on public.bookings
for each row execute function public.enqueue_booking_notification_trigger();

create or replace function public.enqueue_payment_notification_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event text;
  v_extra jsonb;
begin
  v_event := case when new.kind = 'refund' then 'refund_issued' else 'payment_received' end;
  v_extra := jsonb_build_object(
    'payment_amount', trim(to_char(new.amount_minor::numeric / 100, 'FM999999990.00')),
    'payment_currency', new.currency,
    'payment_method', new.method,
    'payment_provider', new.provider,
    'payment_reference', coalesce(new.provider_reference, '')
  );

  perform public.create_notification_job(
    new.booking_id,
    v_event,
    now(),
    concat('payment-transaction:', new.id::text),
    v_extra,
    new.id
  );

  return new;
exception
  when others then
    -- Ledger entries remain final even when a notification cannot be prepared.
    return new;
end;
$$;

drop trigger if exists payment_transactions_enqueue_notification on public.payment_transactions;
create trigger payment_transactions_enqueue_notification
after insert on public.payment_transactions
for each row execute function public.enqueue_payment_notification_trigger();

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
  v_reminder_at timestamptz;
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

  select settings.* into v_settings
  from public.business_notification_settings settings
  where settings.business_id = p_business_id;

  if v_settings.business_id is null or not v_settings.reminder_enabled then
    return 0;
  end if;

  for v_booking in
    select booking.id, booking.starts_at
    from public.bookings booking
    join public.clients client
      on client.id = booking.client_id
     and client.business_id = booking.business_id
    where booking.business_id = p_business_id
      and booking.status in ('pending', 'confirmed')
      and booking.starts_at > now()
      and booking.starts_at - make_interval(mins => v_settings.reminder_minutes) <= p_until
      and client.email is not null
    order by booking.starts_at
  loop
    v_reminder_at := v_booking.starts_at - make_interval(mins => v_settings.reminder_minutes);
    v_job_id := public.create_notification_job(
      v_booking.id,
      'booking_reminder',
      greatest(now(), v_reminder_at),
      concat(
        'booking:', v_booking.id::text,
        ':reminder:', v_settings.reminder_minutes::text
      ),
      jsonb_build_object('reminder_minutes', v_settings.reminder_minutes),
      null
    );

    if v_job_id is not null then
      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;

create or replace function public.get_admin_notification_jobs(
  p_business_id uuid,
  p_status text default null
)
returns table (
  id uuid,
  booking_id uuid,
  booking_reference text,
  client_id uuid,
  client_name text,
  event_type text,
  locale text,
  recipient_email text,
  subject text,
  body text,
  status text,
  scheduled_for timestamptz,
  attempt_count integer,
  max_attempts integer,
  provider text,
  provider_message_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_business(p_business_id) then
    raise exception 'notification_read_forbidden' using errcode = '42501';
  end if;

  if p_status is not null
    and p_status not in ('scheduled', 'pending', 'processing', 'sent', 'failed', 'cancelled') then
    raise exception 'invalid_notification_status' using errcode = '22023';
  end if;

  return query
  select
    job.id,
    job.booking_id,
    booking.reference,
    job.client_id,
    client.name,
    job.event_type,
    job.locale,
    job.recipient_email,
    job.subject,
    job.body,
    job.status,
    job.scheduled_for,
    job.attempt_count,
    job.max_attempts,
    job.provider,
    job.provider_message_id,
    job.last_error,
    job.sent_at,
    job.created_at
  from public.notification_jobs job
  left join public.bookings booking on booking.id = job.booking_id
  left join public.clients client on client.id = job.client_id
  where job.business_id = p_business_id
    and (p_status is null or job.status = p_status)
  order by
    case job.status
      when 'failed' then 1
      when 'pending' then 2
      when 'processing' then 3
      when 'scheduled' then 4
      when 'sent' then 5
      else 6
    end,
    job.scheduled_for desc,
    job.created_at desc;
end;
$$;

create or replace function public.get_admin_notification_attempts(p_job_id uuid)
returns table (
  id uuid,
  attempt_number integer,
  provider text,
  status text,
  provider_message_id text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  select job.business_id into v_business_id
  from public.notification_jobs job
  where job.id = p_job_id;

  if v_business_id is null then
    raise exception 'notification_job_not_found' using errcode = '23503';
  end if;

  if not public.can_view_business(v_business_id) then
    raise exception 'notification_read_forbidden' using errcode = '42501';
  end if;

  return query
  select
    attempt.id,
    attempt.attempt_number,
    attempt.provider,
    attempt.status,
    attempt.provider_message_id,
    attempt.error_message,
    attempt.started_at,
    attempt.finished_at,
    attempt.created_at
  from public.notification_attempts attempt
  where attempt.job_id = p_job_id
  order by attempt.attempt_number desc;
end;
$$;

create or replace function public.get_admin_notification_templates(p_business_id uuid)
returns table (
  id uuid,
  event_type text,
  channel text,
  locale text,
  subject_template text,
  body_template text,
  is_enabled boolean,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_business(p_business_id) then
    raise exception 'notification_read_forbidden' using errcode = '42501';
  end if;

  return query
  select
    template.id,
    template.event_type,
    template.channel,
    template.locale,
    template.subject_template,
    template.body_template,
    template.is_enabled,
    template.updated_at
  from public.notification_templates template
  where template.business_id = p_business_id
  order by template.event_type, template.locale;
end;
$$;

create or replace function public.upsert_admin_notification_template(
  p_business_id uuid,
  p_event_type text,
  p_locale text,
  p_subject_template text,
  p_body_template text,
  p_is_enabled boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_locale text := lower(trim(coalesce(p_locale, '')));
begin
  if not public.can_configure_business(p_business_id) then
    raise exception 'notification_operation_forbidden' using errcode = '42501';
  end if;

  if p_event_type not in (
    'booking_pending',
    'booking_confirmed',
    'booking_cancelled',
    'booking_reminder',
    'payment_received',
    'refund_issued'
  ) then
    raise exception 'invalid_notification_event_type' using errcode = '22023';
  end if;

  if v_locale !~ '^[a-z]{2,3}(-[a-z]{2})?$' then
    raise exception 'invalid_notification_locale' using errcode = '22023';
  end if;

  if char_length(trim(coalesce(p_subject_template, ''))) not between 1 and 240 then
    raise exception 'invalid_notification_subject' using errcode = '22023';
  end if;

  if char_length(trim(coalesce(p_body_template, ''))) not between 1 and 20000 then
    raise exception 'invalid_notification_body' using errcode = '22023';
  end if;

  insert into public.notification_templates (
    business_id,
    event_type,
    channel,
    locale,
    subject_template,
    body_template,
    is_enabled
  ) values (
    p_business_id,
    p_event_type,
    'email',
    v_locale,
    trim(p_subject_template),
    trim(p_body_template),
    coalesce(p_is_enabled, true)
  )
  on conflict (business_id, event_type, channel, locale) do update set
    subject_template = excluded.subject_template,
    body_template = excluded.body_template,
    is_enabled = excluded.is_enabled,
    updated_at = now()
  returning id into v_id;

  return v_id;
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
      cancelled_at = now(),
      updated_at = now()
  where business_id = p_business_id
    and event_type = 'booking_reminder'
    and status in ('scheduled', 'pending', 'failed')
    and (
      not coalesce(p_reminder_enabled, true)
      or coalesce((payload->>'reminder_minutes')::integer, -1) <> p_reminder_minutes
    );

  return true;
end;
$$;

create or replace function public.retry_admin_notification(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.notification_jobs%rowtype;
begin
  select job.* into v_job
  from public.notification_jobs job
  where job.id = p_job_id
  for update;

  if not found then
    raise exception 'notification_job_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_job.business_id) then
    raise exception 'notification_operation_forbidden' using errcode = '42501';
  end if;

  if v_job.status not in ('failed', 'cancelled') then
    raise exception 'notification_retry_not_allowed' using errcode = '55000';
  end if;

  update public.notification_jobs
  set status = 'pending',
      scheduled_for = now(),
      provider = null,
      provider_message_id = null,
      last_error = '',
      cancelled_at = null,
      updated_at = now()
  where id = p_job_id;

  return true;
end;
$$;

create or replace function public.cancel_admin_notification(p_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.notification_jobs%rowtype;
begin
  select job.* into v_job
  from public.notification_jobs job
  where job.id = p_job_id
  for update;

  if not found then
    raise exception 'notification_job_not_found' using errcode = '23503';
  end if;

  if not public.can_operate_business(v_job.business_id) then
    raise exception 'notification_operation_forbidden' using errcode = '42501';
  end if;

  if v_job.status not in ('scheduled', 'pending', 'failed') then
    raise exception 'notification_cancel_not_allowed' using errcode = '55000';
  end if;

  update public.notification_jobs
  set status = 'cancelled',
      cancelled_at = now(),
      updated_at = now()
  where id = p_job_id;

  return true;
end;
$$;

create or replace function public.claim_notification_jobs(
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
  attempt_number integer
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

  return query
  with candidates as (
    select job.id
    from public.notification_jobs job
    where job.status in ('scheduled', 'pending')
      and job.scheduled_for <= now()
      and job.attempt_count < job.max_attempts
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
    claimed.attempt_count
  from claimed
  join attempts on attempts.job_id = claimed.id
  order by claimed.scheduled_for, claimed.created_at;
end;
$$;

create or replace function public.mark_notification_sent(
  p_job_id uuid,
  p_provider_message_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.notification_jobs%rowtype;
begin
  if not public.is_notification_service_role() then
    raise exception 'notification_provider_forbidden' using errcode = '42501';
  end if;

  select job.* into v_job
  from public.notification_jobs job
  where job.id = p_job_id
  for update;

  if not found then
    raise exception 'notification_job_not_found' using errcode = '23503';
  end if;

  if v_job.status <> 'processing' then
    raise exception 'notification_job_not_processing' using errcode = '55000';
  end if;

  update public.notification_jobs
  set status = 'sent',
      provider_message_id = nullif(trim(coalesce(p_provider_message_id, '')), ''),
      sent_at = now(),
      updated_at = now()
  where id = p_job_id;

  update public.notification_attempts
  set status = 'sent',
      provider_message_id = nullif(trim(coalesce(p_provider_message_id, '')), ''),
      finished_at = now()
  where job_id = p_job_id
    and attempt_number = v_job.attempt_count;

  return true;
end;
$$;

create or replace function public.mark_notification_failed(
  p_job_id uuid,
  p_error text,
  p_retry_at timestamptz default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.notification_jobs%rowtype;
  v_next_status text;
begin
  if not public.is_notification_service_role() then
    raise exception 'notification_provider_forbidden' using errcode = '42501';
  end if;

  select job.* into v_job
  from public.notification_jobs job
  where job.id = p_job_id
  for update;

  if not found then
    raise exception 'notification_job_not_found' using errcode = '23503';
  end if;

  if v_job.status <> 'processing' then
    raise exception 'notification_job_not_processing' using errcode = '55000';
  end if;

  v_next_status := case
    when v_job.attempt_count < v_job.max_attempts and p_retry_at is not null
      then case when p_retry_at > now() then 'scheduled' else 'pending' end
    else 'failed'
  end;

  update public.notification_jobs
  set status = v_next_status,
      scheduled_for = case
        when v_next_status in ('scheduled', 'pending') then coalesce(p_retry_at, now())
        else scheduled_for
      end,
      last_error = left(coalesce(p_error, 'notification_provider_failed'), 4000),
      updated_at = now()
  where id = p_job_id;

  update public.notification_attempts
  set status = 'failed',
      error_message = left(coalesce(p_error, 'notification_provider_failed'), 4000),
      finished_at = now()
  where job_id = p_job_id
    and attempt_number = v_job.attempt_count;

  return true;
end;
$$;

create or replace function public.protect_notification_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'notification_attempt_immutable' using errcode = '55000';
  end if;

  if old.status in ('sent', 'failed') then
    raise exception 'notification_attempt_immutable' using errcode = '55000';
  end if;

  if new.job_id is distinct from old.job_id
    or new.business_id is distinct from old.business_id
    or new.attempt_number is distinct from old.attempt_number
    or new.provider is distinct from old.provider
    or new.started_at is distinct from old.started_at then
    raise exception 'notification_attempt_identity_immutable' using errcode = '55000';
  end if;

  return new;
end;
$$;

drop trigger if exists notification_attempts_immutable on public.notification_attempts;
create trigger notification_attempts_immutable
before update or delete on public.notification_attempts
for each row execute function public.protect_notification_attempt();

create or replace function public.touch_notification_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists business_notification_settings_touch on public.business_notification_settings;
create trigger business_notification_settings_touch
before update on public.business_notification_settings
for each row execute function public.touch_notification_updated_at();

drop trigger if exists notification_templates_touch on public.notification_templates;
create trigger notification_templates_touch
before update on public.notification_templates
for each row execute function public.touch_notification_updated_at();

create or replace function public.seed_notification_defaults_for_business(p_business_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
begin
  select business.* into v_business
  from public.businesses business
  where business.id = p_business_id;

  if not found then
    raise exception 'notification_business_not_found' using errcode = '23503';
  end if;

  insert into public.business_notification_settings (business_id, from_name)
  values (v_business.id, v_business.name)
  on conflict (business_id) do nothing;

  insert into public.notification_templates (
    business_id, event_type, channel, locale, subject_template, body_template
  ) values
    (v_business.id, 'booking_pending', 'email', 'en',
      'Booking {{booking_reference}} is awaiting confirmation',
      E'Hello {{client_name}},\n\nYour booking for {{service_title}} on {{booking_date}} at {{booking_time}} is awaiting confirmation.\n\nReference: {{booking_reference}}\n{{business_name}}'),
    (v_business.id, 'booking_confirmed', 'email', 'en',
      'Booking {{booking_reference}} confirmed',
      E'Hello {{client_name}},\n\nYour booking for {{service_title}} on {{booking_date}} at {{booking_time}} is confirmed.\n\nReference: {{booking_reference}}\n{{business_name}}'),
    (v_business.id, 'booking_cancelled', 'email', 'en',
      'Booking {{booking_reference}} cancelled',
      E'Hello {{client_name}},\n\nYour booking {{booking_reference}} for {{service_title}} has been cancelled.\n\n{{business_name}}'),
    (v_business.id, 'booking_reminder', 'email', 'en',
      'Reminder: {{service_title}} on {{booking_date}}',
      E'Hello {{client_name}},\n\nThis is a reminder about {{service_title}} on {{booking_date}} at {{booking_time}}.\n\nReference: {{booking_reference}}\n{{business_name}}'),
    (v_business.id, 'payment_received', 'email', 'en',
      'Payment received for {{booking_reference}}',
      E'Hello {{client_name}},\n\nWe received {{payment_amount}} {{payment_currency}} for booking {{booking_reference}}.\n\n{{business_name}}'),
    (v_business.id, 'refund_issued', 'email', 'en',
      'Refund issued for {{booking_reference}}',
      E'Hello {{client_name}},\n\nA refund of {{payment_amount}} {{payment_currency}} was recorded for booking {{booking_reference}}.\n\n{{business_name}}'),
    (v_business.id, 'booking_pending', 'email', 'ru',
      'Бронирование {{booking_reference}} ожидает подтверждения',
      E'Здравствуйте, {{client_name}}!\n\nВаша запись на {{service_title}} {{booking_date}} в {{booking_time}} ожидает подтверждения.\n\nНомер: {{booking_reference}}\n{{business_name}}'),
    (v_business.id, 'booking_confirmed', 'email', 'ru',
      'Бронирование {{booking_reference}} подтверждено',
      E'Здравствуйте, {{client_name}}!\n\nВаша запись на {{service_title}} {{booking_date}} в {{booking_time}} подтверждена.\n\nНомер: {{booking_reference}}\n{{business_name}}'),
    (v_business.id, 'booking_cancelled', 'email', 'ru',
      'Бронирование {{booking_reference}} отменено',
      E'Здравствуйте, {{client_name}}!\n\nБронирование {{booking_reference}} на {{service_title}} отменено.\n\n{{business_name}}'),
    (v_business.id, 'booking_reminder', 'email', 'ru',
      'Напоминание: {{service_title}} {{booking_date}}',
      E'Здравствуйте, {{client_name}}!\n\nНапоминаем о записи на {{service_title}} {{booking_date}} в {{booking_time}}.\n\nНомер: {{booking_reference}}\n{{business_name}}'),
    (v_business.id, 'payment_received', 'email', 'ru',
      'Оплата получена по бронированию {{booking_reference}}',
      E'Здравствуйте, {{client_name}}!\n\nМы получили оплату {{payment_amount}} {{payment_currency}} по бронированию {{booking_reference}}.\n\n{{business_name}}'),
    (v_business.id, 'refund_issued', 'email', 'ru',
      'Возврат оформлен по бронированию {{booking_reference}}',
      E'Здравствуйте, {{client_name}}!\n\nПо бронированию {{booking_reference}} оформлен возврат {{payment_amount}} {{payment_currency}}.\n\n{{business_name}}')
  on conflict (business_id, event_type, channel, locale) do nothing;

  return true;
end;
$$;

create or replace function public.seed_business_notification_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_notification_defaults_for_business(new.id);
  return new;
end;
$$;

drop trigger if exists businesses_seed_notification_defaults on public.businesses;
create trigger businesses_seed_notification_defaults
after insert on public.businesses
for each row execute function public.seed_business_notification_defaults();

select public.seed_notification_defaults_for_business(business.id)
from public.businesses business;

alter table public.business_notification_settings enable row level security;
alter table public.notification_templates enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.notification_attempts enable row level security;

drop policy if exists "Members read notification settings" on public.business_notification_settings;
create policy "Members read notification settings" on public.business_notification_settings
for select to authenticated
using (public.can_view_business(business_id));

drop policy if exists "Members read notification templates" on public.notification_templates;
create policy "Members read notification templates" on public.notification_templates
for select to authenticated
using (public.can_view_business(business_id));

drop policy if exists "Members read notification jobs" on public.notification_jobs;
create policy "Members read notification jobs" on public.notification_jobs
for select to authenticated
using (public.can_view_business(business_id));

drop policy if exists "Members read notification attempts" on public.notification_attempts;
create policy "Members read notification attempts" on public.notification_attempts
for select to authenticated
using (public.can_view_business(business_id));

revoke all on table public.business_notification_settings,
  public.notification_templates,
  public.notification_jobs,
  public.notification_attempts
from anon, authenticated;

grant select on table public.business_notification_settings,
  public.notification_templates,
  public.notification_jobs,
  public.notification_attempts
to authenticated;

grant select, insert, update, delete on table public.business_notification_settings,
  public.notification_templates,
  public.notification_jobs,
  public.notification_attempts
to service_role;

revoke all on function public.is_notification_service_role() from public, anon, authenticated;
revoke all on function public.render_notification_text(text, jsonb) from public, anon, authenticated;
revoke all on function public.notification_payload_for_booking(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.create_notification_job(uuid, text, timestamptz, text, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.enqueue_booking_notification_trigger() from public, anon, authenticated;
revoke all on function public.enqueue_payment_notification_trigger() from public, anon, authenticated;
revoke all on function public.schedule_booking_reminders(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.get_admin_notification_jobs(uuid, text) from public, anon, authenticated;
revoke all on function public.get_admin_notification_attempts(uuid) from public, anon, authenticated;
revoke all on function public.get_admin_notification_templates(uuid) from public, anon, authenticated;
revoke all on function public.upsert_admin_notification_template(uuid, text, text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.update_admin_notification_settings(uuid, text, text, boolean, integer, integer) from public, anon, authenticated;
revoke all on function public.retry_admin_notification(uuid) from public, anon, authenticated;
revoke all on function public.cancel_admin_notification(uuid) from public, anon, authenticated;
revoke all on function public.claim_notification_jobs(text, integer) from public, anon, authenticated;
revoke all on function public.mark_notification_sent(uuid, text) from public, anon, authenticated;
revoke all on function public.mark_notification_failed(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.protect_notification_attempt() from public, anon, authenticated;
revoke all on function public.touch_notification_updated_at() from public, anon, authenticated;
revoke all on function public.seed_notification_defaults_for_business(uuid) from public, anon, authenticated;
revoke all on function public.seed_business_notification_defaults() from public, anon, authenticated;

grant execute on function public.get_admin_notification_jobs(uuid, text) to authenticated, service_role;
grant execute on function public.get_admin_notification_attempts(uuid) to authenticated, service_role;
grant execute on function public.get_admin_notification_templates(uuid) to authenticated, service_role;
grant execute on function public.upsert_admin_notification_template(uuid, text, text, text, text, boolean) to authenticated, service_role;
grant execute on function public.update_admin_notification_settings(uuid, text, text, boolean, integer, integer) to authenticated, service_role;
grant execute on function public.retry_admin_notification(uuid) to authenticated, service_role;
grant execute on function public.cancel_admin_notification(uuid) to authenticated, service_role;
grant execute on function public.schedule_booking_reminders(uuid, timestamptz) to authenticated, service_role;

grant execute on function public.is_notification_service_role() to service_role;
grant execute on function public.claim_notification_jobs(text, integer) to service_role;
grant execute on function public.mark_notification_sent(uuid, text) to service_role;
grant execute on function public.mark_notification_failed(uuid, text, timestamptz) to service_role;
grant execute on function public.create_notification_job(uuid, text, timestamptz, text, jsonb, uuid) to service_role;
grant execute on function public.render_notification_text(text, jsonb) to service_role;
grant execute on function public.notification_payload_for_booking(uuid, jsonb) to service_role;
grant execute on function public.seed_notification_defaults_for_business(uuid) to service_role;

create or replace function public.seed_business_modules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_modules (business_id, module_key, enabled, version, config)
  values
    (new.id, 'core', true, '1.1.0', '{}'::jsonb),
    (new.id, 'media', true, '1.0.0', '{}'::jsonb),
    (new.id, 'portfolio', true, '1.0.0', '{}'::jsonb),
    (new.id, 'catalog', true, '1.0.0', '{}'::jsonb),
    (
      new.id,
      'scheduling',
      true,
      '1.3.0',
      jsonb_build_object(
        'booking_core', true,
        'public_booking_ui', true,
        'booking_calendar', true
      )
    ),
    (
      new.id,
      'crm',
      true,
      '1.1.0',
      jsonb_build_object(
        'booking_clients', true,
        'clients_crm', true,
        'client_merge', true,
        'client_archive', true
      )
    ),
    (
      new.id,
      'payments',
      true,
      '1.0.0',
      jsonb_build_object(
        'provider_neutral_ledger', true,
        'manual_payments', true,
        'manual_refunds', true,
        'immutable_transactions', true
      )
    ),
    (
      new.id,
      'notifications',
      true,
      '1.0.0',
      jsonb_build_object(
        'provider_neutral_queue', true,
        'language_aware_templates', true,
        'booking_reminders', true,
        'delivery_attempts', true
      )
    ),
    (new.id, 'analytics', false, '0.0.0', '{}'::jsonb)
  on conflict (business_id, module_key) do update set
    enabled = excluded.enabled,
    version = excluded.version,
    config = excluded.config,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.seed_business_modules() from public, anon, authenticated;

update public.business_modules
set enabled = true,
    version = '1.0.0',
    config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'provider_neutral_queue', true,
        'language_aware_templates', true,
        'booking_reminders', true,
        'delivery_attempts', true
      ),
    updated_at = now()
where module_key = 'notifications';

comment on table public.notification_jobs is
  'Provider-neutral notification queue with immutable rendered content, idempotency and scheduled delivery.';
comment on table public.notification_attempts is
  'Append-only provider delivery attempt history for queued notifications.';
comment on table public.notification_templates is
  'Workspace-scoped language-aware email templates rendered into durable notification jobs.';
comment on function public.claim_notification_jobs(text, integer) is
  'Service-role provider seam that atomically claims due jobs with SKIP LOCKED and opens a delivery attempt.';
comment on function public.schedule_booking_reminders(uuid, timestamptz) is
  'Idempotently prepares reminder jobs for upcoming active bookings without sending them directly.';
