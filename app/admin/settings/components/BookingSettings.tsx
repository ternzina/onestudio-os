'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SimpleMediaPicker from './SimpleMediaPicker'

type Settings = {
  id: string
  photo_booking_enabled: boolean
  photo_open_hour: number
  photo_close_hour: number
  photo_duration_options: number[]
  rental_booking_enabled: boolean
  rental_video_enabled: boolean
  rental_video_url: string
  rental_calendar_enabled: boolean
  rental_open_hour: number
  rental_close_hour: number
  rental_duration_options: number[]
  studio_price_per_hour: number
  makeup_price_per_hour: number
  constructor_price_1_hour: number
  constructor_price_2_hours: number
  constructor_price_3_hours: number
}

const defaults: Settings = {
  id: 'main',
  photo_booking_enabled: true,
  photo_open_hour: 10,
  photo_close_hour: 18,
  photo_duration_options: [1, 2, 3, 4, 5],
  rental_booking_enabled: true,
  rental_video_enabled: true,
  rental_video_url: '/videos/training-student-story.mp4',
  rental_calendar_enabled: false,
  rental_open_hour: 9,
  rental_close_hour: 22,
  rental_duration_options: [1, 2, 3, 4, 5],
  studio_price_per_hour: 200,
  makeup_price_per_hour: 50,
  constructor_price_1_hour: 1000,
  constructor_price_2_hours: 1600,
  constructor_price_3_hours: 2200,
}

const hours = Array.from({ length: 15 }, (_, index) => index + 8)

export default function BookingSettings() {
  const [settings, setSettings] = useState<Settings>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const load = async () => {
    setLoading(true)
    setErrorMessage('')
    const { data, error } = await supabase
      .from('booking_page_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle()

    if (error) setErrorMessage(error.message)
    else if (data) setSettings({ ...defaults, ...data })
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const toggleDuration = (field: 'photo_duration_options' | 'rental_duration_options', value: number) => {
    setSettings((current) => {
      const selected = current[field]
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value].sort((a, b) => a - b)
      return { ...current, [field]: next.length ? next : selected }
    })
    setMessage('')
  }

  const save = async () => {
    setSaving(true)
    setMessage('')
    setErrorMessage('')
    const payload = {
      ...settings,
      photo_duration_options: [3],
      constructor_price_1_hour: 1000,
      constructor_price_2_hours: 1600,
      constructor_price_3_hours: 2200,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase
      .from('booking_page_settings')
      .upsert(payload, { onConflict: 'id' })

    if (error) setErrorMessage(error.message)
    else setMessage('Настройки бронирования сохранены')
    setSaving(false)
  }

  const renderDurationButtons = (field: 'photo_duration_options' | 'rental_duration_options') => (
    <div className="mt-3 flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => toggleDuration(field, value)}
          className={`rounded-full border px-4 py-2 text-sm transition ${settings[field].includes(value) ? 'border-[#2B1A12] bg-[#2B1A12] text-white' : 'border-[#D8C4B3] bg-white text-[#7A6252]'}`}
        >
          {value} ч.
        </button>
      ))}
    </div>
  )

  if (loading) return <div className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-8">Загружаем настройки бронирования...</div>

  return (
    <div className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] sm:p-8">
      <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">Booking pages</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Настройки бронирования</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#7A6252]">Управление доступностью страниц, рабочими часами, длительностью и ценами аренды. Изменения появляются на сайте после сохранения.</p>

      {errorMessage && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}
      {message && <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB] p-5">
          <div className="flex items-center justify-between gap-4">
            <div><p className="font-semibold">Фотосессии</p><p className="mt-1 text-xs text-[#7A6252]">/booking-public</p></div>
            <button type="button" onClick={() => setSettings({ ...settings, photo_booking_enabled: !settings.photo_booking_enabled })} className={`rounded-full px-4 py-2 text-xs font-semibold ${settings.photo_booking_enabled ? 'bg-green-100 text-green-800' : 'bg-[#E8D8CC] text-[#7A6252]'}`}>{settings.photo_booking_enabled ? 'Включено' : 'Выключено'}</button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-sm">Открытие<select value={settings.photo_open_hour} onChange={(e) => setSettings({ ...settings, photo_open_hour: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3">{hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select></label>
            <label className="text-sm">Закрытие<select value={settings.photo_close_hour} onChange={(e) => setSettings({ ...settings, photo_close_hour: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3">{hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select></label>
          </div>
          <div className="mt-5 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
            <p className="text-sm font-semibold">Длительность фотосессий</p>
            <p className="mt-1 text-xs leading-5 text-[#7A6252]">Три готовых пакета всегда рассчитаны на 3 часа. Выбор длительности показывается только в пакете «Конструктор».</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                [1, 1000],
                [2, 1600],
                [3, 2200],
                [4, 3000],
                [5, 3500],
              ].map(([duration, price]) => (
                <div key={duration} className="rounded-xl border border-[#D8C4B3] bg-white p-3 text-center">
                  <p className="text-xs text-[#7A6252]">{duration} ч.</p>
                  <p className="mt-1 text-sm font-semibold text-[#2B1A12]">{price} zł</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB] p-5">
          <div className="flex items-center justify-between gap-4">
            <div><p className="font-semibold">Аренда студии</p><p className="mt-1 text-xs text-[#7A6252]">/wynajem-studia/rezerwacja</p></div>
            <button type="button" onClick={() => setSettings({ ...settings, rental_booking_enabled: !settings.rental_booking_enabled })} className={`rounded-full px-4 py-2 text-xs font-semibold ${settings.rental_booking_enabled ? 'bg-green-100 text-green-800' : 'bg-[#E8D8CC] text-[#7A6252]'}`}>{settings.rental_booking_enabled ? 'Включено' : 'Выключено'}</button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-sm">Открытие<select value={settings.rental_open_hour} onChange={(e) => setSettings({ ...settings, rental_open_hour: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3">{hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select></label>
            <label className="text-sm">Закрытие<select value={settings.rental_close_hour} onChange={(e) => setSettings({ ...settings, rental_close_hour: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3">{hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select></label>
          </div>
          <div className="mt-5 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Видеообзор фотостудии</p>
                <p className="mt-1 text-xs leading-5 text-[#7A6252]">Показывается на странице аренды непосредственно над календарём занятости.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, rental_video_enabled: !settings.rental_video_enabled })}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${settings.rental_video_enabled ? 'bg-green-100 text-green-800' : 'bg-[#E8D8CC] text-[#7A6252]'}`}
              >
                {settings.rental_video_enabled ? 'Включён' : 'Выключен'}
              </button>
            </div>
            <div className="mt-4">
              <SimpleMediaPicker
                type="video"
                value={settings.rental_video_url}
                onChange={(url) => {
                  setSettings((current) => ({ ...current, rental_video_url: url }))
                  setMessage('')
                }}
              />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
            <div>
              <p className="text-sm font-semibold">Календарь занятости на странице аренды</p>
              <p className="mt-1 text-xs leading-5 text-[#7A6252]">Показывает свободные, частично занятые и полностью занятые дни. Пока заказов нет, оставьте выключенным.</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, rental_calendar_enabled: !settings.rental_calendar_enabled })}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${settings.rental_calendar_enabled ? 'bg-green-100 text-green-800' : 'bg-[#E8D8CC] text-[#7A6252]'}`}
            >
              {settings.rental_calendar_enabled ? 'Включён' : 'Выключен'}
            </button>
          </div>
          <p className="mt-5 text-sm font-medium">Доступная длительность</p>{renderDurationButtons('rental_duration_options')}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="text-sm">Зал, zł/час<input type="number" min="0" value={settings.studio_price_per_hour} onChange={(e) => setSettings({ ...settings, studio_price_per_hour: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3" /></label>
            <label className="text-sm">Make-up, zł/час<input type="number" min="0" value={settings.makeup_price_per_hour} onChange={(e) => setSettings({ ...settings, makeup_price_per_hour: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3" /></label>
          </div>
        </div>
      </div>

      <button type="button" onClick={save} disabled={saving || settings.photo_open_hour >= settings.photo_close_hour || settings.rental_open_hour >= settings.rental_close_hour} className="mt-6 rounded-full bg-[#2B1A12] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Сохраняем...' : 'Сохранить настройки'}</button>
    </div>
  )
}
