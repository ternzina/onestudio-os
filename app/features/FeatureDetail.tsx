"use client";

import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import { OneStudioFooter } from "@/components/marketing/OneStudioFooter";
import { useLocale } from "@/lib/i18n/use-locale";
import type { FeatureSeoEntry } from "@/lib/seo/features";
import styles from "./feature-detail.module.css";

export default function FeatureDetail({ feature }: { feature: FeatureSeoEntry }) {
  const [lang, setLang] = useLocale();
  return <main className={`${styles.page} os-site`}><section className={styles.hero}><MarketingHeader lang={lang} onLangChange={setLang} inFlow languageTone="light" /><div className={styles.heroInner}><p className="os-type-eyebrow">{feature.eyebrow}</p><h1 className="os-type-h1">{feature.h1}</h1><p className={styles.intro}>{feature.intro}</p><div className={styles.heroLinks}><Link href="/pricing">Start with OneStudio ↗</Link><Link href="/demos">See the product in context</Link></div></div></section><section className={styles.sections}>{feature.sections.map((section) => <article className={styles.section} key={section.title}><div><p className="os-type-eyebrow">{section.eyebrow}</p><h2 className="os-type-h2">{section.title}</h2><p>{section.body}</p></div><ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</section><section className={styles.connection}><p className="os-type-eyebrow">KEEP EXPLORING</p><h2 className="os-type-h2">A connected system for the way service businesses work</h2><div className={styles.linkGrid}>{feature.links.map((link) => <Link href={link.href} key={link.href}>{link.label} ↗</Link>)}</div></section><section className={styles.faq}><p className="os-type-eyebrow">QUESTIONS</p>{feature.faqs.map((faq) => <div key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}</section><section className={styles.cta}><h2 className="os-type-h2">Build the public experience and the operational flow together.</h2><Link href="/pricing">See pricing ↗</Link></section><OneStudioFooter lang={lang}/></main>;
}
