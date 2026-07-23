'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.replace('/login')
  }

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
    <div className="min-h-screen bg-[#F7F1EA] text-[#2B1A12]">
      <AdminSidebar />

      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 lg:left-[290px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#E5D5C8] bg-white/82 px-4 py-3 shadow-[0_18px_60px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:px-5">
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2B1A12]"
          >
            Studio Admin
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#F7F1EA] hover:text-[#2B1A12] sm:inline-flex"
            >
              Сайт
            </Link>

            <Link
              href="/portfolio"
              target="_blank"
              className="hidden rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#F7F1EA] hover:text-[#2B1A12] sm:inline-flex"
            >
              Портфоліо
            </Link>

            <Link
              href="/dashboard"
              className="hidden rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#F7F1EA] hover:text-[#2B1A12] md:inline-flex"
            >
              Кабинет
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#2B1A12] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? 'Выход...' : 'Logout'}
            </button>
          </nav>
        </div>
      </header>

      <div className="lg:pl-[290px]">{children}</div>
    </div>
  )
}
