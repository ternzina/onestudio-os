'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type EditablePackage = {
  id: string
  title: string
  price: number
  description_uk: string
  description_pl: string
  duration_label_uk: string
  duration_label_pl: string
  button_label_uk: string
  button_label_pl: string
  currency: string
  deposit_amount: number
  is_active: boolean
  sort_order: number
}

export default function PackagesSettings() {
  const [editablePackages, setEditablePackages] = useState<EditablePackage[]>([])
  const [isPackagesLoading, setIsPackagesLoading] = useState(true)
  const [savingPackageId, setSavingPackageId] = useState<string | null>(null)
  const [packagesSaveMessage, setPackagesSaveMessage] = useState('')
  const [packagesErrorMessage, setPackagesErrorMessage] = useState('')

  useEffect(() => {
    loadEditablePackages()
  }, [])

  async function loadEditablePackages() {
    setIsPackagesLoading(true)
    setPackagesErrorMessage('')

    const { data, error } = await supabase
      .from('packages')
      .select(
        'id, title, price, description_uk, description_pl, duration_label_uk, duration_label_pl, button_label_uk, button_label_pl, currency, deposit_amount, is_active, sort_order'
      )
      .order('sort_order', { ascending: true })
      .order('price', { ascending: true })

    if (error) {
      setPackagesErrorMessage(error.message)
      setIsPackagesLoading(false)
      return
    }

    const normalizedPackages: EditablePackage[] = (data || []).map(
      (item) => ({
        id: String(item.id),
        title: item.title || '',
        price: Number(item.price || 0),
        description_uk: item.description_uk || '',
        description_pl: item.description_pl || '',
        duration_label_uk: item.duration_label_uk || '',
        duration_label_pl: item.duration_label_pl || '',
        button_label_uk: item.button_label_uk || 'Забронювати',
        button_label_pl: item.button_label_pl || 'Zarezerwuj',
        currency: item.currency || 'PLN',
        deposit_amount: Number(item.deposit_amount || 0),
        is_active: Boolean(item.is_active),
        sort_order: Number(item.sort_order || 0),
      })
    )

    setEditablePackages(normalizedPackages)
    setIsPackagesLoading(false)
  }

  const handlePackageInputChange = <Field extends keyof EditablePackage>(
    packageId: string,
    field: Field,
    value: EditablePackage[Field]
  ) => {
    setEditablePackages((currentPackages) =>
      currentPackages.map((item) =>
        item.id === packageId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )

    setPackagesSaveMessage('')
    setPackagesErrorMessage('')
  }

  const handleSavePackage = async (packageItem: EditablePackage) => {
    setSavingPackageId(packageItem.id)
    setPackagesSaveMessage('')
    setPackagesErrorMessage('')

    const cleanPackage = {
      title: packageItem.title.trim(),
      price: Number(packageItem.price || 0),
      description_uk: packageItem.description_uk.trim(),
      description_pl: packageItem.description_pl.trim(),
      duration_label_uk: packageItem.duration_label_uk.trim(),
      duration_label_pl: packageItem.duration_label_pl.trim(),
      button_label_uk: packageItem.button_label_uk.trim() || 'Забронювати',
      button_label_pl: packageItem.button_label_pl.trim() || 'Zarezerwuj',
      currency: packageItem.currency.trim() || 'PLN',
      deposit_amount: Number(packageItem.deposit_amount || 0),
      is_active: packageItem.is_active,
      sort_order: Number(packageItem.sort_order || 0),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('packages')
      .update(cleanPackage)
      .eq('id', packageItem.id)

    if (error) {
      setPackagesErrorMessage(error.message)
      setSavingPackageId(null)
      return
    }

    setEditablePackages((currentPackages) =>
      currentPackages.map((item) =>
        item.id === packageItem.id ? { ...item, ...cleanPackage } : item
      )
    )
    setPackagesSaveMessage(`Пакет «${cleanPackage.title}» сохранён`)
    setSavingPackageId(null)
  }

  return (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                Packages
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                Пакеты и цены
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
                Здесь можно менять названия пакетов, цены, предоплату,
                описания и порядок показа. Эти данные уже связаны с заявками в
                админке.
              </p>
            </div>

            <button
              type="button"
              onClick={loadEditablePackages}
              disabled={isPackagesLoading || Boolean(savingPackageId)}
              className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPackagesLoading ? 'Загружаем...' : 'Обновить пакеты'}
            </button>
          </div>

          {packagesErrorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {packagesErrorMessage}
            </div>
          )}

          {packagesSaveMessage && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
              {packagesSaveMessage}
            </div>
          )}

          {isPackagesLoading && (
            <div className="mt-6 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
              Загружаем пакеты...
            </div>
          )}

          {!isPackagesLoading && editablePackages.length === 0 && (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
              <p className="text-lg font-medium text-[#2B1A12]">
                Пакетов пока нет
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
                Когда в таблице packages появятся записи, их можно будет
                редактировать здесь.
              </p>
            </div>
          )}

          {!isPackagesLoading && editablePackages.length > 0 && (
            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {editablePackages.map((packageItem) => (
                <div
                  key={packageItem.id}
                  className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5 shadow-[0_14px_40px_rgba(83,54,37,0.08)]"
                >
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        Пакет
                      </p>

                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#2B1A12]">
                        {packageItem.title || 'Без названия'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handlePackageInputChange(
                          packageItem.id,
                          'is_active',
                          !packageItem.is_active
                        )
                      }
                      className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
                        packageItem.is_active
                          ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                          : 'border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA]'
                      }`}
                    >
                      {packageItem.is_active ? 'Активен' : 'Скрыт'}
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Название
                      </span>

                      <input
                        type="text"
                        value={packageItem.title}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'title',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Цена
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={packageItem.price}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'price',
                            Number(event.target.value || 0)
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Валюта
                      </span>

                      <input
                        type="text"
                        value={packageItem.currency}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'currency',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Предоплата
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={packageItem.deposit_amount}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'deposit_amount',
                            Number(event.target.value || 0)
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Порядок показа
                      </span>

                      <input
                        type="number"
                        value={packageItem.sort_order}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'sort_order',
                            Number(event.target.value || 0)
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Длительность, укр.
                      </span>

                      <input
                        type="text"
                        value={packageItem.duration_label_uk}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'duration_label_uk',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Czas trwania, pl.
                      </span>

                      <input
                        type="text"
                        value={packageItem.duration_label_pl}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'duration_label_pl',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Кнопка, укр.
                      </span>

                      <input
                        type="text"
                        value={packageItem.button_label_uk}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'button_label_uk',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Przycisk, pl.
                      </span>

                      <input
                        type="text"
                        value={packageItem.button_label_pl}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'button_label_pl',
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                        Описание, укр.
                      </span>

                      <textarea
                        value={packageItem.description_uk}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
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
                        value={packageItem.description_pl}
                        onChange={(event) =>
                          handlePackageInputChange(
                            packageItem.id,
                            'description_pl',
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
                    onClick={() => handleSavePackage(packageItem)}
                    disabled={savingPackageId === packageItem.id}
                    className="mt-5 w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingPackageId === packageItem.id
                      ? 'Сохраняем...'
                      : 'Сохранить пакет'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
  )
}
