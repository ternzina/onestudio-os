"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";

type MediaItem = {
  id: string;
  image_url: string;
  original_filename: string | null;
  alt_uk: string | null;
  alt_pl: string | null;
  created_at: string;
};


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

type SiteImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
  onSave?: (url: string) => Promise<void> | void;
  folder: string;
  label?: string;
  description?: string;
  previewClassName?: string;
};

export default function SiteImagePicker({
  value,
  onChange,
  onSave,
  folder,
  label = "Фото",
  description = "Загрузите фото с телефона или компьютера либо выберите его из медиатеки.",
  previewClassName = "aspect-[16/9]",
}: SiteImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const applyImageValue = async (
    imageUrl: string,
    successMessage: string
  ) => {
    onChange(imageUrl);
    setMessage("");
    setErrorMessage("");

    if (!onSave) {
      setMessage(`${successMessage} Сохраните этот раздел.`);
      return;
    }

    setIsSaving(true);

    try {
      await onSave(imageUrl);
      setMessage(`${successMessage} Изменение сохранено автоматически.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Фото изменилось в форме, но не сохранилось в настройках";
      setErrorMessage(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return mediaItems;
    }

    return mediaItems.filter((item) =>
      [item.original_filename, item.alt_uk, item.alt_pl]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [mediaItems, search]);

  const uploadFromComputer = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Сессия администратора закончилась. Войдите снова.");
      }

      const preparedFile = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append("file", preparedFile, preparedFile.name);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/site-image/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Не удалось загрузить фото");
      }

      const imageUrl = String(result.image_url || "");

      if (!imageUrl) {
        throw new Error("Сервер не вернул ссылку на изображение");
      }

      await applyImageValue(imageUrl, "Фото загружено в R2.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не удалось загрузить фото"
      );
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openMedia = async () => {
    setIsMediaOpen(true);
    setIsMediaLoading(true);
    setSearch("");
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("media_library")
      .select(
        "id, image_url, original_filename, alt_uk, alt_pl, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      setErrorMessage(error.message);
      setIsMediaLoading(false);
      return;
    }

    setMediaItems((data || []) as MediaItem[]);
    setIsMediaLoading(false);
  };

  const chooseFromMedia = async (imageUrl: string) => {
    try {
      await applyImageValue(imageUrl, "Фото выбрано из медиатеки.");
      setIsMediaOpen(false);
    } catch {
      // Ошибка уже показана внутри компонента, окно оставляем открытым.
    }
  };

  const removeImage = async () => {
    try {
      await applyImageValue("", "Фото убрано.");
    } catch {
      // Ошибка уже показана внутри компонента.
    }
  };

  const openCurrentImageInMediaLibrary = () => {
    if (!value) return;
    const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.href = `/admin/media?image=${encodeURIComponent(value)}&returnTo=${encodeURIComponent(returnPath)}`;
  };

  return (
    <div className="rounded-[24px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-4 sm:p-5">
      <div>
        <p className="text-sm font-semibold text-[#2B1A12]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[#7A6252]">{description}</p>
      </div>

      {value ? (
        <div
          className={`group relative mt-4 overflow-hidden rounded-[20px] border border-[#D8C4B3] bg-[#F2E9E1] ${previewClassName}`}
        >
          <img
            src={value}
            alt={label}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={openCurrentImageInMediaLibrary}
            className="absolute bottom-3 right-3 rounded-full border border-white/25 bg-[#17100D]/88 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-md transition hover:bg-[#2B1A12]"
          >
            Показать в медиатеке
          </button>
        </div>
      ) : (
        <div
          className={`mt-4 flex items-center justify-center rounded-[20px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA] text-sm text-[#9A8170] ${previewClassName}`}
        >
          Фото не выбрано
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <label
          className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#2B1A12] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4B3427] ${
            isUploading || isSaving
              ? "pointer-events-none cursor-not-allowed opacity-60"
              : ""
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="sr-only"
            disabled={isUploading || isSaving}
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
            onChange={uploadFromComputer}
          />
          {isUploading
            ? "Загружаем..."
            : isSaving
              ? "Сохраняем..."
              : "Загрузить фото"}
        </label>

        <button
          type="button"
          onClick={() => void openMedia()}
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#D8C4B3] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2B1A12] transition hover:bg-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Выбрать из медиатеки
        </button>

        {value && (
          <button
            type="button"
            onClick={() => void removeImage()}
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Убрать фото
          </button>
        )}
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
          URL изображения
        </span>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            if (onSave) {
              void applyImageValue(value.trim(), "Ссылка на фото обновлена.").catch(
                () => undefined
              );
            }
          }}
          placeholder="https://cdn.sistersstudio.pl/..."
          className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
        />
        <span className="mt-2 block text-[11px] leading-5 text-[#7A6252]">
          После загрузки здесь появится готовая ссылка. Можно также вставить URL вручную.
        </span>
      </label>

      {message && (
        <p className="mt-3 text-xs text-emerald-700">{message}</p>
      )}

      {errorMessage && (
        <p className="mt-3 text-xs text-red-700">{errorMessage}</p>
      )}

      {isMediaOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsMediaOpen(false);
            }
          }}
        >
          <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[#D8C4B3] bg-[#FFFDFB] shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5D5C8] p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
                  Media Library
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                  Выберите фотографию
                </h3>
                <p className="mt-2 text-sm text-[#7A6252]">
                  Кликните по фото, затем сохраните текущий раздел.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMediaOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D8C4B3] bg-white text-xl text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-white"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="border-b border-[#E5D5C8] p-4 sm:p-5">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по названию..."
                className="w-full rounded-2xl border border-[#DDCEC2] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none focus:border-[#A67C52]"
                autoFocus
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {isMediaLoading ? (
                <div className="flex min-h-[300px] items-center justify-center text-sm text-[#7A6252]">
                  Загружаем медиатеку...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex min-h-[300px] items-center justify-center text-sm text-[#7A6252]">
                  Фотографии не найдены
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void chooseFromMedia(item.image_url)}
                      className="group overflow-hidden rounded-[20px] border border-[#E5D5C8] bg-white text-left transition hover:-translate-y-1 hover:border-[#A67C52]"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[#F2E9E1]">
                        <img
                          src={item.image_url}
                          alt={
                            item.alt_uk ||
                            item.alt_pl ||
                            item.original_filename ||
                            "Фото"
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <p className="truncate px-3 py-2 text-xs text-[#2B1A12]">
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
