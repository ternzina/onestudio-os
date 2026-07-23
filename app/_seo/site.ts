import type { Metadata } from "next";

export const SITE_NAME = "Sisters Photo Studio";
export const SITE_URL = new URL("https://sistersstudio.pl");
export const DEFAULT_DESCRIPTION =
  "Sisters Photo Studio w Warszawie: wynajem studia fotograficznego, profesjonalne sesje zdjęciowe, portfolio i szkolenia. Taśmowa 1, lokal 202.";

export const DEFAULT_KEYWORDS = [
  "studio fotograficzne Warszawa",
  "wynajem studia fotograficznego Warszawa",
  "sesja zdjęciowa Warszawa",
  "fotograf Warszawa",
  "cyklorama Warszawa",
  "studio do wynajęcia Warszawa",
  "Sisters Studio Warszawa",
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
  const fullTitle = `${title} | Sisters Studio Warszawa`;

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "pl_PL",
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
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function createPrivatePageMetadata(
  path: string,
  title = "Panel prywatny"
): Metadata {
  return {
    title,
    alternates: {
      canonical: path,
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}
