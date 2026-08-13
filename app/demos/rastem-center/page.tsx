import type { Metadata } from "next";
import Image from "next/image";
import styles from "./RastemDemo.module.css";

const IMG = "/images/demos/premium-kids-center";

export const metadata: Metadata = {
  title: "РАСТЁМ — центр развития | OneStudio OS Demo",
  description:
    "Светлый современный демо-сайт детского центра: программы по возрасту, расписание, педагоги, пробное занятие, абонементы, отзывы и FAQ.",
};

const ageGroups = [
  { age: "2–3 года", text: "Мама и малыш", image: `${IMG}/home-learning.webp`, tone: "coral" },
  { age: "4–5 лет", text: "Развиваем речь и мышление", image: `${IMG}/math-manipulatives.webp`, tone: "aqua" },
  { age: "6–7 лет", text: "Готовимся к школе", image: `${IMG}/reading-story.webp`, tone: "blue" },
  { age: "8–10 лет", text: "Исследуем и создаём", image: `${IMG}/science-prism.webp`, tone: "yellow" },
] as const;

const programs = [
  { title: "Творческая мастерская", text: "Рисуем, лепим, создаём", image: `${IMG}/creative-studio.webp`, icon: "✂", tone: "aqua" },
  { title: "Подготовка к школе", text: "Читаем, считаем, готовимся", image: `${IMG}/workbook-cover.webp`, icon: "✎", tone: "yellow" },
  { title: "Английский через игру", text: "Слушаем, говорим, понимаем", image: `${IMG}/reading-story.webp`, icon: "A", tone: "mint" },
  { title: "Музыка и ритм", text: "Песни, движение, ритм", image: `${IMG}/music-motion.webp`, icon: "♪", tone: "coral" },
  { title: "Маленькие исследователи", text: "Эксперименты, наблюдения", image: `${IMG}/science-prism.webp`, icon: "⌁", tone: "blue" },
  { title: "Логика и конструирование", text: "Строим, решаем, думаем", image: `${IMG}/math-manipulatives.webp`, icon: "▦", tone: "yellow" },
] as const;

const schedule = [
  ["Пн · 10:00", "Мама и малыш", "2 места"],
  ["Вт · 17:30", "Творческая мастерская", "4 места"],
  ["Ср · 18:00", "Подготовка к школе", "1 место"],
  ["Сб · 11:00", "Маленькие исследователи", "3 места"],
] as const;

const teachers = [
  { name: "Анна Светлова", role: "Раннее развитие", image: `${IMG}/teacher-elena.webp` },
  { name: "Мария Добрая", role: "Подготовка к школе", image: `${IMG}/teacher-jan.webp` },
  { name: "Ольга Мир", role: "Творчество и музыка", image: `${IMG}/hero-platform.webp` },
] as const;

const prices = [
  { count: "4 занятия", price: "1 600 ₴", tone: "yellow" },
  { count: "8 занятий", price: "2 900 ₴", tone: "aqua" },
  { count: "12 занятий", price: "3 900 ₴", tone: "coral" },
] as const;

export default function RastemDemoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.promo}>★ &nbsp; Пробная неделя для новых семей — бесплатно</div>

      <header className={styles.header}>
        <a className={styles.logo} href="#top" aria-label="РАСТЁМ">
          <strong>РАСТЁМ</strong>
          <span>ЦЕНТР РАЗВИТИЯ</span>
        </a>

        <nav className={styles.nav} aria-label="Основная навигация">
          <a href="#programs">Программы</a>
          <a href="#ages">Возраст</a>
          <a href="#schedule">Расписание</a>
          <a href="#teachers">Педагоги</a>
          <a href="#parents">Родителям</a>
          <a href="#contacts">Контакты</a>
        </nav>

        <a className={styles.headerCta} href="#trial">Записаться на пробное</a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>ИГРАЕМ · УЧИМСЯ · РАСТЁМ</p>
          <h1>Место, где интересно быть собой</h1>
          <p className={styles.heroLead}>
            Бережные занятия для детей от 2 до 10 лет, в маленьких группах,
            с вниманием к характеру и темпу каждого ребёнка.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#ages">Подобрать программу</a>
            <a className={styles.textLink} href="#schedule">Посмотреть расписание <span>→</span></a>
          </div>

          <div className={styles.heroFacts}>
            <span><b>♧</b> Группы до 8 детей</span>
            <span><b>♕</b> Опытные педагоги</span>
            <span><b>▣</b> Обратная связь родителям</span>
          </div>

          <span className={`${styles.doodle} ${styles.sun}`} aria-hidden="true">☼</span>
        </div>

        <div className={styles.heroPhoto}>
          <Image
            src={`${IMG}/hero-platform.webp`}
            alt="Педагог занимается с детьми"
            fill
            priority
            sizes="(max-width: 860px) 100vw, 52vw"
          />
          <span className={`${styles.doodle} ${styles.loop}`} aria-hidden="true">⌁</span>
        </div>
      </section>

      <section className={styles.section} id="ages">
        <div className={styles.sideTitle}>
          <h2>Занятия<br />по возрасту</h2>
          <span className={styles.starDoodle} aria-hidden="true">☆</span>
        </div>
        <div className={styles.ageGrid}>
          {ageGroups.map((group) => (
            <article className={`${styles.ageCard} ${styles[group.tone]}`} key={group.age}>
              <div className={styles.ageImage}>
                <Image src={group.image} alt="" fill sizes="220px" />
              </div>
              <h3>{group.age}</h3>
              <p>{group.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.programSection}`} id="programs">
        <div className={styles.sideTitle}>
          <h2>Что интересно<br />вашему ребёнку?</h2>
        </div>
        <div className={styles.programGrid}>
          {programs.map((program) => (
            <article className={styles.programCard} key={program.title}>
              <div className={styles.programImage}>
                <Image src={program.image} alt="" fill sizes="180px" />
              </div>
              <span className={`${styles.programIcon} ${styles[program.tone]}`}>{program.icon}</span>
              <h3>{program.title}</h3>
              <p>{program.text}</p>
              <a href="#trial">Подробнее <span>→</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.infoGrid}>
        <article className={styles.scheduleCard} id="schedule">
          <p className={styles.kicker}>РАСПИСАНИЕ</p>
          <h2>Выберите удобную группу</h2>
          <div className={styles.filters}>
            <span className={styles.filterActive}>Все</span>
            <span>2–3 года</span>
            <span>4–5 лет</span>
            <span>6–7 лет</span>
            <span>8–10 лет</span>
          </div>
          <div className={styles.scheduleList}>
            {schedule.map(([time, title, places], index) => (
              <div className={styles.scheduleRow} key={time}>
                <span>{time}</span>
                <strong>{title}</strong>
                <em className={index === 2 ? styles.danger : ""}>{places}</em>
              </div>
            ))}
          </div>
          <a className={styles.outlineButton} href="#trial">Всё расписание</a>
        </article>

        <article className={styles.teachersCard} id="teachers">
          <h2>Педагоги, которым<br />доверяют дети</h2>
          <div className={styles.teacherGrid}>
            {teachers.map((teacher) => (
              <div className={styles.teacher} key={teacher.name}>
                <div className={styles.teacherPhoto}>
                  <Image src={teacher.image} alt={teacher.name} fill sizes="160px" />
                </div>
                <strong>{teacher.name}</strong>
                <span>{teacher.role}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.trialCard} id="trial">
          <p className={styles.kicker}>ПРОБНОЕ ЗАНЯТИЕ</p>
          <h2>Познакомимся без спешки</h2>
          <div className={styles.formGrid}>
            <label>
              <span>Имя родителя</span>
              <input placeholder="Введите имя" />
            </label>
            <label>
              <span>Возраст ребёнка</span>
              <select defaultValue="">
                <option value="" disabled>Выберите возраст</option>
                <option>2–3 года</option>
                <option>4–5 лет</option>
                <option>6–7 лет</option>
                <option>8–10 лет</option>
              </select>
            </label>
            <label className={styles.formWide}>
              <span>Программа</span>
              <select defaultValue="">
                <option value="" disabled>Выберите программу</option>
                <option>Творческая мастерская</option>
                <option>Подготовка к школе</option>
                <option>Английский через игру</option>
                <option>Маленькие исследователи</option>
              </select>
            </label>
            <label>
              <span>Дата</span>
              <input type="date" />
            </label>
            <label>
              <span>Время</span>
              <select defaultValue="">
                <option value="" disabled>Выберите время</option>
                <option>10:00</option>
                <option>17:30</option>
                <option>18:00</option>
              </select>
            </label>
          </div>
          <button type="button" className={styles.trialButton}>Записаться бесплатно</button>
          <small>Подтверждение и напоминание придут на email</small>
          <span className={styles.heartDoodle} aria-hidden="true">♡</span>
        </article>
      </section>

      <section className={styles.trustStrip}>
        <div><span>♢</span><p><strong>Безопасное пространство</strong>Продуманная среда и забота о каждом</p></div>
        <div><span>◎</span><p><strong>Маленькие группы</strong>До 8 детей, внимание каждому</p></div>
        <div><span>✿</span><p><strong>Мягкая адаптация</strong>Постепенно и бережно</p></div>
        <div><span>◌</span><p><strong>Обратная связь</strong>Вы всегда знаете, как прошёл день</p></div>
      </section>

      <section className={styles.priceAppGrid} id="parents">
        <article className={styles.pricesCard}>
          <h2>Абонементы</h2>
          <div className={styles.prices}>
            {prices.map((price) => (
              <div className={`${styles.priceCard} ${styles[price.tone]}`} key={price.count}>
                <strong>{price.count}</strong>
                <b>{price.price}</b>
                <button type="button">Выбрать</button>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.parentApp}>
          <div>
            <h2>Вы всегда знаете,<br />как прошёл день</h2>
            <p>После занятия педагог оставит короткий комментарий, а система напомнит о следующей встрече.</p>
            <a href="#contacts">Для родителей</a>
          </div>
          <div className={styles.phone} aria-label="Пример приложения для родителей">
            <div className={styles.phoneBar}></div>
            <small>Сегодня в РАСТЁМ</small>
            <strong>Творческая мастерская</strong>
            <span>10:05–11:00</span>
            <div className={styles.phoneNote}>Комментарий педагога<br />«Сегодня ребёнок придумал целую историю из цвета и формы»</div>
            <div className={styles.phoneNext}>Следующее занятие<br /><b>Пн, 27 мая · 10:00</b></div>
          </div>
        </article>
      </section>

      <section className={styles.storyGrid}>
        <article className={styles.dayCard}>
          <h2>Обычный день в РАСТЁМ</h2>
          <div className={styles.gallery}>
            {[
              "studio-interior.webp",
              "collaboration.webp",
              "creative-studio.webp",
              "math-manipulatives.webp",
              "music-motion.webp",
              "science-prism.webp",
            ].map((image) => (
              <div className={styles.galleryImage} key={image}>
                <Image src={`${IMG}/${image}`} alt="" fill sizes="210px" />
              </div>
            ))}
          </div>
        </article>

        <article className={styles.reviewCard}>
          <div className={styles.quote}>“</div>
          <p>Дочь бежит на занятия с радостью, а я вижу, как она становится увереннее и любознательнее.</p>
          <div className={styles.stars}>★★★★★</div>
          <div className={styles.reviewPerson}>
            <div className={styles.reviewPhoto}>
              <Image src={`${IMG}/home-learning.webp`} alt="" fill sizes="160px" />
            </div>
            <span><strong>Елена, мама Сони</strong>ходят в РАСТЁМ 8 месяцев</span>
          </div>
          <span className={styles.bigHeart} aria-hidden="true">♡</span>
        </article>
      </section>

      <section className={styles.contactGrid} id="contacts">
        <article className={styles.faqCard}>
          <h2>Перед первым занятием</h2>
          {["Что взять с собой?", "Можно ли присутствовать родителю?", "Как проходит адаптация?"].map((q) => (
            <details key={q}>
              <summary>{q}<span>＋</span></summary>
              <p>Ничего специального. Главное — удобная одежда и хорошее настроение. Остальное уже ждёт ребёнка в центре.</p>
            </details>
          ))}
        </article>

        <article className={styles.visitCard}>
          <h2>Приходите знакомиться</h2>
          <p>◷ &nbsp; Пн–Сб: 09:00–20:00</p>
          <p>⌖ &nbsp; ул. Радости, 10</p>
          <a href="#trial">Построить маршрут</a>
        </article>

        <article className={styles.mapCard} aria-label="Схематичная карта">
          <div className={styles.roadA}></div>
          <div className={styles.roadB}></div>
          <div className={styles.pin}>●</div>
          <strong>РАСТЁМ</strong>
          <span>ЦЕНТР РАЗВИТИЯ</span>
        </article>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <strong>РАСТЁМ</strong>
          <span>ЦЕНТР РАЗВИТИЯ</span>
          <div>◉ &nbsp; ◈ &nbsp; ●</div>
        </div>
        <div>
          <strong>Программы</strong>
          <a href="#ages">Все программы</a>
          <a href="#schedule">Расписание</a>
          <a href="#teachers">Педагоги</a>
        </div>
        <div>
          <strong>Родителям</strong>
          <a href="#parents">Как мы работаем</a>
          <a href="#trial">Пробное занятие</a>
          <a href="#contacts">Вопросы</a>
        </div>
        <div>
          <strong>Контакты</strong>
          <span>ул. Радости, 10</span>
          <span>Пн–Сб 09:00–20:00</span>
          <span>+38 (050) 123 45 67</span>
        </div>
        <span className={styles.footerPlant} aria-hidden="true">♧♡</span>
      </footer>

      <div className={styles.credit}>Сайт и система управления созданы на OneStudio OS</div>
    </main>
  );
}
