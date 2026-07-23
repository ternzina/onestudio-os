import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/adminAuth";
import { makeSafeSlug } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase } = await getAdminSupabase(request);

    if (authError || !supabase) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = await request.json();
    const nameUk = String(body.name_uk || "").trim();
    const namePl = String(body.name_pl || nameUk || "").trim();
    const wantedSlug = makeSafeSlug(String(body.slug || nameUk || namePl));

    if (!nameUk || !namePl) {
      return NextResponse.json({ error: "Введите название категории" }, { status: 400 });
    }

    const { data: lastCategory } = await supabase
      .from("portfolio_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from("portfolio_categories")
      .insert({
        name_uk: nameUk,
        name_pl: namePl,
        slug: wantedSlug,
        is_active: true,
        sort_order: Number(lastCategory?.sort_order || 0) + 10,
      })
      .select("id, name_uk, name_pl, slug, is_active, sort_order")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка создания категории" },
      { status: 500 },
    );
  }
}
