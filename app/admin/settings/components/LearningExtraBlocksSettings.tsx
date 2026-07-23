"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SimpleMediaPicker from "./SimpleMediaPicker";

type BlockType = "text" | "image" | "video";

type LearningExtraBlock = {
  id: string;
  block_type: BlockType;
  title_uk: string;
  title_pl: string;
  text_uk: string;
  text_pl: string;
  media_url: string;
  placement: "after_hero" | "after_programs" | "after_benefits" | "page_bottom";
  size: "small" | "medium" | "large" | "full";
  align: "left" | "center" | "right";
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  sort_order: number;
  is_visible: boolean;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none focus:border-[#A67C52]";
const labelClass =
  "block text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]";

export default function LearningExtraBlocksSettings() {
  const [blocks, setBlocks] = useState<LearningExtraBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showChoices, setShowChoices] = useState(false);

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("learning_extra_blocks")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
    } else {
      setBlocks(
        ((data || []) as LearningExtraBlock[]).map((block) => ({
          ...block,
          placement: block.placement || "page_bottom",
          size: block.size || "large",
          align: block.align || "center",
          autoplay: Boolean(block.autoplay),
          muted: block.muted ?? true,
          loop: Boolean(block.loop),
          controls: block.controls ?? true,
        }))
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBlocks();
  }, [loadBlocks]);

  const addBlock = async (blockType: BlockType) => {
    setBusyId("new");
    setMessage("");
    setError("");

    const { data, error: insertError } = await supabase
      .from("learning_extra_blocks")
      .insert({
        block_type: blockType,
        title_uk: blockType === "text" ? "Новий блок" : "",
        title_pl: blockType === "text" ? "Nowy blok" : "",
        text_uk: "",
        text_pl: "",
        media_url: "",
        placement: "page_bottom",
        size: "large",
        align: "center",
        autoplay: false,
        muted: true,
        loop: false,
        controls: true,
        sort_order: blocks.length,
        is_visible: true,
      })
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      setBlocks((current) => [...current, data as LearningExtraBlock]);
      setMessage("Новый блок добавлен");
      setShowChoices(false);
    }

    setBusyId(null);
  };

  const saveBlockMedia = async (block: LearningExtraBlock, url: string) => {
    setMessage("");
    setError("");

    const { error: saveError } = await supabase
      .from("learning_extra_blocks")
      .update({
        media_url: url.trim(),
        block_type: block.block_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", block.id);

    if (saveError) {
      setError(saveError.message);
      throw new Error(`Медиа блока не сохранилось: ${saveError.message}`);
    }

    setMessage("Фото или видео блока сохранено автоматически");
  };

  const saveBlock = async (block: LearningExtraBlock) => {
    setBusyId(block.id);
    setMessage("");
    setError("");

    const { id, ...payload } = block;
    const { error: saveError } = await supabase
      .from("learning_extra_blocks")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (saveError) {
      setError(saveError.message);
    } else {
      setMessage("Блок сохранён");
    }

    setBusyId(null);
  };

  const deleteBlock = async (id: string) => {
    if (!window.confirm("Удалить этот блок?")) return;

    setBusyId(id);
    const { error: deleteError } = await supabase
      .from("learning_extra_blocks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setBlocks((current) => current.filter((block) => block.id !== id));
      setMessage("Блок удалён");
    }

    setBusyId(null);
  };

  const moveBlock = async (id: string, direction: -1 | 1) => {
    const currentIndex = blocks.findIndex((block) => block.id === id);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= blocks.length) {
      return;
    }

    const next = [...blocks];
    [next[currentIndex], next[targetIndex]] = [
      next[targetIndex],
      next[currentIndex],
    ];

    const reordered = next.map((block, index) => ({
      ...block,
      sort_order: index,
    }));

    setBlocks(reordered);

    const { error: reorderError } = await supabase
      .from("learning_extra_blocks")
      .upsert(
        reordered.map((block) => ({
          ...block,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" }
      );

    if (reorderError) setError(reorderError.message);
  };

  return (
    <section className="mt-8 rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A67C52]">
            Дополнительные блоки
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#2B1A12]">
            Добавить свой блок
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Добавьте текст, фото или видео и выберите, где именно показать
            его на странице. Размер и положение тоже можно настроить.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowChoices((current) => !current)}
          className="w-fit rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
        >
          + Добавить блок
        </button>
      </div>

      {showChoices && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            disabled={busyId === "new"}
            onClick={() => void addBlock("text")}
            className="rounded-[22px] border border-[#D8C4B3] bg-white p-4 text-left transition hover:border-[#A67C52]"
          >
            <span className="text-2xl">¶</span>
            <span className="mt-3 block font-semibold">Текст</span>
            <span className="mt-1 block text-xs text-[#7A6252]">
              Заголовок и описание UA/PL
            </span>
          </button>

          <button
            type="button"
            disabled={busyId === "new"}
            onClick={() => void addBlock("image")}
            className="rounded-[22px] border border-[#D8C4B3] bg-white p-4 text-left transition hover:border-[#A67C52]"
          >
            <span className="text-2xl">🖼️</span>
            <span className="mt-3 block font-semibold">Фото</span>
            <span className="mt-1 block text-xs text-[#7A6252]">
              Загрузка или выбор из медиатеки
            </span>
          </button>

          <button
            type="button"
            disabled={busyId === "new"}
            onClick={() => void addBlock("video")}
            className="rounded-[22px] border border-[#D8C4B3] bg-white p-4 text-left transition hover:border-[#A67C52]"
          >
            <span className="text-2xl">▶</span>
            <span className="mt-3 block font-semibold">Видео</span>
            <span className="mt-1 block text-xs text-[#7A6252]">
              MP4, WebM или MOV
            </span>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          {message}
        </div>
      )}

      {loading ? (
        <div className="mt-5 rounded-2xl bg-[#F7F1EA] p-5 text-sm text-[#7A6252]">
          Загружаем блоки...
        </div>
      ) : blocks.length === 0 ? (
        <div className="mt-5 rounded-[22px] border border-dashed border-[#D8C4B3] p-7 text-center text-sm text-[#9A8170]">
          Дополнительных блоков пока нет
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {blocks.map((block, index) => (
            <article
              key={block.id}
              className="rounded-[24px] border border-[#E5D5C8] bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-auto">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A67C52]">
                    Блок {index + 1}
                  </p>
                  <h4 className="mt-1 font-semibold text-[#2B1A12]">
                    {block.block_type === "text"
                      ? "Текст"
                      : block.block_type === "image"
                      ? "Фото"
                      : "Видео"}
                  </h4>
                </div>

                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => void moveBlock(block.id, -1)}
                  className="rounded-full border px-3 py-2 text-xs disabled:opacity-35"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === blocks.length - 1}
                  onClick={() => void moveBlock(block.id, 1)}
                  className="rounded-full border px-3 py-2 text-xs disabled:opacity-35"
                >
                  ↓
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {block.block_type === "text" && (
                  <>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className={labelClass}>
                        Заголовок UA
                        <input
                          className={inputClass}
                          value={block.title_uk}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, title_uk: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </label>
                      <label className={labelClass}>
                        Заголовок PL
                        <input
                          className={inputClass}
                          value={block.title_pl}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, title_pl: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className={labelClass}>
                        Текст UA
                        <textarea
                          rows={5}
                          className={inputClass}
                          value={block.text_uk}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, text_uk: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </label>
                      <label className={labelClass}>
                        Текст PL
                        <textarea
                          rows={5}
                          className={inputClass}
                          value={block.text_pl}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, text_pl: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </label>
                    </div>
                  </>
                )}


                <div className="grid gap-4 md:grid-cols-3">
                  <label className={labelClass}>
                    Где показать
                    <select
                      className={inputClass}
                      value={block.placement}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item) =>
                            item.id === block.id
                              ? {
                                  ...item,
                                  placement: event.target.value as LearningExtraBlock["placement"],
                                }
                              : item
                          )
                        )
                      }
                    >
                      <option value="after_hero">После первого экрана</option>
                      <option value="after_programs">После программ</option>
                      <option value="after_benefits">После «Что входит»</option>
                      <option value="page_bottom">Внизу страницы</option>
                    </select>
                  </label>

                  <label className={labelClass}>
                    Размер
                    <select
                      className={inputClass}
                      value={block.size}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item) =>
                            item.id === block.id
                              ? {
                                  ...item,
                                  size: event.target.value as LearningExtraBlock["size"],
                                }
                              : item
                          )
                        )
                      }
                    >
                      <option value="small">Маленький</option>
                      <option value="medium">Средний</option>
                      <option value="large">Большой</option>
                      <option value="full">На всю ширину</option>
                    </select>
                  </label>

                  <label className={labelClass}>
                    Положение
                    <select
                      className={inputClass}
                      value={block.align}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item) =>
                            item.id === block.id
                              ? {
                                  ...item,
                                  align: event.target.value as LearningExtraBlock["align"],
                                }
                              : item
                          )
                        )
                      }
                    >
                      <option value="left">Слева</option>
                      <option value="center">По центру</option>
                      <option value="right">Справа</option>
                    </select>
                  </label>
                </div>

                {block.block_type === "image" && (
                  <SimpleMediaPicker
                    type="image"
                    value={block.media_url}
                    onChange={(url) =>
                      setBlocks((current) =>
                        current.map((item) =>
                          item.id === block.id
                            ? { ...item, media_url: url }
                            : item
                        )
                      )
                    }
                    onSave={(url) => saveBlockMedia(block, url)}
                  />
                )}

                {block.block_type === "video" && (
                  <>
                    <SimpleMediaPicker
                    type="video"
                    value={block.media_url}
                    onChange={(url) =>
                      setBlocks((current) =>
                        current.map((item) =>
                          item.id === block.id
                            ? { ...item, media_url: url }
                            : item
                        )
                      )
                    }
                    onSave={(url) => saveBlockMedia(block, url)}
                  />

                    <div className="grid gap-3 rounded-[20px] border border-[#E5D5C8] bg-[#F7F1EA]/65 p-4 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="flex items-center gap-2 text-sm text-[#2B1A12]">
                        <input
                          type="checkbox"
                          checked={block.autoplay}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, autoplay: event.target.checked }
                                  : item
                              )
                            )
                          }
                        />
                        Автозапуск
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#2B1A12]">
                        <input
                          type="checkbox"
                          checked={block.muted}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, muted: event.target.checked }
                                  : item
                              )
                            )
                          }
                        />
                        Без звука
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#2B1A12]">
                        <input
                          type="checkbox"
                          checked={block.loop}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, loop: event.target.checked }
                                  : item
                              )
                            )
                          }
                        />
                        Повторять
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#2B1A12]">
                        <input
                          type="checkbox"
                          checked={block.controls}
                          onChange={(event) =>
                            setBlocks((current) =>
                              current.map((item) =>
                                item.id === block.id
                                  ? { ...item, controls: event.target.checked }
                                  : item
                              )
                            )
                          }
                        />
                        Кнопки управления
                      </label>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-[#2B1A12]">
                    <input
                      type="checkbox"
                      checked={block.is_visible}
                      onChange={(event) =>
                        setBlocks((current) =>
                          current.map((item) =>
                            item.id === block.id
                              ? { ...item, is_visible: event.target.checked }
                              : item
                          )
                        )
                      }
                    />
                    Показывать на сайте
                  </label>

                  <button
                    type="button"
                    disabled={busyId === block.id}
                    onClick={() => void saveBlock(block)}
                    className="rounded-full bg-[#2B1A12] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Сохранить
                  </button>

                  <button
                    type="button"
                    disabled={busyId === block.id}
                    onClick={() => void deleteBlock(block.id)}
                    className="rounded-full border border-red-200 px-5 py-2.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
