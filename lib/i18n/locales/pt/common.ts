import { common as englishCommon } from "../en/common";

export const common = {
  ...englishCommon,
  languageLabel: "Idioma",
  languageNames: { ru: "Русский", en: "English", uk: "Українська", pl: "Polski", de: "Deutsch", es: "Español", fr: "Français", pt: "Português" },
  accessibility: { openLargerPreview: "Abrir pré-visualização ampliada", productScreenshot: "Captura de ecrã do produto" },
  header: { ...englishCommon.header, navigationLabel: "Navegação do OneStudio", menuLabel: "Menu", product: "Produto", oneStudio: "OneStudio", productMenuLabel: "Menu do produto", oneStudioMenuLabel: "Menu do OneStudio", demo: "Escolher demo", features: "Funcionalidades", workflow: "Como funciona", login: "Entrar", openMenu: "Abrir menu" },
  footer: {
    ...englishCommon.footer,
    navigationLabel: "Navegação do OneStudio", brandDescription: "Site, design e ferramentas para o seu projeto.", product: "PRODUTO", oneStudio: "ONESTUDIO", information: "INFORMAÇÃO",
    links: { features: "Funcionalidades", solutions: "Soluções", templates: "Modelos", components: "Componentes", pricing: "Preços", about: "Sobre o OneStudio", website: "Site chave na mão", faq: "FAQ", blog: "Diário", contact: "Contacto", privacy: "Privacidade", terms: "Termos" }, copyright: "© OneStudio OS - Todos os direitos reservados",
  },
  legal: { navigationLabel: "Navegação jurídica", lastUpdated: "Última atualização" },
  metadata: {
    home: { title: "OneStudio OS - site, design e sistema de negócio", description: "Um site, design e módulos de operação para empresas de serviços." },
    components: { title: "Componentes - OneStudio OS", description: "Uma biblioteca de componentes, blocos e possibilidades de design do OneStudio." },
    about: { title: "Sobre o OneStudio - OneStudio OS", description: "Porque é que o OneStudio liga o seu site, clientes e trabalho diário num só sistema." },
    blog: { title: "Diário - OneStudio OS", description: "Novos componentes, possibilidades de design e novidades do OneStudio: de forma breve e útil." },
    contact: { title: "Contacto - OneStudio", description: "Contacte o OneStudio sobre a plataforma, os planos ou um site chave na mão." },
    demos: { title: "Modelos - OneStudio", description: "Designs de sites OneStudio prontos para diferentes projetos." },
    faq: { title: "FAQ - OneStudio OS", description: "Respostas sobre lançar, personalizar e trabalhar com o OneStudio." },
    features: { title: "Funcionalidades - OneStudio", description: "Site, marcações, clientes e ferramentas de trabalho no OneStudio." },
    pricing: { title: "Preços - OneStudio OS", description: "Escolha um plano OneStudio para o seu site e módulos de trabalho." },
    website: { title: "Site chave na mão - OneStudio OS", description: "Criamos, configuramos e lançamos um site chave na mão no OneStudio." },
    privacy: { title: "Política de privacidade", description: "Como o OneStudio OS recolhe, utiliza, guarda e protege dados pessoais, incluindo dados do Google Calendar." },
    terms: { title: "Termos de serviço", description: "Termos que regem o acesso e a utilização da plataforma empresarial OneStudio OS." },
  },
} as const;
