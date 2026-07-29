-- OneStudio OS Demo Workspace Seed 1.0
-- Turns a configured workspace into an editable starter site.
-- Existing customer content is preserved; only missing starter records are added.

create or replace function public.seed_demo_workspace_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business public.businesses%rowtype;
  v_resource_id uuid;
  v_content jsonb;
begin
  select business.*
  into v_business
  from public.businesses business
  where business.id = new.business_id;

  if v_business.id is null or new.demo_slug is null then
    return new;
  end if;

  -- A neutral first resource gives every bookable demo a working scheduling base.
  insert into public.resources (
    business_id, slug, kind, name, description, capacity, timezone,
    is_bookable, is_public, is_active, sort_order, metadata
  )
  values (
    v_business.id,
    'main-resource',
    case
      when new.demo_slug = 'frame-house' then 'space'
      when new.demo_slug in ('lumiere', 'black-ink', 'paw-club', 'vow-films') then 'staff'
      when new.demo_slug in ('north-flow', 'little-orbit', 'bloom-room') then 'space'
      else 'other'
    end,
    case
      when new.demo_slug = 'frame-house' then 'Основной зал'
      when new.demo_slug = 'lumiere' then 'Мастер'
      when new.demo_slug = 'north-flow' then 'Студия'
      when new.demo_slug = 'bloom-room' then 'Мастерская'
      when new.demo_slug = 'little-orbit' then 'Учебная группа'
      when new.demo_slug = 'black-ink' then 'Мастер'
      when new.demo_slug = 'vow-films' then 'Команда'
      when new.demo_slug = 'paw-club' then 'Грумер'
      else 'Основной ресурс'
    end,
    'Стартовый ресурс демо. Измените название, вместимость и расписание перед публикацией.',
    case when new.demo_slug in ('north-flow', 'little-orbit', 'bloom-room') then 12 else 1 end,
    v_business.timezone,
    true, true, true, 0,
    jsonb_build_object('starter', true, 'demo_slug', new.demo_slug)
  )
  on conflict (business_id, slug) do nothing;

  select resource.id
  into v_resource_id
  from public.resources resource
  where resource.business_id = v_business.id
    and resource.slug = 'main-resource';

  -- Three deliberately editable starter offers for each business type.
  insert into public.services (
    business_id, slug, kind, title, description, pricing_model, price_minor,
    currency, duration_min_minutes, duration_max_minutes, duration_step_minutes,
    capacity, requires_confirmation, is_public, is_active, sort_order, metadata
  )
  select
    v_business.id,
    starter.slug,
    starter.kind,
    starter.title,
    starter.description,
    starter.pricing_model,
    starter.price_minor,
    v_business.default_currency,
    starter.duration_minutes,
    starter.duration_minutes,
    starter.duration_minutes,
    starter.capacity,
    true,
    true,
    true,
    starter.sort_order,
    jsonb_build_object('starter', true, 'demo_slug', new.demo_slug)
  from (
    select *
    from (values
      ('frame-house', 'studio-rental', 'rental', 'Аренда студии', 'Базовая аренда пространства.', 'per_hour', 5000, 60, 1, 10),
      ('frame-house', 'portrait-session', 'appointment', 'Портретная съёмка', 'Индивидуальная фотосессия.', 'fixed', 15000, 60, 1, 20),
      ('frame-house', 'family-session', 'appointment', 'Семейная съёмка', 'Съёмка для семьи и близких.', 'fixed', 22000, 90, 1, 30),
      ('lumiere', 'signature-care', 'appointment', 'Уход Signature', 'Комплексная процедура салона.', 'fixed', 8000, 60, 1, 10),
      ('lumiere', 'express-care', 'appointment', 'Экспресс-уход', 'Короткая процедура для быстрого результата.', 'fixed', 4500, 30, 1, 20),
      ('lumiere', 'consultation', 'appointment', 'Консультация мастера', 'Знакомство и подбор услуги.', 'free', null, 30, 1, 30),
      ('north-flow', 'intro-class', 'class', 'Пробное занятие', 'Первое знакомство со студией.', 'fixed', 2000, 60, 12, 10),
      ('north-flow', 'group-class', 'class', 'Групповое занятие', 'Регулярная тренировка в небольшой группе.', 'fixed', 3000, 60, 12, 20),
      ('north-flow', 'personal-class', 'appointment', 'Персональная тренировка', 'Индивидуальная работа с тренером.', 'fixed', 6500, 60, 1, 30),
      ('bloom-room', 'seasonal-bouquet', 'other', 'Сезонный букет', 'Авторский букет из сезонных цветов.', 'fixed', 7000, null, 1, 10),
      ('bloom-room', 'flower-workshop', 'class', 'Цветочный мастер-класс', 'Практическое занятие в мастерской.', 'per_person', 4500, 120, 12, 20),
      ('bloom-room', 'event-flowers', 'other', 'Оформление события', 'Индивидуальная концепция и расчёт.', 'quote', null, null, 1, 30),
      ('little-orbit', 'trial-class', 'class', 'Пробное занятие', 'Знакомство с программой и преподавателем.', 'fixed', 1500, 60, 8, 10),
      ('little-orbit', 'creative-group', 'class', 'Творческая группа', 'Развивающее занятие в небольшой группе.', 'fixed', 2500, 60, 8, 20),
      ('little-orbit', 'monthly-program', 'membership', 'Месячная программа', 'Регулярные занятия по выбранному направлению.', 'fixed', 12000, null, 1, 30),
      ('black-ink', 'artist-consultation', 'appointment', 'Консультация мастера', 'Обсуждение идеи, стиля и размещения.', 'free', null, 30, 1, 10),
      ('black-ink', 'small-tattoo', 'appointment', 'Небольшая татуировка', 'Сеанс по согласованному эскизу.', 'fixed', 10000, 120, 1, 20),
      ('black-ink', 'custom-project', 'appointment', 'Индивидуальный проект', 'Авторский эскиз и персональный расчёт.', 'quote', null, 180, 1, 30),
      ('vow-films', 'date-check', 'appointment', 'Проверка даты', 'Короткая консультация по вашему событию.', 'free', null, 30, 1, 10),
      ('vow-films', 'wedding-story', 'event', 'Свадебная история', 'Видеосъёмка главных моментов дня.', 'fixed', 120000, 480, 1, 20),
      ('vow-films', 'full-day-film', 'event', 'Фильм полного дня', 'Расширенный пакет съёмки и монтажа.', 'quote', null, 720, 1, 30),
      ('paw-club', 'small-dog', 'appointment', 'Груминг для маленьких пород', 'Комплексный уход с учётом породы.', 'fixed', 5500, 90, 1, 10),
      ('paw-club', 'large-dog', 'appointment', 'Груминг для крупных пород', 'Полный комплекс для крупного питомца.', 'fixed', 8500, 120, 1, 20),
      ('paw-club', 'first-visit', 'appointment', 'Первое знакомство', 'Консультация и бережный вводный уход.', 'fixed', 3000, 45, 1, 30)
    ) as rows(
      demo_slug, slug, kind, title, description, pricing_model,
      price_minor, duration_minutes, capacity, sort_order
    )
  ) starter
  where starter.demo_slug = new.demo_slug
  on conflict (business_id, slug) do nothing;

  if v_resource_id is not null then
    insert into public.service_resources (
      business_id, service_id, resource_id, allocation_mode, quantity, sort_order
    )
    select v_business.id, service.id, v_resource_id, 'required', 1, service.sort_order
    from public.services service
    where service.business_id = v_business.id
      and service.metadata ->> 'demo_slug' = new.demo_slug
      and service.duration_min_minutes is not null
    on conflict (service_id, resource_id) do nothing;

    insert into public.availability_rules (
      business_id, resource_id, day_of_week, start_time, end_time, is_active
    )
    select v_business.id, v_resource_id, day_number, '09:00'::time, '18:00'::time, true
    from generate_series(1, 5) day_number
    where not exists (
      select 1
      from public.availability_rules rule
      where rule.business_id = v_business.id
        and rule.resource_id = v_resource_id
    );
  end if;

  -- Start from the normalized site schema, then add the chosen demo's voice.
  v_content := public.default_public_site_content(v_business.name, v_business.default_locale)
    || jsonb_build_object(
      'hero_title', coalesce(nullif(new.tagline, ''), v_business.name),
      'hero_text', case new.demo_slug
        when 'frame-house' then 'Аренда пространства, фотосессии и лучшие кадры — в одном месте.'
        when 'lumiere' then 'Уход, красота и время для себя — с удобной онлайн-записью.'
        when 'north-flow' then 'Осознанное движение, сильное тело и занятия в вашем ритме.'
        when 'bloom-room' then 'Авторские букеты, мастер-классы и цветы для важных событий.'
        when 'little-orbit' then 'Программы, в которых детям интересно расти и открывать новое.'
        when 'black-ink' then 'Индивидуальные эскизы, сильные мастера и внимание к каждой детали.'
        when 'vow-films' then 'Живые фильмы о вашем дне, чувствах и людях рядом.'
        when 'paw-club' then 'Бережный груминг и забота, которую видно с первого взгляда.'
        else 'Услуги и удобная запись — в одном месте.'
      end,
      'about_text', case new.demo_slug
        when 'frame-house' then 'Пространство для съёмок, творчества и историй, которые хочется сохранить.'
        when 'lumiere' then 'Современный салон с внимательными мастерами и понятным выбором услуг.'
        when 'north-flow' then 'Студия движения для тех, кто выбирает силу без спешки и напряжения.'
        when 'bloom-room' then 'Цветочная мастерская, где каждый букет создаётся для конкретного чувства.'
        when 'little-orbit' then 'Тёплая среда, небольшие группы и программы с уважением к темпу ребёнка.'
        when 'black-ink' then 'Студия авторской татуировки с честной консультацией и безопасным процессом.'
        when 'vow-films' then 'Команда видеографов, которая бережно сохраняет атмосферу настоящего дня.'
        when 'paw-club' then 'Спокойный уход, бережное знакомство и индивидуальный подход к питомцу.'
        else 'Расскажите посетителям о своём подходе и ценностях.'
      end,
      'demo_slug', new.demo_slug,
      'palette_index', new.palette_index
    );

  insert into public.public_site_locales (business_id, locale, draft_content)
  select
    v_business.id,
    configured_locale.locale,
    v_content || coalesce(existing_locale.draft_content, '{}'::jsonb)
  from unnest(new.locales) as configured_locale(locale)
  left join public.public_site_locales existing_locale
    on existing_locale.business_id = v_business.id
   and existing_locale.locale = configured_locale.locale
  on conflict (business_id, locale) do update
  set draft_content = excluded.draft_content,
      updated_at = now();

  return new;
end;
$$;

revoke all on function public.seed_demo_workspace_content()
  from public, anon, authenticated;

drop trigger if exists seed_demo_workspace_content_after_launch
  on public.business_launch_profiles;
create trigger seed_demo_workspace_content_after_launch
after insert or update of demo_slug, tagline, palette_index, locales
on public.business_launch_profiles
for each row execute function public.seed_demo_workspace_content();

-- Backfill only configured demo workspaces that still have no catalog content.
update public.business_launch_profiles profile
set tagline = profile.tagline,
    updated_at = now()
where profile.demo_slug is not null
  and not exists (
    select 1
    from public.services service
    where service.business_id = profile.business_id
  );
