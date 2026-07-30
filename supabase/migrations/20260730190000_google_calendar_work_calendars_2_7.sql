-- OneStudio OS Google Work Calendars 2.7
-- Every workspace connects to a secondary Google calendar created by
-- OneStudio OS. Legacy connections to the user's primary calendar remain
-- identifiable until the workspace administrator reconnects.

alter table public.google_calendar_integrations
  add column calendar_name text not null default '',
  add column calendar_mode text not null default 'legacy_primary';

alter table public.google_calendar_integrations
  add constraint google_calendar_integrations_calendar_mode_check
  check (calendar_mode in ('legacy_primary', 'app_created'));

update public.google_calendar_integrations
set
  calendar_name = case
    when calendar_id = 'primary' then 'Primary Google Calendar'
    else calendar_id
  end,
  calendar_mode = 'legacy_primary'
where calendar_name = '';

alter table public.google_calendar_integrations
  alter column calendar_id drop default;

comment on column public.google_calendar_integrations.calendar_name is
  'Display name of the Google work calendar selected for this workspace.';
comment on column public.google_calendar_integrations.calendar_mode is
  'app_created for isolated OneStudio work calendars; legacy_primary marks connections that must be upgraded.';
