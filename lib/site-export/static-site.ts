import { readFileSync } from "node:fs";
import path from "node:path";
import { absoluteUrl, escapeHtml, jsonLdScript } from "./html.ts";
import { breadcrumbJsonLd, cashPathFooter, homeJsonLd, pageJsonLd } from "./snapshot.ts";
import type { ExportFile, ExportPage, SiteSnapshot } from "./types.ts";

const FAQ = [
  ["Is CashPath a lender?", "No. CashPath is not a lender and does not make credit decisions."],
  ["Does submitting a request guarantee approval?", "No. Eligibility and available offers are determined by participating providers."],
  ["Do I have to accept an offer?", "No. A request does not require you to accept an offer."],
  ["Who determines rates and fees?", "The provider determines rates, fees, and other terms."],
];

function documentShell(snapshot: SiteSnapshot, options: { title: string; description: string; path: string; noIndex: boolean; body: string; jsonLd?: unknown }): string {
  const canonical = absoluteUrl(snapshot.canonicalOrigin, options.path);
  const robots = options.noIndex || snapshot.noIndex ? "noindex, nofollow" : "index, follow";
  const icon = snapshot.faviconPath ? `<link rel="icon" href="${escapeHtml(snapshot.faviconPath)}">` : "";
  return `<!doctype html>
<html lang="${escapeHtml(snapshot.locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(options.title)}</title>
<meta name="description" content="${escapeHtml(options.description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta name="robots" content="${robots}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(options.title)}">
<meta property="og:description" content="${escapeHtml(options.description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
${icon}
<link rel="stylesheet" href="/assets/site.css">
${jsonLdScript(options.jsonLd)}
</head>
<body>
${options.body}
<script src="/assets/site.js" defer></script>
</body>
</html>`;
}

function footer(snapshot: SiteSnapshot): string {
  const links = cashPathFooter(snapshot);
  const column = (title: string, items: Array<[string, string]>) => `<div><b>${title}</b>${items.map(([label, slug]) => `<a href="${slug === "guides" ? "/p/guides" : `/p/${slug}`}">${escapeHtml(label)}</a>`).join("")}</div>`;
  return `<footer class="footer"><div><a class="brand" href="/">Cash<span>Path</span><i></i></a><p>CashPath is not a lender and does not make credit decisions.</p></div>${column("Explore", links.explore)}${column("Information", links.info)}<small>© ${new Date().getFullYear()} CashPath.</small></footer>`;
}

function cashpathHome(snapshot: SiteSnapshot): string {
  const image = snapshot.heroImagePath ? `<img src="${escapeHtml(snapshot.heroImagePath)}" alt="">` : "";
  const form = snapshot.form ? `<div class="form"><div data-leadsgate-aid="${escapeHtml(snapshot.form.aid)}" data-leadsgate-template="wallet-lines"></div></div>` : "";
  const faq = FAQ.map(([question, answer], index) => `<article data-faq><button type="button">${escapeHtml(question)}<span>${index === 0 ? "−" : "+"}</span></button><p data-answer ${index === 0 ? "" : "hidden"}>${escapeHtml(answer)}</p></article>`).join("");
  return `<main class="site">
<header class="header"><a class="brand" href="/">Cash<span>Path</span><i></i></a><button class="menu" type="button" data-menu-toggle>☰</button><nav data-menu><a href="#how">How It Works</a><a href="/p/faq">FAQ</a><a href="/p/about">About</a><button type="button" data-scroll="request">Start Your Request</button></nav></header>
<section id="top" class="hero"><div class="heroCopy"><p class="eyebrow">${escapeHtml(snapshot.hero.eyebrow)}</p><h1>${escapeHtml(snapshot.hero.title)}</h1><p>${escapeHtml(snapshot.hero.text)}</p><button type="button" data-scroll="request">Start your request →</button><div class="mini"><span>Online request</span><span>Review before accepting</span></div></div><div class="route">${image}<svg viewBox="0 0 500 500"><path d="M40 430C110 330 175 410 220 280S350 90 470 70" /></svg></div></section>
<section id="request" class="request"><div><p class="eyebrow">START YOUR REQUEST</p><h2>Explore your options.</h2><p>Complete a secure request to be considered by participating providers.</p></div>${form}</section>
<section class="trust"><div><b>01</b><span>Online request</span></div><div><b>02</b><span>No obligation to accept</span></div><div><b>03</b><span>Review terms first</span></div><div><b>04</b><span>Available offers vary</span></div></section>
<section id="how" class="section"><p class="eyebrow">HOW IT WORKS</p><h2>Three simple steps.</h2><div class="steps"><article><b>01</b><h3>Request</h3><p>Submit your online request.</p></article><article><b>02</b><h3>Connect</h3><p>You may be connected with providers.</p></article><article><b>03</b><h3>Review</h3><p>Read terms before deciding.</p></article></div></section>
<section class="options"><p class="eyebrow">YOU STAY IN CONTROL</p><h2>Clear choices, your decision.</h2><div class="optionCards"><article><h3>Review before deciding</h3><p>See the provider's terms before accepting.</p></article><article><h3>No obligation to accept</h3><p>A request does not require you to take an offer.</p></article><article><h3>CashPath isn't the lender</h3><p>Rates, fees and credit decisions are determined by the provider.</p></article></div></section>
<section id="faq" class="section faq"><p class="eyebrow">FAQ</p><h2>Questions, answered clearly.</h2>${faq}</section>
<aside class="responsible">Borrowing comes with costs. Review all rates, fees and repayment terms before accepting an offer, and borrow only what you can reasonably repay. <a href="/p/responsible-lending">Responsible Lending →</a></aside>
<section class="final"><p class="eyebrow">WHEN YOU'RE READY</p><h2>Ready to explore your options?</h2><button type="button" data-scroll="request">Start Your Request →</button></section>
${footer(snapshot)}
</main>`;
}

function article(snapshot: SiteSnapshot, page: ExportPage): string {
  const crumbs = page.categorySlug ? breadcrumbJsonLd(snapshot, [
    { label: "Home", path: "/" },
    { label: "Guides", path: "/p/guides" },
    { label: page.categoryName || "Guides", path: `/p/guides/${page.categorySlug}` },
    { label: page.navLabel },
  ]) : null;
  const crumbNav = page.categorySlug ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/p/guides">Guides</a> / <a href="/p/guides/${escapeHtml(page.categorySlug)}">${escapeHtml(page.categoryName || "")}</a> / <span>${escapeHtml(page.navLabel)}</span></nav>` : "";
  const toc = page.toc.length ? `<nav class="toc"><b>On this page</b>${page.toc.map((item) => `<a href="#${escapeHtml(item.id)}">${escapeHtml(item.label)}</a>`).join("")}</nav>` : "";
  const callout = page.worksheetCallout ? `<section class="callout"><h2>Compare your offers side by side</h2><p>Use our free worksheet to record the written terms of up to three offers. No account or loan request is required, and your entries are not submitted to CashPath.</p><a href="/p/loan-comparison-worksheet">Open the free printable loan comparison worksheet →</a></section>` : "";
  const blocks = page.blocks.map((block) => `<section id="${escapeHtml(block.id)}">${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ""}${block.bodyHtml}</section>`).join("");
  const related = page.related.length ? `<section class="related"><h2>Related guides</h2><div>${page.related.map((item) => `<a href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a>`).join("")}</div></section>` : "";
  const posting = pageJsonLd(snapshot, page);
  const jsonLd = posting ? { "@context": "https://schema.org", "@graph": [posting, ...(crumbs ? [crumbs] : [])] } : crumbs;
  const body = `<main class="article"><header class="article-bar"><a class="brand" href="/">Cash<span>Path</span></a><nav><a href="/">Home</a><a href="/p/faq">FAQ</a><a href="/p/about">About</a><a class="button" href="/#request">Start Your Request</a></nav></header><section class="article-hero">${crumbNav}<p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><div class="intro">${page.introHtml}</div></section><section class="article-grid">${toc}<article>${callout}${blocks}${related}</article></section>${footer(snapshot)}</main>`;
  return documentShell(snapshot, { title: page.seoTitle, description: page.seoDescription, path: page.path, noIndex: page.noIndex, body, jsonLd });
}

function guidesHub(snapshot: SiteSnapshot): string {
  const start = ["how-to-compare-personal-loan-offers", "what-is-apr-on-a-personal-loan", "apr-vs-interest-rate", "what-fees-can-personal-loans-include"]
    .map((slug) => snapshot.guides.find((guide) => guide.slug === slug))
    .filter((guide) => guide)
    .map((guide) => `<a href="${escapeHtml(guide!.path)}">${escapeHtml(guide!.navLabel || guide!.title)}</a>`)
    .join("");
  const categories = snapshot.categories.map((category) => {
    const items = snapshot.guides.filter((guide) => guide.categorySlug === category.slug);
    if (!items.length) return "";
    return `<section><h2>${escapeHtml(category.name)}</h2><div class="cards">${items.map((guide) => `<article><h3>${escapeHtml(guide.title)}</h3><p>${escapeHtml(guide.description)}</p><a href="${escapeHtml(guide.path)}">Read guide →</a></article>`).join("")}</div></section>`;
  }).join("");
  const body = `<main class="article"><header class="article-bar"><a class="brand" href="/">Cash<span>Path</span></a><a href="/">Home</a></header><section class="article-hero"><p class="eyebrow">CashPath Guides</p><h1>Personal Loan Guides &amp; Financial Education</h1><p>CashPath provides educational information and is not a lender. Explore guides to compare borrowing options, understand terms, and prepare questions before making a decision.</p></section><section class="article-grid"><div></div><article><h2>Start here</h2><div class="cards">${start}</div><p><a href="/p/loan-comparison-worksheet">Open the free worksheet →</a></p>${categories}</article></section>${footer(snapshot)}</main>`;
  return documentShell(snapshot, {
    title: "Personal Loan Guides & Financial Education | CashPath",
    description: "Educational personal loan guides from CashPath.",
    path: "/p/guides",
    noIndex: snapshot.noIndex,
    body,
    jsonLd: breadcrumbJsonLd(snapshot, [{ label: "Home", path: "/" }, { label: "Guides" }]),
  });
}

function categoryHub(snapshot: SiteSnapshot, category: SiteSnapshot["categories"][number]): string {
  const items = snapshot.guides.filter((guide) => guide.categorySlug === category.slug);
  const body = `<main class="article"><header class="article-bar"><a class="brand" href="/">Cash<span>Path</span></a><a href="/">Home</a></header><section class="article-hero"><nav class="crumbs"><a href="/">Home</a> / <a href="/p/guides">Guides</a> / <span>${escapeHtml(category.name)}</span></nav><p class="eyebrow">CashPath Guides</p><h1>${escapeHtml(category.title)}</h1><p>${escapeHtml(category.intro)}</p><p>${items.length} guides</p></section><section class="article-grid"><div></div><article><div class="cards">${items.map((guide) => `<article><h2>${escapeHtml(guide.title)}</h2><p>${escapeHtml(guide.description)}</p><a href="${escapeHtml(guide.path)}">Read guide →</a></article>`).join("")}</div><a href="/p/guides">Browse all guides →</a></article></section>${footer(snapshot)}</main>`;
  return documentShell(snapshot, {
    title: category.seoTitle,
    description: category.description,
    path: `/p/guides/${category.slug}`,
    noIndex: snapshot.noIndex,
    body,
    jsonLd: breadcrumbJsonLd(snapshot, [{ label: "Home", path: "/" }, { label: "Guides", path: "/p/guides" }, { label: category.name }]),
  });
}

function worksheet(snapshot: SiteSnapshot): string {
  const body = `<main class="worksheet" data-worksheet><header class="article-bar"><a class="brand" href="/">Cash<span>Path</span></a><nav><a href="/p/guides">Guides</a><a href="/p/how-to-compare-personal-loan-offers">Comparison guide</a></nav></header><section class="article-hero"><p class="eyebrow">Free financial education tool</p><h1>Personal Loan Comparison Worksheet</h1><p>Compare up to three written personal loan offers, side by side. Your numbers stay in this browser and are not submitted to CashPath.</p><button type="button" onclick="window.print()">Print or save as PDF</button></section><section class="sheet"><h2>Compare the written terms</h2><div class="checks" data-worksheet-results></div><p>CashPath is not a lender. This worksheet does not calculate APR and does not replace the lender's written disclosure.</p></section></main>`;
  return documentShell(snapshot, {
    title: "Personal Loan Comparison Worksheet | CashPath",
    description: "Compare up to three written personal loan offers. Entries stay in the browser and are not submitted.",
    path: "/p/loan-comparison-worksheet",
    noIndex: snapshot.noIndex,
    body,
  });
}

export function staticStyles(projectRoot: string): string {
  const home = readFileSync(path.join(projectRoot, "components/public/cashpath/CashPathSite.module.css"), "utf8");
  return `${home}
.article{background:#f7f5ef;color:#182b29;font-family:Georgia,serif}
.article-bar,.generic-header{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:20px 5vw;border-bottom:1px solid rgba(24,43,41,.1)}
.article-bar a,.generic-header a{color:inherit;text-decoration:none;font-weight:700}
.article-bar nav{display:flex;gap:16px;align-items:center}
.field{display:grid;gap:6px;margin:10px 0;font-family:Arial,sans-serif;font-size:14px}
.article-bar .button{background:#182b29;color:#f7f5ef;border-radius:8px;padding:8px 14px}
.article-hero,.article-grid{width:min(1100px,calc(100% - 40px));margin:0 auto}
.article-hero{padding:64px 0}
.article-hero h1{font-size:clamp(40px,6vw,72px);line-height:1.05;font-weight:500}
.article-grid{display:grid;grid-template-columns:190px minmax(0,780px);gap:32px;padding-bottom:80px}
.toc{position:sticky;top:24px;display:grid;gap:10px;font-family:Arial,sans-serif;font-size:14px}
.toc a{color:#182b29}
.article article section{border-bottom:1px solid rgba(24,43,41,.1);padding:28px 0}
.article h2{font-size:clamp(28px,3vw,40px);font-weight:500}
.intro p,.article p,.article li{font-family:Arial,sans-serif;font-size:17px;line-height:1.7}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.cards article,.cards a,.callout{display:block;background:#fff;border:1px solid rgba(24,43,41,.1);border-radius:16px;padding:16px}
.callout{background:#edf5ef}
.crumbs,.crumbs a{font-family:Arial,sans-serif;color:#182b29}
.generic{font-family:Arial,sans-serif;background:#f7f5ef;color:#182b29;min-height:100vh}
.generic-hero{padding:72px 5vw}
@media(max-width:800px){.article-grid{grid-template-columns:1fr}.toc{position:static}}
`;
}

export const STATIC_JS = `(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  toggle?.addEventListener("click", () => menu?.classList.toggle("open"));
  document.querySelectorAll("[data-scroll]").forEach((node) => node.addEventListener("click", () => {
    document.getElementById(node.getAttribute("data-scroll") || "")?.scrollIntoView({ behavior: "smooth" });
  }));
  document.querySelectorAll("[data-faq] button").forEach((button) => button.addEventListener("click", () => {
    const answer = button.parentElement?.querySelector("[data-answer]");
    if (!answer) return;
    const open = answer.hasAttribute("hidden");
    document.querySelectorAll("[data-answer]").forEach((node) => node.setAttribute("hidden", ""));
    if (open) answer.removeAttribute("hidden");
  }));
  const mount = document.querySelector("[data-leadsgate-aid]");
  if (mount && /^\\d{1,12}$/.test(mount.getAttribute("data-leadsgate-aid") || "")) {
    const aid = mount.getAttribute("data-leadsgate-aid");
    mount.innerHTML = '<form data-short-form><p>$200 to $5,000 for any reason</p><label>Loan amount<select name="requested_amount"><option value="500">$200 - $500</option><option value="1000">$500 - $1,000</option><option value="2000" selected>$1,000 - $2,500</option><option value="2500">$2,500 - $5,000</option></select></label><label>Email address<input name="email" type="email" autocomplete="email"></label><label>Last 4 digits of SSN<input name="last4ssn" inputmode="numeric" maxlength="4" autocomplete="off"></label><button type="submit">Get Started</button><p data-error role="alert"></p><p>Your request continues through our secure participating-provider form. CashPath is not a lender.</p></form><div data-provider hidden></div>';
    const form = mount.querySelector("[data-short-form]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const email = String(data.get("email") || "");
      const last4 = String(data.get("last4ssn") || "");
      const error = mount.querySelector("[data-error]");
      if (!/^\\S+@\\S+\\.\\S+$/.test(email) || !/^\\d{4}$/.test(last4)) {
        if (error) error.textContent = "Enter a valid email address and the last 4 digits of your SSN to continue.";
        return;
      }
      form.hidden = true;
      const provider = mount.querySelector("[data-provider]");
      if (provider) provider.hidden = false;
      provider.id = "_lg_form_";
      const view = window;
      view._lg_form_init_ = { aid, template: "wallet-lines" };
      view._lg_track_init_ = { aid: Number(aid) };
      const load = (src, id) => new Promise((resolve, reject) => {
        if (document.getElementById(id)) return resolve();
        const script = document.createElement("script");
        script.id = id; script.src = src; script.async = true;
        script.onload = () => resolve(); script.onerror = () => reject();
        document.head.appendChild(script);
      });
      load("https://apichannels.com/form/applicationInit.js", "exported-leadsgate-form").then(() => {
        const started = Date.now();
        const pass = () => {
          if (view._lgAPIFormV3_) view._lgAPIFormV3_.setValues({ requested_amount: String(data.get("requested_amount") || ""), email, last4ssn: last4 });
          else if (Date.now() - started < 8000) setTimeout(pass, 50);
        };
        pass();
      }).catch(() => { if (provider) provider.textContent = "The request form is temporarily unavailable. Please try again later."; });
      load("https://apichannels.com/form/track.js", "exported-leadsgate-track").catch(() => {});
    });
  }
  const results = document.querySelector("[data-worksheet-results]");
  if (results) {
    const fields = ["Lender or provider name", "Amount borrowed ($)", "Cash you actually receive ($)", "Disclosed APR (%)", "Scheduled payment ($)", "Number of equal payments", "Total repayment shown in disclosure ($)"];
    results.innerHTML = [0, 1, 2].map((index) => '<section><h3>Offer ' + String.fromCharCode(65 + index) + '</h3>' + fields.map((label) => '<label>' + label + '<input data-offer="' + index + '" data-label="' + label + '"></label>').join("") + '<p data-total="' + index + '">Equal-payment total: Not calculated</p></section>').join("");
    const total = (payment, count) => {
      if (!/^\\d{1,10}(?:\\.\\d{1,2})?$/.test(payment) || !/^\\d{1,4}$/.test(count)) return null;
      const installment = Number(payment); const installments = Number(count);
      if (!(installment > 0) || !Number.isSafeInteger(installments) || installments < 1 || installments > 600) return null;
      return Math.round((installment * installments + Number.EPSILON) * 100) / 100;
    };
    results.addEventListener("input", () => {
      for (let index = 0; index < 3; index += 1) {
        const payment = results.querySelector('[data-offer="' + index + '"][data-label="Scheduled payment ($)"]')?.value || "";
        const count = results.querySelector('[data-offer="' + index + '"][data-label="Number of equal payments"]')?.value || "";
        const value = total(payment.trim().replaceAll(",", ""), count.trim());
        const node = results.querySelector('[data-total="' + index + '"]');
        if (node) node.textContent = value === null ? "Equal-payment total: Not calculated" : "Equal-payment total: $" + value.toFixed(2) + ". This is not an APR calculation.";
      }
    });
  }
})();
`;

export function renderStaticSite(snapshot: SiteSnapshot, projectRoot: string): ExportFile[] {
  const files: ExportFile[] = [];
  const add = (route: string, html: string) => {
    const filePath = route === "/" ? "index.html" : `${route.replace(/^\//, "")}/index.html`;
    files.push({ path: filePath, body: html });
  };
  if (snapshot.templateId === "cashpath") {
    add("/", documentShell(snapshot, {
      title: snapshot.seoTitle,
      description: snapshot.seoDescription,
      path: "/",
      noIndex: snapshot.noIndex,
      body: cashpathHome(snapshot),
      jsonLd: homeJsonLd(snapshot),
    }));
    add("/p/guides", guidesHub(snapshot));
    for (const category of snapshot.categories) add(`/p/guides/${category.slug}`, categoryHub(snapshot, category));
    add("/p/loan-comparison-worksheet", worksheet(snapshot));
  } else {
    add("/", documentShell(snapshot, {
      title: snapshot.seoTitle,
      description: snapshot.seoDescription,
      path: "/",
      noIndex: snapshot.noIndex,
      body: snapshot.homeHtml,
      jsonLd: homeJsonLd(snapshot),
    }));
  }
  for (const page of snapshot.pages) add(page.path, article(snapshot, page));
  files.push({
    path: "404.html",
    body: documentShell(snapshot, {
      title: snapshot.templateId === "cashpath" ? "Page not found | CashPath" : "Page not found",
      description: "This path does not exist on the exported site.",
      path: "/404",
      noIndex: true,
      body: `<main class="article"><section class="article-hero"><h1>${snapshot.templateId === "cashpath" ? "This path does not exist." : "Page not found"}</h1><p><a href="/">Back to the homepage</a></p></section></main>`,
    }),
  });
  files.push({ path: "assets/site.css", body: staticStyles(projectRoot) });
  files.push({ path: "assets/site.js", body: STATIC_JS });
  return files;
}
