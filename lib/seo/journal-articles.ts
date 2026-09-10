export const JOURNAL_CATEGORY_ORDER = [
  "Business",
  "Websites",
  "Booking",
  "CRM",
  "Marketing",
  "SEO",
] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORY_ORDER)[number];
export type JournalLink = { label: string; href: string };
export type JournalTable = {
  caption?: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
};
export type JournalSubsection = {
  title: string;
  paragraphs?: readonly string[];
  list?: readonly string[];
  numberedList?: readonly string[];
};
export type JournalTemplateBlock = {
  label?: string;
  content: string;
};
export type JournalSection = {
  title: string;
  paragraphs: readonly string[];
  checklist?: readonly string[];
  list?: readonly string[];
  numberedList?: readonly string[];
  subsections?: readonly JournalSubsection[];
  table?: JournalTable;
  links?: readonly JournalLink[];
  template?: JournalTemplateBlock;
};
export type JournalArticle = {
  slug: string; path: string; title: string; h1: string; description: string;
  publishedAt: string; category: string; excerpt: string; searchIntent: string;
  topics?: readonly JournalCategory[];
  sections: readonly JournalSection[]; relatedLinks: readonly JournalLink[];
  faq?: readonly { question: string; answer: string }[];
};

export type JournalArticleSummary = Pick<
  JournalArticle,
  "slug" | "path" | "title" | "publishedAt" | "category" | "excerpt"
> & { topics: readonly JournalCategory[] };

type JournalArticleSource = Pick<
  JournalArticle,
  "slug" | "path" | "title" | "publishedAt" | "category" | "excerpt" | "topics"
>;

export const JOURNAL_ARTICLES = [
  {
    slug: "how-online-booking-works-for-service-businesses", path: "/journal/how-online-booking-works-for-service-businesses",
    title: "How Online Booking Works on a Service Business Website",
    h1: "How online booking works on a service business website",
    description: "A practical guide to the website appointment booking workflow, from choosing a service and time to the client record and follow-up.",
    publishedAt: "2026-09-08", category: "Guide", topics: ["Booking", "Business"], excerpt: "Understand the complete online booking workflow before choosing a system for your service business website.", searchIntent: "how online booking works",
    sections: [
      { title: "What happens before a booking", paragraphs: ["A useful booking journey starts with a clear service menu. Each service should explain what the customer is booking, how long it takes, and any price or availability information that has been configured. The website gives the visitor enough context to choose without starting a separate conversation.", "The business also needs working availability. A booking system connects services to the schedule that the business maintains, so the times shown to a visitor reflect the configuration rather than an empty form."], checklist: ["Services have clear names and descriptions", "Availability is configured for the people or resources being booked", "The booking path is easy to find on mobile"] },
      { title: "How a customer selects a time", paragraphs: ["The customer chooses a service, reviews available times, and selects the option that fits. A good flow keeps the decision focused: service first, then time, then contact details. It should make the selected service and time visible before submission so the customer can catch a mistake." ] },
      { title: "Contact details and submission", paragraphs: ["The customer supplies the contact details required by the business. After submission, the system records the booking instead of leaving it in an inbox or a social message. Confirmation and reminder behavior depends on what the business has enabled and configured." ] },
      { title: "What happens after submission", paragraphs: ["The booking becomes part of the operational record. The client record can retain the relationship and booking history, while the schedule reflects the appointment. Where payments are configured, payment status or history can remain connected to that client activity. Google Calendar connection is available where configured, so the business can keep its working calendar aligned with the booking workflow." ] },
      { title: "What to check before choosing a booking system", paragraphs: ["Ask whether the system connects the public website, services, availability, client records, payments, notifications, and calendar in a way your team can actually use. A booking form alone may collect a request, but it does not necessarily create a useful operational history.", "For a closer look at the platform capability, see [[online booking|/features/online-booking]] and [[CRM|/features/crm]]. You can also compare the broader [[service business solutions|/solutions]] or [[pricing|/pricing]]. Beauty salons, pet groomers, and Pilates studios can review their relevant [[salon solution|/solutions/beauty-salon-website]], [[pet grooming solution|/solutions/pet-grooming-website]], and [[Pilates solution|/solutions/pilates-studio-website]]."] },
    ], relatedLinks: [{label:"Online Booking",href:"/features/online-booking"},{label:"CRM",href:"/features/crm"},{label:"Solutions",href:"/solutions"}],
    faq: [{question:"Can online booking work without taking payment?",answer:"Yes. Payment support is a configuration choice, so a business can use the booking workflow with payment enabled where appropriate or without it."},{question:"Does every booking system connect to Google Calendar?",answer:"No. Check whether the specific system supports and has configured that connection before relying on it."}],
  },
  {
    slug: "website-builder-with-crm-guide", path: "/journal/website-builder-with-crm-guide", title: "Website Builder with CRM: What Service Businesses Actually Need", h1: "Website builder with CRM: what service businesses actually need", description: "Learn what a website with CRM should mean for a service business, including contact continuity, booking history, notes, tags, and payment records.", publishedAt: "2026-09-08", category: "Guide", topics: ["CRM", "Websites"], excerpt: "A grounded checklist for evaluating a website builder with CRM when your work begins with a customer-facing website.", searchIntent: "website builder with CRM",
    sections: [
      {title:"What a website with CRM should mean", paragraphs:["A website with CRM should connect what a visitor does publicly with the customer information the business uses privately. The important question is not whether a product has a CRM label. It is whether a person can move from website activity to a useful, understandable client record without manual copying.","For a service business, that continuity often begins with a booking or request. The record should remain useful after the first interaction, not disappear when the form is submitted."]},
      {title:"The records worth checking", paragraphs:["Look for customer and contact records that preserve booking history, notes, and tags. Where payments are enabled, payment status and history should be available in the appropriate context. These details help a team recognize the customer and understand the relationship before the next appointment.","Also check how easy it is to correct a record, find a returning client, and see the relationship between a public website action and the operational work that follows."] , checklist:["Customer records connect to bookings", "Notes and tags are available where the workflow needs them", "Payment status is visible when payments are enabled", "The team can find history without exporting data"], table:{caption:"Core records in a connected service workflow",headers:["Record","Useful context"],rows:[["Client","Contact details, notes and tags"],["Booking","Service, time and appointment history"],["Payment","Status and history when payments are enabled"]]}},
      {title:"Service-business CRM is not a sales pipeline", paragraphs:["A salon, studio, or groomer usually needs continuity around appointments and relationships. That is different from a lead-scoring and outbound-sales CRM built around prospect stages, campaigns, and pipeline forecasting. OneStudio is positioned around the service-business workflow, not as a lead-scoring or outbound sales CRM.","A separate sales tool may still make sense for a business with a complex sales team. The right choice depends on whether the core problem is appointment operations or a dedicated sales process."], subsections:[{title:"When a service-business model fits",paragraphs:["Choose this model when appointments, returning customers, notes, and operational history are the center of the work."]},{title:"When a sales CRM may fit better",paragraphs:["Consider a dedicated sales platform when a team primarily manages prospect stages, outbound activity, and long sales cycles."]}]},
      {title:"How the public website connects to operations", paragraphs:["Evaluate the complete path: a visitor reaches the website, chooses an action, creates or updates a client record, and leaves the team with a clear next step. [[OneStudio CRM|/features/crm]] is designed around that connected context. Pair it with [[online booking|/features/online-booking]] when appointments are central, then review the relevant [[solutions|/solutions]] and [[pricing|/pricing]]."]},
      {title:"A practical evaluation checklist", paragraphs:["Before choosing a system, test it with a realistic customer journey rather than a feature list. Create a booking, find the client record, add a note, review the history, and check what happens when a payment is enabled. If the workflow feels fragmented in the test, it will probably feel fragmented on a busy day."], numberedList:["Create a realistic test booking from the public website.","Find the resulting client record and add a useful note.","Review booking history and payment context where enabled.","Repeat the flow as a returning customer."]}
    ], relatedLinks:[{label:"CRM",href:"/features/crm"},{label:"Online Booking",href:"/features/online-booking"},{label:"Solutions",href:"/solutions"}],
  },
  {
    slug:"beauty-salon-website-booking-guide", path:"/journal/beauty-salon-website-booking-guide", title:"What a Beauty Salon Website Needs to Turn Visits into Bookings", h1:"What a beauty salon website needs to turn visits into bookings", description:"A salon-specific guide to service menus, specialists, visual proof, online booking, client history, mobile experience, and custom domains.", publishedAt:"2026-09-08", category:"Guide", topics:["Marketing", "SEO", "Websites"], excerpt:"Build a beauty salon website that answers practical questions and gives visitors a clear path to book.", searchIntent:"beauty salon website with online booking",
    sections:[
      {title:"Start with a clear service menu", paragraphs:["A salon visitor should quickly understand what is available. Show services in a structure that matches how people think, with pricing and duration where configured. If a service depends on a specialist, make that relationship clear rather than asking the visitor to discover it in a direct message."]},
      {title:"Show the people and the work", paragraphs:["Specialist information builds context, while a portfolio gives visual proof of the salon's direction. LUMEA Beauty is a real OneStudio example of a visual salon direction. GLOSS is another useful reference when a more editorial nail-studio mood is helpful. These examples are directions to inspect, not claims about customer results."]},
      {title:"Make availability and booking obvious", paragraphs:["The booking path should be visible in the first meaningful scroll and remain easy to use on a phone. A visitor should be able to choose a service and available time without being forced into DMs. [[Beauty salon solution|/solutions/beauty-salon-website]] shows the industry context, while [[online booking|/features/online-booking]] explains the connected booking capability."]},
      {title:"Keep the relationship after the visit", paragraphs:["A useful salon workflow keeps client records and history available for future appointments. Reminders and payment support can help where enabled and configured. [[CRM|/features/crm]] is relevant when the salon needs that continuity beyond the public page."]},
      {title:"Do not overlook the basics", paragraphs:["Use a custom domain when the salon is ready to publish, check every key action on mobile, and make the next step unambiguous. Review the [[LUMEA demo|/demos/lumea-beauty]], browse other [[demos|/demos]], and check [[pricing|/pricing]] before deciding what the site needs now."], template:{label:"Mobile launch review",content:"Open the published page on a phone. Check the service menu, specialist information, portfolio, booking action, confirmation state, and contact details before sharing the domain."}}
    ], relatedLinks:[{label:"Beauty salon solution",href:"/solutions/beauty-salon-website"},{label:"Online Booking",href:"/features/online-booking"},{label:"CRM",href:"/features/crm"},{label:"LUMEA demo",href:"/demos/lumea-beauty"}],
  }
] as const satisfies readonly JournalArticle[];

export function getJournalArticle(slug: string) { return JOURNAL_ARTICLES.find((article) => article.slug === slug); }

function normalizedTopics(article: JournalArticleSource): readonly JournalCategory[] {
  if (article.topics?.length) return article.topics;
  return JOURNAL_CATEGORY_ORDER.includes(article.category as JournalCategory)
    ? [article.category as JournalCategory]
    : ["Business"];
}

export function sortJournalArticles<T extends Pick<JournalArticleSource, "publishedAt" | "slug">>(
  articles: readonly T[],
) {
  return [...articles].sort(
    (left, right) =>
      right.publishedAt.localeCompare(left.publishedAt) ||
      left.slug.localeCompare(right.slug),
  );
}

export function getJournalArticleSummaries(
  articles: readonly JournalArticleSource[] = JOURNAL_ARTICLES,
): JournalArticleSummary[] {
  return sortJournalArticles(
    articles.map(({ slug, path, title, publishedAt, category, excerpt, topics }) => ({
      slug,
      path,
      title,
      publishedAt,
      category,
      excerpt,
      topics: normalizedTopics({ slug, path, title, publishedAt, category, excerpt, topics }),
    })),
  );
}

export function getJournalCategories(
  articles: readonly JournalArticleSummary[] = getJournalArticleSummaries(),
) {
  const available = new Set(articles.flatMap((article) => article.topics));
  return JOURNAL_CATEGORY_ORDER.filter((category) => available.has(category));
}

export function getLatestJournalArticles(limit = 3) {
  return getJournalArticleSummaries().slice(0, Math.max(0, limit));
}
