import { common as englishCommon } from "../en/common";

export const common = {
  ...englishCommon,
  languageLabel: "Idioma",
  languageNames: { ru: "Русский", en: "English", uk: "Українська", pl: "Polski", de: "Deutsch", es: "Español", fr: "Français", pt: "Português" },
  accessibility: { openLargerPreview: "Abrir vista previa ampliada", productScreenshot: "Captura de pantalla del producto" },
  header: { ...englishCommon.header, navigationLabel: "Navegación de OneStudio", menuLabel: "Menú", product: "Producto", oneStudio: "OneStudio", productMenuLabel: "Menú del producto", oneStudioMenuLabel: "Menú de OneStudio", demo: "Elegir demo", features: "Funciones", workflow: "Cómo funciona", login: "Iniciar sesión", openMenu: "Abrir menú" },
  footer: {
    ...englishCommon.footer,
    navigationLabel: "Navegación de OneStudio", brandDescription: "Sitio web, diseño y herramientas para tu proyecto.", product: "PRODUCTO", oneStudio: "ONESTUDIO", information: "INFORMACIÓN",
    links: { features: "Funciones", solutions: "Soluciones", templates: "Plantillas", components: "Componentes", pricing: "Precios", about: "Sobre OneStudio", website: "Sitio web llave en mano", faq: "FAQ", blog: "Diario", contact: "Contacto", privacy: "Privacidad", terms: "Condiciones" }, copyright: "© OneStudio OS - Todos los derechos reservados",
  },
  legal: { navigationLabel: "Navegación legal", lastUpdated: "Última actualización" },
  metadata: {
    home: { title: "OneStudio OS - sitio web, diseño y sistema de negocio", description: "Sitio web, diseño y módulos de gestión para negocios de servicios." },
    components: { title: "Componentes - OneStudio OS", description: "Una biblioteca de componentes, bloques y posibilidades de diseño de OneStudio." },
    about: { title: "Sobre OneStudio - OneStudio OS", description: "Por qué OneStudio conecta tu sitio web, clientes y trabajo diario en un solo sistema." },
    blog: { title: "Diario - OneStudio OS", description: "Nuevos componentes, posibilidades de diseño y novedades de OneStudio: breve y útil." },
    contact: { title: "Contacto - OneStudio", description: "Contacta con OneStudio sobre la plataforma, los planes o un sitio web llave en mano." },
    demos: { title: "Plantillas - OneStudio", description: "Diseños de sitios web OneStudio listos para distintos proyectos." },
    faq: { title: "FAQ - OneStudio OS", description: "Respuestas sobre cómo lanzar, personalizar y usar OneStudio." },
    features: { title: "Funciones - OneStudio", description: "Sitio web, reservas, clientes y herramientas de trabajo en OneStudio." },
    pricing: { title: "Precios - OneStudio OS", description: "Elige un plan de OneStudio para tu sitio web y tus módulos de trabajo." },
    website: { title: "Sitio web llave en mano - OneStudio OS", description: "Creamos, configuramos y lanzamos un sitio web llave en mano en OneStudio." },
    privacy: { title: "Política de privacidad", description: "Cómo OneStudio OS recopila, usa, almacena y protege los datos personales, incluidos los datos de Google Calendar." },
    terms: { title: "Condiciones del servicio", description: "Condiciones que rigen el acceso y uso de la plataforma empresarial OneStudio OS." },
  },
} as const;
