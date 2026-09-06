import { faqContent } from "@/lib/faq-content";

export const faq = {
  page: {
    eyebrow: "FAQ",
    title: "Часто задаваемые вопросы",
    description: "Собрали ответы о запуске, настройке сайта и возможностях OneStudio. Если нужного вопроса здесь нет, напишите нам.",
    contactTitle: "Не нашли свой вопрос?",
    contactText: "Напишите нам и расскажите немного о своём проекте и о том, что вы хотите сделать.",
    contactAction: "Задать вопрос",
  },
  content: faqContent.ru,
} as const;
