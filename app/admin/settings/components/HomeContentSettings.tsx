'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SiteImagePicker from './SiteImagePicker'

type SiteHomeContent = {
  hero_eyebrow_uk: string
  hero_eyebrow_pl: string
  hero_words_uk: string
  hero_words_pl: string
  hero_intro_uk: string
  hero_intro_pl: string
  hero_primary_button_uk: string
  hero_primary_button_pl: string
  hero_secondary_button_uk: string
  hero_secondary_button_pl: string
  directions_eyebrow_uk: string
  directions_eyebrow_pl: string
  directions_title_uk: string
  directions_title_pl: string
  directions_text_uk: string
  directions_text_pl: string
  collage_photoshoots_image_url: string
  collage_interiors_image_url: string
  collage_learning_image_url: string
  collage_equipment_image_url: string
  collage_photoshoots_label_uk: string
  collage_photoshoots_label_pl: string
  collage_interiors_label_uk: string
  collage_interiors_label_pl: string
  collage_learning_label_uk: string
  collage_learning_label_pl: string
  collage_equipment_label_uk: string
  collage_equipment_label_pl: string
}

const fallbackSiteHomeContent: SiteHomeContent = {
  hero_eyebrow_uk: 'Фотостудія у Варшаві',
  hero_eyebrow_pl: 'Studio fotograficzne w Warszawie',
  hero_words_uk: 'фотосесій, оренди, навчання',
  hero_words_pl: 'sesji, wynajmu, szkoleń',
  hero_intro_uk:
    'Фотосесії, оренда студії, навчання фотографів та творчі проєкти в натхненному просторі Sisters Studio.',
  hero_intro_pl:
    'Sesje zdjęciowe, wynajem studia, szkolenia dla fotografów i kreatywne projekty w inspirującej przestrzeni Sisters Studio.',
  hero_primary_button_uk: 'Обрати напрям',
  hero_primary_button_pl: 'Wybierz kierunek',
  hero_secondary_button_uk: 'Звʼязатися',
  hero_secondary_button_pl: 'Kontakt',
  directions_eyebrow_uk: 'Напрями студії',
  directions_eyebrow_pl: 'Kierunki studia',
  directions_title_uk: 'Оберіть свій формат',
  directions_title_pl: 'Wybierz swój format',
  directions_text_uk:
    'Один простір може працювати по-різному: як місце для особистої зйомки, студія для оренди, навчальний майданчик або сцена для творчого проєкту.',
  directions_text_pl:
    'Jedna przestrzeń może działać na wiele sposobów: jako miejsce na osobistą sesję, studio do wynajęcia, przestrzeń szkoleniowa albo scena dla kreatywnego projektu.',
  collage_photoshoots_image_url: 'https://cdn.sistersstudio.pl/site/home/collage/1783806495433-39850f5a-75b9-46e5-a66c-d7835cc8a08d-93894c9d-f225-4cc1-8450-b07d66b019ca.webp',
  collage_interiors_image_url: 'https://cdn.sistersstudio.pl/site/home/collage/1783898303114-home-interior-73547d4a-cebc-4a54-a46c-592b2f0cd957.webp',
  collage_learning_image_url: 'https://cdn.sistersstudio.pl/site/home/collage/1783898313372-home-learning-16d2319c-763a-44a3-8528-355abf4ea051.webp',
  collage_equipment_image_url: 'https://cdn.sistersstudio.pl/site/home/collage/1783898283381-home-camera-ef870b4a-df21-4ed7-9767-77ebc28eba2f.webp',
  collage_photoshoots_label_uk: 'Фотосесії',
  collage_photoshoots_label_pl: 'Sesje',
  collage_interiors_label_uk: 'Інтерʼєри',
  collage_interiors_label_pl: 'Wnętrza',
  collage_learning_label_uk: 'Навчання',
  collage_learning_label_pl: 'Szkolenia',
  collage_equipment_label_uk: 'Техніка',
  collage_equipment_label_pl: 'Sprzęт',
}

const siteHomeContentSelect =
  'hero_eyebrow_uk, hero_eyebrow_pl, hero_words_uk, hero_words_pl, hero_intro_uk, hero_intro_pl, hero_primary_button_uk, hero_primary_button_pl, hero_secondary_button_uk, hero_secondary_button_pl, directions_eyebrow_uk, directions_eyebrow_pl, directions_title_uk, directions_title_pl, directions_text_uk, directions_text_pl, collage_photoshoots_image_url, collage_interiors_image_url, collage_learning_image_url, collage_equipment_image_url, collage_photoshoots_label_uk, collage_photoshoots_label_pl, collage_interiors_label_uk, collage_interiors_label_pl, collage_learning_label_uk, collage_learning_label_pl, collage_equipment_label_uk, collage_equipment_label_pl'

const normalizeSiteHomeContent = (
  value: Partial<Record<keyof SiteHomeContent, unknown>> | null | undefined
): SiteHomeContent => {
  const normalizedContent = { ...fallbackSiteHomeContent }

  for (const field of Object.keys(
    fallbackSiteHomeContent
  ) as Array<keyof SiteHomeContent>) {
    const fieldValue = value?.[field]

    if (typeof fieldValue === 'string') {
      normalizedContent[field] = fieldValue
    }
  }

  return normalizedContent
}

const trimSiteHomeContent = (value: SiteHomeContent): SiteHomeContent => {
  const trimmedContent = normalizeSiteHomeContent(value)

  for (const field of Object.keys(
    trimmedContent
  ) as Array<keyof SiteHomeContent>) {
    trimmedContent[field] = trimmedContent[field].trim()
  }

  return trimmedContent
}

export default function HomeContentSettings() {
  const [siteHomeContent, setSiteHomeContent] = useState<SiteHomeContent>(
    fallbackSiteHomeContent
  )
  const [isHomeContentLoading, setIsHomeContentLoading] = useState(true)
  const [isHomeContentSaving, setIsHomeContentSaving] = useState(false)
  const [homeContentSaveMessage, setHomeContentSaveMessage] = useState('')
  const [homeContentErrorMessage, setHomeContentErrorMessage] = useState('')

  const handleHomeContentInputChange = (
    field: keyof SiteHomeContent,
    value: string
  ) => {
    setSiteHomeContent((currentContent) => ({
      ...currentContent,
      [field]: value,
    }))

    setHomeContentSaveMessage('')
    setHomeContentErrorMessage('')
  }


  const saveHomeImage = async (
    field:
      | 'collage_photoshoots_image_url'
      | 'collage_interiors_image_url'
      | 'collage_learning_image_url'
      | 'collage_equipment_image_url',
    url: string
  ) => {
    setHomeContentSaveMessage('')
    setHomeContentErrorMessage('')

    const { error } = await supabase
      .from('site_home_content')
      .update({
        [field]: url.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)

    if (error) {
      setHomeContentErrorMessage(error.message)
      throw new Error(`Фото не сохранилось в настройках: ${error.message}`)
    }

    setHomeContentSaveMessage('Фото сохранено автоматически')
  }

  const loadSiteHomeContent = async () => {
    setIsHomeContentLoading(true)
    setHomeContentErrorMessage('')

    const { data, error } = await supabase
      .from('site_home_content')
      .select(siteHomeContentSelect)
      .eq('id', 1)
      .single()

    if (error) {
      setHomeContentErrorMessage(error.message)
      setIsHomeContentLoading(false)
      return
    }

    if (data) {
      setSiteHomeContent(normalizeSiteHomeContent(data))
    }

    setIsHomeContentLoading(false)
  }

  const saveSiteHomeContent = async () => {
    setIsHomeContentSaving(true)
    setHomeContentSaveMessage('')
    setHomeContentErrorMessage('')

    try {
      const trimmedContent = trimSiteHomeContent(siteHomeContent)

      const { data, error } = await supabase
        .from('site_home_content')
        .update({
          ...trimmedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select(siteHomeContentSelect)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Supabase не вернул сохранённую строку главной страницы')
      }

      setSiteHomeContent(normalizeSiteHomeContent(data))
      setHomeContentSaveMessage('Главная страница сохранена')
    } catch (error) {
      setHomeContentErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить главную страницу'
      )
    } finally {
      setIsHomeContentSaving(false)
    }
  }

  const handleSaveSiteHomeContent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void saveSiteHomeContent()
  }

  useEffect(() => {
    loadSiteHomeContent()
  }, [])

  return (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                Home page
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                Главная страница
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
                Основные заголовки и тексты первого экрана. Сейчас мы даём
                клиенту ручку управления, а саму главную страницу подключим к
                этим данным следующим шагом.
              </p>
            </div>

            <button
              type="button"
              onClick={loadSiteHomeContent}
              disabled={isHomeContentLoading || isHomeContentSaving}
              className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isHomeContentLoading ? 'Загружаем...' : 'Обновить данные'}
            </button>
          </div>

          {homeContentErrorMessage && (
            <div
              role="alert"
              className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-[0_20px_60px_rgba(127,29,29,0.24)]"
            >
              {homeContentErrorMessage}
            </div>
          )}

          {homeContentSaveMessage && (
            <div
              role="status"
              className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800 shadow-[0_20px_60px_rgba(22,101,52,0.22)]"
            >
              {homeContentSaveMessage}
            </div>
          )}

          <form
            id="home-content-form"
            onSubmit={handleSaveSiteHomeContent}
            className="mt-7"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Надпись над заголовком, укр.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_eyebrow_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'hero_eyebrow_uk',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Nadpis nad tytułem, pl.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_eyebrow_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'hero_eyebrow_pl',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Слова в заголовке, укр.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_words_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange('hero_words_uk', event.target.value)
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Słowa w tytule, pl.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_words_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange('hero_words_pl', event.target.value)
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Описание первого экрана, укр.
                </span>

                <textarea
                  value={siteHomeContent.hero_intro_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange('hero_intro_uk', event.target.value)
                  }
                  rows={3}
                  className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Opis pierwszego ekranu, pl.
                </span>

                <textarea
                  value={siteHomeContent.hero_intro_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange('hero_intro_pl', event.target.value)
                  }
                  rows={3}
                  className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Главная кнопка, укр.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_primary_button_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'hero_primary_button_uk',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Główny przycisk, pl.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_primary_button_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'hero_primary_button_pl',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Вторая кнопка, укр.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_secondary_button_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'hero_secondary_button_uk',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Drugi przycisk, pl.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.hero_secondary_button_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'hero_secondary_button_pl',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Надпись над блоком направлений, укр.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.directions_eyebrow_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'directions_eyebrow_uk',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Nadpis nad sekcją kierunków, pl.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.directions_eyebrow_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'directions_eyebrow_pl',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Заголовок направлений, укр.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.directions_title_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'directions_title_uk',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Tytuł kierunków, pl.
                </span>

                <input
                  type="text"
                  value={siteHomeContent.directions_title_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'directions_title_pl',
                      event.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Описание направлений, укр.
                </span>

                <textarea
                  value={siteHomeContent.directions_text_uk}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'directions_text_uk',
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Opis kierunków, pl.
                </span>

                <textarea
                  value={siteHomeContent.directions_text_pl}
                  onChange={(event) =>
                    handleHomeContentInputChange(
                      'directions_text_pl',
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={saveSiteHomeContent}
              disabled={isHomeContentSaving || isHomeContentLoading}
              className="mt-5 w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isHomeContentSaving ? 'Сохраняем...' : 'Сохранить тексты'}
            </button>

            <div className="mt-8 rounded-[30px] border border-[#E5D5C8] bg-[#F7F1EA]/65 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
                  Hero collage
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                  Коллаж главной страницы
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7A6252]">
                  Здесь меняются четыре фотографии и подписи на украинском и польском.
                  Фотография сохраняется автоматически, а подпись — кнопкой под нужным фото.
                </p>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-[26px] border border-[#E5D5C8] bg-white/70 p-4">
                  <SiteImagePicker
                    label="Фото 1 · Фотосессии"
                    value={siteHomeContent.collage_photoshoots_image_url}
                    onChange={(url) =>
                      handleHomeContentInputChange(
                        'collage_photoshoots_image_url',
                        url
                      )
                    }
                    onSave={(url) =>
                      saveHomeImage('collage_photoshoots_image_url', url)
                    }
                    folder="site/home/collage"
                    previewClassName="aspect-[3/4]"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Подпись UA
                      </span>
                      <input
                        value={siteHomeContent.collage_photoshoots_label_uk}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_photoshoots_label_uk',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Podpis PL
                      </span>
                      <input
                        value={siteHomeContent.collage_photoshoots_label_pl}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_photoshoots_label_pl',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={saveSiteHomeContent}
                    disabled={isHomeContentSaving || isHomeContentLoading}
                    className="mt-4 w-fit rounded-full bg-[#2B1A12] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isHomeContentSaving ? 'Сохраняем...' : 'Сохранить подписи'}
                  </button>
                </div>

                <div className="rounded-[26px] border border-[#E5D5C8] bg-white/70 p-4">
                  <SiteImagePicker
                    label="Фото 2 · Интерьеры"
                    value={siteHomeContent.collage_interiors_image_url}
                    onChange={(url) =>
                      handleHomeContentInputChange(
                        'collage_interiors_image_url',
                        url
                      )
                    }
                    onSave={(url) =>
                      saveHomeImage('collage_interiors_image_url', url)
                    }
                    folder="site/home/collage"
                    previewClassName="aspect-[4/3]"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Подпись UA
                      </span>
                      <input
                        value={siteHomeContent.collage_interiors_label_uk}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_interiors_label_uk',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Podpis PL
                      </span>
                      <input
                        value={siteHomeContent.collage_interiors_label_pl}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_interiors_label_pl',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={saveSiteHomeContent}
                    disabled={isHomeContentSaving || isHomeContentLoading}
                    className="mt-4 w-fit rounded-full bg-[#2B1A12] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isHomeContentSaving ? 'Сохраняем...' : 'Сохранить подписи'}
                  </button>
                </div>

                <div className="rounded-[26px] border border-[#E5D5C8] bg-white/70 p-4">
                  <SiteImagePicker
                    label="Фото 3 · Навчання"
                    value={siteHomeContent.collage_learning_image_url}
                    onChange={(url) =>
                      handleHomeContentInputChange(
                        'collage_learning_image_url',
                        url
                      )
                    }
                    onSave={(url) =>
                      saveHomeImage('collage_learning_image_url', url)
                    }
                    folder="site/home/collage"
                    previewClassName="aspect-[4/3]"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Подпись UA
                      </span>
                      <input
                        value={siteHomeContent.collage_learning_label_uk}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_learning_label_uk',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Podpis PL
                      </span>
                      <input
                        value={siteHomeContent.collage_learning_label_pl}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_learning_label_pl',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={saveSiteHomeContent}
                    disabled={isHomeContentSaving || isHomeContentLoading}
                    className="mt-4 w-fit rounded-full bg-[#2B1A12] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isHomeContentSaving ? 'Сохраняем...' : 'Сохранить подписи'}
                  </button>
                </div>

                <div className="rounded-[26px] border border-[#E5D5C8] bg-white/70 p-4">
                  <SiteImagePicker
                    label="Фото 4 · Техника"
                    value={siteHomeContent.collage_equipment_image_url}
                    onChange={(url) =>
                      handleHomeContentInputChange(
                        'collage_equipment_image_url',
                        url
                      )
                    }
                    onSave={(url) =>
                      saveHomeImage('collage_equipment_image_url', url)
                    }
                    folder="site/home/collage"
                    previewClassName="aspect-[4/3]"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Подпись UA
                      </span>
                      <input
                        value={siteHomeContent.collage_equipment_label_uk}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_equipment_label_uk',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#A67C52]">
                        Podpis PL
                      </span>
                      <input
                        value={siteHomeContent.collage_equipment_label_pl}
                        onChange={(event) =>
                          handleHomeContentInputChange(
                            'collage_equipment_label_pl',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm outline-none focus:border-[#A67C52]"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={saveSiteHomeContent}
                    disabled={isHomeContentSaving || isHomeContentLoading}
                    className="mt-4 w-fit rounded-full bg-[#2B1A12] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isHomeContentSaving ? 'Сохраняем...' : 'Сохранить подписи'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={saveSiteHomeContent}
                disabled={isHomeContentSaving || isHomeContentLoading}
                className="w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isHomeContentSaving ? 'Сохраняем...' : 'Сохранить все изменения'}
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
              >
                Открыть главную
              </a>
            </div>
          </form>
        </motion.div>
  )
}
