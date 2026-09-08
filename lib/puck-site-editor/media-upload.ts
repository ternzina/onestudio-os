export const PUCK_MEDIA_MAX_BYTES = 30 * 1024 * 1024;
export const PUCK_MEDIA_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export type PuckMediaUploadContext = {
  businessId: string;
  userId: string;
  canConfigure: boolean;
};

export type PuckMediaUploadFile = {
  name: string;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
};

export type PuckMediaObjectStorage = {
  upload(input: { key: string; bytes: Uint8Array; contentType: string }): Promise<{ url: string }>;
};

export type PuckMediaLibraryRepository = {
  insert(input: {
    businessId: string;
    imageUrl: string;
    r2Key: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    source: "puck_site_editor";
  }): Promise<{ id: string; imageUrl: string }>;
};

function safeFilename(value: string) {
  return value
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "image";
}

export function createPuckMediaUploadAdapter(dependencies: {
  storage: PuckMediaObjectStorage;
  mediaLibrary: PuckMediaLibraryRepository;
  createId: () => string;
}) {
  return async function uploadPuckMedia(
    context: PuckMediaUploadContext,
    file: PuckMediaUploadFile,
  ) {
    if (!context.canConfigure) throw new Error("puck_media_upload_forbidden");
    if (!PUCK_MEDIA_ALLOWED_TYPES.has(file.mimeType)) throw new Error("puck_media_type_unsupported");
    if (file.size <= 0 || file.size > PUCK_MEDIA_MAX_BYTES || file.size !== file.bytes.byteLength) {
      throw new Error("puck_media_size_invalid");
    }
    const id = dependencies.createId().replace(/[^a-zA-Z0-9-]/g, "");
    if (!id) throw new Error("puck_media_id_invalid");
    const key = `businesses/${context.businessId}/site-editor/${safeFilename(file.name)}-${id}`;
    const uploaded = await dependencies.storage.upload({ key, bytes: file.bytes, contentType: file.mimeType });
    const media = await dependencies.mediaLibrary.insert({
      businessId: context.businessId,
      imageUrl: uploaded.url,
      r2Key: key,
      originalFilename: file.name,
      mimeType: file.mimeType,
      sizeBytes: file.size,
      source: "puck_site_editor",
    });
    return { id: media.id, url: media.imageUrl, path: key };
  };
}
