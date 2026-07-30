"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DemoVisual from "@/components/marketing/DemoVisual";
import MarketingBrand from "@/components/marketing/MarketingBrand";
import type { DemoDefinition } from "@/lib/demo-catalog";
import { supabase } from "@/lib/supabase";
import styles from "./Configurator.module.css";

const steps = ["Демо", "Бренд", "Дизайн", "Модули", "Языки", "Оплата", "Запуск"] as const;
const languageChoices = ["Русский", "English", "Українська", "Polski"];
const currencyChoices = ["EUR", "USD", "PLN", "UAH"];

export default function ConfiguratorClient({ demo }: { demo: DemoDefinition }) {
  const storageKey = `onestudio-config:v1:${demo.slug}`;
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState(demo.businessName);
  const [tagline, setTagline] = useState(demo.promise.ru);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [modules, setModules] = useState<string[]>([...demo.modules]);
  const [languages, setLanguages] = useState<string[]>([...demo.defaultLanguages]);
  const [currency, setCurrency] = useState(demo.currency);
  const [onlinePayment, setOnlinePayment] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [phonePreview, setPhonePreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setAuthenticated(Boolean(data.user));
    });

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const config = JSON.parse(stored) as {
        businessName?: string;
        tagline?: string;
        paletteIndex?: number;
        modules?: string[];
        languages?: string[];
        primaryLanguage?: string;
        currency?: string;
        onlinePayment?: boolean;
        reminders?: boolean;
      };
      if (config.businessName) setBusinessName(config.businessName);
      if (config.tagline) setTagline(config.tagline);
      if (typeof config.paletteIndex === "number") setPaletteIndex(config.paletteIndex);
      if (config.modules?.length) setModules(config.modules);
      if (config.languages?.length) {
        const orderedLanguages = config.primaryLanguage && config.languages.includes(config.primaryLanguage)
          ? [config.primaryLanguage, ...config.languages.filter((item) => item !== config.primaryLanguage)]
          : config.languages;
        setLanguages(orderedLanguages);
      }
      if (config.currency) setCurrency(config.currency);
      if (typeof config.onlinePayment === "boolean") setOnlinePayment(config.onlinePayment);
      if (typeof config.reminders === "boolean") setReminders(config.reminders);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    setSaved(false);
  }, [businessName, tagline, paletteIndex, modules, languages, currency, onlinePayment, reminders]);

  const palette = demo.palettes[paletteIndex] || demo.palettes[0];
  const summary = useMemo(() => ({
    demo: `${demo.name} · ${demo.title.ru}`,
    brand: businessName,
    design: palette.name,
    modules: modules.join(", "),
    languages: languages.map((language, index) =>
      index === 0 ? `${language} (основной)` : language,
    ).join(", "),
    payment: `${currency} · ${onlinePayment ? "онлайн-оплата включена" : "без онлайн-оплаты"}`,
  }), [businessName, currency, demo, languages, modules, onlinePayment, palette.name]);

  function toggleItem(value: string, values: string[], setValues: (next: string[]) => void) {
    if (values.includes(value)) {
      if (values.length === 1) return;
      setValues(values.filter((item) => item !== value));
      return;
    }
    setValues([...values, value]);
  }

  function makePrimaryLanguage(language: string) {
    if (!languages.includes(language) || languages[0] === language) return;
    setLanguages([language, ...languages.filter((item) => item !== language)]);

    if (tagline === demo.promise.ru || tagline === demo.promise.en) {
      setTagline(
        language === "English"
          ? demo.promise.en
          : language === "Русский"
            ? demo.promise.ru
            : businessName,
      );
    }
  }

  function toggleLanguage(language: string) {
    if (languages.includes(language)) {
      if (languages.length === 1) return;
      const next = languages.filter((item) => item !== language);
      setLanguages(next);
      if (languages[0] === language && (tagline === demo.promise.ru || tagline === demo.promise.en)) {
        setTagline(
          next[0] === "English"
            ? demo.promise.en
            : next[0] === "Русский"
              ? demo.promise.ru
              : businessName,
        );
      }
      return;
    }
    setLanguages([...languages, language]);
  }

  function saveConfiguration() {
    const configuration = {
      launchId: window.crypto.randomUUID(),
      demoSlug: demo.slug,
      businessName,
      tagline,
      paletteIndex,
      modules,
      languages,
      primaryLanguage: languages[0],
      currency,
      onlinePayment,
      reminders,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(configuration));
    window.localStorage.setItem("onestudio-config:pending", JSON.stringify(configuration));
    setSaved(true);
  }

  const content = [
    {
      title: "Основа вашего проекта",
      lead: "Мы начинаем с готовой логики выбранного бизнеса. Позже демо можно сменить, а все настройки — отредактировать.",
      body: (
        <div className={styles.choiceCard}>
          <span className={styles.choiceDot}>{demo.name.slice(0, 1)}</span>
          <div><strong>{demo.name}</strong><span>{demo.title.ru}</span></div>
          <Link className={styles.change} href="/demos">Сменить</Link>
        </div>
      ),
    },
    {
      title: "Название и характер",
      lead: "Введите рабочее название. Оно сразу появится в предпросмотре сайта; окончательно всё можно поменять после запуска.",
      body: (
        <>
          <label className={styles.field}>
            <span>Название бизнеса</span>
            <input maxLength={70} value={businessName} onChange={(event) => setBusinessName(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Главная фраза</span>
            <input maxLength={90} value={tagline} onChange={(event) => setTagline(event.target.value)} />
          </label>
        </>
      ),
    },
    {
      title: "Выберите палитру",
      lead: "Каждое демо имеет несколько готовых сочетаний. Палитра меняет впечатление, но не ломает структуру и читаемость.",
      body: (
        <div className={styles.paletteGrid}>
          {demo.palettes.map((item, index) => (
            <button
              type="button"
              className={`${styles.palette} ${paletteIndex === index ? styles.active : ""}`}
              onClick={() => setPaletteIndex(index)}
              aria-pressed={paletteIndex === index}
              key={item.name}
            >
              <strong>{item.name}</strong>
              <span className={styles.swatches}>
                <i style={{ background: item.surface }} />
                <i style={{ background: item.accent }} />
                <i style={{ background: item.dark }} />
              </span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Что будет в системе",
      lead: "Готовый набор подобран для этого бизнеса. Отключите лишнее или оставьте всё — зависимости модулей проверим перед созданием проекта.",
      body: (
        <div className={styles.checkList}>
          {demo.modules.map((module) => (
            <label className={styles.check} key={module}>
              <input
                type="checkbox"
                checked={modules.includes(module)}
                onChange={() => toggleItem(module, modules, setModules)}
              />
              <span>{module}</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      title: "Языки сайта",
      lead: "Первый язык будет основным и опубликуется сразу. Остальные создадим как отдельные черновики, чтобы вы проверили тексты перед публикацией.",
      body: (
        <div className={styles.checkList}>
          {languageChoices.map((language) => {
            const selected = languages.includes(language);
            const primary = languages[0] === language;
            return (
              <div className={styles.languageRow} key={language}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleLanguage(language)}
                  />
                  <span>{language}</span>
                </label>
                {primary ? (
                  <span className={styles.primaryBadge}>Основной</span>
                ) : selected ? (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => makePrimaryLanguage(language)}
                  >
                    Сделать основным
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "Оплата и напоминания",
      lead: "На этом шаге выбирается логика. Ключи платёжного и почтового сервиса владелец подключит безопасно уже в своём пространстве.",
      body: (
        <>
          <label className={styles.field}>
            <span>Основная валюта</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {currencyChoices.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className={styles.toggle}>
            <span><strong>Онлайн-оплата</strong><span>Оплата бронирований и заказов</span></span>
            <input type="checkbox" checked={onlinePayment} onChange={(event) => setOnlinePayment(event.target.checked)} />
          </label>
          <label className={styles.toggle}>
            <span><strong>Письма и напоминания</strong><span>Подтверждения и сообщения клиентам</span></span>
            <input type="checkbox" checked={reminders} onChange={(event) => setReminders(event.target.checked)} />
          </label>
        </>
      ),
    },
    {
      title: "Конфигурация готова",
      lead: "Проверьте выбранную основу. После регистрации OneStudio создаст для вас отдельное рабочее пространство с выбранными модулями и языками.",
      body: (
        <>
          <div className={styles.summary}>
            <div><span>Демо</span><b>{summary.demo}</b></div>
            <div><span>Бренд</span><b>{summary.brand}</b></div>
            <div><span>Дизайн</span><b>{summary.design}</b></div>
            <div><span>Модули</span><b>{summary.modules}</b></div>
            <div><span>Языки</span><b>{summary.languages}</b></div>
            <div><span>Оплата</span><b>{summary.payment}</b></div>
          </div>
          {saved ? (
            <p className={styles.saved}>
              Готово. Конфигурация сохранена. Теперь можно создать своё рабочее пространство.
            </p>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <MarketingBrand />
        <Link className={styles.exit} href={`/demos/${demo.slug}`}>Закрыть настройку</Link>
      </header>

      <div className={styles.layout}>
        <nav className={styles.steps} aria-label="Шаги настройки">
          <p className={styles.stepsLabel}>Настройка проекта</p>
          {steps.map((label, index) => (
            <button
              type="button"
              className={`${styles.step} ${step === index ? styles.active : ""} ${step > index ? styles.done : ""}`}
              onClick={() => setStep(index)}
              key={label}
            >
              <i>{step > index ? "✓" : index + 1}</i>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className={styles.panel}>
          <p className={styles.count}>ШАГ {step + 1} ИЗ {steps.length}</p>
          <h1>{content[step].title}</h1>
          <p className={styles.lead}>{content[step].lead}</p>
          {content[step].body}
          <div className={styles.buttons}>
            {step > 0 ? <button type="button" onClick={() => setStep(step - 1)}>Назад</button> : null}
            {step < steps.length - 1 ? (
              <button type="button" onClick={() => setStep(step + 1)}>Продолжить →</button>
            ) : (
              <>
                <button type="button" onClick={saveConfiguration}>Сохранить конфигурацию</button>
                {saved ? (
                  <Link href={authenticated ? "/launch" : "/register?source=configurator"}>
                    Создать рабочее пространство →
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </section>

        <aside className={styles.preview}>
          <div className={styles.previewTop}>
            <span>Живой предпросмотр</span>
            <div className={styles.device}>
              <button type="button" aria-pressed={!phonePreview} className={!phonePreview ? styles.active : ""} onClick={() => setPhonePreview(false)}>Компьютер</button>
              <button type="button" aria-pressed={phonePreview} className={phonePreview ? styles.active : ""} onClick={() => setPhonePreview(true)}>Телефон</button>
            </div>
          </div>
          <div className={`${styles.previewFrame} ${phonePreview ? styles.phoneFrame : ""}`}>
            <DemoVisual
              demo={{ ...demo, promise: { ...demo.promise, ru: tagline || demo.promise.ru } }}
              palette={palette}
              businessName={businessName || demo.businessName}
              phone={phonePreview}
            />
          </div>
          <p className={styles.previewNote}>Предпросмотр показывает направление. Контент и страницы подробно редактируются после создания проекта.</p>
        </aside>
      </div>
    </main>
  );
}
