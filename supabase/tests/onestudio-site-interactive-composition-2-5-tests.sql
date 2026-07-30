begin;

create extension if not exists pgtap with schema extensions;

select plan(14);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"calendar-story","kind":"media_text","media_type":"calendar"}]'::jsonb
  )->0->>'media_type',
  'calendar',
  'split blocks preserve the booking calendar media type'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"calendar-story","kind":"media_text","media_type":"script"}]'::jsonb
  )->0->>'media_type',
  'image',
  'unknown split media types fall back to images'
);

select is(
  jsonb_array_length(
    public.normalize_public_site_column_cards(
      '[{"id":"one"},{"id":"two"},{"id":"three"},{"id":"four"}]'::jsonb
    )
  ),
  3,
  'column blocks keep at most three cards'
);

select is(
  public.normalize_public_site_column_cards(
    '[{"id":"photo","media_type":"image","media_url":"https://cdn.example.test/a.webp"}]'::jsonb
  )->0->>'media_url',
  'https://cdn.example.test/a.webp',
  'safe card images are preserved'
);

select is(
  public.normalize_public_site_column_cards(
    '[{"id":"photo","media_type":"image","media_url":"javascript:alert(1)"}]'::jsonb
  )->0->>'media_url',
  '',
  'unsafe card images are removed'
);

select is(
  public.normalize_public_site_column_cards(
    '[{"id":"movie","media_type":"video","video_url":"https://cdn.example.test/a.mp4"}]'::jsonb
  )->0->>'media_type',
  'video',
  'video cards are preserved'
);

select is(
  public.normalize_public_site_custom_blocks(
    '[{"id":"cards","kind":"columns","cards":[{"id":"one","title":"Photo","media_type":"image"}]}]'::jsonb
  )->0->'cards'->0->>'title',
  'Photo',
  'column cards survive block normalization'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.normalize_public_site_column_cards(jsonb)',
    'EXECUTE'
  ),
  'anonymous users cannot execute card normalization'
);

select has_table(
  'public',
  'google_calendar_integrations',
  'Google Calendar integration storage exists'
);

select has_table(
  'public',
  'google_calendar_booking_links',
  'Google Calendar booking links exist'
);

select has_table(
  'public',
  'google_calendar_busy_windows',
  'Google Calendar busy-window links exist'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.google_calendar_integrations',
    'SELECT'
  ),
  'authenticated browser clients cannot read encrypted OAuth tokens'
);

select ok(
  has_table_privilege(
    'service_role',
    'public.google_calendar_integrations',
    'SELECT'
  ),
  'the server adapter can read encrypted OAuth tokens'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.replace_google_calendar_busy_windows(uuid,uuid,jsonb)',
    'EXECUTE'
  ),
  'browser clients cannot replace Google busy windows'
);

select * from finish();

rollback;
