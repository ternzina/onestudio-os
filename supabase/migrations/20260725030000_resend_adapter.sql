-- OneStudio OS Resend Adapter 1.0
-- Resilient service-role claiming for the provider-neutral notification queue.

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

create or replace function public.recover_stale_notification_jobs(
  p_provider text,
  p_stale_before timestamptz
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_notification_service_role() then
    raise exception 'notification_provider_forbidden' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_provider, ''))) not between 1 and 80 then
    raise exception 'invalid_notification_provider' using errcode = '22023';
  end if;

  if p_stale_before is null or p_stale_before > now() then
    raise exception 'invalid_notification_stale_before' using errcode = '22023';
  end if;

  with stale as materialized (
    select job.id, job.attempt_count, job.max_attempts
    from public.notification_jobs job
    where job.status = 'processing'
      and job.provider = trim(p_provider)
      and job.updated_at <= p_stale_before
    for update skip locked
  ),
  finalized_attempts as (
    update public.notification_attempts attempt
    set status = 'failed',
        error_message = 'notification_processing_timeout',
        finished_at = now()
    from stale
    where attempt.job_id = stale.id
      and attempt.attempt_number = stale.attempt_count
      and attempt.status = 'processing'
    returning attempt.job_id
  ),
  recovered as (
    update public.notification_jobs job
    set status = case
          when stale.attempt_count < stale.max_attempts then 'pending'
          else 'failed'
        end,
        scheduled_for = case
          when stale.attempt_count < stale.max_attempts then now()
          else job.scheduled_for
        end,
        last_error = 'notification_processing_timeout',
        updated_at = now()
    from stale
    where job.id = stale.id
    returning job.id
  )
  select count(*)::integer into v_count
  from recovered;

  return v_count;
end;
$$;

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
      '1.1.0',
      jsonb_build_object(
        'provider_neutral_queue', true,
        'language_aware_templates', true,
        'booking_reminders', true,
        'delivery_attempts', true,
        'resend_adapter', true,
        'idempotent_provider_requests', true,
        'processing_recovery', true
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
    version = '1.1.0',
    config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'resend_adapter', true,
        'idempotent_provider_requests', true,
        'processing_recovery', true
      ),
    updated_at = now()
where module_key = 'notifications';

revoke all on function public.claim_notification_jobs(text, integer)
  from public, anon, authenticated;
revoke all on function public.recover_stale_notification_jobs(text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.claim_notification_jobs(text, integer)
  to service_role;
grant execute on function public.recover_stale_notification_jobs(text, timestamptz)
  to service_role;

comment on function public.claim_notification_jobs(text, integer) is
  'Atomically claims due notification jobs for a service-role provider and returns stable sender, reply-to and idempotency data.';
comment on function public.recover_stale_notification_jobs(text, timestamptz) is
  'Recovers provider jobs left processing after an interrupted adapter run and finalizes the abandoned attempt.';
