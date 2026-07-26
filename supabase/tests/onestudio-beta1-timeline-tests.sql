begin;
select plan(8);

select has_function('public','get_admin_booking_timeline',array['uuid'],'booking unified timeline RPC exists');
select has_function('public','get_admin_client_timeline',array['uuid'],'client unified timeline RPC exists');
select ok((select proretset from pg_proc where oid = 'public.get_admin_booking_timeline(uuid)'::regprocedure),'booking timeline returns a row set');
select ok((select proretset from pg_proc where oid = 'public.get_admin_client_timeline(uuid)'::regprocedure),'client timeline returns a row set');
select ok((select prosecdef from pg_proc where oid = 'public.get_admin_booking_timeline(uuid)'::regprocedure),'booking timeline uses security definer');
select ok((select prosecdef from pg_proc where oid = 'public.get_admin_client_timeline(uuid)'::regprocedure),'client timeline uses security definer');
select ok(has_function_privilege('authenticated','public.get_admin_booking_timeline(uuid)','EXECUTE'),'authenticated can execute booking timeline');
select ok(has_function_privilege('authenticated','public.get_admin_client_timeline(uuid)','EXECUTE'),'authenticated can execute client timeline');

select * from finish();
rollback;
