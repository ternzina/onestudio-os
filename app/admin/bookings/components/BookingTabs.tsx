'use client'

type AdminPanelSection = 'bookings' | 'settings'

type BookingTabsProps = {
  activeSection: AdminPanelSection
  onSectionChange: (section: AdminPanelSection) => void
  onOpenMedia: () => void
}

export default function BookingTabs({
  activeSection,
  onSectionChange,
  onOpenMedia,
}: BookingTabsProps) {
  return (
<div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <button
    type="button"
    onClick={onOpenMedia}
    className="group rounded-[32px] border border-[#E5D5C8] bg-white/75 p-6 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)]"
  >
    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2B1A12] text-2xl text-[#F7F1EA]">
      📷
    </span>
    <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
      Media Library
    </span>
    <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
      Медиатека
    </span>
    <span className="mt-3 block text-sm leading-6 text-[#7A6252]">
      Загрузка фото, Cloudflare R2, категории, избранное, скрытие и удаление.
    </span>
    <span className="mt-5 inline-flex text-sm font-semibold text-[#2B1A12]">
      Открыть медиатеку →
    </span>
  </button>

  <button
    type="button"
    onClick={() => onSectionChange('bookings')}
    className={`group rounded-[32px] border p-6 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)] ${
      activeSection === 'bookings'
        ? 'border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA]'
        : 'border-[#E5D5C8] bg-white/75 text-[#2B1A12] hover:bg-white'
    }`}
  >
    <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
      activeSection === 'bookings'
        ? 'bg-white/12 text-[#F7F1EA]'
        : 'bg-[#F7F1EA] text-[#2B1A12]'
    }`}>
      📅
    </span>
    <span className={`block text-xs font-semibold uppercase tracking-[0.22em] ${
      activeSection === 'bookings' ? 'text-[#D9B98F]' : 'text-[#A67C52]'
    }`}>
      CRM
    </span>
    <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em]">
      Брони
    </span>
    <span className={`mt-3 block text-sm leading-6 ${
      activeSection === 'bookings' ? 'text-[#E8D8CC]' : 'text-[#7A6252]'
    }`}>
      Фотосессии, аренда студии, статусы, фильтры и контакт с клиентом.
    </span>
    <span className="mt-5 inline-flex text-sm font-semibold">
      Показать брони →
    </span>
  </button>

  <button
    type="button"
    onClick={() => onSectionChange('settings')}
    className={`group rounded-[32px] border p-6 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)] ${
      activeSection === 'settings'
        ? 'border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA]'
        : 'border-[#E5D5C8] bg-white/75 text-[#2B1A12] hover:bg-white'
    }`}
  >
    <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
      activeSection === 'settings'
        ? 'bg-white/12 text-[#F7F1EA]'
        : 'bg-[#F7F1EA] text-[#2B1A12]'
    }`}>
      ⚙️
    </span>
    <span className={`block text-xs font-semibold uppercase tracking-[0.22em] ${
      activeSection === 'settings' ? 'text-[#D9B98F]' : 'text-[#A67C52]'
    }`}>
      Website
    </span>
    <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em]">
      Настройки сайта
    </span>
    <span className={`mt-3 block text-sm leading-6 ${
      activeSection === 'settings' ? 'text-[#E8D8CC]' : 'text-[#7A6252]'
    }`}>
      Контакты, тексты, пакеты, интерьеры, команда, отзывы и портфолио.
    </span>
    <span className="mt-5 inline-flex text-sm font-semibold">
      Редактировать →
    </span>
  </button>

  <button
    type="button"
    onClick={onOpenMedia}
    className="group rounded-[32px] border border-[#E5D5C8] bg-white/75 p-6 text-left shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_80px_rgba(83,54,37,0.16)]"
  >
    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F1EA] text-2xl text-[#2B1A12]">
      🖼️
    </span>
    <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
      Portfolio
    </span>
    <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
      Портфолио
    </span>
    <span className="mt-3 block text-sm leading-6 text-[#7A6252]">
      Теперь портфолио управляется через медиатеку, категории и порядок фото.
    </span>
    <span className="mt-5 inline-flex text-sm font-semibold text-[#2B1A12]">
      Управлять фото →
    </span>
  </button>
</div>
  )
}
