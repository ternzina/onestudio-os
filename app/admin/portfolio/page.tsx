'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import AdminHeader from '@/components/admin/AdminHeader'
import PortfolioSettings from '../settings/components/PortfolioSettings'
import PortfolioProjectsManager from './PortfolioProjectsManager'

export default function AdminPortfolioPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error || profile?.role !== 'admin') {
        router.replace('/dashboard')
        return
      }

      setIsChecking(false)
    }

    checkAccess()
  }, [router])

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1EA] text-[#2B1A12]">
        <p className="text-sm text-[#7A6252]">Проверяем доступ...</p>
      </main>
    )
  }

  return (
    <>
      <AdminHeader />

      <main className="min-h-screen bg-[#F7F1EA] px-5 pb-24 pt-36 text-[#2B1A12]">
        <section className="mx-auto w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8 overflow-hidden rounded-[42px] border border-[#E5D5C8] bg-[#2B1A12] p-7 text-[#F7F1EA] shadow-[0_28px_90px_rgba(43,26,18,0.22)] sm:p-10"
          >
            <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#D9B98F]">
                  Portfolio
                </p>

                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                  Портфолио сайта
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#E8D8CC] sm:text-base">
                  Здесь собран вход в управление портфолио: категории, порядок фото и видимость снимков на сайте.
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-[30px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:flex-row lg:justify-end">
                <Link
                  href="/admin/media"
                  className="rounded-full bg-[#F7F1EA] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#2B1A12] transition hover:bg-white"
                >
                  Открыть медиатеку
                </Link>

                <Link
                  href="/admin/settings"
                  className="rounded-full border border-white/20 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F1EA] transition hover:bg-white/10"
                >
                  Настройки сайта
                </Link>
              </div>
            </div>
          </motion.div>

          <PortfolioProjectsManager />

          <div className="mt-8">
            <PortfolioSettings />
          </div>
        </section>
      </main>
    </>
  )
}
