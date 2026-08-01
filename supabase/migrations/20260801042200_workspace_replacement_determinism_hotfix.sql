-- OneStudio OS: workspace replacement determinism hotfix 1.0
-- Makes the replacement workspace selection stable when several memberships
-- were created in the same transaction and therefore have identical timestamps.

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
    m.business_id
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
    m.business_id
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

revoke all on function public.archive_my_workspace(uuid)
  from public, anon, authenticated;
revoke all on function public.delete_my_empty_workspace(uuid, text)
  from public, anon, authenticated;

grant execute on function public.archive_my_workspace(uuid)
  to authenticated, service_role;
grant execute on function public.delete_my_empty_workspace(uuid, text)
  to authenticated, service_role;

comment on function public.archive_my_workspace(uuid) is
  'Archives one owned workspace and deterministically switches the current context to another assigned non-archived workspace.';
comment on function public.delete_my_empty_workspace(uuid, text) is
  'Permanently deletes a disposable owned workspace and deterministically switches the current context when necessary.';
