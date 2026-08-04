begin;

create extension if not exists pgtap;

select plan(6);

select ok(
  to_regprocedure('public.list_public_site_seo_paths(text)') is not null,
  'Custom-domain SEO path function exists'
);

select ok(
  has_function_privilege(
    'anon',
    'public.list_public_site_seo_paths(text)',
    'EXECUTE'
  ),
  'Anonymous public runtime can list published SEO paths'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.list_public_site_seo_paths(text)',
    'EXECUTE'
  ),
  'Authenticated runtime can list published SEO paths'
);

select ok(
  (
    select procedure.prosecdef
    from pg_proc procedure
    where procedure.oid =
      to_regprocedure('public.list_public_site_seo_paths(text)')
  ),
  'SEO path function is security definer'
);

select is(
  (
    select procedure.provolatile::text
    from pg_proc procedure
    where procedure.oid =
      to_regprocedure('public.list_public_site_seo_paths(text)')
  ),
  's',
  'SEO path function is stable'
);

select ok(
  position(
    'custom_domain text'
    in pg_get_function_result(
      to_regprocedure('public.list_public_site_seo_paths(text)')
    )
  ) > 0,
  'SEO path function exposes the active custom domain'
);

select * from finish();

rollback;
