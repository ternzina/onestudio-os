'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type SiteGlobalSettings = {
  studio_name: string
  logo_text: string
  instagram_url: string
  tiktok_url: string
  facebook_url: string
  footer_text_uk: string
  footer_text_pl: string
  notification_email: string
}

const fallbackSiteGlobalSettings: SiteGlobalSettings = {
  studio_name: 'Sisters Studio',
  logo_text: 'Sisters Studio',
  instagram_url: '',
  tiktok_url: '',
  facebook_url: '',
  footer_text_uk:
    'Sisters Studio — фотостудія у Варшаві для зйомок, оренди та творчих проєктів.',
  footer_text_pl:
    'Sisters Studio — studio fotograficzne w Warszawie do sesji, wynajmu i projektów kreatywnych.',
  notification_email: 'hello@sistersstudio.pl',
}

export default function GlobalSettings() {
  const [siteGlobalSettings, setSiteGlobalSettings] =
    useState<SiteGlobalSettings>(fallbackSiteGlobalSettings)
  const [isGlobalSettingsLoading, setIsGlobalSettingsLoading] = useState(true)
  const [isGlobalSettingsSaving, setIsGlobalSettingsSaving] = useState(false)
  const [globalSettingsSaveMessage, setGlobalSettingsSaveMessage] = useState('')
  const [globalSettingsErrorMessage, setGlobalSettingsErrorMessage] = useState('')

  const handleGlobalSettingsInputChange = (
    field: keyof SiteGlobalSettings,
    value: string
  ) => {
    setSiteGlobalSettings((currentSettings) => ({
      ...currentSettings,
      [field]: value,
    }))

    setGlobalSettingsSaveMessage('')
    setGlobalSettingsErrorMessage('')
  }

  const loadSiteGlobalSettings = useCallback(async () => {
    setIsGlobalSettingsLoading(true)
    setGlobalSettingsErrorMessage('')

    const { data, error } = await supabase
      .from('site_global_settings')
      .select(
        'studio_name, logo_text, instagram_url, tiktok_url, facebook_url, footer_text_uk, footer_text_pl, notification_email'
      )
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      setGlobalSettingsErrorMessage(error.message)
      setIsGlobalSettingsLoading(false)
      return
    }

    if (data) {
      setSiteGlobalSettings({
        studio_name: data.studio_name || '',
        logo_text: data.logo_text || '',
        instagram_url: data.instagram_url || '',
        tiktok_url: data.tiktok_url || '',
        facebook_url: data.facebook_url || '',
        footer_text_uk: data.footer_text_uk || '',
        footer_text_pl: data.footer_text_pl || '',
        notification_email: data.notification_email || '',
      })
    }

    setIsGlobalSettingsLoading(false)
  }, [])

  const handleSaveSiteGlobalSettings = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setIsGlobalSettingsSaving(true)
    setGlobalSettingsSaveMessage('')
    setGlobalSettingsErrorMessage('')

    const cleanSettings: SiteGlobalSettings = {
      studio_name: siteGlobalSettings.studio_name.trim(),
      logo_text: siteGlobalSettings.logo_text.trim(),
      instagram_url: siteGlobalSettings.instagram_url.trim(),
      tiktok_url: siteGlobalSettings.tiktok_url.trim(),
      facebook_url: siteGlobalSettings.facebook_url.trim(),
      footer_text_uk: siteGlobalSettings.footer_text_uk.trim(),
      footer_text_pl: siteGlobalSettings.footer_text_pl.trim(),
      notification_email: siteGlobalSettings.notification_email.trim(),
    }

    const { error } = await supabase
      .from('site_global_settings')
      .upsert({
        id: 1,
        ...cleanSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      setGlobalSettingsErrorMessage(error.message)
      setIsGlobalSettingsSaving(false)
      return
    }

    setSiteGlobalSettings(cleanSettings)
    setGlobalSettingsSaveMessage('Соцсети и футер сохранены')
    setIsGlobalSettingsSaving(false)
  }

  useEffect(() => {
    loadSiteGlobalSettings()
  }, [loadSiteGlobalSettings])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.145, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
            Global
          </p>

          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            Соцсети и футер
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Название студии, ссылки на соцсети, текст футера и email для
            уведомлений. Это общий слой сайта, его потом подключим к шапке,
            футеру и письмам.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSiteGlobalSettings}
          disabled={isGlobalSettingsLoading || isGlobalSettingsSaving}
          className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGlobalSettingsLoading ? 'Загружаем...' : 'Обновить'}
        </button>
      </div>

      <form onSubmit={handleSaveSiteGlobalSettings} className="mt-7">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              Название студии
            </span>

            <input
              type="text"
              value={siteGlobalSettings.studio_name}
              onChange={(event) =>
                handleGlobalSettingsInputChange(
                  'studio_name',
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              Текст логотипа
            </span>

            <input
              type="text"
              value={siteGlobalSettings.logo_text}
              onChange={(event) =>
                handleGlobalSettingsInputChange('logo_text', event.target.value)
              }
              className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              Instagram
            </span>

            <input
              type="url"
              value={siteGlobalSettings.instagram_url}
              onChange={(event) =>
                handleGlobalSettingsInputChange(
                  'instagram_url',
                  event.target.value
                )
              }
              placeholder="https://instagram.com/..."
              className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              TikTok
            </span>

            <input
              type="url"
              value={siteGlobalSettings.tiktok_url}
              onChange={(event) =>
                handleGlobalSettingsInputChange('tiktok_url', event.target.value)
              }
              placeholder="https://tiktok.com/@..."
              className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              Facebook
            </span>

            <input
              type="url"
              value={siteGlobalSettings.facebook_url}
              onChange={(event) =>
                handleGlobalSettingsInputChange(
                  'facebook_url',
                  event.target.value
                )
              }
              placeholder="https://facebook.com/..."
              className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              Email для уведомлений
            </span>

            <input
              type="email"
              value={siteGlobalSettings.notification_email}
              onChange={(event) =>
                handleGlobalSettingsInputChange(
                  'notification_email',
                  event.target.value
                )
              }
              placeholder="hello@sistersstudio.pl"
              className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              Текст футера, укр.
            </span>

            <textarea
              value={siteGlobalSettings.footer_text_uk}
              onChange={(event) =>
                handleGlobalSettingsInputChange(
                  'footer_text_uk',
                  event.target.value
                )
              }
              rows={3}
              className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
              Tekst stopki, pl.
            </span>

            <textarea
              value={siteGlobalSettings.footer_text_pl}
              onChange={(event) =>
                handleGlobalSettingsInputChange(
                  'footer_text_pl',
                  event.target.value
                )
              }
              rows={3}
              className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
            />
          </label>
        </div>

        {globalSettingsErrorMessage && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {globalSettingsErrorMessage}
          </div>
        )}

        {globalSettingsSaveMessage && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
            {globalSettingsSaveMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isGlobalSettingsSaving || isGlobalSettingsLoading}
          className="mt-6 w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGlobalSettingsSaving ? 'Сохраняем...' : 'Сохранить соцсети и футер'}
        </button>
      </form>
    </motion.div>
  )
}
