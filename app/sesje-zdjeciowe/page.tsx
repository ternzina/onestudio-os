import Header from "@/components/layout/Header";
import Hero from "./Hero";
import Packages from "./Packages";
import Interiors from "./Interiors";
import Portfolio from "./Portfolio";
import Team from "./Team";
import Testimonials from "./Testimonials";
import Booking from "./Booking";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "../../lib/language-provider";
import { PhotoshootsContentProvider } from "../../lib/photoshoots-content";
import { getPhotoshootsContentRow } from "@/lib/public-site-data";

export default async function PhotoshootsPage() {
  const photoshootsContent = await getPhotoshootsContentRow();

  return (
    <LanguageProvider>
      <PhotoshootsContentProvider row={photoshootsContent}>
        <main className="min-h-screen bg-[#0B0908]">
          <Header />
          <Hero />
          <Packages />
          <Interiors />
          <Portfolio />
          <Team />
          <Testimonials />
          <Booking />
          <Footer />
        </main>
      </PhotoshootsContentProvider>
    </LanguageProvider>
  );
}
