import type { FAQ3Item } from "@/components/marketing/public-blocks/faq-3";
import { getTranslations } from "@/lib/i18n";
import { contactTopicValues, type ContactTopicValue, type Locale } from "@/lib/i18n/config";
import { pricingConfig } from "@/lib/pricing-config";
import type { Pricing6Plan } from "@/components/marketing/public-blocks/pricing-6";
import type { Pricing8Section, Pricing8Tier } from "@/components/marketing/public-blocks/pricing-8";

export type SiteLang = Locale;
export type EditorPageId = "home" | "pricing" | "website" | "faq";
export type SpacingPreset = "compact" | "normal" | "spacious";

export type EditableSection = {
  label: string;
  eyebrow?: string;
  title: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  visible: boolean;
  spacing: SpacingPreset;
};

export type HomeSectionId = "hero" | "features" | "workflow" | "motion" | "demos" | "capabilities" | "technical" | "launch";
export type PricingSectionId = "hero" | "plans" | "technical" | "design" | "faq";
export type WebsiteSectionId = "hero" | "included" | "scope" | "process" | "showcase";
export type FAQSectionId = "hero" | "questions" | "contact";

export type HomeEditorPage = {
  sections: Record<HomeSectionId, EditableSection>;
  sectionOrder: HomeSectionId[];
};

export type PricingPlanEditor = {
  id: "site" | "business" | "pro";
  name: string;
  monthlyPrice: string;
  yearlyMonthlyPrice: string;
  yearlyTotal: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TechnicalSpecRow = {
  id: string;
  group: string;
  label: string;
  siteValue: string;
  businessValue: string;
  proValue: string;
  visible: boolean;
};

export type PricingEditorPage = {
  sections: Record<PricingSectionId, EditableSection>;
  sectionOrder: PricingSectionId[];
  plans: PricingPlanEditor[];
  freeTrialDays: number;
  technicalRows: TechnicalSpecRow[];
  premiumDesign: {
    title: string;
    price: string;
    priceSuffix: string;
    description: string;
    tagline: string;
    ctaLabel: string;
    ctaHref: string;
    visible: boolean;
  };
  pricingFaq: FAQ3Item[];
};

export type WebsiteProcessStep = {
  number: string;
  title: string;
  description: string;
};

export type WebsitePortfolioKey = "sisters-studio" | "bembi" | "noir-frame" | "velora-house";

export type WebsitePortfolioCard = Readonly<{
  key: WebsitePortfolioKey;
  name: string;
  url: string;
  previewImage: string | null;
}>;

export const websitePortfolioCards: readonly WebsitePortfolioCard[] = [
  { key: "sisters-studio", name: "Sisters Studio", url: "https://sistersstudio.pl/", previewImage: "/images/portfolio/sisters-studio.png" },
  { key: "bembi", name: "Bembi", url: "https://bembi.biz/", previewImage: "/images/portfolio/bembi.png" },
  { key: "noir-frame", name: "NOIR FRAME — Premium Photo Studio", url: "https://joowy.net/", previewImage: "/images/demos/premium-studio/bright/hero.webp" },
  { key: "velora-house", name: "VELORA HOUSE", url: "https://planetaprincesas.com/", previewImage: "/templates/velora/hero-cinematic.webp" },
];

export type WebsiteContent = {
  hero: ReturnType<typeof getTranslations>["website"]["hero"];
  included: ReturnType<typeof getTranslations>["website"]["included"];
  scope: ReturnType<typeof getTranslations>["website"]["scope"];
  process: ReturnType<typeof getTranslations>["website"]["process"];
  showcase: ReturnType<typeof getTranslations>["website"]["showcase"] & { cards: readonly WebsitePortfolioCard[] };
};

function getWebsiteContent(lang: SiteLang): WebsiteContent {
  const website = getTranslations(lang).website;
  return { ...website, showcase: { ...website.showcase, cards: websitePortfolioCards } };
}

export const websiteContent: Record<SiteLang, WebsiteContent> = {
  ru: getWebsiteContent("ru"),
  en: getWebsiteContent("en"),
  uk: getWebsiteContent("uk"),
  pl: getWebsiteContent("pl"),
  de: getWebsiteContent("de"),
  es: getWebsiteContent("es"),
  fr: getWebsiteContent("fr"),
  pt: getWebsiteContent("pt"),
};

export const faqPageContent: Record<SiteLang, ReturnType<typeof getTranslations>["faq"]["page"]> = {
  ru: getTranslations("ru").faq.page,
  en: getTranslations("en").faq.page,
  uk: getTranslations("uk").faq.page,
  pl: getTranslations("pl").faq.page,
  de: getTranslations("de").faq.page,
  es: getTranslations("es").faq.page,
  fr: getTranslations("fr").faq.page,
  pt: getTranslations("pt").faq.page,
};

export const contactEmail = "hello@onestudioos.com";
export { contactTopicValues };
export type { ContactTopicValue };

export const contactContent: Record<SiteLang, ReturnType<typeof getTranslations>["contact"]> = {
  ru: getTranslations("ru").contact,
  en: getTranslations("en").contact,
  uk: getTranslations("uk").contact,
  pl: getTranslations("pl").contact,
  de: getTranslations("de").contact,
  es: getTranslations("es").contact,
  fr: getTranslations("fr").contact,
  pt: getTranslations("pt").contact,
};

function section(label: string, title: string, description: string, extra: Partial<EditableSection> = {}): EditableSection {
  return { label, title, description, visible: true, spacing: "normal", ...extra };
}

function homeContent(lang: SiteLang): HomeEditorPage {
  const t = getTranslations(lang).home;
  return {
    sectionOrder: ["hero", "features", "workflow", "motion", "demos", "capabilities", "technical", "launch"],
    sections: {
      hero: section("Hero", t.titleLines.join(" "), t.lead, { eyebrow: t.eyebrow, buttonLabel: t.primary, buttonHref: "/demos" }),
      features: section("Features", t.featureTitle.join(" "), t.featureLead, { eyebrow: t.sectionEyebrow, buttonLabel: t.primary, buttonHref: "/demos" }),
      workflow: section("Workflow", t.workflow.title, t.workflow.supporting, { eyebrow: t.workflow.eyebrow }),
      motion: section("Design motion", t.motion.titleBefore + t.motion.titleAccent, t.motion.supporting),
      demos: section("Demos", t.demoShowcase.title, t.demoShowcase.supporting, { buttonLabel: t.demoShowcase.open, buttonHref: "/demos" }),
      capabilities: section("Capabilities", t.featureLead, t.featureLead),
      technical: section("Technical foundation", t.infrastructure.title, t.infrastructure.supporting, { eyebrow: t.infrastructure.eyebrow }),
      launch: section("Launch", t.launchTitle, t.launchLead, { eyebrow: t.launchEyebrow, buttonLabel: t.primary, buttonHref: "/demos" }),
    },
  };
}

function buildPricingPlans(lang: SiteLang): Pricing6Plan[] {
  const t = getTranslations(lang).pricing;
  return pricingConfig.plans.map((plan) => {
    const copy = t.plans[plan.id];
    return {
      ...plan,
      name: copy.name,
      description: copy.description,
      features: [...copy.features],
      cta: copy.cta,
      badge: "badge" in copy ? copy.badge : undefined,
    };
  });
}

function comparisonSections(lang: SiteLang): Pricing8Section[] {
  const t = getTranslations(lang).pricing;
  return pricingConfig.comparison.map((section) => ({
    title: t.comparison.sectionTitles[section.id],
    rows: section.rows.map((row) => {
      const [first, second, third] = row.values;
      const resolve = (value: (typeof row.values)[number]) => value === "standard"
        ? t.comparison.valueLabels.standard
        : value === "more"
          ? t.comparison.valueLabels.more
          : value;
      return { label: t.comparison.rowLabels[row.id], values: [resolve(first), resolve(second), resolve(third)] };
    }),
  }));
}

function pricingContent(lang: SiteLang): PricingEditorPage {
  const t = getTranslations(lang).pricing;
  const plans = buildPricingPlans(lang);
  const sections = comparisonSections(lang);
  return {
    sectionOrder: ["hero", "plans", "technical", "design", "faq"],
    sections: {
      hero: section("Hero", t.hero.title.join(" "), t.hero.lead, { eyebrow: t.hero.eyebrow }),
      plans: section("Plans", t.plansHeading, t.plansSupporting),
      technical: section("Technical specifications", t.comparison.title, "Pricing comparison data."),
      design: section("Premium Design Library", t.design.title, t.design.body, { eyebrow: t.design.eyebrow }),
      faq: section("Plan FAQ", t.faq.title, t.faq.compactAriaLabel, { buttonLabel: t.faq.more, buttonHref: "/faq" }),
    },
    plans: plans.map((plan) => ({ id: plan.id as PricingPlanEditor["id"], name: plan.name, monthlyPrice: plan.price, yearlyMonthlyPrice: plan.annualPrice ?? plan.price, yearlyTotal: plan.annualTotal ?? "", ctaLabel: plan.cta, ctaHref: plan.href })),
    freeTrialDays: pricingConfig.freeTrialDays,
    technicalRows: sections.flatMap((comparisonSection, sectionIndex) => comparisonSection.rows.map((row, rowIndex) => ({
      id: `${comparisonSection.title.toLowerCase().replace(/\s+/g, "-")}-${sectionIndex}-${rowIndex}`,
      group: comparisonSection.title,
      label: row.label,
      siteValue: row.values[0] === true ? "✓" : row.values[0] === false ? "—" : row.values[0],
      businessValue: row.values[1] === true ? "✓" : row.values[1] === false ? "—" : row.values[1],
      proValue: row.values[2] === true ? "✓" : row.values[2] === false ? "—" : row.values[2],
      visible: true,
    }))),
    premiumDesign: { title: t.design.title, price: pricingConfig.design.price, priceSuffix: t.design.priceSuffix, description: t.design.body, tagline: t.design.tagline, ctaLabel: t.design.cta, ctaHref: "/components", visible: true },
    pricingFaq: t.faq.items.map((item) => ({ ...item })),
  };
}

function websiteEditorContent(lang: SiteLang): WebsiteEditorPage {
  const t = getTranslations(lang).website;
  return {
    sectionOrder: ["hero", "included", "scope", "process", "showcase"],
    sections: {
      hero: section("Hero", t.hero.title, t.hero.lead, { eyebrow: t.hero.eyebrow, buttonLabel: t.hero.cta, buttonHref: "/contact" }),
      included: section("What's included", t.included.title, t.included.lead, { eyebrow: t.included.eyebrow }),
      scope: section("Price scope", t.scope.title, t.scope.lead, { eyebrow: t.scope.eyebrow }),
      process: section("Process", t.process.title, "Four steps from discussion to launch.", { eyebrow: t.process.eyebrow }),
      showcase: section("Portfolio", t.showcase.title, t.showcase.lead, { eyebrow: t.showcase.eyebrow }),
    },
    startingPrice: t.hero.priceLabel,
    includedItems: t.included.items.map((item) => ({ ...item })),
    scopeItems: [...t.scope.items],
    processSteps: t.process.steps.map((step) => ({ ...step })),
    portfolioCardText: lang === "ru" ? "Текст карточки портфолио можно менять здесь." : "Portfolio card copy can be changed here.",
  };
}

function faqEditorContent(lang: SiteLang): FAQEditorPage {
  const t = getTranslations(lang).faq;
  const categories = t.content.categories as Array<{ id: keyof typeof t.content.faqsByCategory; label: string }>;
  return {
    sectionOrder: ["hero", "questions", "contact"],
    sections: {
      hero: section("Hero", t.page.title, t.page.description, { eyebrow: "FAQ" }),
      questions: section("Questions", t.content.heading, t.content.categories.map((category) => category.label).join(" · ")),
      contact: section("Contact", t.page.contactTitle, t.page.contactText, { buttonLabel: t.page.contactAction, buttonHref: `mailto:${contactEmail}` }),
    },
    categories: categories.map((category) => {
      const categoryContent = t.content.faqsByCategory[category.id];
      return { id: category.id, label: category.label, title: categoryContent.title, items: categoryContent.faqs.map((item) => ({ ...item })) };
    }),
  };
}

export type WebsiteEditorPage = {
  sections: Record<WebsiteSectionId, EditableSection>;
  sectionOrder: WebsiteSectionId[];
  startingPrice: string;
  includedItems: Array<{ title: string; description: string }>;
  scopeItems: string[];
  processSteps: WebsiteProcessStep[];
  portfolioCardText: string;
};

export type FAQEditorCategory = {
  id: string;
  label: string;
  title: string;
  items: FAQ3Item[];
};

export type FAQEditorPage = {
  sections: Record<FAQSectionId, EditableSection>;
  sectionOrder: FAQSectionId[];
  categories: FAQEditorCategory[];
};

export type EditorLanguageContent = {
  home: HomeEditorPage;
  pricing: PricingEditorPage;
  website: WebsiteEditorPage;
  faq: FAQEditorPage;
};

export type EditorContent = {
  version: 1;
  languages: Record<SiteLang, EditorLanguageContent>;
};

function createEditorLanguageContent(lang: SiteLang): EditorLanguageContent {
  return { home: homeContent(lang), pricing: pricingContent(lang), website: websiteEditorContent(lang), faq: faqEditorContent(lang) };
}

export const initialEditorContent: EditorContent = {
  version: 1,
  languages: {
    ru: createEditorLanguageContent("ru"),
    en: createEditorLanguageContent("en"),
    uk: createEditorLanguageContent("uk"),
    pl: createEditorLanguageContent("pl"),
    de: createEditorLanguageContent("de"),
    es: createEditorLanguageContent("es"),
    fr: createEditorLanguageContent("fr"),
    pt: createEditorLanguageContent("pt"),
  },
};
