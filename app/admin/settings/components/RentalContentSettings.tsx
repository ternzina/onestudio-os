'use client'

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  fallbackSiteRentalContent,
  normalizeRentalContent,
  type RentalCondition,
  type RentalEquipmentCategory,
  type RentalFaqItem,
  type RentalSpecification,
  type SiteRentalContent,
} from '@/lib/rental-content'
import SiteImagePicker from './SiteImagePicker'

const inputClass =
  'w-full rounded-2xl border border-[#D8C4B3] bg-white/85 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20'

function Panel({ title, hint, children, open = false }: { title: string; hint?: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group rounded-[26px] border border-[#E5D5C8] bg-white/72">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6">
        <span>
          <span className="block text-lg font-semibold text-[#2B1A12]">{title}</span>
          {hint ? <span className="mt-1 block text-xs leading-5 text-[#7A6252]">{hint}</span> : null}
        </span>
        <span className="text-2xl text-[#A67C52] transition group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-[#E5D5C8] p-5 sm:p-6">{children}</div>
    </details>
  )
}

function Field({ label, value, onChange, rows, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#A67C52]">{label}</span>
      {rows ? (
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={`${inputClass} resize-y`} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={inputClass} />
      )}
    </label>
  )
}

function BilingualFields({ ukLabel, plLabel, ukValue, plValue, onUkChange, onPlChange, rows }: { ukLabel: string; plLabel: string; ukValue: string; plValue: string; onUkChange: (value: string) => void; onPlChange: (value: string) => void; rows?: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Field label={`${ukLabel} · UA`} value={ukValue} onChange={onUkChange} rows={rows} />
      <Field label={`${plLabel} · PL`} value={plValue} onChange={onPlChange} rows={rows} />
    </div>
  )
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export default function RentalContentSettings() {
  const [content, setContent] = useState<SiteRentalContent>(fallbackSiteRentalContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const change = <K extends keyof SiteRentalContent>(field: K, value: SiteRentalContent[K]) => {
    setContent((current) => ({ ...current, [field]: value }))
    setMessage('')
    setErrorMessage('')
  }

  const load = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    const { data, error } = await supabase.from('site_rental_content').select('*').eq('id', 1).maybeSingle()
    if (error) setErrorMessage(error.message)
    if (data) setContent(normalizeRentalContent(data as Partial<SiteRentalContent>))
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const saveImage = async (field: 'hero_image_url' | 'video_poster_url' | 'equipment_image_url' | 'gallery_image_1_url' | 'gallery_image_2_url' | 'gallery_image_3_url' | 'gallery_image_4_url' | 'gallery_image_5_url' | 'audience_image_url' | 'location_image_url' | 'location_door_image_url', url: string) => {
    change(field, url)
    const { error } = await supabase
      .from('site_rental_content')
      .update({ [field]: url.trim(), updated_at: new Date().toISOString() })
      .eq('id', 1)
    if (error) {
      setErrorMessage(error.message)
      throw new Error(`Фото не сохранилось: ${error.message}`)
    }
    setMessage('Фото сохранено автоматически')
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setErrorMessage('')

    const clean = Object.fromEntries(
      Object.entries(content).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
    ) as SiteRentalContent

    const { error } = await supabase
      .from('site_rental_content')
      .update({ ...clean, updated_at: new Date().toISOString() })
      .eq('id', 1)

    if (error) setErrorMessage(error.message)
    else {
      setContent(clean)
      setMessage('Страница аренды сохранена')
    }
    setSaving(false)
  }

  const updateEquipment = (index: number, field: keyof RentalEquipmentCategory, value: string) => {
    change('equipment_categories', content.equipment_categories.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const updateSpecification = (index: number, field: keyof RentalSpecification, value: string) => {
    change('studio_specifications', content.studio_specifications.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const addEquipment = () => change('equipment_categories', [
    ...content.equipment_categories,
    { id: makeId(), title_uk: 'Нова категорія', title_pl: 'Nowa kategoria', items_uk: '', items_pl: '' },
  ])

  const updateCondition = (index: number, field: keyof RentalCondition, value: string) => {
    change('rental_conditions', content.rental_conditions.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const updateFaq = (index: number, field: keyof RentalFaqItem, value: string) => {
    change('faq_items', content.faq_items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const addFaq = () => change('faq_items', [
    ...content.faq_items,
    { id: makeId(), question_uk: 'Нове запитання', question_pl: 'Nowe pytanie', answer_uk: '', answer_pl: '' },
  ])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">Rental page</p>
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">Аренда студии</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Каждый блок открывается отдельно. В длинных списках пишите один пункт с новой строки — на сайте они автоматически свернутся по категориям.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" form="rental-page-form" disabled={loading || saving} className="rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50">
            {saving ? 'Сохраняем…' : 'Сохранить страницу'}
          </button>
          <button type="button" onClick={() => void load()} disabled={loading || saving} className="rounded-full border border-[#D8C4B3] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A6252] disabled:opacity-50">
            {loading ? 'Загружаем…' : 'Обновить'}
          </button>
        </div>
      </div>

      {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{message}</div> : null}
      {errorMessage ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{errorMessage}</div> : null}

      <form id="rental-page-form" onSubmit={save} className="mt-7 space-y-4">
        <Panel title="1. Первый экран" hint="Главное фото, продающий заголовок, цена и кнопки." open>
          <div className="space-y-5">
            <SiteImagePicker label="Главное фото" description="Широкое горизонтальное фото студии." value={content.hero_image_url} onChange={(url) => change('hero_image_url', url)} onSave={(url) => saveImage('hero_image_url', url)} folder="site/rental/hero" previewClassName="aspect-[16/7]" />
            <BilingualFields ukLabel="Надпись над заголовком" plLabel="Napis nad tytułem" ukValue={content.hero_eyebrow_uk} plValue={content.hero_eyebrow_pl} onUkChange={(value) => change('hero_eyebrow_uk', value)} onPlChange={(value) => change('hero_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Главный заголовок" plLabel="Główny tytuł" ukValue={content.hero_title_uk} plValue={content.hero_title_pl} onUkChange={(value) => change('hero_title_uk', value)} onPlChange={(value) => change('hero_title_pl', value)} rows={2} />
            <BilingualFields ukLabel="Описание" plLabel="Opis" ukValue={content.hero_description_uk} plValue={content.hero_description_pl} onUkChange={(value) => change('hero_description_uk', value)} onPlChange={(value) => change('hero_description_pl', value)} rows={3} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Цена аренды" value={content.rental_price} onChange={(value) => change('rental_price', value)} />
              <Field label="Доплата Make-up room" value={content.makeup_price} onChange={(value) => change('makeup_price', value)} />
              <Field label="Количество фонов" value={content.backgrounds_count} onChange={(value) => change('backgrounds_count', value)} />
            </div>
            <BilingualFields ukLabel="Главная кнопка" plLabel="Główny przycisk" ukValue={content.primary_cta_uk} plValue={content.primary_cta_pl} onUkChange={(value) => change('primary_cta_uk', value)} onPlChange={(value) => change('primary_cta_pl', value)} />
            <BilingualFields ukLabel="Вторая кнопка" plLabel="Drugi przycisk" ukValue={content.secondary_cta_uk} plValue={content.secondary_cta_pl} onUkChange={(value) => change('secondary_cta_uk', value)} onPlChange={(value) => change('secondary_cta_pl', value)} />
            <BilingualFields ukLabel="Короткие преимущества, по одному с новой строки" plLabel="Krótkie zalety, każda w nowym wierszu" ukValue={content.trust_items_uk} plValue={content.trust_items_pl} onUkChange={(value) => change('trust_items_uk', value)} onPlChange={(value) => change('trust_items_pl', value)} rows={4} />
          </div>
        </Panel>

        <Panel title="2. Пространства" hint="Сами карточки и фотографии берутся из раздела «Интерьеры». Здесь меняются только подписи блока.">
          <div className="space-y-5">
            <BilingualFields ukLabel="Надпись над блоком" plLabel="Napis nad sekcją" ukValue={content.zones_eyebrow_uk} plValue={content.zones_eyebrow_pl} onUkChange={(value) => change('zones_eyebrow_uk', value)} onPlChange={(value) => change('zones_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.zones_title_uk} plValue={content.zones_title_pl} onUkChange={(value) => change('zones_title_uk', value)} onPlChange={(value) => change('zones_title_pl', value)} />
            <div className="rounded-[24px] border border-[#DDCABB] bg-[#F8F1EB] p-5">
              <h3 className="font-semibold">Фотомозаика «Побачте простір до бронювання»</h3>
              <p className="mt-2 text-xs leading-5 text-[#7A6252]">Все пять фотографий теперь редактируются здесь. Первая — высокая, остальные четыре — горизонтальные.</p>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <SiteImagePicker label="Фото 1 · большое слева" description="Рекомендуемый размер 1200×1500 px, пропорция 4:5." value={content.gallery_image_1_url} onChange={(url) => change('gallery_image_1_url', url)} onSave={(url) => saveImage('gallery_image_1_url', url)} folder="site/rental/gallery" previewClassName="aspect-[4/5]" />
                <SiteImagePicker label="Фото 2 · сверху по центру" description="Рекомендуемый размер 1500×1000 px, пропорция 3:2." value={content.gallery_image_2_url} onChange={(url) => change('gallery_image_2_url', url)} onSave={(url) => saveImage('gallery_image_2_url', url)} folder="site/rental/gallery" previewClassName="aspect-[3/2]" />
                <SiteImagePicker label="Фото 3 · сверху справа" description="Рекомендуемый размер 1500×1000 px, пропорция 3:2." value={content.gallery_image_3_url} onChange={(url) => change('gallery_image_3_url', url)} onSave={(url) => saveImage('gallery_image_3_url', url)} folder="site/rental/gallery" previewClassName="aspect-[3/2]" />
                <SiteImagePicker label="Фото 4 · снизу по центру" description="Рекомендуемый размер 1500×1000 px, пропорция 3:2." value={content.gallery_image_4_url} onChange={(url) => change('gallery_image_4_url', url)} onSave={(url) => saveImage('gallery_image_4_url', url)} folder="site/rental/gallery" previewClassName="aspect-[3/2]" />
                <SiteImagePicker label="Фото 5 · снизу справа" description="Рекомендуемый размер 1500×1000 px, пропорция 3:2." value={content.gallery_image_5_url} onChange={(url) => change('gallery_image_5_url', url)} onSave={(url) => saveImage('gallery_image_5_url', url)} folder="site/rental/gallery" previewClassName="aspect-[3/2]" />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="3. Характеристики студии" hint="Площадь, высота, циклорама, свет, вместимость, этаж, лифт, парковка и правила. Пустые значения на сайте не показываются.">
          <div className="space-y-5">
            <BilingualFields ukLabel="Надпись" plLabel="Napis" ukValue={content.specifications_eyebrow_uk} plValue={content.specifications_eyebrow_pl} onUkChange={(value) => change('specifications_eyebrow_uk', value)} onPlChange={(value) => change('specifications_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.specifications_title_uk} plValue={content.specifications_title_pl} onUkChange={(value) => change('specifications_title_uk', value)} onPlChange={(value) => change('specifications_title_pl', value)} />
            <div className="grid gap-4 lg:grid-cols-2">
              {content.studio_specifications.map((item, index) => (
                <div key={item.id} className="rounded-[22px] border border-[#DDCABB] bg-[#F8F1EB] p-5">
                  <p className="mb-4 font-semibold">Характеристика {index + 1}</p>
                  <BilingualFields ukLabel="Название" plLabel="Nazwa" ukValue={item.label_uk} plValue={item.label_pl} onUkChange={(value) => updateSpecification(index, 'label_uk', value)} onPlChange={(value) => updateSpecification(index, 'label_pl', value)} />
                  <div className="mt-4"><BilingualFields ukLabel="Значение" plLabel="Wartość" ukValue={item.value_uk} plValue={item.value_pl} onUkChange={(value) => updateSpecification(index, 'value_uk', value)} onPlChange={(value) => updateSpecification(index, 'value_pl', value)} rows={2} /></div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="4. Видеоэкскурсия" hint="Поддерживаются YouTube, прямая ссылка MP4/WebM или обычная ссылка на видео.">
          <div className="space-y-5">
            <Field label="Ссылка на видео" value={content.video_url} onChange={(value) => change('video_url', value)} placeholder="https://youtube.com/... или https://cdn.../video.mp4" />
            <SiteImagePicker label="Обложка видео" description="Нужна для обычной ссылки или MP4. Для YouTube необязательна." value={content.video_poster_url} onChange={(url) => change('video_poster_url', url)} onSave={(url) => saveImage('video_poster_url', url)} folder="site/rental/video" previewClassName="aspect-video" />
            <BilingualFields ukLabel="Надпись" plLabel="Napis" ukValue={content.video_eyebrow_uk} plValue={content.video_eyebrow_pl} onUkChange={(value) => change('video_eyebrow_uk', value)} onPlChange={(value) => change('video_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.video_title_uk} plValue={content.video_title_pl} onUkChange={(value) => change('video_title_uk', value)} onPlChange={(value) => change('video_title_pl', value)} />
            <BilingualFields ukLabel="Описание" plLabel="Opis" ukValue={content.video_description_uk} plValue={content.video_description_pl} onUkChange={(value) => change('video_description_uk', value)} onPlChange={(value) => change('video_description_pl', value)} rows={3} />
            <BilingualFields ukLabel="Кнопка" plLabel="Przycisk" ukValue={content.video_cta_uk} plValue={content.video_cta_pl} onUkChange={(value) => change('video_cta_uk', value)} onPlChange={(value) => change('video_cta_pl', value)} />
          </div>
        </Panel>

        <Panel title="5. Оборудование" hint="Категории свернуты. Добавьте только то, что действительно есть: Wi-Fi, колонку, отпариватель, рейл, воду/кофе и помощь администратора — если это доступно." open>
          <div className="space-y-5">
            <SiteImagePicker label="Фото оборудования" description="Необязательно. Если фото нет, блок останется аккуратным." value={content.equipment_image_url} onChange={(url) => change('equipment_image_url', url)} onSave={(url) => saveImage('equipment_image_url', url)} folder="site/rental/equipment" previewClassName="aspect-[4/3]" />
            <BilingualFields ukLabel="Надпись" plLabel="Napis" ukValue={content.included_eyebrow_uk} plValue={content.included_eyebrow_pl} onUkChange={(value) => change('included_eyebrow_uk', value)} onPlChange={(value) => change('included_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.included_title_uk} plValue={content.included_title_pl} onUkChange={(value) => change('included_title_uk', value)} onPlChange={(value) => change('included_title_pl', value)} rows={2} />
            <BilingualFields ukLabel="Описание" plLabel="Opis" ukValue={content.included_description_uk} plValue={content.included_description_pl} onUkChange={(value) => change('included_description_uk', value)} onPlChange={(value) => change('included_description_pl', value)} rows={2} />

            <div className="space-y-4">
              {content.equipment_categories.map((category, index) => (
                <div key={category.id} className="rounded-[22px] border border-[#DDCABB] bg-[#F8F1EB] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-semibold">Категория {index + 1}</p>
                    <button type="button" onClick={() => change('equipment_categories', content.equipment_categories.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-semibold text-red-600">Удалить</button>
                  </div>
                  <BilingualFields ukLabel="Название" plLabel="Nazwa" ukValue={category.title_uk} plValue={category.title_pl} onUkChange={(value) => updateEquipment(index, 'title_uk', value)} onPlChange={(value) => updateEquipment(index, 'title_pl', value)} />
                  <div className="mt-4"><BilingualFields ukLabel="Список, один предмет с новой строки" plLabel="Lista, jeden element w nowym wierszu" ukValue={category.items_uk} plValue={category.items_pl} onUkChange={(value) => updateEquipment(index, 'items_uk', value)} onPlChange={(value) => updateEquipment(index, 'items_pl', value)} rows={7} /></div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addEquipment} className="rounded-full border border-[#A67C52] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A5237]">+ Добавить категорию</button>
            <BilingualFields ukLabel="Подсказка под оборудованием" plLabel="Podpowiedź pod sprzętem" ukValue={content.equipment_help_uk} plValue={content.equipment_help_pl} onUkChange={(value) => change('equipment_help_uk', value)} onPlChange={(value) => change('equipment_help_pl', value)} rows={2} />
          </div>
        </Panel>

        <Panel title="6. Для кого" hint="Небольшие продающие карточки, один пункт с новой строки.">
          <div className="space-y-5">
            <SiteImagePicker label="Фото справа от шести карточек" description="Рекомендуемый размер 1600×1200 px, горизонтальное фото 4:3." value={content.audience_image_url} onChange={(url) => change('audience_image_url', url)} onSave={(url) => saveImage('audience_image_url', url)} folder="site/rental/gallery" previewClassName="aspect-[4/3]" />
            <BilingualFields ukLabel="Надпись" plLabel="Napis" ukValue={content.for_who_eyebrow_uk} plValue={content.for_who_eyebrow_pl} onUkChange={(value) => change('for_who_eyebrow_uk', value)} onPlChange={(value) => change('for_who_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.for_who_title_uk} plValue={content.for_who_title_pl} onUkChange={(value) => change('for_who_title_uk', value)} onPlChange={(value) => change('for_who_title_pl', value)} />
            <BilingualFields ukLabel="Описание" plLabel="Opis" ukValue={content.for_who_description_uk} plValue={content.for_who_description_pl} onUkChange={(value) => change('for_who_description_uk', value)} onPlChange={(value) => change('for_who_description_pl', value)} rows={3} />
            <BilingualFields ukLabel="Карточки, по одной с новой строки" plLabel="Karty, każda w nowym wierszu" ukValue={content.for_who_items_uk} plValue={content.for_who_items_pl} onUkChange={(value) => change('for_who_items_uk', value)} onPlChange={(value) => change('for_who_items_pl', value)} rows={7} />
          </div>
        </Panel>

        <Panel title="7. Бронирование и короткие правила" hint="На странице показываются четыре короткие карточки: начало аренды, опоздание/продление, окончание и перенос/отмена. Если пояснение не заполнено, используется подготовленный текст. Ссылка «Полные правила аренды» ведёт на /regulamin автоматически.">
          <div className="space-y-5">
            <BilingualFields ukLabel="Заголовок шагов" plLabel="Tytuł kroków" ukValue={content.reservation_eyebrow_uk} plValue={content.reservation_eyebrow_pl} onUkChange={(value) => change('reservation_eyebrow_uk', value)} onPlChange={(value) => change('reservation_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Шаги, по одному с новой строки" plLabel="Kroki, każdy w nowym wierszu" ukValue={content.reservation_steps_uk} plValue={content.reservation_steps_pl} onUkChange={(value) => change('reservation_steps_uk', value)} onPlChange={(value) => change('reservation_steps_pl', value)} rows={5} />
            <BilingualFields ukLabel="Примечание" plLabel="Uwaga" ukValue={content.reservation_note_uk} plValue={content.reservation_note_pl} onUkChange={(value) => change('reservation_note_uk', value)} onPlChange={(value) => change('reservation_note_pl', value)} rows={2} />
            <div className="grid gap-4 lg:grid-cols-2">
              {content.rental_conditions.map((condition, index) => (
                <div key={condition.id} className="rounded-[22px] border border-[#DDCABB] bg-[#F8F1EB] p-5">
                  <p className="mb-4 font-semibold">Условие {index + 1}</p>
                  <BilingualFields ukLabel="Название" plLabel="Nazwa" ukValue={condition.title_uk} plValue={condition.title_pl} onUkChange={(value) => updateCondition(index, 'title_uk', value)} onPlChange={(value) => updateCondition(index, 'title_pl', value)} />
                  <div className="mt-4"><BilingualFields ukLabel="Пояснение" plLabel="Opis" ukValue={condition.text_uk} plValue={condition.text_pl} onUkChange={(value) => updateCondition(index, 'text_uk', value)} onPlChange={(value) => updateCondition(index, 'text_pl', value)} rows={3} /></div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="8. Отзывы Google" hint="Сами отзывы берутся из общего раздела «Отзывы». Здесь меняются заголовки и ссылка Google.">
          <div className="space-y-5">
            <BilingualFields ukLabel="Надпись" plLabel="Napis" ukValue={content.reviews_eyebrow_uk} plValue={content.reviews_eyebrow_pl} onUkChange={(value) => change('reviews_eyebrow_uk', value)} onPlChange={(value) => change('reviews_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.reviews_title_uk} plValue={content.reviews_title_pl} onUkChange={(value) => change('reviews_title_uk', value)} onPlChange={(value) => change('reviews_title_pl', value)} />
            <Field label="Ссылка на отзывы Google" value={content.google_reviews_url} onChange={(value) => change('google_reviews_url', value)} placeholder="https://g.page/r/.../review" />
          </div>
        </Panel>

        <Panel title="9. Частые вопросы" hint="Все нужные вопросы уже подготовлены. Ответы должны быть короткими; подробные юридические условия остаются на /regulamin. Если основной ответ пустой, сайт использует подготовленный безопасный вариант.">
          <div className="space-y-4">
            <BilingualFields ukLabel="Надпись" plLabel="Napis" ukValue={content.faq_eyebrow_uk} plValue={content.faq_eyebrow_pl} onUkChange={(value) => change('faq_eyebrow_uk', value)} onPlChange={(value) => change('faq_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.faq_title_uk} plValue={content.faq_title_pl} onUkChange={(value) => change('faq_title_uk', value)} onPlChange={(value) => change('faq_title_pl', value)} />
            {content.faq_items.map((faq, index) => (
              <div key={faq.id} className="rounded-[22px] border border-[#DDCABB] bg-[#F8F1EB] p-5">
                <div className="mb-4 flex items-center justify-between gap-3"><p className="font-semibold">Вопрос {index + 1}</p><button type="button" onClick={() => change('faq_items', content.faq_items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-semibold text-red-600">Удалить</button></div>
                <BilingualFields ukLabel="Вопрос" plLabel="Pytanie" ukValue={faq.question_uk} plValue={faq.question_pl} onUkChange={(value) => updateFaq(index, 'question_uk', value)} onPlChange={(value) => updateFaq(index, 'question_pl', value)} />
                <div className="mt-4"><BilingualFields ukLabel="Ответ" plLabel="Odpowiedź" ukValue={faq.answer_uk} plValue={faq.answer_pl} onUkChange={(value) => updateFaq(index, 'answer_uk', value)} onPlChange={(value) => updateFaq(index, 'answer_pl', value)} rows={3} /></div>
              </div>
            ))}
            <button type="button" onClick={addFaq} className="rounded-full border border-[#A67C52] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A5237]">+ Добавить вопрос</button>
          </div>
        </Panel>

        <Panel title="10. Как нас найти" hint="Адрес и часы берутся из «Контактов». Добавьте весь путь до двери для клиента с техникой и одеждой.">
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <SiteImagePicker label="Фото входа в здание" description="Рекомендуемый размер: 1600×1000 px, горизонтальное фото JPG/WebP. На сайте кадр обрезается по центру до пропорции 8:5." value={content.location_image_url} onChange={(url) => change('location_image_url', url)} onSave={(url) => saveImage('location_image_url', url)} folder="site/rental/location" previewClassName="aspect-[8/5]" />
              <SiteImagePicker label="Фото двери или коридора" description="Рекомендуемый размер: 1600×1000 px, горизонтальное фото JPG/WebP. Карта и фотография всегда показываются одной высоты." value={content.location_door_image_url} onChange={(url) => change('location_door_image_url', url)} onSave={(url) => saveImage('location_door_image_url', url)} folder="site/rental/location" previewClassName="aspect-[8/5]" />
            </div>
            <BilingualFields ukLabel="Надпись" plLabel="Napis" ukValue={content.location_eyebrow_uk} plValue={content.location_eyebrow_pl} onUkChange={(value) => change('location_eyebrow_uk', value)} onPlChange={(value) => change('location_eyebrow_pl', value)} />
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.location_title_uk} plValue={content.location_title_pl} onUkChange={(value) => change('location_title_uk', value)} onPlChange={(value) => change('location_title_pl', value)} />
            <BilingualFields ukLabel="Короткое вступление" plLabel="Krótkie wprowadzenie" ukValue={content.location_description_uk} plValue={content.location_description_pl} onUkChange={(value) => change('location_description_uk', value)} onPlChange={(value) => change('location_description_pl', value)} rows={3} />
            <BilingualFields ukLabel="Этаж и номер: 2 этаж, lokal 202" plLabel="Piętro i numer: 2 piętro, lokal 202" ukValue={content.location_floor_uk} plValue={content.location_floor_pl} onUkChange={(value) => change('location_floor_uk', value)} onPlChange={(value) => change('location_floor_pl', value)} />
            <BilingualFields ukLabel="Как узнать вход" plLabel="Jak rozpoznać wejście" ukValue={content.location_entrance_uk} plValue={content.location_entrance_pl} onUkChange={(value) => change('location_entrance_uk', value)} onPlChange={(value) => change('location_entrance_pl', value)} rows={3} />
            <BilingualFields ukLabel="Где припарковаться" plLabel="Gdzie zaparkować" ukValue={content.location_parking_uk} plValue={content.location_parking_pl} onUkChange={(value) => change('location_parking_uk', value)} onPlChange={(value) => change('location_parking_pl', value)} rows={3} />
            <BilingualFields ukLabel="Ближайшая остановка" plLabel="Najbliższy przystanek" ukValue={content.location_stop_uk} plValue={content.location_stop_pl} onUkChange={(value) => change('location_stop_uk', value)} onPlChange={(value) => change('location_stop_pl', value)} rows={2} />
            <BilingualFields ukLabel="Маршрут от метро/остановки" plLabel="Trasa od metra/przystanku" ukValue={content.location_route_uk} plValue={content.location_route_pl} onUkChange={(value) => change('location_route_uk', value)} onPlChange={(value) => change('location_route_pl', value)} rows={4} />
          </div>
        </Panel>

        <Panel title="11. Финальный призыв" hint="Последний блок перед футером.">
          <div className="space-y-5">
            <BilingualFields ukLabel="Заголовок" plLabel="Tytuł" ukValue={content.final_title_uk} plValue={content.final_title_pl} onUkChange={(value) => change('final_title_uk', value)} onPlChange={(value) => change('final_title_pl', value)} />
            <BilingualFields ukLabel="Описание" plLabel="Opis" ukValue={content.final_description_uk} plValue={content.final_description_pl} onUkChange={(value) => change('final_description_uk', value)} onPlChange={(value) => change('final_description_pl', value)} rows={3} />
            <BilingualFields ukLabel="Кнопка" plLabel="Przycisk" ukValue={content.final_cta_uk} plValue={content.final_cta_pl} onUkChange={(value) => change('final_cta_uk', value)} onPlChange={(value) => change('final_cta_pl', value)} />
          </div>
        </Panel>

        <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-[#E5D5C8] bg-white/90 p-3 shadow-xl backdrop-blur">
          <button type="submit" disabled={loading || saving} className="rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50">{saving ? 'Сохраняем…' : 'Сохранить страницу аренды'}</button>
        </div>
      </form>
    </motion.div>
  )
}
