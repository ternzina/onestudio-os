"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fallbackPhotoshootsContent } from "@/lib/photoshoots-content";

type MediaPickerItem = {
  id: string;
  image_url: string;
  original_filename: string | null;
  alt_uk: string | null;
  alt_pl: string | null;
  created_at: string;
};

type FormState = {
  hero_eyebrow_uk: string;
  hero_eyebrow_pl: string;
  hero_title_part1_uk: string;
  hero_title_part1_pl: string;
  hero_title_accent_uk: string;
  hero_title_accent_pl: string;
  hero_title_part2_uk: string;
  hero_title_part2_pl: string;
  hero_description_uk: string;
  hero_description_pl: string;
  hero_primary_cta_uk: string;
  hero_primary_cta_pl: string;
  hero_secondary_cta_uk: string;
  hero_secondary_cta_pl: string;
  hero_feature_1_uk: string;
  hero_feature_1_pl: string;
  hero_feature_2_uk: string;
  hero_feature_2_pl: string;
  hero_feature_3_uk: string;
  hero_feature_3_pl: string;
  hero_background_image: string;

  packages_eyebrow_uk: string;
  packages_eyebrow_pl: string;
  packages_title_uk: string;
  packages_title_pl: string;
  packages_description_uk: string;
  packages_description_pl: string;
  packages_popular_uk: string;
  packages_popular_pl: string;
  packages_details_button_uk: string;
  packages_details_button_pl: string;
  packages_hide_button_uk: string;
  packages_hide_button_pl: string;
  packages_booking_button_uk: string;
  packages_booking_button_pl: string;

  portfolio_eyebrow_uk: string;
  portfolio_eyebrow_pl: string;
  portfolio_title_uk: string;
  portfolio_title_pl: string;
  portfolio_description_uk: string;
  portfolio_description_pl: string;

  booking_eyebrow_uk: string;
  booking_eyebrow_pl: string;
  booking_title_uk: string;
  booking_title_pl: string;
  booking_description_uk: string;
  booking_description_pl: string;
  booking_button_uk: string;
  booking_button_pl: string;
};

const uk = fallbackPhotoshootsContent.uk;
const pl = fallbackPhotoshootsContent.pl;

const initialState: FormState = {
  hero_eyebrow_uk: uk.hero.eyebrow,
  hero_eyebrow_pl: pl.hero.eyebrow,
  hero_title_part1_uk: uk.hero.titlePart1,
  hero_title_part1_pl: pl.hero.titlePart1,
  hero_title_accent_uk: uk.hero.titleAccent,
  hero_title_accent_pl: pl.hero.titleAccent,
  hero_title_part2_uk: uk.hero.titlePart2,
  hero_title_part2_pl: pl.hero.titlePart2,
  hero_description_uk: uk.hero.description,
  hero_description_pl: pl.hero.description,
  hero_primary_cta_uk: uk.hero.primaryCta,
  hero_primary_cta_pl: pl.hero.primaryCta,
  hero_secondary_cta_uk: uk.hero.secondaryCta,
  hero_secondary_cta_pl: pl.hero.secondaryCta,
  hero_feature_1_uk: uk.hero.features[0],
  hero_feature_1_pl: pl.hero.features[0],
  hero_feature_2_uk: uk.hero.features[1],
  hero_feature_2_pl: pl.hero.features[1],
  hero_feature_3_uk: uk.hero.features[2],
  hero_feature_3_pl: pl.hero.features[2],
  hero_background_image: uk.hero.backgroundImage,

  packages_eyebrow_uk: uk.packages.eyebrow,
  packages_eyebrow_pl: pl.packages.eyebrow,
  packages_title_uk: uk.packages.title,
  packages_title_pl: pl.packages.title,
  packages_description_uk: uk.packages.description,
  packages_description_pl: pl.packages.description,
  packages_popular_uk: uk.packages.popular,
  packages_popular_pl: pl.packages.popular,
  packages_details_button_uk: uk.packages.detailsButton,
  packages_details_button_pl: pl.packages.detailsButton,
  packages_hide_button_uk: uk.packages.hideButton,
  packages_hide_button_pl: pl.packages.hideButton,
  packages_booking_button_uk: uk.packages.bookingButton,
  packages_booking_button_pl: pl.packages.bookingButton,

  portfolio_eyebrow_uk: uk.portfolio.eyebrow,
  portfolio_eyebrow_pl: pl.portfolio.eyebrow,
  portfolio_title_uk: uk.portfolio.title,
  portfolio_title_pl: pl.portfolio.title,
  portfolio_description_uk: uk.portfolio.description,
  portfolio_description_pl: pl.portfolio.description,

  booking_eyebrow_uk: uk.booking.eyebrow,
  booking_eyebrow_pl: pl.booking.eyebrow,
  booking_title_uk: uk.booking.title,
  booking_title_pl: pl.booking.title,
  booking_description_uk: uk.booking.description,
  booking_description_pl: pl.booking.description,
  booking_button_uk: uk.booking.button,
  booking_button_pl: pl.booking.button,
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

type PairProps = {
  label: string;
  ukKey: keyof FormState;
  plKey: keyof FormState;
  form: FormState;
  onChange: (key: keyof FormState, value: string) => void;
  multiline?: boolean;
};

function LanguagePair({
  label,
  ukKey,
  plKey,
  form,
  onChange,
  multiline = false,
}: PairProps) {
  const commonClass =
    "mt-2 w-full rounded-2xl border border-[#DDCEC2] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B29C8D] focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/10";

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[#2B1A12]">{label}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
          Українська
          {multiline ? (
            <textarea
              rows={4}
              value={form[ukKey]}
              onChange={(event) => onChange(ukKey, event.target.value)}
              className={commonClass}
            />
          ) : (
            <input
              value={form[ukKey]}
              onChange={(event) => onChange(ukKey, event.target.value)}
              className={commonClass}
            />
          )}
        </label>

        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
          Polski
          {multiline ? (
            <textarea
              rows={4}
              value={form[plKey]}
              onChange={(event) => onChange(plKey, event.target.value)}
              className={commonClass}
            />
          ) : (
            <input
              value={form[plKey]}
              onChange={(event) => onChange(plKey, event.target.value)}
              className={commonClass}
            />
          )}
        </label>
      </div>
    </div>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-[#E5D5C8] bg-white/80 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.08)] backdrop-blur-xl sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A67C52]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
        {title}
      </h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#7A6252]">
        {description}
      </p>
      <div className="mt-7 space-y-6">{children}</div>
    </section>
  );
}

export default function PhotoshootsSettings() {
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaPickerItem[]>([]);
  const [mediaSearch, setMediaSearch] = useState("");
  const [selectingMediaId, setSelectingMediaId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formKeys = useMemo(
    () => Object.keys(initialState) as Array<keyof FormState>,
    []
  );

  const filteredMediaItems = useMemo(() => {
    const search = mediaSearch.trim().toLowerCase();

    if (!search) {
      return mediaItems;
    }

    return mediaItems.filter((item) =>
      [
        item.original_filename,
        item.alt_uk,
        item.alt_pl,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [mediaItems, mediaSearch]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("site_photoshoots_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (data) {
      const next = { ...initialState };

      formKeys.forEach((key) => {
        const value = data[key];
        if (typeof value === "string" && value.trim()) {
          next[key] = value;
        }
      });

      setForm(next);
    }

    setIsLoading(false);
  }, [formKeys]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const changeField = (key: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };


  const uploadHeroImage = async (file: File) => {
    setIsUploadingHero(true);
    setMessage("");
    setErrorMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Сессия администратора завершилась. Войдите снова.");
      }

      const preparedFile = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append("file", preparedFile, preparedFile.name);
      formData.append("folder", "site/photoshoots/hero");

      const response = await fetch("/api/admin/site-image/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось загрузить изображение");
      }

      const imageUrl = data.image_url as string;

      const { error: saveImageError } = await supabase
        .from("site_photoshoots_content")
        .upsert(
          {
            id: 1,
            hero_background_image: imageUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (saveImageError) {
        throw new Error(
          `Фото загрузилось в R2, но не сохранилось в настройках: ${saveImageError.message}`
        );
      }

      changeField("hero_background_image", imageUrl);
      setMessage(
        "Фото загружено в Cloudflare R2 и сохранено автоматически."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Ошибка загрузки изображения"
      );
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) {
        heroFileInputRef.current.value = "";
      }
    }
  };

  const openMediaPicker = async () => {
    setIsMediaPickerOpen(true);
    setIsLoadingMedia(true);
    setMediaSearch("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("media_library")
      .select(
        "id, image_url, original_filename, alt_uk, alt_pl, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setErrorMessage(error.message);
      setIsLoadingMedia(false);
      return;
    }

    setMediaItems((data || []) as MediaPickerItem[]);
    setIsLoadingMedia(false);
  };

  const selectHeroImageFromMedia = async (
    mediaId: string,
    imageUrl: string
  ) => {
    if (selectingMediaId) {
      return;
    }

    const previousImageUrl = form.hero_background_image;

    setSelectingMediaId(mediaId);
    setMessage("");
    setErrorMessage("");

    // Сразу показываем выбранное фото и закрываем окно.
    changeField("hero_background_image", imageUrl);
    setIsMediaPickerOpen(false);

    const { data: updatedRow, error: updateError } = await supabase
      .from("site_photoshoots_content")
      .update({
        hero_background_image: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select("id")
      .maybeSingle();

    let finalError = updateError;

    // Страховка на случай, если запись с id=1 ещё не существует.
    if (!finalError && !updatedRow) {
      const { error: insertError } = await supabase
        .from("site_photoshoots_content")
        .upsert(
          {
            id: 1,
            hero_background_image: imageUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      finalError = insertError;
    }

    if (finalError) {
      changeField("hero_background_image", previousImageUrl);
      setErrorMessage(
        `Фото не удалось установить: ${finalError.message}`
      );
      setSelectingMediaId(null);
      return;
    }

    setMessage(
      "Фото выбрано из медиатеки и сохранено автоматически."
    );
    setSelectingMediaId(null);
  };

  const saveHeroImageUrl = async (imageUrl: string) => {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("site_photoshoots_content")
      .update({
        hero_background_image: imageUrl.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      setErrorMessage(error.message);
      throw new Error(`Ссылка на фото не сохранилась: ${error.message}`);
    }

    setMessage("Ссылка на фото сохранена автоматически.");
  };

  const removeHeroImage = async () => {
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("site_photoshoots_content")
      .upsert(
        {
          id: 1,
          hero_background_image: "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    changeField("hero_background_image", "");
    setMessage("Фото убрано со страницы и сохранено автоматически.");
  };

  const openHeroImageInMediaLibrary = () => {
    if (!form.hero_background_image) return;
    const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.href = `/admin/media?image=${encodeURIComponent(form.hero_background_image)}&returnTo=${encodeURIComponent(returnPath)}`;
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("site_photoshoots_content")
      .upsert(
        {
          id: 1,
          ...form,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setMessage(
      "Изменения сохранены. Обновите публичную страницу фотосессий, чтобы увидеть новый текст."
    );
    setIsSaving(false);
  };

  return (
    <div className="my-8 overflow-hidden rounded-[38px] border border-[#D8C4B3] bg-[#F2E9E1]/70 p-4 shadow-[0_24px_80px_rgba(83,54,37,0.10)] sm:p-6">
      <div className="rounded-[30px] bg-[#2B1A12] p-6 text-[#F7F1EA] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D9B98F]">
              /sesje-zdjeciowe
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Фотосесії
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#E8D8CC]">
              Управление основными текстами страницы фотосессий. Карточки и цены
              пакетов редактируются в отдельном разделе «Пакеты».
            </p>
          </div>

          <a
            href="/sesje-zdjeciowe"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F1EA] transition hover:bg-white hover:text-[#2B1A12]"
          >
            Открыть страницу ↗
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[#7A6252]">
          Загружаем настройки фотосессий...
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              {message}
            </div>
          )}

          <SettingsCard
            eyebrow="Hero"
            title="Первый экран"
            description="Главный заголовок, описание, две кнопки, три преимущества и фоновое изображение."
          >
            <LanguagePair
              label="Надпись над заголовком"
              ukKey="hero_eyebrow_uk"
              plKey="hero_eyebrow_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Первая строка заголовка"
              ukKey="hero_title_part1_uk"
              plKey="hero_title_part1_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Средняя строка заголовка"
              ukKey="hero_title_accent_uk"
              plKey="hero_title_accent_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Акцентная строка заголовка"
              ukKey="hero_title_part2_uk"
              plKey="hero_title_part2_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Описание"
              ukKey="hero_description_uk"
              plKey="hero_description_pl"
              form={form}
              onChange={changeField}
              multiline
            />
            <LanguagePair
              label="Основная кнопка"
              ukKey="hero_primary_cta_uk"
              plKey="hero_primary_cta_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Вторая кнопка"
              ukKey="hero_secondary_cta_uk"
              plKey="hero_secondary_cta_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Преимущество 1"
              ukKey="hero_feature_1_uk"
              plKey="hero_feature_1_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Преимущество 2"
              ukKey="hero_feature_2_uk"
              plKey="hero_feature_2_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Преимущество 3"
              ukKey="hero_feature_3_uk"
              plKey="hero_feature_3_pl"
              form={form}
              onChange={changeField}
            />

            <div className="rounded-[28px] border border-[#DDCEC2] bg-[#F7F1EA]/70 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2B1A12]">
                    Фоновое изображение Hero
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#7A6252]">
                    Загрузите фото с телефона или компьютера. Большие снимки автоматически уменьшаются, затем сохраняются в Cloudflare R2 и сразу появляются на странице.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <label
                    className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#2B1A12] px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4B3427] ${
                      isUploadingHero
                        ? "pointer-events-none cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    <input
                      ref={heroFileInputRef}
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="sr-only"
                      disabled={isUploadingHero}
                      onClick={(event) => {
                        event.currentTarget.value = "";
                      }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadHeroImage(file);
                      }}
                    />
                    {isUploadingHero ? "Загружаем..." : "Загрузить фото"}
                  </label>

                  <button
                    type="button"
                    onClick={() => void openMediaPicker()}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[#D8C4B3] bg-white px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2B1A12] transition hover:border-[#A67C52] hover:bg-[#F7F1EA]"
                  >
                    Выбрать из медиатеки
                  </button>

                  {form.hero_background_image && (
                    <button
                      type="button"
                      onClick={() => void removeHeroImage()}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#D8C4B3] bg-white px-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A6252] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      Убрать фото
                    </button>
                  )}
                </div>
              </div>

              {form.hero_background_image ? (
                <div
                  className="relative mt-5 h-64 overflow-hidden rounded-[26px] border border-[#DDCEC2] bg-[#2B1A12] bg-cover bg-center shadow-[0_16px_50px_rgba(83,54,37,0.14)]"
                  style={{
                    backgroundImage: `url("${form.hero_background_image}")`,
                  }}
                >
                  <button
                    type="button"
                    onClick={openHeroImageInMediaLibrary}
                    className="absolute bottom-4 right-4 rounded-full border border-white/25 bg-[#17100D]/88 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-md transition hover:bg-[#2B1A12]"
                  >
                    Показать в медиатеке
                  </button>
                </div>
              ) : (
                <div className="mt-5 flex h-48 items-center justify-center rounded-[26px] border-2 border-dashed border-[#D8C4B3] bg-white/60 text-sm text-[#9A8170]">
                  Фоновое изображение не выбрано
                </div>
              )}

              <label className="mt-4 block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
                  URL изображения
                </span>
                <input
                  type="url"
                  value={form.hero_background_image}
                  onChange={(event) =>
                    changeField("hero_background_image", event.target.value)
                  }
                  onBlur={() => {
                    void saveHeroImageUrl(form.hero_background_image).catch(
                      () => undefined
                    );
                  }}
                  placeholder="https://cdn.sistersstudio.pl/..."
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
                <span className="mt-2 block text-[11px] leading-5 text-[#7A6252]">
                  После загрузки здесь появится готовая ссылка на фото в Cloudflare R2.
                </span>
              </label>
            </div>
          </SettingsCard>

          <SettingsCard
            eyebrow="Packages copy"
            title="Тексты вокруг пакетов"
            description="Здесь меняются заголовки и системные подписи. Состав, цена и описание каждой карточки остаются в разделе «Пакеты»."
          >
            <LanguagePair
              label="Маленький заголовок"
              ukKey="packages_eyebrow_uk"
              plKey="packages_eyebrow_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Главный заголовок"
              ukKey="packages_title_uk"
              plKey="packages_title_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Описание раздела"
              ukKey="packages_description_uk"
              plKey="packages_description_pl"
              form={form}
              onChange={changeField}
              multiline
            />
            <LanguagePair
              label="Значок популярного пакета"
              ukKey="packages_popular_uk"
              plKey="packages_popular_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Кнопка «Подробнее»"
              ukKey="packages_details_button_uk"
              plKey="packages_details_button_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Кнопка «Скрыть детали»"
              ukKey="packages_hide_button_uk"
              plKey="packages_hide_button_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Кнопка бронирования"
              ukKey="packages_booking_button_uk"
              plKey="packages_booking_button_pl"
              form={form}
              onChange={changeField}
            />
          </SettingsCard>

          <SettingsCard
            eyebrow="Portfolio copy"
            title="Заголовок портфолио"
            description="Фотографии управляются в медиатеке и портфолио. Здесь меняются только тексты блока на странице фотосессий."
          >
            <LanguagePair
              label="Маленький заголовок"
              ukKey="portfolio_eyebrow_uk"
              plKey="portfolio_eyebrow_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Главный заголовок"
              ukKey="portfolio_title_uk"
              plKey="portfolio_title_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Описание"
              ukKey="portfolio_description_uk"
              plKey="portfolio_description_pl"
              form={form}
              onChange={changeField}
              multiline
            />
          </SettingsCard>

          <SettingsCard
            eyebrow="Final CTA"
            title="Нижний блок бронирования"
            description="Финальный призыв оставить заявку внизу страницы."
          >
            <LanguagePair
              label="Маленький заголовок"
              ukKey="booking_eyebrow_uk"
              plKey="booking_eyebrow_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Главный заголовок"
              ukKey="booking_title_uk"
              plKey="booking_title_pl"
              form={form}
              onChange={changeField}
            />
            <LanguagePair
              label="Описание"
              ukKey="booking_description_uk"
              plKey="booking_description_pl"
              form={form}
              onChange={changeField}
              multiline
            />
            <LanguagePair
              label="Текст кнопки"
              ukKey="booking_button_uk"
              plKey="booking_button_pl"
              form={form}
              onChange={changeField}
            />
          </SettingsCard>

          <div className="sticky bottom-5 z-30 flex flex-col gap-3 rounded-[28px] border border-[#D8C4B3] bg-[#FFFDFB]/95 p-4 shadow-[0_20px_70px_rgba(83,54,37,0.18)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[#7A6252]">
              Сохранение обновит одну общую запись страницы фотосессий в Supabase.
            </p>
            <button
              type="button"
              onClick={saveSettings}
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#2B1A12] px-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F1EA] transition hover:bg-[#4B3427] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Сохраняем..." : "Сохранить фотосессии"}
            </button>
          </div>
        </div>
      )}
      {isMediaPickerOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setIsMediaPickerOpen(false);
            }
          }}
        >
          <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[34px] border border-[#D8C4B3] bg-[#FFFDFB] shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-4 border-b border-[#E5D5C8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
                  Media Library
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                  Выбрать фото для Hero
                </h3>
                <p className="mt-2 text-sm text-[#7A6252]">
                  Нажмите на фотографию. Она сразу установится и сохранится.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D8C4B3] bg-white text-xl text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-white"
                aria-label="Закрыть медиатеку"
              >
                ×
              </button>
            </div>

            <div className="border-b border-[#E5D5C8] p-4 sm:p-5">
              <input
                value={mediaSearch}
                onChange={(event) => setMediaSearch(event.target.value)}
                placeholder="Поиск по названию фотографии..."
                className="w-full rounded-2xl border border-[#DDCEC2] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B29C8D] focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/10"
                autoFocus
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {isLoadingMedia ? (
                <div className="flex min-h-[320px] items-center justify-center text-sm text-[#7A6252]">
                  Загружаем медиатеку...
                </div>
              ) : filteredMediaItems.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                  <p className="text-lg font-semibold text-[#2B1A12]">
                    Фотографии не найдены
                  </p>
                  <p className="mt-2 text-sm text-[#7A6252]">
                    Попробуйте другое название или загрузите новое фото с компьютера.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredMediaItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={Boolean(selectingMediaId)}
                      onClick={() =>
                        void selectHeroImageFromMedia(
                          item.id,
                          item.image_url
                        )
                      }
                      className="group overflow-hidden rounded-[22px] border border-[#E5D5C8] bg-white text-left shadow-[0_10px_35px_rgba(83,54,37,0.08)] transition hover:-translate-y-1 hover:border-[#A67C52] hover:shadow-[0_18px_50px_rgba(83,54,37,0.16)] disabled:cursor-wait disabled:opacity-60"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[#F2E9E1]">
                        <img
                          src={item.image_url}
                          alt={
                            item.alt_uk ||
                            item.alt_pl ||
                            item.original_filename ||
                            "Фото из медиатеки"
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs font-medium text-[#2B1A12]">
                          {item.original_filename || "Без названия"}
                        </p>
                        <p className="mt-1 text-[11px] text-[#9A8170]">
                          {selectingMediaId === item.id
                            ? "Устанавливаем..."
                            : "Выбрать фото"}
                        </p>
                      </div>
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
