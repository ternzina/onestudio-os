"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

type Lang = "ru" | "en";

const copy = {
  ru: {
    nav: [
      ["Возможности", "#features"],
      ["Для кого", "#businesses"],
      ["Как запускаем", "#launch"],
    ],
    login: "Войти в систему",
    eyebrow: "САЙТ · БРОНИРОВАНИЕ · CRM · ОПЛАТА",
    titleA: "Весь ваш бизнес —",
    titleB: "в одной системе.",
    lead: "OneStudio OS объединяет красивый сайт, онлайн-запись, клиентов, платежи, контент и аналитику. Создаётся под ваш бизнес, бренд и язык.",
    primary: "Обсудить проект",
    secondary: "Посмотреть возможности",
    heroNote: "Не шаблон. Готовая цифровая основа бизнеса.",
    screenLabel: "ПАНЕЛЬ УПРАВЛЕНИЯ",
    today: "Сегодня",
    revenue: "Выручка",
    bookings: "Брони",
    clients: "Клиенты",
    paid: "Оплачено",
    sectionEyebrow: "ONE SYSTEM",
    featureTitle: "Всё связано. Ничего не теряется.",
    featureLead: "Клиент видит сильный бренд и легко бронирует. Вы управляете всем из одной спокойной панели.",
    features: [
      ["Сайт и контент", "Страницы, услуги, портфолио, видео и тексты меняются без программиста."],
      ["Онлайн-бронирование", "Свободное время, услуги, пакеты, промокоды и автоматический расчёт."],
      ["Клиенты и CRM", "Контакты, история заказов, заметки и статусы всегда под рукой."],
      ["Платежи", "Онлайн-оплата, ручные брони, оплачено / не оплачено и история операций."],
      ["Письма и напоминания", "Подтверждения, восстановление доступа и автоматические напоминания."],
      ["Медиатека и аналитика", "Фото и видео в облаке, публикация в портфолио и понятные показатели."],
    ],
    businessesEyebrow: "НЕ ТОЛЬКО ДЛЯ ФОТОСТУДИЙ",
    businessesTitle: "Одна архитектура. Разные бизнесы.",
    businessesLead: "Система собирается вокруг реального процесса компании — на русском, английском или любом другом языке.",
    demos: [
      ["01", "Lumière", "Салон красоты", "#e9b7a6", "#552c38"],
      ["02", "North Flow", "Студия пилатеса", "#bad6e7", "#203c53"],
      ["03", "Bloom Room", "Цветочная мастерская", "#d6c6a4", "#344333"],
      ["04", "Little Orbit", "Детский центр", "#edc584", "#69493b"],
      ["05", "Black Ink", "Тату-студия", "#b8b4ae", "#242424"],
      ["06", "Vow Films", "Свадебная видеосъёмка", "#c4ccea", "#28344f"],
    ],
    launchEyebrow: "ЗАПУСК ПОД КЛЮЧ",
    launchTitle: "Не архив с кодом, а работающая система.",
    launchLead: "Мы адаптируем архитектуру, подключаем ваши сервисы, переносим контент, проверяем сценарии и запускаем проект на вашем домене.",
    steps: [
      ["01", "Разбираем бизнес", "Услуги, роли, путь клиента, бронирование и то, что действительно нужно."],
      ["02", "Собираем вашу версию", "Дизайн, языки, страницы, правила, письма, оплаты и панель управления."],
      ["03", "Запускаем и сопровождаем", "Настройка домена и сервисов, проверка, обучение и дальнейшая поддержка."],
    ],
    formatsTitle: "Выберите формат запуска",
    formats: [
      ["Индивидуальный запуск", "Полностью настроенная версия на вашем домене с дизайном и процессами вашего бизнеса.", "Рекомендуем"],
      ["Система + самостоятельный запуск", "Подготовленная кодовая база, документация и техническая сессия для вашей команды.", "Для команд"],
      ["Развитие и поддержка", "Новые модули, улучшения, контроль сервисов и помощь после запуска.", "После старта"],
    ],
    ctaEyebrow: "ЕСТЬ ИДЕЯ?",
    ctaTitle: "Давайте превратим её в систему, которая работает.",
    ctaText: "Расскажите, чем занимается ваш бизнес. Мы спокойно разложим процесс и предложим правильную основу — без временных костылей.",
    email: "Написать нам",
    footerText: "Цифровая операционная система для сервисного бизнеса.",
    rights: "Все права защищены.",
  },
  en: {
    nav: [
      ["Features", "#features"],
      ["Industries", "#businesses"],
      ["Launch", "#launch"],
    ],
    login: "System login",
    eyebrow: "WEBSITE · BOOKING · CRM · PAYMENTS",
    titleA: "Your entire business —",
    titleB: "in one system.",
    lead: "OneStudio OS brings together a beautiful website, online booking, clients, payments, content and analytics — built around your brand, workflow and language.",
    primary: "Discuss your project",
    secondary: "Explore the system",
    heroNote: "Not a template. A complete digital foundation.",
    screenLabel: "CONTROL CENTER",
    today: "Today",
    revenue: "Revenue",
    bookings: "Bookings",
    clients: "Clients",
    paid: "Paid",
    sectionEyebrow: "ONE SYSTEM",
    featureTitle: "Everything connected. Nothing lost.",
    featureLead: "Your clients experience a strong brand and effortless booking. You manage everything from one calm control center.",
    features: [
      ["Website & content", "Pages, services, portfolio, video and copy — editable without a developer."],
      ["Online booking", "Availability, services, packages, promo codes and automatic pricing."],
      ["Clients & CRM", "Contacts, order history, notes and statuses always within reach."],
      ["Payments", "Online payments, manual bookings, payment status and transaction history."],
      ["Email & reminders", "Confirmations, access recovery and automatic client reminders."],
      ["Media & analytics", "Cloud photo and video library, portfolio publishing and clear insights."],
    ],
    businessesEyebrow: "BEYOND PHOTO STUDIOS",
    businessesTitle: "One architecture. Many businesses.",
    businessesLead: "The system is shaped around how your company actually works — in English, Russian or any other language.",
    demos: [
      ["01", "Lumière", "Beauty salon", "#e9b7a6", "#552c38"],
      ["02", "North Flow", "Pilates studio", "#bad6e7", "#203c53"],
      ["03", "Bloom Room", "Flower atelier", "#d6c6a4", "#344333"],
      ["04", "Little Orbit", "Children’s center", "#edc584", "#69493b"],
      ["05", "Black Ink", "Tattoo studio", "#b8b4ae", "#242424"],
      ["06", "Vow Films", "Wedding films", "#c4ccea", "#28344f"],
    ],
    launchEyebrow: "DONE-FOR-YOU LAUNCH",
    launchTitle: "Not a code archive. A working system.",
    launchLead: "We adapt the architecture, connect your services, migrate content, test every flow and launch the project on your domain.",
    steps: [
      ["01", "Map the business", "Services, roles, client journey, booking rules and what you truly need."],
      ["02", "Build your edition", "Design, languages, pages, rules, emails, payments and control center."],
      ["03", "Launch and support", "Domain and service setup, testing, training and ongoing support."],
    ],
    formatsTitle: "Choose your launch format",
    formats: [
      ["Custom launch", "A fully configured edition on your domain, shaped around your brand and operations.", "Recommended"],
      ["System + self-deployment", "A prepared codebase, documentation and a technical handover for your team.", "For teams"],
      ["Growth & support", "New modules, improvements, service oversight and hands-on help after launch.", "After launch"],
    ],
    ctaEyebrow: "HAVE AN IDEA?",
    ctaTitle: "Let’s turn it into a system that works.",
    ctaText: "Tell us about your business. We’ll map the process carefully and propose a lasting foundation — without temporary fixes.",
    email: "Write to us",
    footerText: "The digital operating system for service businesses.",
    rights: "All rights reserved.",
  },
} as const;

function Mark() {
  return (
    <span className="os-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function FeatureIcon({ index }: { index: number }) {
  const paths: ReactNode[] = [
    <><rect key="a" x="3" y="4" width="18" height="16" rx="3"/><path key="b" d="M3 9h18M8 4v5"/></>,
    <><rect key="a" x="3" y="5" width="18" height="16" rx="3"/><path key="b" d="M8 3v4m8-4v4M3 10h18m-13 4h3m2 0h3m-8 3h3"/></>,
    <><path key="a" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle key="b" cx="9" cy="7" r="4"/><path key="c" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    <><rect key="a" x="2" y="5" width="20" height="14" rx="3"/><path key="b" d="M2 10h20M7 15h2"/></>,
    <><path key="a" d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path key="b" d="M10 21h4"/></>,
    <><path key="a" d="M4 19V9m5 10V5m5 14v-7m5 7V3"/><path key="b" d="M2 19h20"/></>,
  ];
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[index]}</svg>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ru");
  const [menu, setMenu] = useState(false);
  const t = copy[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <main className="os-site">
      <header className="os-header">
        <Link href="/" className="os-brand" aria-label="OneStudio OS">
          <Mark />
          <span><b>ONE</b>STUDIO <em>OS</em></span>
        </Link>
        <nav className={menu ? "os-nav is-open" : "os-nav"}>
          {t.nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}
          <Link href="/login" className="os-login">{t.login}</Link>
        </nav>
        <div className="os-header-actions">
          <div className="os-lang" aria-label="Language">
            <button className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>RU</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          <button className="os-menu" onClick={() => setMenu(!menu)} aria-label="Menu"><span/><span/></button>
        </div>
      </header>

      <section className="os-hero">
        <div className="os-orb os-orb-a"/><div className="os-orb os-orb-b"/>
        <div className="os-hero-copy">
          <p className="os-eyebrow"><span/>{t.eyebrow}</p>
          <h1>{t.titleA}<br/><strong>{t.titleB}</strong></h1>
          <p className="os-lead">{t.lead}</p>
          <div className="os-buttons">
            <a className="os-button primary" href="mailto:hello@onestudioos.com">{t.primary}<b>↗</b></a>
            <a className="os-button ghost" href="#features">{t.secondary}<b>↓</b></a>
          </div>
          <p className="os-note"><i>✓</i>{t.heroNote}</p>
        </div>

        <div className="os-dashboard-wrap" aria-label={t.screenLabel}>
          <div className="os-dashboard-glow"/>
          <div className="os-dashboard">
            <aside>
              <div className="mini-brand"><Mark/><span>ONE</span></div>
              {[0,1,2,3,4,5].map((n) => <i className={n === 0 ? "active" : ""} key={n}/>) }
            </aside>
            <div className="dash-main">
              <div className="dash-top"><div><small>{t.screenLabel}</small><h3>{t.today}</h3></div><span>Z</span></div>
              <div className="dash-stats">
                <div><small>{t.revenue}</small><b>€ 4,860</b><em>+18.4%</em></div>
                <div><small>{t.bookings}</small><b>24</b><em>+6</em></div>
                <div><small>{t.clients}</small><b>186</b><em>+12</em></div>
              </div>
              <div className="dash-grid">
                <div className="dash-chart"><span/><span/><span/><span/><span/><span/><i/><i/><i/><i/><i/><i/></div>
                <div className="dash-list">
                  {["09:00","11:30","14:00","17:30"].map((time, n) => <div key={time}><i className={`c${n}`}/><span><b>{time}</b><small>{n % 2 ? "Studio session" : "New booking"}</small></span><em>{t.paid}</em></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="os-section os-features" id="features">
        <div className="os-section-head">
          <div><p className="os-kicker">{t.sectionEyebrow}</p><h2>{t.featureTitle}</h2></div>
          <p>{t.featureLead}</p>
        </div>
        <div className="os-feature-grid">
          {t.features.map(([title, desc], index) => (
            <article key={title}><div className="os-icon"><FeatureIcon index={index}/></div><span>0{index + 1}</span><h3>{title}</h3><p>{desc}</p></article>
          ))}
        </div>
      </section>

      <section className="os-businesses" id="businesses">
        <div className="os-section os-section-head light">
          <div><p className="os-kicker">{t.businessesEyebrow}</p><h2>{t.businessesTitle}</h2></div>
          <p>{t.businessesLead}</p>
        </div>
        <div className="os-demo-grid">
          {t.demos.map(([num, name, type, accent, dark]) => (
            <article key={name} style={{"--accent": accent, "--dark": dark} as CSSProperties}>
              <div className="demo-art"><span>{name.slice(0,1)}</span><i/><i/></div>
              <div className="demo-copy"><span>{num}</span><div><h3>{name}</h3><p>{type}</p></div><b>↗</b></div>
            </article>
          ))}
        </div>
      </section>

      <section className="os-launch" id="launch">
        <div className="os-section">
          <div className="os-launch-intro"><p className="os-kicker">{t.launchEyebrow}</p><h2>{t.launchTitle}</h2><p>{t.launchLead}</p></div>
          <div className="os-steps">
            {t.steps.map(([num,title,desc]) => <article key={num}><span>{num}</span><div><h3>{title}</h3><p>{desc}</p></div></article>)}
          </div>
          <h3 className="os-formats-title">{t.formatsTitle}</h3>
          <div className="os-formats">
            {t.formats.map(([title,desc,badge], i) => <article className={i === 0 ? "featured" : ""} key={title}><span>{badge}</span><h3>{title}</h3><p>{desc}</p><a href="mailto:hello@onestudioos.com">{lang === "ru" ? "Узнать больше" : "Learn more"} ↗</a></article>)}
          </div>
        </div>
      </section>

      <section className="os-cta">
        <div className="os-cta-orbit"><i/><i/><i/></div>
        <p className="os-kicker">{t.ctaEyebrow}</p><h2>{t.ctaTitle}</h2><p>{t.ctaText}</p>
        <a className="os-button primary" href="mailto:hello@onestudioos.com">{t.email}<b>↗</b></a>
      </section>

      <footer className="os-footer">
        <div><Link href="/" className="os-brand"><Mark/><span><b>ONE</b>STUDIO <em>OS</em></span></Link><p>{t.footerText}</p></div>
        <div className="flex flex-wrap justify-center gap-3 text-xs"><Link href="/legal/uk/public-offer">Оферта</Link><Link href="/legal/en/privacy">Privacy</Link><Link href="/legal/en/refunds">Refunds</Link><Link href="/legal/en/cookies">Cookies</Link></div>
        <a href="mailto:hello@onestudioos.com">hello@onestudioos.com</a>
        <small>© 2026 OneStudio OS. {t.rights}</small>
      </footer>
    </main>
  );
}
