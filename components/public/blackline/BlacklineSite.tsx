"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import styles from "./Blackline.module.css";

const tattooStyles = [
  {
    name: "Fine Line",
    note: "Тонкие линии · деликатная графика",
    image: "/images/demos/black-ink.webp",
  },
  {
    name: "Blackwork",
    note: "Графика · контраст · плотный чёрный",
    image: "/images/demos/premium-studio/noir-frame-campaign.webp",
  },
  {
    name: "Realism",
    note: "Портреты · фактура · точные детали",
    image: "/images/demos/premium-studio/noir-frame-portrait.webp",
  },
  {
    name: "Minimal",
    note: "Чистая идея · воздух · без лишнего",
    image: "/images/demos/premium-studio/noir-frame-campaign-alt.webp",
  },
];

const artists = [
  {
    name: "Алекс Ворон",
    style: "Blackwork · Graphic",
    image: "/images/demos/premium-studio/noir-frame-portrait.webp",
  },
  {
    name: "Мира Лейн",
    style: "Fine Line · Botanica",
    image: "/images/demos/premium-studio/noir-frame-portrait-alt.webp",
  },
  {
    name: "Дан Марк",
    style: "Realism · Dark",
    image: "/images/demos/premium-studio/noir-frame-campaign.webp",
  },
  {
    name: "Ника Рэй",
    style: "Minimal · Lettering",
    image: "/images/demos/premium-studio/noir-frame-campaign-alt.webp",
  },
];

type GalleryCategory = "Все" | "Fine Line" | "Blackwork" | "Realism" | "Minimal";

const gallery: {
  category: Exclude<GalleryCategory, "Все">;
  image: string;
  alt: string;
}[] = [
  {
    category: "Blackwork",
    image: "/images/demos/black-ink.webp",
    alt: "Blackwork tattoo",
  },
  {
    category: "Fine Line",
    image: "/images/demos/premium-studio/noir-frame-portrait-alt.webp",
    alt: "Fine line tattoo mood",
  },
  {
    category: "Realism",
    image: "/images/demos/premium-studio/noir-frame-campaign.webp",
    alt: "Realism tattoo mood",
  },
  {
    category: "Minimal",
    image: "/images/demos/premium-studio/noir-frame-booking.webp",
    alt: "Minimal tattoo mood",
  },
  {
    category: "Blackwork",
    image: "/images/demos/premium-studio/noir-frame-light-night.webp",
    alt: "Dark tattoo work",
  },
  {
    category: "Fine Line",
    image: "/images/demos/premium-studio/noir-frame-portrait.webp",
    alt: "Fine line portrait mood",
  },
  {
    category: "Realism",
    image: "/images/demos/premium-studio/noir-frame-light-dusk.webp",
    alt: "Realism detail",
  },
  {
    category: "Minimal",
    image: "/images/demos/premium-studio/noir-frame-campaign-alt.webp",
    alt: "Minimal tattoo detail",
  },
];

const process = [
  [
    "01",
    "Знакомимся",
    "Обсуждаем идею, место, размер и характер будущей работы.",
  ],
  [
    "02",
    "Создаём эскиз",
    "Мастер собирает индивидуальный эскиз и согласовывает детали.",
  ],
  [
    "03",
    "Татуируем",
    "Работаем спокойно, стерильно и без спешки. Перерывы всегда возможны.",
  ],
  [
    "04",
    "Остаёмся на связи",
    "После сеанса отправляем памятку и отвечаем на вопросы по заживлению.",
  ],
];

const faqs = [
  [
    "Сколько стоит татуировка?",
    "Стоимость зависит от размера, детализации, зоны и времени мастера. После короткой консультации мы называем диапазон и фиксируем условия до бронирования.",
  ],
  [
    "Можно прийти со своим эскизом?",
    "Да. Мы можем сохранить вашу идею, доработать композицию или создать новый авторский эскиз на основе референсов.",
  ],
  [
    "Как подготовиться к сеансу?",
    "Накануне лучше выспаться, не употреблять алкоголь, поесть за 1–2 часа до визита и прийти в удобной одежде, открывающей нужную зону.",
  ],
  [
    "Что входит в предоплату?",
    "Предоплата закрепляет дату и работу мастера над эскизом. Финальные условия возврата и переноса всегда указываются до оплаты.",
  ],
];

export default function BlacklineSite() {
  const [category, setCategory] = useState<GalleryCategory>("Все");
  const [sent, setSent] = useState(false);

  const filteredGallery = useMemo(
    () =>
      category === "Все"
        ? gallery
        : gallery.filter((item) => item.category === category),
    [category],
  );

  function submitConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className={styles.site}>
      <div className={styles.announcement}>
        Консультация и разработка идеи · бесплатно
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="BLACKLINE · на главную">
          <span>BLACKLINE</span>
          <small>TATTOO COLLECTIVE</small>
        </a>

        <nav className={styles.nav} aria-label="Навигация BLACKLINE">
          <a href="#works">Работы</a>
          <a href="#artists">Мастера</a>
          <a href="#styles">Стили</a>
          <a href="#process">Как всё проходит</a>
          <a href="#care">Уход</a>
          <a href="#contact">Контакты</a>
        </nav>

        <a className={styles.outlineButton} href="#consultation">
          Обсудить татуировку
        </a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>TATTOO · ART · INDIVIDUALITY</p>
          <h1>
            Твоя история.
            <br />
            <span>Одной линией.</span>
          </h1>
          <p className={styles.heroLead}>
            Создаём авторские татуировки, которые остаются актуальными дольше
            любых трендов.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#artists">
              Выбрать мастера
            </a>
            <a className={styles.textLink} href="#works">
              Смотреть работы <span>↗</span>
            </a>
          </div>

          <div className={styles.trustLine}>
            <span>◇ Индивидуальный эскиз</span>
            <span>·</span>
            <span>стерильность</span>
            <span>·</span>
            <span>сопровождение после сеанса</span>
          </div>
        </div>

        <div className={styles.heroMedia}>
          <Image
            src="/images/demos/black-ink.webp"
            alt="BLACKLINE tattoo studio"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 56vw"
          />
          <div className={styles.heroShade} />
          <span className={styles.heroStamp}>BL / 01</span>
        </div>
      </section>

      <section className={styles.section} id="styles">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.index}>01 / STYLE</p>
            <h2>Найди свой стиль</h2>
          </div>
          <p>
            Не выбирайте татуировку из каталога. Выберите язык, на котором мастер
            расскажет вашу историю.
          </p>
        </div>

        <div className={styles.styleGrid}>
          {tattooStyles.map((item, index) => (
            <article className={styles.styleCard} key={item.name}>
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 700px) 100vw, 25vw"
              />
              <div className={styles.cardShade} />
              <span className={styles.cardNumber}>0{index + 1}</span>
              <div className={styles.cardCopy}>
                <h3>{item.name}</h3>
                <p>{item.note}</p>
              </div>
              <span className={styles.cardArrow}>↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.artistSection}`} id="artists">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.index}>02 / ARTISTS</p>
            <h2>Мастера BLACKLINE</h2>
          </div>
          <p>
            Четыре разных почерка. Один принцип: идея должна подходить человеку,
            а не ленте трендов.
          </p>
        </div>

        <div className={styles.artistGrid}>
          {artists.map((artist) => (
            <article className={styles.artistCard} key={artist.name}>
              <div className={styles.artistImage}>
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 700px) 100vw, 25vw"
                />
              </div>
              <div className={styles.artistInfo}>
                <p>{artist.style}</p>
                <h3>{artist.name}</h3>
                <a href="#consultation">
                  Портфолио <span>↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.worksSection}`} id="works">
        <div className={styles.worksHeader}>
          <div>
            <p className={styles.index}>03 / SELECTED WORK</p>
            <h2>Последние работы</h2>
          </div>

          <div className={styles.filters} aria-label="Фильтр работ">
            {(
              ["Все", "Fine Line", "Blackwork", "Realism", "Minimal"] as GalleryCategory[]
            ).map((item) => (
              <button
                type="button"
                className={category === item ? styles.activeFilter : ""}
                onClick={() => setCategory(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.gallery}>
          {filteredGallery.map((item, index) => (
            <figure
              className={`${styles.galleryItem} ${
                index % 5 === 0 ? styles.galleryWide : ""
              }`}
              key={`${item.category}-${item.image}`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 100vw, 40vw"
              />
              <figcaption>
                <span>{item.category}</span>
                <span>0{index + 1}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.consultation}`} id="consultation">
        <div className={styles.consultPanel}>
          <p className={styles.index}>04 / БЕСПЛАТНАЯ КОНСУЛЬТАЦИЯ</p>
          <h2>Расскажи, что хочешь сохранить</h2>
          <p className={styles.formLead}>
            Можно прийти с готовой идеей, несколькими референсами или одной
            фразой. Мы поможем собрать направление.
          </p>

          {sent ? (
            <div className={styles.success} role="status">
              <strong>Заявка принята в демо.</strong>
              <span>
                В рабочем сайте здесь подключается CRM OneStudio OS.
              </span>
            </div>
          ) : (
            <form className={styles.form} onSubmit={submitConsultation}>
              <label>
                <span>Имя</span>
                <input required placeholder="Ваше имя" />
              </label>

              <label>
                <span>Зона татуировки</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Выберите зону
                  </option>
                  <option>Рука</option>
                  <option>Спина</option>
                  <option>Грудь</option>
                  <option>Нога</option>
                  <option>Другая зона</option>
                </select>
              </label>

              <label>
                <span>Размер</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Выберите размер
                  </option>
                  <option>до 5 см</option>
                  <option>5–10 см</option>
                  <option>10–20 см</option>
                  <option>Большая работа</option>
                </select>
              </label>

              <label>
                <span>Стиль</span>
                <select defaultValue="">
                  <option value="" disabled>
                    Выберите стиль
                  </option>
                  <option>Fine Line</option>
                  <option>Blackwork</option>
                  <option>Realism</option>
                  <option>Minimal</option>
                </select>
              </label>

              <label>
                <span>Желаемая дата</span>
                <input type="date" />
              </label>

              <label className={styles.fullField}>
                <span>Опиши свою идею</span>
                <textarea
                  rows={4}
                  placeholder="Расскажите о задумке, смысле и пожеланиях..."
                />
              </label>

              <label className={`${styles.upload} ${styles.fullField}`}>
                <span>＋ Добавить референс</span>
                <small>JPG, PNG, PDF · до 10 МБ</small>
                <input type="file" accept="image/*,.pdf" />
              </label>

              <button
                className={`${styles.primaryButton} ${styles.submit}`}
                type="submit"
              >
                Отправить мастеру
              </button>
            </form>
          )}
        </div>

        <aside className={styles.processPanel} id="process">
          <p className={styles.index}>КАК ЭТО РАБОТАЕТ</p>
          <h3>От идеи до готовой работы</h3>

          <div className={styles.processList}>
            {process.map(([number, title, text]) => (
              <div className={styles.processItem} key={number}>
                <span className={styles.processNumber}>{number}</span>
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className={`${styles.section} ${styles.infoStrip}`} id="care">
        <article>
          <span className={styles.bigIcon}>▱</span>
          <div>
            <h3>Дата закрепляется после предоплаты</h3>
            <p>
              После согласования эскиза и мастера фиксируем дату и отправляем
              безопасную ссылку на оплату.
            </p>
            <a href="#faq">Как проходит оплата ↗</a>
          </div>
        </article>

        <article>
          <span className={styles.bigIcon}>◒</span>
          <div>
            <h3>Уход после сеанса</h3>
            <p>
              Персональные рекомендации мастера всегда будут доступны по вашей
              ссылке после визита.
            </p>
            <a href="#faq">Читать рекомендации ↗</a>
          </div>
        </article>
      </section>

      <section className={`${styles.section} ${styles.quoteSection}`}>
        <p className={styles.index}>05 / ДОВЕРИЕ</p>
        <blockquote>
          «Мастер услышал не только идею, но и то, что я не смог сформулировать.
          Получилось очень моё.»
        </blockquote>
        <div className={styles.quoteMeta}>
          <span>★★★★★</span>
          <p>Игорь · Москва · Blackwork</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faqSection}`} id="faq">
        <div>
          <p className={styles.index}>06 / FAQ</p>
          <h2>Перед первым сеансом</h2>
          <p>
            Без странных вопросов не бывает. Чем больше ясности до сеанса, тем
            спокойнее сам день.
          </p>
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

      <section className={`${styles.section} ${styles.contactSection}`} id="contact">
        <div className={styles.contactCard}>
          <p className={styles.index}>07 / CONTACT</p>
          <h2>Заходи познакомиться</h2>

          <div className={styles.contactRows}>
            <p>
              <span>Часы</span>
              Ежедневно · 11:00–21:00
            </p>
            <p>
              <span>Адрес</span>
              ул. Чёрная, 21
            </p>
            <p>
              <span>Телефон</span>
              +00 000 000 00 00
            </p>
          </div>

          <a className={styles.primaryButton} href="#consultation">
            Записаться на консультацию
          </a>

          <div className={styles.socials}>
            <a href="#contact">Instagram</a>
            <a href="#contact">Telegram</a>
            <a href="#contact">VK</a>
          </div>
        </div>

        <div className={styles.mapCard} aria-label="Демо-карта BLACKLINE">
          <div className={styles.mapGrid} />
          <div className={styles.pin}>
            <span>●</span>
            <strong>BLACKLINE</strong>
            <small>ул. Чёрная, 21</small>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.brand}>
          <span>BLACKLINE</span>
          <small>TATTOO COLLECTIVE</small>
        </div>

        <nav>
          <a href="#works">Работы</a>
          <a href="#artists">Мастера</a>
          <a href="#styles">Стили</a>
          <a href="#process">Процесс</a>
          <a href="#care">Уход</a>
          <a href="#contact">Контакты</a>
        </nav>

        <p>Сайт и система управления созданы на OneStudio OS</p>
      </footer>
    </main>
  );
}
