"use client";

import { useEffect, useState } from "react";
import LeadsGateForm from "./LeadsGateForm";
import JsonLd from "./JsonLd";
import { readSite } from "../lib/site";

const FAQ = [
  ["Is CashPath a lender?", "No. CashPath is not a lender and does not make credit decisions."],
  ["Does submitting a request guarantee approval?", "No. Eligibility and available offers are determined by participating providers."],
  ["Do I have to accept an offer?", "No. A request does not require you to accept an offer."],
  ["Who determines rates and fees?", "The provider determines rates, fees, and other terms."],
] as const;

function HeroPicture() {
  const site = readSite();
  if (!site.heroImagePath) return null;
  const sources = site.heroSources;
  return <picture>
    {sources ? <source type={sources.type} srcSet={sources.srcset} sizes={sources.sizes} /> : null}
    <img src={site.heroImagePath} alt="" width={sources?.width} height={sources?.height} fetchPriority="high" />
  </picture>;
}

const EXPLORE = [["About", "/p/about"], ["Contact", "/p/contact"], ["FAQ", "/p/faq"], ["Rates & Fees", "/p/rates-fees"], ["Responsible Lending", "/p/responsible-lending"], ["Guides", "/p/guides"]] as const;
const INFO = [["Privacy Policy", "/p/privacy-policy"], ["Terms of Use", "/p/terms-of-use"], ["E-Consent", "/p/e-consent"], ["Advertiser Disclosure", "/p/advertiser-disclosure"], ["Do Not Sell or Share My Personal Information", "/p/do-not-sell-share"], ["Disclaimer", "/p/disclaimer"]] as const;

export default function HomePage() {
  const site = readSite();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const scroll = () => document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>(".reveal")];
    const show = (node: HTMLElement) => {
      node.classList.add("is-shown");
      node.querySelectorAll<HTMLElement>(".stagger").forEach((item) => item.classList.add("is-shown"));
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(show);
      return;
    }
    const observers = nodes.map((node) => {
      const height = node.getBoundingClientRect().height || 1;
      const threshold = height > window.innerHeight ? Math.min(0.32, (window.innerHeight * 0.32) / height) : 0.32;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      }, { threshold });
      observer.observe(node);
      return observer;
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${site.canonicalOrigin}/#organization`, name: site.brandName, url: site.canonicalOrigin },
      { "@type": "WebSite", "@id": `${site.canonicalOrigin}/#website`, name: site.brandName, url: site.canonicalOrigin, publisher: { "@id": `${site.canonicalOrigin}/#organization` } },
      { "@type": "FAQPage", mainEntity: FAQ.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };
  return <main className="site">
    <JsonLd data={jsonLd} />
    <header className="header"><a className="brand" href="/">Cash<span>Path</span><i /></a><button className="menu" type="button" onClick={() => setOpen(!open)}>☰</button><nav className={open ? "open" : ""}><a href="#how">How It Works</a><a href="/p/faq">FAQ</a><a href="/p/about">About</a><button type="button" onClick={scroll}>Start Your Request</button></nav></header>
    <section id="top" className="hero"><div className="heroCopy"><p className="eyebrow">{site.hero.eyebrow}</p><h1>{site.hero.title}</h1><p>{site.hero.text}</p><button type="button" onClick={scroll}>Start your request →</button><div className="mini"><span>Online request</span><span>Review before accepting</span></div></div><div className="route"><HeroPicture /><svg viewBox="0 0 500 500"><path d="M40 430C110 330 175 410 220 280S350 90 470 70" /></svg></div></section>
    <div className="reveal"><section id="request" className="request"><div><p className="eyebrow">START YOUR REQUEST</p><h2>Explore your options.</h2><p>Complete a secure request to be considered by participating providers.</p></div>{site.form ? <div className="form"><section><div><p className="form-kicker">{site.form.eyebrow}</p><h2>{site.form.title}</h2><p>{site.form.text}</p><div><LeadsGateForm aid={site.form.aid} /></div></div></section></div> : null}</section></div>
    <div className="reveal"><section className="trust stagger">{["Online request", "No obligation to accept", "Review terms first", "Available offers vary"].map((text, index) => <div key={text}><b>0{index + 1}</b><span>{text}</span></div>)}</section></div>
    <div className="reveal"><section id="how" className="section"><p className="eyebrow">HOW IT WORKS</p><h2>Three simple steps.</h2><div className="steps stagger">{[["Request", "Submit your online request."], ["Connect", "You may be connected with providers."], ["Review", "Read terms before deciding."]].map(([title, text]) => <article key={title}><b>{title === "Request" ? "01" : title === "Connect" ? "02" : "03"}</b><h3>{title}</h3><p>{text}</p></article>)}</div></section></div>
    <div className="reveal"><section className="options"><p className="eyebrow">YOU STAY IN CONTROL</p><h2>Clear choices, your decision.</h2><div className="optionCards stagger">{[["Review before deciding", "See the provider's terms before accepting."], ["No obligation to accept", "A request does not require you to take an offer."], ["CashPath isn't the lender", "Rates, fees and credit decisions are determined by the provider."]].map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section></div>
    <div className="reveal"><section id="faq" className="section faq"><p className="eyebrow">FAQ</p><h2>Questions, answered clearly.</h2>{FAQ.map(([question, answer], index) => <article key={question}><button type="button" onClick={() => setActive(active === index ? -1 : index)}>{question}<span>{active === index ? "−" : "+"}</span></button>{active === index ? <p>{answer}</p> : null}</article>)}</section></div>
    <div className="reveal"><aside className="responsible">Borrowing comes with costs. Review all rates, fees and repayment terms before accepting an offer, and borrow only what you can reasonably repay. <a href="/p/responsible-lending">Responsible Lending →</a></aside></div>
    <div className="reveal"><section className="final"><p className="eyebrow">WHEN YOU'RE READY</p><h2>Ready to explore your options?</h2><button type="button" onClick={scroll}>Start Your Request →</button></section></div>
    <div className="reveal"><footer className="footer"><div><a className="brand" href="/">Cash<span>Path</span><i /></a><p>CashPath is not a lender and does not make credit decisions.</p></div><div><b>Explore</b>{EXPLORE.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div><div><b>Information</b>{INFO.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div><small>© {new Date().getFullYear()} CashPath.</small></footer></div>
  </main>;
}
