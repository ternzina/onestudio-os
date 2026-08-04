begin;

create table if not exists public.domain_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  workspace_name text not null,
  domain text,
  redirect_domain text,
  action text not null default 'workspace_delete'
    check (action in ('workspace_delete')),
  status text not null default 'pending'
    check (status in ('pending', 'vercel_detached', 'completed', 'failed', 'rolled_back')),
  requested_by uuid,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  vercel_detached_at timestamptz,
  workspace_deleted_at timestamptz,
  rollback_completed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint domain_lifecycle_events_domain_normalized check (
    domain is null
    or (
      domain = lower(domain)
      and domain !~ '[/:]'
    )
  ),
  constraint domain_lifecycle_events_redirect_normalized check (
    redirect_domain is null
    or (
      redirect_domain = lower(redirect_domain)
      and redirect_domain !~ '[/:]'
    )
  )
);

create index if not exists domain_lifecycle_events_business_created_idx
  on public.domain_lifecycle_events (business_id, created_at desc);

create index if not exists domain_lifecycle_events_status_created_idx
  on public.domain_lifecycle_events (status, created_at desc);

alter table public.domain_lifecycle_events enable row level security;

revoke all on table public.domain_lifecycle_events
  from public, anon, authenticated;

grant select, insert, update on table public.domain_lifecycle_events
  to service_role;

comment on table public.domain_lifecycle_events is
  'Durable audit log for custom-domain detachment and workspace deletion. It intentionally keeps business_id without a foreign key so the event survives workspace deletion.';

comment on column public.domain_lifecycle_events.status is
  'pending, vercel_detached, completed, failed, or rolled_back.';

commit;
