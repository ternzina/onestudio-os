\set ON_ERROR_STOP on

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(16);
select has_table('public', 'public_requests', 'public requests table exists');
select has_function('public', 'get_public_request_context', array['text'], 'public request context exists');
select has_function('public', 'create_public_request', array['text','text','text','text','text','text','text','text','uuid'], 'public request creation exists');
select ok(has_function_privilege('anon', 'public.create_public_request(text,text,text,text,text,text,text,text,uuid)', 'EXECUTE'), 'anonymous visitor may submit request');
select ok(not has_table_privilege('anon', 'public.public_requests', 'SELECT'), 'anonymous visitor cannot read requests');
select ok(not has_table_privilege('anon', 'public.public_requests', 'INSERT'), 'anonymous visitor cannot bypass guarded function');

insert into public.businesses (id, slug, name, timezone, default_locale, default_currency, status)
values ('e1000000-0000-4000-8000-000000000001', 'request-alpha', 'Request Alpha', 'UTC', 'ru', 'EUR', 'active');

select is(public.get_public_request_context(' REQUEST-ALPHA ')->'business'->>'name', 'Request Alpha', 'context normalizes slug');
select ok(public.get_public_request_context('missing') is null, 'unknown business stays private');

set local role anon;
select lives_ok($sql$
  select public.create_public_request(
    'request-alpha', 'Зина Тест', 'ZINA@EXAMPLE.TEST', '', 'ru',
    'Студия', '', 'Нужен сайт без календаря',
    'e2000000-0000-4000-8000-000000000001'
  )
$sql$, 'anonymous request is accepted');
select lives_ok($sql$
  select public.create_public_request(
    'request-alpha', 'Зина Тест', 'ZINA@EXAMPLE.TEST', '', 'ru',
    'Студия', '', 'Нужен сайт без календаря',
    'e2000000-0000-4000-8000-000000000001'
  )
$sql$, 'request retry is idempotent');
select throws_ok($sql$
  select public.create_public_request(
    'request-alpha', 'З', 'wrong', '', 'ru', '', '', 'x',
    'e2000000-0000-4000-8000-000000000002'
  )
$sql$, '22023', 'invalid_public_request_client_name', 'invalid name is rejected');
reset role;

select is((select count(*) from public.public_requests where business_id='e1000000-0000-4000-8000-000000000001'), 1::bigint, 'only one request is stored');
select is((select client_email from public.public_requests where business_id='e1000000-0000-4000-8000-000000000001'), 'zina@example.test', 'email is normalized');
select is((select status from public.public_requests where business_id='e1000000-0000-4000-8000-000000000001'), 'new', 'new request has new status');
select is((select business_type from public.public_requests where business_id='e1000000-0000-4000-8000-000000000001'), 'Студия', 'business type is stored');
select is((select message from public.public_requests where business_id='e1000000-0000-4000-8000-000000000001'), 'Нужен сайт без календаря', 'message is stored');

select * from finish();
rollback;
