import { notFound, redirect } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import { renderPublicSiteTemplatePath } from "@/components/public/PublicSiteTemplatePathRuntime";
import { getPublicSite } from "@/lib/public-site/data";
import { getSiteTemplateDefinition } from "@/lib/public-site/template-registry";
import { buildSitePreviewHref, decidePreviewTemplate, getLocalePreviewContent } from "@/lib/public-site/preview-contract";
import type { PublicSiteData, PublicSiteEditorData } from "@/lib/public-site/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loginPathForReturnPath } from "@/lib/auth/return-path";

export const dynamic = "force-dynamic";

type Workspace = {
  business_id: string;
  slug: string;
  role: string;
};

export default async function SiteTemplatePreviewPage({
  params,
}: {
  params: Promise<{
    templateKey: string;
    businessSlug: string;
    templatePath?: string[];
  }>;
}) {
  const { templateKey, businessSlug, templatePath = [] } = await params;
  if (!getSiteTemplateDefinition(templateKey)) notFound();
  if (templatePath[0] !== "_locale" || !templatePath[1]) notFound();
  const requestedLocale = templatePath[1];
  const runtimePath = templatePath.slice(2);

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    const returnPath = [
      "/site-preview",
      encodeURIComponent(templateKey),
      encodeURIComponent(businessSlug),
      ...templatePath.map(encodeURIComponent),
    ].join("/");
    redirect(loginPathForReturnPath(returnPath));
  }

  const { data: workspaceData } = await supabase.rpc("list_my_businesses");
  const workspace = ((workspaceData ?? []) as Workspace[]).find(
    (item) => item.slug === businessSlug,
  );
  if (!workspace || !["owner", "admin", "manager"].includes(workspace.role)) {
    notFound();
  }

  const { data: editorData, error } = await supabase.rpc(
    "get_public_site_editor",
    { p_business_id: workspace.business_id },
  );
  if (error || !editorData || typeof editorData !== "object") notFound();

  const editor = editorData as unknown as PublicSiteEditorData;
  const draft = getLocalePreviewContent(editor, requestedLocale);
  if (!draft) notFound();
  const templateDecision = decidePreviewTemplate(draft, templateKey);
  if (templateDecision.kind === "reject") notFound();
  if (templateDecision.kind === "redirect") {
    redirect(buildSitePreviewHref({
      templateKey: templateDecision.templateKey,
      businessSlug,
      locale: requestedLocale,
      templatePath: runtimePath,
    }));
  }

  const published = await getPublicSite(businessSlug);
  const site: PublicSiteData = published
    ? { ...published, business: { ...published.business, locale: requestedLocale }, content: draft }
    : {
        business: {
          id: editor.business.id,
          slug: editor.business.slug,
          name: editor.business.name,
          locale: requestedLocale,
          primary_locale: editor.site.primary_locale,
          currency: editor.business.default_currency,
          timezone: "UTC",
        },
        content: draft,
        company: editor.company ?? {},
        services: editor.services ?? [],
        portfolio: editor.portfolio ?? [],
        capabilities: { booking: true, catalog: true, portfolio: true },
        available_locales: editor.locales.map((item) => item.locale),
        published_at: null,
      };

  const basePath = buildSitePreviewHref({ templateKey: templateDecision.templateKey, businessSlug, locale: requestedLocale });
  if (runtimePath[0] === "p" && runtimePath[1]) {
    const page = draft.pages?.find(candidate => candidate.type === "custom" && candidate.slug === runtimePath[1] && candidate.is_visible !== false);
    if (!page) notFound();
    return <PublicCustomPageRuntime site={site} page={page} basePath={basePath} />;
  }
  if (runtimePath.length) {
    const page = renderPublicSiteTemplatePath({ site, path: runtimePath, basePath });
    if (!page) notFound();
    return page;
  }

  return <PublicSiteTemplateRuntime site={site} basePath={basePath} />;
}
