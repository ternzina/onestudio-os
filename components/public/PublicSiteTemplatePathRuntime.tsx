import {
  BembiArticlesPage,
  BembiExperimentsPage,
  BembiTasksPage,
  BembiWorkbooksPage,
} from "@/app/demos/premium-kids-center/BembiInternalPages";
import { BembiArticlePage } from "@/app/demos/premium-kids-center/BembiArticlePage";
import { resolvePremiumPublicRoute } from "@/lib/public-site/premium-route-metadata";
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
  const resolved = resolvePremiumPublicRoute(site, path);
  if (!resolved) return null;
  if (resolved.kind === "article") {
    return <BembiArticlePage basePath={basePath} demo={false} article={resolved.article} />;
  }
  if (resolved.route === "tasks") return <BembiTasksPage basePath={basePath} demo={false} />;
  if (resolved.route === "workbooks") return <BembiWorkbooksPage basePath={basePath} demo={false} />;
  if (resolved.route === "experiments") return <BembiExperimentsPage basePath={basePath} demo={false} />;
  if (resolved.route === "articles") return <BembiArticlesPage basePath={basePath} demo={false} />;
  return null;
}
