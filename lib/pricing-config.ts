export type PricingPlanId = "site" | "business" | "pro";
export type PricingComparisonValue = true | false | "standard" | "more";
export type PricingComparisonRowId =
  | "websiteCount"
  | "ssl"
  | "hosting"
  | "mobile"
  | "visualEditor"
  | "basicTemplates"
  | "basicBlocks"
  | "imageOptimization"
  | "media"
  | "monthlyTraffic"
  | "contactForms"
  | "onlineBooking"
  | "schedule"
  | "services"
  | "crm"
  | "payments"
  | "notifications"
  | "staffResources";

export type PricingPlanData = Readonly<{
  id: PricingPlanId;
  price: string;
  annualPrice: string;
  annualTotal: string;
  storage: string;
  popular: boolean;
  href: string;
}>;

export type PricingComparisonRow = Readonly<{
  id: PricingComparisonRowId;
  values: readonly [string, string, string] | readonly [PricingComparisonValue, PricingComparisonValue, PricingComparisonValue];
}>;

export type PricingComparisonSection = Readonly<{
  id: "websiteDesign" | "storageTraffic" | "clientWork" | "teamResources";
  rows: readonly PricingComparisonRow[];
}>;

const contactHref = "mailto:hello@onestudioos.com";

export const pricingConfig = {
  freeTrialDays: 14,
  design: {
    price: "$39",
  },
  plans: [
    { id: "site", price: "€5.90", annualPrice: "€1.90", annualTotal: "€22.80", storage: "2 GB", popular: false, href: contactHref },
    { id: "business", price: "€14.90", annualPrice: "€5.90", annualTotal: "€70.80", storage: "20 GB", popular: true, href: contactHref },
    { id: "pro", price: "€24.90", annualPrice: "€9.90", annualTotal: "€118.80", storage: "100 GB", popular: false, href: contactHref },
  ] satisfies readonly PricingPlanData[],
  comparison: [
    {
      id: "websiteDesign",
      rows: [
        { id: "websiteCount", values: ["1", "2", "3"] },
        { id: "ssl", values: [true, true, true] },
        { id: "hosting", values: [true, true, true] },
        { id: "mobile", values: [true, true, true] },
        { id: "visualEditor", values: [true, true, true] },
        { id: "basicTemplates", values: [true, true, true] },
        { id: "basicBlocks", values: [true, true, true] },
        { id: "imageOptimization", values: [true, true, true] },
      ],
    },
    {
      id: "storageTraffic",
      rows: [
        { id: "media", values: ["2 GB", "20 GB", "100 GB"] },
        { id: "monthlyTraffic", values: ["10 GB", "100 GB", "500 GB"] },
      ],
    },
    {
      id: "clientWork",
      rows: [
        { id: "contactForms", values: [true, true, true] },
        { id: "onlineBooking", values: [false, true, true] },
        { id: "schedule", values: [false, true, true] },
        { id: "services", values: [false, true, true] },
        { id: "crm", values: [false, true, true] },
        { id: "payments", values: [false, true, true] },
        { id: "notifications", values: [false, true, true] },
      ],
    },
    {
      id: "teamResources",
      rows: [{ id: "staffResources", values: ["—", "standard", "more"] }],
    },
  ] satisfies readonly PricingComparisonSection[],
} as const;
