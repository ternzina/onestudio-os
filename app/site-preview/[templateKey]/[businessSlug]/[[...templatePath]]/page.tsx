import { notFound, redirect } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { renderPublicSiteTemplatePath } from "@/components/public/PublicSiteTemplatePathRuntime";
import { getPublicSite } from "@/lib/public-site/data";
import { getSiteTemplateDefinition } from "@/lib/public-site/template-registry";
import type { PublicSiteData, PublicSiteEditorData } from "@/lib/public-site/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

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
  const locale = editor.locales.find(
    (item) => item.locale === editor.site.primary_locale,
  );
  const draft = locale?.draft_content ?? locale?.published_content;
  if (!draft) notFound();

  const published = await getPublicSite(businessSlug);
  const site: PublicSiteData = published
    ? { ...published, content: { ...draft, template_id: templateKey } }
    : {
        business: {
          id: editor.business.id,
          slug: editor.business.slug,
          name: editor.business.name,
          locale: editor.site.primary_locale,
          primary_locale: editor.site.primary_locale,
          currency: editor.business.default_currency,
          timezone: "UTC",
        },
        content: { ...draft, template_id: templateKey },
        company: editor.company ?? {},
        services: editor.services ?? [],
        portfolio: editor.portfolio ?? [],
        capabilities: { booking: true, catalog: true, portfolio: true },
        available_locales: editor.locales.map((item) => item.locale),
        published_at: null,
      };

  const basePath = `/site-preview/${templateKey}/${businessSlug}`;
  if (templatePath.length) {
    const page = renderPublicSiteTemplatePath({ site, path: templatePath, basePath });
    if (!page) notFound();
    return page;
  }

  return <PublicSiteTemplateRuntime site={site} basePath={basePath} />;
}
