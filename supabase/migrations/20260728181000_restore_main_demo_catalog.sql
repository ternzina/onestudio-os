-- Restore the single OneStudio OS public demo service after a local database reset.
--
-- The production service keeps this stable id. If it already exists, this
-- migration is a no-op, so a later remote migration cannot create a duplicate.

do $$
declare
  v_business_id uuid;
  v_category_id uuid;
  v_service_id constant uuid := 'c4856126-ecb0-4956-bbd7-86aaa62d20a4';
begin
  select business.id
    into v_business_id
  from public.businesses business
  where business.slug = 'main'
    and business.status = 'active'
  limit 1;

  if v_business_id is null then
    raise notice 'OneStudio OS main workspace was not found; demo catalog restore skipped.';
    return;
  end if;

  if exists (
    select 1
    from public.services service
    where service.id = v_service_id
       or (
         service.business_id = v_business_id
         and service.title = 'Посмотреть возможности'
       )
  ) then
    return;
  end if;

  select category.id
    into v_category_id
  from public.catalog_categories category
  where category.business_id = v_business_id
    and category.kind = 'service'
    and category.name = 'Возможности'
  order by category.sort_order, category.created_at
  limit 1;

  if v_category_id is null then
    insert into public.catalog_categories (
      business_id,
      kind,
      slug,
      name,
      description,
      is_public,
      is_active,
      sort_order
    )
    values (
      v_business_id,
      'service',
      'possibilities',
      'Возможности',
      '',
      true,
      true,
      10
    )
    on conflict (business_id, kind, slug) do update
      set name = excluded.name,
          is_public = true,
          is_active = true,
          updated_at = now()
    returning id into v_category_id;
  end if;

  insert into public.services (
    id,
    business_id,
    category_id,
    slug,
    kind,
    title,
    description,
    pricing_model,
    price_minor,
    currency,
    duration_min_minutes,
    duration_max_minutes,
    duration_step_minutes,
    capacity,
    requires_confirmation,
    is_public,
    is_active,
    sort_order
  )
  values (
    v_service_id,
    v_business_id,
    v_category_id,
    'view-possibilities',
    'other',
    'Посмотреть возможности',
    'Расскажите о своём бизнесе — мы изучим задачу и свяжемся с вами письменно.',
    'fixed',
    0,
    'EUR',
    60,
    60,
    60,
    1,
    false,
    true,
    true,
    10
  )
  on conflict (id) do nothing;
end;
$$;
