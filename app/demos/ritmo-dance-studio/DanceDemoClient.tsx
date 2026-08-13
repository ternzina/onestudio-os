"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./DanceDemo.module.css";

type Filter = "all" | "beginner" | "advanced";

const directions = [
  {
    name: "Contemporary",
    note: "Свобода движения и эмоций",
    tag: "С нуля",
    tone: "violet",
    pose: "arc",
  },
  {
    name: "Hip-Hop",
    note: "Ритм, энергия и свой стиль",
    tag: "Любой уровень",
    tone: "cyan",
    pose: "street",
  },
  {
    name: "High Heels",
    note: "Уверенность и пластика",
    tag: "18+",
    tone: "rose",
    pose: "heels",
  },
  {
    name: "Latina",
    note: "Сальса, бачата и яркие эмоции",
    tag: "Любой уровень",
    tone: "coral",
    pose: "latin",
  },
  {
    name: "Stretching",
    note: "Гибкость, сила и восстановление",
    tag: "С нуля",
    tone: "sand",
    pose: "stretch",
  },
];

const schedule = [
  { day: "Пн", time: "18:30", title: "Contemporary Start", coach: "Анна Лис", level: "beginner", seats: 4 },
  { day: "Вт", time: "19:00", title: "Hip-Hop Basic", coach: "Макс Рэй", level: "beginner", seats: 2 },
  { day: "Ср", time: "20:00", title: "High Heels", coach: "София Марк", level: "advanced", seats: 6 },
  { day: "Чт", time: "18:00", title: "Latina Solo", coach: "Диана Круз", level: "advanced", seats: 4 },
];

const coaches = [
  { name: "Анна Лис", role: "Contemporary", initials: "АЛ", tone: "peach" },
  { name: "Макс Рэй", role: "Hip-Hop", initials: "МР", tone: "blue" },
  { name: "София Марк", role: "High Heels", initials: "СМ", tone: "gold" },
  { name: "Диана Круз", role: "Latina", initials: "ДК", tone: "plum" },
];

function DanceFigure({ pose, label }: { pose: string; label?: string }) {
  return (
    <svg
      className={styles.danceFigure}
      viewBox="0 0 360 460"
      role={label ? "img" : "presentation"}
      aria-label={label}
      focusable="false"
    >
      <defs>
        <linearGradient id={`skin-${pose}`} x1="0" x2="1">
          <stop stopColor="#f2b17e" />
          <stop offset="1" stopColor="#a9594e" />
        </linearGradient>
        <linearGradient id={`cloth-${pose}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#17101f" />
          <stop offset=".5" stopColor="#522156" />
          <stop offset="1" stopColor="#0b0912" />
        </linearGradient>
      </defs>

      <ellipse cx="182" cy="420" rx="116" ry="18" fill="rgba(0,0,0,.28)" />
      <g className={styles[`pose_${pose}`] ?? ""}>
        <path d="M163 146 C145 168 139 206 154 238 C168 269 214 268 226 235 C238 201 221 164 199 145 Z" fill={`url(#cloth-${pose})`} />
        <circle cx="183" cy="116" r="29" fill={`url(#skin-${pose})`} />
        <path d="M161 103 C170 71 212 72 220 103 C215 88 199 78 181 82 C169 84 160 93 161 103 Z" fill="#25111c" />
        <path d="M152 171 C118 193 92 222 64 247" stroke={`url(#skin-${pose})`} strokeWidth="17" strokeLinecap="round" />
        <path d="M216 173 C252 142 282 111 304 76" stroke={`url(#skin-${pose})`} strokeWidth="17" strokeLinecap="round" />
        <path d="M170 247 C137 284 107 330 76 382" stroke={`url(#cloth-${pose})`} strokeWidth="28" strokeLinecap="round" />
        <path d="M207 248 C242 282 272 323 303 371" stroke={`url(#cloth-${pose})`} strokeWidth="28" strokeLinecap="round" />
        <path d="M62 247 l-18 10" stroke="#f2b17e" strokeWidth="7" strokeLinecap="round" />
        <path d="M304 76 l11 -18" stroke="#f2b17e" strokeWidth="7" strokeLinecap="round" />
        <path d="M76 382 l-20 8" stroke="#17101f" strokeWidth="15" strokeLinecap="round" />
        <path d="M303 371 l20 8" stroke="#17101f" strokeWidth="15" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function DanceDemoClient() {
  const [filter, setFilter] = useState<Filter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState("Contemporary");

  const filteredSchedule = useMemo(
    () => schedule.filter((item) => filter === "all" || item.level === filter),
    [filter],
  );

  const submitTrial = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className={styles.page}>
      <div className={styles.promo}>
        <span>Пробный урок бесплатно до конца месяца</span>
        <span className={styles.promoDot} aria-hidden="true">✦</span>
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="RITMO Dance Studio">
          <strong>RITMO</strong>
          <span>DANCE STUDIO</span>
        </a>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="ritmo-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
          <span className={styles.srOnly}>Меню</span>
        </button>

        <nav id="ritmo-nav" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <a href="#directions" onClick={() => setMenuOpen(false)}>Направления</a>
          <a href="#schedule" onClick={() => setMenuOpen(false)}>Расписание</a>
          <a href="#coaches" onClick={() => setMenuOpen(false)}>Тренеры</a>
          <a href="#prices" onClick={() => setMenuOpen(false)}>Абонементы</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Контакты</a>
        </nav>

        <a className={styles.headerCta} href="#trial">На пробный</a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroGlow} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>ТАНЕЦ · ДВИЖЕНИЕ · СВОБОДА</p>
          <h1>Двигайся<br /><em>громче</em></h1>
          <p className={styles.heroText}>
            Танцевальная студия для взрослых, где можно начать с нуля,
            раскрыться и стать частью сильного сообщества.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#trial">Попробовать бесплатно</a>
            <a className={styles.videoButton} href="#gallery">
              <span className={styles.play}>▶</span>
              Смотреть шоу-рил
            </a>
          </div>
          <div className={styles.heroStats} aria-label="Статистика студии">
            <span><b>8</b> направлений</span>
            <span><b>11</b> тренеров</span>
            <span><b>7/7</b> занятия каждый день</span>
          </div>
        </div>

        <div className={styles.heroStage} aria-label="Танцевальная сцена">
          <div className={styles.stageGrid} />
          <div className={styles.neonLine} />
          <DanceFigure pose="hero" label="Стилизованная фигура танцовщицы" />
          <span className={styles.stageLabel}>RITMO</span>
          <span className={styles.stageSub}>dance studio</span>
          <div className={styles.showreelBadge}>
            <span>▶</span>
            <small>Showreel · 01:28</small>
          </div>
        </div>
      </section>

      <section className={styles.lightSection} id="directions">
        <div className={styles.sectionHeading}>
          <p>Выбери своё направление</p>
          <span>Не нужно уметь танцевать, чтобы начать.</span>
        </div>

        <div className={styles.directionGrid}>
          {directions.map((direction) => (
            <button
              type="button"
              className={`${styles.directionCard} ${styles[`tone_${direction.tone}`]} ${selectedDirection === direction.name ? styles.directionActive : ""}`}
              key={direction.name}
              onClick={() => setSelectedDirection(direction.name)}
              aria-pressed={selectedDirection === direction.name}
            >
              <div className={styles.directionVisual}>
                <span className={styles.directionHalo} />
                <DanceFigure pose={direction.pose} />
                <span className={styles.tag}>{direction.tag}</span>
              </div>
              <strong>{direction.name}</strong>
              <span>{direction.note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.scheduleWrap}`} id="schedule">
        <div className={styles.scheduleCard}>
          <div className={styles.scheduleIntro}>
            <p className={styles.panelEyebrow}>РАСПИСАНИЕ</p>
            <h2>Твоя неделя<br />в RITMO</h2>
            <div className={styles.filters}>
              {[
                ["all", "Все"],
                ["beginner", "Начинающим"],
                ["advanced", "Продолжающим"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? styles.filterActive : ""}
                  onClick={() => setFilter(value as Filter)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.scheduleList}>
            {filteredSchedule.map((item) => (
              <div className={styles.scheduleRow} key={`${item.day}-${item.time}`}>
                <span className={styles.when}><b>{item.day}</b> · {item.time}</span>
                <strong>{item.title}</strong>
                <span className={styles.coachMini}>
                  <i aria-hidden="true">{item.coach.split(" ").map((part) => part[0]).join("")}</i>
                  {item.coach}
                </span>
                <span className={styles.seats}>{item.seats} места</span>
              </div>
            ))}
            <a className={styles.scheduleAll} href="#trial">Открыть всё расписание <ArrowIcon /></a>
          </div>
        </div>
      </section>

      <section className={styles.lightSection} id="coaches">
        <div className={styles.sectionHeading}>
          <p>Люди, которые зажигают</p>
          <span>Сильные педагоги без пафоса и дистанции.</span>
        </div>
        <div className={styles.coachGrid}>
          {coaches.map((coach, index) => (
            <article className={`${styles.coachCard} ${styles[`coach_${coach.tone}`]}`} key={coach.name}>
              <div className={styles.coachArt}>
                <span className={styles.coachOrb}>{coach.initials}</span>
                <span className={styles.coachLine} />
                <span className={styles.coachNumber}>0{index + 1}</span>
              </div>
              <div>
                <strong>{coach.name}</strong>
                <span>{coach.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.trialWrap}`} id="trial">
        <div className={styles.trialCard}>
          <div className={styles.trialFormBlock}>
            <p className={styles.panelEyebrow}>ПРОБНЫЙ УРОК</p>
            <h2>{sent ? "Место почти твоё ✦" : "Первый шаг — просто прийти"}</h2>
            {sent ? (
              <div className={styles.success}>
                <strong>Заявка принята.</strong>
                <p>В настоящем сайте здесь подключается OneStudio OS: клиент, выбранное направление и время попадают в бронирование.</p>
                <button type="button" onClick={() => setSent(false)}>Записать ещё одного</button>
              </div>
            ) : (
              <form onSubmit={submitTrial}>
                <label>
                  <span>Направление</span>
                  <select defaultValue={selectedDirection} onChange={(event) => setSelectedDirection(event.target.value)}>
                    {directions.map((direction) => <option key={direction.name}>{direction.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Уровень</span>
                  <select defaultValue="С нуля">
                    <option>С нуля</option>
                    <option>Есть опыт</option>
                    <option>Продвинутый</option>
                  </select>
                </label>
                <label>
                  <span>Дата</span>
                  <input type="date" required />
                </label>
                <label>
                  <span>Время</span>
                  <select defaultValue="18:30">
                    <option>18:30</option>
                    <option>19:00</option>
                    <option>20:00</option>
                  </select>
                </label>
                <button className={styles.formSubmit} type="submit">Записаться бесплатно</button>
              </form>
            )}
            <small>✦ Подтверждение и напоминание придут на email</small>
          </div>

          <div className={styles.trialVisual}>
            <div className={styles.trialBeam} />
            <DanceFigure pose="group" label="Стилизованная танцевальная группа" />
            <span className={styles.trialWord}>MOVE</span>
          </div>
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.offerWrap}`} id="prices">
        <div className={styles.pricingPanel}>
          <div className={styles.pricingSide}>
            <p className={styles.panelEyebrow}>АБОНЕМЕНТЫ</p>
            <h2>Танцуй в своём темпе</h2>
            <p>Без скрытых условий. Заморозка включена, первое занятие бесплатно.</p>
          </div>
          <div className={styles.priceGrid}>
            {[
              ["Start", "4 занятия", "1 290 ₴"],
              ["Move", "8 занятий", "2 290 ₴"],
              ["Unlimited", "Безлимит на месяц", "3 590 ₴"],
            ].map(([name, note, price], index) => (
              <article className={`${styles.priceCard} ${index === 2 ? styles.priceFeatured : ""}`} key={name}>
                {index === 2 ? <span className={styles.star}>★</span> : null}
                <h3>{name}</h3>
                <span>{note}</span>
                <strong>{price}</strong>
                <a href="#trial">Выбрать</a>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.galleryPanel} id="gallery">
          <div className={styles.galleryTitle}>
            <p className={styles.panelEyebrow}>ЖИЗНЬ СТУДИИ</p>
            <h2>Мы в движении</h2>
          </div>
          <div className={styles.galleryGrid}>
            {["violet", "coral", "blue", "rose", "gold", "ink"].map((tone, index) => (
              <div className={`${styles.galleryCell} ${styles[`gallery_${tone}`]}`} key={tone}>
                <span>0{index + 1}</span>
                <i />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.lightSection} ${styles.contactWrap}`} id="contact">
        <div className={styles.contactPanel}>
          <div className={styles.quote}>
            <p className={styles.panelEyebrow}>RITMO ВНЕ ЗАЛА</p>
            <blockquote>
              «Я пришла одна и очень боялась. Через месяц уже вышла на сцену вместе с группой.»
            </blockquote>
            <div className={styles.quotePerson}>
              <span>МК</span>
              <p><strong>Мария К.</strong><small>Contemporary</small></p>
            </div>
          </div>

          <div className={styles.place}>
            <p className={styles.panelEyebrow}>ВСТРЕТИМСЯ В ЗАЛЕ</p>
            <h2>Каждый день<br />09:00–22:00</h2>
            <p>ул. Ритма, 7 · центр города</p>
            <a href="#trial">Построить маршрут <ArrowIcon /></a>
          </div>

          <div className={styles.mapArt} aria-label="Стилизованная карта">
            <span className={styles.roadOne} />
            <span className={styles.roadTwo} />
            <span className={styles.roadThree} />
            <span className={styles.pin}>●</span>
            <b>RITMO</b>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top">
          <strong>RITMO</strong>
          <span>DANCE STUDIO</span>
        </a>
        <div>
          <a href="#directions">Направления</a>
          <a href="#schedule">Расписание</a>
          <a href="#coaches">Тренеры</a>
        </div>
        <div>
          <a href="#prices">Абонементы</a>
          <a href="#gallery">События</a>
          <a href="#contact">Контакты</a>
        </div>
        <div className={styles.footerContact}>
          <strong>+38 (099) 123-45-67</strong>
          <span>hello@ritmo.demo</span>
        </div>
        <p className={styles.osCredit}>Сайт и система управления созданы на <b>OneStudio OS</b></p>
      </footer>
    </main>
  );
}
