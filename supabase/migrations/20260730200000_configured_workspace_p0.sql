-- OneStudio OS Configured Workspace P0
-- Makes self-service launch idempotent, preserves locale order, publishes only
-- the primary locale, and transfers the chosen demo palette/content to the
-- real public site.

alter table public.business_launch_profiles
  add column if not exists launch_key uuid;

create unique index if not exists business_launch_profiles_launch_key_unique
  on public.business_launch_profiles (launch_key)
  where launch_key is not null;

create or replace function public.demo_public_site_content(
  p_demo_slug text,
  p_palette_index integer,
  p_business_name text,
  p_tagline text,
  p_locale text,
  p_is_primary boolean,
  p_enabled_modules text[]
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_locale text := split_part(lower(coalesce(p_locale, 'en')), '-', 1);
  v_demo text := lower(trim(coalesce(p_demo_slug, '')));
  v_palette integer := greatest(0, least(2, coalesce(p_palette_index, 0)));
  v_defaults jsonb := public.default_public_site_content(p_business_name, p_locale);
  v_accent text;
  v_dark text;
  v_surface text;
  v_title text;
  v_promise text;
  v_description text;
  v_about text;
  v_action text;
begin
  v_accent := case v_demo
    when 'frame-house' then (array['#d9b78f', '#a8c5c8', '#d7d3cc'])[v_palette + 1]
    when 'lumiere' then (array['#e8b6a8', '#d7bd88', '#d6a6bb'])[v_palette + 1]
    when 'north-flow' then (array['#b5d4e5', '#b8cdb7', '#d9c5a6'])[v_palette + 1]
    when 'bloom-room' then (array['#d7c6a0', '#e5b7bd', '#c6c58d'])[v_palette + 1]
    when 'little-orbit' then (array['#edc37f', '#8bc7c5', '#d7a8be'])[v_palette + 1]
    when 'black-ink' then (array['#b9b5ae', '#9eabb2', '#b88e91'])[v_palette + 1]
    when 'vow-films' then (array['#c6cdea', '#d8cfbf', '#aebca9'])[v_palette + 1]
    when 'paw-club' then (array['#9fd8cf', '#edbd91', '#c9b8df'])[v_palette + 1]
    else '#9a742e'
  end;

  v_dark := case v_demo
    when 'frame-house' then (array['#28201c', '#233235', '#171717'])[v_palette + 1]
    when 'lumiere' then (array['#552f3a', '#423a2d', '#3e2433'])[v_palette + 1]
    when 'north-flow' then (array['#203b50', '#2d4437', '#4a3d31'])[v_palette + 1]
    when 'bloom-room' then (array['#344334', '#54353c', '#3d432d'])[v_palette + 1]
    when 'little-orbit' then (array['#68493b', '#294e50', '#533247'])[v_palette + 1]
    when 'black-ink' then (array['#202020', '#222a2f', '#382628'])[v_palette + 1]
    when 'vow-films' then (array['#28344f', '#403a34', '#303d31'])[v_palette + 1]
    when 'paw-club' then (array['#23504c', '#59402e', '#413553'])[v_palette + 1]
    else '#191b20'
  end;

  v_surface := case v_demo
    when 'frame-house' then (array['#f5efe8', '#edf3f2', '#f4f2ed'])[v_palette + 1]
    when 'lumiere' then (array['#fbf1ed', '#f7f2e8', '#f8edf3'])[v_palette + 1]
    when 'north-flow' then (array['#eef5f7', '#eff4ee', '#f6f1e9'])[v_palette + 1]
    when 'bloom-room' then (array['#f4f1e8', '#fbf0f1', '#f4f4e8'])[v_palette + 1]
    when 'little-orbit' then (array['#fff6e6', '#eef8f6', '#fbf0f5'])[v_palette + 1]
    when 'black-ink' then (array['#efede9', '#edf0f1', '#f2ecec'])[v_palette + 1]
    when 'vow-films' then (array['#f0f2fa', '#f8f5ef', '#f0f3ed'])[v_palette + 1]
    when 'paw-club' then (array['#eef9f6', '#fcf4eb', '#f5f0fa'])[v_palette + 1]
    else '#f3f0e9'
  end;

  if v_locale = 'ru' then
    v_title := case v_demo
      when 'frame-house' then 'Фотостудия'
      when 'lumiere' then 'Салон красоты'
      when 'north-flow' then 'Студия пилатеса'
      when 'bloom-room' then 'Цветочная мастерская'
      when 'little-orbit' then 'Детский центр'
      when 'black-ink' then 'Тату-студия'
      when 'vow-films' then 'Свадебная видеосъёмка'
      when 'paw-club' then 'Груминг-салон'
      else 'Студия'
    end;
    v_promise := case v_demo
      when 'frame-house' then 'Пространство для ваших историй'
      when 'lumiere' then 'Красота в вашем ритме'
      when 'north-flow' then 'Сильное тело. Спокойный ум.'
      when 'bloom-room' then 'Цветы, которые говорят за вас'
      when 'little-orbit' then 'Место для больших открытий'
      when 'black-ink' then 'Идея становится частью вас'
      when 'vow-films' then 'Ваш день. В движении и свете.'
      when 'paw-club' then 'Забота, которую видно'
      else p_business_name
    end;
    v_description := case v_demo
      when 'frame-house' then 'Аренда пространства, фотосессии и лучшие кадры — в одном месте.'
      when 'lumiere' then 'Уход, красота и время для себя — с удобной онлайн-записью.'
      when 'north-flow' then 'Осознанное движение, сильное тело и занятия в вашем ритме.'
      when 'bloom-room' then 'Авторские букеты, мастер-классы и цветы для важных событий.'
      when 'little-orbit' then 'Программы, в которых детям интересно расти и открывать новое.'
      when 'black-ink' then 'Индивидуальные эскизы, сильные мастера и внимание к каждой детали.'
      when 'vow-films' then 'Живые фильмы о вашем дне, чувствах и людях рядом.'
      when 'paw-club' then 'Бережный груминг и забота, которую видно с первого взгляда.'
      else 'Услуги и удобная запись — в одном месте.'
    end;
    v_about := case v_demo
      when 'frame-house' then 'Пространство для съёмок, творчества и историй, которые хочется сохранить.'
      when 'lumiere' then 'Современный салон с внимательными мастерами и понятным выбором услуг.'
      when 'north-flow' then 'Студия движения для тех, кто выбирает силу без спешки и напряжения.'
      when 'bloom-room' then 'Цветочная мастерская, где каждый букет создаётся для конкретного чувства.'
      when 'little-orbit' then 'Тёплая среда, небольшие группы и программы с уважением к темпу ребёнка.'
      when 'black-ink' then 'Студия авторской татуировки с честной консультацией и безопасным процессом.'
      when 'vow-films' then 'Команда видеографов, которая бережно сохраняет атмосферу настоящего дня.'
      when 'paw-club' then 'Спокойный уход, бережное знакомство и индивидуальный подход к питомцу.'
      else v_defaults->>'about_text'
    end;
    v_action := case v_demo
      when 'frame-house' then 'Проверить свободное время'
      when 'lumiere' then 'Записаться'
      when 'north-flow' then 'Выбрать занятие'
      when 'bloom-room' then 'Выбрать букет'
      when 'little-orbit' then 'Выбрать программу'
      when 'black-ink' then 'Выбрать мастера'
      when 'vow-films' then 'Проверить дату'
      when 'paw-club' then 'Записать питомца'
      else v_defaults->>'booking_label'
    end;
  elsif v_locale = 'uk' then
    v_title := case v_demo
      when 'frame-house' then 'Фотостудія'
      when 'lumiere' then 'Салон краси'
      when 'north-flow' then 'Студія пілатесу'
      when 'bloom-room' then 'Квіткова майстерня'
      when 'little-orbit' then 'Дитячий центр'
      when 'black-ink' then 'Тату-студія'
      when 'vow-films' then 'Весільна відеозйомка'
      when 'paw-club' then 'Грумінг-салон'
      else 'Студія'
    end;
    v_promise := case v_demo
      when 'frame-house' then 'Простір для ваших історій'
      when 'lumiere' then 'Краса у вашому ритмі'
      when 'north-flow' then 'Сильне тіло. Спокійний розум.'
      when 'bloom-room' then 'Квіти, що говорять за вас'
      when 'little-orbit' then 'Місце для великих відкриттів'
      when 'black-ink' then 'Ідея стає частиною вас'
      when 'vow-films' then 'Ваш день. У русі та світлі.'
      when 'paw-club' then 'Турбота, яку видно'
      else p_business_name
    end;
    v_description := v_defaults->>'hero_text';
    v_about := v_defaults->>'about_text';
    v_action := case v_demo
      when 'frame-house' then 'Перевірити вільний час'
      when 'lumiere' then 'Записатися'
      when 'north-flow' then 'Обрати заняття'
      when 'bloom-room' then 'Обрати букет'
      when 'little-orbit' then 'Обрати програму'
      when 'black-ink' then 'Обрати майстра'
      when 'vow-films' then 'Перевірити дату'
      when 'paw-club' then 'Записати улюбленця'
      else v_defaults->>'booking_label'
    end;
  elsif v_locale = 'pl' then
    v_title := case v_demo
      when 'frame-house' then 'Studio fotograficzne'
      when 'lumiere' then 'Salon piękności'
      when 'north-flow' then 'Studio pilates'
      when 'bloom-room' then 'Pracownia florystyczna'
      when 'little-orbit' then 'Centrum dla dzieci'
      when 'black-ink' then 'Studio tatuażu'
      when 'vow-films' then 'Filmy ślubne'
      when 'paw-club' then 'Salon groomerski'
      else 'Studio'
    end;
    v_promise := case v_demo
      when 'frame-house' then 'Przestrzeń dla Twoich historii'
      when 'lumiere' then 'Piękno w Twoim rytmie'
      when 'north-flow' then 'Silne ciało. Spokojny umysł.'
      when 'bloom-room' then 'Kwiaty, które mówią za Ciebie'
      when 'little-orbit' then 'Miejsce wielkich odkryć'
      when 'black-ink' then 'Pomysł staje się częścią Ciebie'
      when 'vow-films' then 'Twój dzień. W ruchu i świetle.'
      when 'paw-club' then 'Troska, którą widać'
      else p_business_name
    end;
    v_description := v_defaults->>'hero_text';
    v_about := v_defaults->>'about_text';
    v_action := case v_demo
      when 'frame-house' then 'Sprawdź dostępność'
      when 'lumiere' then 'Umów wizytę'
      when 'north-flow' then 'Wybierz zajęcia'
      when 'bloom-room' then 'Wybierz bukiet'
      when 'little-orbit' then 'Wybierz program'
      when 'black-ink' then 'Wybierz artystę'
      when 'vow-films' then 'Sprawdź termin'
      when 'paw-club' then 'Umów pupila'
      else v_defaults->>'booking_label'
    end;
  else
    v_title := case v_demo
      when 'frame-house' then 'Photo studio'
      when 'lumiere' then 'Beauty salon'
      when 'north-flow' then 'Pilates studio'
      when 'bloom-room' then 'Flower atelier'
      when 'little-orbit' then 'Children’s center'
      when 'black-ink' then 'Tattoo studio'
      when 'vow-films' then 'Wedding films'
      when 'paw-club' then 'Grooming salon'
      else 'Studio'
    end;
    v_promise := case v_demo
      when 'frame-house' then 'A space for your stories'
      when 'lumiere' then 'Beauty at your pace'
      when 'north-flow' then 'Strong body. Quiet mind.'
      when 'bloom-room' then 'Flowers that speak for you'
      when 'little-orbit' then 'A place for big discoveries'
      when 'black-ink' then 'Make the idea part of you'
      when 'vow-films' then 'Your day, in motion and light'
      when 'paw-club' then 'Care you can see'
      else p_business_name
    end;
    v_description := case v_demo
      when 'frame-house' then 'Studio rental, photo sessions and memorable images in one place.'
      when 'lumiere' then 'Care, beauty and time for yourself with simple online booking.'
      when 'north-flow' then 'Mindful movement, a stronger body and classes at your pace.'
      when 'bloom-room' then 'Signature bouquets, workshops and flowers for meaningful moments.'
      when 'little-orbit' then 'Programs where children can grow, explore and enjoy learning.'
      when 'black-ink' then 'Custom artwork, experienced artists and attention to every detail.'
      when 'vow-films' then 'Living films about your day, your feelings and the people beside you.'
      when 'paw-club' then 'Gentle grooming and care you can see from the first visit.'
      else v_defaults->>'hero_text'
    end;
    v_about := case v_demo
      when 'frame-house' then 'A creative space for shoots, ideas and stories worth keeping.'
      when 'lumiere' then 'A modern salon with attentive specialists and clear service choices.'
      when 'north-flow' then 'A movement studio for strength without hurry or pressure.'
      when 'bloom-room' then 'A flower atelier where every bouquet begins with a feeling.'
      when 'little-orbit' then 'A warm environment, small groups and programs that respect each child’s pace.'
      when 'black-ink' then 'A custom tattoo studio with honest consultation and a safe process.'
      when 'vow-films' then 'A filmmaking team that carefully preserves the atmosphere of a real day.'
      when 'paw-club' then 'Calm care, gentle introductions and an individual approach to every pet.'
      else v_defaults->>'about_text'
    end;
    v_action := case v_demo
      when 'frame-house' then 'Check availability'
      when 'lumiere' then 'Book a visit'
      when 'north-flow' then 'Choose a class'
      when 'bloom-room' then 'Choose flowers'
      when 'little-orbit' then 'Choose a program'
      when 'black-ink' then 'Choose an artist'
      when 'vow-films' then 'Check the date'
      when 'paw-club' then 'Book your pet'
      else v_defaults->>'booking_label'
    end;
  end if;

  return v_defaults || jsonb_build_object(
    'template_id', 'demo-' || v_demo,
    'theme_accent', v_accent,
    'theme_dark', v_dark,
    'theme_surface', v_surface,
    'brand_name', left(trim(coalesce(p_business_name, '')), 80),
    'hero_image_url', '/images/demos/' || v_demo || '.webp',
    'hero_eyebrow', v_title,
    'hero_title', left(
      case
        when p_is_primary and nullif(trim(coalesce(p_tagline, '')), '') is not null
          then trim(p_tagline)
        else v_promise
      end,
      140
    ),
    'hero_text', v_description,
    'about_text', v_about,
    'booking_label', v_action,
    'show_hero', true,
    'show_services', 'catalog' = any(coalesce(p_enabled_modules, '{}'::text[])),
    'show_portfolio', 'portfolio' = any(coalesce(p_enabled_modules, '{}'::text[])),
    'show_booking', 'scheduling' = any(coalesce(p_enabled_modules, '{}'::text[])),
    'show_about', true,
    'show_contact', true,
    'site_summary', left(v_description, 500),
    'seo_title', left(trim(coalesce(p_business_name, '')) || ' · ' || v_title, 70),
    'seo_description', left(v_description, 170),
    'demo_slug', v_demo,
    'palette_index', v_palette
  );
end;
$$;

create or replace function public.create_configured_workspace(p_configuration jsonb)
returns table (business_id uuid, business_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_business_id uuid := gen_random_uuid();
  v_existing_business_id uuid;
  v_existing_slug text;
  v_launch_key uuid;
  v_name text := btrim(coalesce(p_configuration ->> 'business_name', ''));
  v_demo_slug text := lower(btrim(coalesce(p_configuration ->> 'demo_slug', '')));
  v_tagline text := btrim(coalesce(p_configuration ->> 'tagline', ''));
  v_currency text := upper(btrim(coalesce(p_configuration ->> 'currency', 'EUR')));
  v_palette integer := coalesce((p_configuration ->> 'palette_index')::integer, 0);
  v_requested_primary_locale text := lower(btrim(coalesce(p_configuration ->> 'primary_locale', '')));
  v_locales text[];
  v_modules text[];
  v_slug text;
  v_default_locale text;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_configuration, '{}'::jsonb)) <> 'object' then
    raise exception 'configuration_invalid' using errcode = '22023';
  end if;

  begin
    v_launch_key := nullif(btrim(coalesce(p_configuration ->> 'launch_id', '')), '')::uuid;
  exception when invalid_text_representation then
    raise exception 'launch_id_invalid' using errcode = '22023';
  end;
  if v_launch_key is null then
    v_launch_key := gen_random_uuid();
  end if;

  -- Serialize only identical launch attempts. A retry returns the first result
  -- instead of creating a second workspace.
  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || ':' || v_launch_key::text, 0)
  );

  select profile.business_id, business.slug
  into v_existing_business_id, v_existing_slug
  from public.business_launch_profiles profile
  join public.business_members member
    on member.business_id = profile.business_id
   and member.user_id = v_user_id
   and member.is_active
  join public.businesses business
    on business.id = profile.business_id
   and business.status <> 'archived'
  where profile.launch_key = v_launch_key
  limit 1;

  if v_existing_business_id is not null then
    perform public.set_default_business(v_existing_business_id);
    return query select v_existing_business_id, v_existing_slug;
    return;
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'workspace_name_invalid' using errcode = '22023';
  end if;
  if v_demo_slug not in (
    'frame-house', 'lumiere', 'north-flow', 'bloom-room',
    'little-orbit', 'black-ink', 'vow-films', 'paw-club'
  ) then
    raise exception 'demo_invalid' using errcode = '22023';
  end if;
  if char_length(v_tagline) > 160 or v_palette not between 0 and 2 then
    raise exception 'design_configuration_invalid' using errcode = '22023';
  end if;
  if v_currency !~ '^[A-Z]{3}$' then
    raise exception 'workspace_currency_invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_configuration -> 'locales', '[]'::jsonb)) <> 'array' then
    raise exception 'workspace_locales_invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_configuration -> 'enabled_modules', '[]'::jsonb)) <> 'array' then
    raise exception 'workspace_modules_invalid' using errcode = '22023';
  end if;

  select coalesce(
    array_agg(ordered_locale.locale order by ordered_locale.first_position),
    array['en']::text[]
  )
  into v_locales
  from (
    select requested_locale.locale, min(requested_locale.position) as first_position
    from jsonb_array_elements_text(
      coalesce(p_configuration -> 'locales', '["en"]'::jsonb)
    ) with ordinality as requested_locale(locale, position)
    where requested_locale.locale in ('ru', 'en', 'uk', 'pl')
    group by requested_locale.locale
  ) ordered_locale;

  if cardinality(v_locales) = 0 then
    v_locales := array['en']::text[];
  end if;

  v_default_locale := case
    when v_requested_primary_locale = any(v_locales)
      then v_requested_primary_locale
    else v_locales[1]
  end;

  select coalesce(
    array_agg(distinct requested_module.module_key order by requested_module.module_key),
    array['core']::text[]
  )
  into v_modules
  from jsonb_array_elements_text(
    coalesce(p_configuration -> 'enabled_modules', '["core"]'::jsonb)
  ) as requested_module(module_key)
  where requested_module.module_key in (
    'core', 'media', 'portfolio', 'catalog', 'scheduling',
    'crm', 'payments', 'notifications', 'documents', 'analytics'
  );

  v_modules := array(
    select distinct expanded_module.module_key
    from unnest(
      array['core', 'catalog', 'crm']::text[] || v_modules
      || case
        when 'portfolio' = any(v_modules) then array['media']::text[]
        else '{}'::text[]
      end
      || case
        when 'notifications' = any(v_modules) then array['payments']::text[]
        else '{}'::text[]
      end
      || case
        when 'documents' = any(v_modules) then array['payments', 'notifications']::text[]
        else '{}'::text[]
      end
    ) as expanded_module(module_key)
    order by expanded_module.module_key
  );

  v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    v_slug := v_demo_slug;
  end if;
  v_slug := left(v_slug, 42) || '-' ||
    substr(replace(v_business_id::text, '-', ''), 1, 8);

  insert into public.businesses (
    id, slug, name, timezone, default_locale, default_currency, status
  ) values (
    v_business_id, v_slug, v_name, 'Europe/Kyiv',
    v_default_locale, v_currency, 'active'
  );

  update public.business_members
  set is_default = false,
      updated_at = now()
  where user_id = v_user_id
    and is_active
    and is_default;

  insert into public.business_members (
    business_id, user_id, role, is_active, is_default
  ) values (
    v_business_id, v_user_id, 'owner', true, true
  );

  update public.business_modules as workspace_module
  set enabled = workspace_module.module_key = any(v_modules),
      version = case
        when workspace_module.module_key = any(v_modules) then '1.0.0'
        else workspace_module.version
      end,
      updated_at = now()
  where workspace_module.business_id = v_business_id;

  insert into public.business_launch_profiles (
    business_id, business_type, enabled_modules, completed_at, completed_by,
    demo_slug, tagline, palette_index, locales, launch_key
  ) values (
    v_business_id,
    case
      when v_demo_slug = 'frame-house' then 'photo_studio'
      when v_demo_slug in ('lumiere', 'black-ink', 'paw-club') then 'beauty_salon'
      when v_demo_slug in ('north-flow', 'little-orbit') then 'school'
      when v_demo_slug in ('bloom-room', 'vow-films') then 'creative_service'
      else 'other'
    end,
    v_modules, now(), v_user_id, v_demo_slug, v_tagline, v_palette, v_locales,
    v_launch_key
  )
  on conflict on constraint business_launch_profiles_pkey do update
  set enabled_modules = excluded.enabled_modules,
      completed_at = excluded.completed_at,
      completed_by = excluded.completed_by,
      demo_slug = excluded.demo_slug,
      tagline = excluded.tagline,
      palette_index = excluded.palette_index,
      locales = excluded.locales,
      launch_key = excluded.launch_key,
      updated_at = now();

  -- The launch-profile trigger seeds editable services, resources and hours.
  -- Replace its generic locale snapshot with the real selected demo design.
  insert into public.public_site_locales (
    business_id, locale, draft_content, published_content, published_at
  )
  select
    v_business_id,
    configured_locale.locale,
    public.demo_public_site_content(
      v_demo_slug,
      v_palette,
      v_name,
      v_tagline,
      configured_locale.locale,
      configured_locale.locale = v_default_locale,
      v_modules
    ),
    case
      when configured_locale.locale = v_default_locale then
        public.demo_public_site_content(
          v_demo_slug,
          v_palette,
          v_name,
          v_tagline,
          configured_locale.locale,
          true,
          v_modules
        )
      else null
    end,
    case when configured_locale.locale = v_default_locale then now() else null end
  from unnest(v_locales) as configured_locale(locale)
  on conflict on constraint public_site_locales_pkey do update
  set draft_content = excluded.draft_content,
      published_content = excluded.published_content,
      published_at = excluded.published_at,
      updated_at = now();

  insert into public.public_site_settings (
    business_id, primary_locale, is_published, published_at
  ) values (
    v_business_id, v_default_locale, true, now()
  )
  on conflict on constraint public_site_settings_pkey do update
  set primary_locale = excluded.primary_locale,
      is_published = true,
      published_at = excluded.published_at,
      updated_at = now();

  return query select v_business_id, v_slug;
end;
$$;

revoke all on function public.demo_public_site_content(
  text, integer, text, text, text, boolean, text[]
) from public, anon, authenticated;
revoke all on function public.create_configured_workspace(jsonb)
  from public, anon, authenticated;

grant execute on function public.create_configured_workspace(jsonb)
  to authenticated, service_role;
grant execute on function public.demo_public_site_content(
  text, integer, text, text, text, boolean, text[]
) to service_role;

comment on column public.business_launch_profiles.launch_key is
  'Client-generated idempotency key for one self-service launch attempt.';
comment on function public.demo_public_site_content(
  text, integer, text, text, text, boolean, text[]
) is 'Builds locale-safe starter content and the exact selected demo palette.';
comment on function public.create_configured_workspace(jsonb) is
  'Creates or returns one idempotent configured workspace and publishes only its primary locale.';
