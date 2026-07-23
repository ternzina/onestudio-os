'use client';

import { getPageZones, type PageBlock } from '@/lib/page-builder';
import BuilderMediaPicker from './BuilderMediaPicker';

const inputClass =
  'mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none focus:border-[#A67C52] focus:ring-4 focus:ring-[#A67C52]/10';

export default function PageBlockEditor({
  block,
  onChange,
}: {
  block: PageBlock;
  onChange: (next: PageBlock) => void;
}) {
  const updateContent = (key: string, value: string | number) => {
    onChange({ ...block, content: { ...block.content, [key]: value } });
  };

  const zones = getPageZones(block.page_slug);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
          Название блока в админке
          <input
            value={block.name}
            onChange={(event) =>
              onChange({ ...block, name: event.target.value })
            }
            className={inputClass}
          />
        </label>

        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
          Положение на странице
          <select
            value={block.zone}
            onChange={(event) =>
              onChange({ ...block, zone: event.target.value })
            }
            className={inputClass}
          >
            {zones.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {block.block_type === 'heading' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            Заголовок UA
            <input
              value={block.content.title_uk ?? ''}
              onChange={(event) =>
                updateContent('title_uk', event.target.value)
              }
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            Tytuł PL
            <input
              value={block.content.title_pl ?? ''}
              onChange={(event) =>
                updateContent('title_pl', event.target.value)
              }
              className={inputClass}
            />
          </label>
        </div>
      )}

      {block.block_type === 'text' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            Текст UA
            <textarea
              rows={5}
              value={block.content.text_uk ?? ''}
              onChange={(event) =>
                updateContent('text_uk', event.target.value)
              }
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            Tekst PL
            <textarea
              rows={5}
              value={block.content.text_pl ?? ''}
              onChange={(event) =>
                updateContent('text_pl', event.target.value)
              }
              className={inputClass}
            />
          </label>
        </div>
      )}

      {(block.block_type === 'image' || block.block_type === 'video') && (
        <BuilderMediaPicker
          type={block.block_type}
          value={block.content.media_url ?? ''}
          onChange={(url) => updateContent('media_url', url)}
        />
      )}

      {block.block_type === 'image' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            ALT UA
            <input
              value={block.content.alt_uk ?? ''}
              onChange={(event) =>
                updateContent('alt_uk', event.target.value)
              }
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            ALT PL
            <input
              value={block.content.alt_pl ?? ''}
              onChange={(event) =>
                updateContent('alt_pl', event.target.value)
              }
              className={inputClass}
            />
          </label>
        </div>
      )}

      {block.block_type === 'button' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            Кнопка UA
            <input
              value={block.content.button_label_uk ?? ''}
              onChange={(event) =>
                updateContent('button_label_uk', event.target.value)
              }
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
            Przycisk PL
            <input
              value={block.content.button_label_pl ?? ''}
              onChange={(event) =>
                updateContent('button_label_pl', event.target.value)
              }
              className={inputClass}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52] lg:col-span-2">
            Ссылка
            <input
              value={block.content.button_href ?? ''}
              onChange={(event) =>
                updateContent('button_href', event.target.value)
              }
              className={inputClass}
            />
          </label>
        </div>
      )}

      {block.block_type === 'spacer' && (
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
          Высота, px
          <input
            type="number"
            min={8}
            max={400}
            value={block.content.height ?? 64}
            onChange={(event) =>
              updateContent('height', Number(event.target.value))
            }
            className={inputClass}
          />
        </label>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
          Выравнивание
          <select
            value={block.styles.align ?? 'center'}
            onChange={(event) =>
              onChange({
                ...block,
                styles: {
                  ...block.styles,
                  align: event.target.value as 'left' | 'center' | 'right',
                },
              })
            }
            className={inputClass}
          >
            <option value="left">Слева</option>
            <option value="center">По центру</option>
            <option value="right">Справа</option>
          </select>
        </label>

        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
          Ширина
          <select
            value={block.styles.width ?? 'normal'}
            onChange={(event) =>
              onChange({
                ...block,
                styles: {
                  ...block.styles,
                  width: event.target.value as
                    | 'narrow'
                    | 'normal'
                    | 'wide'
                    | 'full',
                },
              })
            }
            className={inputClass}
          >
            <option value="narrow">Узкая</option>
            <option value="normal">Обычная</option>
            <option value="wide">Широкая</option>
            <option value="full">На всю ширину</option>
          </select>
        </label>

        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
          Фон
          <select
            value={block.styles.background ?? 'transparent'}
            onChange={(event) =>
              onChange({
                ...block,
                styles: {
                  ...block.styles,
                  background: event.target.value as
                    | 'transparent'
                    | 'light'
                    | 'dark'
                    | 'accent',
                },
              })
            }
            className={inputClass}
          >
            <option value="transparent">Прозрачный</option>
            <option value="light">Светлый</option>
            <option value="dark">Тёмный</option>
            <option value="accent">Акцентный</option>
          </select>
        </label>
      </div>
    </div>
  );
}
