'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  {
    href: '/admin',
    label: 'Studio OS',
    description: 'Главная',
  },
  {
    href: '/admin/bookings',
    label: 'Брони',
    description: 'Фотосессии и аренда',
  },
  {
    href: '/admin/payments',
    label: 'Оплата',
    description: 'Stripe и статусы',
  },
  {
    href: '/admin/analytics',
    label: 'Аналитика',
    description: 'Выручка и загрузка',
  },
  {
    href: '/admin/media',
    label: 'Медиатека',
    description: 'Фото и R2',
  },
  {
    href: '/admin/settings',
    label: 'Настройки',
    description: 'Контент сайта',
  },
]

export default function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const getIsActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }

    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[9999] px-4 pt-4">
      <div className="mx-auto w-full rounded-[28px] border border-[#E5D5C8] bg-white/92 px-4 py-3 shadow-[0_18px_60px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/admin" className="group flex w-fit items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B1A12] text-sm font-semibold text-[#F7F1EA] shadow-[0_12px_28px_rgba(43,26,18,0.18)]">
              OS
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#2B1A12]">
                Studio OS
              </span>
              <span className="mt-0.5 block text-xs text-[#7A6252]">
                Sister&apos;s Photo Studio
              </span>
            </span>
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex max-w-full gap-2 overflow-x-auto rounded-full bg-[#F7F1EA]/80 p-1">
              {navItems.map((item) => {
                const isActive = getIsActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-full px-4 py-2 text-left transition ${
                      isActive
                        ? 'bg-[#2B1A12] text-[#F7F1EA] shadow-[0_10px_26px_rgba(43,26,18,0.18)]'
                        : 'text-[#7A6252] hover:bg-white hover:text-[#2B1A12]'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]">
                      {item.label}
                    </span>
                    <span
                      className={`hidden text-[11px] sm:block ${
                        isActive ? 'text-[#E8D8CC]' : 'text-[#9A8170]'
                      }`}
                    >
                      {item.description}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="flex gap-2">
              <Link
                href="/"
                className="rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
              >
                Сайт
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
