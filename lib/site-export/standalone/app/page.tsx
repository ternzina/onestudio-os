import type { Metadata } from "next";
import HomePage from "../components/HomePage";
import JsonLd from "../components/JsonLd";
import { readSite, socialMetadata } from "../lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = readSite();
  return socialMetadata({ title: site.seoTitle, description: site.seoDescription, path: "/", noIndex: site.noIndex });
}

export default function Page() {
  const site = readSite();
  if (site.templateId === "cashpath") {
    return <>
      {site.heroSources ? <link rel="preload" as="image" imageSrcSet={site.heroSources.srcset} imageSizes={site.heroSources.sizes} type={site.heroSources.type} fetchPriority="high" /> : null}
      <HomePage />
    </>;
  }
  const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: site.brandName, url: site.canonicalOrigin };
  return <><JsonLd data={jsonLd} /><div dangerouslySetInnerHTML={{ __html: site.homeHtml }} /></>;
}
