import { components as englishComponents } from "../en/components";
export const components = { ...englishComponents, page: { eyebrow: "COMPOSANTS", titleBefore: "Plus de façons", titleAccent: "de présenter votre activité.", lead: "Blocs prêts à l’emploi, éléments interactifs et effets visuels pour vos pages OneStudio.", catalogEyebrow: "BIBLIOTHÈQUE", catalogTitle: "Choisissez le bon bloc.", catalogLead: "Aperçus en direct des composants réels de la bibliothèque OneStudio actuelle.", categoryLabel: "Catégories de composants", all: "Tous", previewLabel: "Aperçu" }, categories: {
    hero: "Hero",
    galleries: "Galeries",
    "social-proof": "Preuve sociale",
    forms: "Formulaires / Liste d’attente",
    typography: "Texte / Typographie",
    backgrounds: "Arrière-plans",
    motion: "Mouvement et effets",
    interactive: "3D / Interactif",
  }, items: {
    gallery: { label: "Galerie", description: "Galerie circulaire à glisser avec inertie." },
    motion: { label: "Mouvement", description: "Une grille inclinée de colonnes d’images qui dérive au défilement." },
    waitlist: { label: "Liste d’attente", description: "Un formulaire d’accès anticipé associé à un flux d’images animé." },
    hero: { label: "Hero", description: "Un premier écran avec scène visuelle, images changeantes et traînée lumineuse." },
    "social-proof": { label: "Preuve sociale", description: "Une séquence de témoignages avec avatars et transitions fluides." },
    "floating-lines": { label: "Lignes flottantes", description: "Des lignes lumineuses fluides avec parallaxe et réaction au curseur." },
    "magic-rings": { label: "Anneaux magiques", description: "Des anneaux shader avec profondeur, réaction au survol et impulsion au clic." },
    strands: { label: "Filaments lumineux", description: "De doux filaments WebGL colorés avec lueur et effet de verre." },
    "glow-cursor": { label: "Curseur lumineux", description: "Une traînée lumineuse interactive qui suit le curseur dans le bloc." },
    "particle-text": { label: "Texte en particules", description: "Le texte se rassemble à partir de particules et réagit au pointeur." },
    "card-spread": { label: "Éventail de cartes", description: "Un éventail interactif d’images qui se soulève et se décale au survol." },
    "bending-marquee": { label: "Ruban défilant courbé", description: "Une typographie animée sur un ruban tridimensionnel incurvé." },

    "blur-highlight": { label: "Flou et surlignage", description: "Le texte sort du flou tandis que certains mots reçoivent un surlignage animé." },
    "circle-stack": { label: "Pile de cercles", description: "Des couches d’images circulaires se soulèvent successivement pour révéler l’image suivante." },
    "click-stack": { label: "Pile au clic", description: "Les cartes se réorganisent au clic en envoyant la carte du dessus à l’arrière." },
    "text-cube": { label: "Cube de texte", description: "Un cube tridimensionnel de texte répété tourne et suit le curseur." },
  } } as const;
