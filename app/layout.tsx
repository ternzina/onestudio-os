import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin", "cyrillic"] });
import { platformMetadata, platformStructuredData } from "./_seo/platform";
import { classifyHostname } from "@/lib/seo/request";
import { getRequestHtmlLang } from "@/lib/public-site/request-context";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "";
  const tenantRoute = headerStore.get("x-onestudio-tenant-route") === "1" || Boolean(headerStore.get("x-onestudio-custom-domain"));
  if (tenantRoute) return { metadataBase: new URL("https://onestudioos.com"), manifest: "/manifest.webmanifest" };
  if (classifyHostname(host) === "technical-platform") return { ...platformMetadata, robots: { index: false, follow: false, nocache: true } };
  return platformMetadata;
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headerStore = await headers();
  const tenantRoute = headerStore.get("x-onestudio-tenant-route") === "1" || Boolean(headerStore.get("x-onestudio-custom-domain"));
  const lang = await getRequestHtmlLang();
  return (
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {!tenantRoute ? <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(platformStructuredData).replace(/</g, "\\u003c"),
          }}
        /> : null}
        {children}
      </body>
    </html>
  );
}
