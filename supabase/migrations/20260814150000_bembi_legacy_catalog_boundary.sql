-- BEMBI remains an active runtime for its existing tenant, but is no longer
-- available as a template for newly created customer sites.
update public.site_template_registry
set is_customer_creatable = false,
    updated_at = timezone('utc', now())
where template_key = 'premium-kids-center';
