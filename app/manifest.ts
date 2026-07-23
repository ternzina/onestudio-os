import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sisters Photo Studio Warszawa",
    short_name: "Sisters Studio",
    description:
      "Studio fotograficzne w Warszawie: wynajem, sesje zdjęciowe i szkolenia.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0908",
    theme_color: "#0B0908",
    lang: "pl",
    icons: [
      {
        src: "/images/brand/sisters-logo-icon.webp",
        sizes: "any",
        type: "image/webp",
      },
    ],
  };
}
