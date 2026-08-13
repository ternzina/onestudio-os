import type { Metadata } from "next";
import BlacklineSite from "@/components/public/blackline/BlacklineSite";

export const metadata: Metadata = {
  title: "BLACKLINE — Tattoo Collective",
  description:
    "Премиальный демо-сайт тату-студии BLACKLINE: мастера, стили, работы и консультация.",
};

export default function BlacklineTattooDemoPage() {
  return <BlacklineSite />;
}
