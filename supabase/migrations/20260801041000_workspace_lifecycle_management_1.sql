-- OneStudio OS Workspace Lifecycle Management 1.0
-- Adds explicit workspace management without changing the canonical current-workspace contract.
-- Workspaces with operational records can be archived; permanent deletion is limited to disposable workspaces.

create or replace function public.list_my_workspace_management()
returns table (
  business_id uuid,
  slug text,
  name text,
  timezone text,
  default_locale text,
  default_currency text,
  status text,
  role text,
  is_default boolean,
  member_since timestamptz,
  booking_count bigint,
  client_count bigint,
  payment_count bigint,
  request_count bigint,
  document_count bigint,
  notification_count bigint,
  google_calendar_connected boolean,
  can_archive boolean,
  can_delete boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    b.id,
    b.slug,
    b.name,
    b.timezone,
    b.default_locale,
    b.default_currency,
    b.status,
    m.role,
    m.is_default,
    m.created_at,
    coalesce(booking_stats.total, 0),
    coalesce(client_stats.total, 0),
    coalesce(payment_stats.total, 0),
    coalesce(request_stats.total, 0),
    coalesce(document_stats.total, 0),
    coalesce(notification_stats.total, 0),
    coalesce(calendar_stats.connected, false),
    (
      m.role = 'owner'
      and b.status <> 'archived'
      and exists (
        select 1
        from public.business_members other_membership
        join public.businesses other_business
          on other_business.id = other_membership.business_id
        where other_membership.user_id = auth.uid()
          and other_membership.is_active = true
          and other_membership.business_id <> b.id
          and other_business.status <> 'archived'
      )
    ) as can_archive,
    (
      m.role = 'owner'
      and b.id <> '00000000-0000-4000-8000-000000000001'::uuid
      and coalesce(booking_stats.total, 0) = 0
      and coalesce(client_stats.total, 0) = 0
      and coalesce(payment_stats.total, 0) = 0
      and coalesce(request_stats.total, 0) = 0
      and coalesce(document_stats.total, 0) = 0
      and coalesce(notification_stats.total, 0) = 0
      and coalesce(calendar_stats.connected, false) = false
      and exists (
        select 1
        from public.business_members other_membership
        join public.businesses other_business
          on other_business.id = other_membership.business_id
        where other_membership.user_id = auth.uid()
          and other_membership.is_active = true
          and other_membership.business_id <> b.id
          and other_business.status <> 'archived'
      )
    ) as can_delete
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  left join lateral (
    select count(*)::bigint as total
    from public.bookings booking
    where booking.business_id = b.id
  ) booking_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.clients client
    where client.business_id = b.id
  ) client_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.payment_transactions payment_row
    where payment_row.business_id = b.id
  ) payment_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.public_requests request_row
    where request_row.business_id = b.id
  ) request_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.generated_documents document_row
    where document_row.business_id = b.id
  ) document_stats on true
  left join lateral (
    select count(*)::bigint as total
    from public.notification_jobs job
    where job.business_id = b.id
  ) notification_stats on true
  left join lateral (
    select exists (
      select 1
      from public.google_calendar_integrations integration
      where integration.business_id = b.id
    ) as connected
  ) calendar_stats on true
  where m.user_id = auth.uid()
    and m.is_active = true
  order by
    case when b.status = 'archived' then 1 else 0 end,
    m.is_default desc,
    b.name,
    b.id;
$$;

create or replace function public.archive_my_workspace(p_business_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_is_default boolean;
  v_target_status text;
  v_replacement_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select m.is_default, b.status
  into v_target_is_default, v_target_status
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.business_id = p_business_id
    and m.user_id = v_user_id
    and m.is_active = true
    and m.role = 'owner';

  if not found then
    raise exception 'workspace_owner_required' using errcode = '42501';
  end if;

  if v_target_status = 'archived' then
    return public.current_business_id();
  end if;

  select m.business_id
  into v_replacement_id
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.user_id = v_user_id
    and m.is_active = true
    and m.business_id <> p_business_id
    and b.status <> 'archived'
  order by
    m.is_default desc,
    case m.role
      when 'owner' then 1
      when 'admin' then 2
      when 'manager' then 3
      when 'staff' then 4
      else 5
    end,
    m.created_at,
    m.id
  limit 1;

  if v_replacement_id is null then
    raise exception 'cannot_archive_last_workspace' using errcode = 'P0001';
  end if;

  update public.business_members
  set is_default = false,
      updated_at = now()
  where business_id = p_business_id
    and user_id = v_user_id
    and is_default = true;

  update public.businesses
  set status = 'archived',
      updated_at = now()
  where id = p_business_id;

  if v_target_is_default
     or not exists (
       select 1
       from public.business_members m
       join public.businesses b on b.id = m.business_id
       where m.user_id = v_user_id
         and m.is_active = true
         and m.is_default = true
         and b.status <> 'archived'
     ) then
    update public.business_members
    set is_default = false,
        updated_at = now()
    where user_id = v_user_id
      and is_default = true;

    update public.business_members
    set is_default = true,
        updated_at = now()
    where user_id = v_user_id
      and business_id = v_replacement_id
      and is_active = true;
  end if;

  return v_replacement_id;
end;
$$;

create or replace function public.restore_my_workspace(p_business_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.business_members m
    where m.business_id = p_business_id
      and m.user_id = auth.uid()
      and m.is_active = true
      and m.role = 'owner'
  ) then
    raise exception 'workspace_owner_required' using errcode = '42501';
  end if;

  update public.businesses
  set status = 'active',
      updated_at = now()
  where id = p_business_id
    and status = 'archived';

  return found;
end;
$$;

create or replace function public.delete_my_empty_workspace(
  p_business_id uuid,
  p_confirmation_name text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_name text;
  v_target_is_default boolean;
  v_replacement_id uuid;
  v_has_operational_data boolean;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  if p_business_id = '00000000-0000-4000-8000-000000000001'::uuid then
    raise exception 'workspace_foundation_cannot_be_deleted' using errcode = 'P0001';
  end if;

  select b.name, m.is_default
  into v_target_name, v_target_is_default
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.business_id = p_business_id
    and m.user_id = v_user_id
    and m.is_active = true
    and m.role = 'owner';

  if not found then
    raise exception 'workspace_owner_required' using errcode = '42501';
  end if;

  if btrim(coalesce(p_confirmation_name, '')) <> v_target_name then
    raise exception 'workspace_confirmation_mismatch' using errcode = '22023';
  end if;

  select m.business_id
  into v_replacement_id
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.user_id = v_user_id
    and m.is_active = true
    and m.business_id <> p_business_id
    and b.status <> 'archived'
  order by
    m.is_default desc,
    case m.role
      when 'owner' then 1
      when 'admin' then 2
      when 'manager' then 3
      when 'staff' then 4
      else 5
    end,
    m.created_at,
    m.id
  limit 1;

  if v_replacement_id is null then
    raise exception 'cannot_delete_last_workspace' using errcode = 'P0001';
  end if;

  select
    exists (select 1 from public.bookings row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.clients row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.payment_transactions row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.public_requests row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.generated_documents row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.notification_jobs row_data where row_data.business_id = p_business_id)
    or exists (select 1 from public.google_calendar_integrations row_data where row_data.business_id = p_business_id)
  into v_has_operational_data;

  if v_has_operational_data then
    raise exception 'workspace_has_operational_data' using errcode = 'P0001';
  end if;

  if v_target_is_default
     or not exists (
       select 1
       from public.business_members m
       join public.businesses b on b.id = m.business_id
       where m.user_id = v_user_id
         and m.is_active = true
         and m.is_default = true
         and m.business_id <> p_business_id
         and b.status <> 'archived'
     ) then
    update public.business_members
    set is_default = false,
        updated_at = now()
    where user_id = v_user_id
      and is_default = true;

    update public.business_members
    set is_default = true,
        updated_at = now()
    where user_id = v_user_id
      and business_id = v_replacement_id
      and is_active = true;
  end if;

  delete from public.businesses
  where id = p_business_id;

  if not found then
    raise exception 'workspace_not_found' using errcode = 'P0002';
  end if;

  return v_replacement_id;
end;
$$;

revoke all on function public.list_my_workspace_management()
  from public, anon, authenticated;
revoke all on function public.archive_my_workspace(uuid)
  from public, anon, authenticated;
revoke all on function public.restore_my_workspace(uuid)
  from public, anon, authenticated;
revoke all on function public.delete_my_empty_workspace(uuid, text)
  from public, anon, authenticated;

grant execute on function public.list_my_workspace_management()
  to authenticated, service_role;
grant execute on function public.archive_my_workspace(uuid)
  to authenticated, service_role;
grant execute on function public.restore_my_workspace(uuid)
  to authenticated, service_role;
grant execute on function public.delete_my_empty_workspace(uuid, text)
  to authenticated, service_role;

comment on function public.list_my_workspace_management() is
  'Lists every assigned workspace, including archived ones, with operational usage counts and safe lifecycle capabilities.';
comment on function public.archive_my_workspace(uuid) is
  'Archives one owned workspace and switches the current context to another assigned non-archived workspace.';
comment on function public.restore_my_workspace(uuid) is
  'Restores one archived workspace owned by the signed-in user.';
comment on function public.delete_my_empty_workspace(uuid, text) is
  'Permanently deletes a disposable owned workspace only after exact-name confirmation and only when no operational records exist.';
