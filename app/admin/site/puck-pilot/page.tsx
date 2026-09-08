import Link from "next/link";
import PuckPilotEditor from "@/components/puck-site-editor/pilot-editor";
import { createPuckPilotFixture } from "@/lib/puck-site-editor/pilot-fixture";
import { isPuckSiteEditorPilotEnabled, PUCK_SITE_EDITOR_PILOT_FLAG } from "@/lib/puck-site-editor/feature-flag";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Workspace = {
  business_id: string;
  default_locale?: string;
  is_default?: boolean;
  role?: string;
};

export default async function PuckSiteEditorPilotPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  if (!isPuckSiteEditorPilotEnabled()) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Pilot disabled</p>
        <h1 className="mt-3 text-3xl font-semibold">Puck Site Editor remains behind a feature flag.</h1>
        <p className="mt-4 text-neutral-600">{PUCK_SITE_EDITOR_PILOT_FLAG} defaults to OFF. The current Site Editor is still the active authoring path.</p>
        <Link className="mt-8 inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white" href="/admin/site">Return to current Site Editor</Link>
      </main>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("list_my_businesses");
  const workspaces = !error && Array.isArray(data) ? data as Workspace[] : [];
  const workspace = workspaces.find((item) => item.is_default) ?? workspaces[0];
  if (!workspace?.business_id) {
    return <main className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-3xl font-semibold">No tenant context available</h1><p className="mt-4 text-neutral-600">The pilot never accepts an arbitrary client-supplied workspace id.</p></main>;
  }

  const requestedLocale = (await searchParams).locale?.toLowerCase();
  const defaultLocale = workspace.default_locale?.toLowerCase() || "ru";
  const locale = requestedLocale && /^(ru|en)$/.test(requestedLocale) ? requestedLocale : defaultLocale;
  return (
    <PuckPilotEditor
      businessId={workspace.business_id}
      locale={locale}
      initialDocument={createPuckPilotFixture(locale)}
      publicPreviewHref={`/admin/site/puck-pilot/preview?locale=${encodeURIComponent(locale)}`}
    />
  );
}
