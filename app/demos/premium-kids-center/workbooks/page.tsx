import type { Metadata } from "next";
import { BembiWorkbooksPage } from "../BembiInternalPages";
import { BEMBI_DEMO_BASE_PATH } from "../PlatformShell";
export const metadata: Metadata = { title: "Рабочие тетради | BEMBI", description: "Последовательные учебные маршруты и рабочие тетради BEMBI.", alternates: { canonical: "/demos/premium-kids-center/workbooks" } };
export default function WorkbooksPage(){return <BembiWorkbooksPage basePath={BEMBI_DEMO_BASE_PATH} demo />}
