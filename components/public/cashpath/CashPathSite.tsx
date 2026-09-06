"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import type { PremiumTemplatePublicHomeRendererProps } from "@/lib/public-site/premium-template-runtime-adapter";
import styles from "./CashPathSite.module.css";

const faq = [["Is CashPath a lender?", "No. CashPath is not a lender and does not make credit decisions."], ["Does submitting a request guarantee approval?", "No. Eligibility and available offers are determined by participating providers."], ["Do I have to accept an offer?", "No. A request does not require you to accept an offer."], ["Who determines rates and fees?", "The provider determines rates, fees, and other terms."]];

function CashPathReveal({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return <motion.div initial={reducedMotion ? false : { opacity: 0, y: 32 }} whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export default function CashPathSite({ site, basePath }: PremiumTemplatePublicHomeRendererProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const form = site.content.custom_blocks?.find((block) => block.kind === "leadsgate_form");
  const scroll = () => document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
  const page = (slug: string) => `${basePath === "/" ? "" : basePath}/p/${slug}`;
  return <main className={styles.site}>
    <header className={styles.header}><a className={styles.brand} href="#top">Cash<span>Path</span><i /></a><button className={styles.menu} onClick={() => setOpen(!open)}>☰</button><nav className={open ? styles.open : ""}>{[["How It Works", "#how"], ["FAQ", page("faq")], ["About", page("about")]].map(([text, href]) => <a key={href} href={href}>{text}</a>)}<button onClick={scroll}>Start Your Request</button></nav></header>
    <section id="top" className={styles.hero}><div className={styles.heroCopy}><p className={styles.eyebrow}>{site.content.hero_eyebrow}</p><h1>{site.content.hero_title}</h1><p>{site.content.hero_text}</p><button onClick={scroll}>Start your request →</button><div className={styles.mini}><span>Online request</span><span>Review before accepting</span></div></div><div className={styles.route}><img src="/templates/cashpath/hero-woman-wide-v2.png" alt="" /><svg viewBox="0 0 500 500"><path d="M40 430C110 330 175 410 220 280S350 90 470 70" /></svg></div></section>
    <CashPathReveal><section id="request" className={styles.request}><div><p className={styles.eyebrow}>START YOUR REQUEST</p><h2>Explore your options.</h2><p>Complete a secure request to be considered by participating providers.</p></div>{form && <div className={styles.form}><PublicCustomBlock block={form} preview={site.business.id === "cashpath-demo"} /></div>}</section></CashPathReveal>
    <CashPathReveal><section className={styles.trust}>{["Online request", "No obligation to accept", "Review terms first", "Available offers vary"].map((text, index) => <div key={text}><b>0{index + 1}</b><span>{text}</span></div>)}</section></CashPathReveal>
    <CashPathReveal><section id="how" className={styles.section}><p className={styles.eyebrow}>HOW IT WORKS</p><h2>Three simple steps.</h2><div className={styles.steps}>{[["Request", "Submit your online request."], ["Connect", "You may be connected with providers."], ["Review", "Read terms before deciding."]].map(([title, text], index) => <article key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{text}</p></article>)}</div></section></CashPathReveal>
    <CashPathReveal><section className={styles.options}><p className={styles.eyebrow}>YOU STAY IN CONTROL</p><h2>Clear choices, your decision.</h2><div className={styles.optionCards}>{[["Review before deciding", "See the provider's terms before accepting."], ["No obligation to accept", "A request does not require you to take an offer."], ["CashPath isn't the lender", "Rates, fees and credit decisions are determined by the provider."]].map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section></CashPathReveal>
    <CashPathReveal><section id="faq" className={`${styles.section} ${styles.faq}`}><p className={styles.eyebrow}>FAQ</p><h2>Questions, answered clearly.</h2>{faq.map(([question, answer], index) => <article key={question}><button onClick={() => setActive(active === index ? -1 : index)}>{question}<span>{active === index ? "−" : "+"}</span></button>{active === index && <p>{answer}</p>}</article>)}</section></CashPathReveal>
    <CashPathReveal><aside className={styles.responsible}>Borrowing comes with costs. Review all rates, fees and repayment terms before accepting an offer, and borrow only what you can reasonably repay. <a href={page("responsible-lending")}>Responsible Lending →</a></aside></CashPathReveal>
    <CashPathReveal><section className={styles.final}><p className={styles.eyebrow}>WHEN YOU'RE READY</p><h2>Ready to explore your options?</h2><button onClick={scroll}>Start Your Request →</button></section></CashPathReveal>
    <CashPathReveal><footer id="about" className={styles.footer}><div><a className={styles.brand} href="#top">Cash<span>Path</span><i /></a><p>CashPath is not a lender and does not make credit decisions.</p></div><div><b>Explore</b>{[["About", "about"], ["Contact", "contact"], ["FAQ", "faq"], ["Rates & Fees", "rates-fees"], ["Responsible Lending", "responsible-lending"]].map(([text, slug]) => <a key={slug} href={page(slug)}>{text}</a>)}</div><div><b>Information</b>{[["Privacy Policy", "privacy-policy"], ["Terms of Use", "terms-of-use"], ["E-Consent", "e-consent"], ["Advertiser Disclosure", "advertiser-disclosure"], ["Do Not Sell or Share My Personal Information", "do-not-sell-share"], ["Disclaimer", "disclaimer"]].map(([text, slug]) => <a key={slug} href={page(slug)}>{text}</a>)}</div><small>© {new Date().getFullYear()} CashPath.</small></footer></CashPathReveal>
  </main>;
}
