-- CashPath is a customer-creatable canonical package; this migration is additive only.
-- legacy_demo_slug was removed when package creation was isolated from legacy demos.
insert into public.site_template_registry (template_key, seed_template_id, is_customer_creatable, is_active)
values ('cashpath', 'cashpath', true, true)
on conflict (template_key) do update set
  seed_template_id = excluded.seed_template_id,
  is_customer_creatable = excluded.is_customer_creatable,
  is_active = excluded.is_active,
  updated_at = now();
