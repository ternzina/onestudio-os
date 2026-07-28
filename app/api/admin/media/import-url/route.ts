import { randomUUID } from "crypto";
import { lookup } from "dns/promises";
import { isIP } from "net";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminSupabase } from "@/lib/adminAuth";
import { makeSafeSlug, uploadObjectToR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_URLS = 10;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const isPrivateAddress = (address: string) => {
  const normalized = address.toLowerCase().replace(/^::ffff:/, "");

  if (normalized === "::1" || normalized === "0.0.0.0") return true;
  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  )
    return true;

  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part)))
    return false;

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
};

const validateRemoteUrl = async (rawUrl: string) => {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Неправильная ссылка");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Ссылка должна начинаться с http:// или https://");
  }

  if (url.username || url.password) {
    throw new Error("Ссылки с логином и паролем не поддерживаются");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Локальные адреса запрещены");
  }

  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });

  if (
    addresses.length === 0 ||
    addresses.some((item) => isPrivateAddress(item.address))
  ) {
    throw new Error("Этот адрес недоступен для импорта");
  }

  return url;
};

const fetchImage = async (rawUrl: string) => {
  let url = await validateRemoteUrl(rawUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        Accept: "image/avif,image/webp,image/jpeg,image/png,image/*",
        "User-Agent": "OneStudioOS-Media-Importer/1.0",
      },
      signal: AbortSignal.timeout(20_000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirect === MAX_REDIRECTS) {
        throw new Error("Слишком много перенаправлений");
      }
      url = await validateRemoteUrl(new URL(location, url).toString());
      continue;
    }

    if (!response.ok) {
      throw new Error(`Сайт вернул ошибку ${response.status}`);
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0].trim() || "";
    if (!contentType.startsWith("image/")) {
      throw new Error("По ссылке найден не файл изображения");
    }

    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > MAX_SOURCE_BYTES) {
      throw new Error("Исходное изображение больше 20 MB");
    }

    if (!response.body) throw new Error("Сайт вернул пустой файл");

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_SOURCE_BYTES) {
        await reader.cancel();
        throw new Error("Исходное изображение больше 20 MB");
      }
      chunks.push(value);
    }

    return {
      buffer: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
      finalUrl: url,
    };
  }

  throw new Error("Не удалось открыть ссылку");
};

const sourceFilename = (url: URL) => {
  const encodedName = url.pathname.split("/").pop() || "photo";
  try {
    return decodeURIComponent(encodedName).slice(0, 180) || "photo";
  } catch {
    return encodedName.slice(0, 180) || "photo";
  }
};

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase, businessId } = await getAdminSupabase(request);
    if (authError || !supabase || !businessId) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = (await request.json()) as {
      categoryId?: string;
      urls?: unknown[];
    };
    const categoryId = String(body.categoryId || "").trim();
    const urls = Array.from(
      new Set(
        (Array.isArray(body.urls) ? body.urls : [])
          .map((url) => String(url || "").trim())
          .filter(Boolean),
      ),
    );

    if (!categoryId) {
      return NextResponse.json(
        { error: "Выберите категорию" },
        { status: 400 },
      );
    }
    if (urls.length === 0) {
      return NextResponse.json(
        { error: "Вставьте ссылку на изображение" },
        { status: 400 },
      );
    }
    if (urls.length > MAX_URLS) {
      return NextResponse.json(
        { error: `За один раз можно загрузить не больше ${MAX_URLS} ссылок` },
        { status: 400 },
      );
    }

    const { data: category, error: categoryError } = await supabase
      .from("portfolio_categories")
      .select("id, slug")
      .eq("id", categoryId)
      .eq("business_id", businessId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 },
      );
    }

    const { data: lastLink } = await supabase
      .from("portfolio_category_images")
      .select("sort_order")
      .eq("category_id", categoryId)
      .eq("business_id", businessId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextSortOrder = (lastLink?.sort_order || 0) + 10;
    const images: Array<{ id: string; image_url: string }> = [];
    const errors: string[] = [];

    for (const rawUrl of urls) {
      try {
        const { buffer, finalUrl } = await fetchImage(rawUrl);
        const originalFilename = sourceFilename(finalUrl);
        const filenameBase = makeSafeSlug(
          originalFilename.replace(/\.[^.]+$/, ""),
        );
        const key = `businesses/${businessId}/portfolio/${makeSafeSlug(category.slug || "imported")}/${Date.now()}-${randomUUID().slice(0, 8)}-${filenameBase}.webp`;

        const output = await sharp(buffer, { failOn: "error" })
          .rotate()
          .resize({
            width: 3000,
            height: 3000,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 90 })
          .toBuffer();
        const metadata = await sharp(output).metadata();
        const imageUrl = await uploadObjectToR2({
          key,
          body: output,
          contentType: "image/webp",
        });

        const { data: media, error: mediaError } = await supabase
          .from("media_library")
          .insert({
            business_id: businessId,
            image_url: imageUrl,
            r2_key: key,
            original_filename: originalFilename,
            mime_type: "image/webp",
            size_bytes: output.length,
            width: metadata.width || null,
            height: metadata.height || null,
            alt_text: null,
            is_active: true,
            is_favorite: false,
            source: "url-import",
          })
          .select("id, image_url")
          .single();

        if (mediaError || !media)
          throw new Error(
            mediaError?.message || "Не удалось добавить фото в медиатеку",
          );

        const { error: linkError } = await supabase
          .from("portfolio_category_images")
          .insert({
            business_id: businessId,
            category_id: categoryId,
            media_id: media.id,
            is_active: true,
            sort_order: nextSortOrder,
          });
        if (linkError) throw new Error(linkError.message);

        nextSortOrder += 10;
        images.push(media);
      } catch (error) {
        const shortUrl =
          rawUrl.length > 70 ? `${rawUrl.slice(0, 67)}…` : rawUrl;
        errors.push(
          `${shortUrl}: ${error instanceof Error ? error.message : "ошибка импорта"}`,
        );
      }
    }

    return NextResponse.json(
      {
        ok: errors.length === 0,
        importedCount: images.length,
        failedCount: errors.length,
        images,
        errors,
        ...(images.length === 0
          ? { error: "Не удалось загрузить изображения по ссылкам" }
          : {}),
      },
      { status: images.length === 0 ? 422 : errors.length > 0 ? 207 : 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Ошибка загрузки по ссылке",
      },
      { status: 500 },
    );
  }
}
