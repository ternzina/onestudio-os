import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminSupabase } from "@/lib/adminAuth";
import { makeSafeSlug, uploadObjectToR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const MAX_IMAGE_SIZE = 3000;
const WEBP_QUALITY = 90;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/x-png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "heic",
  "heif",
]);

const ALLOWED_FOLDERS = new Set([
  "site/photoshoots/hero",
  "site/rental/hero",
  "site/rental/video",
  "site/rental/equipment",
  "site/rental/gallery",
  "site/rental/location",
  "site/home/collage",
  "site/home/carousel",
  "site/team",
  "site/testimonials",
  "site/interiors",
  "site/learning/hero",
  "site/learning/programs",
]);

const getSafeOriginalName = (fileName: string) =>
  fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9а-яёіїєґąęłńóśźż_-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "photo";

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase } = await getAdminSupabase(request);

    if (authError || !supabase) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const formData = await request.formData();
    const fileValue = formData.get("file");
    const requestedFolder = String(formData.get("folder") || "").trim();

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    if (!ALLOWED_FOLDERS.has(requestedFolder)) {
      return NextResponse.json({ error: "Недопустимая папка загрузки" }, { status: 400 });
    }

    const normalizedType = fileValue.type.toLowerCase().trim();
    const extension = fileValue.name.split(".").pop()?.toLowerCase() || "";
    const isAllowedFile =
      ALLOWED_TYPES.has(normalizedType) || ALLOWED_EXTENSIONS.has(extension);

    if (!isAllowedFile) {
      return NextResponse.json(
        { error: "Поддерживаются JPG, PNG, WEBP, AVIF, HEIC и HEIF" },
        { status: 400 },
      );
    }

    if (fileValue.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Файл больше 30 MB" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await fileValue.arrayBuffer());
    const safeName = getSafeOriginalName(fileValue.name);
    const safeFolder = requestedFolder
      .split("/")
      .map((part) => makeSafeSlug(part))
      .join("/");
    const r2Key = `${safeFolder}/${Date.now()}-${safeName}-${crypto.randomUUID()}.webp`;

    let webpBuffer: Buffer;
    let width: number | null = null;
    let height: number | null = null;

    try {
      webpBuffer = await sharp(inputBuffer, { limitInputPixels: 70_000_000 })
        .rotate()
        .resize({
          width: MAX_IMAGE_SIZE,
          height: MAX_IMAGE_SIZE,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toBuffer();

      const metadata = await sharp(webpBuffer).metadata();
      width = metadata.width || null;
      height = metadata.height || null;
    } catch {
      return NextResponse.json(
        {
          error:
            "Не удалось обработать изображение. Попробуйте выбрать фотографию ещё раз или отправьте её в формате JPG, PNG либо WEBP.",
        },
        { status: 400 },
      );
    }

    const imageUrl = await uploadObjectToR2({
      key: r2Key,
      body: webpBuffer,
      contentType: "image/webp",
    });

    const { data: mediaItem, error: mediaError } = await supabase
      .from("media_library")
      .insert({
        image_url: imageUrl,
        r2_key: r2Key,
        original_filename: fileValue.name,
        mime_type: "image/webp",
        size_bytes: webpBuffer.length,
        width,
        height,
        alt_uk: `Зображення сайту Sisters Photo Studio · ${requestedFolder}`,
        alt_pl: `Zdjęcie strony Sisters Photo Studio · ${requestedFolder}`,
        is_active: true,
        is_favorite: false,
        source: "site_content_upload",
      })
      .select("id, image_url, r2_key, width, height, size_bytes")
      .single();

    if (mediaError || !mediaItem) {
      return NextResponse.json(
        { error: mediaError?.message || "Не удалось сохранить фото в медиатеку" },
        { status: 500 },
      );
    }

    return NextResponse.json(mediaItem);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка загрузки" },
      { status: 500 },
    );
  }
}
