"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DemoVisual from "@/components/marketing/DemoVisual";
import MarketingBrand from "@/components/marketing/MarketingBrand";
import { DEMOS, PREMIUM_DEMOS, type DemoGroup } from "@/lib/demo-catalog";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import styles from "./DemosPage.module.css";

type Lang = "ru" | "en";
type Filter = "all" | DemoGroup;

const copy = {
  ru: {
    eyebrow: "КАТАЛОГ ГОТОВЫХ СИСТЕМ",
    title: <>Найдите бизнес, <strong>похожий на ваш.</strong></>,
    lead: "Выберите не просто оформление, а готовую логику работы: услуги, расписание, бронирование, оплату и панель управления.",
    login: "Войти",
    view: "Посмотреть демо",
    configure: "Настроить под себя",
    premiumEyebrow: "Premium Collection",
    premiumLead: "Сайты с авторским дизайном, сложной анимацией и расширенной интерактивностью.",
    premiumLabel: "Premium",
    premiumView: "Смотреть демо",
    footer: "Вы сможете изменить название, цвета, языки, услуги и модули на следующем шаге.",
    filters: [
      ["all", "Все демо"],
      ["studio", "Студии"],
      ["beauty", "Красота"],
      ["wellness", "Здоровье и уход"],
      ["education", "Обучение"],
      ["events", "События"],
    ] as [Filter, string][],
  },
  en: {
    eyebrow: "READY BUSINESS SYSTEMS",
    title: <>Find a business <strong>that feels like yours.</strong></>,
    lead: "Choose more than a look. Start with a working structure for services, scheduling, booking, payments and management.",
    login: "Sign in",
    view: "View demo",
    configure: "Customize",
    premiumEyebrow: "Premium Collection",
    premiumLead: "Websites with art-directed design, sophisticated motion and extended interactivity.",
    premiumLabel: "Premium",
    premiumView: "View demo",
    footer: "You can change the name, colors, languages, services and modules in the next step.",
    filters: [
      ["all", "All demos"],
      ["studio", "Studios"],
      ["beauty", "Beauty"],
      ["wellness", "Wellness & care"],
      ["education", "Education"],
      ["events", "Events"],
    ] as [Filter, string][],
  },
} as const;

export default function DemosPage() {
  const [lang, setLang] = useState<Lang>("ru");
  const [filter, setFilter] = useState<Filter>("all");
  const t = copy[lang];
  const demos = useMemo(
    () => filter === "all" ? DEMOS : DEMOS.filter((demo) => demo.group === filter),
    [filter],
  );
  const premiumDemos = useMemo(
    () => filter === "all" ? PREMIUM_DEMOS : PREMIUM_DEMOS.filter((demo) => demo.group === filter),
    [filter],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <MarketingBrand />
        <div className={styles.headerActions}>
          <div className="os-lang" aria-label={lang === "ru" ? "Язык" : "Language"}>
            <button className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>RU</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          <Link className={styles.login} href="/login">{t.login}</Link>
        </div>
      </header>

      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1>{t.title}</h1>
        </div>
        <p className={styles.introText}>{t.lead}</p>
      </section>

      <div className={styles.filters} aria-label={lang === "ru" ? "Фильтры демо" : "Demo filters"}>
        {t.filters.map(([value, label]) => (
          <button
            type="button"
            className={filter === value ? styles.active : ""}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>

      {premiumDemos.length > 0 ? (
        <section className={styles.premium} aria-labelledby="premium-collection-title">
          <div className={styles.premiumHeading}>
            <p className={styles.premiumEyebrow}>01 / {t.premiumEyebrow}</p>
            <div>
              <h2 id="premium-collection-title">{t.premiumEyebrow}</h2>
              <p>{t.premiumLead}</p>
            </div>
          </div>
          {premiumDemos.map((demo, index) => (
            <article className={styles.premiumCard} data-premium={demo.slug} key={demo.slug}>
              <Link className={styles.premiumVisual} href={demo.href} aria-label={`${t.premiumView}: ${demo.name}`}>
                <Image
                  src={demo.previewImage}
                  alt={demo.previewAlt[lang]}
                  fill
                  sizes="(max-width: 900px) 100vw, 66vw"
                />
                <span aria-hidden="true">{demo.slug === "premium-studio" ? "NF" : "BM"} / 0{index + 1}</span>
              </Link>
              <div className={styles.premiumCopy}>
                <div className={styles.premiumMeta}>
                  <span>{t.premiumLabel}</span>
                  <span>{demo.title[lang]}</span>
                </div>
                <div>
                  <h3>{demo.name}</h3>
                  <p>{demo.description[lang]}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link className={styles.premiumAction} href={demo.href}>{t.premiumView} <span aria-hidden="true">↗</span></Link>
                  <Link className={styles.premiumAction} href={newSitePathForTemplate(demo.slug)}>{lang === "ru" ? "Использовать этот шаблон" : "Use this template"}</Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section className={styles.grid}>
        {demos.map((demo) => (
          <article className={styles.card} key={demo.slug}>
            <Link className={styles.previewLink} href={`/demos/${demo.slug}`}>
              <DemoVisual demo={demo} lang={lang} compact />
            </Link>
            <div className={styles.cardInfo}>
              <div>
                <p className={styles.kind}>{demo.title[lang]}</p>
                <h2>{demo.name}</h2>
                <p className={styles.description}>{demo.description[lang]}</p>
              </div>
              <div className={styles.actions}>
                <Link href={`/demos/${demo.slug}`}>{t.view}</Link>
                <Link href={newSitePathForTemplate(demo.slug === "lumiere" ? "gloss-nail-studio" : "standard")}>{lang === "ru" ? "Использовать этот шаблон" : "Use this template"} ↗</Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>{t.footer}</footer>
    </main>
  );
}
