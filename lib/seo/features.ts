export type FeatureSection = {
  eyebrow: string;
  title: string;
  body: string;
  items: readonly string[];
};

export type FeatureSeoEntry = {
  slug: "online-booking" | "crm";
  path: `/features/${"online-booking" | "crm"}`;
  title: string;
  description: string;
  searchIntent: readonly string[];
  eyebrow: string;
  h1: string;
  intro: string;
  sections: readonly FeatureSection[];
  links: readonly { label: string; href: string }[];
  faqs: readonly { question: string; answer: string }[];
};

export const FEATURE_SEO: readonly FeatureSeoEntry[] = [
  {
    slug: "online-booking",
    path: "/features/online-booking",
    title: "Online Booking Website Builder for Service Businesses",
    description: "Add online booking to your business website with availability, schedules, client records, payments and notifications in one OneStudio system.",
    searchIntent: ["website builder with online booking", "online booking website builder", "website with appointment booking", "online booking for service businesses"],
    eyebrow: "ONLINE BOOKING",
    h1: "Online booking built into your business website",
    intro: "Give visitors a clear path from a service page to an available time. OneStudio connects the public booking flow to the schedule your business already has to manage.",
    sections: [
      { eyebrow: "THE VISITOR FLOW", title: "A useful next step, not another enquiry inbox", body: "A visitor can choose a service, review an available time, enter contact details and submit a booking. The booking then becomes part of the business schedule and client workflow.", items: ["Services from one business catalog", "Available time slots based on working windows", "Public customer booking flow", "Manual booking creation for the team"] },
      { eyebrow: "THE OPERATING VIEW", title: "Availability stays connected to the workday", body: "Teams can manage bookings in the administrative flow, coordinate staff or resources, and keep operational status changes visible. Google Calendar support is available where configured.", items: ["Working hours and availability", "Staff and resource allocation", "Calendar views and booking management", "Analytics derived from bookings"] },
      { eyebrow: "AFTER THE BOOKING", title: "The booking has somewhere to go", body: "A booking can be associated with a client record. Payment status and email reminders or notifications follow the configured workflow, so the website is connected to what happens next.", items: ["Client records and booking history", "Payments where enabled", "Email notifications and reminders where configured", "Custom domain for the public website"] },
    ],
    links: [{ label: "Explore CRM for client records", href: "/features/crm" }, { label: "See service business solutions", href: "/solutions" }, { label: "Browse real demos", href: "/demos" }, { label: "See pricing", href: "/pricing" }, { label: "Beauty salon solution", href: "/solutions/beauty-salon-website" }, { label: "Pet grooming solution", href: "/solutions/pet-grooming-website" }, { label: "Pilates studio solution", href: "/solutions/pilates-studio-website" }],
    faqs: [{ question: "Can a team add a booking manually?", answer: "Yes. The platform supports administrative booking flows as well as the public customer flow." }, { question: "Does OneStudio support payments and reminders?", answer: "Payments, email notifications and reminders are available where they are enabled and configured for the business." }],
  },
  {
    slug: "crm",
    path: "/features/crm",
    title: "Website Builder with CRM for Service Businesses",
    description: "Build your website and manage client records, booking history, contacts, notes and payments in the same OneStudio workspace.",
    searchIntent: ["website builder with CRM", "website with built in CRM", "CRM for service businesses", "small business website with CRM"],
    eyebrow: "CLIENTS AND CRM",
    h1: "Your website and CRM share the same client record",
    intro: "Keep the context around a customer close to the work. OneStudio joins contact details, bookings, notes and payment history so the team can continue a relationship without copying it between tools.",
    sections: [
      { eyebrow: "ONE CUSTOMER VIEW", title: "A client record that keeps its context", body: "The CRM is built around a canonical client card. Contact details, language, tags and notes give the team a useful record before and after an appointment.", items: ["Contact details and preferred language", "Tags and internal notes", "Canonical client records", "Protected duplicate review and merge flows"] },
      { eyebrow: "CONTINUITY", title: "Bookings become history, not isolated rows", body: "When a website booking or a team-created reservation is linked to a client, the business can see the relationship between the person, their bookings and the schedule.", items: ["Booking history linked to the client", "Reservations and schedule context", "Manual booking creation", "Operational analytics from clients and bookings"] },
      { eyebrow: "DAILY OPERATIONS", title: "Move from today’s visit to the next useful action", body: "Payment records and status are connected where configured. That gives the team a clearer operational handoff while keeping the public website and the client workspace in one system.", items: ["Payment and refund history where enabled", "Booking status and client context", "Email notifications and reminders where configured", "A website on a custom domain"] },
    ],
    links: [{ label: "Explore Online Booking", href: "/features/online-booking" }, { label: "See service business solutions", href: "/solutions" }, { label: "Browse real demos", href: "/demos" }, { label: "See pricing", href: "/pricing" }, { label: "Photography studio solution", href: "/solutions/photography-studio-website" }, { label: "Beauty salon solution", href: "/solutions/beauty-salon-website" }, { label: "Pet grooming solution", href: "/solutions/pet-grooming-website" }],
    faqs: [{ question: "What does the CRM connect to?", answer: "Client records can connect to reservations, booking history, notes, tags and payment records where enabled." }, { question: "Is this a sales pipeline CRM?", answer: "No. OneStudio focuses on service-business client continuity and operations rather than lead scoring or outbound campaigns." }],
  },
];

export const FEATURE_PATHS = FEATURE_SEO.map((feature) => feature.path) as readonly string[];
export function getFeature(slug: string) { return FEATURE_SEO.find((feature) => feature.slug === slug); }
