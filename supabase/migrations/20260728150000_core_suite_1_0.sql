-- OneStudio OS Core Suite 1.0
-- Aligns the module registry and exposes one tenant-safe command-center summary.

alter table public.business_modules
  drop constraint if exists business_modules_module_key_check;

insert into public.business_modules (
  business_id,
  module_key,
  enabled,
  version,
  config,
  created_at,
  updated_at
)
select
  business_id,
  'documents',
  enabled,
  version,
  coalesce(config, '{}'::jsonb)
    || jsonb_build_object(
      'company_profile', true,
      'legal_pages', true,
      'document_templates', true,
      'generated_snapshots', true,
      'delivery_timeline', true
    ),
  created_at,
  now()
from public.business_modules
where module_key = 'legal'
on conflict (business_id, module_key) do update set
  enabled = excluded.enabled,
  version = excluded.version,
  config = public.business_modules.config || excluded.config,
  updated_at = now();

delete from public.business_modules
where module_key = 'legal';

alter table public.business_modules
  add constraint business_modules_module_key_check
  check (
    module_key in (
      'core',
      'media',
      'portfolio',
      'catalog',
      'scheduling',
      'crm',
      'payments',
      'notifications',
      'documents',
      'analytics'
    )
  );

create or replace function public.seed_business_modules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_modules (business_id, module_key, enabled, version, config)
  values
    (
      new.id,
      'core',
      true,
      '1.1.0',
      jsonb_build_object('core_suite', '1.0.0')
    ),
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
    (
      new.id,
      'documents',
      true,
      '1.0.0',
      jsonb_build_object(
        'company_profile', true,
        'legal_pages', true,
        'document_templates', true,
        'generated_snapshots', true,
        'delivery_timeline', true
      )
    ),
    (
      new.id,
      'analytics',
      true,
      '1.0.0',
      jsonb_build_object(
        'booking_metrics', true,
        'client_metrics', true,
        'payment_metrics', true,
        'daily_series', true,
        'tenant_safe', true
      )
    )
  on conflict (business_id, module_key) do update set
    enabled = excluded.enabled,
    version = excluded.version,
    config = excluded.config,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.seed_business_modules()
  from public, anon, authenticated;

insert into public.business_modules (business_id, module_key, enabled, version, config)
select
  business.id,
  module.module_key,
  true,
  module.version,
  module.config
from public.businesses business
cross join lateral (
  values
    ('core', '1.1.0', jsonb_build_object('core_suite', '1.0.0')),
    ('media', '1.0.0', '{}'::jsonb),
    ('portfolio', '1.0.0', '{}'::jsonb),
    ('catalog', '1.0.0', '{}'::jsonb),
    ('scheduling', '1.3.0', jsonb_build_object(
      'booking_core', true,
      'public_booking_ui', true,
      'booking_calendar', true
    )),
    ('crm', '1.1.0', jsonb_build_object(
      'booking_clients', true,
      'clients_crm', true,
      'client_merge', true,
      'client_archive', true
    )),
    ('payments', '1.0.0', jsonb_build_object(
      'provider_neutral_ledger', true,
      'manual_payments', true,
      'manual_refunds', true,
      'immutable_transactions', true
    )),
    ('notifications', '1.1.0', jsonb_build_object(
      'provider_neutral_queue', true,
      'language_aware_templates', true,
      'booking_reminders', true,
      'delivery_attempts', true,
      'resend_adapter', true,
      'idempotent_provider_requests', true,
      'processing_recovery', true
    )),
    ('documents', '1.0.0', jsonb_build_object(
      'company_profile', true,
      'legal_pages', true,
      'document_templates', true,
      'generated_snapshots', true,
      'delivery_timeline', true
    )),
    ('analytics', '1.0.0', jsonb_build_object(
      'booking_metrics', true,
      'client_metrics', true,
      'payment_metrics', true,
      'daily_series', true,
      'tenant_safe', true
    ))
) as module(module_key, version, config)
on conflict (business_id, module_key) do update set
  enabled = true,
  version = excluded.version,
  config = public.business_modules.config || excluded.config,
  updated_at = now();

create or replace function public.get_admin_core_suite_overview(
  p_business_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
  v_today date;
begin
  if not public.can_view_business(p_business_id) then
    raise exception 'core_suite_overview_forbidden' using errcode = '42501';
  end if;

  select business.*
  into v_business
  from public.businesses business
  where business.id = p_business_id
    and business.status <> 'archived';

  if not found then
    raise exception 'core_suite_business_not_found' using errcode = '23503';
  end if;

  v_today := (now() at time zone v_business.timezone)::date;

  return jsonb_build_object(
    'workspace', jsonb_build_object(
      'business_id', v_business.id,
      'name', v_business.name,
      'timezone', v_business.timezone,
      'date', v_today
    ),
    'today_bookings', (
      select count(*)
      from public.bookings booking
      where booking.business_id = p_business_id
        and (booking.starts_at at time zone v_business.timezone)::date = v_today
        and booking.status not in ('draft', 'cancelled')
    ),
    'unpaid_bookings', (
      select count(*)
      from public.bookings booking
      where booking.business_id = p_business_id
        and booking.status not in ('draft', 'cancelled')
        and booking.payment_required
        and booking.total_minor >
          greatest(0, booking.paid_minor - booking.refunded_minor)
    ),
    'unsent_documents', (
      select count(*)
      from public.generated_documents document
      where document.business_id = p_business_id
        and document.status in ('draft', 'final')
    ),
    'needs_review', (
      select count(*)
      from public.notification_jobs job
      where job.business_id = p_business_id
        and job.status = 'failed'
    ),
    'enabled_modules', (
      select count(*)
      from public.business_modules module
      where module.business_id = p_business_id
        and module.enabled
    )
  );
end;
$$;

revoke all on function public.get_admin_core_suite_overview(uuid)
  from public, anon, authenticated;
grant execute on function public.get_admin_core_suite_overview(uuid)
  to authenticated, service_role;

comment on function public.get_admin_core_suite_overview(uuid) is
  'Returns the tenant-safe live counts used by the OneStudio OS Core Suite command center.';
