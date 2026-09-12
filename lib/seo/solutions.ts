export type SolutionDetailSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
};

export type SolutionInternalLink = {
  label: string;
  href: string;
};

export type Solution = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  problem: string;
  workflow: string[];
  capabilities: string[];
  demo?: { name: string; href: string; image: string; alt: string };
  detailSections?: SolutionDetailSection[];
  internalLinks?: SolutionInternalLink[];
  setup: string[];
  faqs: Array<{ q: string; a: string }>;
  related: string[];
};

export const SOLUTIONS: readonly Solution[] = [
  { slug: "photography-studio-website", title: "Photography Studio Website Builder with Online Booking", description: "Build a photography studio website with a visual portfolio, booking, client records, scheduling and analytics in one system.", eyebrow: "FOR PHOTOGRAPHY STUDIOS", h1: "A photography studio website built to turn visits into bookings", intro: "Show the work first, then give every serious enquiry a clear next step. OneStudio connects your portfolio, services and daily follow-up without asking you to stitch together separate tools.", problem: "A beautiful portfolio can still leave visitors wondering what to book, when you are available, or what happens after they send an enquiry. OneStudio keeps that path visible.", workflow: ["Visitor explores the portfolio", "Chooses a session or sends a request", "The business receives a client record", "You manage schedule, payment and follow-up"], capabilities: ["Visual portfolio and media management", "Services and session formats", "Booking or inquiry flow", "Availability and scheduling", "Client records and booking history", "Payments where enabled", "Reminders, notifications and analytics", "Custom domain"], demo: { name: "NOIR FRAME", href: "/demos/premium-studio", image: "/images/demos/premium-studio/bright/hero.webp", alt: "Bright NOIR FRAME photo studio" }, setup: ["Choose the NOIR FRAME starting point or create a site", "Add your services, availability and visual content", "Connect the booking/request flow and publish on your domain"], faqs: [{ q: "Can I use the site for inquiries instead of instant booking?", a: "Yes. The public flow can guide visitors to a request when a session needs a conversation first." }, { q: "Does OneStudio deliver finished photographs?", a: "No. The platform covers the website, client and operational flow; photo delivery is not presented as a built-in feature." }], related: ["beauty-salon-website", "pilates-studio-website"] },
  { slug: "beauty-salon-website", title: "Beauty Salon Website Builder with Online Booking", description: "Build a beauty salon website with services, specialists, online booking, client history, reminders and payments.", eyebrow: "FOR BEAUTY SALONS", h1: "A beauty salon website that books while your team works", intro: "Let clients understand the service, specialist and time before they arrive. OneStudio gives a salon a polished front door and a practical operating flow behind it.", problem: "Salon teams lose time answering the same questions about duration, availability and who can provide a service. A connected service menu and booking flow puts those answers in front of the client.", workflow: ["Client compares services and specialists", "Selects duration and an available time", "Booking creates or updates the client record", "Reminders and payment support the visit and the next one"], capabilities: ["Service menu with duration", "Specialist profiles and availability", "Online booking", "Client history and repeat visits", "Reminders and notifications", "Payments where enabled", "Portfolio and before/after-style content", "Custom domain"], demo: { name: "LUMEA Beauty", href: "/demos/lumea-beauty", image: "/templates/lumea-beauty/hero.webp", alt: "LUMEA Beauty salon" }, setup: ["Start with LUMEA Beauty and shape the visual language", "Load services, specialists, durations and working windows", "Publish the booking path, payment options and domain"], faqs: [{ q: "Can each specialist have different availability?", a: "OneStudio supports working windows and availability as part of the booking and scheduling flow." }, { q: "Can I see another salon direction?", a: "Yes. GLOSS is a second relevant example in the template catalog." }], related: ["photography-studio-website", "pet-grooming-website"] },
  { slug: "pet-grooming-website", title: "Pet Grooming Website Builder with Online Booking", description: "Build a pet grooming website with service packages, groomer availability, booking, customer records, reminders and payments.", eyebrow: "FOR PET GROOMERS", h1: "A grooming website that makes booking the easy part", intro: "Make packages, hours and the next available option easy to understand for busy pet owners. OneStudio helps a grooming business turn that clarity into an organized booking flow.", problem: "Grooming enquiries often arrive with the same questions: which package fits, how long will it take, and when is the next opening? Put the useful details on the site before the conversation starts.", workflow: ["Owner compares grooming packages", "Chooses a groomer, service or available time", "The request becomes a customer record", "Your team uses notes, history, reminders and payment status"], capabilities: ["Grooming services and packages", "Groomer/resource availability", "Online booking", "Customer records and booking history", "Booking notes where supported", "Reminders and notifications", "Gallery, hours and custom domain", "Payments where enabled"], demo: { name: "PAWHAUS Grooming Studio", href: "/demos/pawhaus-grooming-studio", image: "/templates/pawhaus-grooming-studio/hero.webp", alt: "PAWHAUS grooming studio" }, setup: ["Open the PAWHAUS starting point", "Add packages, hours, resources and the gallery", "Publish a clear booking path and connect your domain"], faqs: [{ q: "Does OneStudio include dedicated pet profiles?", a: "No. Customer records and booking history are supported; a dedicated medical or pet-profile system is not claimed." }, { q: "Can I take payment online?", a: "Payment support is available where enabled for the site configuration." }], related: ["beauty-salon-website", "kids-center-website"] },
  { slug: "pilates-studio-website", title: "Pilates Studio Website Builder with Online Booking", description: "Build a Pilates studio website with formats, trainers, schedules, trial-session booking, client records and analytics.", eyebrow: "FOR PILATES STUDIOS", h1: "A Pilates studio website that keeps the next session clear", intro: "Give a new client enough context to choose a format and make a first visit feel simple. OneStudio joins the studio story to the schedule and client workflow.", problem: "Potential clients can hesitate when formats, trainers and trial options are scattered across messages and social posts. A structured site answers those questions at the moment of intent.", workflow: ["Visitor explores formats and trainers", "Chooses a trial session or service", "Booking creates a client record", "The studio follows schedule, reminders and payment status"], capabilities: ["Formats and services", "Trainer profiles", "Schedules and availability", "Trial-session booking", "Client records", "Payments where enabled", "Pages, content and analytics", "Reminders and custom domain"], demo: { name: "ALIGN Pilates Studio", href: "/demos/align-pilates-studio", image: "/templates/align-pilates/hero.webp", alt: "ALIGN Pilates Studio" }, setup: ["Choose ALIGN as the visual starting point", "Add formats, trainers, schedule and trial option", "Publish useful pages and connect booking to your domain"], faqs: [{ q: "Does this manage class capacity?", a: "This page does not claim capacity management; use the existing booking configuration for the capabilities it exposes." }, { q: "Can I offer a trial session?", a: "Yes, a trial session can be presented as a service or booking option." }], related: ["photography-studio-website", "kids-center-website"] },
  { slug: "kids-center-website", title: "Kids Center Website Builder with Booking", description: "Build a kids activity center website with programs, age groups, teachers, trial requests, scheduling, payments and analytics.", eyebrow: "FOR KIDS ACTIVITY CENTERS", h1: "A kids center website that helps families choose the right start", intro: "Parents need a quick view of programs, age groups, teachers and the next step. OneStudio turns that information into a welcoming, workable path from first visit to trial request.", problem: "A center can have excellent programs and still make families work too hard to understand fit, timing and contact details. Put the decision-making information in one clear place.", workflow: ["Parent compares programs and age groups", "Reviews teachers and requests a trial lesson", "The center receives a parent/client contact record", "Staff coordinate schedule, reminders and payment status"], capabilities: ["Programs and age groups", "Teacher profiles", "Trial lesson or request flow", "Parent/client contacts", "Scheduling", "Payments where enabled", "Pages, content, reminders and analytics", "Custom domain"], demo: { name: "RASTEM", href: "/demos/rastem-center", image: "/templates/rastem-center/hero-platform.webp", alt: "Children learning at RASTEM" }, setup: ["Start with the RASTEM content structure", "Add programs, age groups, teachers and trial options", "Publish family-friendly pages and connect the schedule"], faqs: [{ q: "Is OneStudio an LMS?", a: "No. This solution covers the public website and operational booking/client flow; it does not claim school or LMS functionality." }, { q: "Can families request a trial lesson?", a: "Yes. A trial lesson can be represented through the available booking or request flow." }], related: ["pilates-studio-website", "pet-grooming-website"] },
  {
    slug: "photo-booth-booking-software",
    title: "Photo Booth Booking Software for Direct Event Bookings",
    description: "Build a photo booth website with booking or enquiry flow, availability, client history, payments, reminders and analytics in OneStudio.",
    eyebrow: "PHOTO BOOTH",
    h1: "Photo Booth Booking Software for Direct Event Bookings",
    intro: "A photo-booth business sells an experience, but the sale often begins with a surprisingly unglamorous sequence: is this date available, which package do you want, what time does the event start, how much is the deposit, and did we confirm Saturday or Sunday? The more events you book, the more expensive those tiny fragments of admin become.",
    problem: "Photo-booth websites often do the visual part well. They show weddings, corporate events, parties, backdrops and smiling guests, then the conversion path collapses into a Contact us form. OneStudio can connect the public side of the business with the operational side so standardized offers can use direct booking while custom work has a clear enquiry path.",
    workflow: [
      "Visitor moves from the portfolio to a standardized offer or a clear enquiry path",
      "The business checks duration, price, availability and required resources before opening direct booking",
      "A booking or enquiry stays connected to the client record, payment status and schedule",
      "The operator reviews confirmations, reminders, event details and operational analytics in the same workflow",
    ],
    capabilities: [
      "Branded website and service/package pages",
      "Media library and portfolio",
      "Online booking and a clear enquiry path",
      "Availability, working hours and generic staff/resource scheduling",
      "Client records and booking history",
      "Payment status and online payments or deposits where enabled",
      "Notifications and appointment reminders where configured",
      "Operational analytics",
    ],
    detailSections: [
      {
        title: "Move the client from portfolio to a real next step",
        paragraphs: [
          "A generic contact form can be useful, but it creates more work when the visitor's real question is whether a standard package can be booked on a particular date. A more operational website gives each visitor the right next step.",
          "The important part is not forcing every event through instant checkout. It is connecting the website to the workflow so enquiries and bookings do not vanish into a generic inbox.",
        ],
        bullets: [
          "Book now when the package, duration and availability are standardized.",
          "Enquire about this date when the event needs manual review.",
          "Ask for a custom quote when scope or pricing cannot be determined safely from a standard service.",
        ],
      },
      {
        title: "Decide which photo-booth offers are actually bookable",
        paragraphs: [
          "A photo-booth operator may sell a digital booth, a classic enclosed or open-air booth, a 360 booth, a corporate activation, a wedding package, a birthday or private-party package, a short weekday rental or a longer event package. These are examples only; the real offer may be different.",
          "Before making an offer instantly bookable, ask whether its duration is predictable, whether its price is predictable and whether availability can be represented accurately. A fixed local package is easier to book directly than a corporate activation requiring custom branding, travel, staffing or unusual installation.",
        ],
        bullets: [
          "A package with a predictable duration can be represented more safely than work whose operational time depends on venue access, guest count and custom production.",
          "A fixed-price local event is easier to book directly than work with custom branding, travel or unusual installation requirements.",
          "If two events would require the same booth, operator or transport window, the scheduling model must prevent both from being treated as independently available.",
        ],
      },
      {
        title: "Treat event duration as an operational block",
        paragraphs: [
          "A four-hour party may consume considerably more than four hours of capacity. The client-facing rental time does not have to expose every internal component, but the availability should protect the time the team genuinely needs.",
        ],
        steps: [
          "Setup: 60 minutes",
          "Event: 180 minutes",
          "Breakdown: 30 minutes",
          "Protected travel and reset: 60 minutes",
          "Real calendar cost: 330 minutes",
        ],
      },
      {
        title: "Use direct booking for standardized events",
        paragraphs: [
          "Direct booking works well when the client can make a safe choice without a long pre-sale conversation. A standardized package should make the duration, fixed price, service area, availability, setup requirements and deposit policy clear. The confirmation should say whether payment secures the booking and whether additional event details will be collected later.",
        ],
      },
      {
        title: "Use an enquiry and manual review for custom events",
        paragraphs: [
          "Some photo-booth work should not be instantly confirmed just because the calendar appears open. Use a clear enquiry path and review feasibility before confirming a booking. An enquiry is not a confirmed reservation simply because a client submitted a form.",
        ],
        bullets: [
          "Corporate activations",
          "Custom-branded booths",
          "Events outside the usual service area",
          "Unusual venue access",
          "Multi-booth requirements",
          "Long travel distances",
          "Events where setup time is uncertain",
          "Work that requires a custom scope or price",
        ],
      },
      {
        title: "Build a photo-booth website that answers booking questions",
        paragraphs: [
          "A useful photo-booth service page should name the booth type or package, describe what is included, explain event duration, state geographic limits and make the next action obvious. A portfolio is especially important because the client is buying something visual, and OneStudio publicly supports media libraries and portfolio use on the website.",
        ],
        bullets: [
          "Name the booth type or package clearly and explain what is included.",
          "State how long the booth runs and whether setup or breakdown sits outside the client-facing rental time.",
          "Explain different pricing outside the normal service area before the booking step.",
          "Use images that demonstrate the actual booth, lighting, backdrop or event style provided.",
          "Use a booking CTA for bookable offers and a clear enquiry CTA for work that needs review.",
        ],
      },
      {
        title: "Keep availability tied to the resources that matter",
        paragraphs: [
          "A photo-booth operator can be free while the required booth is not. OneStudio publicly supports schedules for staff, rooms, equipment or services when those resources are used in the project. That gives the business a foundation for resource-aware scheduling, but the configuration should stay simple and testable.",
          "OneStudio is not presented as a specialized rental inventory engine that atomically reserves a complex bundle of booth, attendant, backdrop, transport and printer. If a resource collision would ruin the event, test that collision before opening online booking.",
        ],
        bullets: [
          "An operator or attendant",
          "A specific booth",
          "A studio pickup or setup resource",
          "Another piece of equipment that cannot be used in two places at once",
        ],
      },
      {
        title: "Connect Google Calendar without making it the whole booking system",
        paragraphs: [
          "OneStudio connects to a separate OneStudio work calendar in Google Calendar. New or changed OneStudio bookings can appear in that work calendar, and busy events added to the same connected work calendar can block online availability when the integration is configured. OneStudio does not read unrelated personal Google calendars.",
          "If a personal, production or travel commitment must block booking time, add the unavailable period in OneStudio or place the event in the connected OneStudio work calendar. The client-facing booking logic should still live in the business workflow where the service, client, payment status and confirmation can stay connected.",
        ],
      },
      {
        title: "Keep client and booking history together",
        paragraphs: [
          "A photo-booth business has repeat opportunities: venues, planners, companies and private clients may come back. OneStudio's CRM functionality connects contact information with interaction and booking history, so the next enquiry does not have to start from zero.",
          "For complex event production, a specialist project tool may still be needed. The OneStudio value is that the website, booking relationship and client history can remain connected.",
        ],
        bullets: [
          "Corporate client; usually books weekday activations.",
          "Venue requires loading access confirmation.",
          "Requested follow-up after the final event schedule is confirmed.",
          "Repeat client from a June wedding booking.",
          "Keep notes factual and necessary. A CRM is not a place for gossip or irrelevant personal commentary.",
        ],
      },
      {
        title: "Use deposits, confirmations and reminders when they fit",
        paragraphs: [
          "Photo-booth events reserve a date that may be difficult to resell at short notice. OneStudio's public pricing and feature information supports online payments or deposits and payment statuses when payments are enabled in the project. Payment status can stay associated with the booking and client, but this is not a claim for automatic balance schedules, tax invoices, proposal-to-contract workflows, expense accounting or profit-per-event reporting.",
          "OneStudio publicly supports notification templates, appointment reminders and email sending where enabled. Use them to remove repetitive status-check messages, not to bombard clients with automation.",
        ],
        bullets: [
          "Package or service name",
          "Event date and time",
          "Status: booking confirmed, or enquiry received when a separate enquiry step is used",
          "Location information if already known",
          "Payment or deposit state if relevant",
          "What happens next and how to contact the business if something is wrong",
        ],
      },
      {
        title: "A conservative photo-booth setup",
        paragraphs: [
          "Build the website around real buying decisions, separate standard and custom work, protect setup and travel time, configure only the staff and resources you can reliably schedule, connect the separate OneStudio work calendar if you use Google Calendar, and run a full test event through the system on mobile before launch.",
        ],
        steps: [
          "Create service and package pages with the booth, event type, duration, price or pricing logic, service area and visual examples.",
          "Mark which offers are suitable for direct booking and which should begin with an enquiry and manual review.",
          "Create matching booking services with the same names and durations clients saw on the website.",
          "Protect setup, breakdown and travel time so the public schedule is physically possible.",
          "Represent only the resources you can reliably schedule and test double-booking scenarios before launch.",
          "Verify that OneStudio bookings appear in the connected work calendar and that busy events in that same calendar block availability as expected. Do not assume unrelated personal calendars are read.",
          "Configure deposit or payment rules where used and make the booking state clear before and after payment.",
          "Review confirmations and reminders so the client does not have to ask whether the event is confirmed.",
          "Run a fresh-browser and mobile test, then verify the booking, client record, calendar state, payment status and notifications on the admin side.",
        ],
      },
      {
        title: "Example: standard wedding booth package",
        paragraphs: [
          "A small operator offers a three-hour wedding booth within a defined local service area. The package has a fixed price and known setup time. The website shows the wedding booth page and portfolio, the client selects the standard package, the booking system shows dates and times that fit configured availability, and the client completes the booking and deposit step if enabled. The booking and client record appear together, the confirmation explains the event state and next steps, and a reminder is sent according to the configured workflow.",
          "The operator may still collect final venue logistics manually later. The improvement is that availability and the initial booking are no longer managed through scattered messages.",
        ],
      },
      {
        title: "Example: corporate activation that needs manual review",
        paragraphs: [
          "A corporate prospect wants a branded booth for a product launch, with custom artwork, an unusual setup window and a venue outside the normal service area. This is not a good candidate for automatic confirmation simply because the calendar is empty.",
          "The website should route the prospect to a clear enquiry path instead. The business reviews requirements, confirms feasibility and only then creates or confirms the booking through the workflow it actually uses.",
        ],
      },
      {
        title: "OneStudio versus specialist photo-booth CRM software",
        paragraphs: [
          "Current photo-booth search results are filled with highly specialized products. That context shows where OneStudio should be precise. OneStudio can connect a branded website to a booking or enquiry path, availability, generic staff or resources, the connected work calendar, client history, payment status where enabled, deposits or online payment where enabled, confirmations, reminders and operational analytics.",
        ],
        bullets: [
          "Branded website: OneStudio supports it; specialist photo-booth CRMs often do too.",
          "Portfolio and media: OneStudio supports it; specialists sometimes do.",
          "Online booking or enquiry path: OneStudio supports it; specialists do too.",
          "Availability, staff and resources: OneStudio supports general scheduling; specialists often advertise it.",
          "Google Calendar integration: OneStudio uses a separate connected work calendar; specialists often advertise calendar feeds or sync.",
          "Client history and CRM: OneStudio supports general client history connected to bookings; specialists commonly do too.",
          "Payment status and deposits or online payment: available where enabled in OneStudio; common in specialist tools.",
          "Confirmations, reminders and operational analytics: supported where configured or available in OneStudio; common in specialist tools.",
          "Instant quote rules, package add-on engines, automated contracts or e-signatures, invoice or tax workflows, backdrop or prop selectors, client portals, photo gallery delivery and event-mode gear lists: not currently claimed OneStudio capabilities and commonly advertised by specialist tools.",
        ],
      },
      {
        title: "Photo booth CRM versus booking software",
        paragraphs: [
          "Booking software focuses on what a client can book, when it is available, whether the booking is confirmed and whether required payment has been recorded. CRM focuses on who the client is, what they booked before, their current booking history and what the team needs when they return.",
          "OneStudio connects both layers at a general service-business level. It does not currently claim the deeper event-sales pipeline features that some products market as photo booth CRM.",
        ],
      },
      {
        title: "When OneStudio is a good fit",
        bullets: [
          "You want the public website and booking workflow in the same system.",
          "Most bookings are standardized enough for direct booking, with a separate enquiry path for unusual events.",
          "You want to show actual availability and protect operational capacity.",
          "You need client history without a separate spreadsheet.",
          "You want payment status connected to the booking.",
          "You use the connected OneStudio work calendar in Google Calendar and want its busy events reflected in booking availability.",
          "You want confirmations, reminders and basic operational analytics.",
          "You prefer to own the customer path on your website rather than depend only on marketplaces or social messages.",
        ],
      },
      {
        title: "When specialist software may be needed",
        paragraphs: [
          "A specialist photo-booth platform may be a better fit if the core workflow requires capabilities that OneStudio does not currently claim.",
        ],
        bullets: [
          "Automated proposals",
          "Quote formulas with many add-ons",
          "E-sign contracts",
          "Backdrop or template selection during checkout",
          "Artwork approval",
          "Client portals",
          "Photo-gallery delivery",
          "Event-day equipment lists",
          "Complex tax or invoice workflows",
          "Multi-stage balance collection",
          "Deep booth inventory management",
        ],
      },
      {
        title: "Questions to ask before choosing photo-booth booking software",
        bullets: [
          "Can I offer real availability rather than saying we will check the date?",
          "Can I keep custom events out of instant booking?",
          "Can I protect setup, breakdown and travel time?",
          "Can I stop the same critical resource from being treated as free twice?",
          "Can I see client history beside the event?",
          "Do I need booth-specific contracts, proposals or galleries?",
        ],
      },
    ],
    internalLinks: [
      { label: "Explore online booking", href: "/features/online-booking" },
      { label: "Learn about CRM and client history", href: "/features/crm" },
      { label: "See OneStudio plans", href: "/pricing" },
      { label: "Compare the photography studio workflow", href: "/solutions/photography-studio-website" },
    ],
    setup: [
      "Create service and package pages around real buying decisions.",
      "Configure matching services, realistic durations, resources, the connected work calendar and payment or reminder rules where used.",
      "Run a full mobile test event and verify the booking, client record, calendar state, payment status and notifications.",
    ],
    faqs: [
      { q: "What is photo booth booking software?", a: "Photo booth booking software helps an operator accept event bookings, manage availability and organize customer and event information. Custom events may still begin with an enquiry and manual review. Specialist photo-booth platforms may also include quotes, contracts, invoices, add-ons, client portals and gallery delivery." },
      { q: "Can clients book a photo booth online with OneStudio?", a: "Yes. OneStudio publicly supports online booking and configurable availability. Standardized packages can use direct booking. Custom events that need feasibility or pricing review should use a separate enquiry path rather than being presented as instantly confirmed." },
      { q: "Can OneStudio take photo booth deposits?", a: "OneStudio public pricing includes online payments or deposits on applicable plans, and the feature set includes payment statuses when payments are enabled in the project. Exact payment setup depends on project configuration." },
      { q: "Does OneStudio include contracts and e-signatures for photo booth events?", a: "Automated contracts and e-signatures are not currently verified OneStudio capabilities and should not be promised. Specialized photo-booth CRMs commonly include them." },
      { q: "Does OneStudio deliver event photo galleries?", a: "OneStudio supports website media and portfolio use, but a client-facing event-gallery delivery workflow is not currently a verified product capability." },
      { q: "Can I connect Google Calendar?", a: "Yes. OneStudio uses a separate connected OneStudio work calendar in Google Calendar. OneStudio bookings can sync to it, and busy events added to that connected work calendar can be considered during online booking when configured. Unrelated personal Google calendars are not read." },
      { q: "Is OneStudio a full photo booth CRM?", a: "It includes general CRM and client-history capabilities connected to bookings, but it is not currently positioned as a specialist photo-booth sales and production CRM with proposals, contracts, backdrop selectors, gallery delivery and event-production tooling." },
    ],
    related: ["photography-studio-website"],
  },
  {
    slug: "dog-trainer-booking-software",
    title: "Dog Trainer Booking Software for Private Sessions",
    description: "Create a dog training website with online booking, real availability, client history, reminders, payments and a connected work calendar in OneStudio.",
    eyebrow: "DOG TRAINING",
    h1: "Dog Trainer Booking Software for Private Sessions and Small Teams",
    intro: "A dog-training business can look wonderfully simple from the outside: a client chooses a session, arrives with a dog, and training begins. Behind the scenes, the calendar can become a thicket of messages, rescheduling, travel time, different session lengths, unpaid deposits, forgotten follow-ups and notes that live everywhere except where you need them. OneStudio gives appointment-based dog trainers a simpler operating model by connecting the website, services, availability, bookings and client history in one system.",
    problem: "Many trainers still use a patchwork of website or social messages, manual availability, separate calendars, spreadsheets and payment checks. A connected booking flow removes repetitive steps while keeping the public service choice, real availability, booking, client record and follow-up in the same workflow.",
    workflow: [
      "Client understands the service and chooses a private session or sends an enquiry first when judgement is needed",
      "Availability is shown from the working hours, exceptions and staff or resource schedule the business maintains",
      "The booking stays connected to the client record, booking history, payment status and reminders",
      "The trainer or small team reviews bookings, cancellations, clients and booked hours in operational analytics",
    ],
    capabilities: [
      "Branded dog-training website",
      "Services with clear durations and pricing context",
      "Online booking and configurable availability",
      "Trainer, room or equipment scheduling where relevant",
      "Client records and booking history",
      "Payment status and online payments or deposits where enabled",
      "Confirmations, notifications and reminders where configured",
      "Operational analytics",
    ],
    detailSections: [
      {
        title: "Turn the dog-training website into a booking path",
        paragraphs: [
          "A potential client often starts with a website or social profile, sends a message, asks what is available, receives several times, and waits while one of those times disappears. Nothing in that process is impossible, but every booking creates small pieces of admin.",
          "A connected booking flow lets the site explain the service, the client select an appropriate appointment type and availability come from the schedule the trainer maintains. The resulting booking stays connected to the client record instead of disappearing into a message history. A behaviour consultation may lead to a follow-up, a puppy session may lead to later training, and a returning client can be understood without reconstructing the relationship from old messages.",
        ],
        steps: [
          "A potential client finds the website or social profile.",
          "They choose an appropriate service or send an enquiry.",
          "The available time is selected from the maintained schedule.",
          "The booking becomes part of the client and operational record.",
        ],
      },
      {
        title: "Build services around the way you actually train",
        paragraphs: [
          "Instead of one generic item called Dog training, create distinct appointment types with meaningful names and durations. The following are examples, not required service names or suggested prices.",
        ],
        bullets: [
          "Initial private consultation: 60 to 90 minutes; direct booking or enquiry first when assessment is needed.",
          "Puppy private session: 45 to 60 minutes; direct booking when the format is standardized.",
          "Behaviour consultation: 60 to 90 minutes; direct booking if scope is predictable, otherwise enquiry first.",
          "Follow-up training session: 45 to 60 minutes; direct booking for existing clients.",
          "In-home private training: 60 to 90 minutes plus a travel buffer; direct booking only when service area and travel rules are manageable.",
          "Online consultation: 45 to 60 minutes when offered.",
        ],
      },
      {
        title: "Make duration part of real availability",
        paragraphs: [
          "If an initial consultation needs 90 minutes, listing it as 60 minutes just to create more calendar space does not create more capacity. Set the duration around the real work and protect time between appointments. For an in-home visit, a one-hour lesson may consume considerably more than one hour once travel is included.",
        ],
        steps: [
          "Bookable session time",
          "Required transition or travel time",
          "Real calendar cost",
        ],
      },
      {
        title: "Let clients see suitable availability without seeing the whole calendar",
        paragraphs: [
          "Clients do not need access to a private calendar. They need to know when the selected service can actually be booked. With OneStudio, the business can define working days and hours and add unavailable periods such as time off. Public product information also supports schedules for staff, rooms, equipment or services when those resources are used in a project.",
          "The internal schedule determines what is possible, the client sees only suitable booking options, and booked or blocked time is not offered again. This is more reliable than manually posting available times on social media and updating them after every booking.",
        ],
      },
      {
        title: "Use an enquiry first when the appointment needs judgement",
        paragraphs: [
          "Not every dog-training enquiry should become an instant confirmed appointment. Direct booking works best when the service is standardized enough for the client to choose safely. An enquiry first is safer when the trainer needs to understand the situation before deciding which appointment to offer. A routine puppy consultation may be directly bookable, while a complex behavioural case may begin with an enquiry. An enquiry is not a confirmed appointment.",
        ],
      },
      {
        title: "Keep private-session scheduling manageable for solo trainers",
        paragraphs: [
          "A solo trainer usually does not need a giant operations platform. The useful basics are a clear service list, realistic working hours, a separate connected OneStudio work calendar in Google Calendar where used, a clear choice between direct booking and enquiry, mobile testing and accurate confirmations.",
        ],
        steps: [
          "Publish the core services with names, durations and pricing context that clients can understand.",
          "Set working days and hours, including admin, lunch, travel and preparation time.",
          "Connect the separate OneStudio work calendar in Google Calendar. OneStudio does not read unrelated personal Google calendars.",
          "Decide which services can be booked directly and which should begin with an enquiry and manual review.",
          "Test the booking path on a phone as a new client before sharing the page.",
        ],
      },
      {
        title: "Give small teams a clearer view of trainer availability",
        paragraphs: [
          "For a small dog-training team, open time is not enough. The right trainer needs to be available too. OneStudio supports staff, resources and their schedules in the public product description, so appointment availability can be organized around the people or resources actually used by the project.",
          "This is appointment scheduling rather than a full dog-school class engine. Current public materials do not establish class capacities, course cohorts, attendance tracking or package-credit consumption.",
        ],
        bullets: [
          "Trainer working hours",
          "Services each trainer actually performs",
          "Unavailable periods",
          "Rooms or equipment when relevant",
          "Busy time in the connected OneStudio work calendar",
          "Confirmed bookings",
        ],
      },
      {
        title: "Keep the client record beside the booking history",
        paragraphs: [
          "Dog-training relationships often span more than one appointment. OneStudio's CRM functionality publicly includes client contact information, interaction history and linked bookings in one record. That gives the business a place to understand the relationship without reconstructing it from email and chat threads.",
          "General client notes should be concise, factual and operational. Avoid turning them into an improvised medical or behavioural database. Do not store sensitive information simply because a free-text box exists. If structured health, vaccination or regulated records are needed, use a system designed for those requirements.",
        ],
        bullets: [
          "Prefers weekday morning appointments.",
          "Follow-up requested after initial consultation.",
          "Usually books 60-minute private sessions.",
          "Asked to confirm location before the next visit.",
        ],
      },
      {
        title: "Use reminders to remove repetitive follow-up",
        paragraphs: [
          "A booking is not finished when it enters the calendar. OneStudio's public feature set includes notifications, appointment reminders and email sending when enabled in the project. The useful part is sending the right message at the right stage, including the service, time, location and what the client should do if something changes.",
        ],
        steps: [
          "Booking confirmation, or acknowledgement of an enquiry when that path is used",
          "Any follow-up needed before the appointment",
          "Reminder before the session",
          "Manual follow-up when the training workflow requires it",
        ],
      },
      {
        title: "Keep payment status attached to the appointment",
        paragraphs: [
          "For businesses that use online payments or deposits, OneStudio can keep payment status associated with the booking and client. Public product information supports payment status and online payment or deposits where enabled. The distinction is between payment capability and dog-training-specific package management.",
          "OneStudio should be described as supporting payments or deposits where enabled. It should not be described as automatically managing six-session training packages, expiring lesson credits, membership renewals or course balances unless those features are separately implemented and verified.",
        ],
      },
      {
        title: "Explain the service before the calendar appears",
        paragraphs: [
          "A booking page is stronger when the visitor knows what they are choosing. Before the booking CTA, explain the actual training service, who the session is for, where training happens, how long it takes, what it costs and what happens after booking.",
        ],
        bullets: [
          "Private puppy sessions, behaviour consultations, obedience coaching, online consultations or another clearly defined format.",
          "Whether an initial consultation is required before follow-up sessions.",
          "Whether sessions happen at the trainer's location, at the client's home, outdoors or online.",
          "The expected duration and any travel or scope factors affecting final price.",
          "Whether the appointment is immediately confirmed, begins with an enquiry, needs a deposit or will be followed by additional instructions.",
        ],
      },
      {
        title: "Online booking versus enquiry-only forms",
        paragraphs: [
          "A contact form says tell me you are interested. Online booking says choose an appropriate service and available time. For complex cases, a separate enquiry step can sit before booking so the trainer can assess fit without pretending that every submission is automatically confirmed.",
        ],
        bullets: [
          "Direct online booking works when the service is clearly defined, duration is predictable, real availability can be exposed, a detailed pre-assessment is not required, and location and price are straightforward.",
          "An enquiry first is safer when the case needs discussion, travel distance affects feasibility or price, the trainer needs information before confirming, the work may require referral to another professional, or appointment length cannot be chosen reliably by the client.",
          "The website can explain which services are directly bookable and which begin with an enquiry. Every visitor does not have to use the same path.",
        ],
      },
      {
        title: "A practical dog-trainer setup in OneStudio",
        steps: [
          "Build public service pages with real images, real descriptions and a direct next step.",
          "Create matching booking services with names recognizable from the website.",
          "Set accurate durations and add protected time around appointments when necessary.",
          "Add trainer availability, working days, working hours and unavailable dates.",
          "Connect the separate OneStudio work calendar in Google Calendar if used. Verify that OneStudio bookings appear there and that busy events added to that same connected work calendar block availability as expected. Unrelated personal Google calendars are not read.",
          "Decide which services can be directly booked and which should begin with an enquiry and manual review.",
          "Configure payment only where it fits the policy and make the amount and booking status clear.",
          "Review confirmations and reminders for accurate service, time and location information.",
          "Use a fresh browser and phone to test the appointment, then verify the booking, client record, calendar state, payment state and notification.",
        ],
      },
      {
        title: "Example: private trainer with home visits and online follow-ups",
        paragraphs: [
          "Imagine a solo trainer who offers a 75-minute initial consultation, a 60-minute in-home private lesson and a 45-minute online follow-up. The trainer blocks travel time around home visits, exposes only usable appointment times and uses direct booking for online follow-ups. New behaviour cases begin with an enquiry because the trainer wants to confirm fit before committing to a time.",
          "The website explains the difference. Returning clients no longer have to ask for the same availability information by message, and the trainer can open the client record to see prior bookings before responding. The business is not using OneStudio as a clinical record or dog-progress platform; it is using OneStudio for the connected site, booking, client history, payment status and communication workflow.",
        ],
      },
      {
        title: "Example: two-trainer dog-training practice",
        paragraphs: [
          "A small practice has two trainers with different working days. Both offer private puppy sessions, while only one offers longer behaviour consultations. A sensible setup is to create the service types with different durations, assign availability around the trainers who actually perform them, keep relevant busy time in the connected OneStudio work calendar when Google Calendar is used, let clients choose from real availability and keep each confirmed appointment linked to client history.",
          "If the practice later adds group puppy classes with attendance limits, multi-week cohorts, package credits and vaccination requirements, that is the point to evaluate whether specialist class-management features are also needed.",
        ],
      },
      {
        title: "What OneStudio replaces, and what it does not",
        paragraphs: [
          "The useful boundary is not a claim that a general platform includes every specialist feature. It is a clear distinction between the appointment-based workflow OneStudio connects and the structured pet or class records it does not currently claim.",
        ],
        bullets: [
          "Website: OneStudio fit is yes; a typical disconnected method is a separate site builder.",
          "Service descriptions: OneStudio fit is yes; a typical disconnected method is website pages or social posts.",
          "Appointment availability: OneStudio fit is yes; a typical disconnected method is messages or calendar screenshots.",
          "Online private-session booking: OneStudio fit is yes; a typical disconnected method is a separate scheduler.",
          "Connected OneStudio work calendar in Google Calendar: supported integration; unrelated personal calendars are not read.",
          "Client contact and booking history: OneStudio fit is yes; a typical disconnected method is a spreadsheet or inbox.",
          "Payment status: OneStudio fit is yes where payments are enabled.",
          "Reminders and booking analytics: supported where configured or available.",
          "Dog-specific profiles, vaccination records, training plans or homework, group-class capacity, boarding or kennel occupancy and e-sign contracts: not currently claimed OneStudio capabilities.",
        ],
      },
      {
        title: "Questions to ask before choosing dog trainer booking software",
        bullets: [
          "Can clients understand the service before they choose a time?",
          "Does availability reflect real working capacity, including durations, travel, breaks, staff schedules and busy time?",
          "Can I distinguish a confirmed booking from an enquiry?",
          "Will client history survive beyond one appointment?",
          "Can I see payment status beside the booking?",
          "Does it support the specialist features I genuinely need, such as classes, package credits, detailed dog records, waivers or boarding?",
        ],
      },
    ],
    internalLinks: [
      { label: "Explore online booking", href: "/features/online-booking" },
      { label: "Learn about CRM and client history", href: "/features/crm" },
      { label: "See OneStudio plans", href: "/pricing" },
      { label: "Compare the pet-service workflow", href: "/solutions/pet-grooming-website" },
    ],
    setup: [
      "Publish clear private-session service pages and matching booking services.",
      "Set realistic durations, trainer availability, the connected work calendar and payment or reminder rules where used.",
      "Test a direct booking and an enquiry path on mobile, then verify the client record, calendar state, payment state and notifications.",
    ],
    faqs: [
      { q: "What is dog trainer booking software?", a: "Dog trainer booking software helps a training business manage appointment availability and let clients book suitable sessions online. Depending on the product, it may also connect client records, payments, reminders and calendars. Specialist dog-training platforms can add features such as dog profiles, class capacity or training plans; those features are not universal." },
      { q: "Can clients book dog-training sessions online with OneStudio?", a: "Yes. OneStudio publicly supports online booking and configurable availability. It is a good fit for clearly defined appointment-based services such as private consultations and follow-up sessions." },
      { q: "Can I connect Google Calendar?", a: "Yes. OneStudio uses a separate connected OneStudio work calendar in Google Calendar. New or changed OneStudio bookings can appear there, and busy events added to that connected work calendar can be considered during online booking when configured. Unrelated personal Google calendars are not read." },
      { q: "Can OneStudio store dog vaccination records or training plans?", a: "Those are not currently verified OneStudio capabilities and should not be assumed. If structured pet records, vaccinations or training-plan tracking are essential to the business, use a specialist system that explicitly supports them." },
      { q: "Is OneStudio suitable for puppy classes or group courses?", a: "OneStudio can support appointment-style services and resource schedules, but current public product information does not establish group-class capacity, attendance, course cohorts or package-credit management. A private-session business is the cleaner fit today." },
      { q: "Can a dog trainer take deposits or online payments?", a: "OneStudio public pricing and feature information includes online payments or deposits and payment statuses where payment is enabled in the project. Exact payment setup can depend on the project configuration." },
    ],
    related: ["pet-grooming-website"],
  },
];

export const SOLUTION_PATHS = ["/solutions", ...SOLUTIONS.map((solution) => `/solutions/${solution.slug}`)] as const;
export function getSolution(slug: string) { return SOLUTIONS.find((solution) => solution.slug === slug); }
