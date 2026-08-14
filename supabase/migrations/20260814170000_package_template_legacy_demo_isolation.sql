-- OneStudio OS: isolate package-template creation from legacy demo identity.
--
-- create_configured_workspace remains the public legacy demo launcher. Canonical
-- package creation may reuse its atomic workspace bootstrap, but the bootstrap
-- profile is not template identity and must never survive the canonical write.

do $$
declare
  v_function regprocedure := 'public.create_template_workspace(jsonb)'::regprocedure;
  v_definition text;
  v_registry_lookup text := $lookup$
  select registry.legacy_demo_slug into v_legacy_demo
  from public.site_template_registry as registry
  where registry.template_key = v_template
    and registry.is_customer_creatable = true
    and registry.is_active = true;
$lookup$;
begin
  select pg_get_functiondef(v_function)
  into v_definition;

  if position('v_legacy_demo text;' in v_definition) = 0
     or position(v_registry_lookup in v_definition) = 0
     or position('''demo_slug'', v_legacy_demo' in v_definition) = 0
     or position('set business_type = v_business_type, first_service_id = v_service_id' in v_definition) = 0 then
    raise exception 'create_template_workspace_legacy_demo_contract_not_found';
  end if;

  v_definition := replace(
    v_definition,
    'v_legacy_demo text;',
    'v_bootstrap_demo constant text := ''lumiere'';'
  );
  v_definition := replace(v_definition, v_registry_lookup, '');
  v_definition := replace(
    v_definition,
    '''demo_slug'', v_legacy_demo',
    '''demo_slug'', v_bootstrap_demo'
  );
  v_definition := replace(
    v_definition,
    'set business_type = v_business_type, first_service_id = v_service_id',
    'set demo_slug = null, business_type = v_business_type, first_service_id = v_service_id'
  );

  execute v_definition;
end;
$$;

alter table public.site_template_registry
  drop column legacy_demo_slug;

comment on function public.create_template_workspace(jsonb) is
  'Canonical package creation. Registry template_key/seed_template_id and validated locale template_seeds are authoritative; the legacy demo bootstrap is isolated, atomic, and discarded.';
