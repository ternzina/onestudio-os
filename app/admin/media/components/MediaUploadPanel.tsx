"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PortfolioCategory } from "./types";

type SelectedUploadFile = {
  id: string;
  file: File;
  previewUrl: string;
  kind: "image" | "video";
};

type MediaUploadPanelProps = {
  categories: PortfolioCategory[];
  selectedCategoryId: string;
  onUploaded: (count: number) => void | Promise<void>;
};

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || "";
};

const formatFileSize = (bytes: number) => {
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_SIDE = 3000;
const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

const isVideoFile = (file: File) =>
  file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);

const isSupportedFile = (file: File) =>
  file.type.startsWith("image/") ||
  /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name) ||
  isVideoFile(file);

type LoadedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
};

const loadImageForCanvas = async (file: File): Promise<LoadedImage> => {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Если браузер не смог открыть формат через ImageBitmap,
      // пробуем обычный декодер изображения ниже.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Браузер не поддерживает формат изображения"));
      image.src = objectUrl;
    });

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
};

const canvasToWebp = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Не удалось преобразовать изображение в WEBP"));
        }
      },
      "image/webp",
      quality,
    );
  });

/**
 * Большие оригиналы уменьшаются в браузере до отправки на Vercel.
 * Небольшие файлы не пережимаем повторно — сервер обработает их как раньше.
 */
const optimizeImageForUpload = async (file: File) => {
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  let loadedImage: LoadedImage | null = null;
  const canvas = document.createElement("canvas");

  try {
    loadedImage = await loadImageForCanvas(file);

    let longestSide = MAX_IMAGE_SIDE;
    let bestBlob: Blob | null = null;

    // Обычно хватает первого прохода. Дополнительные проходы нужны только
    // для особенно детализированных кадров, чтобы запрос точно был < 4 MB.
    for (let resizeAttempt = 0; resizeAttempt < 4; resizeAttempt += 1) {
      const scale = Math.min(
        1,
        longestSide / Math.max(loadedImage.width, loadedImage.height),
      );

      canvas.width = Math.max(1, Math.round(loadedImage.width * scale));
      canvas.height = Math.max(1, Math.round(loadedImage.height * scale));

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        throw new Error("Браузер не смог подготовить изображение");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(loadedImage.source, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.9, 0.84, 0.78, 0.72]) {
        const blob = await canvasToWebp(canvas, quality);
        bestBlob = blob;
        if (blob.size <= MAX_UPLOAD_BYTES) break;
      }

      if (bestBlob && bestBlob.size <= MAX_UPLOAD_BYTES) break;
      longestSide = Math.round(longestSide * 0.82);
    }

    if (!bestBlob || bestBlob.size > MAX_UPLOAD_BYTES) {
      throw new Error("Фото не удалось уменьшить до безопасного размера");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([bestBlob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    loadedImage?.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }
};



type VideoMetadata = {
  width: number | null;
  height: number | null;
};

const readVideoMetadata = async (file: File): Promise<VideoMetadata> => {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Браузер не смог прочитать видео"));
      video.src = objectUrl;
    });

    return {
      width: video.videoWidth || null,
      height: video.videoHeight || null,
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
};

type UploadApiResponse = {
  error?: string;
  images?: unknown[];
  importedCount?: number;
  failedCount?: number;
  errors?: string[];
  uploadUrl?: string;
  r2Key?: string;
  videoUrl?: string;
  media?: unknown;
};

const readUploadResponse = async (
  response: Response,
): Promise<UploadApiResponse> => {
  const responseText = await response.text();

  if (!responseText) return {};

  try {
    return JSON.parse(responseText) as UploadApiResponse;
  } catch {
    if (
      response.status === 413 ||
      responseText.includes("Request Entity Too Large")
    ) {
      return { error: "Файл всё ещё слишком большой для сервера" };
    }

    return {
      error: response.ok
        ? "Сервер вернул непонятный ответ"
        : `Ошибка сервера (${response.status})`,
    };
  }
};

export default function MediaUploadPanel({
  categories,
  selectedCategoryId,
  onUploaded,
}: MediaUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedFilesRef = useRef<SelectedUploadFile[]>([]);

  const [uploadCategoryId, setUploadCategoryId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedUploadFile[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [urlText, setUrlText] = useState("");
  const [isImportingUrls, setIsImportingUrls] = useState(false);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.is_active),
    [categories],
  );

  useEffect(() => {
    if (selectedCategoryId !== "all") {
      setUploadCategoryId(selectedCategoryId);
      return;
    }

    setUploadCategoryId((current) => current || activeCategories[0]?.id || "");
  }, [activeCategories, selectedCategoryId]);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((item) => {
        if (item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const addFiles = (files: FileList | File[]) => {
    try {
      const nextFiles = Array.from(files)
        .filter(isSupportedFile)
        .map((file, index) => ({
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: window.URL.createObjectURL(file),
          kind: isVideoFile(file) ? "video" as const : "image" as const,
        }));

      const oversizedVideo = nextFiles.find(
        (item) => item.kind === "video" && item.file.size > MAX_VIDEO_BYTES,
      );
      if (oversizedVideo) {
        nextFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setUploadError(
          `${oversizedVideo.file.name}: видео больше 250 MB. Сначала уменьшите его при экспорте.`,
        );
        return;
      }

      if (nextFiles.length === 0) {
        setUploadError("Выберите фото или видео MP4, WebM, MOV");
        return;
      }

      setSelectedFiles((current) => [...current, ...nextFiles]);
      setUploadMessage("");
      setUploadError("");
    } catch {
      setUploadError(
        "Не удалось открыть выбранный файл на этом устройстве. Попробуйте выбрать его ещё раз.",
      );
    }
  };

  const removeSelectedFile = (fileId: string) => {
    setSelectedFiles((current) => {
      const fileToRemove = current.find((item) => item.id === fileId);
      if (fileToRemove?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return current.filter((item) => item.id !== fileId);
    });
  };

  const clearSelectedFiles = () => {
    selectedFiles.forEach((item) => {
      if (item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportUrls = async () => {
    if (!uploadCategoryId) {
      setUploadError("Выберите категорию для загрузки");
      return;
    }

    const urls = urlText
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setUploadError("Вставьте хотя бы одну ссылку на изображение");
      return;
    }

    if (urls.length > 10) {
      setUploadError("За один раз можно загрузить не больше 10 ссылок");
      return;
    }

    setIsImportingUrls(true);
    setUploadMessage("Копируем изображения по ссылкам…");
    setUploadError("");

    try {
      const token = await getSessionToken();
      if (!token) {
        throw new Error(
          "Сессия входа закончилась. Выйдите и войдите в админку снова.",
        );
      }

      const response = await fetch("/api/admin/media/import-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId: uploadCategoryId, urls }),
      });
      const data = await readUploadResponse(response);

      if (!response.ok && !data.importedCount) {
        throw new Error(
          data.error || "Не удалось загрузить изображения по ссылкам",
        );
      }

      const importedCount = data.importedCount || 0;
      if (importedCount > 0) {
        await onUploaded(importedCount);
      }

      if (data.failedCount) {
        setUploadMessage(`Загружено по ссылкам: ${importedCount}`);
        setUploadError(
          `Не загрузилось: ${data.failedCount}. ${(data.errors || []).slice(0, 2).join("; ")}`,
        );
      } else {
        setUrlText("");
        setUploadMessage(`Готово. Загружено по ссылкам: ${importedCount}`);
      }
    } catch (error) {
      setUploadMessage("");
      setUploadError(
        error instanceof Error ? error.message : "Ошибка загрузки по ссылке",
      );
    } finally {
      setIsImportingUrls(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadCategoryId) {
      setUploadError("Выберите категорию для загрузки");
      return;
    }

    if (selectedFiles.length === 0) {
      setUploadError("Выберите фото или видео для загрузки");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");
    setUploadError("");

    try {
      const token = await getSessionToken();
      if (!token) {
        throw new Error(
          "Сессия входа закончилась. Выйдите и войдите в админку снова.",
        );
      }
      const uploadQueue = [...selectedFiles];
      const failedItems: SelectedUploadFile[] = [];
      const failedMessages: string[] = [];
      let uploadedCount = 0;

      for (let index = 0; index < uploadQueue.length; index += 1) {
        const item = uploadQueue[index];
        setUploadMessage(
          `Подготавливаем и загружаем ${index + 1} из ${uploadQueue.length}…`,
        );

        try {
          if (item.kind === "video") {
            const mimeType = item.file.type ||
              (/\.webm$/i.test(item.file.name)
                ? "video/webm"
                : /\.(mov)$/i.test(item.file.name)
                  ? "video/quicktime"
                  : /\.m4v$/i.test(item.file.name)
                    ? "video/x-m4v"
                    : "video/mp4");
            const metadata = await readVideoMetadata(item.file);

            const prepareResponse = await fetch(
              "/api/admin/portfolio/video-upload",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  action: "prepare",
                  categoryId: uploadCategoryId,
                  filename: item.file.name,
                  mimeType,
                  sizeBytes: item.file.size,
                }),
              },
            );
            const prepared = await readUploadResponse(prepareResponse);
            if (
              !prepareResponse.ok ||
              prepared.error ||
              !prepared.uploadUrl ||
              !prepared.r2Key
            ) {
              throw new Error(
                prepared.error || "Не удалось подготовить загрузку видео",
              );
            }

            const r2Response = await fetch(prepared.uploadUrl, {
              method: "PUT",
              headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=31536000, immutable",
              },
              body: item.file,
            });

            if (!r2Response.ok) {
              throw new Error(
                "Видео не отправилось в R2. Проверьте разрешение CORS для сайта.",
              );
            }

            const completeResponse = await fetch(
              "/api/admin/portfolio/video-upload",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  action: "complete",
                  categoryId: uploadCategoryId,
                  filename: item.file.name,
                  mimeType,
                  sizeBytes: item.file.size,
                  r2Key: prepared.r2Key,
                  width: metadata.width,
                  height: metadata.height,
                }),
              },
            );
            const completed = await readUploadResponse(completeResponse);
            if (!completeResponse.ok || completed.error) {
              throw new Error(
                completed.error || "Не удалось добавить видео в медиатеку",
              );
            }
          } else {
            const preparedFile = await optimizeImageForUpload(item.file);
            const formData = new FormData();
            formData.append("categoryId", uploadCategoryId);
            formData.append("files", preparedFile);

            const response = await fetch("/api/admin/portfolio/upload", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });

            const data = await readUploadResponse(response);
            if (!response.ok || data.error) {
              throw new Error(data.error || "Не удалось загрузить фото");
            }
          }

          uploadedCount += 1;
          if (item.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(item.previewUrl);
          }

          setSelectedFiles((current) =>
            current.filter((selectedItem) => selectedItem.id !== item.id),
          );
          setUploadMessage(
            `Загружено ${uploadedCount} из ${uploadQueue.length}`,
          );
        } catch (error) {
          failedItems.push(item);
          const message =
            error instanceof Error ? error.message : "Ошибка загрузки";
          failedMessages.push(`${item.file.name}: ${message}`);
        }
      }

      setSelectedFiles(failedItems);
      if (failedItems.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (uploadedCount > 0) {
        await onUploaded(uploadedCount);
      }

      if (failedItems.length > 0) {
        setUploadError(
          `Не загрузилось: ${failedItems.length}. ${failedMessages.slice(0, 2).join("; ")}`,
        );
        setUploadMessage(
          uploadedCount > 0
            ? `Загружено материалов: ${uploadedCount}. Неудачные остались в очереди.`
            : "",
        );
      } else {
        setUploadMessage(`Готово. Загружено материалов: ${uploadedCount}`);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Ошибка загрузки",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-[34px] border border-[#E5D5C8] bg-white/72 p-5 shadow-[0_24px_90px_rgba(83,54,37,0.10)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
            Upload
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
            Загрузить фото и видео
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Фото автоматически оптимизируются, а видео напрямую загружаются в Cloudflare R2. Все материалы сразу привязываются к выбранной категории портфолио.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
            Категория
          </label>
          <select
            value={uploadCategoryId}
            onChange={(event) => setUploadCategoryId(event.target.value)}
            className="w-full rounded-full border border-[#D8C4B3] bg-white/90 px-5 py-3 text-sm outline-none focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
          >
            {activeCategories.length === 0 ? (
              <option value="">Нет активных категорий</option>
            ) : (
              activeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_uk}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {uploadMessage && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          {uploadMessage}
        </div>
      )}

      {uploadError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      <div className="mt-6 rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
              Загрузить по ссылке
            </label>
            <textarea
              value={urlText}
              onChange={(event) => setUrlText(event.target.value)}
              rows={3}
              placeholder={
                "https://example.com/photo.jpg\nМожно вставить до 10 ссылок — каждую с новой строки"
              }
              className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none placeholder:text-[#A99587] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </div>
          <button
            type="button"
            onClick={handleImportUrls}
            disabled={isImportingUrls || !urlText.trim() || !uploadCategoryId}
            className="shrink-0 rounded-full border border-[#2B1A12] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#2B1A12] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImportingUrls ? "Загружаем…" : "Загрузить ссылки"}
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#7A6252]">
          Изображение будет скопировано в Cloudflare R2 и сохранено как WebP.
          Исходная ссылка после этого больше не нужна.
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingFiles(true);
        }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDraggingFiles(false);
          addFiles(event.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-6 cursor-pointer rounded-[30px] border-2 border-dashed p-8 text-center transition ${
          isDraggingFiles
            ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA]"
            : "border-[#D8C4B3] bg-[#F7F1EA]/70 text-[#2B1A12] hover:border-[#A67C52] hover:bg-white/80"
        }`}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-3xl shadow-[0_16px_40px_rgba(83,54,37,0.10)]">
          📤
        </div>
        <p className="text-lg font-semibold tracking-[-0.03em]">
          Перетягніть фото або відео сюди
        </p>
        <p
          className={`mt-2 text-sm ${isDraggingFiles ? "text-[#E8D8CC]" : "text-[#7A6252]"}`}
        >
          або натисніть для вибору з компʼютера
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,video/mp4,video/webm,video/quicktime,video/x-m4v,.mov,.m4v"
          multiple
          className="hidden"
          onChange={(event) =>
            event.target.files && addFiles(event.target.files)
          }
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-5 rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#2B1A12]">
                Очередь загрузки: {selectedFiles.length}
              </p>
              <p className="mt-1 text-xs text-[#7A6252]">
                Проверьте фото и видео перед отправкой в медиатеку.
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelectedFiles}
              className="text-xs uppercase tracking-[0.14em] text-[#7A6252] hover:text-[#2B1A12]"
            >
              Очистить
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {selectedFiles.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-[22px] border border-[#E5D5C8] bg-[#17100D] shadow-[0_12px_34px_rgba(83,54,37,0.10)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {item.kind === "video" ? (
                    <video
                      src={item.previewUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                  {item.kind === "video" && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                      ▶ Видео
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="truncate text-[11px] font-medium text-white">
                    {item.file.name}
                  </p>
                  <p className="mt-1 text-[10px] text-white/70">
                    {formatFileSize(item.file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeSelectedFile(item.id);
                  }}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-[#2B1A12] opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-red-50 hover:text-red-700 group-hover:opacity-100"
                  aria-label="Удалить из очереди"
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={
          isUploading || selectedFiles.length === 0 || !uploadCategoryId
        }
        className="mt-6 rounded-full bg-[#2B1A12] px-7 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "Готуємо та завантажуємо..." : "Завантажити фото і відео"}
      </button>
    </section>
  );
}
