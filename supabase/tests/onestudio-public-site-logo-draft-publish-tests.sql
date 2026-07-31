begin;

select plan(9);

select has_column(
  'public',
  'public_site_settings',
  'draft_logo_url',
  'public site settings has a draft logo'
);

select has_column(
  'public',
  'public_site_settings',
  'published_logo_url',
  'public site settings has a published logo'
);

select has_function(
  'public',
  'save_public_site_logo_draft',
  array['uuid', 'text'],
  'logo draft save function exists'
);

select function_privs_are(
  'public',
  'save_public_site_logo_draft',
  array['uuid', 'text'],
  'authenticated',
  array['EXECUTE'],
  'authenticated can save the logo draft'
);

select function_privs_are(
  'public',
  'save_public_site_logo_draft',
  array['uuid', 'text'],
  'anon',
  array[]::text[],
  'anonymous users cannot save the logo draft'
);

select ok(
  position(
    '''logo_draft_url'''
    in pg_get_functiondef(
      'public.get_public_site_editor(uuid)'::regprocedure
    )
  ) > 0
  and position(
    '''logo_published_url'''
    in pg_get_functiondef(
      'public.get_public_site_editor(uuid)'::regprocedure
    )
  ) > 0,
  'site editor exposes draft and published logo states'
);

select ok(
  position(
    'published_logo_url = draft_logo_url'
    in pg_get_functiondef(
      'public.publish_public_site(uuid,text)'::regprocedure
    )
  ) > 0,
  'publishing promotes the logo draft'
);

select ok(
  position(
    '''logo_url'', site_row.published_logo_url'
    in pg_get_functiondef(
      'public.get_public_site(text,text)'::regprocedure
    )
  ) > 0,
  'public site reads only the published logo'
);

select ok(
  position(
    'draft_logo_url = v_logo_url'
    in pg_get_functiondef(
      'public.save_public_site_logo_draft(uuid,text)'::regprocedure
    )
  ) > 0
  and position(
    'published_logo_url'
    in pg_get_functiondef(
      'public.save_public_site_logo_draft(uuid,text)'::regprocedure
    )
  ) = 0,
  'saving the logo draft does not change the published logo'
);

select * from finish();
rollback;
