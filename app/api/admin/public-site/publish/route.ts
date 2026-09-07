import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFreshPublicSite, listPublicSiteSeoPaths } from "@/lib/public-site/data";
import { indexNowUrls, submitIndexNow } from "@/lib/public-site/indexnow";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { businessId?: string; locale?: string } | null;
  if (!body?.businessId || !body.locale) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = await createServerSupabaseClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const { data: editor, error: editorError } = await supabase.rpc("get_public_site_editor", { p_business_id: body.businessId });
  const slug = (editor as { business?: { slug?: string } } | null)?.business?.slug;
  if (editorError || !slug) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const previous = await getFreshPublicSite(slug, body.locale);
  const { data: publishedContent, error } = await supabase.rpc("publish_public_site", { p_business_id: body.businessId, p_locale: body.locale });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const [current, paths] = await Promise.all([getFreshPublicSite(slug, body.locale), listPublicSiteSeoPaths(slug)]);
  const path = paths.find((item) => item.locale === body.locale); const customDomain = path?.custom_domain;
  const oldUrls = previous ? indexNowUrls(previous, body.locale, { customDomain, indexable: previous.content.seo_no_index !== true }) : [];
  const newUrls = current ? indexNowUrls(current, body.locale, { customDomain, indexable: current.content.seo_no_index !== true }) : [];
  const indexnow = await submitIndexNow([...oldUrls, ...newUrls]);
  return NextResponse.json({ publishedContent, indexnow });
}
