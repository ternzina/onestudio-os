import type { Metadata } from "next";
import { readSite } from "../lib/site";

const site = readSite();

export const metadata: Metadata = {
  title: { absolute: site.templateId === "cashpath" ? "Page not found | CashPath" : "Page not found" },
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <main className="article"><section className="article-hero"><h1>{site.templateId === "cashpath" ? "This path does not exist." : "Page not found"}</h1><p><a href="/">Back to the homepage</a></p></section></main>;
}
