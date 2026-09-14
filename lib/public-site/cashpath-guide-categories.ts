import {
  CASH_PATH_GUIDE_CATEGORIES,
  type CashPathGuideCategory,
} from "./cashpath-guides.generated.ts";

export type CashPathGuideCategoryDefinition = {
  name: CashPathGuideCategory;
  slug: string;
  pageTitle: string;
  seoTitle: string;
  description: string;
  intro: string;
};

/** The single source of category metadata for CashPath guide navigation and SEO. */
export const CASH_PATH_GUIDE_CATEGORY_REGISTRY = [
  {
    name: "Loan Basics",
    slug: "loan-basics",
    pageTitle: "Loan Basics",
    seoTitle: "Loan Basics Guides | CashPath",
    description: "Educational guides to help you understand personal loans, terms, and common borrowing questions.",
    intro: "Explore plain-language guides about how personal loans work, the terms you may encounter, and questions to consider before making a borrowing decision.",
  },
  {
    name: "Credit & Approval",
    slug: "credit-approval",
    pageTitle: "Credit & Approval",
    seoTitle: "Credit & Approval Guides | CashPath",
    description: "Educational guides about credit, applications, and approval-related questions.",
    intro: "Review educational guides about credit information, application steps, and questions that can help you understand an offer or decision.",
  },
  {
    name: "Compare Borrowing Options",
    slug: "compare-borrowing-options",
    pageTitle: "Compare Borrowing Options",
    seoTitle: "Compare Borrowing Options Guides | CashPath",
    description: "Educational guides for comparing personal loans and other borrowing options.",
    intro: "Use these guides to compare borrowing options, understand tradeoffs, and prepare questions before choosing a path.",
  },
  {
    name: "Debt & Repayment",
    slug: "debt-repayment",
    pageTitle: "Debt & Repayment",
    seoTitle: "Debt & Repayment Guides | CashPath",
    description: "Educational guides about debt, repayment, and related financial questions.",
    intro: "Explore educational resources about repayment, managing debt-related questions, and understanding the choices in front of you.",
  },
  {
    name: "Life & Emergency Expenses",
    slug: "life-emergency-expenses",
    pageTitle: "Life & Emergency Expenses",
    seoTitle: "Life & Emergency Expense Guides | CashPath",
    description: "Educational guides for life events, unexpected expenses, and financing questions.",
    intro: "Find educational guides for common life events and unexpected expenses, with questions to consider before financing a cost.",
  },
  {
    name: "Home, Auto & Major Purchases",
    slug: "home-auto-major-purchases",
    pageTitle: "Home, Auto & Major Purchases",
    seoTitle: "Home, Auto & Major Purchase Guides | CashPath",
    description: "Educational guides for home, auto, and other major-purchase financing questions.",
    intro: "Explore educational guides for home, auto, and major-purchase decisions, including ways to compare financing choices.",
  },
  {
    name: "Rights & Safety",
    slug: "rights-safety",
    pageTitle: "Rights & Safety",
    seoTitle: "Rights & Safety Guides | CashPath",
    description: "Educational guides about borrower rights, safety, and financial scams.",
    intro: "Read educational guides about financial safety, consumer rights, and questions to help you recognize and avoid common risks.",
  },
] as const satisfies readonly CashPathGuideCategoryDefinition[];

const categoriesByName = new Map<CashPathGuideCategory, CashPathGuideCategoryDefinition>(
  CASH_PATH_GUIDE_CATEGORY_REGISTRY.map((category) => [category.name, category]),
);
const categoriesBySlug = new Map<string, CashPathGuideCategoryDefinition>(
  CASH_PATH_GUIDE_CATEGORY_REGISTRY.map((category) => [category.slug, category]),
);

export function getCashPathGuideCategory(category: CashPathGuideCategory) {
  return categoriesByName.get(category);
}

export function getCashPathGuideCategoryBySlug(slug: string) {
  return categoriesBySlug.get(slug);
}

export function cashPathGuideCategoryPath(categorySlug: string, locale?: string | null) {
  const prefix = locale ? `/${encodeURIComponent(locale)}` : "";
  return `${prefix}/p/guides/${encodeURIComponent(categorySlug)}`;
}

// Ensures the editorial generator and navigation registry cannot drift apart.
if (
  CASH_PATH_GUIDE_CATEGORY_REGISTRY.length !== CASH_PATH_GUIDE_CATEGORIES.length ||
  CASH_PATH_GUIDE_CATEGORIES.some((category) => !categoriesByName.has(category))
) {
  throw new Error("CashPath category registry is out of sync with generated guides");
}
