import type { Metadata } from "next";
import Link from "next/link";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import DanceDemoClient from "./DanceDemoClient";
import styles from "./DanceDemo.module.css";

const description =
  "RITMO — яркий демо-сайт танцевальной студии с направлениями, расписанием, тренерами, пробным занятием и абонементами.";

export const metadata: Metadata = {
  title: "RITMO — Dance Studio demo",
  description,
  alternates: { canonical: "/demos/ritmo-dance-studio" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/demos/ritmo-dance-studio",
    title: "RITMO — Dance Studio",
    description,
  },
};

export default function RitmoDanceDemoPage() {
  return (
    <>
      <DanceDemoClient />
      <div className={styles.useTemplate}>
        <Link href={newSitePathForTemplate("standard")}>
          Использовать этот шаблон
        </Link>
      </div>
    </>
  );
}
