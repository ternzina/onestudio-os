import type { PublicSiteContent } from "./types.ts";
export function createCashPathPremiumTemplateSeed(): PublicSiteContent { return {
  template_id: "cashpath", brand_name: "CashPath", theme_accent: "#167a6a", theme_dark: "#182b29", theme_surface: "#f7f5ef",
  hero_eyebrow: "PERSONAL LOAN OPTIONS", hero_title: "Find a clearer path to the funds you need.", hero_text: "CashPath connects consumers with participating providers. CashPath is not a lender and does not make credit decisions.",
  booking_label: "Start Your Request", services_label: "How it works", portfolio_label: "Loan options", about_label: "About", contact_label: "Contact", about_title: "About CashPath", about_text: "CashPath helps consumers explore participating-provider options online.", services_title: "How CashPath works", portfolio_title: "Loan options", contact_title: "Contact", show_hero: true, show_services: false, show_portfolio: false, show_about: false, show_contact: false,
  custom_blocks: [{ id: "cashpath-request", kind: "leadsgate_form", eyebrow: "REQUEST OPTIONS", title: "Start your request", text: "Complete the secure provider form to explore available options. You are not required to accept an offer.", items: "", button_label: "", button_url: "", tone: "light", is_visible: true, leadsgate_aid: "4848", leadsgate_template: "wallet-lines" }],
  pages: CASHPATH_PAGES, section_order: [], layout_order: ["native:cashpath:hero", "custom:cashpath-request", "native:cashpath:footer"], seo_title: "CashPath | Explore personal loan options", seo_description: "Explore personal loan options through participating providers."
} as PublicSiteContent; }

const page = (slug: string, title: string, intro: string) => ({ id: slug, type: "custom" as const, slug, nav_label: title, eyebrow: "CASHPATH", title, intro, is_visible: true, show_in_navigation: ["about", "faq", "contact"].includes(slug), show_booking_cta: false, blocks: [{ id: `${slug}-content`, kind: "text" as const, eyebrow: "", title: "", text: intro, items: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true }] });
const CASHPATH_PAGES = [
page("about", "About", "CashPath is an online service that helps consumers submit a request that may be connected with participating providers. CashPath is not a lender and does not make credit decisions. Any offer and its terms come from the provider."),
page("contact", "Contact CashPath", "Contact CashPath at contact@cashpath.org."),
page("faq", "Frequently Asked Questions", "CashPath is not a lender. Requests do not guarantee approval or funding. Providers set rates, fees and terms; review every offer carefully before accepting."),
page("rates-fees", "Rates & Fees", "CashPath does not set rates or fees. Participating providers determine APR, fees, payment schedules and other terms, which vary by provider and applicant."),
page("responsible-lending", "Responsible Lending", "Borrowing has costs. Borrow only what you can reasonably repay, review rates, fees and the repayment schedule, and consider alternatives before accepting."),
page("privacy-policy", "Privacy Policy", "cashpath.org (\"CashPath\", \"we\", \"our\", or \"us\") may process ordinary website and technical information. The external LeadsGate flow handles application fields; CashPath does not intentionally intercept or persist them. For privacy questions or requests, email contact@cashpath.org."),
page("terms-of-use", "Terms of Use", "CashPath is not a lender. Use of this website does not guarantee approval, matching or funding. Provider terms govern any financial product. For questions about these terms, contact CashPath at contact@cashpath.org."),
page("e-consent", "E-Consent", "This notice explains electronic delivery of communications, access and retention requirements, and withdrawal of consent where applicable. For questions or to withdraw consent, email contact@cashpath.org."),
page("advertiser-disclosure", "Advertiser Disclosure", "CashPath may receive compensation when a visitor is connected with, or takes action involving, a participating provider. CashPath is not the lender; review provider terms independently."),
page("do-not-sell-share", "Do Not Sell or Share My Personal Information", "For applicable privacy-rights requests, including requests not to sell or share personal information, email contact@cashpath.org."),
page("disclaimer", "Disclaimer", "CashPath is not a lender and does not guarantee approval, an offer, or funding timing. Rates, fees and terms are controlled by providers. Website information is general, not financial or legal advice.")
];
