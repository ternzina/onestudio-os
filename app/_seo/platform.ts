import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, SITE_NAME, SITE_URL } from "./site";

export const platformMetadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: SITE_NAME,
  title: { default: "OneStudio OS | Website, booking and CRM", template: "%s | OneStudio OS" },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  icons: { icon: "/onestudio-icon.svg" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website", locale: "en_US", alternateLocale: ["ru_RU"], url: "/", siteName: SITE_NAME,
    title: "OneStudio OS | Your business in one system", description: DEFAULT_DESCRIPTION,
    images: [{ url: "/opengraph-image", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image", title: SITE_NAME, description: DEFAULT_DESCRIPTION,
    images: ["/twitter-image"],
  },
  robots: { index: true, follow: true },
};

export const platformStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL.origin}/#organization`, name: SITE_NAME, url: SITE_URL.toString(), email: "hello@onestudioos.com" },
    { "@type": "WebSite", "@id": `${SITE_URL.origin}/#website`, url: SITE_URL.toString(), name: SITE_NAME, inLanguage: ["en", "ru"], publisher: { "@id": `${SITE_URL.origin}/#organization` } },
    { "@type": "SoftwareApplication", name: SITE_NAME, applicationCategory: "BusinessApplication", operatingSystem: "Web", description: DEFAULT_DESCRIPTION },
  ],
};
