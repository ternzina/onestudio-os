import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });
const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://onestudioos.com");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "OneStudio OS",
  title: {
    default: "OneStudio OS | Website, booking and CRM",
    template: "%s | OneStudio OS",
  },
  description:
    "A digital operating system for service businesses: website, booking, clients, payments, media and analytics.",
  keywords: ["service business", "online booking", "CRM", "business website", "OneStudio OS"],
  authors: [{ name: "OneStudio OS", url: siteUrl }],
  creator: "OneStudio OS",
  publisher: "OneStudio OS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ru_RU"],
    url: "/",
    siteName: "OneStudio OS",
    title: "OneStudio OS | Your business in one system",
    description: "Website, booking, CRM, payments and content management on one adaptable foundation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneStudio OS",
    description: "The digital operating system for service businesses.",
  },
  robots: {
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl.origin}/#organization`,
      name: "OneStudio OS",
      url: siteUrl.toString(),
      email: "hello@onestudioos.com",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl.origin}/#website`,
      url: siteUrl.toString(),
      name: "OneStudio OS",
      inLanguage: ["en", "ru"],
      publisher: { "@id": `${siteUrl.origin}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "OneStudio OS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Website, booking, CRM, payments, media and analytics for service businesses.",
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
