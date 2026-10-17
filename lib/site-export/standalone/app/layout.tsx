import type { Metadata } from "next";
import "./globals.css";
import { readSite } from "../lib/site";

const site = readSite();

export const metadata: Metadata = {
  metadataBase: new URL(site.canonicalOrigin),
  title: { absolute: site.seoTitle },
  description: site.seoDescription,
  icons: site.faviconPath ? { icon: site.faviconPath } : undefined,
  robots: site.noIndex ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang={site.locale}><body>{children}</body></html>;
}
