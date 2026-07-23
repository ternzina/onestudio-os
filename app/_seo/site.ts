import type { Metadata } from "next";

export const SITE_NAME = "OneStudio OS";
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://onestudioos.com");
export const DEFAULT_DESCRIPTION =
  "OneStudio OS combines a website, online booking, CRM, payments, media and analytics for service businesses.";

export const DEFAULT_KEYWORDS = [
  "service business software",
  "online booking system",
  "CRM for small business",
  "business website",
  "OneStudio OS",
];

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        }
      : { index: true, follow: true },
  };
}

export function createPrivatePageMetadata(path: string, title = "Private area"): Metadata {
  return {
    title,
    alternates: { canonical: path },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}
