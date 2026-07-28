import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/adminAuth";
import { makeSafeSlug } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const { error: authError, supabase, businessId } = await getAdminSupabase(request);
  if (authError || !supabase || !businessId) {
    return NextResponse.json({ error: authError }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { name?: string; slug?: string };
    const name = String(body.name || "").trim();
    const slug = makeSafeSlug(String(body.slug || name));

    if (!name || !slug) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const { data: last } = await supabase
      .from("portfolio_categories")
      .select("sort_order")
      .eq("business_id", businessId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("portfolio_categories")
      .insert({
        business_id: businessId,
        name,
        slug,
        is_active: true,
        sort_order: Number(last?.sort_order || 0) + 10,
      })
      .select("id,name,slug,is_active,sort_order")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Could not create category" }, { status: 400 });
    }

    return NextResponse.json({ category: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create category" },
      { status: 500 },
    );
  }
}
