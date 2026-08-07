import type { Metadata } from "next";
import { BembiArticlePage } from "../../BembiArticlePage";

const title = "Как научить ребёнка складывать и вычитать в пределах 100";
const description = "Пошаговый оригинальный материал BEMBI о десятках, единицах, устном счёте и переходе через разряд.";

export const metadata: Metadata = {
  title: `${title} | BEMBI`,
  description,
  alternates: { canonical: "/demos/premium-kids-center/articles/add-subtract-within-100" },
  openGraph: { title, description, images: [{ url: "/images/demos/premium-kids-center/article-math.webp", width: 1100, height: 1375, alt: "Десятки и единицы на учебном столе" }] },
};

export default function ArticlePage() {
  return <BembiArticlePage />;
}
