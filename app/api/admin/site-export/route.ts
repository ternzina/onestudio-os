import { NextResponse } from "next/server";
import { buildSiteExport } from "@/lib/site-export/assemble";
import { assertCanonicalOrigin } from "@/lib/site-export/snapshot";
import { zipFiles } from "@/lib/site-export/zip";
import type { PublicSiteData, PublicSiteEditorData } from "@/lib/public-site/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function editorSite(editor: PublicSiteEditorData, locale: string): { site: PublicSiteData; usingDraft: boolean } | null {
  const record = editor.locales.find((item) => item.locale === locale);
  const content = record?.published_content ?? record?.draft_content;
  if (!record || !content) return null;
  return {
    usingDraft: !record.published_content,
    site: {
      business: {
        id: editor.business.id,
        slug: editor.business.slug,
        name: editor.business.name,
        locale,
        primary_locale: editor.site.primary_locale,
        currency: editor.business.default_currency,
        timezone: "UTC",
      },
      content,
      company: { display_name: editor.company?.display_name, logo_url: editor.site.logo_published_url ?? editor.company?.logo_url },
      services: editor.services ?? [],
      portfolio: editor.portfolio ?? [],
      capabilities: { booking: false, catalog: false, portfolio: (editor.portfolio?.length ?? 0) > 0 },
      available_locales: editor.locales.map((item) => item.locale),
      published_at: record.published_at,
    },
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { businessId?: string; locale?: string; format?: string; canonicalOrigin?: string } | null;
  if (!body?.businessId || !body.locale || (body.format !== "static" && body.format !== "next")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  let canonicalOrigin: string;
  try {
    canonicalOrigin = assertCanonicalOrigin(body.canonicalOrigin || "");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "invalid_origin" }, { status: 400 });
  }
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const { data, error } = await supabase.rpc("get_public_site_editor", { p_business_id: body.businessId });
  if (error || !data) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const prepared = editorSite(data as PublicSiteEditorData, body.locale);
  if (!prepared) return NextResponse.json({ error: "empty_site" }, { status: 400 });
  const exported = await buildSiteExport(prepared.site, body.format, { canonicalOrigin, usingDraft: prepared.usingDraft, allowRemoteFetch: true });
  const archive = zipFiles(exported.files);
  const filename = `${prepared.site.business.slug}-${body.format}.zip`;
  return new NextResponse(new Uint8Array(archive), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${filename}"`,
      "x-export-warnings": encodeURIComponent(JSON.stringify(exported.snapshot.warnings)),
      "cache-control": "no-store",
    },
  });
}
