import type { Metadata } from "next";
import styles from "./AlignPilates.module.css";

export const metadata: Metadata = {
  title: "ALIGN Pilates Studio | OneStudio OS demo",
  description:
    "Премиальный демо-сайт студии пилатеса: направления, тренеры, расписание, пробное занятие, абонементы и FAQ.",
  robots: { index: false, follow: false },
};

const formats = [
  {
    title: "Reformer Start",
    text: "Знакомство с тренажёром и основами",
    meta: "50 минут · от 650 ₴",
    image: "/templates/align-pilates/format-reformer-start.webp",
  },
  {
    title: "Reformer Flow",
    text: "Сила, контроль и плавное движение",
    meta: "50 минут · от 700 ₴",
    image: "/templates/align-pilates/format-reformer-flow.webp",
  },
  {
    title: "Mat Pilates",
    text: "Работа с весом собственного тела",
    meta: "50 минут · от 550 ₴",
    image: "/templates/align-pilates/format-mat.webp",
  },
  {
    title: "Personal",
    text: "Индивидуальная программа с тренером",
    meta: "50 минут · от 1 200 ₴",
    image: "/templates/align-pilates/format-personal.webp",
  },
] as const;

const benefits = [
  ["⌁", "Сильный центр"],
  ["↟", "Здоровая осанка"],
  ["✦", "Гибкость"],
  ["≈", "Меньше напряжения"],
] as const;

const schedule = [
  ["Пн · 09:00", "Reformer Start", "Елена Мартин", "2 места", "ok"],
  ["Пн · 18:30", "Reformer Flow", "Анна Рай", "Лист ожидания", "wait"],
  ["Вт · 10:00", "Mat Pilates", "Ольга Лис", "4 места", "ok"],
  ["Ср · 19:00", "Reformer Start", "Елена Мартин", "1 место", "ok"],
] as const;

const trainers = [
  ["Елена Мартин", "Reformer Pilates", "/templates/align-pilates/trainer-elena.webp"],
  ["Анна Рай", "Pilates Flow", "/templates/align-pilates/trainer-anna.webp"],
  ["Ольга Лис", "Mat & Mobility", "/templates/align-pilates/trainer-olga.webp"],
] as const;

const plans = [
  ["4 занятия", "2 400 ₴", "30 дней", false],
  ["8 занятий", "4 400 ₴", "60 дней", true],
  ["Unlimited", "6 900 ₴", "30 дней", false],
] as const;

const studioImages = Array.from({ length: 5 }, (_, index) =>
  `/templates/align-pilates/studio-${index + 1}.webp`,
);

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export default function AlignPilatesDemoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.promo}>Первое занятие на реформере со скидкой 30%</div>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="ALIGN Pilates Studio">
          <span>ALIGN</span>
          <small>PILATES STUDIO</small>
        </a>
        <nav className={styles.nav} aria-label="Основная навигация">
          <a href="#classes">Занятия</a>
          <a href="#schedule">Расписание</a>
          <a href="#trainers">Тренеры</a>
          <a href="#plans">Абонементы</a>
          <a href="#studio">О студии</a>
          <a href="#contacts">Контакты</a>
        </nav>
        <a className={styles.headerCta} href="#trial">Записаться</a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>СИЛА · БАЛАНС · ДВИЖЕНИЕ</p>
          <h1>Тело, в котором<br />легко жить</h1>
          <p className={styles.heroText}>
            Пилатес на реформерах и матах для силы, гибкости и бережного возвращения к себе.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#trial">Попробовать занятие</a>
            <a className={styles.textLink} href="#schedule">Посмотреть расписание <Arrow /></a>
          </div>
          <p className={styles.microcopy}>Группы до 6 человек · персональное внимание · можно начать с нуля</p>
        </div>
        <div className={styles.heroVisual} aria-label="Занятие пилатесом на реформере">
          <img src="/templates/align-pilates/hero.webp" alt="Занятие пилатесом на реформерах" />
          <div className={styles.heroBadge}>
            <strong>6</strong>
            <span>мест в группе</span>
          </div>
        </div>
      </section>

      <section className={styles.section} id="classes">
        <div className={styles.sectionHead}>
          <p>Найдите свой формат</p>
          <span>От первого знакомства до персональной практики</span>
        </div>
        <div className={styles.formatGrid}>
          {formats.map((format) => (
            <article className={styles.formatCard} key={format.title}>
              <img src={format.image} alt="" />
              <div className={styles.cardBody}>
                <h2>{format.title}</h2>
                <p>{format.text}</p>
                <span>{format.meta}</span>
                <a href="#trial">Подробнее <Arrow /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.manifest}>
        <h2>Не про идеальную форму. Про хорошее самочувствие.</h2>
        <div className={styles.benefits}>
          {benefits.map(([icon, label]) => (
            <div className={styles.benefit} key={label}>
              <span className={styles.benefitIcon}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.splitSection}>
        <div className={styles.schedulePane} id="schedule">
          <p className={styles.kicker}>РАСПИСАНИЕ</p>
          <h2>Выберите своё время</h2>
          <div className={styles.filters}>
            <button className={styles.activeFilter} type="button">Все занятия</button>
            <button type="button">Reformer</button>
            <button type="button">Mat</button>
            <button type="button">Для начинающих</button>
          </div>
          <div className={styles.scheduleTable}>
            {schedule.map(([time, className, trainer, availability, state]) => (
              <div className={styles.scheduleRow} key={`${time}-${className}`}>
                <span>{time}</span>
                <strong>{className}</strong>
                <span>{trainer}</span>
                <em data-state={state}>{availability}</em>
              </div>
            ))}
          </div>
          <a className={styles.outlineButton} href="#trial">Всё расписание</a>
        </div>

        <div className={styles.trainersPane} id="trainers">
          <h2>Тренеры, которые видят вас</h2>
          <div className={styles.trainerGrid}>
            {trainers.map(([name, role, image]) => (
              <article className={styles.trainerCard} key={name}>
                <img src={image} alt={name} />
                <div>
                  <h3>{name}</h3>
                  <p>{role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bookingPlans}>
        <div className={styles.trialPane} id="trial">
          <p className={styles.kicker}>ПЕРВОЕ ЗАНЯТИЕ</p>
          <h2>Начните в удобном темпе</h2>
          <form className={styles.form}>
            <label>
              <span>Формат</span>
              <select defaultValue="">
                <option value="" disabled>Выберите формат</option>
                <option>Reformer Start</option>
                <option>Reformer Flow</option>
                <option>Mat Pilates</option>
                <option>Personal</option>
              </select>
            </label>
            <label>
              <span>Уровень</span>
              <select defaultValue="">
                <option value="" disabled>Выберите уровень</option>
                <option>Начинающий</option>
                <option>Продолжающий</option>
              </select>
            </label>
            <label>
              <span>Дата</span>
              <input type="date" />
            </label>
            <label>
              <span>Время</span>
              <input type="time" />
            </label>
            <button className={styles.primaryButton} type="button">Записаться на пробное</button>
          </form>
          <p className={styles.formNote}>Подтверждение и напоминание придут на email</p>
        </div>

        <div className={styles.plansPane} id="plans">
          <h2>Регулярность, которая работает</h2>
          <div className={styles.planGrid}>
            {plans.map(([name, price, term, popular]) => (
              <article className={styles.planCard} data-popular={popular ? "true" : "false"} key={name}>
                {popular ? <span className={styles.popular}>Популярно</span> : null}
                <p>{name}</p>
                <strong>{price}</strong>
                <span>Срок действия {term}</span>
                <button type="button">Выбрать</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.studio} id="studio">
        <div className={styles.sectionHeadCentered}>
          <p>Пространство ALIGN</p>
          <span>Свет, дерево, воздух и всё необходимое для спокойной практики</span>
        </div>
        <div className={styles.gallery}>
          {studioImages.map((image, index) => (
            <img src={image} alt={`Интерьер студии ALIGN ${index + 1}`} key={image} />
          ))}
        </div>
      </section>

      <section className={styles.reviewFaq}>
        <div className={styles.review}>
          <h2>После занятия</h2>
          <blockquote>
            «Я пришла из-за боли в спине, а осталась ради ощущения силы и спокойствия после каждой тренировки.»
          </blockquote>
          <p>Дарья, 34 года</p>
          <div className={styles.dots}><span /><span /><span /><span /></div>
        </div>
        <div className={styles.faq}>
          <h2>Перед первым визитом</h2>
          <details>
            <summary>Что взять с собой?</summary>
            <p>Удобную форму, носки с нескользящей стопой и воду. Всё остальное уже есть в студии.</p>
          </details>
          <details>
            <summary>Можно ли без опыта?</summary>
            <p>Да. Для первого визита мы рекомендуем Reformer Start или персональное занятие.</p>
          </details>
          <details>
            <summary>Как выбрать уровень?</summary>
            <p>Расскажите о своём опыте при записи, и администратор подберёт подходящий формат.</p>
          </details>
        </div>
      </section>

      <section className={styles.contacts} id="contacts">
        <div className={styles.contactCopy}>
          <p className={styles.kicker}>КОНТАКТЫ</p>
          <h2>Встретимся на реформере</h2>
          <p>Ежедневно: 07:00–21:00</p>
          <p>ул. Баланса, 8 · Киев</p>
          <a className={styles.primaryButton} href="#top">Построить маршрут</a>
        </div>
        <div className={styles.map}>
          <img src="/templates/align-pilates/map.webp" alt="Схема расположения ALIGN Pilates Studio" />
          <div className={styles.pin}><span>●</span><strong>ALIGN</strong><small>PILATES STUDIO</small></div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerIntro}>
            <a className={styles.footerBrand} href="#top">
              <span>ALIGN</span>
              <small>PILATES STUDIO</small>
            </a>
            <p>Движение без спешки. Сильное тело, спокойная голова и практика, к которой хочется возвращаться.</p>
            <a className={styles.footerCta} href="#trial">Записаться на первое занятие <Arrow /></a>
          </div>

          <nav className={styles.footerNav} aria-label="Навигация в футере">
            <p>Студия</p>
            <a href="#classes">Занятия</a>
            <a href="#schedule">Расписание</a>
            <a href="#trainers">Тренеры</a>
            <a href="#plans">Абонементы</a>
            <a href="#studio">О студии</a>
          </nav>

          <div className={styles.footerContact}>
            <p className={styles.footerLabel}>Визит</p>
            <strong>ул. Баланса, 8 · Киев</strong>
            <span>Ежедневно · 07:00–21:00</span>
            <a href="mailto:hello@align-pilates.studio">hello@align-pilates.studio</a>
            <a href="tel:+380441234567">+380 44 123 45 67</a>
          </div>

          <div className={styles.footerSocialBlock}>
            <p className={styles.footerLabel}>Мы на связи</p>
            <div className={styles.socials} aria-label="Социальные сети">
              <a href="#top" aria-label="Instagram">Instagram</a>
              <a href="#top" aria-label="Telegram">Telegram</a>
              <a href="#top" aria-label="WhatsApp">WhatsApp</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2026 ALIGN Pilates Studio</span>
          <div>
            <a href="#top">Политика конфиденциальности</a>
            <a href="#top">Правила студии</a>
          </div>
          <p>Сайт и система управления созданы на <strong>OneStudio OS</strong></p>
        </div>
      </footer>
    </main>
  );
}
