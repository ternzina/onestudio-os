import type { Metadata } from "next";
import { BembiArticlesPage } from "../BembiInternalPages";
import { BEMBI_DEMO_BASE_PATH } from "../PlatformShell";
export const metadata: Metadata = { title: "Журнал для родителей | BEMBI", description: "Оригинальные демонстрационные статьи о развитии, чтении, математике, творчестве и семейном обучении.", alternates: { canonical: "/demos/premium-kids-center/articles" } };
export default function ArticlesPage(){return <BembiArticlesPage basePath={BEMBI_DEMO_BASE_PATH} demo />}
