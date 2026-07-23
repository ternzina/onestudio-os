import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase } = await getAdminSupabase(request);

    if (authError || !supabase) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { imageIds } = await request.json();

    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: "Неверный порядок фото" }, { status: 400 });
    }

    for (const [index, imageId] of imageIds.entries()) {
      const { error } = await supabase
        .from("portfolio_images")
        .update({ sort_order: (index + 1) * 10, updated_at: new Date().toISOString() })
        .eq("id", imageId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка сортировки" },
      { status: 500 },
    );
  }
}
