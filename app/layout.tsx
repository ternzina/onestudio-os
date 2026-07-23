import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteSettingsProvider } from "@/lib/site-settings-provider";
import { getPublicSiteSettings } from "@/lib/public-site-data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://onestudioos.com");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "OneStudio OS",
  title: { default: "OneStudio OS — сайт, бронирование и CRM в одной системе", template: "%s | OneStudio OS" },
  description: "Цифровая операционная система для сервисного бизнеса: сайт, онлайн-бронирование, клиенты, платежи, медиатека и аналитика.",
  keywords: ["business operating system", "online booking", "CRM", "website", "OneStudio OS"],
  authors: [{ name: "OneStudio OS", url: siteUrl }],
  creator: "OneStudio OS",
  publisher: "OneStudio OS",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "ru_RU", alternateLocale: ["en_US"], url: "/", siteName: "OneStudio OS", title: "OneStudio OS — весь бизнес в одной системе", description: "Сайт, бронирование, CRM, платежи и управление контентом — на одной цифровой основе." },
  twitter: { card: "summary_large_image", title: "OneStudio OS", description: "The digital operating system for service businesses." },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${siteUrl}#organization`, name: "OneStudio OS", url: siteUrl.toString(), email: "hello@onestudioos.com" },
    { "@type": "WebSite", "@id": `${siteUrl}#website`, url: siteUrl.toString(), name: "OneStudio OS", inLanguage: ["ru", "en"], publisher: { "@id": `${siteUrl}#organization` } },
    { "@type": "SoftwareApplication", name: "OneStudio OS", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "Website, booking, CRM, payments, media and analytics for service businesses." },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteSettings = await getPublicSiteSettings();
  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <SiteSettingsProvider settings={siteSettings}>{children}</SiteSettingsProvider>
      </body>
    </html>
  );
}
