begin;

select plan(8);

select has_function(
  'public',
  'normalize_public_site_service_images',
  array['jsonb'],
  'service image-map normalizer exists'
);

select has_function(
  'public',
  'save_public_site_draft_v22',
  array['uuid', 'text', 'jsonb', 'boolean'],
  'save_public_site_draft_v22 exists'
);

select ok(
  position('service_card_images' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists stable service image mapping'
);

select ok(
  position('services_layout' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists services layout'
);

select ok(
  position('services_columns' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists services columns'
);

select ok(
  position('services_button_label' in pg_get_functiondef(
    'public.save_public_site_draft_v22(uuid,text,jsonb,boolean)'::regprocedure
  )) > 0,
  'draft save persists service button label'
);

select ok(
  position('from public.services service' in pg_get_functiondef(
    'public.get_public_site_editor(uuid)'::regprocedure
  )) > 0,
  'visual editor receives canonical catalog services'
);

select is(
  public.normalize_public_site_service_images(
    '{"valid-service":"https://example.com/service.webp","INVALID KEY":"https://example.com/no.webp"}'::jsonb
  ),
  '{"valid-service":"https://example.com/service.webp"}'::jsonb,
  'service image map keeps stable slugs and normalized image URLs'
);

select * from finish();
rollback;
