begin;

select plan(7);

select has_column(
  'public',
  'company_profiles',
  'logo_url',
  'company profile has canonical logo'
);

select has_function(
  'public',
  'get_public_site_editor',
  array['uuid'],
  'public site editor function exists'
);

select function_privs_are(
  'public',
  'get_public_site_editor',
  array['uuid'],
  'authenticated',
  array['EXECUTE'],
  'authenticated can load public site editor'
);

select ok(
  position(
    '''logo_url'''
    in pg_get_functiondef(
      'public.get_public_site_editor(uuid)'::regprocedure
    )
  ) > 0,
  'site editor exposes the canonical company logo'
);

select ok(
  position(
    '''about_image_url'''
    in pg_get_functiondef(
      'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'draft save persists the about image'
);

select ok(
  position(
    '''about_facts'''
    in pg_get_functiondef(
      'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'draft save persists about facts'
);

select ok(
  position(
    '''about_button_label'''
    in pg_get_functiondef(
      'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0
  and position(
    '''about_button_url'''
    in pg_get_functiondef(
      'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
    )
  ) > 0,
  'draft save persists the about call to action'
);

select * from finish();
rollback;
