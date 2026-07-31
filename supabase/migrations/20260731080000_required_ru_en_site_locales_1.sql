-- OneStudio OS — required RU + EN site locales 1.0
-- Every workspace keeps Russian and English drafts.
-- Owners may add any other locale manually in the site editor.

create or replace function public.ensure_required_public_site_locales()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_locale text;
  v_result text[] := array['ru', 'en']::text[];
begin
  foreach v_locale in array coalesce(new.locales, '{}'::text[])
  loop
    v_locale := lower(btrim(coalesce(v_locale, '')));

    if v_locale ~ '^[a-z]{2,3}(-[a-z]{2})?$'
       and not v_locale = any(v_result)
    then
      v_result := array_append(v_result, v_locale);
    end if;
  end loop;

  new.locales := v_result;
  return new;
end;
$$;

revoke all on function public.ensure_required_public_site_locales()
  from public, anon, authenticated;
grant execute on function public.ensure_required_public_site_locales()
  to service_role;

drop trigger if exists ensure_required_public_site_locales_before_write
  on public.business_launch_profiles;

create trigger ensure_required_public_site_locales_before_write
before insert or update of locales
on public.business_launch_profiles
for each row
execute function public.ensure_required_public_site_locales();

-- Backfill configured workspaces. Updating locales also activates the existing
-- demo-site seed trigger, which creates only missing RU/EN locale rows and
-- preserves existing draft fields because existing content wins on merge.
update public.business_launch_profiles profile
set locales = profile.locales,
    updated_at = now()
where not (
  'ru' = any(coalesce(profile.locales, '{}'::text[]))
  and 'en' = any(coalesce(profile.locales, '{}'::text[]))
);

comment on function public.ensure_required_public_site_locales() is
  'Guarantees Russian and English site drafts while preserving owner-added locales.';
