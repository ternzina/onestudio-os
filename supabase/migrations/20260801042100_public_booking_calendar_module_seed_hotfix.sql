-- OneStudio OS: public booking calendar module seed hotfix 1.0
-- Keeps calendar-availability capabilities on scheduling modules
-- created for all future workspaces.

create or replace function public.apply_public_booking_calendar_module_capabilities()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.module_key = 'scheduling' then
    new.config := coalesce(new.config, '{}'::jsonb)
      || jsonb_build_object(
        'public_booking_calendar_availability', true,
        'public_booking_calendar_privacy_safe', true
      );
  end if;

  return new;
end;
$$;

revoke all on function public.apply_public_booking_calendar_module_capabilities()
  from public, anon, authenticated;

drop trigger if exists apply_public_booking_calendar_module_capabilities
  on public.business_modules;

create trigger apply_public_booking_calendar_module_capabilities
before insert or update of module_key, config
on public.business_modules
for each row
execute function public.apply_public_booking_calendar_module_capabilities();

update public.business_modules
set config = coalesce(config, '{}'::jsonb)
      || jsonb_build_object(
        'public_booking_calendar_availability', true,
        'public_booking_calendar_privacy_safe', true
      ),
    updated_at = now()
where module_key = 'scheduling';
