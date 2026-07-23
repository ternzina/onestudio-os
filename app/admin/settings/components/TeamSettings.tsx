'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import SiteImagePicker from './SiteImagePicker'

type EditableTeamMember = {
  id: string
  name: string
  position: string
  bio_uk: string
  bio_pl: string
  image_url: string
  instagram_url: string
  is_active: boolean
  sort_order: number
}

export default function TeamSettings() {
  const [editableTeam, setEditableTeam] = useState<EditableTeamMember[]>([])
  const [isTeamLoading, setIsTeamLoading] = useState(true)
  const [savingTeamMemberId, setSavingTeamMemberId] = useState<string | null>(
    null
  )
  const [teamSaveMessage, setTeamSaveMessage] = useState('')
  const [teamErrorMessage, setTeamErrorMessage] = useState('')

  const loadEditableTeam = useCallback(async () => {
    setIsTeamLoading(true)
    setTeamErrorMessage('')

    const { data, error } = await supabase
      .from('team')
      .select(
        'id, name, position, bio_uk, bio_pl, image_url, instagram_url, is_active, sort_order'
      )
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      setTeamErrorMessage(error.message)
      setIsTeamLoading(false)
      return
    }

    const normalizedTeam: EditableTeamMember[] = (data || []).map(
      (member) => ({
        id: String(member.id),
        name: member.name || '',
        position: member.position || '',
        bio_uk: member.bio_uk || '',
        bio_pl: member.bio_pl || '',
        image_url: member.image_url || '',
        instagram_url: member.instagram_url || '',
        is_active: Boolean(member.is_active),
        sort_order: Number(member.sort_order || 0),
      })
    )

    setEditableTeam(normalizedTeam)
    setIsTeamLoading(false)
  }, [])

  useEffect(() => {
    loadEditableTeam()
  }, [loadEditableTeam])

  const handleTeamInputChange = <Field extends keyof EditableTeamMember>(
    memberId: string,
    field: Field,
    value: EditableTeamMember[Field]
  ) => {
    setEditableTeam((currentTeam) =>
      currentTeam.map((member) =>
        member.id === memberId
          ? {
              ...member,
              [field]: value,
            }
          : member
      )
    )

    setTeamSaveMessage('')
    setTeamErrorMessage('')
  }

  const saveTeamImage = async (memberId: string, url: string) => {
    setTeamSaveMessage('')
    setTeamErrorMessage('')

    const { error } = await supabase
      .from('team')
      .update({
        image_url: url.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (error) {
      setTeamErrorMessage(error.message)
      throw new Error(`Фото не сохранилось: ${error.message}`)
    }

    setTeamSaveMessage('Фото человека сохранено автоматически')
  }

  const handleSaveTeamMember = async (member: EditableTeamMember) => {
    setSavingTeamMemberId(member.id)
    setTeamSaveMessage('')
    setTeamErrorMessage('')

    const cleanMember = {
      name: member.name.trim(),
      position: member.position.trim(),
      bio_uk: member.bio_uk.trim(),
      bio_pl: member.bio_pl.trim(),
      image_url: member.image_url.trim(),
      instagram_url: member.instagram_url.trim(),
      is_active: member.is_active,
      sort_order: Number(member.sort_order || 0),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('team')
      .update(cleanMember)
      .eq('id', member.id)

    if (error) {
      setTeamErrorMessage(error.message)
      setSavingTeamMemberId(null)
      return
    }

    setEditableTeam((currentTeam) =>
      currentTeam.map((item) =>
        item.id === member.id ? { ...item, ...cleanMember } : item
      )
    )
    setTeamSaveMessage(`Человек «${cleanMember.name}» сохранён`)
    setSavingTeamMemberId(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.147, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
            Team
          </p>

          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            Команда
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Имена, должности, описания, фото и Instagram членов команды.
            Пока редактируем существующие записи из таблицы team.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEditableTeam}
          disabled={isTeamLoading || Boolean(savingTeamMemberId)}
          className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isTeamLoading ? 'Загружаем...' : 'Обновить команду'}
        </button>
      </div>

      {teamErrorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {teamErrorMessage}
        </div>
      )}

      {teamSaveMessage && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
          {teamSaveMessage}
        </div>
      )}

      {isTeamLoading && (
        <div className="mt-6 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
          Загружаем команду...
        </div>
      )}

      {!isTeamLoading && editableTeam.length === 0 && (
        <div className="mt-6 rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
          <p className="text-lg font-medium text-[#2B1A12]">
            Команда пока пустая
          </p>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
            Когда в таблице team появятся люди, их можно будет
            редактировать здесь.
          </p>
        </div>
      )}

      {!isTeamLoading && editableTeam.length > 0 && (
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {editableTeam.map((member) => (
            <div
              key={member.id}
              className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5 shadow-[0_14px_40px_rgba(83,54,37,0.08)]"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    Член команды
                  </p>

                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#2B1A12]">
                    {member.name || 'Без имени'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleTeamInputChange(
                      member.id,
                      'is_active',
                      !member.is_active
                    )
                  }
                  className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
                    member.is_active
                      ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
                      : 'border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA]'
                  }`}
                >
                  {member.is_active ? 'Активен' : 'Скрыт'}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Имя
                  </span>

                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) =>
                      handleTeamInputChange(member.id, 'name', event.target.value)
                    }
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Должность
                  </span>

                  <input
                    type="text"
                    value={member.position}
                    onChange={(event) =>
                      handleTeamInputChange(
                        member.id,
                        'position',
                        event.target.value
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
                    value={member.sort_order}
                    onChange={(event) =>
                      handleTeamInputChange(
                        member.id,
                        'sort_order',
                        Number(event.target.value || 0)
                      )
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
                    value={member.instagram_url}
                    onChange={(event) =>
                      handleTeamInputChange(
                        member.id,
                        'instagram_url',
                        event.target.value
                      )
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>
                <div className="sm:col-span-2">
                  <SiteImagePicker
                    label="Фото человека"
                    value={member.image_url}
                    onChange={(url) =>
                      handleTeamInputChange(member.id, 'image_url', url)
                    }
                    onSave={(url) => saveTeamImage(member.id, url)}
                    folder="site/team"
                    previewClassName="aspect-[4/3]"
                  />
                </div>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#A67C52]">
                    Описание, укр.
                  </span>

                  <textarea
                    value={member.bio_uk}
                    onChange={(event) =>
                      handleTeamInputChange(member.id, 'bio_uk', event.target.value)
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
                    value={member.bio_pl}
                    onChange={(event) =>
                      handleTeamInputChange(member.id, 'bio_pl', event.target.value)
                    }
                    rows={3}
                    className="w-full resize-y rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm leading-6 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleSaveTeamMember(member)}
                disabled={savingTeamMemberId === member.id}
                className="mt-5 w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingTeamMemberId === member.id
                  ? 'Сохраняем...'
                  : 'Сохранить человека'}
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
