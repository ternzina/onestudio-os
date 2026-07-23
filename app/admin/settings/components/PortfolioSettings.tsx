'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type PortfolioCategory = {
  id: string
  name_uk: string
  name_pl: string
  slug: string
  is_active: boolean
  sort_order: number
}

type CategoryLink = {
  id: string
  category_id: string
  media_id: string
  is_active: boolean
  sort_order: number
}

type MediaLibraryItem = {
  id: string
  is_active: boolean
  is_favorite: boolean
}

export default function PortfolioSettings() {
  const [categories, setCategories] = useState<PortfolioCategory[]>([])
  const [categoryLinks, setCategoryLinks] = useState<CategoryLink[]>([])
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadPortfolioOverview = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    const [categoriesResult, linksResult, mediaResult] = await Promise.all([
      supabase
        .from('portfolio_categories')
        .select('id, name_uk, name_pl, slug, is_active, sort_order')
        .order('sort_order', { ascending: true })
        .order('name_uk', { ascending: true }),
      supabase
        .from('portfolio_category_images')
        .select('id, category_id, media_id, is_active, sort_order')
        .order('sort_order', { ascending: true }),
      supabase
        .from('media_library')
        .select('id, is_active, is_favorite'),
    ])

    if (categoriesResult.error) {
      setErrorMessage(categoriesResult.error.message)
      setIsLoading(false)
      return
    }

    if (linksResult.error) {
      setErrorMessage(linksResult.error.message)
      setIsLoading(false)
      return
    }

    if (mediaResult.error) {
      setErrorMessage(mediaResult.error.message)
      setIsLoading(false)
      return
    }

    setCategories((categoriesResult.data || []) as PortfolioCategory[])
    setCategoryLinks((linksResult.data || []) as CategoryLink[])
    setMediaItems((mediaResult.data || []) as MediaLibraryItem[])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadPortfolioOverview()
  }, [loadPortfolioOverview])

  const mediaMap = useMemo(() => {
    return new Map(mediaItems.map((item) => [item.id, item]))
  }, [mediaItems])

  const totalPortfolioImages = useMemo(() => {
    return new Set(categoryLinks.map((link) => link.media_id)).size
  }, [categoryLinks])

  const visiblePortfolioImages = useMemo(() => {
    const visibleIds = new Set(
      categoryLinks
        .filter((link) => {
          const media = mediaMap.get(link.media_id)
          return link.is_active && media?.is_active
        })
        .map((link) => link.media_id)
    )

    return visibleIds.size
  }, [categoryLinks, mediaMap])

  const getCategoryStats = (categoryId: string) => {
    const links = categoryLinks.filter((link) => link.category_id === categoryId)
    const visibleLinks = links.filter((link) => {
      const media = mediaMap.get(link.media_id)
      return link.is_active && media?.is_active
    })

    return {
      total: links.length,
      visible: visibleLinks.length,
    }
  }

  return (
    <motion.div
      id="portfolio"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.151, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
            Portfolio
          </p>

          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            Портфолио сайта
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">
            Фото больше не загружаются здесь. Портфолио управляется через медиатеку:
            там загружаем изображения, раскладываем их по категориям и меняем порядок
            показа на сайте.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadPortfolioOverview}
            disabled={isLoading}
            className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Обновляем...' : 'Обновить'}
          </button>

          <Link
            href="/admin/media"
            className="w-fit rounded-full bg-[#2B1A12] px-5 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E]"
          >
            Открыть медиатеку
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
            Категории
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#2B1A12]">
            {categories.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#7A6252]">
            Направления портфолио: дети, портрет, семья и другие папки.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
            Фото в портфолио
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#2B1A12]">
            {totalPortfolioImages}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#7A6252]">
            Уникальные фото, добавленные хотя бы в одну категорию.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
            Видимые фото
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#2B1A12]">
            {visiblePortfolioImages}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#7A6252]">
            Фото, которые не скрыты в медиатеке и категории.
          </p>
        </div>
      </div>

      <div className="mt-7 rounded-[28px] border border-[#E5D5C8] bg-[#F7F1EA]/70 p-5">
        <p className="text-sm font-semibold text-[#2B1A12]">
          Как теперь управлять портфолио
        </p>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-[#7A6252] md:grid-cols-3">
          <div className="rounded-2xl bg-white/70 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
              1. Загрузка
            </span>
            Загружайте фото только в медиатеке.
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
              2. Категории
            </span>
            Отмечайте, в какие категории должно попасть фото.
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
              3. Порядок
            </span>
            Выберите категорию и нажмите «Управлять порядком».
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-6 rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
          Загружаем состояние портфолио...
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="mt-6 rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
          <p className="text-lg font-medium text-[#2B1A12]">
            Категорий портфолио пока нет
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
            Категории создаются в медиатеке. После этого здесь появится быстрый
            переход к управлению каждой категорией.
          </p>
        </div>
      )}

      {!isLoading && categories.length > 0 && (
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {categories.map((category) => {
            const stats = getCategoryStats(category.id)

            return (
              <div
                key={category.id}
                className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5 shadow-[0_14px_40px_rgba(83,54,37,0.08)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        Категория
                      </p>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          category.is_active
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252]'
                        }`}
                      >
                        {category.is_active ? 'Активна' : 'Скрыта'}
                      </span>
                    </div>

                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                      {category.name_uk || category.name_pl || category.slug}
                    </h3>

                    {category.name_pl && (
                      <p className="mt-1 text-sm text-[#7A6252]">
                        {category.name_pl}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/admin/media?category=${category.id}`}
                    className="w-fit rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E]"
                  >
                    Управлять
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#A67C52]">
                      Всего фото
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                      {stats.total}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#A67C52]">
                      Видимых
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                      {stats.visible}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
