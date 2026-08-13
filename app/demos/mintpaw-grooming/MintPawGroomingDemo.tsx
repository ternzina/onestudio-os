"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./MintPawGroomingDemo.module.css";

type PetKind = "dog" | "cat";

const serviceCards = [
  {
    icon: "✂",
    title: "Полный груминг",
    copy: "Купание, сушка, стрижка, когти и ушки",
    price: "от 2 300 ₽",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=86",
  },
  {
    icon: "〽",
    title: "Экспресс-линька",
    copy: "Меньше шерсти дома, больше воздуха в объятиях",
    price: "от 1 600 ₽",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=86",
  },
  {
    icon: "♡",
    title: "Кошачий SPA",
    copy: "Бережное вычёсывание и уход без лишнего стресса",
    price: "от 1 900 ₽",
    image:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=86",
  },
  {
    icon: "◌",
    title: "Лапы & гигиена",
    copy: "Когти, лапки, ушки и аккуратная мордочка",
    price: "от 1 100 ₽",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=86",
  },
];

const packages = [
  {
    title: "Мини-комплекс",
    note: "до 10 кг",
    price: "от 1 450 ₽",
    image:
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=760&q=85",
  },
  {
    title: "Большой друг",
    note: "от 10 кг",
    price: "от 2 600 ₽",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=760&q=85",
  },
  {
    title: "Пушистый кот",
    note: "деликатный уход",
    price: "от 1 900 ₽",
    image:
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=760&q=85",
  },
];

const masters = [
  {
    name: "Лера Белова",
    role: "Грумер собак",
    detail: "Спаниели · пудели · шпицы",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=720&q=85",
  },
  {
    name: "Саша Мир",
    role: "Грумер кошек",
    detail: "Спокойный адаптивный уход",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=720&q=85",
  },
  {
    name: "Мила Рэй",
    role: "Стрижки & styling",
    detail: "Породные и домашние формы",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=85",
  },
];

const faqs = [
  [
    "Что взять на первый визит?",
    "Ничего специального. Расскажите о привычках питомца и, если есть, покажите фото желаемой формы стрижки.",
  ],
  [
    "Если питомец боится фена?",
    "Работаем с паузами, мягкой сушкой и без гонки по таймеру. При сильном стрессе сокращаем процедуру.",
  ],
  [
    "Когда лучше повторить уход?",
    "После визита мастер сохранит рекомендацию. Демо-система показывает, как можно прислать напоминание автоматически.",
  ],
];

function PawMark() {
  return (
    <span className={styles.pawMark} aria-hidden="true">
      <span>●</span>
      <span>●</span>
      <span>●</span>
      <b>♥</b>
    </span>
  );
}

export default function MintPawGroomingDemo() {
  const [pet, setPet] = useState<PetKind>("dog");
  const [favorite, setFavorite] = useState<number | null>(null);
  const [compare, setCompare] = useState(52);
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const breeds = useMemo(
    () =>
      pet === "dog"
        ? ["Выберите породу", "Шпиц", "Пудель", "Йорк", "Корги", "Лабрадор", "Другая"]
        : ["Выберите породу", "Мейн-кун", "Британская", "Шотландская", "Сфинкс", "Другая"],
    [pet],
  );

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast("Готово ✦ В демо мы сохранили выбранное время.");
    window.setTimeout(() => setToast(""), 3800);
  }

  return (
    <main className={styles.site}>
      <div className={styles.promo}>
        <span>✦</span>
        Первое знакомство и мини-консультация бесплатно
        <span>✦</span>
      </div>

      <header className={styles.header}>
        <a className={styles.logo} href="#top" aria-label="ЛАПА & МЯТА">
          <PawMark />
          <span>
            <strong>ЛАПА & МЯТА</strong>
            <small>PET CARE STUDIO</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Основная навигация">
          <a href="#services">Услуги</a>
          <a href="#packages">Комплексы</a>
          <a href="#masters">Мастера</a>
          <a href="#results">До и после</a>
          <a href="#faq">Вопросы</a>
          <a href="#contacts">Контакты</a>
        </nav>

        <a className={styles.headerCta} href="#booking">
          Записать хвостик
        </a>

        <button
          className={styles.menuButton}
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-label="Открыть меню"
        >
          <span />
          <span />
        </button>

        {mobileOpen ? (
          <div className={styles.mobileMenu}>
            {[
              ["Услуги", "#services"],
              ["Комплексы", "#packages"],
              ["Мастера", "#masters"],
              ["До и после", "#results"],
              ["Вопросы", "#faq"],
              ["Контакты", "#contacts"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
            <a href="#booking" onClick={() => setMobileOpen(false)}>
              Выбрать время
            </a>
          </div>
        ) : null}
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>БЕРЕЖНЫЙ ГРУМИНГ СОБАК И КОШЕК</p>
          <h1>
            Чистая шерсть.
            <br />
            <em>Спокойный хвост.</em>
          </h1>
          <p className={styles.heroText}>
            Груминг без спешки, с паузами, знакомством перед процедурой
            и вниманием к характеру питомца.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#booking">
              Выбрать время
            </a>
            <a className={styles.textButton} href="#services">
              Посмотреть услуги <span>↗</span>
            </a>
          </div>
          <div className={styles.trustRow}>
            <span>⌁ Гипоаллергенная косметика</span>
            <span>☆ Мастера по породам</span>
            <span>♧ Напомним о следующем уходе</span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroHalo} />
          <img
            src="https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=1400&q=88"
            alt="Ухоженная собака в светлой груминг-студии"
          />
          <div className={styles.heroBadge}>
            <strong>4.9</strong>
            <span>средняя оценка</span>
            <small>★★★★★</small>
          </div>
          <div className={styles.heroNote}>
            <span>без спешки</span>
            <b>90 мин</b>
            <small>средний визит</small>
          </div>
        </div>
      </section>

      <section id="services" className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>УСЛУГИ</p>
            <h2>Всё для чистых лап и блестящей шерсти</h2>
          </div>
          <p>Понятные комплексы без «сюрпризов» в финальном чеке.</p>
        </div>

        <div className={styles.serviceGrid}>
          {serviceCards.map((service, index) => (
            <article className={styles.serviceCard} key={service.title}>
              <div className={styles.serviceImage}>
                <img src={service.image} alt="" />
                <span>{service.icon}</span>
              </div>
              <div className={styles.serviceBody}>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <div>
                  <strong>{service.price}</strong>
                  <a href="#booking" aria-label={`Записаться: ${service.title}`}>
                    Подробнее ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="packages" className={`${styles.section} ${styles.compactSection}`}>
        <div className={styles.centerTitle}>
          <p className={styles.eyebrow}>ЧАЩЕ ВЫБИРАЮТ</p>
          <h2>Комплексы для разных характеров</h2>
        </div>
        <div className={styles.packageGrid}>
          {packages.map((item, index) => (
            <article className={styles.packageCard} key={item.title}>
              <img src={item.image} alt="" />
              <button
                type="button"
                className={`${styles.heartButton} ${
                  favorite === index ? styles.heartActive : ""
                }`}
                onClick={() =>
                  setFavorite((current) => (current === index ? null : index))
                }
                aria-label="Добавить в избранное"
              >
                ♥
              </button>
              <div>
                <h3>{item.title}</h3>
                <span>{item.note}</span>
                <strong>{item.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="booking" className={`${styles.section} ${styles.bookingSection}`}>
        <div className={styles.bookingArt}>
          <p className={styles.eyebrow}>ОНЛАЙН-ЗАПИСЬ</p>
          <h2>
            Кто сегодня идёт
            <br />
            на красоту?
          </h2>
          <p>
            Выберите питомца, услугу и удобное время. В рабочем сайте эти поля
            связываются с реальной доступностью мастеров.
          </p>
          <div className={styles.bottle}>
            <span>MINT</span>
            <PawMark />
          </div>
          <span className={styles.scribble}>♡</span>
        </div>

        <form className={styles.bookingForm} onSubmit={submitBooking}>
          <div className={styles.petSwitch} role="group" aria-label="Питомец">
            <button
              type="button"
              className={pet === "dog" ? styles.petActive : ""}
              onClick={() => setPet("dog")}
            >
              🐾 Собака
            </button>
            <button
              type="button"
              className={pet === "cat" ? styles.petActive : ""}
              onClick={() => setPet("cat")}
            >
              ♡ Кошка
            </button>
          </div>

          <label className={styles.fieldWide}>
            <span>Порода</span>
            <select defaultValue="">
              {breeds.map((breed, index) => (
                <option key={breed} value={index === 0 ? "" : breed} disabled={index === 0}>
                  {breed}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.fieldWide}>
            <span>Услуга</span>
            <select defaultValue="">
              <option value="" disabled>
                Выберите услугу
              </option>
              <option>Полный груминг</option>
              <option>Экспресс-линька</option>
              <option>Кошачий SPA</option>
              <option>Лапы & гигиена</option>
            </select>
          </label>

          <div className={styles.formGrid}>
            <label>
              <span>Мастер</span>
              <select defaultValue="">
                <option value="" disabled>
                  Выберите мастера
                </option>
                <option>Любой свободный</option>
                <option>Лера Белова</option>
                <option>Саша Мир</option>
                <option>Мила Рэй</option>
              </select>
            </label>
            <label>
              <span>Дата</span>
              <input type="date" />
            </label>
            <label>
              <span>Время</span>
              <select defaultValue="">
                <option value="" disabled>
                  Выберите время
                </option>
                <option>10:30</option>
                <option>12:00</option>
                <option>14:30</option>
                <option>17:00</option>
              </select>
            </label>
          </div>

          <button className={styles.bookingSubmit} type="submit">
            Найти свободное время
          </button>
          <small className={styles.formNote}>
            ✉ Подтверждение и напоминание придут на email
          </small>
        </form>
      </section>

      <section id="masters" className={styles.section}>
        <div className={styles.centerTitle}>
          <p className={styles.eyebrow}>КОМАНДА</p>
          <h2>Мастера с добрыми руками</h2>
        </div>
        <div className={styles.masterGrid}>
          {masters.map((master) => (
            <article className={styles.masterCard} key={master.name}>
              <div className={styles.masterPhoto}>
                <img src={master.image} alt={master.name} />
              </div>
              <div>
                <h3>{master.name}</h3>
                <p>{master.role}</p>
                <span>{master.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="results" className={`${styles.section} ${styles.resultsSection}`}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>ДО И ПОСЛЕ</p>
            <h2>Один хвост, два настроения</h2>
          </div>
          <p>Потяните ползунок и сравните результат.</p>
        </div>

        <div
          className={styles.comparison}
          style={{ "--compare": `${compare}%` } as React.CSSProperties}
        >
          <img
            className={styles.afterImage}
            src="https://images.unsplash.com/photo-1594149929911-78975a43d4f5?auto=format&fit=crop&w=1400&q=86"
            alt="Питомец после ухода"
          />
          <div className={styles.beforeClip}>
            <img
              src="https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=1400&q=86"
              alt="Питомец до ухода"
            />
          </div>
          <span className={styles.beforeLabel}>до</span>
          <span className={styles.afterLabel}>после</span>
          <div className={styles.compareLine}>
            <span>↔</span>
          </div>
          <input
            type="range"
            min="18"
            max="82"
            value={compare}
            onChange={(event) => setCompare(Number(event.target.value))}
            aria-label="Сравнить до и после"
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.reminder}`}>
        <div className={styles.reminderIcon}>♧</div>
        <div>
          <p className={styles.eyebrow}>ЗАБОТА ПОСЛЕ ВИЗИТА</p>
          <h2>Напомним, когда пора снова</h2>
          <p>
            Сохраним рекомендацию мастера и вовремя пришлём напоминание
            о следующем уходе.
          </p>
        </div>
        <a href="#booking">Как это работает</a>
        <div className={styles.reminderDog}>
          <img
            src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=84"
            alt=""
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.reviewSection}`}>
        <div className={styles.reviewCard}>
          <div className={styles.reviewPerson}>
            <img
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=82"
              alt=""
            />
            <div>
              <strong>Ирина & Боня</strong>
              <span>★★★★★</span>
            </div>
          </div>
          <blockquote>
            «Наш пёс всегда боялся стрижки, а здесь впервые вышел спокойным
            и довольным. Теперь только сюда.»
          </blockquote>
        </div>

        <div className={styles.contactMini}>
          <p className={styles.eyebrow}>ЖДЁМ В ГОСТИ</p>
          <h2>ул. Мятная, 15</h2>
          <p>Ежедневно · 09:00–20:00</p>
          <a href="#contacts">Построить маршрут ↗</a>
        </div>

        <div className={styles.mapArt} aria-label="Декоративная карта">
          <span className={styles.mapRoadOne} />
          <span className={styles.mapRoadTwo} />
          <span className={styles.mapPark}>PARK</span>
          <span className={styles.mapPin}>
            <PawMark />
          </span>
          <span className={styles.mapCafe}>coffee</span>
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.faqSection}`}>
        <div className={styles.faqIntro}>
          <p className={styles.eyebrow}>ПЕРЕД ПЕРВЫМ ВИЗИТОМ</p>
          <h2>Три вопроса, которые нам задают чаще всего</h2>
          <p>В настоящем шаблоне этот блок можно редактировать под правила студии.</p>
        </div>
        <div className={styles.faqList}>
          {faqs.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>
                {question}
                <span>＋</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer id="contacts" className={styles.footer}>
        <div className={styles.footerBrand}>
          <a className={styles.logo} href="#top">
            <PawMark />
            <span>
              <strong>ЛАПА & МЯТА</strong>
              <small>PET CARE STUDIO</small>
            </span>
          </a>
          <p>Красивый уход без гонки и лишнего стресса.</p>
        </div>
        <div>
          <strong>Контакты</strong>
          <a href="tel:+70000000000">+7 000 000-00-00</a>
          <a href="mailto:hello@mintpaw.demo">hello@mintpaw.demo</a>
        </div>
        <div>
          <strong>Часы</strong>
          <span>Пн–Вс · 09:00–20:00</span>
          <span>ул. Мятная, 15</span>
        </div>
        <div className={styles.footerSystem}>
          <span>DEMO WEBSITE</span>
          <strong>ONE<span>STUDIO</span> OS</strong>
        </div>
      </footer>

      <Link className={styles.backToDemos} href="/demos">
        ← Все демо
      </Link>

      {toast ? (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
