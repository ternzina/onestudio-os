'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Addon = { id: string; title_uk: string; title_pl: string; description_uk: string; description_pl: string; price: number; is_active: boolean; sort_order: number }
const emptyAddon = (): Addon => ({ id: `new-${Date.now()}`, title_uk: '', title_pl: '', description_uk: '', description_pl: '', price: 0, is_active: true, sort_order: 100 })

export default function ConstructorSettings() {
  const [items, setItems] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('package_addons').select('*').order('sort_order')
    if (error) setErrorMessage(error.message)
    else setItems((data || []).map((item) => ({ ...item, description_uk: item.description_uk || '', description_pl: item.description_pl || '', price: Number(item.price || 0) })))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const update = (id: string, field: keyof Addon, value: string | number | boolean) => setItems(current => current.map(item => item.id === id ? { ...item, [field]: value } : item))

  const save = async (item: Addon) => {
    if (!item.title_uk.trim() || !item.title_pl.trim()) { setErrorMessage('Заполните название на украинском и польском'); return }
    setSavingId(item.id); setMessage(''); setErrorMessage('')
    const payload = { title_uk: item.title_uk.trim(), title_pl: item.title_pl.trim(), description_uk: item.description_uk.trim(), description_pl: item.description_pl.trim(), price: Number(item.price), is_active: item.is_active, sort_order: Number(item.sort_order), updated_at: new Date().toISOString() }
    const result = item.id.startsWith('new-')
      ? await supabase.from('package_addons').insert(payload).select().single()
      : await supabase.from('package_addons').update(payload).eq('id', item.id).select().single()
    if (result.error) setErrorMessage(result.error.message)
    else { setMessage(`Услуга «${payload.title_uk}» сохранена`); await load() }
    setSavingId('')
  }

  const remove = async (item: Addon) => {
    if (item.id.startsWith('new-')) { setItems(current => current.filter(x => x.id !== item.id)); return }
    if (!window.confirm(`Удалить услугу «${item.title_uk}»?`)) return
    const { error } = await supabase.from('package_addons').delete().eq('id', item.id)
    if (error) setErrorMessage(error.message); else await load()
  }

  return (
    <div className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">Package constructor</p><h2 className="mt-2 text-2xl font-semibold">Конструктор фотосессии</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">Добавляйте специалистов и услуги. Клиент сможет отметить несколько вариантов, а их стоимость прибавится к цене пакета «Конструктор».</p></div>
        <button type="button" onClick={() => setItems(current => [...current, emptyAddon()])} className="rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">+ Добавить услугу</button>
      </div>
      {errorMessage && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}
      {message && <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
      {loading ? <p className="mt-6 text-sm text-[#7A6252]">Загружаем услуги...</p> : <div className="mt-7 grid gap-5 lg:grid-cols-2">{items.map(item => (
        <div key={item.id} className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs uppercase text-[#A67C52]">Название UA<input value={item.title_uk} onChange={e => update(item.id, 'title_uk', e.target.value)} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3 text-sm normal-case text-[#2B1A12]" /></label>
            <label className="text-xs uppercase text-[#A67C52]">Nazwa PL<input value={item.title_pl} onChange={e => update(item.id, 'title_pl', e.target.value)} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3 text-sm normal-case text-[#2B1A12]" /></label>
            <label className="sm:col-span-2 text-xs uppercase text-[#A67C52]">Описание UA<textarea value={item.description_uk} onChange={e => update(item.id, 'description_uk', e.target.value)} rows={2} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3 text-sm normal-case text-[#2B1A12]" /></label>
            <label className="sm:col-span-2 text-xs uppercase text-[#A67C52]">Opis PL<textarea value={item.description_pl} onChange={e => update(item.id, 'description_pl', e.target.value)} rows={2} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3 text-sm normal-case text-[#2B1A12]" /></label>
            <label className="text-xs uppercase text-[#A67C52]">Цена, zł<input type="number" min="0" value={item.price} onChange={e => update(item.id, 'price', Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3 text-sm text-[#2B1A12]" /></label>
            <label className="text-xs uppercase text-[#A67C52]">Порядок<input type="number" value={item.sort_order} onChange={e => update(item.id, 'sort_order', Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-3 text-sm text-[#2B1A12]" /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => update(item.id, 'is_active', !item.is_active)} className={`rounded-full px-4 py-2 text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-[#E8D8CC] text-[#7A6252]'}`}>{item.is_active ? 'Показывается' : 'Скрыта'}</button><button type="button" onClick={() => save(item)} disabled={savingId === item.id} className="rounded-full bg-[#2B1A12] px-4 py-2 text-xs text-white">{savingId === item.id ? 'Сохраняем...' : 'Сохранить'}</button><button type="button" onClick={() => remove(item)} className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-700">Удалить</button></div>
        </div>
      ))}</div>}
    </div>
  )
}
