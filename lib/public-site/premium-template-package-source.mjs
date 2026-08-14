/**
 * The only manually maintained list of universal premium template packages.
 *
 * Binding module paths are project-root relative. `scripts/generate-premium-template-packages.mjs`
 * turns this data-only source into capability-scoped TypeScript registries.
 */
export const PREMIUM_TEMPLATE_PACKAGE_SOURCE = [
  {
    manifest: {
      packageVersion: "1.0",
      templateKey: "gloss-nail-studio",
      name: "GLOSS",
      description:
        "Полный editorial-сайт nail-студии с записью, командой, клубом и портфолио.",
      category: "beauty",
      aliases: ["gloss"],
      access: "free",
      library: { tier: "standard", visible: true, order: 10 },
      preview: {
        collectionVisible: true,
        group: "beauty",
        order: 10,
        title: { ru: "Nail-студия", en: "Nail studio" },
        description: {
          ru: "Полный editorial-сайт nail-студии с записью, командой, клубом и портфолио.",
          en: "An editorial nail studio website with booking, team, club and portfolio.",
        },
        alt: {
          ru: "Интерьер и работы nail-студии GLOSS",
          en: "GLOSS nail studio interior and work",
        },
        route: "/demos/gloss-nail-studio",
        image: "/templates/gloss/gloss-hero.webp",
        accent: "#9d3151",
        dark: "#321722",
        surface: "#fff7f5",
      },
      persistence: {
        schemaVersion: "1.0",
        compatibleSince: "gloss-1.0",
        contentNamespace: false,
      },
      capabilities: {
        customerCreatable: true,
        editorSelectable: true,
        previewRenderable: true,
        publicHome: true,
        customPages: true,
        seoMetadata: true,
        nativeSections: true,
        customBlocks: true,
      },
      nativeSectionIds: [
        "services",
        "portfolio",
        "team",
        "booking",
        "membership",
        "safety",
        "reviews",
        "gift",
        "faq",
        "about",
        "contact",
      ],
      assets: [
        "/templates/gloss/gloss-hero.webp",
        "/templates/gloss/gloss-gallery-1.webp",
      ],
    },
    bindings: {
      seed: {
        module: "lib/public-site/gloss-premium-template-seed.ts",
        export: "createGlossPremiumTemplateSeed",
      },
      contract: {
        module: "lib/public-site/gloss-premium-template-contract.ts",
        export: "GLOSS_PREMIUM_TEMPLATE_CONTRACT",
      },
      editor: {
        module: "lib/public-site/gloss-premium-template-editor-adapter.ts",
        export: "GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER",
      },
      publicHome: {
        module: "lib/public-site/gloss-premium-template-runtime-adapter.ts",
        export: "GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER",
      },
      customPage: {
        module:
          "lib/public-site/gloss-premium-template-custom-page-runtime-adapter.ts",
        export: "GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER",
      },
    },
  },
  {
    manifest: {
      packageVersion: "1.0",
      templateKey: "premium-studio",
      name: "NOIR FRAME — Premium Photo Studio",
      description:
        "Премиальная фотостудия с portfolio viewer, 3D-туром и before/after.",
      category: "studio",
      aliases: ["noir", "noir-frame"],
      access: "premium",
      library: { tier: "premium", visible: true, order: 30 },
      preview: {
        collectionVisible: true,
        group: "studio",
        order: 30,
        title: { ru: "Фотостудия", en: "Photo studio" },
        description: {
          ru: "Премиальная фотостудия с portfolio viewer, 3D-туром и before/after.",
          en: "A premium photo studio with a portfolio viewer, 3D tour and before/after.",
        },
        alt: {
          ru: "Светлый зал фотостудии NOIR FRAME",
          en: "Bright NOIR FRAME photo studio",
        },
        route: "/demos/premium-studio",
        image: "/images/demos/premium-studio/bright/hero.webp",
        accent: "#b58b57",
        dark: "#111111",
        surface: "#f3efe8",
      },
      persistence: {
        schemaVersion: "1.0",
        compatibleSince: "noir-phase-1",
        contentNamespace: true,
      },
      capabilities: {
        customerCreatable: true,
        editorSelectable: true,
        previewRenderable: true,
        publicHome: true,
        customPages: true,
        seoMetadata: true,
        nativeSections: true,
        customBlocks: true,
      },
      nativeSectionIds: [
        "hero",
        "manifest",
        "light",
        "services",
        "portfolio",
        "retouch",
        "film",
        "team",
        "process",
        "equipment",
        "tour",
        "reviews",
        "faq",
        "contact",
        "footer",
      ],
      assets: ["/images/demos/premium-studio/bright/hero.webp"],
    },
    bindings: {
      seed: {
        module: "lib/public-site/noir-premium-template-seed.ts",
        export: "createNoirPremiumTemplateSeed",
      },
      contract: {
        module: "lib/public-site/noir-premium-template-contract.ts",
        export: "NOIR_PREMIUM_TEMPLATE_CONTRACT",
      },
      editor: {
        module: "lib/public-site/noir-premium-template-editor-adapter.ts",
        export: "NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER",
      },
      publicHome: {
        module: "lib/public-site/noir-premium-template-runtime-adapter.ts",
        export: "NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER",
      },
      customPage: {
        module:
          "lib/public-site/noir-premium-template-custom-page-runtime-adapter.ts",
        export: "NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER",
      },
    },
  },
  {
    manifest: {
      packageVersion: "1.0",
      templateKey: "velora-event-venue",
      name: "VELORA HOUSE",
      description:
        "Премиальная event-площадка с проверкой даты, выбором зала, пакета и заявкой.",
      category: "events",
      aliases: ["velora", "velora-house"],
      access: "premium",
      library: { tier: "premium", visible: true, order: 40 },
      preview: {
        collectionVisible: true,
        group: "events",
        order: 40,
        title: { ru: "Площадка для событий", en: "Private event venue" },
        description: {
          ru: "Свадьбы, частные ужины и корпоративные события в трёх выразительных залах.",
          en: "Weddings, private dinners and corporate events across three distinctive halls.",
        },
        alt: {
          ru: "Вечерний зал VELORA HOUSE",
          en: "VELORA HOUSE event hall at night",
        },
        route: "/demos/velora-event-venue",
        image: "/templates/velora/hero-cinematic.webp",
        accent: "#D6B56E",
        dark: "#07101E",
        surface: "#F6F0E5",
      },
      persistence: {
        schemaVersion: "1.0",
        compatibleSince: "velora-1.0",
        contentNamespace: true,
      },
      capabilities: {
        customerCreatable: true,
        editorSelectable: true,
        previewRenderable: true,
        publicHome: true,
        customPages: true,
        seoMetadata: true,
        nativeSections: true,
        customBlocks: true,
      },
      nativeSectionIds: [
        "hero",
        "facts",
        "venues",
        "formats",
        "transformation",
        "story",
        "packages",
        "included",
        "catering",
        "decor",
        "coordinator",
        "reviews",
        "gallery",
        "planner",
        "faq",
        "availability",
        "footer",
      ],
      assets: [
        "/templates/velora/hero-cinematic.webp",
        "/templates/velora/grand-hall-cinematic.webp",
        "/templates/velora/garden-room-cinematic.webp",
        "/templates/velora/atelier-cinematic.webp",
        "/templates/velora/celebration-cinematic.webp",
        "/templates/velora/menu-cinematic.webp",
        "/templates/velora/coordinator-cinematic.webp",
      ],
    },
    bindings: {
      seed: {
        module: "lib/public-site/velora-premium-template-seed.ts",
        export: "createVeloraPremiumTemplateSeed",
      },
      contract: {
        module: "lib/public-site/velora-premium-template-contract.ts",
        export: "VELORA_PREMIUM_TEMPLATE_CONTRACT",
      },
      editor: {
        module: "lib/public-site/velora-premium-template-editor-adapter.ts",
        export: "VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER",
      },
      publicHome: {
        module: "lib/public-site/velora-premium-template-runtime-adapter.ts",
        export: "VELORA_PREMIUM_TEMPLATE_RUNTIME_ADAPTER",
      },
      customPage: {
        module:
          "lib/public-site/velora-premium-template-custom-page-runtime-adapter.ts",
        export: "VELORA_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER",
      },
    },
  },
  {
    manifest: {
      packageVersion: "1.0",
      templateKey: "lumea-beauty",
      name: "LUMEA Beauty",
      description:
        "Editorial skin, hair & beauty studio with personal care paths and online booking.",
      category: "beauty",
      aliases: ["lumea", "lumea-beauty-studio"],
      access: "free",
      library: { tier: "standard", visible: true, order: 20 },
      preview: {
        collectionVisible: true,
        group: "beauty",
        order: 20,
        title: { ru: "Skin · Hair · Beauty", en: "Skin · Hair · Beauty" },
        description: {
          ru: "Editorial beauty studio: волосы, skin care, брови и персональные ритуалы.",
          en: "Editorial beauty studio for hair, skin, brows and personal care rituals.",
        },
        alt: {
          ru: "Светлый салон красоты LUMEA Beauty",
          en: "Bright LUMEA Beauty studio",
        },
        route: "/demos/lumea-beauty",
        image: "/images/demos/lumiere.webp",
        accent: "#9B6D56",
        dark: "#35251F",
        surface: "#F4EFE9",
      },
      persistence: {
        schemaVersion: "1.0",
        compatibleSince: "lumea-1.0",
        contentNamespace: true,
      },
      capabilities: {
        customerCreatable: true,
        editorSelectable: true,
        previewRenderable: true,
        publicHome: true,
        customPages: true,
        seoMetadata: true,
        nativeSections: true,
        customBlocks: true,
      },
      nativeSectionIds: [
        "hero",
        "services",
        "booking",
        "experts",
        "gallery",
        "reviews",
        "contact",
        "footer",
      ],
      assets: ["/images/demos/lumiere.webp"],
    },
    bindings: {
      seed: {
        module: "lib/public-site/lumea-premium-template-seed.ts",
        export: "createLumeaPremiumTemplateSeed",
      },
      contract: {
        module: "lib/public-site/lumea-premium-template-contract.ts",
        export: "LUMEA_PREMIUM_TEMPLATE_CONTRACT",
      },
      editor: {
        module: "lib/public-site/lumea-premium-template-editor-adapter.ts",
        export: "LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER",
      },
      publicHome: {
        module: "lib/public-site/lumea-premium-template-runtime-adapter.ts",
        export: "LUMEA_PREMIUM_TEMPLATE_RUNTIME_ADAPTER",
      },
      customPage: {
        module:
          "lib/public-site/lumea-premium-template-custom-page-runtime-adapter.ts",
        export: "LUMEA_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER",
      },
    },
  },
];
