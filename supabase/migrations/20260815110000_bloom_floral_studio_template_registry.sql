-- OneStudio OS: register BLOOM for canonical customer creation.
insert into public.site_template_registry (template_key, seed_template_id, is_customer_creatable, is_active)
values ('bloom-floral-studio', 'bloom-floral-studio', true, true)
on conflict (template_key) do update set seed_template_id = excluded.seed_template_id, is_customer_creatable = excluded.is_customer_creatable, is_active = excluded.is_active, updated_at = now();
