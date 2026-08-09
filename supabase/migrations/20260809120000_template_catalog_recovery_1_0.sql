-- Template Catalog Recovery 1.0
-- Adds a canonical template-aware creation contract without removing the legacy demo contract.

create or replace function public.create_template_workspace(p_request jsonb)
returns table (business_id uuid, business_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mode text := lower(btrim(coalesce(p_request ->> 'creation_mode', '')));
  v_template text := lower(btrim(coalesce(p_request ->> 'template_key', '')));
  v_legacy_demo text;
  v_result record;
  v_seed jsonb;
begin
  if v_mode not in ('blank', 'template') then raise exception 'creation_mode_invalid' using errcode = '22023'; end if;
  if v_mode = 'blank' then v_template := 'standard'; end if;
  if v_template not in ('standard', 'gloss-nail-studio', 'premium-kids-center', 'premium-studio') then raise exception 'template_key_invalid' using errcode = '22023'; end if;
  if v_mode = 'blank' and v_template <> 'standard' then raise exception 'blank_template_invalid' using errcode = '22023'; end if;

  v_legacy_demo := case v_template when 'premium-studio' then 'frame-house' when 'premium-kids-center' then 'little-orbit' else 'lumiere' end;
  select * into v_result from public.create_configured_workspace(jsonb_build_object(
    'business_name', p_request ->> 'business_name', 'demo_slug', v_legacy_demo, 'tagline', '', 'palette_index', 0,
    'locales', coalesce(p_request -> 'locales', '["ru","en"]'::jsonb), 'currency', coalesce(p_request ->> 'currency', 'EUR'),
    'enabled_modules', coalesce(p_request -> 'enabled_modules', '["core","catalog","crm","media","portfolio"]'::jsonb)
  ));

  v_seed := jsonb_build_object(
    'template_id', v_template, 'brand_name', case v_template when 'gloss-nail-studio' then 'GLOSS' when 'premium-kids-center' then 'BEMBI' when 'premium-studio' then 'NOIR FRAME' else coalesce(p_request ->> 'business_name', 'Новый сайт') end,
    'hero_eyebrow', case when v_template = 'standard' then 'Добро пожаловать' else '' end,
    'hero_title', coalesce(p_request ->> 'business_name', 'Новый сайт'), 'hero_text', case when v_template = 'standard' then 'Добавьте текст о вашем проекте.' else '' end,
    'about_title', 'О нас', 'about_text', 'Расскажите о себе и своей работе.', 'services_title', 'Услуги', 'portfolio_title', 'Проекты', 'contact_title', 'Контакты',
    'booking_label', 'Связаться', 'services_label', 'Услуги', 'portfolio_label', 'Проекты', 'about_label', 'О нас', 'contact_label', 'Контакты',
    'show_hero', true, 'show_services', false, 'show_portfolio', false, 'show_about', true, 'show_contact', true,
    'pages', '[]'::jsonb, 'custom_blocks', '[]'::jsonb, 'seo_title', coalesce(p_request ->> 'business_name', 'Новый сайт'), 'seo_description', 'Сайт на OneStudio.'
  );
  if v_template = 'premium-kids-center' then v_seed := v_seed || jsonb_build_object('template_content', jsonb_build_object(v_template, jsonb_build_object('brand_name', 'BEMBI'))); end if;
  if v_template = 'premium-studio' then v_seed := v_seed || jsonb_build_object('template_content', jsonb_build_object(v_template, jsonb_build_object('version', 1, 'brand', jsonb_build_object('first','NOIR','second','FRAME','location','Киев · Украина','email','studio@example.com'), 'hero', jsonb_build_object('eyebrow','Фотостудия · Киев · 2026','lines',jsonb_build_array('Свет','решает','всё.'),'note','Пространство для тех, кто видит иначе.','cta','Войти в свет')))); end if;

  update public.public_site_locales set draft_content = v_seed, published_content = null, updated_at = now() where business_id = v_result.business_id;
  if v_template = 'gloss-nail-studio' then perform public.apply_public_site_template_seed(v_result.business_id, v_template); end if;
  return query select v_result.business_id, v_result.business_slug;
end;
$$;

revoke all on function public.create_template_workspace(jsonb) from public, anon, authenticated;
grant execute on function public.create_template_workspace(jsonb) to authenticated, service_role;
comment on function public.create_template_workspace(jsonb) is 'Atomically creates an unpublished workspace from creation_mode + canonical template_key. Legacy create_configured_workspace remains available.';
