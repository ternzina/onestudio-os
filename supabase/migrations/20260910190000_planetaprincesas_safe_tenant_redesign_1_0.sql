-- PLANETA PRINCESAS — safe tenant redesign 1.0
-- Changes only the tenant resolved by planetaprincesas.com. The VELORA package,
-- demo seed, registry, shared AdSense settings and domain binding are untouched.

begin;

do $migration$
declare
  v_business_id uuid;
  v_target_count integer;
  v_content jsonb := $content${"template_id":"velora-event-venue","template_content":{"velora-event-venue":{"version":1,"visualVariant":"planeta-princesas","headingTypography":{},"brand":"PLANETA PRINCESAS","plum":"#24132F","muted":"#C8BEC8","secondary":"#72496F","border":"#C7A76A","warm":"#F0D4A2","overlay":"#08050E","buttonForeground":"#170D1D","navigation":[{"label":"Celebraciones","href":"#formats"},{"label":"Espacios","href":"#venues"},{"label":"Experiencias","href":"#packages"},{"label":"Galería","href":"#gallery"}],"header":{"venuesPageLabel":"Descubrir espacios","availabilityLabel":"Consultar fecha","menuLabel":"Menú"},"hero":{"eyebrow":"PLANETA PRINCESAS · CELEBRACIONES EXTRAORDINARIAS","title":"El arte de celebrar lo que solo ocurre una vez.","text":"Creamos bodas, quinceañeras y encuentros privados con una mirada editorial: arquitectura, mesa, flores y ritmo unidos en una sola historia.","primaryLabel":"Consultar mi fecha","primaryUrl":"#availability","secondaryLabel":"Explorar los espacios","secondaryUrl":"#venues","image":"/tenants/planetaprincesas/hero-hacienda.webp","alt":"Celebración nocturna en el patio de una hacienda española iluminada con velas","traits":"Bodas · quinceañeras · cenas privadas · celebraciones familiares","scrollLabel":"Descubrir la experiencia"},"facts":[{"value":"01","label":"equipo que acompaña todo el proceso"},{"value":"03","label":"espacios con identidades propias"},{"value":"06","label":"formatos para celebrar a tu manera"},{"value":"100%","label":"propuesta creada alrededor de tu historia"}],"venuesPresentation":{"eyebrow":"ESPACIOS CON ALMA","title":"Tres atmósferas. Una celebración irrepetible.","pageLabel":"Comparar todos los espacios","text":"Elige la luz, la escala y la intimidad que mejor expresan tu historia. La distribución final se diseña para cada celebración."},"venues":[{"name":"Salón Estelar","mood":"Arquitectura para grandes momentos","capacity":"Recepciones de gran formato","area":"Distribución a medida","features":"Arcos de piedra · gran altura · pista de baile integrada","formats":"Bodas · quinceañeras · eventos de marca","seating":"Banquete · cóctel · ceremonia interior","image":"/tenants/planetaprincesas/salon-estelar.webp","alt":"Salón Estelar preparado con mesas marfil y cortinas color ciruela","cta":"Imaginar mi evento aquí"},{"name":"Jardín de Luz","mood":"Naturaleza, cristal y aire","capacity":"Celebraciones luminosas","area":"Interior y jardín conectados","features":"Invernadero · olivos · transición fluida al exterior","formats":"Ceremonias · cumpleaños · encuentros familiares","seating":"Ceremonia · almuerzo · cóctel","image":"/tenants/planetaprincesas/jardin-de-luz.webp","alt":"Jardín de Luz con pasillo de ceremonia, olivos y flores blancas","cta":"Imaginar mi evento aquí"},{"name":"Atelier Real","mood":"Cercanía con carácter","capacity":"Encuentros íntimos","area":"Mesa y salón privados","features":"Chimenea · arte contemporáneo · acceso reservado","formats":"Cenas privadas · cumpleaños · reuniones familiares","seating":"Mesa larga · sobremesa · brindis","image":"/tenants/planetaprincesas/atelier-real.webp","alt":"Atelier Real con mesa larga, terciopelo ciruela y luz de velas","cta":"Imaginar mi evento aquí"}],"formatsPresentation":{"eyebrow":"TU MANERA DE CELEBRAR","title":"Cada ocasión merece su propio lenguaje."},"formats":[{"number":"01","title":"Bodas","text":"Ceremonia, cena y baile narrados como un solo día."},{"number":"02","title":"Quinceañeras","text":"Una entrada inolvidable con elegancia contemporánea y familiar."},{"number":"03","title":"Cumpleaños","text":"Un encuentro expresivo, íntimo o expansivo, siempre personal."},{"number":"04","title":"Cenas privadas","text":"Una mesa excepcional, gastronomía cuidada y total intimidad."},{"number":"05","title":"Celebraciones familiares","text":"Generaciones reunidas en una atmósfera cálida y natural."},{"number":"06","title":"Eventos de marca","text":"Hospitalidad y dirección creativa al servicio de una idea."}],"transformation":{"eyebrow":"ANTES Y DESPUÉS","title":"La arquitectura espera. Tu historia la transforma.","text":"Desliza para ver cómo la luz, las flores, los textiles y la mesa convierten un espacio sereno en una escena completamente tuya.","beforeLabel":"Antes","afterLabel":"Después","beforeImage":"/tenants/planetaprincesas/transformacion-antes.webp","beforeAlt":"Salón vacío de piedra clara antes del montaje de una celebración","afterImage":"/tenants/planetaprincesas/transformacion-despues.webp","afterAlt":"El mismo salón transformado con mesas, flores color ciruela y velas"},"storyPresentation":{"eyebrow":"DE LA PRIMERA IDEA AL ÚLTIMO BAILE","title":"Una transformación guiada por el detalle.","text":"Construimos la emoción por capas para que cada decisión tenga sentido y el día se sienta natural."},"story":[{"number":"01","title":"La arquitectura","text":"Leemos la luz, el espacio y el recorrido de los invitados."},{"number":"02","title":"La atmósfera","text":"Definimos una paleta y una dirección visual con identidad."},{"number":"03","title":"La mesa","text":"La gastronomía y la puesta en escena encuentran su ritmo."},{"number":"04","title":"Las flores","text":"Formas orgánicas conectan los gestos con la arquitectura."},{"number":"05","title":"El encuentro","text":"La familia y los amigos convierten el diseño en memoria."},{"number":"06","title":"La noche","text":"Música, luz y movimiento cierran la historia sin prisas."}],"packagesPresentation":{"eyebrow":"EXPERIENCIAS A TU MEDIDA","title":"Elige cuánto quieres imaginar y cuánto prefieres delegar.","pageLabel":"Conocer las experiencias","text":"Cada nivel es un punto de partida flexible. El alcance final se define después de conocer tu fecha, tus invitados y tus prioridades."},"packages":[{"name":"Esencia","result":"Una base impecable para hacerla tuya","price":"Propuesta personalizada","for":"para encuentros íntimos","includes":"Espacio · mobiliario · iluminación ambiental · acompañamiento","decor":"detalles seleccionados","menu":"menú estacional","image":"/tenants/planetaprincesas/atelier-real.webp","alt":"Cena íntima de la experiencia Esencia en Atelier Real","cta":"Consultar Esencia"},{"name":"Firma","result":"Una dirección creativa que une toda la celebración","price":"Propuesta personalizada","for":"para bodas y quinceañeras","includes":"Espacio · mesa · flores · luz · gastronomía · coordinación","decor":"concepto visual propio","menu":"degustación y selección","image":"/tenants/planetaprincesas/salon-estelar.webp","alt":"Recepción elegante de la experiencia Firma en Salón Estelar","cta":"Consultar Firma"},{"name":"Inmersión","result":"Una celebración concebida como una obra completa","price":"Propuesta personalizada","for":"para una producción integral","includes":"Dirección artística · producción · gastronomía · equipo completo","decor":"instalación creada desde cero","menu":"experiencia gastronómica propia","image":"/tenants/planetaprincesas/quinceanera.webp","alt":"Quinceañera nocturna de la experiencia Inmersión en una hacienda","cta":"Consultar Inmersión"}],"includedPresentation":{"eyebrow":"TODO CONECTADO","title":"Una sola visión detrás de cada detalle.","text":"Coordinamos las piezas esenciales para que tú puedas estar presente con las personas que importan."},"included":[{"number":"01","title":"Dirección creativa"},{"number":"02","title":"Plan del espacio"},{"number":"03","title":"Mobiliario"},{"number":"04","title":"Iluminación"},{"number":"05","title":"Sonido"},{"number":"06","title":"Mesa y cristalería"},{"number":"07","title":"Diseño floral"},{"number":"08","title":"Coordinación"},{"number":"09","title":"Montaje"},{"number":"10","title":"Cierre del evento"}],"cateringPresentation":{"eyebrow":"MESA Y GASTRONOMÍA","title":"Sabores pensados para acompañar la emoción.","text":"Una propuesta estacional, bebidas bien elegidas y un servicio atento que entiende cuándo aparecer y cuándo dejar que la conversación continúe.","image":"/tenants/planetaprincesas/gastronomia.webp","alt":"Plato de gastronomía estacional servido en una mesa de celebración","cta":"Diseñar nuestra mesa"},"catering":[{"title":"Menú estacional","text":"Platos creados según la ocasión, la temporada y tus preferencias.","meta":"con opciones adaptables"},{"title":"Bebidas y brindis","text":"Vinos, cócteles y alternativas sin alcohol con un hilo común.","meta":"selección personalizada"},{"title":"El ritmo del servicio","text":"Cada pase acompaña el programa sin interrumpir los momentos importantes.","meta":"coordinado con el evento"}],"decor":{"eyebrow":"DISEÑO FLORAL Y DECORACIÓN","title":"No llenamos un espacio. Le damos intención.","text":"Flores, textiles, luz, papelería y mesa nacen de una dirección visual común: contemporánea, elegante y profundamente personal.","image":"/tenants/planetaprincesas/diseno-floral.webp","alt":"Instalación floral marfil y ciruela integrada en una galería de piedra"},"coordinator":{"eyebrow":"TU COORDINADORA","title":"Una presencia serena en cada decisión.","text":"Tu coordinadora principal reúne el calendario, los proveedores y el guion del día. Tendrás un único punto de contacto desde la primera conversación hasta el cierre.","promise":"Tú vives el momento. Nosotras sostenemos todo lo demás.","image":"/tenants/planetaprincesas/coordinadora.webp","alt":"Coordinadora de eventos supervisando la iluminación antes de recibir a los invitados"},"reviewsPresentation":{"eyebrow":"HISTORIAS POR IMAGINAR","title":"Tres escenas. Infinitas maneras de hacerlas tuyas.","disclaimer":"Escenarios editoriales de inspiración; cada propuesta se crea de forma individual para tu celebración."},"reviews":[{"quote":"Una entrada al atardecer, toda la familia cerca y una noche que cambia de ritmo sin perder su elegancia.","author":"Quinceañera al caer la tarde","meta":"Jardín · cena · baile","task":"La intención","image":"/tenants/planetaprincesas/quinceanera.webp","alt":"Joven celebrando su quinceañera junto a su familia en un patio iluminado"},{"quote":"Una cena que empieza entre velas y termina con varias generaciones compartiendo la pista de baile.","author":"Celebración familiar nocturna","meta":"Mesa larga · música en vivo","task":"La intención","image":"/tenants/planetaprincesas/baile-nocturno.webp","alt":"Invitados de varias generaciones bailando durante una celebración nocturna"},{"quote":"Pocas personas, una mesa excepcional y tiempo de verdad para conversar, brindar y quedarse un poco más.","author":"Cena privada bajo los olivos","meta":"Atelier · gastronomía · sobremesa","task":"La intención","image":"/tenants/planetaprincesas/brindis-familiar.webp","alt":"Familia brindando alrededor de una mesa bajo los olivos al anochecer"}],"galleryPresentation":{"eyebrow":"CUANDO TODO COBRA VIDA","title":"Una colección de luz, gestos y celebraciones.","dialogLabel":"Galería de celebraciones de Planeta Princesas","closeLabel":"Cerrar galería","openLabel":"Abrir fotografía","previousLabel":"Fotografía anterior","nextLabel":"Fotografía siguiente"},"gallery":[{"image":"/tenants/planetaprincesas/salon-estelar.webp","alt":"Salón Estelar listo para una recepción a la luz de las velas"},{"image":"/tenants/planetaprincesas/quinceanera.webp","alt":"Entrada familiar durante una quinceañera en el patio"},{"image":"/tenants/planetaprincesas/gastronomia.webp","alt":"Detalle de gastronomía y cristalería en una mesa elegante"},{"image":"/tenants/planetaprincesas/jardin-de-luz.webp","alt":"Ceremonia luminosa entre olivos en Jardín de Luz"},{"image":"/tenants/planetaprincesas/baile-nocturno.webp","alt":"Invitados bailando bajo los arcos durante la noche"},{"image":"/tenants/planetaprincesas/brindis-familiar.webp","alt":"Brindis familiar alrededor de una mesa en el patio"}],"plannerPresentation":{"eyebrow":"ASÍ LO HACEMOS","title":"De tu fecha a una celebración completamente resuelta.","text":"Empezamos escuchando. Después convertimos prioridades, invitados y presupuesto en un plan claro y una experiencia coherente."},"planner":[{"number":"01","title":"Consultamos la fecha","text":"Recibimos los datos esenciales de tu celebración."},{"number":"02","title":"Escuchamos tu historia","text":"Hablamos del ambiente, los invitados y lo que quieres sentir."},{"number":"03","title":"Creamos la propuesta","text":"Unimos espacio, mesa, diseño y alcance en un documento claro."},{"number":"04","title":"Diseñamos el recorrido","text":"Coordinamos decisiones, tiempos y colaboradores en un solo plan."},{"number":"05","title":"Tú celebras","text":"El equipo guía el día para que puedas estar plenamente presente."}],"faqPresentation":{"eyebrow":"PREGUNTAS IMPORTANTES","title":"Claridad antes de empezar."},"faq":[{"question":"¿Qué incluye una propuesta?","answer":"Detallamos por separado el espacio, la producción, la gastronomía, el diseño y la coordinación incluidos en el alcance recomendado."},{"question":"¿Podemos personalizar una experiencia?","answer":"Sí. Esencia, Firma e Inmersión son puntos de partida; la propuesta final se adapta a tu formato y prioridades."},{"question":"¿Organizan bodas y quinceañeras?","answer":"Sí. Diseñamos bodas, quinceañeras, cumpleaños, cenas privadas, celebraciones familiares y eventos de marca."},{"question":"¿Hay un plan alternativo si llueve?","answer":"La alternativa se define al elegir el espacio y queda incorporada al plan de producción antes del evento."},{"question":"¿Podemos trabajar con nuestros proveedores?","answer":"Podemos integrarlos después de revisar juntos los accesos, los tiempos de montaje y los requisitos técnicos."},{"question":"¿Con cuánta antelación conviene consultar?","answer":"Depende de la fecha y el alcance. Cuanto antes conversemos, más opciones podremos valorar contigo."},{"question":"¿Cómo se confirma la fecha?","answer":"La consulta inicial no bloquea el calendario. La fecha se confirma únicamente con la propuesta aceptada y las condiciones acordadas."},{"question":"¿Se puede adaptar el menú?","answer":"Sí. Recogemos preferencias y necesidades alimentarias para construir una propuesta gastronómica adecuada."},{"question":"¿Cómo se define la capacidad?","answer":"La confirmamos según el espacio, el tipo de montaje y el recorrido que quieras crear para tus invitados."},{"question":"¿Podemos visitar los espacios?","answer":"Después de recibir tu consulta, coordinaremos contigo el siguiente paso y las opciones de visita disponibles."}],"availability":{"eyebrow":"EL PRIMER PASO","title":"Cuéntanos cuándo quieres celebrar.","text":"La consulta no bloquea la fecha ni implica compromiso. Revisaremos la información y te responderemos con el siguiente paso.","dateLabel":"Fecha preferida","formatLabel":"Tipo de celebración","formatPlaceholder":"Elige un formato","guestsLabel":"Número aproximado de invitados","guestsPlaceholder":"p. ej., 80","venueLabel":"Espacio preferido","venuePlaceholder":"Elige un espacio","packageLabel":"Nivel de acompañamiento","packagePlaceholder":"Elige una experiencia","nameLabel":"Nombre y apellidos","emailLabel":"Correo electrónico","phoneLabel":"Teléfono","submit":"Consultar disponibilidad","pending":"Enviando…","idle":"Te responderemos con el siguiente paso. Esta consulta no bloquea la fecha.","success":"Gracias. Hemos recibido tu consulta y te responderemos con las opciones disponibles.","error":"No pudimos enviar la consulta. Revisa los datos e inténtalo de nuevo.","ariaLabel":"Formulario para consultar la disponibilidad de una fecha","subject":"Consulta de fecha — Planeta Princesas"},"contact":{"eyebrow":"HABLEMOS","title":"Todo empieza con una conversación.","text":"Comparte tu fecha y la idea que tienes en mente. Te responderemos a través de los datos enviados en el formulario.","address":"","phone":"","email":"planetaprincesas@gmail.com","hours":"","map":"","mapAria":"","cta":"Consultar fecha"},"footer":{"note":"CELEBRACIONES EXTRAORDINARIAS","tagline":"Diseñamos momentos que reúnen a las personas y permanecen mucho después del último brindis.","cta":"Empezar con tu fecha","navigationLabel":"Explorar","contactLabel":"Consulta","languageLabel":"Idioma","topLabel":"Volver arriba","copyright":"© 2026 PLANETA PRINCESAS"},"customPages":{"homeLabel":"Inicio","venuesLabel":"Espacios","packagesLabel":"Experiencias","areaLabel":"Configuración","formatLabel":"Ideal para","requestLabel":"Consultar esta opción","venuesEyebrow":"TRES ATMÓSFERAS","venuesTitle":"Elige la arquitectura de tu celebración.","venuesIntro":"Compara el carácter, la escala y las posibilidades de cada espacio antes de imaginar la puesta en escena.","packagesEyebrow":"TRES NIVELES DE ACOMPAÑAMIENTO","packagesTitle":"Una base elegante o una dirección creativa integral.","packagesIntro":"Elige cuánto quieres delegar; adaptaremos el alcance a la fecha, el formato y las prioridades de tu celebración."}}},"brand_name":"PLANETA PRINCESAS","site_summary":"Celebraciones extraordinarias con dirección creativa, gastronomía y diseño editorial.","theme_dark":"#100A1C","theme_accent":"#C7A76A","theme_surface":"#FBF7EF","hero_eyebrow":"PLANETA PRINCESAS · CELEBRACIONES EXTRAORDINARIAS","hero_title":"El arte de celebrar lo que solo ocurre una vez.","hero_text":"Creamos bodas, quinceañeras y encuentros privados con una mirada editorial: arquitectura, mesa, flores y ritmo unidos en una sola historia.","hero_image_url":"/tenants/planetaprincesas/hero-hacienda.webp","about_title":"Celebraciones con dirección creativa","about_text":"Arquitectura, gastronomía y diseño unidos por una sola visión.","services_title":"Espacios","portfolio_title":"Galería","contact_title":"Hablemos de tu celebración","booking_label":"Consultar fecha","services_label":"Espacios","portfolio_label":"Galería","about_label":"La experiencia","contact_label":"Consulta","show_services":true,"show_portfolio":true,"show_about":true,"show_contact":true,"show_social_icons":false,"social_links":[],"announcement_text":"","contact_address":"","contact_email":"planetaprincesas@gmail.com","contact_phone":"","contact_hours":"","contact_note":"","map_query":"","footer_note":"","seo_title":"PLANETA PRINCESAS | Celebraciones extraordinarias","seo_description":"Bodas, quinceañeras, cumpleaños, cenas privadas y celebraciones familiares con dirección creativa, gastronomía y diseño editorial.","seo_image_url":"/tenants/planetaprincesas/hero-hacienda.webp","seo_keywords":"celebraciones premium, bodas, quinceañeras, cumpleaños, cenas privadas, eventos familiares","layout_order":["native:velora-event-venue:hero","native:velora-event-venue:facts","native:velora-event-venue:formats","native:velora-event-venue:venues","native:velora-event-venue:decor","native:velora-event-venue:transformation","native:velora-event-venue:story","native:velora-event-venue:catering","native:velora-event-venue:packages","native:velora-event-venue:included","native:velora-event-venue:coordinator","native:velora-event-venue:gallery","native:velora-event-venue:reviews","native:velora-event-venue:planner","native:velora-event-venue:faq","native:velora-event-venue:availability","native:velora-event-venue:footer"],"custom_blocks":[],"pages":[{"id":"planeta-espacios","type":"custom","slug":"espacios","nav_label":"Espacios","eyebrow":"TRES ATMÓSFERAS","title":"Elige la arquitectura de tu celebración","intro":"Compara el carácter, la escala y las posibilidades de cada espacio.","is_visible":true,"show_in_navigation":true,"show_booking_cta":true,"seo_title":"Espacios | PLANETA PRINCESAS","seo_description":"Conoce Salón Estelar, Jardín de Luz y Atelier Real para bodas, quinceañeras y celebraciones privadas.","seo_image_url":"/tenants/planetaprincesas/salon-estelar.webp","blocks":[]},{"id":"planeta-experiencias","type":"custom","slug":"experiencias","nav_label":"Experiencias","eyebrow":"ACOMPAÑAMIENTO A TU MEDIDA","title":"Elige cómo quieres vivir el proceso","intro":"Tres puntos de partida flexibles para crear una celebración completamente personal.","is_visible":true,"show_in_navigation":true,"show_booking_cta":true,"seo_title":"Experiencias | PLANETA PRINCESAS","seo_description":"Esencia, Firma e Inmersión: tres niveles de dirección creativa y coordinación para tu celebración.","seo_image_url":"/tenants/planetaprincesas/quinceanera.webp","blocks":[]}]}$content$::jsonb;
  v_template_key constant text := 'velora-event-venue';
  v_namespace jsonb;
  v_domain_before jsonb;
  v_monetization_before jsonb;
  v_domain_after jsonb;
  v_monetization_after jsonb;
begin
  select
    count(distinct domain_row.business_id),
    (array_agg(distinct domain_row.business_id))[1]
  into v_target_count, v_business_id
  from public.public_site_domains as domain_row
  where domain_row.domain = 'planetaprincesas.com'
     or domain_row.redirect_domain = 'planetaprincesas.com';

  if v_target_count <> 1 or v_business_id is null then
    raise exception 'planetaprincesas_tenant_resolution_failed';
  end if;

  if not exists (
    select 1
    from public.public_site_locales as locale_row
    where locale_row.business_id = v_business_id
      and coalesce(
        locale_row.published_content ->> 'template_id',
        locale_row.draft_content ->> 'template_id'
      ) = v_template_key
  ) then
    raise exception 'planetaprincesas_template_guard_failed';
  end if;

  v_namespace := v_content -> 'template_content' -> v_template_key;

  if v_namespace is null
     or v_namespace ->> 'brand' <> 'PLANETA PRINCESAS'
     or v_namespace ->> 'visualVariant' <> 'planeta-princesas' then
    raise exception 'planetaprincesas_content_guard_failed';
  end if;

  select to_jsonb(domain_row)
  into v_domain_before
  from public.public_site_domains as domain_row
  where domain_row.business_id = v_business_id;

  select to_jsonb(settings)
  into v_monetization_before
  from public.site_monetization_settings as settings
  where settings.business_id = v_business_id;

  -- Keep editor-owned keys outside this template, but replace this tenant's
  -- complete native content, composition, pages, accessibility copy and SEO.
  update public.public_site_locales as locale_row
  set draft_content =
        (locale_row.draft_content - 'template_content')
        || (v_content - 'template_content')
        || jsonb_build_object(
          'template_content',
          coalesce(locale_row.draft_content -> 'template_content', '{}'::jsonb)
          || jsonb_build_object(v_template_key, v_namespace)
        ),
      published_content = null,
      published_at = null,
      updated_at = now()
  where locale_row.business_id = v_business_id;

  insert into public.public_site_locales (
    business_id,
    locale,
    draft_content,
    published_content,
    published_at
  )
  values (
    v_business_id,
    'es',
    v_content,
    v_content,
    now()
  )
  on conflict (business_id, locale) do update
  set draft_content =
        (public.public_site_locales.draft_content - 'template_content')
        || (v_content - 'template_content')
        || jsonb_build_object(
          'template_content',
          coalesce(public.public_site_locales.draft_content -> 'template_content', '{}'::jsonb)
          || jsonb_build_object(v_template_key, v_namespace)
        ),
      published_content =
        (coalesce(public.public_site_locales.published_content, public.public_site_locales.draft_content) - 'template_content')
        || (v_content - 'template_content')
        || jsonb_build_object(
          'template_content',
          coalesce(
            coalesce(public.public_site_locales.published_content, public.public_site_locales.draft_content) -> 'template_content',
            '{}'::jsonb
          )
          || jsonb_build_object(v_template_key, v_namespace)
        ),
      published_at = now(),
      updated_at = now();

  update public.public_site_settings
  set primary_locale = 'es',
      is_published = true,
      published_at = now(),
      updated_at = now()
  where business_id = v_business_id;

  update public.businesses
  set name = 'PLANETA PRINCESAS',
      default_locale = 'es',
      updated_at = now()
  where id = v_business_id;

  update public.company_profiles
  set display_name = 'PLANETA PRINCESAS',
      updated_at = now()
  where business_id = v_business_id;

  update public.business_launch_profiles
  set locales = array(
        select distinct locale_value
        from unnest(coalesce(locales, '{}'::text[]) || array['es']::text[]) as locale_value
        order by locale_value
      ),
      updated_at = now()
  where business_id = v_business_id;

  if exists (
    select 1
    from public.public_site_locales as locale_row
    where locale_row.business_id = v_business_id
      and (
        (
          (
            (locale_row.draft_content - 'template_id')
            #- array['template_content', v_template_key]
          )::text
          || coalesce(locale_row.draft_content -> 'template_content' -> v_template_key, '{}'::jsonb)::text
        ) ~* '(VELORA HOUSE|EVENT HOUSE|Киев|Kyiv|Grand Hall|Garden Room|events@velora[.]house|[+]380 44 555 24 24)'
        or (
          coalesce(
            (locale_row.published_content - 'template_id')
            #- array['template_content', v_template_key],
            '{}'::jsonb
          )::text
          || coalesce(locale_row.published_content -> 'template_content' -> v_template_key, '{}'::jsonb)::text
        ) ~* '(VELORA HOUSE|EVENT HOUSE|Киев|Kyiv|Grand Hall|Garden Room|events@velora[.]house|[+]380 44 555 24 24)'
      )
  ) then
    raise exception 'planetaprincesas_legacy_content_remains';
  end if;

  if (
    select count(*)
    from public.public_site_locales as locale_row
    where locale_row.business_id = v_business_id
      and locale_row.published_content is not null
  ) <> 1
  or not exists (
    select 1
    from public.public_site_locales as locale_row
    where locale_row.business_id = v_business_id
      and locale_row.locale = 'es'
      and locale_row.published_content is not null
  ) then
    raise exception 'planetaprincesas_public_locale_guard_failed';
  end if;

  select to_jsonb(domain_row)
  into v_domain_after
  from public.public_site_domains as domain_row
  where domain_row.business_id = v_business_id;

  select to_jsonb(settings)
  into v_monetization_after
  from public.site_monetization_settings as settings
  where settings.business_id = v_business_id;

  if v_domain_after is distinct from v_domain_before then
    raise exception 'planetaprincesas_domain_binding_changed';
  end if;

  if v_monetization_after is distinct from v_monetization_before then
    raise exception 'planetaprincesas_monetization_changed';
  end if;
end
$migration$;

commit;
