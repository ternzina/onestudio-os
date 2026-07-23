'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type SiteContactSettings = {
  phone: string
  email: string
  address: string
  hours_uk: string
  hours_pl: string
  google_maps_query: string
}

const fallbackSiteContactSettings: SiteContactSettings = {
  phone: '+48733189235',
  email: 'hello@sistersstudio.pl',
  address: 'Taśmowa 1, lokal 202, Warsaw, Poland',
  hours_uk: 'Щодня 09:00 – 21:00',
  hours_pl: 'Codziennie 09:00 – 21:00',
  google_maps_query: 'Taśmowa 1, lokal 202, Warsaw, Poland',
}

export default function ContactSettings() {
  const [siteContacts, setSiteContacts] = useState<SiteContactSettings>(
    fallbackSiteContactSettings
  )
  const [isContactsLoading, setIsContactsLoading] = useState(true)
  const [isContactsSaving, setIsContactsSaving] = useState(false)
  const [contactsSaveMessage, setContactsSaveMessage] = useState('')
  const [contactsErrorMessage, setContactsErrorMessage] = useState('')

  useEffect(() => {
    loadSiteContacts()
  }, [])

  const handleContactInputChange = (
    field: keyof SiteContactSettings,
    value: string
  ) => {
    setSiteContacts((currentSettings) => ({
      ...currentSettings,
      [field]: value,
    }))

    setContactsSaveMessage('')
    setContactsErrorMessage('')
  }

  async function loadSiteContacts() {
    setIsContactsLoading(true)
    setContactsErrorMessage('')

    const { data, error } = await supabase
      .from('site_contacts')
      .select('phone, email, address, hours_uk, hours_pl, google_maps_query')
      .eq('id', 1)
      .single()

    if (error) {
      setContactsErrorMessage(error.message)
      setIsContactsLoading(false)
      return
    }

    if (data) {
      setSiteContacts(data)
    }

    setIsContactsLoading(false)
  }

  const handleSaveSiteContacts = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsContactsSaving(true)
    setContactsSaveMessage('')
    setContactsErrorMessage('')

    const { error } = await supabase
      .from('site_contacts')
      .update({
        phone: siteContacts.phone.trim(),
        email: siteContacts.email.trim(),
        address: siteContacts.address.trim(),
        hours_uk: siteContacts.hours_uk.trim(),
        hours_pl: siteContacts.hours_pl.trim(),
        google_maps_query: siteContacts.google_maps_query.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)

    if (error) {
      setContactsErrorMessage(error.message)
      setIsContactsSaving(false)
      return
    }

    setSiteContacts((currentSettings) => ({
      ...currentSettings,
      phone: currentSettings.phone.trim(),
      email: currentSettings.email.trim(),
      address: currentSettings.address.trim(),
      hours_uk: currentSettings.hours_uk.trim(),
      hours_pl: currentSettings.hours_pl.trim(),
      google_maps_query: currentSettings.google_maps_query.trim(),
    }))
    setContactsSaveMessage('Настройки сохранены')
    setIsContactsSaving(false)
  }

  return (
    <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                Site settings
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                Настройки сайта
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
                Здесь можно изменить телефон, email, адрес, график и адрес для
                карты. После сохранения данные обновятся на странице контактов.
              </p>
            </div>

            <button
              type="button"
              onClick={loadSiteContacts}
              disabled={isContactsLoading || isContactsSaving}
              className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isContactsLoading ? 'Загружаем...' : 'Обновить настройки'}
            </button>
          </div>

          <form onSubmit={handleSaveSiteContacts} className="mt-7">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Телефон
                </span>

                <input
                  type="tel"
                  value={siteContacts.phone}
                  onChange={(event) =>
                    handleContactInputChange('phone', event.target.value)
                  }
                  placeholder="+48733189235"
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Email
                </span>

                <input
                  type="email"
                  value={siteContacts.email}
                  onChange={(event) =>
                    handleContactInputChange('email', event.target.value)
                  }
                  placeholder="hello@sistersstudio.pl"
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Адрес на сайте
                </span>

                <input
                  type="text"
                  value={siteContacts.address}
                  onChange={(event) =>
                    handleContactInputChange('address', event.target.value)
                  }
                  placeholder="Taśmowa 1, lokal 202, Warsaw, Poland"
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  График на украинском
                </span>

                <input
                  type="text"
                  value={siteContacts.hours_uk}
                  onChange={(event) =>
                    handleContactInputChange('hours_uk', event.target.value)
                  }
                  placeholder="Щодня 09:00 – 21:00"
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  График на польском
                </span>

                <input
                  type="text"
                  value={siteContacts.hours_pl}
                  onChange={(event) =>
                    handleContactInputChange('hours_pl', event.target.value)
                  }
                  placeholder="Codziennie 09:00 – 21:00"
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                  Адрес для Google Maps
                </span>

                <input
                  type="text"
                  value={siteContacts.google_maps_query}
                  onChange={(event) =>
                    handleContactInputChange(
                      'google_maps_query',
                      event.target.value
                    )
                  }
                  placeholder="Taśmowa 1, lokal 202, Warsaw, Poland"
                  className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                />

                <p className="mt-2 text-xs leading-5 text-[#7A6252]">
                  Обычно сюда можно вставить тот же адрес, что и выше. Это поле
                  управляет точкой на карте.
                </p>
              </label>
            </div>

            {contactsErrorMessage && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {contactsErrorMessage}
              </div>
            )}

            {contactsSaveMessage && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
                {contactsSaveMessage}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={isContactsSaving || isContactsLoading}
                className="w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isContactsSaving ? 'Сохраняем...' : 'Сохранить настройки'}
              </button>

              <a
                href="/kontakt"
                target="_blank"
                rel="noreferrer"
                className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
              >
                Открыть страницу контактов
              </a>
            </div>
          </form>
        </motion.div>
  )
}
