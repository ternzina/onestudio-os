import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/adminAuth";
import {
  getR2ObjectPublicUrl,
  listObjectsFromR2,
  normalizeR2Key,
} from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MEDIA_EXTENSION = /\.(?:avif|bmp|gif|heic|heif|jpe?g|m4v|mov|mp4|png|svg|tiff?|webm|webp)$/i;

const MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  mp4: "video/mp4",
  png: "image/png",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  webm: "video/webm",
  webp: "image/webp",
};

const getFilename = (key: string) => {
  const filename = key.split("/").pop() || key;

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
};

const getMimeType = (key: string) => {
  const extension = key.split(".").pop()?.toLowerCase() || "";
  return MIME_TYPES[extension] || "application/octet-stream";
};

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase } = await getAdminSupabase(request);

    if (authError || !supabase) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const existingKeys = new Set<string>();
    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("media_library")
        .select("r2_key")
        .range(from, from + pageSize - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      for (const item of data || []) {
        if (!item.r2_key) continue;

        try {
          existingKeys.add(normalizeR2Key(item.r2_key));
        } catch {
          // Повреждённая старая запись не мешает синхронизации.
        }
      }

      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    const allR2Objects = await listObjectsFromR2();
    const mediaObjects = allR2Objects.filter((object) =>
      MEDIA_EXTENSION.test(object.key),
    );
    const missingObjects = mediaObjects.filter(
      (object) => !existingKeys.has(normalizeR2Key(object.key)),
    );

    let addedCount = 0;
    const insertErrors: string[] = [];
    const batchSize = 200;

    for (let index = 0; index < missingObjects.length; index += batchSize) {
      const batch = missingObjects.slice(index, index + batchSize);
      const rows = batch.map((object) => ({
        image_url: getR2ObjectPublicUrl(object.key),
        r2_key: normalizeR2Key(object.key),
        original_filename: getFilename(object.key),
        mime_type: getMimeType(object.key),
        size_bytes: object.size,
        width: null,
        height: null,
        alt_uk: null,
        alt_pl: null,
        is_active: true,
        is_favorite: false,
        source: "r2-sync",
      }));

      const { data, error } = await supabase
        .from("media_library")
        .insert(rows)
        .select("id");

      if (error) {
        insertErrors.push(error.message);
        continue;
      }

      addedCount += data?.length || rows.length;
    }

    if (insertErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Не все найденные материалы удалось добавить в медиатеку",
          r2MediaCount: mediaObjects.length,
          missingCount: missingObjects.length,
          addedCount,
          errors: insertErrors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      r2ObjectCount: allR2Objects.length,
      r2MediaCount: mediaObjects.length,
      missingCount: missingObjects.length,
      addedCount,
      skippedCount: mediaObjects.length - missingObjects.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ошибка синхронизации Cloudflare R2",
      },
      { status: 500 },
    );
  }
}
