begin;

create extension if not exists pgtap with schema extensions;

select plan(7);

select has_column(
  'public',
  'google_calendar_integrations',
  'calendar_name',
  'Google Calendar integrations keep a safe display name'
);

select has_column(
  'public',
  'google_calendar_integrations',
  'calendar_mode',
  'Google Calendar integrations distinguish isolated work calendars'
);

select ok(
  exists (
    select 1
    from pg_attribute
    where attrelid = 'public.google_calendar_integrations'::regclass
      and attname = 'calendar_name'
      and attnotnull
      and not attisdropped
  ),
  'calendar names cannot be null'
);

select ok(
  exists (
    select 1
    from pg_attribute
    where attrelid = 'public.google_calendar_integrations'::regclass
      and attname = 'calendar_mode'
      and attnotnull
      and not attisdropped
  ),
  'calendar mode cannot be null'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.google_calendar_integrations'::regclass
      and conname = 'google_calendar_integrations_calendar_mode_check'
      and contype = 'c'
  ),
  'calendar mode is constrained to supported isolation modes'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.google_calendar_integrations',
    'SELECT'
  ),
  'workspace browser clients still cannot read encrypted Google connections'
);

select ok(
  has_table_privilege(
    'service_role',
    'public.google_calendar_integrations',
    'UPDATE'
  ),
  'the server adapter can save the created work calendar'
);

select * from finish();

rollback;
