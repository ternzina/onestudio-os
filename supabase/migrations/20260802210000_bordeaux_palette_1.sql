-- OneStudio OS Bordeaux Palette 1
-- Adds a fourth, shared Bordeaux palette to every configurator demo.

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
  v_palette integer := greatest(0, least(3, coalesce(p_palette_index, 0)));
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
    when 'frame-house' then (array['#d9b78f', '#a8c5c8', '#d7d3cc', '#9d3151'])[v_palette + 1]
    when 'lumiere' then (array['#e8b6a8', '#d7bd88', '#d6a6bb', '#9d3151'])[v_palette + 1]
    when 'north-flow' then (array['#b5d4e5', '#b8cdb7', '#d9c5a6', '#9d3151'])[v_palette + 1]
    when 'bloom-room' then (array['#d7c6a0', '#e5b7bd', '#c6c58d', '#9d3151'])[v_palette + 1]
    when 'little-orbit' then (array['#edc37f', '#8bc7c5', '#d7a8be', '#9d3151'])[v_palette + 1]
    when 'black-ink' then (array['#b9b5ae', '#9eabb2', '#b88e91', '#9d3151'])[v_palette + 1]
    when 'vow-films' then (array['#c6cdea', '#d8cfbf', '#aebca9', '#9d3151'])[v_palette + 1]
    when 'paw-club' then (array['#9fd8cf', '#edbd91', '#c9b8df', '#9d3151'])[v_palette + 1]
    else '#9a742e'
  end;

  v_dark := case v_demo
    when 'frame-house' then (array['#28201c', '#233235', '#171717', '#321722'])[v_palette + 1]
    when 'lumiere' then (array['#552f3a', '#423a2d', '#3e2433', '#321722'])[v_palette + 1]
    when 'north-flow' then (array['#203b50', '#2d4437', '#4a3d31', '#321722'])[v_palette + 1]
    when 'bloom-room' then (array['#344334', '#54353c', '#3d432d', '#321722'])[v_palette + 1]
    when 'little-orbit' then (array['#68493b', '#294e50', '#533247', '#321722'])[v_palette + 1]
    when 'black-ink' then (array['#202020', '#222a2f', '#382628', '#321722'])[v_palette + 1]
    when 'vow-films' then (array['#28344f', '#403a34', '#303d31', '#321722'])[v_palette + 1]
    when 'paw-club' then (array['#23504c', '#59402e', '#413553', '#321722'])[v_palette + 1]
    else '#191b20'
  end;

  v_surface := case v_demo
    when 'frame-house' then (array['#f5efe8', '#edf3f2', '#f4f2ed', '#fff7f5'])[v_palette + 1]
    when 'lumiere' then (array['#fbf1ed', '#f7f2e8', '#f8edf3', '#fff7f5'])[v_palette + 1]
    when 'north-flow' then (array['#eef5f7', '#eff4ee', '#f6f1e9', '#fff7f5'])[v_palette + 1]
    when 'bloom-room' then (array['#f4f1e8', '#fbf0f1', '#f4f4e8', '#fff7f5'])[v_palette + 1]
    when 'little-orbit' then (array['#fff6e6', '#eef8f6', '#fbf0f5', '#fff7f5'])[v_palette + 1]
    when 'black-ink' then (array['#efede9', '#edf0f1', '#f2ecec', '#fff7f5'])[v_palette + 1]
    when 'vow-films' then (array['#f0f2fa', '#f8f5ef', '#f0f3ed', '#fff7f5'])[v_palette + 1]
    when 'paw-club' then (array['#eef9f6', '#fcf4eb', '#f5f0fa', '#fff7f5'])[v_palette + 1]
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
