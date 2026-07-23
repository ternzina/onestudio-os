import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const requiredEnv = (name: string) => {
  const rawValue = process.env[name];
  const value = rawValue
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .trim();

  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

export const r2BucketName = () => requiredEnv("R2_BUCKET_NAME");
const normalizeHttpUrl = (name: "R2_ENDPOINT" | "R2_PUBLIC_URL") => {
  const value = requiredEnv(name).replace(/\/+$/, "");

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error();
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(
      `${name} имеет неправильный формат. Укажите полный адрес, начинающийся с https://, без кавычек и пробелов.`,
    );
  }
};

export const r2PublicUrl = () => normalizeHttpUrl("R2_PUBLIC_URL");

export const r2Client = () =>
  new S3Client({
    region: "auto",
    endpoint: normalizeHttpUrl("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

export const makeSafeSlug = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яіїєґąćęłńóśźż\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `category-${Date.now()}`;
};

export const getFileExtension = (filename: string, contentType: string) => {
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("avif")) return "avif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("heic")) return "heic";

  return "jpg";
};

export const uploadObjectToR2 = async ({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer;
  contentType: string;
}) => {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: r2BucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${r2PublicUrl()}/${encodedKey}`;
};

export const normalizeR2Key = (value: string) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) throw new Error("Пустой ключ файла R2");

  let key = rawValue;

  try {
    const url = new URL(rawValue);
    key = decodeURIComponent(url.pathname);
  } catch {
    // Это обычный ключ R2, а не полный URL.
  }

  return key.replace(/^\/+/, "");
};

export type R2Object = {
  key: string;
  size: number;
  lastModified: string | null;
};

export const listObjectsFromR2 = async () => {
  const client = r2Client();
  const bucket = r2BucketName();
  const objects: R2Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents || []) {
      if (!object.Key || object.Key.endsWith("/")) continue;

      objects.push({
        key: normalizeR2Key(object.Key),
        size: object.Size || 0,
        lastModified: object.LastModified?.toISOString() || null,
      });
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return objects;
};

export const getR2ObjectPublicUrl = (value: string) => {
  const encodedKey = normalizeR2Key(value)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${r2PublicUrl()}/${encodedKey}`;
};

export const deleteObjectFromR2 = async (value: string) => {
  const key = normalizeR2Key(value);
  const client = r2Client();
  const bucket = r2BucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    throw new Error(`Файл остался в R2 после удаления: ${key}`);
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
      ?.httpStatusCode;

    if (status !== 404) throw error;
  }
};
