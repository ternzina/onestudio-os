import { faqContent } from "@/lib/faq-content";

export const faq = {
  page: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    description: "Everything you may want to know about launching, customizing and working with OneStudio. If your question isn't here, get in touch.",
    contactTitle: "Still have a question?",
    contactText: "Tell us a little about your project and what you'd like to build.",
    contactAction: "Ask a question",
  },
  content: faqContent.en,
} as const;
