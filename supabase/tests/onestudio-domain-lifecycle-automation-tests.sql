begin;

create extension if not exists pgtap;

select plan(10);

select has_table(
  'public',
  'domain_lifecycle_events',
  'domain lifecycle audit table exists'
);

select has_pk(
  'public',
  'domain_lifecycle_events',
  'domain lifecycle audit table has a primary key'
);

select has_column(
  'public',
  'domain_lifecycle_events',
  'business_id',
  'domain lifecycle events keep the deleted workspace id'
);

select has_column(
  'public',
  'domain_lifecycle_events',
  'domain',
  'domain lifecycle events keep the primary custom domain'
);

select has_column(
  'public',
  'domain_lifecycle_events',
  'redirect_domain',
  'domain lifecycle events keep the redirect domain'
);

select has_column(
  'public',
  'domain_lifecycle_events',
  'status',
  'domain lifecycle events expose lifecycle status'
);

select ok(
  (
    select relation.relrowsecurity
    from pg_class relation
    join pg_namespace namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'domain_lifecycle_events'
  ),
  'domain lifecycle audit table has row level security enabled'
);

select ok(
  not has_table_privilege('anon', 'public.domain_lifecycle_events', 'SELECT'),
  'anonymous users cannot read domain lifecycle events'
);

select ok(
  not has_table_privilege('authenticated', 'public.domain_lifecycle_events', 'SELECT'),
  'authenticated users cannot read domain lifecycle events directly'
);

select ok(
  has_table_privilege('service_role', 'public.domain_lifecycle_events', 'SELECT')
  and has_table_privilege('service_role', 'public.domain_lifecycle_events', 'INSERT')
  and has_table_privilege('service_role', 'public.domain_lifecycle_events', 'UPDATE'),
  'service role can maintain the domain lifecycle audit log'
);

select * from finish();

rollback;
