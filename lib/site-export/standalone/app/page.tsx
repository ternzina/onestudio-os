import type { Metadata } from "next";
import HomePage from "../components/HomePage";
import JsonLd from "../components/JsonLd";
import { readSite } from "../lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = readSite();
  return {
    title: { absolute: site.seoTitle },
    description: site.seoDescription,
    alternates: { canonical: site.canonicalOrigin },
    openGraph: { title: site.seoTitle, description: site.seoDescription, url: site.canonicalOrigin },
    robots: site.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default function Page() {
  const site = readSite();
  if (site.templateId === "cashpath") return <HomePage />;
  const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: site.brandName, url: site.canonicalOrigin };
  return <><JsonLd data={jsonLd} /><div dangerouslySetInnerHTML={{ __html: site.homeHtml }} /></>;
}
