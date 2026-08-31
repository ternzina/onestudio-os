import { fields } from "@/components/editor-lab/puck/field-helpers";
import { defineArrayItemsContract } from "@/components/editor-lab/puck/array-items-contract";
import { defineBoundedNestedContentContract } from "@/components/editor-lab/puck/bounded-nested-content-contract";
import { defineFormContentContract } from "@/components/editor-lab/puck/form-content-contract";
import {
  defineSerializableIconTokenContract,
  iconTokenField,
} from "@/components/editor-lab/puck/icon-token-contract";
import { pricing13Plans } from "./pricing/pricing-13";
import { pricing15Plans } from "./pricing/pricing-15";
import { pricing14Addons, pricing14Icons } from "./pricing/pricing-14";
import { pricing7Tiers } from "./pricing/pricing-7";
import {
  pricing12Assurances,
  pricing12ContentDefaults,
  pricing12Features,
  pricing12Icons,
} from "./pricing/pricing-12";
import {
  contact8ContentDefaults,
  contact8Expectations,
  contact8Reviewers,
} from "./contact/contact-8";
import { contact10Benefits, contact10ContentDefaults } from "./contact/contact-10";
import { contact11Desks } from "./contact/contact-11";
import { blog1Articles, blog1ContentDefaults } from "./content/blog-1";
import { blog2Articles, blog2ContentDefaults } from "./content/blog-2";
import { ecommerce1ContentDefaults, ecommerce1Views } from "./content/ecommerce-1";
import { ecommerce2Products } from "./content/ecommerce-2";
import {
  navigation11Sections,
} from "./navigation/navigation-11";
import {
  navigation14Icons,
  navigation14Sections,
} from "./navigation/navigation-14";
import { navbar4Icons, navbar4Sections } from "./navigation/navbar-4";
import { navbar2Filters, navbar2Rows, navbar2Sorts } from "./navigation/navbar-2";
import { navbar6Notices, navbar6Results } from "./navigation/navbar-6";
import {
  appSidebar6Groups,
  appSidebar6Icons,
} from "./app-ui/app-sidebar-6";
import {
  appSidebar7Groups,
  appSidebar7Icons,
} from "./app-ui/app-sidebar-7";
import { appShell9ChatIcons, appShell9Chats } from "./app-ui/app-shell-9";

const tokenOptions = <Token extends string>(
  tokens: Readonly<Record<Token, unknown>>,
) =>
  (Object.keys(tokens) as Token[]).map((token) => ({
    token,
    label: token
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  }));

const navigation14IconContract = defineSerializableIconTokenContract({
  label: "Icon",
  tokens: tokenOptions(navigation14Icons),
});
const navbar4IconContract = defineSerializableIconTokenContract({
  label: "Icon",
  tokens: tokenOptions(navbar4Icons),
});
const appSidebar6IconContract = defineSerializableIconTokenContract({
  label: "Icon",
  tokens: tokenOptions(appSidebar6Icons),
});
const appSidebar7IconContract = defineSerializableIconTokenContract({
  label: "Icon",
  tokens: tokenOptions(appSidebar7Icons),
});
const appShell9IconContract = defineSerializableIconTokenContract({
  label: "Icon",
  tokens: tokenOptions(appShell9ChatIcons),
});
const pricing12IconContract = defineSerializableIconTokenContract({
  label: "Icon",
  tokens: tokenOptions(pricing12Icons),
});
const pricing14IconContract = defineSerializableIconTokenContract({
  label: "Icon",
  tokens: tokenOptions(pricing14Icons),
});

export const pricing14ArrayItems = [
  defineArrayItemsContract({
    slot: "addons",
    label: "Optional modules",
    defaults: pricing14Addons.map((addon) => ({ ...addon })),
    fields: {
      iconToken: iconTokenField(pricing14IconContract),
      name: fields.text("Module name", { contentEditable: false }),
      blurb: fields.textarea("Module description", { contentEditable: false }),
      price: fields.number("Monthly price", { min: 0, step: 1 }),
    },
    itemLabel: (item, index) => `Module ${Number(index ?? 0) + 1} — ${String(item.name ?? "Untitled")}`,
  }),
];

export const blog2ArrayItems = [
  defineArrayItemsContract({
    slot: "articles",
    label: "Articles",
    defaults: blog2Articles.map((article) => ({ ...article })),
    fields: {
      id: fields.number("Article ID", { min: 1, step: 1 }),
      title: fields.text("Article title", { contentEditable: false }),
      excerpt: fields.textarea("Article excerpt", { contentEditable: false }),
      date: fields.text("Date", { contentEditable: false }),
      image: fields.imageUrl(),
    },
    itemLabel: (item, index) => `Article ${Number(index ?? 0) + 1} — ${String(item.title ?? "Untitled")}`,
  }),
];

export const blog2FormContent = defineFormContentContract({
  slots: [
    { slot: "heading", label: "Page heading", type: "text", defaultValue: blog2ContentDefaults.heading },
  ],
});

export const ecommerce1ArrayItems = [
  defineArrayItemsContract({
    slot: "views",
    label: "Product images",
    defaults: ecommerce1Views.map((view) => ({ ...view })),
    fields: { src: fields.imageUrl() },
    itemLabel: (_item, index) => `Product image ${Number(index ?? 0) + 1}`,
  }),
];

export const ecommerce1FormContent = defineFormContentContract({
  slots: [
    { slot: "productName", label: "Product name", type: "text", defaultValue: ecommerce1ContentDefaults.productName },
    { slot: "brand", label: "Brand", type: "text", defaultValue: ecommerce1ContentDefaults.brand },
    { slot: "price", label: "Price", type: "text", defaultValue: ecommerce1ContentDefaults.price },
    { slot: "stockLabel", label: "Stock badge", type: "text", defaultValue: ecommerce1ContentDefaults.stockLabel },
    { slot: "backLabel", label: "Back button", type: "text", defaultValue: ecommerce1ContentDefaults.backLabel },
  ],
});

export const navbar2ArrayItems = [
  defineArrayItemsContract({
    slot: "sorts",
    label: "Sort options",
    defaults: navbar2Sorts.map((sort) => ({ ...sort })),
    fields: { label: fields.text("Option label", { contentEditable: false }) },
    itemLabel: (item, index) => `Sort ${Number(index ?? 0) + 1} — ${String(item.label ?? "Option")}`,
  }),
  defineArrayItemsContract({
    slot: "filterOptions",
    label: "Filter options",
    defaults: navbar2Filters.map((filter) => ({ ...filter })),
    fields: { text: fields.text("Filter label", { contentEditable: false }) },
    itemLabel: (item, index) => `Filter ${Number(index ?? 0) + 1} — ${String(item.text ?? "Option")}`,
  }),
  defineArrayItemsContract({
    slot: "rows",
    label: "Project rows",
    defaults: navbar2Rows.map((row) => ({ ...row })),
    fields: {
      name: fields.text("Project name", { contentEditable: false }),
      meta: fields.text("Project detail", { contentEditable: false }),
    },
    itemLabel: (item, index) => `Project ${Number(index ?? 0) + 1} — ${String(item.name ?? "Untitled")}`,
  }),
];

export const navbar6ArrayItems = [
  defineArrayItemsContract({
    slot: "notices",
    label: "Notifications",
    defaults: navbar6Notices.map((notice) => ({ ...notice })),
    fields: {
      who: fields.text("Author", { contentEditable: false }),
      text: fields.textarea("Notification", { contentEditable: false }),
      at: fields.text("Time label", { contentEditable: false }),
    },
    itemLabel: (item, index) => `Notice ${Number(index ?? 0) + 1} — ${String(item.who ?? "Unknown")}`,
  }),
  defineArrayItemsContract({
    slot: "results",
    label: "Search results",
    defaults: navbar6Results.map((result) => ({ ...result })),
    fields: { text: fields.text("Result label", { contentEditable: false }) },
    itemLabel: (item, index) => `Result ${Number(index ?? 0) + 1} — ${String(item.text ?? "Untitled")}`,
  }),
];

export const pricing7NestedContent = [
  defineBoundedNestedContentContract({
    slot: "tiers",
    label: "Pricing tiers",
    defaults: pricing7Tiers,
    fields: {
      name: fields.text("Plan name", { contentEditable: false }),
      tagline: fields.textarea("Plan description", { contentEditable: false }),
      price: fields.text("Price", { contentEditable: false }),
      unit: fields.text("Price detail", { contentEditable: false }),
      cta: fields.text("Button text", { contentEditable: false }),
    },
    children: [
      {
        slot: "highlights",
        label: "Plan highlights",
        fields: { text: fields.text("Highlight", { contentEditable: false }) },
        itemLabel: (item) => String(item.text ?? "Highlight"),
      },
    ],
    itemLabel: (item) => String(item.name ?? "Pricing tier"),
  }),
];

export const pricing12ArrayItems = [
  defineArrayItemsContract({
    slot: "features",
    label: "Included features",
    defaults: pricing12Features.map((feature) => ({ ...feature })),
    fields: { text: fields.text("Feature", { contentEditable: false }) },
    itemLabel: (item) => String(item.text ?? "Feature"),
  }),
  defineArrayItemsContract({
    slot: "assurances",
    label: "Assurances",
    defaults: pricing12Assurances.map((assurance) => ({ ...assurance })),
    fields: {
      iconToken: iconTokenField(pricing12IconContract),
      label: fields.text("Assurance text", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.label ?? "Assurance"),
  }),
];

export const pricing12FormContent = defineFormContentContract({
  slots: [
    { slot: "heading", label: "Heading", type: "text", defaultValue: pricing12ContentDefaults.heading },
    { slot: "description", label: "Introduction", type: "textarea", defaultValue: pricing12ContentDefaults.description },
  ],
});

export const contact8ArrayItems = [
  defineArrayItemsContract({
    slot: "expectations",
    label: "Call expectations",
    defaults: contact8Expectations.map((expectation) => ({ ...expectation })),
    fields: { text: fields.text("Expectation", { contentEditable: false }) },
    itemLabel: (item) => String(item.text ?? "Expectation"),
  }),
  defineArrayItemsContract({
    slot: "reviewers",
    label: "Reviewers",
    defaults: contact8Reviewers.map((reviewer) => ({ ...reviewer })),
    fields: {
      src: fields.imageUrl(),
      name: fields.text("Reviewer name", { contentEditable: false }),
      role: fields.text("Reviewer role", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.name ?? "Reviewer"),
  }),
];

export const contact8FormContent = defineFormContentContract({
  slots: [
    { slot: "headingLead", label: "Heading line 1", type: "text", defaultValue: contact8ContentDefaults.headingLead },
    { slot: "headingTail", label: "Heading line 2", type: "text", defaultValue: contact8ContentDefaults.headingTail },
  ],
});

export const pricing13NestedContent = [
  defineBoundedNestedContentContract({
    slot: "plans",
    label: "Pricing plans",
    defaults: pricing13Plans,
    fields: {
      name: fields.text("Plan name", { contentEditable: false }),
      badge: fields.text("Badge", { contentEditable: false }),
      tagline: fields.textarea("Plan description", { contentEditable: false }),
      price: fields.number("Monthly price", { min: 0, step: 1 }),
      seats: fields.text("Seats", { contentEditable: false }),
      support: fields.text("Support", { contentEditable: false }),
      uptime: fields.text("Uptime", { contentEditable: false }),
      cta: fields.text("Button text", { contentEditable: false }),
      lead: fields.text("Feature heading", { contentEditable: false }),
    },
    children: [
      {
        slot: "features",
        label: "Features",
        fields: { text: fields.text("Feature", { contentEditable: false }) },
        defaultItemProps: { text: "New feature" },
        itemLabel: (item) => String(item.text ?? "Feature"),
      },
    ],
    itemLabel: (item) => String(item.name ?? "Pricing plan"),
  }),
];

export const pricing15ArrayItems = [
  defineArrayItemsContract({
    slot: "plans",
    label: "Pricing plans",
    defaults: pricing15Plans.map((plan) => ({ ...plan })),
    fields: {
      name: fields.text("Plan name", { contentEditable: false }),
      monthly: fields.number("Monthly price", { min: 0, step: 1 }),
      yearly: fields.number("Annual monthly price", { min: 0, step: 1 }),
      description: fields.textarea("Plan description", { contentEditable: false }),
      cta: fields.text("Button text", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.name ?? "Pricing plan"),
  }),
];

export const contact10ArrayItems = [
  defineArrayItemsContract({
    slot: "benefits",
    label: "Benefits",
    defaults: contact10Benefits.map((benefit) => ({ ...benefit })),
    fields: {
      title: fields.text("Benefit title", { contentEditable: false }),
      description: fields.textarea("Benefit description", { contentEditable: false }),
    },
    itemLabel: (item) => String(item.title ?? "Benefit"),
  }),
];

export const contact10FormContent = defineFormContentContract({
  slots: [
    { slot: "headingLead", label: "Heading line 1", type: "text", defaultValue: contact10ContentDefaults.headingLead },
    { slot: "headingTail", label: "Heading line 2", type: "text", defaultValue: contact10ContentDefaults.headingTail },
    { slot: "description", label: "Introduction", type: "textarea", defaultValue: contact10ContentDefaults.description },
  ],
});

export const contact11ArrayItems = [
  defineArrayItemsContract({
    slot: "desks",
    label: "Contact desks",
    defaults: contact11Desks.map((desk) => ({ ...desk })),
    fields: {
      label: fields.text("Desk label", { contentEditable: false }),
      name: fields.text("Contact name", { contentEditable: false }),
      email: fields.text("Email", { contentEditable: false }),
      avatar: fields.imageUrl(),
    },
    itemLabel: (item) => String(item.label ?? "Contact desk"),
  }),
];

export const blog1ArrayItems = [
  defineArrayItemsContract({
    slot: "articles",
    label: "Articles",
    defaults: blog1Articles.map((article) => ({ ...article })),
    fields: {
      id: fields.number("Article ID", { min: 1, step: 1 }),
      title: fields.text("Article title", { contentEditable: false }),
      date: fields.text("Date", { contentEditable: false }),
      category: fields.text("Category", { contentEditable: false }),
      image: fields.imageUrl(),
    },
    itemLabel: (item) => String(item.title ?? "Article"),
  }),
];

export const blog1FormContent = defineFormContentContract({
  slots: [
    { slot: "heading", label: "Page heading", type: "text", defaultValue: blog1ContentDefaults.heading },
    { slot: "description", label: "Introduction", type: "textarea", defaultValue: blog1ContentDefaults.description },
    { slot: "listHeading", label: "Article list heading", type: "text", defaultValue: blog1ContentDefaults.listHeading },
  ],
});

export const ecommerce2NestedContent = [
  defineBoundedNestedContentContract({
    slot: "products",
    label: "Products",
    defaults: ecommerce2Products,
    fields: {
      name: fields.text("Product name", { contentEditable: false }),
      price: fields.text("Price", { contentEditable: false }),
      tag: fields.select("Badge", [
        { label: "None", value: "" },
        { label: "Bestseller", value: "Bestseller" },
        { label: "New", value: "New" },
      ]),
      brand: fields.text("Brand", { contentEditable: false }),
      image: fields.imageUrl(),
    },
    children: [
      {
        slot: "colors",
        label: "Color swatches",
        fields: { value: fields.text("Color value", { contentEditable: false }) },
        defaultItemProps: { value: "#111111" },
        itemLabel: (item) => String(item.value ?? "Color"),
      },
      {
        slot: "chips",
        label: "Product labels",
        fields: { value: fields.text("Label", { contentEditable: false }) },
        defaultItemProps: { value: "New label" },
        itemLabel: (item) => String(item.value ?? "Label"),
      },
    ],
    itemLabel: (item) => String(item.name ?? "Product"),
  }),
];

export const navigation11NestedContent = [
  defineBoundedNestedContentContract({
    slot: "sections",
    label: "Navigation sections",
    defaults: navigation11Sections,
    fields: {
      label: fields.text("Menu label", { contentEditable: false }),
      heading: fields.text("Panel heading", { contentEditable: false }),
    },
    children: [
      {
        slot: "cards",
        label: "Panel cards",
        fields: {
          title: fields.text("Card title", { contentEditable: false }),
          desc: fields.textarea("Card description", { contentEditable: false }),
          img: fields.imageUrl(),
        },
        itemLabel: (item) => String(item.title ?? "Navigation card"),
      },
    ],
    itemLabel: (item) => String(item.label ?? "Navigation section"),
  }),
];

export const navigation14NestedContent = [
  defineBoundedNestedContentContract({
    slot: "sections",
    label: "Navigation sections",
    defaults: navigation14Sections,
    fields: {
      label: fields.text("Menu label", { contentEditable: false }),
      featuredTag: fields.text("Featured badge", { contentEditable: false }),
      featuredTitle: fields.text("Featured title", { contentEditable: false }),
      featuredDescription: fields.textarea("Featured description", { contentEditable: false }),
    },
    children: [
      {
        slot: "items",
        label: "Menu items",
        fields: {
          iconToken: iconTokenField(navigation14IconContract),
          title: fields.text("Item title", { contentEditable: false }),
          description: fields.textarea("Item description", { contentEditable: false }),
        },
        itemLabel: (item) => String(item.title ?? "Menu item"),
      },
    ],
    itemLabel: (item) => String(item.label ?? "Navigation section"),
  }),
];

export const navbar4NestedContent = [
  defineBoundedNestedContentContract({
    slot: "sections",
    label: "Navigation menus",
    defaults: navbar4Sections,
    fields: { label: fields.text("Menu label", { contentEditable: false }) },
    children: [
      {
        slot: "items",
        label: "Menu items",
        fields: {
          iconToken: iconTokenField(navbar4IconContract),
          label: fields.text("Item label", { contentEditable: false }),
          hint: fields.textarea("Item description", { contentEditable: false }),
        },
        itemLabel: (item) => String(item.label ?? "Menu item"),
      },
    ],
    itemLabel: (item) => String(item.label ?? "Navigation menu"),
  }),
];

export const appSidebar6NestedContent = [
  defineBoundedNestedContentContract({
    slot: "groups",
    label: "Sidebar groups",
    defaults: appSidebar6Groups,
    fields: { label: fields.text("Group label", { contentEditable: false }) },
    children: [
      {
        slot: "items",
        label: "Sidebar links",
        fields: {
          iconToken: iconTokenField(appSidebar6IconContract),
          label: fields.text("Link label", { contentEditable: false }),
          badge: fields.text("Badge", { contentEditable: false }),
        },
        itemLabel: (item) => String(item.label ?? "Sidebar link"),
      },
    ],
    itemLabel: (item) => String(item.label ?? "Sidebar group"),
  }),
];

export const appSidebar7NestedContent = [
  defineBoundedNestedContentContract({
    slot: "groups",
    label: "Sidebar groups",
    defaults: appSidebar7Groups,
    fields: { label: fields.text("Group label", { contentEditable: false }) },
    children: [
      {
        slot: "items",
        label: "Sidebar links",
        fields: {
          iconToken: iconTokenField(appSidebar7IconContract),
          label: fields.text("Link label", { contentEditable: false }),
          badge: fields.text("Badge", { contentEditable: false }),
        },
        itemLabel: (item) => String(item.label ?? "Sidebar link"),
      },
    ],
    itemLabel: (item) => String(item.label ?? "Sidebar group"),
  }),
];

export const appShell9NestedContent = [
  defineBoundedNestedContentContract({
    slot: "chats",
    label: "Chat history",
    defaults: appShell9Chats,
    fields: {
      id: fields.text("Chat ID", { contentEditable: false }),
      title: fields.text("Chat title", { contentEditable: false }),
      iconToken: iconTokenField(appShell9IconContract),
      model: fields.text("Model label", { contentEditable: false }),
      count: fields.number("Message count", { min: 0, step: 1 }),
    },
    children: [
      {
        slot: "turns",
        label: "Messages",
        fields: {
          role: fields.select("Role", [
            { label: "User", value: "user" },
            { label: "Assistant", value: "assistant" },
          ]),
          text: fields.textarea("Message", { contentEditable: false }),
        },
        itemLabel: (item, index) => `${String(item.role ?? "Message")} ${Number(index ?? 0) + 1}`,
      },
    ],
    itemLabel: (item) => String(item.title ?? "Chat"),
  }),
];
