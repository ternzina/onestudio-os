'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  BLOCK_LIBRARY,
  BUILDER_PAGES,
  SYSTEM_SECTIONS,
  createDefaultBlock,
  getPageZones,
  type PageBlock,
  type PageBlockType,
} from '@/lib/page-builder';
import PageBlockEditor from '@/components/builder/PageBlockEditor';

export default function BuilderEditorPage() {
  const params = useParams<{ pageSlug: string }>();
  const pageSlug = params.pageSlug;
  const pageInfo = BUILDER_PAGES.find((item) => item.slug === pageSlug);
  const systemSections = SYSTEM_SECTIONS[pageSlug] ?? [];
  const pageZones = getPageZones(pageSlug);

  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newBlockZone, setNewBlockZone] = useState(
    pageZones[0]?.value ?? 'before_main'
  );

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.sort_order - b.sort_order),
    [blocks]
  );

  const blocksByZone = useMemo(() => {
    const grouped = new Map<string, PageBlock[]>();

    pageZones.forEach((zone) => grouped.set(zone.value, []));

    sortedBlocks.forEach((block) => {
      const targetZone = grouped.has(block.zone)
        ? block.zone
        : 'after_main';
      grouped.set(targetZone, [
        ...(grouped.get(targetZone) ?? []),
        block,
      ]);
    });

    return grouped;
  }, [pageZones, sortedBlocks]);

  const loadBlocks = async () => {
    setIsLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('page_blocks')
      .select('*')
      .eq('page_slug', pageSlug)
      .order('sort_order', { ascending: true });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setBlocks((data ?? []) as PageBlock[]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadBlocks();
  }, [pageSlug]);

  const addBlock = async (type: PageBlockType) => {
    setErrorMessage('');

    const payload = {
      ...createDefaultBlock(type, pageSlug, blocks.length),
      zone: newBlockZone,
    };

    const { data, error } = await supabase
      .from('page_blocks')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const block = data as PageBlock;
    setBlocks((current) => [...current, block]);
    setExpandedId(block.id);
  };

  const saveAll = async () => {
    setIsSaving(true);
    setMessage('');
    setErrorMessage('');

    const payload = sortedBlocks.map((block, index) => ({
      ...block,
      sort_order: index,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('page_blocks')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setBlocks(payload);
      setMessage('Блоки и их положение сохранены');
    }

    setIsSaving(false);
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const block = sortedBlocks.find((item) => item.id === id);

    if (!block) {
      return;
    }

    const sameZone = sortedBlocks.filter(
      (item) => item.zone === block.zone
    );
    const index = sameZone.findIndex((item) => item.id === id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= sameZone.length) {
      return;
    }

    const swapped = [...sameZone];
    [swapped[index], swapped[target]] = [
      swapped[target],
      swapped[index],
    ];

    const orderMap = new Map(
      swapped.map((item, position) => [item.id, position])
    );

    setBlocks((current) =>
      current.map((item) =>
        item.zone === block.zone
          ? {
              ...item,
              sort_order: orderMap.get(item.id) ?? item.sort_order,
            }
          : item
      )
    );
  };

  const duplicateBlock = async (block: PageBlock) => {
    const copy = Object.fromEntries(
      Object.entries(block).filter(
        ([key]) => !['id', 'created_at', 'updated_at'].includes(key)
      )
    );

    const { data, error } = await supabase
      .from('page_blocks')
      .insert({
        ...copy,
        name: `${block.name} копия`,
        sort_order: blocks.length,
      })
      .select('*')
      .single();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setBlocks((current) => [...current, data as PageBlock]);
  };

  const deleteBlock = async (id: string) => {
    if (!window.confirm('Удалить этот блок?')) {
      return;
    }

    const { error } = await supabase
      .from('page_blocks')
      .delete()
      .eq('id', id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setBlocks((current) =>
      current.filter((block) => block.id !== id)
    );
  };

  const renderCustomBlock = (
    block: PageBlock,
    index: number,
    zoneBlocks: PageBlock[]
  ) => (
    <article
      key={block.id}
      className="overflow-hidden rounded-[26px] border border-[#E5D5C8] bg-white/90 shadow-[0_12px_42px_rgba(83,54,37,0.08)]"
    >
      <div className="flex flex-wrap items-center gap-2 p-4 sm:p-5">
        <button
          type="button"
          onClick={() =>
            setExpandedId(
              expandedId === block.id ? null : block.id
            )
          }
          className="mr-auto text-left"
        >
          <span className="text-xs uppercase tracking-[0.16em] text-[#A67C52]">
            Пользовательский · {block.block_type}
          </span>
          <span className="mt-1 block font-semibold">
            {index + 1}. {block.name}
          </span>
        </button>

        <button
          type="button"
          onClick={() => moveBlock(block.id, -1)}
          disabled={index === 0}
          className="rounded-full border px-3 py-2 text-xs disabled:opacity-35"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => moveBlock(block.id, 1)}
          disabled={index === zoneBlocks.length - 1}
          className="rounded-full border px-3 py-2 text-xs disabled:opacity-35"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() =>
            setBlocks((current) =>
              current.map((item) =>
                item.id === block.id
                  ? { ...item, is_visible: !item.is_visible }
                  : item
              )
            )
          }
          className="rounded-full border px-3 py-2 text-xs"
        >
          {block.is_visible ? '👁 Видим' : '◌ Скрыт'}
        </button>
        <button
          type="button"
          onClick={() => void duplicateBlock(block)}
          className="rounded-full border px-3 py-2 text-xs"
        >
          Дублировать
        </button>
        <button
          type="button"
          onClick={() => void deleteBlock(block.id)}
          className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700"
        >
          Удалить
        </button>
      </div>

      {expandedId === block.id && (
        <div className="border-t border-[#E5D5C8] bg-[#F7F1EA]/55 p-5 sm:p-6">
          <PageBlockEditor
            block={block}
            onChange={(next) =>
              setBlocks((current) =>
                current.map((item) =>
                  item.id === block.id ? next : item
                )
              )
            }
          />
        </div>
      )}
    </article>
  );

  const renderZone = (zoneValue: string) => {
    const zone = pageZones.find(
      (item) => item.value === zoneValue
    );
    const zoneBlocks = blocksByZone.get(zoneValue) ?? [];

    return (
      <section
        key={zoneValue}
        className="rounded-[26px] border border-dashed border-[#D8C4B3] bg-[#FFFDFB]/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A67C52]">
              Зона вставки
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2B1A12]">
              {zone?.label ?? zoneValue}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNewBlockZone(zoneValue);
              window.scrollTo({ top: 310, behavior: 'smooth' });
            }}
            className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold text-[#2B1A12] transition hover:bg-[#2B1A12] hover:text-white"
          >
            + Добавить сюда
          </button>
        </div>

        {zoneBlocks.length === 0 ? (
          <div className="rounded-[20px] bg-white/60 px-4 py-5 text-center text-xs text-[#9A8170]">
            Дополнительных блоков пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {zoneBlocks.map((block, index) =>
              renderCustomBlock(block, index, zoneBlocks)
            )}
          </div>
        )}
      </section>
    );
  };

  if (!pageInfo) {
    return (
      <main className="min-h-screen px-6 pt-32">
        Неизвестная страница.
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 pb-28 pt-32 text-[#2B1A12] sm:px-8">
      <section className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-5 rounded-[36px] bg-[#2B1A12] p-7 text-white sm:flex-row sm:items-end sm:justify-between sm:p-9">
          <div>
            <Link
              href="/admin/builder"
              className="text-xs uppercase tracking-[0.18em] text-[#D9B98F]"
            >
              ← Все страницы
            </Link>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
              {pageInfo.icon} {pageInfo.title}
            </h1>
            <p className="mt-3 text-sm text-[#E8D8CC]">
              {pageInfo.path} · карта страницы и дополнительные блоки
            </p>
          </div>

          <a
            href={pageInfo.path}
            target="_blank"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Открыть страницу ↗
          </a>
        </div>

        <div className="mt-6 rounded-[30px] border border-[#E5D5C8] bg-white/80 p-5 shadow-[0_18px_60px_rgba(83,54,37,0.08)]">
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A67C52]">
              Куда добавить
              <select
                value={newBlockZone}
                onChange={(event) =>
                  setNewBlockZone(event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none"
              >
                {pageZones.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {zone.label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A67C52]">
                Добавить блок
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {BLOCK_LIBRARY.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => void addBlock(item.type)}
                    className="rounded-[22px] border border-[#E5D5C8] bg-[#FFFDFB] p-4 text-left transition hover:-translate-y-1 hover:border-[#A67C52]"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="mt-3 block text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#7A6252]">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-[28px] border border-[#E5D5C8] bg-white/70 p-12 text-center text-sm text-[#7A6252]">
              Загружаем карту страницы...
            </div>
          ) : (
            <>
              {renderZone('before_main')}

              {systemSections.map((section) => (
                <div key={section.id} className="space-y-4">
                  <article className="rounded-[28px] border border-[#CDB69F] bg-[#2B1A12] p-5 text-[#F7F1EA] shadow-[0_18px_60px_rgba(43,26,18,0.18)] sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                          {section.icon}
                        </span>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D9B98F]">
                            Системный блок
                          </p>
                          <h2 className="mt-1 text-xl font-semibold">
                            {section.title}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-[#E8D8CC]">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      <a
                        href={section.editHref}
                        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-white hover:text-[#2B1A12]"
                      >
                        Редактировать →
                      </a>
                    </div>
                  </article>

                  {renderZone(section.zoneAfter)}
                </div>
              ))}

              {renderZone('after_main')}
            </>
          )}
        </div>

        <div className="sticky bottom-5 z-30 mt-8 flex flex-col gap-3 rounded-[26px] border border-[#D8C4B3] bg-[#FFFDFB]/95 p-4 shadow-[0_20px_70px_rgba(83,54,37,0.18)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#7A6252]">
            Системные блоки защищены. Дополнительные блоки можно размещать между ними.
          </p>
          <button
            type="button"
            onClick={() => void saveAll()}
            disabled={isSaving}
            className="rounded-full bg-[#2B1A12] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
          >
            {isSaving ? 'Сохраняем...' : 'Сохранить карту'}
          </button>
        </div>
      </section>
    </main>
  );
}
