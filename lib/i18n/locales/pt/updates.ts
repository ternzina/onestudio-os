import { updates as englishUpdates } from "../en/updates.ts";
const categories: Record<string, string> = { Site: "Site", Design: "Design", Interactive: "Interação", Content: "Conteúdo", System: "Sistema", Effects: "Efeitos", Testimonials: "Testemunhos", Gallery: "Galeria" };
function localizeExcerpt(id: string) {
  if (id.startsWith("hero-")) return "Um hero expressivo com cena visual, mensagem clara e movimento, para páginas que precisam de criar ambiente desde o primeiro instante.";
  if (id.startsWith("social-proof-") || id === "comments-3") return "Testemunhos, nomes e reações reunidos num fluxo vivo aproximam a voz dos clientes da proposta principal.";
  if (id.startsWith("waitlist-")) return "Um formulário de acesso antecipado com mensagem curta e feed de imagens em movimento, para um produto, coleção ou evento.";
  if (id.startsWith("stats-")) return "Um bloco de métricas, escalas ou padrões gráficos que torna resultados e evolução fáceis de compreender.";
  if (id.startsWith("faq-")) return "Perguntas, categorias e respostas expansíveis numa composição organizada, simples de consultar mesmo com muitas explicações.";
  if (id.startsWith("navigation-") || id.startsWith("navbar-")) return "Navegação responsiva com hierarquia clara, links adicionais e menu móvel para conteúdos com vários níveis.";
  if (id.startsWith("card-")) return "Uma grelha de cartões com informação breve, estado e ação clara, para equipas, catálogos, bibliotecas ou coleções.";
  if (id.startsWith("showcase-")) return "Uma coleção visual com categorias alternáveis e movimento subtil, adequada a portefólios, casos e coleções.";
  if (id.startsWith("features-")) return "Cartões funcionais cujos detalhes aparecem durante a interação, uma forma clara de explicar um produto sem excesso de texto.";
  if (id.startsWith("cta-")) return "Um bloco final expressivo ou contido, com mensagem, botão e destaque visual para concluir a página com clareza.";
  if (id.startsWith("list-")) return "Uma lista com pesquisa, filtros ou arrastar que ajuda a encontrar e organizar materiais rapidamente.";
  if (id.startsWith("analytics-")) return "Um gráfico interativo com mudança de métricas e valores destacados para apresentar distribuições e resultados de forma compacta.";
  if (id.startsWith("pricing-")) return "Um bloco de preços com diferenças claras e mudança do período de faturação para escolher rapidamente o nível certo.";
  if (id === "forms-4") return "Um formulário detalhado com campos, seletores e estados de entrada pensados para pedidos ou processos de trabalho.";
  if (id === "footer-4") return "Um rodapé amplo com campo de inscrição, grupos de links e um final forte para fechar o site.";
  return "Uma composição clara com explicações breves para apresentar um novo serviço ou processo de trabalho.";
}
// Product history restored from 963ae06ccad8d54c5e75340dd634bb5edb7582f5; keep historical fields intact.
export const updates = {
  title: "Atualizações recentes",
  lead: "Notas curtas sobre o que chegou à biblioteca e onde pode ser útil.",
  noteLabel: "Nota do diário",
  entries: englishUpdates.entries.map((entry) => ({ ...entry, category: categories[entry.category] ?? entry.category, excerpt: localizeExcerpt(entry.id) })),
} as const;
