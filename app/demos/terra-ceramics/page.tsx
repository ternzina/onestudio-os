"use client";

import { FormEvent, useState } from "react";
import styles from "./TerraCeramicsDemo.module.css";

const classes = [
  {
    title: "Гончарный круг",
    subtitle: "Создайте свою первую чашку",
    price: "от 900 ₴",
    image:
      "https://images.pexels.com/photos/6694308/pexels-photo-6694308.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Ручная лепка",
    subtitle: "Тарелки, вазы и свободные формы",
    price: "от 900 ₴",
    image:
      "https://images.pexels.com/photos/9733040/pexels-photo-9733040.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Роспись керамики",
    subtitle: "Цвет, глазури и ваша фантазия",
    price: "от 900 ₴",
    image:
      "https://images.pexels.com/photos/30225349/pexels-photo-30225349/free-photo-of-engaging-pottery-workshop-in-creative-studio.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    title: "Свидание в студии",
    subtitle: "Творческий вечер для двоих",
    price: "от 1 200 ₴",
    image:
      "https://images.pexels.com/photos/6694317/pexels-photo-6694317.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
] as const;

const schedule = [
  ["22 июля · 18:30", "Гончарный круг", "3 места"],
  ["24 июля · 19:00", "Ручная лепка", "5 мест"],
  ["27 июля · 12:00", "Знакомство с глиной", "2 места"],
] as const;

const gallery = [
  "https://images.pexels.com/photos/6611421/pexels-photo-6611421.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/6611429/pexels-photo-6611429.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/15440780/pexels-photo-15440780.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/18845480/pexels-photo-18845480.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/31203632/pexels-photo-31203632.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/19273231/pexels-photo-19273231.jpeg?auto=compress&cs=tinysrgb&w=900",
] as const;

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

export default function TerraCeramicsDemoPage() {
  const [bookingDone, setBookingDone] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Гончарный круг");

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingDone(true);
    window.setTimeout(() => setBookingDone(false), 4200);
  }

  return (
    <main className={styles.page}>
      <div className={styles.announcement}>
        Первое знакомство с глиной - каждую субботу
      </div>

      <section className={styles.hero} id="top">
        <div className={styles.heroShade} />
        <header className={styles.header}>
          <a className={styles.brand} href="#top" aria-label="TERRA">
            <span>TERRA</span>
            <small>CERAMICS STUDIO</small>
          </a>

          <nav className={styles.nav} aria-label="Главное меню">
            <a href="#classes">Мастер-классы</a>
            <a href="#courses">Курсы</a>
            <a href="#schedule">Расписание</a>
            <a href="#certificate">Сертификаты</a>
            <a href="#about">О студии</a>
            <a href="#contacts">Контакты</a>
          </nav>

          <a className={styles.headerCta} href="#booking">
            Записаться
          </a>
        </header>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>КЕРАМИКА · ТВОРЧЕСТВО · ОТДЫХ</p>
          <h1>Создавайте вещи, к которым хочется прикасаться</h1>
          <p className={styles.heroLead}>
            Учимся слышать материал, работать руками и находить красоту
            в несовершенстве.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#classes">
              Выбрать мастер-класс
            </a>
            <a className={styles.ghostButton} href="#schedule">
              Посмотреть расписание <Arrow />
            </a>
          </div>
        </div>

        <div className={styles.trustBar}>
          <span>♙ Все материалы включены</span>
          <span>·</span>
          <span>можно без опыта</span>
          <span>·</span>
          <span>группы до 8 человек</span>
        </div>
      </section>

      <section className={styles.section} id="classes">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>01 / МАСТЕР-КЛАССЫ</p>
            <h2>Попробуйте своё</h2>
          </div>
          <p>
            Один вечер, чтобы замедлиться, испачкать руки глиной и уйти
            с вещью, которую вы сделали сами.
          </p>
        </div>

        <div className={styles.classGrid}>
          {classes.map((item) => (
            <article className={styles.classCard} key={item.title}>
              <div
                className={styles.classImage}
                style={{ backgroundImage: `url("${item.image}")` }}
                role="img"
                aria-label={item.title}
              />
              <div className={styles.classCopy}>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
                <div className={styles.cardFooter}>
                  <strong>{item.price}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass(item.title);
                      document
                        .getElementById("booking")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bookingBand}>
        <div className={styles.scheduleCard} id="schedule">
          <p className={styles.darkKicker}>БЛИЖАЙШИЕ ЗАНЯТИЯ</p>
          <h2>Выберите удобное время</h2>
          <div className={styles.scheduleList}>
            {schedule.map(([date, title, places]) => (
              <button
                type="button"
                className={styles.scheduleRow}
                key={date}
                onClick={() => {
                  setSelectedClass(title);
                  document
                    .getElementById("booking")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className={styles.calendarIcon}>▣</span>
                <span>
                  <small>{date}</small>
                  <strong>{title}</strong>
                </span>
                <em>{places}</em>
              </button>
            ))}
          </div>
          <a className={styles.darkOutline} href="#booking">
            Всё расписание
          </a>
        </div>

        <form className={styles.bookingCard} id="booking" onSubmit={submitBooking}>
          <p className={styles.kicker}>ОНЛАЙН-ЗАПИСЬ</p>
          <h2>Ваш стол уже ждёт</h2>

          <label>
            Занятие
            <select
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
            >
              {classes.map((item) => (
                <option key={item.title}>{item.title}</option>
              ))}
              <option>Знакомство с глиной</option>
            </select>
          </label>

          <label>
            Дата
            <input type="date" required />
          </label>

          <label>
            Время
            <select defaultValue="">
              <option value="" disabled>
                Выберите время
              </option>
              <option>12:00</option>
              <option>15:30</option>
              <option>18:30</option>
              <option>20:00</option>
            </select>
          </label>

          <label>
            Количество гостей
            <select defaultValue="1">
              <option value="1">1 гость</option>
              <option value="2">2 гостя</option>
              <option value="3">3 гостя</option>
              <option value="4">4 гостя</option>
            </select>
          </label>

          <button className={styles.bookButton} type="submit">
            Забронировать место
          </button>
          <p className={styles.formNote}>
            Оплата онлайн · подтверждение придёт на email
          </p>
        </form>

        <div className={styles.courseCard} id="courses">
          <p className={styles.kicker}>КУРСЫ</p>
          <h2>Больше, чем один вечер</h2>

          <a className={styles.courseRow} href="#booking">
            <span
              style={{
                backgroundImage:
                  'url("https://images.pexels.com/photos/37827259/pexels-photo-37827259.jpeg?auto=compress&cs=tinysrgb&w=600")',
              }}
            />
            <strong>
              Основы керамики
              <small>8 занятий</small>
            </strong>
          </a>

          <a className={styles.courseRow} href="#booking">
            <span
              style={{
                backgroundImage:
                  'url("https://images.pexels.com/photos/5567014/pexels-photo-5567014.jpeg?auto=compress&cs=tinysrgb&w=600")',
              }}
            />
            <strong>
              Своя коллекция
              <small>12 занятий</small>
            </strong>
          </a>

          <a className={styles.courseRow} href="#booking">
            <span
              style={{
                backgroundImage:
                  'url("https://images.pexels.com/photos/15440780/pexels-photo-15440780.jpeg?auto=compress&cs=tinysrgb&w=600")',
              }}
            />
            <strong>
              Открытая мастерская
              <small>Абонемент на месяц</small>
            </strong>
          </a>

          <a className={styles.textLink} href="#booking">
            Подробнее о курсах <Arrow />
          </a>
        </div>
      </section>

      <section className={styles.eventSection} id="about">
        <div
          className={styles.eventPhoto}
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/34248156/pexels-photo-34248156.jpeg?auto=compress&cs=tinysrgb&w=1400")',
          }}
        />
        <div className={styles.eventCopy}>
          <p className={styles.kicker}>ПРАЗДНИКИ В TERRA</p>
          <h2>Ваш праздник своими руками</h2>
          <p>
            Дни рождения, встречи с друзьями и уютные корпоративы
            в мастерской.
          </p>
          <a className={styles.primaryButton} href="#contacts">
            Обсудить событие
          </a>
        </div>
        <div
          className={styles.eventPhoto}
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/15096491/pexels-photo-15096491.jpeg?auto=compress&cs=tinysrgb&w=1400")',
          }}
        />
      </section>

      <section className={styles.gallerySection}>
        <div className={styles.galleryHeading}>
          <div>
            <p className={styles.kicker}>02 / ГАЛЕРЕЯ</p>
            <h2>Создано в TERRA</h2>
          </div>
          <a className={styles.textLink} href="#contacts">
            Instagram <Arrow />
          </a>
        </div>
        <div className={styles.gallery}>
          {gallery.map((image, index) => (
            <div
              key={image}
              className={styles.galleryItem}
              style={{ backgroundImage: `url("${image}")` }}
              role="img"
              aria-label={`Работа из мастерской TERRA ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.storyBand}>
        <div className={styles.testimonial}>
          <p className={styles.darkKicker}>ГОВОРЯТ НАШИ ГОСТИ</p>
          <div className={styles.quoteMark}>“</div>
          <blockquote>
            Пришла просто отдохнуть после работы, а ушла с любимой чашкой
            и желанием вернуться.
          </blockquote>
          <div className={styles.author}>
            <span className={styles.avatar}>А</span>
            <span>
              <strong>Анна, Киев</strong>
              <small>Гончарный круг</small>
            </span>
          </div>
          <div className={styles.dots} aria-hidden="true">
            ● ○ ○
          </div>
        </div>

        <div
          className={styles.storyPhoto}
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/14963657/pexels-photo-14963657.jpeg?auto=compress&cs=tinysrgb&w=1200")',
          }}
        />

        <div className={styles.certificate} id="certificate">
          <div>
            <p className={styles.kicker}>ПОДАРОК</p>
            <h2>Подарите время для творчества</h2>
            <p>
              Электронный сертификат на любую сумму или занятие.
            </p>
            <a className={styles.primaryButton} href="#contacts">
              Выбрать сертификат
            </a>
          </div>
          <div className={styles.certificateVisual}>
            <span>TERRA</span>
            <small>CERAMICS STUDIO</small>
            <b>ПОДАРОЧНЫЙ<br />СЕРТИФИКАТ</b>
            <i>⌁</i>
          </div>
        </div>
      </section>

      <section className={styles.contactBand} id="contacts">
        <div className={styles.contacts}>
          <p className={styles.darkKicker}>ЗАХОДИТЕ В МАСТЕРСКУЮ</p>
          <h2>Приходите знакомиться с глиной</h2>
          <p>◷ Вт-Вс: 10:00-21:00</p>
          <p>⌖ ул. Мастеров, 12 · Киев</p>
          <a
            className={styles.contactButton}
            href="https://www.google.com/maps/search/?api=1&query=Kyiv"
            target="_blank"
            rel="noreferrer"
          >
            Построить маршрут
          </a>
          <div className={styles.socials}>
            <span>◎</span><span>f</span><span>↗</span><span>◉</span>
          </div>
        </div>

        <div className={styles.map} aria-label="Декоративная карта">
          <div className={styles.roadOne} />
          <div className={styles.roadTwo} />
          <div className={styles.roadThree} />
          <div className={styles.mapPin}>●</div>
          <div className={styles.mapLabel}>
            <strong>TERRA</strong>
            <small>CERAMICS STUDIO</small>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© 2026 TERRA Ceramics Studio</span>
        <span>Сайт и система управления созданы на OneStudio OS</span>
        <span>Фото для демо: Pexels</span>
      </footer>

      {bookingDone ? (
        <div className={styles.toast} role="status">
          <strong>Место почти ваше ✦</strong>
          <span>
            Демо-бронирование для «{selectedClass}» принято. В реальном
            шаблоне здесь подключается OneStudio Booking.
          </span>
        </div>
      ) : null}
    </main>
  );
}
