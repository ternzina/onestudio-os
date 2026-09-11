import { common as englishCommon } from "../en/common";

export const common = {
  ...englishCommon,
  languageLabel: "Langue",
  languageNames: { ru: "Русский", en: "English", uk: "Українська", pl: "Polski", de: "Deutsch", es: "Español", fr: "Français", pt: "Português" },
  accessibility: { openLargerPreview: "Ouvrir l’aperçu agrandi", productScreenshot: "Capture d’écran du produit" },
  header: { ...englishCommon.header, navigationLabel: "Navigation OneStudio", menuLabel: "Menu", product: "Produit", oneStudio: "OneStudio", productMenuLabel: "Menu produit", oneStudioMenuLabel: "Menu OneStudio", demo: "Choisir une démo", features: "Fonctionnalités", workflow: "Comment ça marche", login: "Se connecter", openMenu: "Ouvrir le menu" },
  footer: {
    ...englishCommon.footer,
    navigationLabel: "Navigation OneStudio", brandDescription: "Site, design et outils pour votre projet.", product: "PRODUIT", oneStudio: "ONESTUDIO", information: "INFORMATIONS",
    links: { features: "Fonctionnalités", solutions: "Solutions", templates: "Modèles", components: "Composants", pricing: "Tarifs", about: "À propos de OneStudio", website: "Site clé en main", faq: "FAQ", journal: "Journal", contact: "Contact", privacy: "Confidentialité", terms: "Conditions" }, copyright: "© OneStudio OS - Tous droits réservés",
  },
  legal: { navigationLabel: "Navigation juridique", lastUpdated: "Dernière mise à jour" },
  metadata: {
    home: { title: "OneStudio OS - site, design et système professionnel", description: "Un site, du design et des modules opérationnels pour les entreprises de services." },
    components: { title: "Composants - OneStudio OS", description: "Une bibliothèque de composants, blocs et possibilités de design OneStudio." },
    about: { title: "À propos de OneStudio - OneStudio OS", description: "Pourquoi OneStudio relie votre site, vos clients et votre activité quotidienne dans un seul système." },
    journal: { title: "Journal - OneStudio OS", description: "Nouveaux composants, possibilités de design et actualités OneStudio : l’essentiel, simplement." },
    contact: { title: "Contact - OneStudio", description: "Contactez OneStudio au sujet de la plateforme, des tarifs ou d’un site clé en main." },
    demos: { title: "Modèles - OneStudio", description: "Des designs de sites OneStudio prêts à l’emploi pour différents projets." },
    faq: { title: "FAQ - OneStudio OS", description: "Réponses sur le lancement, la personnalisation et l’utilisation de OneStudio." },
    features: { title: "Fonctionnalités - OneStudio", description: "Site, réservations, clients et outils de travail dans OneStudio." },
    pricing: { title: "Tarifs - OneStudio OS", description: "Choisissez une offre OneStudio pour votre site et vos modules de travail." },
    website: { title: "Site clé en main - OneStudio OS", description: "Nous créons, configurons et mettons en ligne votre site clé en main dans OneStudio." },
    privacy: { title: "Politique de confidentialité", description: "Comment OneStudio OS collecte, utilise, conserve et protège les données personnelles, notamment celles de Google Calendar." },
    terms: { title: "Conditions d’utilisation", description: "Conditions régissant l’accès à la plateforme professionnelle OneStudio OS et son utilisation." },
  },
} as const;
