"use client";

import { useState } from "react";
import LeadsGateForm from "./LeadsGateForm";
import JsonLd from "./JsonLd";
import { readSite } from "../lib/site";

const FAQ = [
  ["Is CashPath a lender?", "No. CashPath is not a lender and does not make credit decisions."],
  ["Does submitting a request guarantee approval?", "No. Eligibility and available offers are determined by participating providers."],
  ["Do I have to accept an offer?", "No. A request does not require you to accept an offer."],
  ["Who determines rates and fees?", "The provider determines rates, fees, and other terms."],
] as const;

const EXPLORE = [["About", "/p/about"], ["Contact", "/p/contact"], ["FAQ", "/p/faq"], ["Rates & Fees", "/p/rates-fees"], ["Responsible Lending", "/p/responsible-lending"], ["Guides", "/p/guides"]] as const;
const INFO = [["Privacy Policy", "/p/privacy-policy"], ["Terms of Use", "/p/terms-of-use"], ["E-Consent", "/p/e-consent"], ["Advertiser Disclosure", "/p/advertiser-disclosure"], ["Do Not Sell or Share My Personal Information", "/p/do-not-sell-share"], ["Disclaimer", "/p/disclaimer"]] as const;

export default function HomePage() {
  const site = readSite();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const scroll = () => document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
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
    <section id="top" className="hero"><div className="heroCopy"><p className="eyebrow">{site.hero.eyebrow}</p><h1>{site.hero.title}</h1><p>{site.hero.text}</p><button type="button" onClick={scroll}>Start your request →</button><div className="mini"><span>Online request</span><span>Review before accepting</span></div></div><div className="route">{site.heroImagePath ? <img src={site.heroImagePath} alt="" /> : null}<svg viewBox="0 0 500 500"><path d="M40 430C110 330 175 410 220 280S350 90 470 70" /></svg></div></section>
    <section id="request" className="request"><div><p className="eyebrow">START YOUR REQUEST</p><h2>Explore your options.</h2><p>Complete a secure request to be considered by participating providers.</p></div>{site.form ? <div className="form"><LeadsGateForm aid={site.form.aid} /></div> : null}</section>
    <section className="trust">{["Online request", "No obligation to accept", "Review terms first", "Available offers vary"].map((text, index) => <div key={text}><b>0{index + 1}</b><span>{text}</span></div>)}</section>
    <section id="how" className="section"><p className="eyebrow">HOW IT WORKS</p><h2>Three simple steps.</h2><div className="steps">{[["Request", "Submit your online request."], ["Connect", "You may be connected with providers."], ["Review", "Read terms before deciding."]].map(([title, text]) => <article key={title}><b>{title === "Request" ? "01" : title === "Connect" ? "02" : "03"}</b><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="options"><p className="eyebrow">YOU STAY IN CONTROL</p><h2>Clear choices, your decision.</h2><div className="optionCards">{[["Review before deciding", "See the provider's terms before accepting."], ["No obligation to accept", "A request does not require you to take an offer."], ["CashPath isn't the lender", "Rates, fees and credit decisions are determined by the provider."]].map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="faq" className="section faq"><p className="eyebrow">FAQ</p><h2>Questions, answered clearly.</h2>{FAQ.map(([question, answer], index) => <article key={question}><button type="button" onClick={() => setActive(active === index ? -1 : index)}>{question}<span>{active === index ? "−" : "+"}</span></button>{active === index ? <p>{answer}</p> : null}</article>)}</section>
    <aside className="responsible">Borrowing comes with costs. Review all rates, fees and repayment terms before accepting an offer, and borrow only what you can reasonably repay. <a href="/p/responsible-lending">Responsible Lending →</a></aside>
    <section className="final"><p className="eyebrow">WHEN YOU'RE READY</p><h2>Ready to explore your options?</h2><button type="button" onClick={scroll}>Start Your Request →</button></section>
    <footer className="footer"><div><a className="brand" href="/">Cash<span>Path</span><i /></a><p>CashPath is not a lender and does not make credit decisions.</p></div><div><b>Explore</b>{EXPLORE.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div><div><b>Information</b>{INFO.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div><small>© {new Date().getFullYear()} CashPath.</small></footer>
  </main>;
}
