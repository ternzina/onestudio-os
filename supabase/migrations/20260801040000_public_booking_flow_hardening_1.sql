-- OneStudio OS Public Booking Flow Hardening 1.0
-- Public visitors keep read-only access to booking context and calculated slots.
-- Booking writes now pass through the server-side, rate-limited Next.js gateway.

revoke all on function public.create_public_booking(
  text,
  uuid,
  timestamptz,
  integer,
  integer,
  text,
  text,
  text,
  text,
  text,
  uuid
) from public, anon, authenticated;

grant execute on function public.create_public_booking(
  text,
  uuid,
  timestamptz,
  integer,
  integer,
  text,
  text,
  text,
  text,
  text,
  uuid
) to service_role;

create or replace function public.seed_business_modules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_modules (business_id, module_key, enabled, version, config)
  values
    (new.id, 'core', true, '1.1.0', jsonb_build_object('core_suite', '1.0.0')),
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
        'booking_calendar', true,
        'public_booking_gateway', true,
        'direct_anonymous_booking_writes', false,
        'public_booking_rate_limits', true,
        'public_booking_payment_state', true
      )
    ),
    (new.id, 'crm', true, '1.1.0', jsonb_build_object(
      'booking_clients', true,
      'clients_crm', true,
      'client_merge', true,
      'client_archive', true
    )),
    (new.id, 'payments', true, '1.0.0', jsonb_build_object(
      'provider_neutral_ledger', true,
      'manual_payments', true,
      'manual_refunds', true,
      'immutable_transactions', true
    )),
    (new.id, 'notifications', true, '1.1.0', jsonb_build_object(
      'provider_neutral_queue', true,
      'language_aware_templates', true,
      'booking_reminders', true,
      'delivery_attempts', true,
      'resend_adapter', true,
      'idempotent_provider_requests', true,
      'processing_recovery', true
    )),
    (new.id, 'documents', true, '1.0.0', jsonb_build_object(
      'company_profile', true,
      'legal_pages', true,
      'document_templates', true,
      'generated_snapshots', true,
      'delivery_timeline', true
    )),
    (new.id, 'analytics', true, '1.0.0', jsonb_build_object(
      'booking_metrics', true,
      'client_metrics', true,
      'payment_metrics', true,
      'daily_series', true,
      'tenant_safe', true
    ))
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

update public.business_modules
set config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
      'public_booking_gateway', true,
      'direct_anonymous_booking_writes', false,
      'public_booking_rate_limits', true,
      'public_booking_payment_state', true
    ),
    updated_at = now()
where module_key = 'scheduling';

comment on function public.create_public_booking(
  text,
  uuid,
  timestamptz,
  integer,
  integer,
  text,
  text,
  text,
  text,
  text,
  uuid
) is
  'Creates one conflict-safe public booking. Execution is restricted to the server-side rate-limited booking gateway.';
