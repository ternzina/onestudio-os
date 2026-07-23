'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BUILDER_PAGES } from '@/lib/page-builder';

export default function BuilderHomePage() {
  return (
    <main className="min-h-screen px-5 pb-24 pt-32 text-[#2B1A12] sm:px-8">
      <section className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[42px] bg-[#2B1A12] p-7 text-[#F7F1EA] shadow-[0_28px_90px_rgba(43,26,18,0.22)] sm:p-10"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#D9B98F]">Studio OS Builder v1.0</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Конструктор страниц</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#E8D8CC] sm:text-base">
            Добавляйте независимые блоки к существующим страницам. Текущий дизайн сайта остаётся нетронутым, а новые блоки хранятся отдельно в Supabase.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {BUILDER_PAGES.map((page) => (
            <Link
              key={page.slug}
              href={`/admin/builder/${page.slug}`}
              className="group rounded-[30px] border border-[#E5D5C8] bg-white/80 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2B1A12] text-2xl text-white">{page.icon}</span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#A67C52]">{page.path}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{page.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#7A6252]">Открыть блоки страницы →</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
