import type { FAQ3Copy, FAQ3Lang } from "@/components/marketing/public-blocks/faq-3";

const baseFaqContent: Record<"ru" | "en", FAQ3Copy> = {
  ru: {
    heading: "Что можно сделать в OneStudio?",
    categories: [
      { id: "foundation", label: "ОСНОВНОЕ" },
      { id: "setup", label: "НАСТРОЙКА" },
      { id: "site", label: "САЙТ" },
      { id: "system", label: "ФУНКЦИИ" },
    ],
    faqsByCategory: {
      foundation: {
        title: "OneStudio простыми словами",
        faqs: [
          {
            question: "Что такое OneStudio?",
            answer:
              "OneStudio — это место, где можно создать сайт и управлять им. Здесь можно менять текст, фотографии, страницы и дизайн. Сайт можно собрать с нуля или начать с готового шаблона. А если нужны дополнительные возможности, например онлайн-бронирование, работа с клиентами или платежи, их можно добавить.",
          },
          {
            question: "Можно ли изменить тариф позже?",
            answer:
              "Да. Тариф можно изменить по мере изменения потребностей бизнеса.",
          },
          {
            question: "Для каких проектов подходит OneStudio?",
            answer:
              "Для любого проекта, которому нужен сайт. Это может быть студия, магазин, личный проект, команда, творческая работа или что-то совсем другое. Вы выбираете только нужные страницы и функции.",
          },
          {
            question: "Смогу ли я сам собрать сайт в OneStudio?",
            answer:
              "Да. Можно собрать сайт с нуля или начать с готового шаблона. В редакторе вы меняете текст, фотографии, страницы и дизайн. Если позже понадобятся дополнительные функции, их можно добавить.",
          },
          {
            question: "Нужно ли мне уметь программировать?",
            answer:
              "Нет, чтобы обновлять сайт каждый день. Вы сможете менять текст, фотографии, блоки и доступные настройки в редакторе. Для сложной начальной настройки или особого подключения к другому сервису может понадобиться помощь специалиста.",
          },
          {
            question: "Как начать создавать сайт?",
            answer:
              "Выберите готовый вариант, который подходит вашему проекту, замените демо-текст и фотографии своими, настройте внешний вид и нужные функции, проверьте страницы и опубликуйте сайт. Начинать с пустой страницы не обязательно.",
          },
          {
            question: "Можно ли сначала посмотреть примеры?",
            answer:
              "Да. Вы можете посмотреть готовые сайты и понять, как представить свой проект. В библиотеке элементов сайта можно отдельно посмотреть секции, галереи, анимации и другие эффекты.",
          },
          {
            question: "У меня уже есть сайт — нужно ли начинать заново?",
            answer:
              "Нет, не обязательно. Вы можете сохранить нужные материалы и подготовить новую версию отдельно. После проверки подключите к ней свой адрес сайта. Способ переноса содержимого зависит от того, как сделан ваш нынешний сайт.",
          },
        ],
      },
      setup: {
        title: "Настройка сайта",
        faqs: [
          {
            question: "Можно ли начать с готового дизайна?",
            answer:
              "Да. Вы выбираете готовую основу, меняете её под свой проект и быстрее получаете понятную структуру сайта. Это не жёсткий шаблон: доступные элементы можно настроить.",
          },
          {
            question: "Что я смогу изменить в готовом сайте?",
            answer:
              "Вы можете менять текст, фотографии, шрифты, цвета, разделы сайта и их порядок, а также доступные настройки отдельных элементов. Например, можно заменить описание и фотографии, чтобы сайт рассказывал именно о вашем проекте.",
          },
          {
            question: "Можно ли использовать свои фотографии и материалы?",
            answer:
              "Да. Демо-изображения нужны только для примера. Вы сможете заменить их своими фотографиями, текстами и другими материалами о проекте.",
          },
          {
            question: "Можно ли добавлять, удалять и менять местами разделы сайта?",
            answer:
              "Да, если нужная секция доступна в редакторе. Вы сможете добавить нужные разделы, убрать лишние и поменять их порядок, чтобы страница была удобной для ваших клиентов.",
          },
          {
            question: "Можно ли изменить сайт после публикации?",
            answer:
              "Да. Откройте сайт в редакторе, измените текст, фотографии или доступные настройки и опубликуйте его ещё раз. Новые изменения появятся у посетителей после публикации.",
          },
          {
            question: "Как мой сайт будет выглядеть на телефоне и планшете?",
            answer:
              "Сайт подстраивается под размер экрана телефона, планшета и компьютера. Перед публикацией всё равно проверьте основные страницы на разных устройствах, особенно после больших изменений.",
          },
          {
            question: "Смогу ли я полностью изменить дизайн позже?",
            answer:
              "После запуска вы сможете менять отдельные элементы, текст, фотографии и структуру сайта. Полный переход на другой дизайн зависит от текущего сайта и того, что вы хотите сохранить.",
          },
        ],
      },
      site: {
        title: "Сайт в интернете",
        faqs: [
          {
            question: "Могу ли я подключить свой адрес сайта?",
            answer:
              "Да. Собственный домен доступен на платных тарифах OneStudio. Например, можно подключить адрес mybusiness.com. Если он сейчас ведёт на старый сайт, сначала проверьте новую версию, а потом переключите на неё.",
          },
          {
            question: "Будет ли на сайте реклама OneStudio?",
            answer:
              "Нет. На сайтах на платных тарифах нет рекламы OneStudio или подписи «Powered by OneStudio».",
          },
          {
            question: "Что произойдёт, если сайт превысит лимит трафика?",
            answer:
              "OneStudio не отключает сайт сразу при разовом превышении лимита. Мы предупредим вас о повышенном использовании. Если высокий трафик станет постоянным, можно будет перейти на другой тариф или подключить дополнительный объём трафика.",
          },
          {
            question: "Нужно ли делать сайт одной страницей?",
            answer:
              "Нет. Вы можете сделать одну длинную страницу или несколько отдельных — например, для услуг, информации, ответов на вопросы и других разделов.",
          },
          {
            question: "Можно ли подготовить мой сайт к поиску?",
            answer:
              "Да. Для страниц можно задать понятные заголовки, описания, адреса и настройки показа в поиске. Но место сайта в результатах зависит также от содержания, конкуренции и других причин, поэтому конкретную позицию гарантировать нельзя.",
          },
          {
            question: "Можно ли принимать бронирования через сайт?",
            answer:
              "Да. Можно добавить онлайн-запись прямо на сайт. Вы настраиваете услуги, рабочие дни и свободное время, а посетитель выбирает подходящую дату и время и отправляет запись.",
          },
          {
            question: "Смогу ли я принимать оплату на сайте?",
            answer:
              "Да, если подключены платёжные функции. Доступные способы оплаты и сервисы зависят от страны, проекта и выбранных настроек.",
          },
          {
            question: "Что увидят посетители, пока я меняю сайт?",
            answer:
              "Пока изменения не опубликованы, посетители видят текущую версию сайта. Вы можете спокойно подготовить и проверить новую версию, а затем показать её после публикации.",
          },
          {
            question: "Можно ли сделать несколько страниц в одном стиле?",
            answer:
              "Да. Общие шрифты, цвета и повторяющиеся элементы помогают сохранить один стиль на всех страницах, даже если страницы рассказывают о разных вещах.",
          },
        ],
      },
      system: {
        title: "Функции для работы",
        faqs: [
          {
            question: "Что я могу добавить к сайту?",
            answer:
              "К сайту можно добавить бронирование, работу с клиентами, платежи, уведомления, фото и видео, примеры работ и статистику. При бронировании человек выбирает услугу и свободное время, а запись появляется у вас в OneStudio. Но включать всё сразу не нужно: OneStudio можно использовать просто как сайт.",
          },
          {
            question: "Как я смогу работать с клиентами в OneStudio?",
            answer:
              "В OneStudio можно хранить информацию о клиентах, видеть их записи и заявки. Так проще понять, кто к вам обращался и что уже произошло.",
          },
          {
            question: "Как работает расписание?",
            answer:
              "Вы указываете, когда можно принимать записи. Можно настроить рабочие часы, выходные и отпуск. Если работают несколько сотрудников или используются разные кабинеты, для них можно задать своё расписание.",
          },
          {
            question: "Что видит человек при бронировании?",
            answer:
              "Только то время, которое действительно свободно. Он выбирает услугу, дату и подходящее время, а запись появляется в OneStudio.",
          },
          {
            question: "Можно ли создать запись самому?",
            answer:
              "Да. Запись можно создать и из админ-панели, например если человек позвонил или написал вам напрямую.",
          },
          {
            question: "Обязательно ли использовать бронирование?",
            answer:
              "Нет. OneStudio можно использовать просто как сайт. Бронирование подключается только тогда, когда оно нужно вашему проекту.",
          },
          {
            question: "Могу ли я отправлять клиентам уведомления и напоминания?",
            answer:
              "Да, если эта возможность предусмотрена настройками проекта. Вы сможете определить, какие сообщения и напоминания отправлять клиентам, когда их отправлять и через какой канал.",
          },
          {
            question: "Зачем мне фото, видео и портфолио на сайте?",
            answer:
              "Вы сможете хранить и показывать на сайте фотографии, видео и примеры работ. Это полезно, если клиент хочет сначала увидеть результат вашей работы.",
          },
          {
            question: "Нужно ли подключать все функции сразу?",
            answer:
              "Нет. Начните с того, что нужно сейчас, а остальные функции добавьте позже, когда они понадобятся вашему бизнесу.",
          },
          {
            question: "Входят ли Premium Blocks, Premium Effects и Premium Templates в подписку?",
            answer:
              "Базовая библиотека дизайна входит в подписку. Отдельные Premium Blocks, Premium Effects и Premium Templates могут приобретаться отдельно.",
          },
        ],
      },
    },
  },
  en: {
    heading: "What can I do with OneStudio?",
    categories: [
      { id: "foundation", label: "BASICS" },
      { id: "setup", label: "SETUP" },
      { id: "site", label: "WEBSITE" },
      { id: "system", label: "FEATURES" },
    ],
    faqsByCategory: {
      foundation: {
        title: "OneStudio in simple terms",
        faqs: [
          {
            question: "What is OneStudio?",
            answer:
              "OneStudio is a place where you can create and manage a website. You can change the text, photos, pages and design. You can build a site from scratch or start with a ready-made template. If you need extra features, such as online booking, client management or payments, you can add them.",
          },
          {
            question: "Can I change my plan later?",
            answer:
              "Yes. You can change your plan as your business needs change.",
          },
          {
            question: "What kind of projects is OneStudio for?",
            answer:
              "OneStudio is for any project that needs a website. It could be a studio, shop, personal project, team, creative work or something else. You choose only the pages and features you need.",
          },
          {
            question: "Can I build my own website in OneStudio?",
            answer:
              "Yes. You can build a site from scratch or start with a ready-made template. In the editor, you can change the text, photos, pages and design. If you need extra features later, you can add them.",
          },
          {
            question: "Do I need to know how to program?",
            answer:
              "No, not for everyday updates. You can change text, photos, blocks and available settings in the editor. A complex first setup or a special connection to another service may need help from someone with technical experience.",
          },
          {
            question: "How do I start building a website?",
            answer:
              "Choose a ready-made option that fits your project, replace the demo text and photos with your own, set up the look and features you need, check the pages and publish the site. You do not have to start with a blank page.",
          },
          {
            question: "Can I look at examples first?",
            answer:
              "Yes. You can view ready-made sites and see different ways to present a project. The website element library also lets you view sections, galleries, animations and other effects separately.",
          },
          {
            question: "I already have a website — do I have to start over?",
            answer:
              "Not necessarily. Keep the materials you need and prepare a new version separately. Review it first, then connect your website address to it. The way content is moved depends on how your current site was built.",
          },
        ],
      },
      setup: {
        title: "Set up your website",
        faqs: [
          {
            question: "Can I begin with a ready-made design?",
            answer:
              "Yes. You choose a ready-made starting point, change it for your project and get a clear website structure faster. It is not a fixed template: you can adjust the available elements.",
          },
          {
            question: "What can I change in a ready-made website?",
            answer:
              "You can change text, photos, fonts, colors, website sections and their order, along with the available settings for individual elements. For example, you can replace the description and photos so the site tells people about your project.",
          },
          {
            question: "Can I use my own photos and content?",
            answer:
              "Yes. Demo images are examples only. You can replace them with your own photos, text and other materials about your project.",
          },
          {
            question: "Can I add, remove or move website sections?",
            answer:
              "Yes, when the section is available in the editor. You can add the sections you need, remove unnecessary ones and put them in an order that is useful for your clients.",
          },
          {
            question: "Can I change the site after it is published?",
            answer:
              "Yes. Open the site in the editor, change the text, photos or available settings, and publish it again. Visitors will see the updates after you publish them.",
          },
          {
            question: "How will my site look on phones and tablets?",
            answer:
              "The site adapts to the screen size of a phone, tablet or computer. Before publishing, still check the main pages on different devices, especially after major changes.",
          },
          {
            question: "Can I completely change the design later?",
            answer:
              "You can change individual elements, text, photos and the site structure after launch. Moving to a completely different design depends on the current site and what you want to keep.",
          },
        ],
      },
      site: {
        title: "Your website online",
        faqs: [
          {
            question: "Can I connect my own website address?",
            answer:
              "Yes. A custom domain is available on OneStudio's paid plans. You can connect an address such as mybusiness.com. If it currently points to an old website, review the new version first and switch the address afterwards.",
          },
          {
            question: "Will my site have OneStudio ads?",
            answer:
              "No. Sites on paid plans do not have OneStudio ads or a «Powered by OneStudio» label.",
          },
          {
            question: "What happens if my site goes over its traffic limit?",
            answer:
              "OneStudio does not turn off your site right away after a one-time limit overage. We will let you know about the higher usage. If high traffic becomes ongoing, you can move to another plan or add more traffic.",
          },
          {
            question: "Does my site need to be one page?",
            answer:
              "No. You can make one long page or several separate pages — for example, for services, information, FAQs and other sections.",
          },
          {
            question: "Can I prepare my site for search?",
            answer:
              "Yes. You can add clear titles, descriptions, page addresses and settings for how pages appear in search. A specific position cannot be guaranteed because it also depends on your content, competition and other factors.",
          },
          {
            question: "Can I accept bookings through my website?",
            answer:
              "Yes. You can add online booking right to your website. You set up services, working days and free time. A visitor chooses a date and time that works for them and makes a booking.",
          },
          {
            question: "Can I accept payments through the site?",
            answer:
              "Yes, when payment features are connected. Available payment methods and services depend on your country, project and selected settings.",
          },
          {
            question: "What do visitors see while I am changing the site?",
            answer:
              "Until you publish your changes, visitors see the current version of the site. You can prepare and review the new version first, then show it after publishing.",
          },
          {
            question: "Can I make several pages with the same style?",
            answer:
              "Yes. Shared fonts, colors and repeated elements help keep the same style across all pages, even when the pages explain different things.",
          },
        ],
      },
      system: {
        title: "Useful features",
        faqs: [
          {
            question: "What can I add to the website?",
            answer:
              "You can add booking, client tools, payments, notifications, photos and videos, examples of your work and site statistics. When someone books, they choose a service and free time, and the booking appears in OneStudio. You do not need to turn everything on at once: you can use OneStudio simply as a website.",
          },
          {
            question: "How can I work with clients in OneStudio?",
            answer:
              "In OneStudio, you can keep client information and see their bookings and contact requests. This makes it easier to see who contacted you and what happened next.",
          },
          {
            question: "How does the schedule work?",
            answer:
              "You tell OneStudio when you can take bookings. You can set working hours, days off and vacation. If several staff members work or you use different rooms, each can have its own schedule.",
          },
          {
            question: "What does a person see when booking?",
            answer:
              "They see only times that are really free. They choose a service, date and suitable time, and the booking appears in OneStudio.",
          },
          {
            question: "Can I create a booking myself?",
            answer:
              "Yes. You can create a booking from the admin panel, for example when someone calls or messages you directly.",
          },
          {
            question: "Do I have to use booking?",
            answer:
              "No. You can use OneStudio simply as a website. Add booking only when your project needs it.",
          },
          {
            question: "Can OneStudio send clients notifications and reminders?",
            answer:
              "Yes, when your project supports it. You can decide which messages and reminders to send clients, when to send them and through which channel.",
          },
          {
            question: "Why should I add photos, videos and a portfolio?",
            answer:
              "You can keep and show photos, videos and examples of your work on the site. This is useful when people want to see your results before choosing your project.",
          },
          {
            question: "Do I have to add every feature right away?",
            answer:
              "No. Start with what you need now and add other features later when they become useful for your project.",
          },
          {
            question: "Are Premium Blocks, Premium Effects and Premium Templates included in the subscription?",
            answer:
              "The basic design library is included in the subscription. Individual Premium Blocks, Premium Effects and Premium Templates may be purchased separately.",
          },
        ],
      },
    },
  },
};

const additionalFaqContent: Record<Exclude<FAQ3Lang, "ru" | "en">, FAQ3Copy> = {
  uk: {
    heading: "Що можна зробити в OneStudio?",
    categories: [{ id: "foundation", label: "ОСНОВНЕ" }, { id: "setup", label: "НАЛАШТУВАННЯ" }, { id: "site", label: "САЙТ" }, { id: "system", label: "ФУНКЦІЇ" }],
    faqsByCategory: {
      foundation: { title: "OneStudio простими словами", faqs: [{ question: "Що таке OneStudio?", answer: "OneStudio — це місце, де можна створити сайт і керувати ним. Змінюйте тексти, фото, сторінки та дизайн, а за потреби додавайте записи, клієнтів і платежі." }, { question: "Для яких проєктів підходить OneStudio?", answer: "Для будь-якого проєкту, якому потрібен сайт: студії, магазину, особистого проєкту, команди чи творчого бізнесу." }, { question: "Чи потрібно вміти програмувати?", answer: "Ні, для щоденних оновлень програмування не потрібне. Складне початкове налаштування або особлива інтеграція може потребувати технічної допомоги." }, { question: "Чи можна почати з готового шаблону?", answer: "Так. Оберіть готову основу, замініть демо-тексти та зображення своїми й налаштуйте сайт під проєкт." }] },
      setup: { title: "Налаштування сайту", faqs: [{ question: "Що можна змінити в готовому дизайні?", answer: "Тексти, фото, шрифти, кольори, секції та їхній порядок, а також доступні налаштування окремих елементів." }, { question: "Чи можна використовувати власні фотографії?", answer: "Так. Демо-зображення наведені лише для прикладу — їх можна замінити власними матеріалами." }, { question: "Чи можна редагувати сайт після публікації?", answer: "Так. Змініть потрібні елементи в редакторі та опублікуйте сайт знову. Відвідувачі побачать зміни після публікації." }, { question: "Як сайт виглядатиме на телефоні?", answer: "Сайт адаптується до екрана телефона, планшета й комп’ютера. Перед публікацією варто перевірити основні сторінки на різних пристроях." }] },
      site: { title: "Ваш сайт онлайн", faqs: [{ question: "Чи можна підключити власний домен?", answer: "Так. Власний домен доступний на платних тарифах OneStudio. Перед перемиканням адреси перевірте нову версію сайту." }, { question: "Чи буде на сайті реклама OneStudio?", answer: "Ні. На сайтах платних тарифів немає реклами OneStudio або підпису Powered by OneStudio." }, { question: "Чи можна приймати записи через сайт?", answer: "Так. Додайте онлайн-запис, налаштуйте послуги, робочі дні та вільний час — відвідувач обере зручний слот." }, { question: "Чи можна приймати оплату на сайті?", answer: "Так, якщо підключені платіжні функції. Доступні способи залежать від країни, проєкту й налаштувань." }] },
      system: { title: "Функції для роботи", faqs: [{ question: "Що можна додати до сайту?", answer: "Бронювання, роботу з клієнтами, платежі, сповіщення, медіа, портфоліо та статистику. Усе вмикати одразу не потрібно." }, { question: "Як працює розклад?", answer: "Ви задаєте робочі години, вихідні та відпустку. Для різних співробітників, кабінетів або обладнання можна встановити власний розклад." }, { question: "Чи можна створити запис вручну?", answer: "Так. Запис можна додати з адмін-панелі, наприклад якщо клієнт зателефонував або написав напряму." }, { question: "Чи обов’язково використовувати всі функції?", answer: "Ні. Почніть із потрібного зараз, а інші можливості додавайте в міру розвитку проєкту." }] },
    },
  },
  pl: {
    heading: "Co można zrobić w OneStudio?",
    categories: [{ id: "foundation", label: "PODSTAWY" }, { id: "setup", label: "KONFIGURACJA" }, { id: "site", label: "STRONA" }, { id: "system", label: "FUNKCJE" }],
    faqsByCategory: {
      foundation: { title: "OneStudio w prostych słowach", faqs: [{ question: "Czym jest OneStudio?", answer: "OneStudio to miejsce, w którym utworzysz i poprowadzisz stronę. Zmieniaj teksty, zdjęcia, podstrony i design, a w razie potrzeby dodaj rezerwacje, klientów i płatności." }, { question: "Dla jakich projektów jest OneStudio?", answer: "Dla każdego projektu, który potrzebuje strony: studia, sklepu, projektu osobistego, zespołu lub firmy kreatywnej." }, { question: "Czy muszę umieć programować?", answer: "Nie, codzienne aktualizacje nie wymagają programowania. Pomoc techniczna może przydać się przy złożonej konfiguracji lub nietypowej integracji." }, { question: "Czy mogę zacząć od gotowego szablonu?", answer: "Tak. Wybierz gotową podstawę, podmień teksty i obrazy na własne i dopasuj stronę do projektu." }] },
      setup: { title: "Konfiguracja strony", faqs: [{ question: "Co mogę zmienić w gotowym designie?", answer: "Teksty, zdjęcia, fonty, kolory, sekcje i ich kolejność oraz ustawienia dostępne dla poszczególnych elementów." }, { question: "Czy mogę użyć własnych zdjęć?", answer: "Tak. Obrazy demo są tylko przykładami i możesz zastąpić je własnymi materiałami." }, { question: "Czy da się edytować stronę po publikacji?", answer: "Tak. Zmień elementy w edytorze i opublikuj stronę ponownie. Odwiedzający zobaczą je po publikacji." }, { question: "Jak strona wygląda na telefonie?", answer: "Strona dopasowuje się do telefonu, tabletu i komputera. Przed publikacją warto sprawdzić najważniejsze podstrony na różnych urządzeniach." }] },
      site: { title: "Twoja strona online", faqs: [{ question: "Czy mogę podłączyć własną domenę?", answer: "Tak. Własna domena jest dostępna w płatnych planach OneStudio. Przed przełączeniem adresu sprawdź nową wersję strony." }, { question: "Czy na stronie będą reklamy OneStudio?", answer: "Nie. Strony w płatnych planach nie mają reklam OneStudio ani oznaczenia Powered by OneStudio." }, { question: "Czy mogę przyjmować rezerwacje przez stronę?", answer: "Tak. Dodaj rezerwacje online, ustaw usługi, godziny pracy i wolne terminy, a odwiedzający wybierze dogodny slot." }, { question: "Czy mogę przyjmować płatności online?", answer: "Tak, jeśli w projekcie włączono płatności. Dostępne metody zależą od kraju, projektu i ustawień." }] },
      system: { title: "Funkcje do pracy", faqs: [{ question: "Co mogę dodać do strony?", answer: "Rezerwacje, obsługę klientów, płatności, powiadomienia, media, portfolio i statystyki. Nie musisz włączać wszystkiego od razu." }, { question: "Jak działa harmonogram?", answer: "Ustawiasz godziny pracy, dni wolne i urlop. Osobny harmonogram może dotyczyć pracowników, pokoi lub sprzętu." }, { question: "Czy mogę dodać rezerwację ręcznie?", answer: "Tak. Rezerwację dodasz w panelu administracyjnym, na przykład po telefonie lub wiadomości od klienta." }, { question: "Czy muszę korzystać ze wszystkich funkcji?", answer: "Nie. Zacznij od tego, czego potrzebujesz, i dodawaj kolejne możliwości wraz z rozwojem projektu." }] },
    },
  },
  de: {
    heading: "Was kann ich mit OneStudio machen?",
    categories: [{ id: "foundation", label: "GRUNDLAGEN" }, { id: "setup", label: "EINRICHTUNG" }, { id: "site", label: "WEBSITE" }, { id: "system", label: "FUNKTIONEN" }],
    faqsByCategory: {
      foundation: { title: "OneStudio einfach erklärt", faqs: [{ question: "Was ist OneStudio?", answer: "OneStudio ist ein Ort, an dem du eine Website erstellst und verwaltest. Ändere Texte, Fotos, Seiten und Design und ergänze bei Bedarf Buchungen, Kunden und Zahlungen." }, { question: "Für welche Projekte eignet sich OneStudio?", answer: "Für jedes Projekt mit Websitebedarf: Studio, Shop, persönliches Projekt, Team oder kreatives Unternehmen." }, { question: "Muss ich programmieren können?", answer: "Nein, für tägliche Aktualisierungen nicht. Bei einer komplexen Ersteinrichtung oder besonderen Integration kann technische Hilfe sinnvoll sein." }, { question: "Kann ich mit einer Vorlage beginnen?", answer: "Ja. Wähle eine fertige Grundlage, ersetze Demo-Texte und Bilder und passe die Website an dein Projekt an." }] },
      setup: { title: "Website einrichten", faqs: [{ question: "Was kann ich am fertigen Design ändern?", answer: "Texte, Fotos, Schriften, Farben, Abschnitte und ihre Reihenfolge sowie die verfügbaren Einstellungen einzelner Elemente." }, { question: "Kann ich eigene Fotos verwenden?", answer: "Ja. Demo-Bilder dienen nur als Beispiel und können durch deine eigenen Inhalte ersetzt werden." }, { question: "Kann ich die Website nach dem Launch ändern?", answer: "Ja. Ändere die Elemente im Editor und veröffentliche die Website erneut. Die Änderungen erscheinen danach für Besucher." }, { question: "Wie sieht die Website auf dem Smartphone aus?", answer: "Sie passt sich an Smartphone, Tablet und Computer an. Prüfe die wichtigsten Seiten vor der Veröffentlichung auf mehreren Geräten." }] },
      site: { title: "Deine Website online", faqs: [{ question: "Kann ich meine eigene Domain verbinden?", answer: "Ja. Eine eigene Domain ist in kostenpflichtigen OneStudio-Plänen verfügbar. Prüfe die neue Version, bevor du die Adresse umstellst." }, { question: "Gibt es OneStudio-Werbung auf meiner Website?", answer: "Nein. Websites in kostenpflichtigen Plänen zeigen keine OneStudio-Werbung und kein Powered-by-OneStudio-Label." }, { question: "Kann ich Buchungen über die Website annehmen?", answer: "Ja. Füge Online-Buchungen hinzu, richte Leistungen, Arbeitszeiten und freie Termine ein — Besucher wählen den passenden Slot." }, { question: "Kann ich online Zahlungen annehmen?", answer: "Ja, wenn Zahlungsfunktionen verbunden sind. Methoden hängen von Land, Projekt und Einstellungen ab." }] },
      system: { title: "Nützliche Funktionen", faqs: [{ question: "Was kann ich zur Website hinzufügen?", answer: "Buchungen, Kundenverwaltung, Zahlungen, Benachrichtigungen, Medien, Portfolio und Statistiken. Alles muss nicht sofort aktiviert werden." }, { question: "Wie funktioniert der Zeitplan?", answer: "Du legst Arbeitszeiten, freie Tage und Urlaub fest. Mitarbeitende, Räume oder Geräte können eigene Zeitpläne erhalten." }, { question: "Kann ich eine Buchung selbst anlegen?", answer: "Ja. Lege sie im Adminbereich an, zum Beispiel wenn jemand anruft oder direkt schreibt." }, { question: "Muss ich alle Funktionen nutzen?", answer: "Nein. Starte mit dem, was du jetzt brauchst, und ergänze weitere Möglichkeiten, wenn dein Projekt wächst." }] },
    },
  },
  es: {
    heading: "¿Qué puedo hacer con OneStudio?",
    categories: [{ id: "foundation", label: "BÁSICOS" }, { id: "setup", label: "CONFIGURACIÓN" }, { id: "site", label: "SITIO WEB" }, { id: "system", label: "FUNCIONES" }],
    faqsByCategory: {
      foundation: { title: "OneStudio en palabras sencillas", faqs: [{ question: "¿Qué es OneStudio?", answer: "OneStudio es un lugar para crear y gestionar un sitio web. Cambia textos, fotos, páginas y diseño, y añade reservas, clientes o pagos cuando los necesites." }, { question: "¿Para qué proyectos sirve OneStudio?", answer: "Para cualquier proyecto que necesite un sitio: un estudio, una tienda, un proyecto personal, un equipo o un negocio creativo." }, { question: "¿Necesito saber programar?", answer: "No para las actualizaciones diarias. Una configuración inicial compleja o una integración especial puede requerir ayuda técnica." }, { question: "¿Puedo empezar con una plantilla?", answer: "Sí. Elige una base lista, sustituye los textos e imágenes de ejemplo y adáptala a tu proyecto." }] },
      setup: { title: "Configura tu sitio", faqs: [{ question: "¿Qué puedo cambiar en un diseño listo?", answer: "Textos, fotos, fuentes, colores, secciones y su orden, además de los ajustes disponibles para cada elemento." }, { question: "¿Puedo usar mis propias fotos?", answer: "Sí. Las imágenes de demo son solo ejemplos y puedes sustituirlas por tus propios materiales." }, { question: "¿Puedo editar el sitio después de publicarlo?", answer: "Sí. Cambia los elementos en el editor y vuelve a publicar. Los visitantes verán los cambios después de la publicación." }, { question: "¿Cómo se verá el sitio en el móvil?", answer: "Se adapta a teléfonos, tabletas y ordenadores. Comprueba las páginas principales en varios dispositivos antes de publicar." }] },
      site: { title: "Tu sitio online", faqs: [{ question: "¿Puedo conectar mi propio dominio?", answer: "Sí. Tu dominio está disponible en los planes de pago de OneStudio. Revisa la nueva versión antes de cambiar la dirección." }, { question: "¿Mi sitio tendrá anuncios de OneStudio?", answer: "No. Los sitios de pago no muestran anuncios de OneStudio ni la etiqueta Powered by OneStudio." }, { question: "¿Puedo aceptar reservas desde el sitio?", answer: "Sí. Añade reservas online, configura servicios, horarios y horas libres, y el visitante elegirá el momento adecuado." }, { question: "¿Puedo aceptar pagos online?", answer: "Sí, cuando las funciones de pago están conectadas. Los métodos dependen del país, el proyecto y la configuración." }] },
      system: { title: "Funciones útiles", faqs: [{ question: "¿Qué puedo añadir al sitio?", answer: "Reservas, herramientas para clientes, pagos, notificaciones, media, portafolio y estadísticas. No tienes que activarlo todo de una vez." }, { question: "¿Cómo funciona la agenda?", answer: "Indicas tus horas de trabajo, días libres y vacaciones. El personal, las salas o los equipos pueden tener su propio horario." }, { question: "¿Puedo crear una reserva manualmente?", answer: "Sí. Puedes crearla desde el panel, por ejemplo si alguien llama o te escribe directamente." }, { question: "¿Tengo que usar todas las funciones?", answer: "No. Empieza con lo que necesitas y añade más posibilidades cuando el proyecto crezca." }] },
    },
  },
  fr: {
    heading: "Que peut-on faire avec OneStudio ?",
    categories: [{ id: "foundation", label: "ESSENTIEL" }, { id: "setup", label: "CONFIGURATION" }, { id: "site", label: "SITE" }, { id: "system", label: "FONCTIONNALITÉS" }],
    faqsByCategory: {
      foundation: { title: "OneStudio en termes simples", faqs: [{ question: "Qu’est-ce que OneStudio ?", answer: "OneStudio permet de créer et de gérer un site. Modifiez textes, photos, pages et design, puis ajoutez réservations, clients ou paiements si nécessaire." }, { question: "À quels projets OneStudio convient-il ?", answer: "À tout projet qui a besoin d’un site : studio, boutique, projet personnel, équipe ou activité créative." }, { question: "Faut-il savoir programmer ?", answer: "Non pour les mises à jour courantes. Une configuration initiale complexe ou une intégration particulière peut demander une aide technique." }, { question: "Puis-je commencer avec un modèle ?", answer: "Oui. Choisissez une base prête, remplacez les textes et images de démonstration et adaptez-la à votre projet." }] },
      setup: { title: "Configurer votre site", faqs: [{ question: "Que puis-je modifier dans un design prêt à l’emploi ?", answer: "Les textes, photos, polices, couleurs, sections et leur ordre, ainsi que les réglages disponibles pour chaque élément." }, { question: "Puis-je utiliser mes propres photos ?", answer: "Oui. Les images de démonstration sont des exemples et peuvent être remplacées par vos contenus." }, { question: "Puis-je modifier le site après sa publication ?", answer: "Oui. Modifiez les éléments dans l’éditeur puis republiez. Les visiteurs verront les changements après publication." }, { question: "À quoi ressemblera le site sur mobile ?", answer: "Il s’adapte aux téléphones, tablettes et ordinateurs. Vérifiez les pages principales sur plusieurs écrans avant de publier." }] },
      site: { title: "Votre site en ligne", faqs: [{ question: "Puis-je connecter mon propre domaine ?", answer: "Oui. Votre domaine est disponible avec les offres OneStudio payantes. Vérifiez la nouvelle version avant de changer l’adresse." }, { question: "Le site affichera-t-il des publicités OneStudio ?", answer: "Non. Les sites payants n’affichent ni publicité OneStudio ni mention Powered by OneStudio." }, { question: "Puis-je recevoir des réservations depuis le site ?", answer: "Oui. Ajoutez la réservation en ligne, définissez services, horaires et créneaux disponibles, puis le visiteur choisira le bon moment." }, { question: "Puis-je accepter les paiements en ligne ?", answer: "Oui, si les fonctions de paiement sont connectées. Les méthodes dépendent du pays, du projet et des réglages." }] },
      system: { title: "Fonctions utiles", faqs: [{ question: "Que puis-je ajouter au site ?", answer: "Réservations, outils clients, paiements, notifications, médias, portfolio et statistiques. Il n’est pas nécessaire de tout activer d’un coup." }, { question: "Comment fonctionne le planning ?", answer: "Vous indiquez vos horaires, congés et absences. L’équipe, les salles ou les équipements peuvent avoir leur propre planning." }, { question: "Puis-je créer une réservation moi-même ?", answer: "Oui. Créez-la depuis l’administration, par exemple après un appel ou un message direct d’un client." }, { question: "Dois-je utiliser toutes les fonctionnalités ?", answer: "Non. Commencez par l’essentiel et ajoutez d’autres possibilités lorsque le projet en a besoin." }] },
    },
  },
  pt: {
    heading: "O que posso fazer com o OneStudio?",
    categories: [{ id: "foundation", label: "BASE" }, { id: "setup", label: "CONFIGURAÇÃO" }, { id: "site", label: "SITE" }, { id: "system", label: "FUNCIONALIDADES" }],
    faqsByCategory: {
      foundation: { title: "O OneStudio em termos simples", faqs: [{ question: "O que é o OneStudio?", answer: "O OneStudio é um lugar para criar e gerir um site. Altere textos, fotografias, páginas e design e, quando precisar, adicione marcações, clientes e pagamentos." }, { question: "Para que projetos serve o OneStudio?", answer: "Para qualquer projeto que precise de um site: estúdio, loja, projeto pessoal, equipa ou negócio criativo." }, { question: "Preciso de saber programar?", answer: "Não para as atualizações diárias. Uma configuração inicial complexa ou uma integração especial pode precisar de apoio técnico." }, { question: "Posso começar com um modelo pronto?", answer: "Sim. Escolha uma base pronta, substitua textos e imagens de exemplo e adapte-a ao seu projeto." }] },
      setup: { title: "Configure o seu site", faqs: [{ question: "O que posso alterar num design pronto?", answer: "Textos, fotografias, tipos de letra, cores, secções e a sua ordem, além das definições disponíveis para cada elemento." }, { question: "Posso usar as minhas próprias fotografias?", answer: "Sim. As imagens de demonstração são apenas exemplos e podem ser substituídas pelos seus conteúdos." }, { question: "Posso editar o site depois de o publicar?", answer: "Sim. Altere os elementos no editor e publique novamente. Os visitantes verão as alterações depois da publicação." }, { question: "Como ficará o site no telemóvel?", answer: "Adapta-se a telemóveis, tablets e computadores. Verifique as páginas principais em vários dispositivos antes de publicar." }] },
      site: { title: "O seu site online", faqs: [{ question: "Posso ligar o meu próprio domínio?", answer: "Sim. O seu domínio está disponível nos planos pagos OneStudio. Reveja a nova versão antes de mudar o endereço." }, { question: "O site terá anúncios do OneStudio?", answer: "Não. Os sites dos planos pagos não mostram anúncios do OneStudio nem a etiqueta Powered by OneStudio." }, { question: "Posso receber marcações através do site?", answer: "Sim. Adicione marcações online, configure serviços, horários e períodos livres, e o visitante escolherá a melhor hora." }, { question: "Posso aceitar pagamentos online?", answer: "Sim, quando as funcionalidades de pagamento estão ligadas. Os métodos dependem do país, projeto e definições." }] },
      system: { title: "Funcionalidades úteis", faqs: [{ question: "O que posso adicionar ao site?", answer: "Marcações, ferramentas para clientes, pagamentos, notificações, multimédia, portefólio e estatísticas. Não precisa de ativar tudo de uma vez." }, { question: "Como funciona a agenda?", answer: "Indica os seus horários, dias de folga e férias. Pessoas, salas ou equipamentos podem ter horários próprios." }, { question: "Posso criar uma marcação manualmente?", answer: "Sim. Crie-a no painel de administração, por exemplo quando alguém liga ou envia uma mensagem diretamente." }, { question: "Tenho de usar todas as funcionalidades?", answer: "Não. Comece pelo que precisa agora e acrescente outras possibilidades quando o projeto crescer." }] },
    },
  },
};

export const faqContent: Record<FAQ3Lang, FAQ3Copy> = { ...baseFaqContent, ...additionalFaqContent };
