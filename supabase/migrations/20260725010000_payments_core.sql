-- OneStudio OS Payments Core 1.0
-- Provider-neutral, append-only payment ledger attached to canonical bookings.

alter table public.bookings
  add column if not exists payment_required boolean not null default true;

alter table public.bookings
  add column if not exists paid_minor integer not null default 0 check (paid_minor >= 0);

alter table public.bookings
  add column if not exists refunded_minor integer not null default 0 check (refunded_minor >= 0);

alter table public.bookings
  drop constraint if exists bookings_refunded_not_above_paid;

alter table public.bookings
  add constraint bookings_refunded_not_above_paid
  check (refunded_minor <= paid_minor);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid not null,
  client_id uuid not null,
  kind text not null check (kind in ('payment', 'refund')),
  amount_minor integer not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  provider text not null default 'manual'
    check (provider ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  method text not null default 'other'
    check (method in ('cash', 'card', 'bank_transfer', 'online', 'gift_card', 'other')),
  provider_reference text,
  idempotency_key text,
  note text not null default '',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (id, business_id),
  foreign key (booking_id, business_id) references public.bookings(id, business_id) on delete restrict,
  foreign key (client_id, business_id) references public.clients(id, business_id) on delete restrict,
  check (provider_reference is null or char_length(provider_reference) between 1 and 250),
  check (idempotency_key is null or char_length(idempotency_key) between 8 and 200),
  check (char_length(note) <= 2000)
);

create index if not exists payment_transactions_business_occurred_idx
  on public.payment_transactions (business_id, occurred_at desc, id desc);

create index if not exists payment_transactions_booking_occurred_idx
  on public.payment_transactions (booking_id, occurred_at desc, id desc);

create index if not exists payment_transactions_client_occurred_idx
  on public.payment_transactions (client_id, occurred_at desc, id desc);

create unique index if not exists payment_transactions_provider_reference_unique
  on public.payment_transactions (business_id, provider, kind, provider_reference)
  where provider_reference is not null;

create unique index if not exists payment_transactions_idempotency_unique
  on public.payment_transactions (business_id, provider, idempotency_key)
  where idempotency_key is not null;

create or replace function public.is_payment_service_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role';
$$;

create or replace function public.derive_booking_payment_status(
  p_payment_required boolean,
  p_total_minor integer,
  p_paid_minor integer,
  p_refunded_minor integer
)
returns text
language plpgsql
immutable
as $$
declare
  v_net integer := greatest(0, coalesce(p_paid_minor, 0) - coalesce(p_refunded_minor, 0));
begin
  if not coalesce(p_payment_required, false) or coalesce(p_total_minor, 0) = 0 then
    return 'not_required';
  end if;

  if coalesce(p_paid_minor, 0) = 0 then
    return 'pending';
  end if;

  if coalesce(p_refunded_minor, 0) >= coalesce(p_paid_minor, 0) then
    return 'refunded';
  end if;

  if v_net < coalesce(p_total_minor, 0) then
    return 'partially_paid';
  end if;

  return 'paid';
end;
$$;

create or replace function public.prepare_booking_payment_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_net integer;
begin
  if tg_op = 'INSERT' then
    new.paid_minor := 0;
    new.refunded_minor := 0;
  else
    v_net := greatest(0, old.paid_minor - old.refunded_minor);

    if new.currency is distinct from old.currency and old.paid_minor > 0 then
      raise exception 'booking_currency_locked_after_payment' using errcode = '55000';
    end if;

    if new.total_minor < v_net then
      raise exception 'booking_total_below_paid_balance' using errcode = '22023';
    end if;

    if new.payment_required = false and old.paid_minor > 0 then
      raise exception 'payment_requirement_has_transactions' using errcode = '55000';
    end if;
  end if;

  if new.total_minor = 0 then
    new.payment_required := false;
  end if;

  new.payment_status := public.derive_booking_payment_status(
    new.payment_required,
    new.total_minor,
    new.paid_minor,
    new.refunded_minor
  );

  return new;
end;
$$;

create or replace function public.refresh_booking_payment_summary(p_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_paid integer := 0;
  v_refunded integer := 0;
  v_booking public.bookings%rowtype;
begin
  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    return false;
  end if;

  select
    coalesce(sum(payment_tx.amount_minor) filter (where payment_tx.kind = 'payment'), 0)::integer,
    coalesce(sum(payment_tx.amount_minor) filter (where payment_tx.kind = 'refund'), 0)::integer
  into v_paid, v_refunded
  from public.payment_transactions payment_tx
  where payment_tx.booking_id = p_booking_id
    and payment_tx.business_id = v_booking.business_id;

  if v_refunded > v_paid then
    raise exception 'payment_refund_exceeds_received' using errcode = '22023';
  end if;

  update public.bookings
  set paid_minor = v_paid,
      refunded_minor = v_refunded,
      payment_status = public.derive_booking_payment_status(
        payment_required,
        total_minor,
        v_paid,
        v_refunded
      ),
      updated_at = now()
  where id = p_booking_id;

  return true;
end;
$$;

create or replace function public.refresh_booking_after_payment_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_booking_payment_summary(new.booking_id);
  return new;
end;
$$;

create or replace function public.protect_payment_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'payment_transaction_immutable' using errcode = '55000';
end;
$$;

create or replace function public.append_payment_transaction(
  p_booking_id uuid,
  p_kind text,
  p_amount_minor integer,
  p_method text,
  p_provider text,
  p_provider_reference text,
  p_note text,
  p_occurred_at timestamptz,
  p_idempotency_key text,
  p_metadata jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_provider text := lower(coalesce(nullif(trim(p_provider), ''), 'manual'));
  v_method text := lower(coalesce(nullif(trim(p_method), ''), 'other'));
  v_reference text := nullif(trim(p_provider_reference), '');
  v_idempotency text := nullif(trim(p_idempotency_key), '');
  v_existing public.payment_transactions%rowtype;
  v_transaction_id uuid;
  v_balance integer;
begin
  if p_kind not in ('payment', 'refund') then
    raise exception 'invalid_payment_transaction_kind' using errcode = '22023';
  end if;

  if coalesce(p_amount_minor, 0) <= 0 then
    raise exception 'invalid_payment_amount' using errcode = '22023';
  end if;

  if v_provider !~ '^[a-z0-9][a-z0-9_-]{0,63}$' then
    raise exception 'invalid_payment_provider' using errcode = '22023';
  end if;

  if v_method not in ('cash', 'card', 'bank_transfer', 'online', 'gift_card', 'other') then
    raise exception 'invalid_payment_method' using errcode = '22023';
  end if;

  if p_occurred_at is not null and p_occurred_at > now() + interval '5 minutes' then
    raise exception 'payment_date_in_future' using errcode = '22023';
  end if;

  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    raise exception 'payment_booking_not_found' using errcode = 'P0002';
  end if;

  if not public.is_payment_service_role()
     and not public.can_operate_business(v_booking.business_id) then
    raise exception 'payment_operation_forbidden' using errcode = '42501';
  end if;

  if v_idempotency is not null then
    select payment_tx.*
    into v_existing
    from public.payment_transactions payment_tx
    where payment_tx.business_id = v_booking.business_id
      and payment_tx.provider = v_provider
      and payment_tx.idempotency_key = v_idempotency
    limit 1;

    if found then
      if v_existing.booking_id = p_booking_id
         and v_existing.kind = p_kind
         and v_existing.amount_minor = p_amount_minor
         and v_existing.currency = v_booking.currency then
        return v_existing.id;
      end if;

      raise exception 'payment_idempotency_conflict' using errcode = '23505';
    end if;
  end if;

  v_balance := greatest(0, v_booking.paid_minor - v_booking.refunded_minor);

  if p_kind = 'payment' then
    if not v_booking.payment_required or v_booking.total_minor = 0 then
      raise exception 'payment_not_required' using errcode = '22023';
    end if;

    if v_booking.status in ('draft', 'cancelled') then
      raise exception 'booking_cannot_accept_payment' using errcode = '55000';
    end if;

    if p_amount_minor > greatest(0, v_booking.total_minor - v_balance) then
      raise exception 'payment_exceeds_balance_due' using errcode = '22023';
    end if;
  else
    if p_amount_minor > v_balance then
      raise exception 'refund_exceeds_available_balance' using errcode = '22023';
    end if;
  end if;

  insert into public.payment_transactions (
    business_id,
    booking_id,
    client_id,
    kind,
    amount_minor,
    currency,
    provider,
    method,
    provider_reference,
    idempotency_key,
    note,
    metadata,
    occurred_at,
    created_by
  ) values (
    v_booking.business_id,
    v_booking.id,
    v_booking.client_id,
    p_kind,
    p_amount_minor,
    v_booking.currency,
    v_provider,
    v_method,
    v_reference,
    v_idempotency,
    left(coalesce(p_note, ''), 2000),
    coalesce(p_metadata, '{}'::jsonb),
    coalesce(p_occurred_at, now()),
    auth.uid()
  )
  returning id into v_transaction_id;

  return v_transaction_id;
end;
$$;

create or replace function public.record_admin_payment(
  p_booking_id uuid,
  p_amount_minor integer,
  p_method text default 'other',
  p_provider text default 'manual',
  p_provider_reference text default null,
  p_note text default '',
  p_occurred_at timestamptz default now(),
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.append_payment_transaction(
    p_booking_id,
    'payment',
    p_amount_minor,
    p_method,
    p_provider,
    p_provider_reference,
    p_note,
    p_occurred_at,
    p_idempotency_key,
    jsonb_build_object('recorded_from', 'admin')
  );
end;
$$;

create or replace function public.record_admin_refund(
  p_booking_id uuid,
  p_amount_minor integer,
  p_method text default 'other',
  p_provider text default 'manual',
  p_provider_reference text default null,
  p_note text default '',
  p_occurred_at timestamptz default now(),
  p_idempotency_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.append_payment_transaction(
    p_booking_id,
    'refund',
    p_amount_minor,
    p_method,
    p_provider,
    p_provider_reference,
    p_note,
    p_occurred_at,
    p_idempotency_key,
    jsonb_build_object('recorded_from', 'admin')
  );
end;
$$;

create or replace function public.set_admin_booking_payment_required(
  p_booking_id uuid,
  p_required boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
begin
  select booking.*
  into v_booking
  from public.bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    raise exception 'payment_booking_not_found' using errcode = 'P0002';
  end if;

  if not public.can_operate_business(v_booking.business_id) then
    raise exception 'payment_operation_forbidden' using errcode = '42501';
  end if;

  if coalesce(p_required, false) and v_booking.total_minor = 0 then
    raise exception 'payment_required_for_zero_total' using errcode = '22023';
  end if;

  if not coalesce(p_required, false)
     and v_booking.paid_minor > 0 then
    raise exception 'payment_requirement_has_transactions' using errcode = '55000';
  end if;

  update public.bookings
  set payment_required = coalesce(p_required, false),
      updated_at = now()
  where id = p_booking_id;

  return true;
end;
$$;

create or replace function public.get_admin_payments(
  p_business_id uuid,
  p_include_cancelled boolean default true
)
returns table (
  booking_id uuid,
  reference text,
  booking_status text,
  booking_source text,
  starts_at timestamptz,
  timezone text,
  client_id uuid,
  client_name text,
  client_email text,
  client_phone text,
  service_id uuid,
  service_title text,
  total_minor integer,
  paid_minor integer,
  refunded_minor integer,
  due_minor integer,
  currency text,
  payment_required boolean,
  payment_status text,
  transaction_count bigint,
  last_transaction_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_view_business(p_business_id) then
    raise exception 'payment_read_forbidden' using errcode = '42501';
  end if;

  return query
  select
    booking.id,
    booking.reference,
    booking.status,
    booking.source,
    booking.starts_at,
    booking.timezone,
    client.id,
    client.name,
    client.email,
    client.phone,
    service.id,
    service.title,
    booking.total_minor,
    booking.paid_minor,
    booking.refunded_minor,
    greatest(0, booking.total_minor - greatest(0, booking.paid_minor - booking.refunded_minor))::integer,
    booking.currency,
    booking.payment_required,
    booking.payment_status,
    count(payment_tx.id)::bigint,
    max(payment_tx.occurred_at)
  from public.bookings booking
  join public.clients client
    on client.id = booking.client_id
   and client.business_id = booking.business_id
  join public.services service
    on service.id = booking.service_id
   and service.business_id = booking.business_id
  left join public.payment_transactions payment_tx
    on payment_tx.booking_id = booking.id
   and payment_tx.business_id = booking.business_id
  where booking.business_id = p_business_id
    and (coalesce(p_include_cancelled, true) or booking.status <> 'cancelled')
  group by booking.id, client.id, service.id
  order by booking.starts_at desc, booking.id;
end;
$$;

create or replace function public.get_admin_payment_transactions(p_booking_id uuid)
returns table (
  id uuid,
  kind text,
  amount_minor integer,
  currency text,
  provider text,
  method text,
  provider_reference text,
  note text,
  metadata jsonb,
  occurred_at timestamptz,
  created_by uuid,
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
  select booking.business_id
  into v_business_id
  from public.bookings booking
  where booking.id = p_booking_id;

  if v_business_id is null or not public.can_view_business(v_business_id) then
    raise exception 'payment_read_forbidden' using errcode = '42501';
  end if;

  return query
  select
    payment_tx.id,
    payment_tx.kind,
    payment_tx.amount_minor,
    payment_tx.currency,
    payment_tx.provider,
    payment_tx.method,
    payment_tx.provider_reference,
    payment_tx.note,
    payment_tx.metadata,
    payment_tx.occurred_at,
    payment_tx.created_by,
    payment_tx.created_at
  from public.payment_transactions payment_tx
  where payment_tx.booking_id = p_booking_id
    and payment_tx.business_id = v_business_id
  order by payment_tx.occurred_at desc, payment_tx.id desc;
end;
$$;

create or replace function public.audit_booking_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_type text;
  v_changes jsonb;
begin
  if tg_op = 'INSERT' then
    v_event_type := 'created';
    v_changes := jsonb_build_object(
      'status', new.status,
      'service_id', new.service_id,
      'client_id', new.client_id,
      'starts_at', new.starts_at,
      'ends_at', new.ends_at,
      'party_size', new.party_size,
      'total_minor', new.total_minor,
      'payment_required', new.payment_required,
      'payment_status', new.payment_status
    );

    insert into public.booking_events (
      business_id, booking_id, event_type, actor_user_id, previous_status, new_status, changes
    ) values (
      new.business_id, new.id, v_event_type, auth.uid(), null, new.status, v_changes
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    v_event_type := case when new.status = 'cancelled' then 'cancelled' else 'status_changed' end;
  else
    v_event_type := 'updated';
  end if;

  v_changes := jsonb_strip_nulls(jsonb_build_object(
    'service_id', case when old.service_id is distinct from new.service_id then jsonb_build_object('from', old.service_id, 'to', new.service_id) end,
    'client_id', case when old.client_id is distinct from new.client_id then jsonb_build_object('from', old.client_id, 'to', new.client_id) end,
    'starts_at', case when old.starts_at is distinct from new.starts_at then jsonb_build_object('from', old.starts_at, 'to', new.starts_at) end,
    'ends_at', case when old.ends_at is distinct from new.ends_at then jsonb_build_object('from', old.ends_at, 'to', new.ends_at) end,
    'party_size', case when old.party_size is distinct from new.party_size then jsonb_build_object('from', old.party_size, 'to', new.party_size) end,
    'total_minor', case when old.total_minor is distinct from new.total_minor then jsonb_build_object('from', old.total_minor, 'to', new.total_minor) end,
    'status', case when old.status is distinct from new.status then jsonb_build_object('from', old.status, 'to', new.status) end,
    'payment_required', case when old.payment_required is distinct from new.payment_required then jsonb_build_object('from', old.payment_required, 'to', new.payment_required) end,
    'payment_status', case when old.payment_status is distinct from new.payment_status then jsonb_build_object('from', old.payment_status, 'to', new.payment_status) end,
    'paid_minor', case when old.paid_minor is distinct from new.paid_minor then jsonb_build_object('from', old.paid_minor, 'to', new.paid_minor) end,
    'refunded_minor', case when old.refunded_minor is distinct from new.refunded_minor then jsonb_build_object('from', old.refunded_minor, 'to', new.refunded_minor) end
  ));

  insert into public.booking_events (
    business_id, booking_id, event_type, actor_user_id, previous_status, new_status, changes
  ) values (
    new.business_id,
    new.id,
    v_event_type,
    auth.uid(),
    old.status,
    new.status,
    v_changes
  );

  return new;
end;
$$;

-- Temporarily remove the audit trigger during the one-time payment-state
-- backfill. Recreating it is more portable than DISABLE/ENABLE TRIGGER
-- across local Supabase migration roles.
drop trigger if exists bookings_audit_change on public.bookings;

update public.bookings
set payment_required = total_minor > 0,
    paid_minor = 0,
    refunded_minor = 0,
    payment_status = case when total_minor > 0 then 'pending' else 'not_required' end;

drop trigger if exists bookings_audit_change on public.bookings;
create trigger bookings_audit_change
after insert or update on public.bookings
for each row execute function public.audit_booking_change();

drop trigger if exists bookings_prepare_payment_state_insert on public.bookings;
create trigger bookings_prepare_payment_state_insert
before insert on public.bookings
for each row execute function public.prepare_booking_payment_state();

drop trigger if exists bookings_prepare_payment_state_update on public.bookings;
create trigger bookings_prepare_payment_state_update
before update of total_minor, currency, payment_required on public.bookings
for each row execute function public.prepare_booking_payment_state();

drop trigger if exists payment_transactions_refresh_booking on public.payment_transactions;
create trigger payment_transactions_refresh_booking
after insert on public.payment_transactions
for each row execute function public.refresh_booking_after_payment_transaction();

drop trigger if exists payment_transactions_immutable on public.payment_transactions;
create trigger payment_transactions_immutable
before update or delete on public.payment_transactions
for each row execute function public.protect_payment_transaction();

alter table public.payment_transactions enable row level security;

drop policy if exists "Members read payment transactions" on public.payment_transactions;
create policy "Members read payment transactions" on public.payment_transactions
for select to authenticated
using (public.can_view_business(business_id));

revoke all on table public.payment_transactions from anon, authenticated;
grant select on public.payment_transactions to authenticated;
grant select, insert, update, delete on public.payment_transactions to service_role;

revoke all on function public.is_payment_service_role() from public, anon, authenticated;
revoke all on function public.derive_booking_payment_status(boolean, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.prepare_booking_payment_state() from public, anon, authenticated;
revoke all on function public.refresh_booking_payment_summary(uuid) from public, anon, authenticated;
revoke all on function public.refresh_booking_after_payment_transaction() from public, anon, authenticated;
revoke all on function public.protect_payment_transaction() from public, anon, authenticated;
revoke all on function public.append_payment_transaction(uuid, text, integer, text, text, text, text, timestamptz, text, jsonb) from public, anon, authenticated;
revoke all on function public.record_admin_payment(uuid, integer, text, text, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.record_admin_refund(uuid, integer, text, text, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.set_admin_booking_payment_required(uuid, boolean) from public, anon, authenticated;
revoke all on function public.get_admin_payments(uuid, boolean) from public, anon, authenticated;
revoke all on function public.get_admin_payment_transactions(uuid) from public, anon, authenticated;

grant execute on function public.record_admin_payment(uuid, integer, text, text, text, text, timestamptz, text) to authenticated, service_role;
grant execute on function public.record_admin_refund(uuid, integer, text, text, text, text, timestamptz, text) to authenticated, service_role;
grant execute on function public.set_admin_booking_payment_required(uuid, boolean) to authenticated, service_role;
grant execute on function public.get_admin_payments(uuid, boolean) to authenticated, service_role;
grant execute on function public.get_admin_payment_transactions(uuid) to authenticated, service_role;
grant execute on function public.append_payment_transaction(uuid, text, integer, text, text, text, text, timestamptz, text, jsonb) to service_role;
grant execute on function public.is_payment_service_role() to service_role;
grant execute on function public.derive_booking_payment_status(boolean, integer, integer, integer) to service_role;
grant execute on function public.refresh_booking_payment_summary(uuid) to service_role;

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
    (new.id, 'notifications', false, '0.0.0', '{}'::jsonb),
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
        'provider_neutral_ledger', true,
        'manual_payments', true,
        'manual_refunds', true,
        'immutable_transactions', true
      ),
    updated_at = now()
where module_key = 'payments';

comment on table public.payment_transactions is
  'Immutable provider-neutral payment and refund ledger entries attached to canonical bookings and clients.';
comment on function public.record_admin_payment(uuid, integer, text, text, text, text, timestamptz, text) is
  'Records one manual or externally referenced payment without allowing overpayment or duplicate idempotency keys.';
comment on function public.record_admin_refund(uuid, integer, text, text, text, text, timestamptz, text) is
  'Records one immutable refund that cannot exceed the booking net received balance.';
comment on function public.get_admin_payments(uuid, boolean) is
  'Returns workspace-scoped booking payment summaries for the Payments Core admin interface.';
comment on function public.append_payment_transaction(uuid, text, integer, text, text, text, text, timestamptz, text, jsonb) is
  'Provider adapter seam for appending one idempotent final payment or refund ledger entry.';
