import { updates as englishUpdates } from "../en/updates.ts";
const categories: Record<string, string> = { Site: "Sitio", Design: "Diseño", Interactive: "Interacción", Content: "Contenido", System: "Sistema", Effects: "Efectos", Testimonials: "Testimonios", Gallery: "Galería" };
function localizeExcerpt(id: string) {
  if (id.startsWith("hero-")) return "Un hero expresivo con escena visual, mensaje claro y movimiento para páginas que necesitan crear ambiente desde el primer momento.";
  if (id.startsWith("social-proof-") || id === "comments-3") return "Testimonios, nombres y reacciones reunidos en un flujo vivo que acerca la voz de los clientes a la propuesta principal.";
  if (id.startsWith("waitlist-")) return "Un formulario de acceso anticipado con un mensaje breve y un feed de imágenes en movimiento para productos, colecciones o eventos.";
  if (id.startsWith("stats-")) return "Un bloque de métricas, escalas o patrones gráficos que hace que los resultados y su evolución se entiendan de un vistazo.";
  if (id.startsWith("faq-")) return "Preguntas, categorías y respuestas desplegables en una composición ordenada, fácil de consultar incluso con muchas explicaciones.";
  if (id.startsWith("navigation-") || id.startsWith("navbar-")) return "Navegación adaptable con jerarquía clara, enlaces adicionales y menú móvil para contenidos con varios niveles.";
  if (id.startsWith("card-")) return "Una cuadrícula de tarjetas con información breve, estado y acción clara para equipos, catálogos, bibliotecas o colecciones.";
  if (id.startsWith("showcase-")) return "Una colección visual con categorías intercambiables y movimiento sutil, pensada para portafolios, casos y colecciones.";
  if (id.startsWith("features-")) return "Tarjetas funcionales cuyos detalles aparecen al interactuar, una forma clara de explicar un producto sin saturar de texto.";
  if (id.startsWith("cta-")) return "Un cierre expresivo o contenido con mensaje, botón y acento visual para terminar la página con claridad.";
  if (id.startsWith("list-")) return "Una lista con búsqueda, filtros o arrastre que ayuda a encontrar y ordenar materiales rápidamente.";
  if (id.startsWith("analytics-")) return "Un gráfico interactivo con cambio de métrica y valores destacados para mostrar distribuciones y resultados de forma compacta.";
  if (id.startsWith("pricing-")) return "Un bloque de precios con diferencias claras y cambio de periodo de facturación para elegir rápidamente el nivel adecuado.";
  if (id === "forms-4") return "Un formulario detallado con campos, selectores y estados de entrada cuidados para consultas o procesos de trabajo.";
  if (id === "footer-4") return "Un footer amplio con campo de registro, grupos de enlaces y un cierre contundente para completar el sitio.";
  return "Una composición clara con explicaciones breves para presentar un nuevo servicio o flujo de trabajo.";
}
// Product history restored from 963ae06ccad8d54c5e75340dd634bb5edb7582f5; keep historical fields intact.
export const updates = {
  title: "Últimas novedades",
  lead: "Notas breves sobre lo que llega a la biblioteca y dónde puede ser útil.",
  noteLabel: "Nota del diario",
  entries: englishUpdates.entries.map((entry) => ({ ...entry, category: categories[entry.category] ?? entry.category, excerpt: localizeExcerpt(entry.id) })),
} as const;
