"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  fallbackHomeCarouselSettings,
  normalizeCarouselDelay,
  type HomeCarouselSettings,
  type HomeCarouselSlide,
} from "@/lib/home-carousel";
import SiteImagePicker from "./SiteImagePicker";

const slideSelect =
  "id,image_url,title_uk,title_pl,text_uk,text_pl,alt_uk,alt_pl,is_active,sort_order";

const newSlide = (sortOrder: number) => ({
  image_url: "",
  title_uk: "Нова історія у Sisters Studio",
  title_pl: "Nowa historia w Sisters Studio",
  text_uk: "",
  text_pl: "",
  alt_uk: "Інтерʼєр Sisters Studio",
  alt_pl: "Wnętrze Sisters Studio",
  is_active: true,
  sort_order: sortOrder,
});

export default function HomeCarouselSettings() {
  const [settings, setSettings] = useState<HomeCarouselSettings>(
    fallbackHomeCarouselSettings,
  );
  const [slides, setSlides] = useState<HomeCarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showDatabaseError = (message: string) => {
    const migrationMissing =
      message.includes("home_carousel") || message.includes("PGRST205");
    setErrorMessage(
      migrationMissing
        ? "Сначала выполните файл SUPABASE-HOME-CAROUSEL.sql в Supabase SQL Editor."
        : message,
    );
  };

  const loadCarousel = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    setErrorMessage("");

    const [settingsResult, slidesResult] = await Promise.all([
      supabase
        .from("home_carousel_settings")
        .select("enabled,autoplay_delay_ms")
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("home_carousel_slides")
        .select(slideSelect)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    const error = settingsResult.error || slidesResult.error;

    if (error) {
      showDatabaseError(error.message);
      setIsLoading(false);
      return;
    }

    if (settingsResult.data) {
      setSettings({
        enabled: Boolean(settingsResult.data.enabled),
        autoplay_delay_ms: normalizeCarouselDelay(
          Number(settingsResult.data.autoplay_delay_ms),
        ),
      });
    }

    setSlides((slidesResult.data || []) as HomeCarouselSlide[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadCarousel();
  }, [loadCarousel]);

  const updateSlide = <Field extends keyof HomeCarouselSlide>(
    slideId: string,
    field: Field,
    value: HomeCarouselSlide[Field],
  ) => {
    setSlides((current) =>
      current.map((slide) =>
        slide.id === slideId ? { ...slide, [field]: value } : slide,
      ),
    );
    setMessage("");
    setErrorMessage("");
  };

  const saveSettings = async (nextSettings: HomeCarouselSettings) => {
    setSavingId("settings");
    setMessage("");
    setErrorMessage("");

    const cleanSettings = {
      id: 1,
      enabled: nextSettings.enabled,
      autoplay_delay_ms: normalizeCarouselDelay(
        nextSettings.autoplay_delay_ms,
      ),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("home_carousel_settings")
      .upsert(cleanSettings, { onConflict: "id" });

    if (error) {
      showDatabaseError(error.message);
      setSavingId(null);
      return;
    }

    setSettings(cleanSettings);
    setMessage(
      cleanSettings.enabled
        ? "Карусель включена на главной странице"
        : "Карусель скрыта, фотографии сохранены",
    );
    setSavingId(null);
  };

  const createSlide = async () => {
    setIsCreating(true);
    setMessage("");
    setErrorMessage("");

    const nextSortOrder =
      Math.max(0, ...slides.map((slide) => slide.sort_order || 0)) + 10;
    const { data, error } = await supabase
      .from("home_carousel_slides")
      .insert(newSlide(nextSortOrder))
      .select(slideSelect)
      .single();

    if (error || !data) {
      showDatabaseError(error?.message || "Не удалось добавить слайд");
      setIsCreating(false);
      return;
    }

    setSlides((current) => [...current, data as HomeCarouselSlide]);
    setMessage("Слайд добавлен. Теперь выберите для него фотографию.");
    setIsCreating(false);
  };

  const saveSlide = async (slide: HomeCarouselSlide) => {
    setSavingId(slide.id);
    setMessage("");
    setErrorMessage("");

    const payload = {
      image_url: slide.image_url.trim(),
      title_uk: slide.title_uk.trim(),
      title_pl: slide.title_pl.trim(),
      text_uk: slide.text_uk.trim(),
      text_pl: slide.text_pl.trim(),
      alt_uk: slide.alt_uk.trim(),
      alt_pl: slide.alt_pl.trim(),
      is_active: slide.is_active,
      sort_order: Number(slide.sort_order || 0),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("home_carousel_slides")
      .update(payload)
      .eq("id", slide.id);

    if (error) {
      showDatabaseError(error.message);
      setSavingId(null);
      return;
    }

    setSlides((current) =>
      current.map((item) =>
        item.id === slide.id ? { ...item, ...payload } : item,
      ),
    );
    setMessage("Слайд сохранён");
    setSavingId(null);
  };

  const saveSlideImage = async (slideId: string, imageUrl: string) => {
    const { error } = await supabase
      .from("home_carousel_slides")
      .update({
        image_url: imageUrl.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", slideId);

    if (error) {
      showDatabaseError(error.message);
      throw new Error(`Фото карусели не сохранилось: ${error.message}`);
    }

    setMessage("Фото карусели сохранено автоматически");
  };

  const toggleSlide = async (slide: HomeCarouselSlide) => {
    const nextValue = !slide.is_active;
    updateSlide(slide.id, "is_active", nextValue);

    const { error } = await supabase
      .from("home_carousel_slides")
      .update({
        is_active: nextValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slide.id);

    if (error) {
      updateSlide(slide.id, "is_active", slide.is_active);
      showDatabaseError(error.message);
      return;
    }

    setMessage(nextValue ? "Слайд включён" : "Слайд скрыт");
  };

  const moveSlide = async (
    slideId: string,
    direction: "up" | "down",
  ) => {
    const index = slides.findIndex((slide) => slide.id === slideId);
    const target = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || target < 0 || target >= slides.length) return;

    const reordered = [...slides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const normalized = reordered.map((slide, position) => ({
      ...slide,
      sort_order: (position + 1) * 10,
    }));

    setSlides(normalized);
    setSavingId("order");
    setMessage("");
    setErrorMessage("");

    for (const slide of normalized) {
      const { error } = await supabase
        .from("home_carousel_slides")
        .update({ sort_order: slide.sort_order })
        .eq("id", slide.id);

      if (error) {
        showDatabaseError(error.message);
        await loadCarousel();
        setSavingId(null);
        return;
      }
    }

    setMessage("Порядок слайдов сохранён");
    setSavingId(null);
  };

  const deleteSlide = async (slide: HomeCarouselSlide) => {
    if (!window.confirm("Удалить этот слайд? Фото останется в медиатеке и R2.")) {
      return;
    }

    setSavingId(slide.id);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("home_carousel_slides")
      .delete()
      .eq("id", slide.id);

    if (error) {
      showDatabaseError(error.message);
      setSavingId(null);
      return;
    }

    setSlides((current) => current.filter((item) => item.id !== slide.id));
    setMessage("Слайд удалён. Само фото осталось в медиатеке.");
    setSavingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
            Home carousel
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            Карусель на главной
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Фотографии меняются автоматически. Можно скрыть весь блок, менять
            фото, подписи и порядок слайдов.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadCarousel()}
            disabled={isLoading || savingId !== null}
            className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A6252] transition hover:bg-[#F7F1EA] disabled:opacity-50"
          >
            {isLoading ? "Загружаем..." : "Обновить"}
          </button>
          <button
            type="button"
            onClick={() => void createSlide()}
            disabled={isCreating || isLoading}
            className="rounded-full bg-[#2B1A12] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4A2D1E] disabled:opacity-50"
          >
            {isCreating ? "Добавляем..." : "+ Добавить слайд"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {message && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          {message}
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="mt-7 grid gap-4 rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/85 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-[#2B1A12]">
              Показ блока на сайте
            </p>
            <p className="mt-1 text-xs leading-5 text-[#7A6252]">
              При выключении все фотографии и подписи сохраняются.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={settings.autoplay_delay_ms}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  autoplay_delay_ms: Number(event.target.value),
                }))
              }
              className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2.5 text-xs font-semibold text-[#2B1A12] outline-none"
              aria-label="Скорость смены фотографий"
            >
              <option value={2000}>Смена через 2 сек.</option>
              <option value={3000}>Смена через 3 сек.</option>
              <option value={4000}>Смена через 4 сек.</option>
              <option value={5000}>Смена через 5 сек.</option>
              <option value={7000}>Смена через 7 сек.</option>
              <option value={10000}>Смена через 10 сек.</option>
            </select>
            <button
              type="button"
              onClick={() =>
                void saveSettings({
                  ...settings,
                  enabled: !settings.enabled,
                })
              }
              disabled={savingId === "settings"}
              className={`rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                settings.enabled
                  ? "border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
                  : "border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252] hover:bg-[#2B1A12] hover:text-white"
              }`}
            >
              {settings.enabled ? "Карусель включена" : "Карусель выключена"}
            </button>
            <button
              type="button"
              onClick={() => void saveSettings(settings)}
              disabled={savingId === "settings"}
              className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#2B1A12] transition hover:bg-[#F7F1EA] disabled:opacity-50"
            >
              Сохранить скорость
            </button>
          </div>
        </div>
      )}

      {!isLoading && slides.length === 0 && !errorMessage && (
        <div className="mt-6 rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 p-8 text-center">
          <p className="text-lg font-semibold text-[#2B1A12]">Слайдов пока нет</p>
          <p className="mt-2 text-sm text-[#7A6252]">
            Нажмите «Добавить слайд» и выберите фотографию.
          </p>
        </div>
      )}

      {!isLoading && slides.length > 0 && (
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/90 p-5 shadow-[0_14px_40px_rgba(83,54,37,0.08)]"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A67C52]">
                    Слайд {index + 1}
                  </p>
                  <p className="mt-1 text-xs text-[#7A6252]">
                    {slide.image_url ? "Фото выбрано" : "Нужно выбрать фото"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void moveSlide(slide.id, "up")}
                    disabled={index === 0 || savingId === "order"}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8C4B3] bg-white text-[#7A6252] disabled:opacity-30"
                    aria-label="Поднять слайд"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => void moveSlide(slide.id, "down")}
                    disabled={index === slides.length - 1 || savingId === "order"}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D8C4B3] bg-white text-[#7A6252] disabled:opacity-30"
                    aria-label="Опустить слайд"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleSlide(slide)}
                    className={`rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      slide.is_active
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252]"
                    }`}
                  >
                    {slide.is_active ? "Показывается" : "Скрыт"}
                  </button>
                </div>
              </div>

              <SiteImagePicker
                label="Фотография слайда"
                description="Лучше использовать горизонтальное фото. После загрузки оно сохранится автоматически."
                value={slide.image_url}
                onChange={(url) => updateSlide(slide.id, "image_url", url)}
                onSave={(url) => saveSlideImage(slide.id, url)}
                folder="site/home/carousel"
                previewClassName="aspect-[16/9]"
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
                    Заголовок, укр.
                  </span>
                  <input
                    value={slide.title_uk}
                    onChange={(event) =>
                      updateSlide(slide.id, "title_uk", event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
                    Tytuł, pl.
                  </span>
                  <input
                    value={slide.title_pl}
                    onChange={(event) =>
                      updateSlide(slide.id, "title_pl", event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
                    Подпись, укр.
                  </span>
                  <textarea
                    value={slide.text_uk}
                    onChange={(event) =>
                      updateSlide(slide.id, "text_uk", event.target.value)
                    }
                    rows={3}
                    className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#A67C52]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
                    Podpis, pl.
                  </span>
                  <textarea
                    value={slide.text_pl}
                    onChange={(event) =>
                      updateSlide(slide.id, "text_pl", event.target.value)
                    }
                    rows={3}
                    className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#A67C52]"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void saveSlide(slide)}
                  disabled={savingId === slide.id}
                  className="rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#4A2D1E] disabled:opacity-50"
                >
                  {savingId === slide.id ? "Сохраняем..." : "Сохранить слайд"}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteSlide(slide)}
                  disabled={savingId === slide.id}
                  className="rounded-full border border-red-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
