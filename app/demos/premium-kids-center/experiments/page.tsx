import type { Metadata } from "next";
import { BembiExperimentsPage } from "../BembiInternalPages";
import { BEMBI_DEMO_BASE_PATH } from "../PlatformShell";
export const metadata: Metadata = { title: "Эксперименты и творчество | BEMBI", description: "Домашние эксперименты, творческие практики и семейные проекты BEMBI.", alternates: { canonical: "/demos/premium-kids-center/experiments" } };
export default function ExperimentsPage(){return <BembiExperimentsPage basePath={BEMBI_DEMO_BASE_PATH} demo />}
