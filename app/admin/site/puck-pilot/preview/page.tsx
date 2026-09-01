import { redirect } from "next/navigation";
import PuckPilotPublicPreview from "@/components/puck-site-editor/pilot-public-preview";
import { isPuckSiteEditorPilotEnabled } from "@/lib/puck-site-editor/feature-flag";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Workspace = {
  business_id: string;
  default_locale?: string;
  is_default?: boolean;
};

export default async function PuckSiteEditorPilotPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  if (!isPuckSiteEditorPilotEnabled()) redirect("/admin/site");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("list_my_businesses");
  const workspaces = !error && Array.isArray(data) ? data as Workspace[] : [];
  const workspace = workspaces.find((item) => item.is_default) ?? workspaces[0];
  if (!workspace?.business_id) redirect("/admin/site");

  const requestedLocale = (await searchParams).locale?.toLowerCase();
  const defaultLocale = workspace.default_locale?.toLowerCase() || "ru";
  const locale = requestedLocale && /^(ru|en)$/.test(requestedLocale) ? requestedLocale : defaultLocale;
  return (
    <PuckPilotPublicPreview
      businessId={workspace.business_id}
      locale={locale}
    />
  );
}
