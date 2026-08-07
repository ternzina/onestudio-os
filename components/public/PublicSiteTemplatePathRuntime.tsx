import {
  BembiArticlesPage,
  BembiExperimentsPage,
  BembiTasksPage,
  BembiWorkbooksPage,
} from "@/app/demos/premium-kids-center/BembiInternalPages";
import { BembiArticlePage } from "@/app/demos/premium-kids-center/BembiArticlePage";
import { resolveSiteTemplateKey } from "@/lib/public-site/template-registry";
import type { PublicSiteData } from "@/lib/public-site/types";

export function renderPublicSiteTemplatePath({
  site,
  path,
  basePath,
}: {
  site: PublicSiteData;
  path: readonly string[];
  basePath: string;
}) {
  if (resolveSiteTemplateKey(site.content.template_id) !== "premium-kids-center") {
    return null;
  }

  const route = path.join("/");
  if (route === "tasks") return <BembiTasksPage basePath={basePath} demo={false} />;
  if (route === "workbooks") return <BembiWorkbooksPage basePath={basePath} demo={false} />;
  if (route === "experiments") return <BembiExperimentsPage basePath={basePath} demo={false} />;
  if (route === "articles") return <BembiArticlesPage basePath={basePath} demo={false} />;
  if (route === "articles/add-subtract-within-100") {
    return <BembiArticlePage basePath={basePath} demo={false} />;
  }
  return null;
}
