"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminHeader from "@/components/admin/AdminHeader";

const modules = [
  {
    title: "Медиатека",
    label: "Media Library",
    icon: "📷",
    description:
      "Загрузка фото, Cloudflare R2, категории, избранное, скрытие и удаление.",
    href: "/admin/media",
    action: "Открыть медиатеку →",
  },
  {
    title: "Брони",
    label: "CRM",
    icon: "📅",
    description:
      "Фотосессии, аренда студии, статусы, фильтры и контакт с клиентом.",
    href: "/admin/bookings",
    action: "Открыть брони →",
  },
  {
    title: "Оплата",
    label: "Stripe",
    icon: "💳",
    description:
      "Оплаченные брони, ожидающие платежи, предоплаты и история операций.",
    href: "/admin/payments",
    action: "Открыть оплату →",
  },
  {
    title: "Аналитика",
    label: "Business",
    icon: "📊",
    description:
      "Выручка, средний чек, бронирования, часы аренды и ближайшая загрузка.",
    href: "/admin/analytics",
    action: "Открыть аналитику →",
  },
  {
    title: "Настройки сайта",
    label: "Website",
    icon: "⚙️",
    description:
      "Контакты, тексты, пакеты, интерьеры, команда, отзывы и портфолио.",
    href: "/admin/settings",
    action: "Редактировать →",
  },
  {
    title: "Портфолио",
    label: "Portfolio",
    icon: "🖼️",
    description:
      "Вход в управление портфолио: категории, выбранные фото и порядок показа.",
    href: "/admin/portfolio",
    action: "Открыть портфолио →",
  },
];

export default function AdminPage() {
  const router = useRouter();

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen bg-[#F7F1EA] px-5 pb-24 pt-36 text-[#2B1A12]">
        <section className="mx-auto w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 overflow-hidden rounded-[42px] border border-[#E5D5C8] bg-[#2B1A12] p-7 text-[#F7F1EA] shadow-[0_28px_90px_rgba(43,26,18,0.22)] sm:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[#D9B98F]">
                  Sisters Studio OS
                </p>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                  Центр управления студией
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#E8D8CC] sm:text-base">
                  Брони, медиатека, сайт, пакеты, команда, отзывы и портфолио теперь разнесены по разделам. Главная админка стала чистой дверью в Studio OS.
                </p>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-[#D9B98F]">
                  Архитектура
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
                  Легче. Чище. Без комбайна.
                </p>
                <p className="mt-3 text-sm leading-6 text-[#E8D8CC]">
                  Тяжёлые функции живут на отдельных страницах, а здесь остаётся навигационный центр.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <button
                key={module.title}
                type="button"
                onClick={() => router.push(module.href)}
                className="group rounded-[32px] border border-[#E5D5C8] bg-white/75 p-6 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)]"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2B1A12] text-2xl text-[#F7F1EA]">
                  {module.icon}
                </span>
                <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
                  {module.label}
                </span>
                <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                  {module.title}
                </span>
                <span className="mt-3 block text-sm leading-6 text-[#7A6252]">
                  {module.description}
                </span>
                <span className="mt-5 inline-flex text-sm font-semibold text-[#2B1A12]">
                  {module.action}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
