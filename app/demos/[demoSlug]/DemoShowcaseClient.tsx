"use client";

import Link from "next/link";
import { useState } from "react";
import DemoVisual from "@/components/marketing/DemoVisual";
import MarketingBrand from "@/components/marketing/MarketingBrand";
import type { DemoDefinition } from "@/lib/demo-catalog";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import styles from "./DemoShowcase.module.css";

type View = "site" | "admin" | "phone";

type SiteContent = {
  label: string;
  title: string;
  items: { title: string; text: string; meta: string }[];
  featureTitle: string;
  featureText: string;
  points: string[];
  finalTitle: string;
  finalText: string;
};

const SITE_CONTENT: Record<string, SiteContent> = {
  "frame-house": {
    label: "Пространства и съёмки",
    title: "Выберите свой формат",
    items: [
      { title: "Зал Daylight", text: "Мягкий дневной свет, циклорама и мобильные декорации.", meta: "от €45 / час" },
      { title: "Зал Loft", text: "Тёплый интерьер для портретов, брендов и семейных историй.", meta: "от €55 / час" },
      { title: "Фотосессия", text: "Фотограф, подготовка и готовая приватная галерея.", meta: "от €190" },
    ],
    featureTitle: "Свободное время видно сразу",
    featureText: "Клиент выбирает зал, длительность и дополнительные услуги без звонков и переписки.",
    points: ["Календарь в реальном времени", "Онлайн-оплата и депозит", "Письма и напоминания"],
    finalTitle: "Ваша история начинается здесь",
    finalText: "Выберите удобное время — всё остальное мы подготовим.",
  },
  lumiere: {
    label: "Уход и красота",
    title: "Ритуалы для вашего времени",
    items: [
      { title: "Glow Facial", text: "Деликатное очищение, массаж и сияющий уход.", meta: "75 мин · €85" },
      { title: "Hair Ritual", text: "Консультация, уход, стрижка и лёгкая укладка.", meta: "90 мин · €110" },
      { title: "Signature Nails", text: "Маникюр, укрепление и покрытие в выбранном оттенке.", meta: "80 мин · €65" },
    ],
    featureTitle: "Ваш мастер уже ждёт",
    featureText: "Посмотрите портфолио специалистов и выберите удобное окно прямо в расписании.",
    points: ["Запись к конкретному мастеру", "Сертификаты и абонементы", "История любимых процедур"],
    finalTitle: "Найдите время для себя",
    finalText: "Запишитесь за минуту и получите подтверждение сразу.",
  },
  "north-flow": {
    label: "Практики",
    title: "Движение, которое подходит вам",
    items: [
      { title: "Reformer Start", text: "Мягкое знакомство с реформером в небольшой группе.", meta: "50 мин · €24" },
      { title: "Core & Balance", text: "Сила центра, устойчивость и точная техника движения.", meta: "55 мин · €28" },
      { title: "Private Flow", text: "Индивидуальная программа с вниманием к вашим целям.", meta: "60 мин · €58" },
    ],
    featureTitle: "Расписание без перегрузки",
    featureText: "Выбирайте тренера, уровень и формат — свободные места обновляются автоматически.",
    points: ["Группы до 8 человек", "Абонементы и разовые визиты", "Лист ожидания"],
    finalTitle: "Начните с первого занятия",
    finalText: "Мы поможем подобрать спокойный и уверенный старт.",
  },
  "bloom-room": {
    label: "Коллекции",
    title: "Цветы для каждого чувства",
    items: [
      { title: "Morning Peony", text: "Воздушный сезонный букет в нежной природной гамме.", meta: "от €48" },
      { title: "Wild Garden", text: "Свободная композиция из фактурных трав и цветов.", meta: "от €65" },
      { title: "Floral Workshop", text: "Камерный мастер-класс с цветами, чаем и фотографиями.", meta: "€55 / гость" },
    ],
    featureTitle: "Собрано сегодня, доставлено вовремя",
    featureText: "Выберите настроение, размер и дату — мастерская соберёт уникальную композицию.",
    points: ["Доставка по городу", "Фото букета перед отправкой", "Открытка с вашим текстом"],
    finalTitle: "Скажите это цветами",
    finalText: "Создайте букет или доверьте выбор нашему флористу.",
  },
  "little-orbit": {
    label: "Программы",
    title: "Большие открытия начинаются с игры",
    items: [
      { title: "Little Explorers", text: "Творчество, сенсорные игры и первые занятия в группе.", meta: "2–3 года" },
      { title: "Smart Start", text: "Речь, логика, музыка и движение в бережном темпе.", meta: "4–5 лет" },
      { title: "Ready for School", text: "Уверенная подготовка к школе без скучных уроков.", meta: "5–7 лет" },
    ],
    featureTitle: "Родителям спокойно, детям интересно",
    featureText: "У каждой группы понятная программа, постоянный педагог и удобное расписание.",
    points: ["Пробное занятие", "Небольшие группы", "Отчёты и фото для родителей"],
    finalTitle: "Приходите знакомиться",
    finalText: "Выберите программу и запишитесь на первое пробное занятие.",
  },
  "black-ink": {
    label: "Стили и мастера",
    title: "Работа, которая останется с вами",
    items: [
      { title: "Fine Line", text: "Тонкие линии, деликатная графика и минимализм.", meta: "от €120" },
      { title: "Blackwork", text: "Контрастные формы, орнаменты и авторская графика.", meta: "от €180" },
      { title: "Custom Project", text: "Индивидуальный эскиз и серия сеансов для большой идеи.", meta: "по консультации" },
    ],
    featureTitle: "От идеи до зажившего результата",
    featureText: "Выберите мастера по стилю, отправьте референсы и получите план проекта.",
    points: ["Бесплатная консультация", "Стерильность и безопасность", "Инструкция по уходу"],
    finalTitle: "Расскажите о своей идее",
    finalText: "Мастер изучит задачу и предложит следующий шаг.",
  },
  "vow-films": {
    label: "Фильмы и истории",
    title: "Не просто запись — память в движении",
    items: [
      { title: "Essential", text: "Церемония, прогулка и атмосферный фильм о вашем дне.", meta: "8 часов" },
      { title: "Full Story", text: "Полный день, два оператора, тизер и большой фильм.", meta: "12 часов" },
      { title: "Weekend", text: "Welcome-вечер, свадьба и следующий день одной историей.", meta: "2–3 дня" },
    ],
    featureTitle: "Сначала проверим вашу дату",
    featureText: "После подтверждения вы получите предложение, договор и личное пространство пары.",
    points: ["Прозрачные пакеты", "Договор и платежи онлайн", "Приватная галерея фильма"],
    finalTitle: "Сохраним, как это чувствовалось",
    finalText: "Укажите дату и несколько слов о вашей свадьбе.",
  },
  "paw-club": {
    label: "Услуги",
    title: "Уход для каждого характера",
    items: [
      { title: "Fresh & Fluffy", text: "Купание, сушка, вычёсывание и уход за лапами.", meta: "от €38" },
      { title: "Full Groom", text: "Полный комплекс со стрижкой по породе или характеру.", meta: "от €58" },
      { title: "Puppy First", text: "Бережное первое знакомство щенка с грумингом.", meta: "от €30" },
    ],
    featureTitle: "Мы помним каждого питомца",
    featureText: "В карточке сохраняются особенности шерсти, привычки и пожелания владельца.",
    points: ["Подбор времени по породе", "Знакомый мастер", "Напоминание о следующем уходе"],
    finalTitle: "Пора навести красоту",
    finalText: "Расскажите о питомце — мы покажем подходящие услуги и время.",
  },
};

export default function DemoShowcaseClient({ demo }: { demo: DemoDefinition }) {
  const [view, setView] = useState<View>("site");
  const content = SITE_CONTENT[demo.slug];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <MarketingBrand />
        <Link className={styles.back} href="/demos">← Все демо</Link>
      </header>

      <div className={styles.shell}>
        <section className={styles.stage}>
          <div className={styles.tabs} aria-label="Вид демонстрации">
            <button type="button" aria-pressed={view === "site"} className={view === "site" ? styles.active : ""} onClick={() => setView("site")}>Сайт</button>
            <button type="button" aria-pressed={view === "admin"} className={view === "admin" ? styles.active : ""} onClick={() => setView("admin")}>Админка</button>
            <button type="button" aria-pressed={view === "phone"} className={view === "phone" ? styles.active : ""} onClick={() => setView("phone")}>Телефон</button>
          </div>

          <div className={styles.frame}>
            <div className={styles.browserTop}><i/><i/><i/><span>{demo.slug}.demo.onestudioos.com</span></div>
            {view === "site" ? (
              <div className={styles.site}>
                <DemoVisual demo={demo} />
                <DemoSiteSections demo={demo} content={content} />
              </div>
            ) : null}
            {view === "phone" ? (
              <div className={styles.phoneWrap}>
                <div className={styles.phone}>
                  <DemoVisual demo={demo} phone />
                  <div className={styles.phoneContent}>
                    <span>{content.label}</span>
                    <strong>{content.title}</strong>
                    {content.items.slice(0, 2).map((item) => (
                      <div key={item.title}><b>{item.title}</b><small>{item.meta}</small></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            {view === "admin" ? (
              <div className={styles.admin}>
                <aside className={styles.adminAside}>
                  <strong>ONE OS</strong>
                  {["Главная", "Бронирования", "Клиенты", "Оплаты", "Сайт", "Настройки"].map((item) => <span key={item}>{item}</span>)}
                </aside>
                <div className={styles.adminMain}>
                  <h3>Сегодня</h3>
                  <div className={styles.stats}>
                    <div><span>БРОНИ</span><b>24</b></div>
                    <div><span>КЛИЕНТЫ</span><b>186</b></div>
                    <div><span>ВЫРУЧКА</span><b>€4 860</b></div>
                  </div>
                  <div className={styles.activity}><b>Ближайшие события</b><i/><i/><i/></div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <aside className={styles.info}>
          <p className={styles.kind}>{demo.title.ru}</p>
          <h1>{demo.name}</h1>
          <p className={styles.description}>{demo.description.ru}</p>
          <h2 className={styles.modulesTitle}>В демо уже включены</h2>
          <div className={styles.modules}>
            {demo.modules.map((module) => <span key={module}>{module}</span>)}
          </div>
          <Link className={styles.configure} href={newSitePathForTemplate(demo.slug === "lumiere" ? "gloss-nail-studio" : "standard")}>Использовать этот шаблон ↗</Link>
          <p className={styles.note}>Название, палитра, языки и набор модулей меняются на следующем шаге.</p>
        </aside>
      </div>
    </main>
  );
}

function DemoSiteSections({ demo, content }: { demo: DemoDefinition; content: SiteContent }) {
  return (
    <>
      <section className={styles.offer}>
        <div className={styles.sectionHeading}>
          <span>{content.label}</span>
          <h3>{content.title}</h3>
        </div>
        <div className={styles.offerGrid}>
          {content.items.map((item, index) => (
            <article key={item.title}>
              <i>0{index + 1}</i>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
              <b>{item.meta}</b>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.feature}>
        <div>
          <span>ONE STUDIO EXPERIENCE</span>
          <h3>{content.featureTitle}</h3>
          <p>{content.featureText}</p>
        </div>
        <ul>{content.points.map((point) => <li key={point}>{point}</li>)}</ul>
      </section>
      <section className={styles.finalCta}>
        <span>{demo.businessName}</span>
        <h3>{content.finalTitle}</h3>
        <p>{content.finalText}</p>
        <button type="button">{demo.action.ru} →</button>
      </section>
    </>
  );
}
