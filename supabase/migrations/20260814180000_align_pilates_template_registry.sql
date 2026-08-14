-- OneStudio OS: register ALIGN Pilates Studio for canonical customer creation.
-- Additive migration for canonical package identity.

insert into public.site_template_registry (
  template_key,
  seed_template_id,
  is_customer_creatable,
  is_active
)
values (
  'align-pilates-studio',
  'align-pilates-studio',
  true,
  true
)
on conflict (template_key) do update set
  seed_template_id = excluded.seed_template_id,
  is_customer_creatable = excluded.is_customer_creatable,
  is_active = excluded.is_active,
  updated_at = now();
