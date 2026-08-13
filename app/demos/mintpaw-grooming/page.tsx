import type { Metadata } from "next";
import MintPawGroomingDemo from "./MintPawGroomingDemo";

export const metadata: Metadata = {
  title: "ЛАПА & МЯТА — premium pet grooming demo",
  description:
    "Премиальный демо-сайт груминг-студии: услуги, комплексы, мастера, онлайн-запись, before/after и напоминания.",
};

export default function MintPawGroomingDemoPage() {
  return <MintPawGroomingDemo />;
}
