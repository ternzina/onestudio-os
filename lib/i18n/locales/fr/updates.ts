import { updates as englishUpdates } from "../en/updates.ts";
const categories: Record<string, string> = { Site: "Site", Design: "Design", Interactive: "Interactif", Content: "Contenu", System: "Système", Effects: "Effets", Testimonials: "Témoignages", Gallery: "Galerie" };
function localizeExcerpt(id: string) {
  if (id.startsWith("hero-")) return "Un hero expressif avec scène visuelle, message clair et mouvement, pour les pages qui doivent installer une atmosphère dès le départ.";
  if (id.startsWith("social-proof-") || id === "comments-3") return "Témoignages, noms et réactions réunis dans un flux vivant qui rapproche la voix des clients de la proposition principale.";
  if (id.startsWith("waitlist-")) return "Un formulaire d’accès anticipé avec un message court et un flux d’images animé, pour un produit, une collection ou un événement.";
  if (id.startsWith("stats-")) return "Un bloc de chiffres, d’échelles ou de motifs graphiques pour rendre les résultats et leur évolution lisibles en un coup d’œil.";
  if (id.startsWith("faq-")) return "Questions, catégories et réponses dépliables dans une composition ordonnée, facile à consulter même avec beaucoup d’explications.";
  if (id.startsWith("navigation-") || id.startsWith("navbar-")) return "Une navigation responsive à la hiérarchie claire, avec liens supplémentaires et menu mobile pour les contenus à plusieurs niveaux.";
  if (id.startsWith("card-")) return "Une grille de cartes avec informations courtes, statut et action claire, pour une équipe, un catalogue, une bibliothèque ou des collections.";
  if (id.startsWith("showcase-")) return "Une collection visuelle avec catégories interchangeables et mouvement léger, adaptée aux portfolios, études de cas et collections.";
  if (id.startsWith("features-")) return "Des cartes fonctionnelles dont les détails apparaissent à l’interaction, pour présenter un produit sans mur de texte.";
  if (id.startsWith("cta-")) return "Un bloc final expressif ou discret, avec message, bouton et accent visuel, pour conclure la page avec justesse.";
  if (id.startsWith("list-")) return "Une liste avec recherche, filtres ou glisser-déposer pour trouver et organiser rapidement les contenus.";
  if (id.startsWith("analytics-")) return "Un graphique interactif avec changement de métrique et valeurs mises en avant pour présenter distributions et résultats avec concision.";
  if (id.startsWith("pricing-")) return "Un bloc tarifaire aux différences claires et à la période de facturation commutable pour choisir rapidement le bon niveau d’accès.";
  if (id === "forms-4") return "Un formulaire détaillé avec champs, choix d’options et états de saisie soignés pour une demande ou un processus.";
  if (id === "footer-4") return "Un grand footer avec champ d’inscription, groupes de liens et phrase finale forte pour terminer le site.";
  return "Une composition claire avec de brèves explications pour présenter un nouveau service ou processus de travail.";
}
// Product history restored from 963ae06ccad8d54c5e75340dd634bb5edb7582f5; keep historical fields intact.
export const updates = {
  title: "Dernières nouveautés",
  lead: "De courtes notes sur les éléments ajoutés à la bibliothèque et leurs usages possibles.",
  noteLabel: "Note du journal",
  entries: englishUpdates.entries.map((entry) => ({ ...entry, category: categories[entry.category] ?? entry.category, excerpt: localizeExcerpt(entry.id) })),
} as const;
