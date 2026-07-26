BEGIN;
SELECT plan(16);

SELECT has_table('public','document_templates','document_templates exists');
SELECT has_table('public','generated_documents','generated_documents exists');
SELECT has_function('public','render_document_text',ARRAY['text','jsonb'],'renderer exists');
SELECT has_function('public','seed_document_templates',ARRAY['uuid'],'template seeder exists');
SELECT has_function('public','create_generated_document',ARRAY['uuid','uuid','uuid','text'],'generator exists');
SELECT col_is_pk('public','document_templates','id','templates use id primary key');
SELECT col_is_pk('public','generated_documents','id','generated documents use id primary key');
SELECT col_not_null('public','document_templates','business_id','templates require business');
SELECT col_not_null('public','generated_documents','content_snapshot','generated content is required');
SELECT col_type_is('public','generated_documents','variables_snapshot','jsonb','variables snapshot is jsonb');
SELECT policies_are('public','document_templates',ARRAY['document templates configure by managers','document templates view by members'],'template policies installed');
SELECT policies_are('public','generated_documents',ARRAY['generated documents create by operators','generated documents update by managers','generated documents view by members'],'generated policies installed');
SELECT is(public.render_document_text('Hello {{client.name}}', '{"client.name":"Zina"}'::jsonb), 'Hello Zina', 'renderer replaces dotted variables');
SELECT is(public.render_document_text('A {{missing}}', '{}'::jsonb), 'A {{missing}}', 'unknown variables remain visible');
SELECT has_index('public','generated_documents','generated_documents_business_created_idx','generated document listing index exists');
SELECT has_index('public','document_templates','document_templates_business_type_idx','template lookup index exists');

SELECT * FROM finish();
ROLLBACK;
