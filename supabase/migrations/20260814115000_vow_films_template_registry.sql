-- OneStudio OS: register VOW FILMS for real customer site creation.
-- Additive migration only. Does not change production by itself.

insert into public.site_template_registry (
  template_key,
  seed_template_id,
  legacy_demo_slug,
  is_customer_creatable,
  is_active
)
values (
  'vow-films',
  'vow-films',
  'vow-films',
  true,
  true
)
on conflict (template_key) do update set
  seed_template_id = excluded.seed_template_id,
  legacy_demo_slug = excluded.legacy_demo_slug,
  is_customer_creatable = excluded.is_customer_creatable,
  is_active = excluded.is_active,
  updated_at = now();
