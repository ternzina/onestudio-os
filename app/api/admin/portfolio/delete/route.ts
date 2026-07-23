import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/adminAuth";
import { deleteObjectFromR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase } = await getAdminSupabase(request);

    if (authError || !supabase) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { imageId } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: "Не выбрано фото" }, { status: 400 });
    }

    const { data: image, error: imageError } = await supabase
      .from("portfolio_images")
      .select("id, r2_key")
      .eq("id", imageId)
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: "Фото не найдено" }, { status: 404 });
    }

    if (!image.r2_key) {
      return NextResponse.json(
        { error: "У фотографии отсутствует ключ R2. Запись не удалена." },
        { status: 409 },
      );
    }

    await deleteObjectFromR2(image.r2_key);

    const { error: deleteError } = await supabase
      .from("portfolio_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка удаления" },
      { status: 500 },
    );
  }
}
