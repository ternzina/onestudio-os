"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";


const CLIENT_UPLOAD_LIMIT = 3.8 * 1024 * 1024;
const CLIENT_MAX_IMAGE_SIZE = 2400;

const isHeicFile = (file: File) => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
};

const prepareImageForUpload = async (file: File): Promise<File> => {
  const needsBrowserPreparation =
    file.size > CLIENT_UPLOAD_LIMIT || isHeicFile(file);

  if (!needsBrowserPreparation) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error("Не удалось открыть фото на этом устройстве"));
      element.src = objectUrl;
    });

    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;

    if (!sourceWidth || !sourceHeight) {
      throw new Error("Не удалось определить размер фотографии");
    }

    const baseScale = Math.min(
      1,
      CLIENT_MAX_IMAGE_SIZE / Math.max(sourceWidth, sourceHeight)
    );

    const attempts = [
      { scale: baseScale, quality: 0.82 },
      { scale: Math.min(baseScale, 0.82), quality: 0.76 },
      { scale: Math.min(baseScale, 0.68), quality: 0.7 },
    ];

    let preparedBlob: Blob | null = null;

    for (const attempt of attempts) {
      const targetWidth = Math.max(
        1,
        Math.round(sourceWidth * attempt.scale)
      );
      const targetHeight = Math.max(
        1,
        Math.round(sourceHeight * attempt.scale)
      );

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Браузер не смог подготовить фотографию");
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error("Не удалось уменьшить фотографию"));
            }
          },
          "image/jpeg",
          attempt.quality
        );
      });

      preparedBlob = blob;

      if (blob.size <= CLIENT_UPLOAD_LIMIT) {
        break;
      }
    }

    if (!preparedBlob) {
      throw new Error("Не удалось подготовить фотографию");
    }

    const baseName =
      file.name.replace(/\.[^/.]+$/, "").trim() || `photo-${Date.now()}`;

    return new File([preparedBlob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified || Date.now(),
    });
  } catch (error) {
    if (file.size <= CLIENT_UPLOAD_LIMIT && !isHeicFile(file)) {
      return file;
    }

    throw new Error(
      error instanceof Error
        ? `${error.message}. Выберите другое фото или сохраните его как JPG.`
        : "Не удалось подготовить фото. Выберите другое фото или сохраните его как JPG."
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

type MediaItem = {
  id: string;
  media_type: "image" | "video";
  url: string;
  original_filename: string | null;
};

export default function SimpleMediaPicker({
  type,
  value,
  onChange,
  onSave,
}: {
  type: "image" | "video";
  value: string;
  onChange: (url: string) => void;
  onSave?: (url: string) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const applyMediaValue = async (url: string, successMessage: string) => {
    onChange(url);
    setMessage("");
    setError("");

    if (!onSave) {
      setMessage(`${successMessage} Сохраните этот блок.`);
      return;
    }

    setSaving(true);

    try {
      await onSave(url);
      setMessage(`${successMessage} Изменение сохранено автоматически.`);
    } catch (saveError) {
      const saveMessage =
        saveError instanceof Error
          ? saveError.message
          : "Файл изменился в форме, но не сохранился в настройках";
      setError(saveMessage);
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  const loadMedia = async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("builder_media")
      .select("id, media_type, url, original_filename")
      .eq("media_type", type)
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
    } else {
      setItems((data || []) as MediaItem[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (open) void loadMedia();
  }, [open, type]);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Сессия закончилась. Войдите в админку снова.");
      }

      const preparedFile =
        type === "image" ? await prepareImageForUpload(file) : file;
      const body = new FormData();
      body.append("file", preparedFile, preparedFile.name);
      body.append("media_type", type);

      const response = await fetch("/api/admin/builder-media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Не удалось загрузить файл");
      }

      const uploadedUrl = String(result.url || "");

      if (!uploadedUrl) {
        throw new Error("Сервер не вернул ссылку на файл");
      }

      await applyMediaValue(
        uploadedUrl,
        type === "image" ? "Фото загружено." : "Видео загружено."
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Не удалось загрузить файл"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-[22px] border border-[#D8C4B3] bg-[#FFFDFB]/80 p-4">
      {value ? (
        type === "image" ? (
          <img
            src={value}
            alt=""
            className="aspect-[16/9] w-full rounded-[18px] object-cover"
          />
        ) : (
          <video
            src={value}
            controls
            playsInline
            className="aspect-video w-full rounded-[18px] bg-black object-contain"
          />
        )
      ) : (
        <div className="flex aspect-[16/7] items-center justify-center rounded-[18px] border border-dashed border-[#D8C4B3] text-sm text-[#9A8170]">
          {type === "image" ? "Фото не выбрано" : "Видео не выбрано"}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <label
          className={`cursor-pointer rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-semibold text-white ${
            uploading || saving
              ? "pointer-events-none cursor-not-allowed opacity-60"
              : ""
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={
              type === "image"
                ? "image/*,.heic,.heif"
                : "video/mp4,video/webm,video/quicktime"
            }
            disabled={uploading || saving}
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
            onChange={upload}
          />
          {uploading
            ? "Загружаем..."
            : saving
              ? "Сохраняем..."
              : type === "image"
                ? "Загрузить фото"
                : "Загрузить видео"}
        </label>

        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={saving}
          className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          Выбрать из медиатеки
        </button>

        {value && (
          <button
            type="button"
            onClick={() => {
              void applyMediaValue(
                "",
                type === "image" ? "Фото убрано." : "Видео убрано."
              ).catch(() => undefined);
            }}
            disabled={saving}
            className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Убрать
          </button>
        )}
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
          {type === "image" ? "URL изображения" : "URL видео"}
        </span>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            if (onSave) {
              void applyMediaValue(
                value.trim(),
                type === "image"
                  ? "Ссылка на фото обновлена."
                  : "Ссылка на видео обновлена."
              ).catch(() => undefined);
            }
          }}
          placeholder="https://cdn.sistersstudio.pl/..."
          className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
        />
      </label>

      {message && <p className="mt-3 text-xs text-emerald-700">{message}</p>}
      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      {open && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[30px] bg-[#FFFDFB] shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#A67C52]">
                  Медиатека
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  Выберите {type === "image" ? "фото" : "видео"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 w-10 rounded-full border text-xl"
              >
                ×
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              {loading ? (
                <p className="py-20 text-center">Загружаем...</p>
              ) : items.length === 0 ? (
                <p className="py-20 text-center text-[#7A6252]">
                  Здесь пока нет файлов
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        void applyMediaValue(
                          item.url,
                          type === "image"
                            ? "Фото выбрано из медиатеки."
                            : "Видео выбрано из медиатеки."
                        )
                          .then(() => setOpen(false))
                          .catch(() => undefined);
                      }}
                      className="overflow-hidden rounded-[18px] border bg-white text-left hover:border-[#A67C52]"
                    >
                      {type === "image" ? (
                        <img
                          src={item.url}
                          alt=""
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          muted
                          preload="metadata"
                          className="aspect-video w-full bg-black object-cover"
                        />
                      )}
                      <p className="truncate p-3 text-xs">
                        {item.original_filename || "Без названия"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
