import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminSupabase } from "@/lib/adminAuth";
import { makeSafeSlug, uploadObjectToR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const MAX_IMAGE_SIZE = 3000;
const CLIENT_OPTIMIZED_MAX_SIZE = 3 * 1024 * 1024;
const WEBP_QUALITY = 90;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

const getSafeOriginalName = (fileName: string) => {
  return (
    fileName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9а-яёіїєґąęłńóśźż_-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "photo"
  );
};

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase } = await getAdminSupabase(request);

    if (authError || !supabase) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const formData = await request.formData();
    const categoryId = String(formData.get("categoryId") || "").trim();

    if (!categoryId) {
      return NextResponse.json({ error: "Не выбрана категория" }, { status: 400 });
    }

    const { data: category, error: categoryError } = await supabase
      .from("portfolio_categories")
      .select("id, slug, name_uk, name_pl")
      .eq("id", categoryId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
    }

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Файлы не выбраны" }, { status: 400 });
    }

    const { data: lastLink } = await supabase
      .from("portfolio_category_images")
      .select("sort_order")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextSortOrder = Number(lastLink?.sort_order || 0) + 10;
    const uploaded = [];
    const safeCategorySlug = makeSafeSlug(category.slug);

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Файл ${file.name} имеет неподдерживаемый формат` },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Файл ${file.name} больше 30 MB` },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);
      const safeName = getSafeOriginalName(file.name);
      const randomId = crypto.randomUUID();
      const r2Key = `${safeCategorySlug}/${Date.now()}-${safeName}-${randomId}.webp`;

      let webpBuffer: Buffer;
      let width: number | null = null;
      let height: number | null = null;

      try {
        let useClientOptimizedWebp = false;

        // Новая панель уже уменьшает большие оригиналы до WEBP перед отправкой.
        // Проверяем такой файл и сохраняем его без второй потери качества.
        if (file.type === "image/webp" && file.size <= CLIENT_OPTIMIZED_MAX_SIZE) {
          const metadata = await sharp(inputBuffer, {
            limitInputPixels: 70_000_000,
          }).metadata();

          if (
            metadata.format === "webp" &&
            metadata.width &&
            metadata.height &&
            metadata.width <= MAX_IMAGE_SIZE &&
            metadata.height <= MAX_IMAGE_SIZE
          ) {
            useClientOptimizedWebp = true;
            width = metadata.width;
            height = metadata.height;
          }
        }

        if (useClientOptimizedWebp) {
          webpBuffer = inputBuffer;
        } else {
          const processedImage = await sharp(inputBuffer, {
            limitInputPixels: 70_000_000,
          })
            .rotate()
            .resize({
              width: MAX_IMAGE_SIZE,
              height: MAX_IMAGE_SIZE,
              fit: "inside",
              withoutEnlargement: true,
            })
            .webp({
              quality: WEBP_QUALITY,
              effort: 4,
            })
            .toBuffer({ resolveWithObject: true });

          webpBuffer = processedImage.data;
          width = processedImage.info.width || null;
          height = processedImage.info.height || null;
        }
      } catch {
        return NextResponse.json(
          {
            error: `Не удалось обработать ${file.name}. Попробуйте JPG, PNG или WEBP. Если это HEIC с iPhone, лучше сначала конвертировать его в JPG.`,
          },
          { status: 400 },
        );
      }

      const imageUrl = await uploadObjectToR2({
        key: r2Key,
        body: webpBuffer,
        contentType: "image/webp",
      });

      const altUk = `${category.name_uk} — портфоліо Sisters Photo Studio`;
      const altPl = `${category.name_pl} — portfolio Sisters Photo Studio`;

      const { data: mediaItem, error: mediaError } = await supabase
        .from("media_library")
        .insert({
          image_url: imageUrl,
          r2_key: r2Key,
          original_filename: file.name,
          mime_type: "image/webp",
          size_bytes: webpBuffer.length,
          width,
          height,
          alt_uk: altUk,
          alt_pl: altPl,
          is_active: true,
          is_favorite: false,
          source: "portfolio_upload",
        })
        .select(
          "id, image_url, r2_key, original_filename, mime_type, size_bytes, width, height, alt_uk, alt_pl, is_active, is_favorite, source, created_at",
        )
        .single();

      if (mediaError || !mediaItem) {
        return NextResponse.json(
          { error: mediaError?.message || "Не удалось сохранить фото в медиатеку" },
          { status: 500 },
        );
      }

      const { data: categoryLink, error: linkError } = await supabase
        .from("portfolio_category_images")
        .insert({
          category_id: categoryId,
          media_id: mediaItem.id,
          is_active: true,
          sort_order: nextSortOrder,
        })
        .select("id, category_id, media_id, is_active, sort_order, created_at")
        .single();

      if (linkError || !categoryLink) {
        return NextResponse.json(
          { error: linkError?.message || "Не удалось связать фото с категорией" },
          { status: 500 },
        );
      }

      uploaded.push({
        id: categoryLink.id,
        category_id: categoryLink.category_id,
        media_id: mediaItem.id,
        image_url: mediaItem.image_url,
        r2_key: mediaItem.r2_key,
        alt_uk: mediaItem.alt_uk,
        alt_pl: mediaItem.alt_pl,
        is_active: categoryLink.is_active && mediaItem.is_active,
        sort_order: categoryLink.sort_order,
        created_at: categoryLink.created_at || mediaItem.created_at,
      });

      nextSortOrder += 10;
    }

    return NextResponse.json({ images: uploaded });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка загрузки" },
      { status: 500 },
    );
  }
}
