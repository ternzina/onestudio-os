export const website = {
  hero: {
    eyebrow: "TURNKEY WEBSITE",
    title: "Turnkey website",
    priceLabel: "from €249",
    projectUnit: "project",
    lead: "Do not want to build the website yourself? We will create, configure and launch it in OneStudio for you.",
    priceNote: "The cost depends on the site structure, design and capabilities you need. Before work begins, you receive a fixed project price.",
    cta: "Discuss a project",
    ctaNote: "We will suggest the next step",
  },
  included: {
    eyebrow: "WHAT'S INCLUDED",
    title: "Everything needed to launch",
    lead: "We take care of the website build and the technical side of publishing in OneStudio.",
    items: [
      { title: "Design", description: "Shape a visual direction around your goal." },
      { title: "Page assembly", description: "Build the structure and required blocks." },
      { title: "Copy and photography", description: "Place the content you provide across the pages." },
      { title: "Mobile adaptation", description: "Check the website on smaller screens." },
      { title: "Domain connection", description: "Connect your domain before launch." },
      { title: "Basic SEO setup", description: "Set the core page metadata." },
      { title: "Publishing", description: "Launch the finished website in OneStudio." },
    ],
  },
  scope: {
    eyebrow: "WHAT AFFECTS THE PRICE",
    title: "A fixed project price for your scope",
    lead: "The cost depends on the site structure, design and capabilities you need. Before work begins, you receive a fixed project price.",
    items: ["Page count and structure", "Custom design", "Premium Effects", "Booking / business capabilities", "CRM / payments / integrations", "Multiple languages", "Non-standard features", "Content preparation"],
  },
  process: {
    eyebrow: "PROCESS",
    title: "From discussion to launch",
    steps: [
      { number: "01", title: "Discuss", description: "Define the goal, structure and capabilities." },
      { number: "02", title: "Fix the price", description: "Agree one project price before work begins." },
      { number: "03", title: "Create", description: "Build the pages, design and required functions." },
      { number: "04", title: "Launch", description: "Connect the domain and publish the website." },
    ],
  },
  showcase: {
    eyebrow: "PORTFOLIO",
    title: "Our work",
    lead: "Websites created and launched with OneStudio.",
  },
  portfolio: {
    "sisters-studio": { projectType: "Client project", cta: "Open site", description: null, alt: null },
    bembi: { projectType: "Client project", cta: "Open site", description: null, alt: null },
    "noir-frame": { projectType: "OneStudio Original", cta: "Open site", description: "A premium photo studio with a portfolio viewer, 3D tour and before/after.", alt: "Bright NOIR FRAME photo studio" },
    "velora-house": { projectType: "OneStudio Original", cta: "Open site", description: "Weddings, private dinners and corporate events across three distinctive halls.", alt: "VELORA HOUSE event hall at night" },
  },
} as const;
