import { CASH_PATH_FINAL_SEO_PAGES } from "./cashpath-final-seo-content.generated.ts";
import { CASH_PATH_GUIDES } from "./cashpath-guides.generated.ts";
import type {
  PublicSiteContent,
  PublicSiteCustomBlock,
  PublicSitePage,
} from "./types.ts";

export function createCashPathPremiumTemplateSeed(): PublicSiteContent {
  return {
    template_id: "cashpath",
    brand_name: "CashPath",
    theme_accent: "#167a6a",
    theme_dark: "#182b29",
    theme_surface: "#f7f5ef",
    hero_eyebrow: "PERSONAL LOAN OPTIONS",
    hero_title: "Find a clearer path to the funds you need.",
    hero_text:
      "CashPath connects consumers with participating providers. CashPath is not a lender and does not make credit decisions.",
    booking_label: "Start Your Request",
    services_label: "How it works",
    portfolio_label: "Loan options",
    about_label: "About",
    contact_label: "Contact",
    about_title: "About CashPath",
    about_text:
      "CashPath helps consumers explore participating-provider options online.",
    services_title: "How CashPath works",
    portfolio_title: "Loan options",
    contact_title: "Contact",
    show_hero: true,
    show_services: false,
    show_portfolio: false,
    show_about: false,
    show_contact: false,
    custom_blocks: [
      {
        id: "cashpath-request",
        kind: "leadsgate_form",
        eyebrow: "REQUEST OPTIONS",
        title: "Start your request",
        text: "Choose an amount and enter your details to continue securely.",
        items: "",
        button_label: "",
        button_url: "",
        tone: "light",
        is_visible: true,
        leadsgate_aid: "4848",
        leadsgate_template: "wallet-lines",
      },
    ],
    pages: CASHPATH_PAGES,
    section_order: [],
    layout_order: [
      "native:cashpath:hero",
      "custom:cashpath-request",
      "native:cashpath:footer",
    ],
    favicon_url: "/templates/cashpath/favicon.svg",
    seo_image_url: "/templates/cashpath/hero-woman-wide-v2.png",
    seo_title: "CashPath | Explore Personal Loan Options Online",
    seo_description:
      "Submit a secure online request to explore personal loan options from participating providers. CashPath is not a lender and approval is not guaranteed.",
    seo_keywords:
      "personal loan options, online personal loan options, personal loans online, installment loan options, loan request online, compare loan offers, emergency expense loan options, personal loan marketplace",
  };
}

/** Exact legacy placeholder intros used to detect untouched pages safely. */
export const CASH_PATH_LEGACY_INTROS: Record<string, string> = {
  about:
    "CashPath is an online service that helps consumers submit a request that may be connected with participating providers. CashPath is not a lender and does not make credit decisions. Any offer and its terms come from the provider.",
  contact: "Contact CashPath at contact@cashpath.org.",
  faq: "CashPath is not a lender. Requests do not guarantee approval or funding. Providers set rates, fees and terms; review every offer carefully before accepting.",
  "rates-fees":
    "CashPath does not set rates or fees. Participating providers determine APR, fees, payment schedules and other terms, which vary by provider and applicant.",
  "responsible-lending":
    "Borrowing has costs. Borrow only what you can reasonably repay, review rates, fees and the repayment schedule, and consider alternatives before accepting.",
  "privacy-policy":
    'cashpath.org ("CashPath", "we", "our", or "us") may process ordinary website and technical information. The external LeadsGate flow handles application fields; CashPath does not intentionally intercept or persist them. For privacy questions or requests, email contact@cashpath.org.',
  "terms-of-use":
    "CashPath is not a lender. Use of this website does not guarantee approval, matching or funding. Provider terms govern any financial product. For questions about these terms, contact CashPath at contact@cashpath.org.",
  "e-consent":
    "This notice explains electronic delivery of communications, access and retention requirements, and withdrawal of consent where applicable. For questions or to withdraw consent, email contact@cashpath.org.",
  "advertiser-disclosure":
    "CashPath may receive compensation when a visitor is connected with, or takes action involving, a participating provider. CashPath is not the lender; review provider terms independently.",
  "do-not-sell-share":
    "For applicable privacy-rights requests, including requests not to sell or share personal information, email contact@cashpath.org.",
  disclaimer:
    "CashPath is not a lender and does not guarantee approval, an offer, or funding timing. Rates, fees and terms are controlled by providers. Website information is general, not financial or legal advice.",
};

/** Compatibility exports for the safe legacy upgrade; generated content is canonical. */
export const CASH_PATH_FULL_INTROS: Record<string, string> = Object.fromEntries(
  CASH_PATH_FINAL_SEO_PAGES.map((page) => [page.slug, page.intro]),
);

export function cashPathFullPageBlocks(slug: string): PublicSiteCustomBlock[] {
  const page = CASH_PATH_FINAL_SEO_PAGES.find(
    (candidate) => candidate.slug === slug,
  );
  return page
    ? (page.blocks.map((block) => ({ ...block })) as PublicSiteCustomBlock[])
    : [];
}

const CASHPATH_PAGES: PublicSitePage[] = [
  ...CASH_PATH_FINAL_SEO_PAGES.map((page): PublicSitePage => ({
    id: page.slug,
    type: "custom",
    slug: page.slug,
    nav_label: page.title,
    eyebrow: "CASHPATH",
    title: page.title,
    intro: page.intro,
    seo_title: page.seo_title,
    seo_description: page.seo_description,
    is_visible: true,
    show_in_navigation: ["about", "faq", "contact"].includes(page.slug),
    show_booking_cta: false,
    blocks: cashPathFullPageBlocks(page.slug),
  })),
  ...CASH_PATH_GUIDES.map((page): PublicSitePage => ({
    ...page,
    blocks: page.blocks?.map((block) => ({ ...block })),
  })),
];
