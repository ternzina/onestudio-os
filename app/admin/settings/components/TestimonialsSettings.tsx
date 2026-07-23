'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SiteImagePicker from './SiteImagePicker'

type EditableTestimonial = {
  id: string
  name: string
  role_uk: string
  role_pl: string
  text_uk: string
  text_pl: string
  rating: number
  image_url: string
  social_url: string
  social_platform: 'instagram' | 'facebook' | ''
  is_active: boolean
  sort_order: number
}

const createEmptyTestimonial = (): Omit<EditableTestimonial, 'id'> => ({
  name: 'Новый отзыв',
  role_uk: '',
  role_pl: '',
  text_uk: '',
  text_pl: '',
  rating: 5,
  image_url: '',
  social_url: '',
  social_platform: '',
  is_active: true,
  sort_order: 0,
})

export default function TestimonialsSettings() {
  const [editableTestimonials, setEditableTestimonials] = useState<
    EditableTestimonial[]
  >([])
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(true)
  const [savingTestimonialId, setSavingTestimonialId] = useState<string | null>(
    null
  )
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<
    string | null
  >(null)
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false)
  const [testimonialsSaveMessage, setTestimonialsSaveMessage] = useState('')
  const [testimonialsErrorMessage, setTestimonialsErrorMessage] = useState('')

  const loadEditableTestimonials = useCallback(async () => {
    setIsTestimonialsLoading(true)
    setTestimonialsErrorMessage('')

    const { data, error } = await supabase
      .from('testimonials')
      .select(
        'id, name, role_uk, role_pl, text_uk, text_pl, rating, image_url, social_url, social_platform, is_active, sort_order'
      )
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      setTestimonialsErrorMessage(error.message)
      setIsTestimonialsLoading(false)
      return
    }

    const normalizedTestimonials: EditableTestimonial[] = (data || []).map(
      (testimonial) => ({
        id: String(testimonial.id),
        name: testimonial.name || '',
        role_uk: testimonial.role_uk || '',
        role_pl: testimonial.role_pl || '',
        text_uk: testimonial.text_uk || '',
        text_pl: testimonial.text_pl || '',
        rating: Number(testimonial.rating || 5),
        image_url: testimonial.image_url || '',
        social_url: testimonial.social_url || '',
        social_platform: testimonial.social_platform || '',
        is_active: Boolean(testimonial.is_active),
        sort_order: Number(testimonial.sort_order || 0),
      })
    )

    setEditableTestimonials(normalizedTestimonials)
    setIsTestimonialsLoading(false)
  }, [])

  useEffect(() => {
    loadEditableTestimonials()
  }, [loadEditableTestimonials])

  const handleTestimonialInputChange = <
    Field extends keyof EditableTestimonial,
  >(
    testimonialId: string,
    field: Field,
    value: EditableTestimonial[Field]
  ) => {
    setEditableTestimonials((currentTestimonials) =>
      currentTestimonials.map((testimonial) =>
        testimonial.id === testimonialId
          ? {
              ...testimonial,
              [field]: value,
            }
          : testimonial
      )
    )

    setTestimonialsSaveMessage('')
    setTestimonialsErrorMessage('')
  }

  const saveTestimonialImage = async (
    testimonialId: string,
    url: string
  ) => {
    setTestimonialsSaveMessage('')
    setTestimonialsErrorMessage('')

    const { error } = await supabase
      .from('testimonials')
      .update({
        image_url: url.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', testimonialId)

    if (error) {
      setTestimonialsErrorMessage(error.message)
      throw new Error(`Фото не сохранилось: ${error.message}`)
    }

    setTestimonialsSaveMessage('Фото клиента сохранено автоматически')
  }

  const handleSaveTestimonial = async (testimonial: EditableTestimonial) => {
    setSavingTestimonialId(testimonial.id)
    setTestimonialsSaveMessage('')
    setTestimonialsErrorMessage('')

    const cleanTestimonial = {
      name: testimonial.name.trim(),
      role_uk: testimonial.role_uk.trim(),
      role_pl: testimonial.role_pl.trim(),
      text_uk: testimonial.text_uk.trim(),
      text_pl: testimonial.text_pl.trim(),
      rating: Math.min(5, Math.max(1, Number(testimonial.rating || 5))),
      image_url: testimonial.image_url.trim(),
      social_url: testimonial.social_url.trim(),
      social_platform: testimonial.social_url.trim() ? testimonial.social_platform || 'instagram' : null,
      is_active: testimonial.is_active,
      sort_order: Number(testimonial.sort_order || 0),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('testimonials')
      .update(cleanTestimonial)
      .eq('id', testimonial.id)

    if (error) {
      setTestimonialsErrorMessage(error.message)
      setSavingTestimonialId(null)
      return
    }

    setEditableTestimonials((currentTestimonials) =>
      currentTestimonials.map((item) =>
        item.id === testimonial.id
          ? { ...item, ...cleanTestimonial, social_platform: cleanTestimonial.social_platform || '' }
          : item
      )
    )
    setTestimonialsSaveMessage(`Отзыв «${cleanTestimonial.name}» сохранён`)
    setSavingTestimonialId(null)
  }

  const handleCreateTestimonial = async () => {
    setIsCreatingTestimonial(true)
    setTestimonialsSaveMessage('')
    setTestimonialsErrorMessage('')

    const newTestimonial = createEmptyTestimonial()

    const { data, error } = await supabase
      .from('testimonials')
      .insert(newTestimonial)
      .select(
        'id, name, role_uk, role_pl, text_uk, text_pl, rating, image_url, social_url, social_platform, is_active, sort_order'
      )
      .single()

    if (error) {
      setTestimonialsErrorMessage(error.message)
      setIsCreatingTestimonial(false)
      return
    }

    if (data) {
      setEditableTestimonials((currentTestimonials) => [
        {
          id: String(data.id),
          name: data.name || '',
          role_uk: data.role_uk || '',
          role_pl: data.role_pl || '',
          text_uk: data.text_uk || '',
          text_pl: data.text_pl || '',
          rating: Number(data.rating || 5),
          image_url: data.image_url || '',
          social_url: data.social_url || '',
          social_platform: data.social_platform || '',
          is_active: Boolean(data.is_active),
          sort_order: Number(data.sort_order || 0),
        },
        ...currentTestimonials,
      ])
    }

    setTestimonialsSaveMessage('Новый отзыв создан')
    setIsCreatingTestimonial(false)
  }

  const handleDeleteTestimonial = async (testimonialId: string) => {
    setDeletingTestimonialId(testimonialId)
    setTestimonialsSaveMessage('')
    setTestimonialsErrorMessage('')

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', testimonialId)

    if (error) {
      setTestimonialsErrorMessage(error.message)
      setDeletingTestimonialId(null)
      return
    }

    setEditableTestimonials((currentTestimonials) =>
      currentTestimonials.filter((testimonial) => testimonial.id !== testimonialId)
    )
    setTestimonialsSaveMessage('Отзыв удалён')
    setDeletingTestimonialId(null)
  }

  return (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.149, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                Testimonials
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                Отзывы
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
                Отзывы можно добавлять, скрывать, редактировать и удалять.
                Потом подключим их к публичному блоку отзывов.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={loadEditableTestimonials}
                disabled={isTestimonialsLoading || Boolean(savingTestimonialId)}
                className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isTestimonialsLoading ? 'Загружаем...' : 'Обновить отзывы'}
              </button>

              <button
                type="button"
                onClick={handleCreateTestimonial}
                disabled={isCreatingTestimonial}
                className="w-fit rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingTestimonial ? 'Создаём...' : 'Добавить отзыв'}
              </button>
            </div>
          </div>

          {testimonialsErrorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {testimonialsErrorMessage}
            </div>
          )}

          {testimonialsSaveMessage && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
              {testimonialsSaveMessage}
            </div>
          )}

          {isTestimonialsLoading && (
            <div className="mt-6 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
              Загружаем отзывы...
            </div>
          )}

          {!isTestimonialsLoading && editableTestimonials.length === 0 && (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
              <p className="text-lg font-medium text-[#2B1A12]">
                Отзывов пока нет
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
                Нажмите «Добавить отзыв», чтобы создать первый отзыв.
              </p>
            </div>
          )}

          {!isTestimonialsLoading && editableTestimonials.length > 0 && (
            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {editableTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5 shadow-[0_14px_40px_rgba(83,54,37,0.08)]"
                >
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        Отзыв
                      </p>

                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#2B1A12]">
                        {testimonial.name || 'Без имени'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleTestimonialInputChange(
                          testimonial.id,
                          'is_active',
                          !testimonial.is_active
                        )
                      }
                      className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
                        testimonial.is_active
                          ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                          : 'border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA]'
                      }`}
                    >
                      {testimonial.is_active ? 'Активен' : 'Скрыт'}
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Имя клиента
                      </span>

                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(event) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'name',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Рейтинг 1–5
                      </span>

                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={testimonial.rating}
                        onChange={(event) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'rating',
                            Number(event.target.value || 5)
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Роль / подпись, укр.
                      </span>

                      <input
                        type="text"
                        value={testimonial.role_uk}
                        onChange={(event) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'role_uk',
                            event.target.value
                          )
                        }
                        placeholder="Клієнтка студії"
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Rola / podpis, pl.
                      </span>

                      <input
                        type="text"
                        value={testimonial.role_pl}
                        onChange={(event) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'role_pl',
                            event.target.value
                          )
                        }
                        placeholder="Klientka studia"
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Порядок показа
                      </span>

                      <input
                        type="number"
                        value={testimonial.sort_order}
                        onChange={(event) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'sort_order',
                            Number(event.target.value || 0)
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <SiteImagePicker
                        label="Фото клиента"
                        value={testimonial.image_url}
                        onChange={(url) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'image_url',
                            url
                          )
                        }
                        onSave={(url) =>
                          saveTestimonialImage(testimonial.id, url)
                        }
                        folder="site/testimonials"
                        previewClassName="aspect-[4/3]"
                      />
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">Социальная сеть</span>
                      <select value={testimonial.social_platform} onChange={(event) => handleTestimonialInputChange(testimonial.id, 'social_platform', event.target.value as EditableTestimonial['social_platform'])} className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none focus:border-[#A67C52]">
                        <option value="">Без ссылки</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">Ссылка на профиль</span>
                      <input type="url" value={testimonial.social_url} onChange={(event) => handleTestimonialInputChange(testimonial.id, 'social_url', event.target.value)} placeholder="https://instagram.com/..." className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none focus:border-[#A67C52]" />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Текст отзыва, укр.
                      </span>

                      <textarea
                        value={testimonial.text_uk}
                        onChange={(event) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'text_uk',
                            event.target.value
                          )
                        }
                        rows={3}
                        className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Tekst opinii, pl.
                      </span>

                      <textarea
                        value={testimonial.text_pl}
                        onChange={(event) =>
                          handleTestimonialInputChange(
                            testimonial.id,
                            'text_pl',
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
                      onClick={() => handleSaveTestimonial(testimonial)}
                      disabled={savingTestimonialId === testimonial.id}
                      className="w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingTestimonialId === testimonial.id
                        ? 'Сохраняем...'
                        : 'Сохранить отзыв'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      disabled={deletingTestimonialId === testimonial.id}
                      className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8A5A36] transition hover:border-[#2B1A12] hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingTestimonialId === testimonial.id
                        ? 'Удаляем...'
                        : 'Удалить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
  )
}
