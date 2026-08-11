import {
  DEFAULT_VELORA_CONTENT,
  type VeloraContent,
} from "./velora-premium-template-content.ts";

const mergeItems = (
  source: VeloraContent["venues"],
  translations: Array<Record<string, string>>,
) => source.map((item, index) => ({ ...item, ...translations[index] }));

export function createVeloraEnglishContent(): VeloraContent {
  const content = structuredClone(DEFAULT_VELORA_CONTENT);
  content.navigation = mergeItems(content.navigation, [
    { label: "Spaces" },
    { label: "Experiences" },
    { label: "Stories" },
    { label: "Gallery" },
  ]);
  Object.assign(content.header, {
    venuesPageLabel: "Explore spaces",
    availabilityLabel: "Check your date",
    menuLabel: "Menu",
  });
  Object.assign(content.hero, {
    eyebrow: "VELORA · EVENT HOUSE · KYIV",
    title: "An evening that stays with you forever.",
    text: "Light, flavour and space shaped by one team — from the first sketch to the final toast.",
    primaryLabel: "Check availability",
    secondaryLabel: "Explore the spaces",
    alt: "VELORA event hall glowing with candlelight at blue hour",
    traits: "Kyiv · 3 spaces · 12–220 guests",
    scrollLabel: "Discover VELORA",
  });
  content.facts = mergeItems(content.facts, [
    { label: "events created" },
    { label: "years of experience" },
    { label: "demo guest rating" },
    { label: "guests without compromise" },
  ]);
  Object.assign(content.venuesPresentation, {
    title: "One place. Three completely different moods.",
    pageLabel: "Compare every space",
    text: "Choose the scale and character. We will shape the light, layout and rhythm of the evening.",
  });
  content.venues = mergeItems(content.venues, [
    {
      mood: "Cinematic scale",
      capacity: "80–220 guests",
      features: "Soaring ceiling · stage · panoramic glass",
      formats: "Weddings · galas · premieres",
      seating: "banquet 220 · theatre 300",
      alt: "Grand Hall prepared for an elegant evening banquet",
      cta: "Choose Grand Hall",
    },
    {
      mood: "Light and garden",
      capacity: "40–110 guests",
      features: "Glasshouse · terrace · complete indoor rain plan",
      formats: "Ceremonies · dinners · birthdays",
      seating: "banquet 110 · cocktail 160",
      alt: "Garden Room surrounded by greenery in golden light",
      cta: "Choose Garden Room",
    },
    {
      mood: "Private and close",
      capacity: "12–48 guests",
      features: "Private bar · fireplace · separate entrance",
      formats: "Dinners · anniversaries · private meetings",
      seating: "table 32 · cocktail 48",
      alt: "Intimate Atelier prepared for a private dinner",
      cta: "Choose Atelier",
    },
  ]);
  Object.assign(content.formatsPresentation, {
    eyebrow: "YOUR FORMAT",
    title: "See your evening before we begin planning it.",
  });
  content.formats = mergeItems(content.formats, [
    { title: "Wedding", text: "Ceremony, dinner and dancing told as one flowing story." },
    { title: "Private dinner", text: "One table, a bespoke menu and complete privacy." },
    { title: "Birthday", text: "A celebration paced to feel entirely like you." },
    { title: "Corporate event", text: "Warm hospitality backed by precise production." },
    { title: "Show or premiere", text: "Set design, light and technical support for a memorable debut." },
    { title: "Ceremony", text: "In the garden or indoors, with no anxiety about the weather." },
  ]);
  Object.assign(content.transformation, {
    eyebrow: "TRANSFORMATION",
    title: "The same room. A completely different story.",
    text: "Move the slider to see how light, textiles and florals turn empty architecture into a finished evening.",
    beforeLabel: "Before",
    afterLabel: "After",
    beforeAlt: "Empty hall before event preparation",
    afterAlt: "The same hall after complete event styling",
  });
  Object.assign(content.storyPresentation, {
    eyebrow: "FROM SILENCE TO THE LAST DANCE",
    title: "The space wakes up one step at a time.",
    text: "We do not simply add decor. We build momentum: light, table, flowers, people, music.",
  });
  content.story = mergeItems(content.story, [
    { title: "Empty room", text: "Architecture sets the rhythm." },
    { title: "First light", text: "Warmth reveals every detail." },
    { title: "The table", text: "Every place begins to wait for a guest." },
    { title: "Flowers", text: "Colour establishes the tone." },
    { title: "Guests", text: "The room starts to live." },
    { title: "Evening", text: "Everything flows without effort." },
  ]);
  Object.assign(content.packagesPresentation, {
    eyebrow: "READY-MADE EXPERIENCES",
    title: "Choose how much you want us to take care of.",
    pageLabel: "Explore packages in detail",
    text: "Every level can be personalised. What changes is the scale and the time you get back.",
  });
  content.packages = mergeItems(content.packages, [
    {
      result: "A beautiful, calm foundation",
      price: "from €16,900",
      for: "for intimate events",
      includes: "Space · furniture · essential lighting · host care",
      decor: "subtle accents",
      menu: "seasonal menu",
      alt: "Intimate table in the Essential package",
      cta: "Choose Essential",
    },
    {
      result: "One atmosphere from the very first step",
      price: "from €31,900",
      for: "for weddings and larger dinners",
      includes: "Full venue · welcome drink · lighting · coordination · florals",
      decor: "personal colour story",
      menu: "Signature menu and pairing",
      alt: "Candlelit dinner in the Signature package",
      cta: "Choose Signature",
    },
    {
      result: "An evening with complete direction",
      price: "from €57,900",
      for: "for large-scale events",
      includes: "Exclusivity · set design · production · full team · rehearsal",
      decor: "bespoke installation",
      menu: "a menu created from scratch",
      alt: "Large evening celebration in the Iconic package",
      cta: "Choose Iconic",
    },
  ]);
  Object.assign(content.includedPresentation, {
    eyebrow: "CALM INCLUDED",
    title: "Ten things you will never have to coordinate.",
    text: "One accountable team, one timeline and no calls to five separate suppliers.",
  });
  content.included = mergeItems(content.included, [
    { title: "Space" },
    { title: "Furniture" },
    { title: "Lighting" },
    { title: "Sound" },
    { title: "Tableware" },
    { title: "Decor" },
    { title: "Coordination" },
    { title: "Setup" },
    { title: "Cleaning" },
    { title: "Team care" },
  ]);
  Object.assign(content.cateringPresentation, {
    title: "Flavour that follows the rhythm of the night.",
    text: "Seasonal menus, signature cocktails and service that appears exactly when it should.",
    alt: "Refined VELORA dinner plates and champagne cocktails",
    cta: "Talk to us about the menu",
  });
  content.catering = mergeItems(content.catering, [
    { title: "Seasonal menu", text: "Four or six courses, with plant-based options.", meta: "from €290 per guest" },
    { title: "Welcome ritual", text: "Champagne, a signature cocktail or an alcohol-free pairing.", meta: "shaped around the occasion" },
    { title: "Your flavours", text: "A tasting and personalisation before the event.", meta: "never one rigid formula" },
  ]);
  Object.assign(content.decor, {
    title: "We do not decorate a room. We design a mood.",
    text: "Florals, light, textiles, stationery and the table plan become one moodboard — built around your character, never a catalogue set.",
    alt: "VELORA decor with florals, candlelight and elegant tableware",
  });
  Object.assign(content.coordinator, {
    eyebrow: "YOUR COORDINATOR",
    title: "Someone who remembers everything — so you do not have to.",
    text: "Marta leads the meetings, gathers decisions and keeps every supplier aligned. On the day, she is half a step ahead of the timeline and always close to you.",
    promise: "One person from the first conversation to the end of the night.",
    alt: "VELORA coordinator preparing the room before an event",
  });
  Object.assign(content.reviewsPresentation, {
    title: "Real needs. Demonstration stories.",
    disclaimer: "The names and stories below are fictional content created for the VELORA demonstration.",
  });
  content.reviews = mergeItems(content.reviews, [
    {
      quote: "We wanted dinner to become a party naturally after dessert. We did not check the time once.",
      author: "Ola & Michael · demo story",
      meta: "Wedding · Grand Hall · 126 guests",
      task: "ceremony and dancing without pauses",
      alt: "Guests dancing at a fictional VELORA wedding",
    },
    {
      quote: "The team received a short brief and returned a complete evening — from the light to the final drink.",
      author: "Studio North · demo story",
      meta: "Premiere · Garden Room · 84 guests",
      task: "a brand presence that stayed subtle",
      alt: "Fictional premiere event at VELORA",
    },
    {
      quote: "Atelier felt as close as home, with the care of a truly excellent restaurant.",
      author: "The W. family · demo story",
      meta: "Anniversary · Atelier · 28 guests",
      task: "private, with no rigid protocol",
      alt: "Fictional intimate anniversary dinner in Atelier",
    },
  ]);
  Object.assign(content.galleryPresentation, {
    eyebrow: "AFTER DARK",
    title: "See VELORA come alive.",
    dialogLabel: "VELORA event gallery",
    closeLabel: "Close gallery",
    openLabel: "Open photograph",
    previousLabel: "Previous photograph",
    nextLabel: "Next photograph",
  });
  content.gallery = mergeItems(content.gallery, [
    { alt: "Evening banquet in Grand Hall" },
    { alt: "Guests dancing in the evening light" },
    { alt: "Seasonal VELORA menu and drinks" },
    { alt: "Ceremony in the bright Garden Room" },
    { alt: "The coordinator checks the final table setting" },
    { alt: "An intimate evening in Atelier" },
  ]);
  Object.assign(content.plannerPresentation, {
    eyebrow: "HOW IT WORKS",
    title: "From a date to a finished evening — without chaos.",
    text: "We begin with one short conversation, then create a proposal around your people, place and budget.",
  });
  content.planner = mergeItems(content.planner, [
    { title: "We check the date", text: "An answer within one working day." },
    { title: "We talk", text: "Thirty minutes about guests, rhythm and priorities." },
    { title: "You receive a proposal", text: "Space, menu, styling and a clear budget." },
    { title: "We plan", text: "Every decision enters one shared timeline." },
    { title: "You celebrate", text: "The team runs the day while you stay with your guests." },
  ]);
  Object.assign(content.faqPresentation, {
    eyebrow: "EVERYTHING CLEAR",
    title: "Questions worth asking before you book.",
  });
  content.faq = mergeItems(content.faq, [
    { question: "What exactly is included?", answer: "The scope follows your package, but the space, equipment, preparation and team care are always included. Every item is visible in the proposal." },
    { question: "Can we change a package?", answer: "Yes. A package is a starting point; the menu, decor and production are configured around you." },
    { question: "What happens if it rains?", answer: "Garden Room has a complete indoor ceremony plan. We make the weather decision 24 hours before the event with no added fee." },
    { question: "Can we bring our own suppliers?", answer: "Yes, once setup, safety and timings have been agreed with your coordinator." },
    { question: "When should we book?", answer: "Seasonal Saturdays are best booked 10–14 months ahead. Dinners and corporate events often fit within 6–10 weeks." },
    { question: "How does the deposit work?", answer: "The date is secured by a contract and the deposit shown in your proposal. Sending the form alone does not hold the date." },
    { question: "Can the event be moved?", answer: "Rescheduling and cancellation terms are written clearly into the contract; we always look for a new available date first." },
    { question: "Is the venue accessible?", answer: "Every room has step-free access, a lift and an accessible bathroom. We discuss individual needs before your visit." },
    { question: "Is there parking?", answer: "Yes, there are 46 spaces and a safe taxi drop-off zone." },
    { question: "How late can the event run?", answer: "The standard finish is 2:00 am, with extensions available once service and security are agreed." },
  ]);
  Object.assign(content.availability, {
    eyebrow: "THE FIRST STEP",
    title: "Let us begin with your date.",
    text: "This is simply an enquiry. Marta will check the calendar and return with the two best-fitting options.",
    dateLabel: "Date",
    formatLabel: "Format",
    formatPlaceholder: "Choose a format",
    guestsLabel: "Number of guests",
    guestsPlaceholder: "for example, 80",
    venueLabel: "Space",
    venuePlaceholder: "Choose a space",
    packageLabel: "Package",
    packagePlaceholder: "Choose a package",
    nameLabel: "Full name",
    phoneLabel: "Phone",
    submit: "Check availability",
    pending: "Sending…",
    idle: "We reply within one working day. This form does not hold the date.",
    success: "Thank you. Your coordinator will return with availability within one working day.",
    error: "We could not send your enquiry. Check the details or contact us by phone.",
    ariaLabel: "VELORA availability form",
    subject: "VELORA date enquiry",
  });
  Object.assign(content.contact, {
    eyebrow: "VISIT US",
    title: "The space is best understood in person.",
    text: "Book a private tour and see all three rooms in their natural light.",
    address: "24 Velyka Zhytomyrska Street · Kyiv",
    hours: "daily · 10:00–21:00",
    map: "VELORA · Kyiv",
    mapAria: "Fictional VELORA location",
    cta: "Check your date",
  });
  Object.assign(content.footer, {
    note: "Event house · Kyiv",
    tagline:
      "We create evenings that stay with you — in the light, the flavour and every quiet detail.",
    cta: "Begin with your date",
    navigationLabel: "Explore",
    contactLabel: "Contact",
    languageLabel: "Language",
    topLabel: "Back to top",
    copyright: "© 2026 VELORA · fictional demonstration brand",
  });
  Object.assign(content.customPages, {
    homeLabel: "Home",
    venuesLabel: "Spaces",
    packagesLabel: "Packages",
    areaLabel: "Area",
    formatLabel: "Best format",
    requestLabel: "Check this option",
    venuesEyebrow: "THREE CHARACTERS",
    venuesTitle: "A space that works for your story.",
    venuesIntro: "From a grand entrance to dinner around one table. Compare mood, scale and facilities without working through a spreadsheet.",
    packagesEyebrow: "THREE LEVELS OF CARE",
    packagesTitle: "The larger the production, the fewer decisions remain with you.",
    packagesIntro: "Every package creates a beautiful event. You choose the scale and how much time you want back.",
  });
  return content;
}
