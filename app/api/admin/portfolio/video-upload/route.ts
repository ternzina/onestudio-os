import { createHash, createHmac, randomUUID } from "crypto";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/adminAuth";
import { getR2ObjectPublicUrl, makeSafeSlug } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_VIDEO_SIZE = 250 * 1024 * 1024;
const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

const EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
};

const readEnv = (...names: string[]) => {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
};

const encodeAwsValue = (value: string) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

const hashSha256 = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");

const hmacSha256 = (key: Buffer | string, value: string) =>
  createHmac("sha256", key).update(value, "utf8").digest();

const createPresignedPutUrl = ({
  endpoint,
  bucket,
  key,
  accessKeyId,
  secretAccessKey,
  contentType,
  expiresIn = 15 * 60,
}: {
  endpoint: string;
  bucket: string;
  key: string;
  accessKeyId: string;
  secretAccessKey: string;
  contentType: string;
  expiresIn?: number;
}) => {
  const endpointUrl = new URL(endpoint);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const encodedObjectPath = [bucket, ...key.split("/")]
    .map(encodeAwsValue)
    .join("/");
  const endpointPath = endpointUrl.pathname.replace(/\/$/, "");
  const canonicalUri = `${endpointPath}/${encodedObjectPath}`.replace(/\/{2,}/g, "/");
  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "content-type;host",
  };
  const canonicalQuery = Object.entries(query)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([name, value]) => `${encodeAwsValue(name)}=${encodeAwsValue(value)}`)
    .join("&");
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${endpointUrl.host.toLowerCase()}\n`;
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    "content-type;host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest),
  ].join("\n");
  const dateKey = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmacSha256(dateKey, region);
  const serviceKey = hmacSha256(regionKey, service);
  const signingKey = hmacSha256(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  endpointUrl.pathname = canonicalUri;
  endpointUrl.search = `${canonicalQuery}&X-Amz-Signature=${signature}`;
  return endpointUrl.toString();
};

const getR2Client = () => {
  const accountId = readEnv("R2_ACCOUNT_ID", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_R2_ACCOUNT_ID");
  const endpoint = readEnv("R2_ENDPOINT") ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");
  const accessKeyId = readEnv(
    "R2_ACCESS_KEY_ID",
    "R2_ACCESS_KEY",
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
  );
  const secretAccessKey = readEnv(
    "R2_SECRET_ACCESS_KEY",
    "R2_SECRET_KEY",
    "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  );
  const bucket =
    readEnv(
      "R2_BUCKET_NAME",
      "R2_BUCKET",
      "CLOUDFLARE_R2_BUCKET_NAME",
    ) || "portfolio";

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Не найдены настройки Cloudflare R2 для прямой загрузки видео",
    );
  }

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    client: new S3Client({
      region: "auto",
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
};

const cleanFilenameBase = (filename: string) => {
  return (
    filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "Studio video"
  );
};

const safeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
};

type PrepareBody = {
  action: "prepare";
  categoryId?: string;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
};

type CompleteBody = {
  action: "complete";
  categoryId?: string;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  r2Key?: string;
  width?: number | null;
  height?: number | null;
};

type RequestBody = PrepareBody | CompleteBody;

export async function POST(request: NextRequest) {
  try {
    const { error: authError, supabase, businessId } = await getAdminSupabase(request);

    if (authError || !supabase || !businessId) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const body = (await request.json()) as RequestBody;
    const categoryId = String(body.categoryId || "").trim();
    const filename = String(body.filename || "video.mp4").trim();
    const mimeType = String(body.mimeType || "").trim().toLowerCase();
    const sizeBytes = Number(body.sizeBytes || 0);

    if (!categoryId) {
      return NextResponse.json(
        { error: "Выберите категорию для видео" },
        { status: 400 },
      );
    }

    if (!VIDEO_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Поддерживаются видео MP4, WebM и MOV" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      return NextResponse.json(
        { error: "Не удалось определить размер видео" },
        { status: 400 },
      );
    }

    if (sizeBytes > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Видео больше 250 MB. Сначала уменьшите его при экспорте." },
        { status: 400 },
      );
    }

    const { data: category, error: categoryError } = await supabase
      .from("portfolio_categories")
      .select("id, slug, name")
      .eq("id", categoryId)
      .eq("business_id", businessId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 },
      );
    }

    const { endpoint, bucket, accessKeyId, secretAccessKey, client } = getR2Client();

    if (body.action === "prepare") {
      const extension = EXTENSIONS[mimeType] || "mp4";
      const safeName = makeSafeSlug(filename.replace(/\.[^/.]+$/, "")) || "video";
      const safeCategory = makeSafeSlug(category.slug || "video") || "video";
      const r2Key = `businesses/${businessId}/portfolio/videos/${safeCategory}/${Date.now()}-${safeName}-${randomUUID().slice(0, 8)}.${extension}`;

      const uploadUrl = createPresignedPutUrl({
        endpoint,
        bucket,
        key: r2Key,
        accessKeyId,
        secretAccessKey,
        contentType: mimeType,
      });

      return NextResponse.json({
        uploadUrl,
        r2Key,
        videoUrl: getR2ObjectPublicUrl(r2Key),
      });
    }

    if (body.action !== "complete") {
      return NextResponse.json(
        { error: "Неизвестный этап загрузки" },
        { status: 400 },
      );
    }

    const r2Key = String(body.r2Key || "").trim();
    if (!r2Key.startsWith(`businesses/${businessId}/portfolio/videos/`)) {
      return NextResponse.json(
        { error: "Неправильный путь видео в R2" },
        { status: 400 },
      );
    }

    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: r2Key }),
    );

    if (!head.ContentLength || head.ContentLength <= 0) {
      return NextResponse.json(
        { error: "Видео не появилось в R2" },
        { status: 422 },
      );
    }
    if (head.ContentLength > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "Видео в R2 превышает лимит 250 MB" },
        { status: 422 },
      );
    }
    if (!head.ContentType || !VIDEO_TYPES.has(head.ContentType.toLowerCase())) {
      return NextResponse.json(
        { error: "R2 вернул неподдерживаемый тип видео" },
        { status: 422 },
      );
    }

    const { data: existingMedia } = await supabase
      .from("media_library")
      .select(
        "id, image_url, r2_key, original_filename, mime_type, size_bytes, width, height, alt_text, is_active, is_favorite, source, created_at",
      )
      .eq("r2_key", r2Key)
      .eq("business_id", businessId)
      .maybeSingle();

    if (existingMedia) {
      const { data: existingLink } = await supabase
        .from("portfolio_category_images")
        .select("id")
        .eq("business_id", businessId)
        .eq("category_id", categoryId)
        .eq("media_id", existingMedia.id)
        .maybeSingle();

      if (!existingLink) {
        const { data: lastLink } = await supabase
          .from("portfolio_category_images")
          .select("sort_order")
          .eq("business_id", businessId)
          .eq("category_id", categoryId)
          .order("sort_order", { ascending: false })
          .limit(1)
          .maybeSingle();

        await supabase.from("portfolio_category_images").insert({
          business_id: businessId,
          category_id: categoryId,
          media_id: existingMedia.id,
          is_active: true,
          sort_order: Number(lastLink?.sort_order || 0) + 10,
        });
      }

      return NextResponse.json({ media: existingMedia, alreadyExists: true });
    }

    const title = cleanFilenameBase(filename);
    const videoUrl = getR2ObjectPublicUrl(r2Key);
    const width = safeNumber(body.width);
    const height = safeNumber(body.height);

    const { data: mediaItem, error: mediaError } = await supabase
      .from("media_library")
      .insert({
        business_id: businessId,
        image_url: videoUrl,
        r2_key: r2Key,
        original_filename: filename,
        mime_type: mimeType,
        size_bytes: Number(head.ContentLength || sizeBytes),
        width,
        height,
        alt_text: title,
        is_active: true,
        is_favorite: false,
        source: "portfolio_video_upload",
      })
      .select(
        "id, image_url, r2_key, original_filename, mime_type, size_bytes, width, height, alt_text, is_active, is_favorite, source, created_at",
      )
      .single();

    if (mediaError || !mediaItem) {
      return NextResponse.json(
        { error: mediaError?.message || "Не удалось сохранить видео в медиатеку" },
        { status: 500 },
      );
    }

    const { data: lastLink } = await supabase
      .from("portfolio_category_images")
      .select("sort_order")
      .eq("business_id", businessId)
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error: linkError } = await supabase
      .from("portfolio_category_images")
      .insert({
        business_id: businessId,
        category_id: categoryId,
        media_id: mediaItem.id,
        is_active: true,
        sort_order: Number(lastLink?.sort_order || 0) + 10,
      });

    if (linkError) {
      await supabase
        .from("media_library")
        .delete()
        .eq("business_id", businessId)
        .eq("id", mediaItem.id);
      return NextResponse.json(
        { error: linkError.message || "Не удалось добавить видео в категорию" },
        { status: 500 },
      );
    }

    return NextResponse.json({ media: mediaItem });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Ошибка загрузки видео",
      },
      { status: 500 },
    );
  }
}
