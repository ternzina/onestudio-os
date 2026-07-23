'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SiteImagePicker from './SiteImagePicker'

type EditableInterior = {
  id: string
  name: string
  name_uk: string
  name_pl: string
  description_uk: string
  description_pl: string
  image_url: string
  is_active: boolean
  sort_order: number
}

const createEmptyInterior = (): Omit<EditableInterior, 'id'> => ({
  name: 'Нова зона студії',
  name_uk: 'Нова зона студії',
  name_pl: 'Nowa strefa studia',
  description_uk: '',
  description_pl: '',
  image_url: '',
  is_active: true,
  sort_order: 0,
})

export default function InteriorsSettings() {
  const [editableInteriors, setEditableInteriors] = useState<EditableInterior[]>([])
  const [isInteriorsLoading, setIsInteriorsLoading] = useState(true)
  const [savingInteriorId, setSavingInteriorId] = useState<string | null>(null)
  const [isCreatingInterior, setIsCreatingInterior] = useState(false)
  const [deletingInteriorId, setDeletingInteriorId] = useState<string | null>(null)
  const [interiorsSaveMessage, setInteriorsSaveMessage] = useState('')
  const [interiorsErrorMessage, setInteriorsErrorMessage] = useState('')

  const loadEditableInteriors = useCallback(async () => {
    setIsInteriorsLoading(true)
    setInteriorsErrorMessage('')

    const { data, error } = await supabase
      .from('interiors')
      .select(
        'id, name, name_uk, name_pl, description_uk, description_pl, image_url, is_active, sort_order'
      )
      .order('sort_order', { ascending: true })
      .order('name_uk', { ascending: true })

    if (error) {
      setInteriorsErrorMessage(error.message)
      setIsInteriorsLoading(false)
      return
    }

    const normalizedInteriors: EditableInterior[] = (data || []).map(
      (item) => ({
        id: String(item.id),
        name: item.name || '',
        name_uk: item.name_uk || item.name || '',
        name_pl: item.name_pl || item.name || '',
        description_uk: item.description_uk || '',
        description_pl: item.description_pl || '',
        image_url: item.image_url || '',
        is_active: Boolean(item.is_active),
        sort_order: Number(item.sort_order || 0),
      })
    )

    setEditableInteriors(normalizedInteriors)
    setIsInteriorsLoading(false)
  }, [])

  const handleInteriorInputChange = <Field extends keyof EditableInterior>(
    interiorId: string,
    field: Field,
    value: EditableInterior[Field]
  ) => {
    setEditableInteriors((currentInteriors) =>
      currentInteriors.map((item) =>
        item.id === interiorId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )

    setInteriorsSaveMessage('')
    setInteriorsErrorMessage('')
  }

  const saveInteriorImage = async (interiorId: string, url: string) => {
    setInteriorsSaveMessage('')
    setInteriorsErrorMessage('')

    const { error } = await supabase
      .from('interiors')
      .update({
        image_url: url.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', interiorId)

    if (error) {
      setInteriorsErrorMessage(error.message)
      throw new Error(`Фото не сохранилось: ${error.message}`)
    }

    setInteriorsSaveMessage('Фото интерьерной зоны сохранено автоматически')
  }

  const handleSaveInterior = async (interior: EditableInterior) => {
    setSavingInteriorId(interior.id)
    setInteriorsSaveMessage('')
    setInteriorsErrorMessage('')

    const cleanInterior = {
      name: interior.name_uk.trim() || interior.name_pl.trim() || interior.name.trim() || 'Нова зона студії',
      name_uk: interior.name_uk.trim(),
      name_pl: interior.name_pl.trim(),
      description_uk: interior.description_uk.trim(),
      description_pl: interior.description_pl.trim(),
      image_url: interior.image_url.trim(),
      is_active: interior.is_active,
      sort_order: Number(interior.sort_order || 0),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('interiors')
      .update(cleanInterior)
      .eq('id', interior.id)

    if (error) {
      setInteriorsErrorMessage(error.message)
      setSavingInteriorId(null)
      return
    }

    setEditableInteriors((currentInteriors) =>
      currentInteriors.map((item) =>
        item.id === interior.id ? { ...item, ...cleanInterior } : item
      )
    )
    setInteriorsSaveMessage(`Зона «${cleanInterior.name_uk || cleanInterior.name_pl || cleanInterior.name}» сохранена`)
    setSavingInteriorId(null)
  }

  const handleCreateInterior = async () => {
    setIsCreatingInterior(true)
    setInteriorsSaveMessage('')
    setInteriorsErrorMessage('')

    const newInterior = createEmptyInterior()

    const { data, error } = await supabase
      .from('interiors')
      .insert(newInterior)
      .select('id, name, name_uk, name_pl, description_uk, description_pl, image_url, is_active, sort_order')
      .single()

    if (error) {
      setInteriorsErrorMessage(error.message)
      setIsCreatingInterior(false)
      return
    }

    if (data) {
      setEditableInteriors((currentInteriors) => [
        {
          id: String(data.id),
          name: data.name || '',
          name_uk: data.name_uk || data.name || '',
          name_pl: data.name_pl || data.name || '',
          description_uk: data.description_uk || '',
          description_pl: data.description_pl || '',
          image_url: data.image_url || '',
          is_active: Boolean(data.is_active),
          sort_order: Number(data.sort_order || 0),
        },
        ...currentInteriors,
      ])
    }

    setInteriorsSaveMessage('Новая зона создана')
    setIsCreatingInterior(false)
  }

  const handleDeleteInterior = async (interiorId: string) => {
    setDeletingInteriorId(interiorId)
    setInteriorsSaveMessage('')
    setInteriorsErrorMessage('')

    const { error } = await supabase
      .from('interiors')
      .delete()
      .eq('id', interiorId)

    if (error) {
      setInteriorsErrorMessage(error.message)
      setDeletingInteriorId(null)
      return
    }

    setEditableInteriors((currentInteriors) =>
      currentInteriors.filter((interior) => interior.id !== interiorId)
    )
    setInteriorsSaveMessage('Зона удалена')
    setDeletingInteriorId(null)
  }

  useEffect(() => {
    loadEditableInteriors()
  }, [loadEditableInteriors])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
            Interiors
          </p>

          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            Интерьерные зоны
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Названия, описания, ссылки на фото и порядок показа интерьерных зон внутри студии.
            Эти данные используются на страницах фотосессий и аренды.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadEditableInteriors}
            disabled={isInteriorsLoading || Boolean(savingInteriorId)}
            className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInteriorsLoading ? 'Загружаем...' : 'Обновить зоны'}
          </button>

          <button
            type="button"
            onClick={handleCreateInterior}
            disabled={isCreatingInterior}
            className="w-fit rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingInterior ? 'Создаём...' : 'Добавить зону'}
          </button>
        </div>
      </div>

      {interiorsErrorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {interiorsErrorMessage}
        </div>
      )}

      {interiorsSaveMessage && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          {interiorsSaveMessage}
        </div>
      )}

      {isInteriorsLoading && (
        <div className="mt-6 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
          Загружаем зоны...
        </div>
      )}

      {!isInteriorsLoading && editableInteriors.length === 0 && (
        <div className="mt-6 rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
          <p className="text-lg font-medium text-[#2B1A12]">
            Зон пока нет
          </p>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
            Нажмите «Добавить зону», чтобы создать первую карточку для страницы аренды.
          </p>
        </div>
      )}

      {!isInteriorsLoading && editableInteriors.length > 0 && (
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {editableInteriors.map((interior) => (
            <div
              key={interior.id}
              className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5 shadow-[0_14px_40px_rgba(83,54,37,0.08)]"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    Зона
                  </p>

                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#2B1A12]">
                    {interior.name_uk || interior.name_pl || interior.name || 'Без названия'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleInteriorInputChange(
                      interior.id,
                      'is_active',
                      !interior.is_active
                    )
                  }
                  className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
                    interior.is_active
                      ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                      : 'border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA]'
                  }`}
                >
                  {interior.is_active ? 'Активен' : 'Скрыт'}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Название зоны, укр.
                  </span>

                  <input
                    type="text"
                    value={interior.name_uk}
                    onChange={(event) =>
                      handleInteriorInputChange(
                        interior.id,
                        'name_uk',
                        event.target.value
                      )
                    }
                    placeholder="Теплі фактури"
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Nazwa strefy, pl.
                  </span>

                  <input
                    type="text"
                    value={interior.name_pl}
                    onChange={(event) =>
                      handleInteriorInputChange(
                        interior.id,
                        'name_pl',
                        event.target.value
                      )
                    }
                    placeholder="Ciepłe faktury"
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Порядок показа
                  </span>

                  <input
                    type="number"
                    value={interior.sort_order}
                    onChange={(event) =>
                      handleInteriorInputChange(
                        interior.id,
                        'sort_order',
                        Number(event.target.value || 0)
                      )
                    }
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>
                <div className="sm:col-span-2">
                  <SiteImagePicker
                    label="Фото интерьерной зоны"
                    value={interior.image_url}
                    onChange={(url) =>
                      handleInteriorInputChange(interior.id, 'image_url', url)
                    }
                    onSave={(url) => saveInteriorImage(interior.id, url)}
                    folder="site/interiors"
                    previewClassName="aspect-[16/9]"
                  />
                </div>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Описание, укр.
                  </span>

                  <textarea
                    value={interior.description_uk}
                    onChange={(event) =>
                      handleInteriorInputChange(
                        interior.id,
                        'description_uk',
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Opis, pl.
                  </span>

                  <textarea
                    value={interior.description_pl}
                    onChange={(event) =>
                      handleInteriorInputChange(
                        interior.id,
                        'description_pl',
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleSaveInterior(interior)}
                  disabled={savingInteriorId === interior.id}
                  className="w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingInteriorId === interior.id
                    ? 'Сохраняем...'
                    : 'Сохранить зону'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteInterior(interior.id)}
                  disabled={deletingInteriorId === interior.id}
                  className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8A5A36] transition hover:border-[#2B1A12] hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingInteriorId === interior.id ? 'Удаляем...' : 'Удалить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
