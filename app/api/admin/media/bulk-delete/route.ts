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

    const { mediaIds } = await request.json();

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: "Не выбраны фото для удаления" }, { status: 400 });
    }

    const cleanMediaIds = Array.from(
      new Set(mediaIds.map((id) => String(id || "").trim()).filter(Boolean)),
    );

    if (cleanMediaIds.length === 0) {
      return NextResponse.json({ error: "Не выбраны фото для удаления" }, { status: 400 });
    }

    const { data: mediaItems, error: mediaError } = await supabase
      .from("media_library")
      .select("id, r2_key")
      .in("id", cleanMediaIds);

    if (mediaError) {
      return NextResponse.json({ error: mediaError.message }, { status: 500 });
    }

    if (!mediaItems || mediaItems.length === 0) {
      return NextResponse.json({ error: "Фото не найдены" }, { status: 404 });
    }

    const r2DeletedIds: string[] = [];
    const failedItems: Array<{ id: string; r2Key: string | null; error: string }> = [];

    for (const item of mediaItems) {
      if (!item.r2_key) {
        failedItems.push({
          id: item.id,
          r2Key: null,
          error: "У записи отсутствует ключ файла R2",
        });
        continue;
      }

      try {
        await deleteObjectFromR2(item.r2_key);
        r2DeletedIds.push(item.id);
      } catch (error) {
        failedItems.push({
          id: item.id,
          r2Key: item.r2_key,
          error:
            error instanceof Error ? error.message : "Ошибка удаления из R2",
        });
      }
    }

    if (r2DeletedIds.length === 0) {
      return NextResponse.json(
        {
          error: "Файлы не удалось удалить из R2. Записи в базе сохранены.",
          deletedCount: 0,
          deletedIds: [],
          failedCount: failedItems.length,
          failedItems,
        },
        { status: 502 },
      );
    }

    const { error: linksError } = await supabase
      .from("portfolio_category_images")
      .delete()
      .in("media_id", r2DeletedIds);

    if (linksError) {
      return NextResponse.json({ error: linksError.message }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from("media_library")
      .delete()
      .in("id", r2DeletedIds);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ok: failedItems.length === 0,
        deletedCount: r2DeletedIds.length,
        deletedIds: r2DeletedIds,
        failedCount: failedItems.length,
        failedItems,
      },
      { status: failedItems.length > 0 ? 207 : 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка массового удаления" },
      { status: 500 },
    );
  }
}
