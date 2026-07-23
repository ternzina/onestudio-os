'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import AdminHeader from '@/components/admin/AdminHeader'
import ContactSettings from './components/ContactSettings'
import HomeContentSettings from './components/HomeContentSettings'
import HomeCarouselSettings from './components/HomeCarouselSettings'
import PhotoshootsSettings from './components/PhotoshootsSettings'
import RentalContentSettings from './components/RentalContentSettings'
import PackagesSettings from './components/PackagesSettings'
import InteriorsSettings from './components/InteriorsSettings'
import GlobalSettings from './components/GlobalSettings'
import TeamSettings from './components/TeamSettings'
import TestimonialsSettings from './components/TestimonialsSettings'
import PortfolioSettings from './components/PortfolioSettings'
import LearningSettings from './components/LearningSettings'
import BookingSettings from './components/BookingSettings'
import ConstructorSettings from './components/ConstructorSettings'

const settingsSections = [
  { id: 'contacts', label: 'Контакты' },
  { id: 'home', label: 'Главная' },
  { id: 'photoshoots', label: 'Фотосесії' },
  { id: 'rental', label: 'Аренда' },
  { id: 'booking', label: 'Бронирование' },
  { id: 'packages', label: 'Пакеты' },
  { id: 'constructor', label: 'Конструктор' },
  { id: 'interiors', label: 'Интерьеры' },
  { id: 'global', label: 'Общие' },
  { id: 'team', label: 'Команда' },
  { id: 'testimonials', label: 'Отзывы' },
  { id: 'learning', label: 'Навчання' },
  { id: 'portfolio', label: 'Портфолио' },
]

export default function AdminSettingsPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const checkAdminAccess = useCallback(async () => {
    setIsChecking(true)
    setErrorMessage('')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      router.replace('/login')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      setErrorMessage(profileError.message)
      setIsChecking(false)
      return
    }

    if (profile?.role !== 'admin') {
      router.replace('/dashboard')
      return
    }

    setIsChecking(false)
  }, [router])

  useEffect(() => {
    checkAdminAccess()
  }, [checkAdminAccess])

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1EA] text-[#2B1A12]">
        <div className="text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#A67C52]">
            Sister&apos;s Photo Studio
          </p>
          <p className="text-sm text-[#7A6252]">Проверяем доступ...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F1EA] px-5 py-28 text-[#2B1A12]">
      <AdminHeader />

      <section className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 overflow-hidden rounded-[42px] border border-[#E5D5C8] bg-[#2B1A12] p-7 text-[#F7F1EA] shadow-[0_28px_90px_rgba(43,26,18,0.22)] sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[#D9B98F]">
                Website settings
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                Настройки сайта
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#E8D8CC] sm:text-base">
                Контакты, главная, фотосессии, аренда, обучение, пакеты,
                интерьеры, соцсети, команда, отзывы и портфолио живут отдельными
                аккуратными модулями.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-[#D9B98F]">
                Готово
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                12
              </p>
              <p className="mt-2 text-sm leading-6 text-[#E8D8CC]">
                модулей настроек вместо одного гигантского файла
              </p>
            </div>
          </div>
        </motion.div>

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="group rounded-[28px] border border-[#E5D5C8] bg-white/75 p-5 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)]"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F1EA] text-2xl text-[#2B1A12]">
              🏠
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
              Admin
            </span>
            <span className="mt-2 block text-xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
              Центр управления
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/bookings')}
            className="group rounded-[28px] border border-[#E5D5C8] bg-white/75 p-5 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)]"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F1EA] text-2xl text-[#2B1A12]">
              📅
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
              CRM
            </span>
            <span className="mt-2 block text-xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
              Брони
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/media')}
            className="group rounded-[28px] border border-[#E5D5C8] bg-white/75 p-5 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)]"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F1EA] text-2xl text-[#2B1A12]">
              🖼️
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
              Media
            </span>
            <span className="mt-2 block text-xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
              Медиатека
            </span>
          </button>
        </div>

        <div className="sticky top-[104px] z-40 mb-8 mt-8 rounded-[26px] border border-[#E5D5C8] bg-[#FFFDFB]/92 p-2 shadow-[0_18px_60px_rgba(83,54,37,0.12)] backdrop-blur-xl">
          <nav
            className="flex max-w-full gap-2 overflow-x-auto"
            aria-label="Разделы настроек сайта"
          >
            {settingsSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  document.getElementById(section.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}
                className="shrink-0 rounded-full border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A6252] transition hover:border-[#D8C4B3] hover:bg-[#F7F1EA] hover:text-[#2B1A12]"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>

        <section id="contacts" className="scroll-mt-44"><ContactSettings /></section>
        <section id="home" className="scroll-mt-44">
          <HomeContentSettings />
          <HomeCarouselSettings />
        </section>
        <section id="photoshoots" className="scroll-mt-44"><PhotoshootsSettings /></section>
        <section id="rental" className="scroll-mt-44"><RentalContentSettings /></section>
        <section id="booking" className="scroll-mt-44"><BookingSettings /></section>
        <section id="packages" className="scroll-mt-44"><PackagesSettings /></section>
        <section id="constructor" className="scroll-mt-44"><ConstructorSettings /></section>
        <section id="interiors" className="scroll-mt-44"><InteriorsSettings /></section>
        <section id="global" className="scroll-mt-44"><GlobalSettings /></section>
        <section id="team" className="scroll-mt-44"><TeamSettings /></section>
        <section id="testimonials" className="scroll-mt-44"><TestimonialsSettings /></section>
        <section id="learning" className="scroll-mt-44"><LearningSettings /></section>
        <section id="portfolio" className="scroll-mt-44"><PortfolioSettings /></section>
      </section>
    </main>
  )
}
