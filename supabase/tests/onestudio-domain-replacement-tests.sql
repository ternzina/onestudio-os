begin;

create extension if not exists pgtap;

select plan(13);

select has_table(
  'public',
  'public_site_domain_replacements',
  'domain replacement staging table exists'
);

select has_pk(
  'public',
  'public_site_domain_replacements',
  'domain replacement table has a primary key'
);

select has_column(
  'public',
  'public_site_domain_replacements',
  'current_domain',
  'replacement keeps the currently live domain'
);

select has_column(
  'public',
  'public_site_domain_replacements',
  'candidate_domain',
  'replacement keeps the candidate domain'
);

select has_column(
  'public',
  'public_site_domain_replacements',
  'phase',
  'replacement exposes promotion phase'
);

select has_column(
  'public',
  'public_site_domain_replacements',
  'dns_records',
  'replacement stores candidate DNS records'
);

select col_is_unique(
  'public',
  'public_site_domain_replacements',
  'business_id',
  'only one replacement can run per site'
);

select col_is_unique(
  'public',
  'public_site_domain_replacements',
  'candidate_domain',
  'candidate domain can only be reserved once'
);

select has_function(
  'public',
  'promote_public_site_domain_replacement',
  array['uuid'],
  'safe domain promotion function exists'
);

select ok(
  (
    select relation.relrowsecurity
    from pg_class relation
    join pg_namespace namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'public_site_domain_replacements'
  ),
  'domain replacement table has row level security enabled'
);

select ok(
  not has_table_privilege('anon', 'public.public_site_domain_replacements', 'SELECT'),
  'anonymous users cannot read replacement state'
);

select ok(
  not has_table_privilege('authenticated', 'public.public_site_domain_replacements', 'SELECT'),
  'authenticated users cannot read replacement state directly'
);

select ok(
  has_table_privilege('service_role', 'public.public_site_domain_replacements', 'SELECT')
  and has_table_privilege('service_role', 'public.public_site_domain_replacements', 'INSERT')
  and has_table_privilege('service_role', 'public.public_site_domain_replacements', 'UPDATE')
  and has_table_privilege('service_role', 'public.public_site_domain_replacements', 'DELETE'),
  'service role can maintain replacement state'
);

select * from finish();

rollback;
