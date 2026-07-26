BEGIN;
SELECT plan(18);

SELECT has_column('public','generated_documents','recipient_email','recipient email exists');
SELECT has_column('public','generated_documents','sent_at','sent timestamp exists');
SELECT has_column('public','generated_documents','delivery_provider','delivery provider exists');
SELECT has_column('public','generated_documents','delivery_id','delivery id exists');
SELECT has_column('public','generated_documents','delivery_error','delivery error exists');
SELECT has_table('public','document_events','document event history exists');
SELECT col_is_pk('public','document_events','id','document events use id primary key');
SELECT col_not_null('public','document_events','business_id','document event requires business');
SELECT col_not_null('public','document_events','document_id','document event requires document');
SELECT col_not_null('public','document_events','event_type','document event requires event type');
SELECT policies_are('public','document_events',ARRAY['document events create by operators','document events view by members'],'document event policies installed');
SELECT has_function('public','record_document_delivery',ARRAY['uuid','boolean','text','text','text','text'],'delivery recorder exists');
SELECT has_index('public','document_events','document_events_document_created_idx','document history index exists');
SELECT has_index('public','document_events','document_events_business_created_idx','business document event index exists');
SELECT col_type_is('public','generated_documents','sent_at','timestamp with time zone','sent_at type is timestamptz');
SELECT col_type_is('public','document_events','created_at','timestamp with time zone','event created_at type is timestamptz');
SELECT table_privs_are('public','document_events','anon',ARRAY[]::text[],'anon has no event privileges');
SELECT table_privs_are('public','document_events','authenticated',ARRAY['INSERT','SELECT'],'authenticated has constrained event privileges');

SELECT * FROM finish();
ROLLBACK;
