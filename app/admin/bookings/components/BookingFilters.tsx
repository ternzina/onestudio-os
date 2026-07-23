'use client'

type BookingStatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled'
type BookingDateFilter = 'all' | 'today' | 'future' | 'past'
type BookingContactFilter = 'all' | 'not_contacted' | 'contacted'
type BookingKindFilter = 'all' | 'photo' | 'rental'

type FilterOption<Value extends string> = {
  value: Value
  label: string
}

type BookingFiltersProps = {
  isLoading: boolean
  query: string
  onQueryChange: (value: string) => void
  hasActiveFilters: boolean
  filteredBookingsCount: number
  onResetFilters: () => void
  onRefresh: () => void
  statusFilters: FilterOption<BookingStatusFilter>[]
  dateFilters: FilterOption<BookingDateFilter>[]
  contactFilters: FilterOption<BookingContactFilter>[]
  bookingKindFilters: FilterOption<BookingKindFilter>[]
  activeStatusFilter: BookingStatusFilter
  activeDateFilter: BookingDateFilter
  activeContactFilter: BookingContactFilter
  activeKindFilter: BookingKindFilter
  onStatusFilterChange: (value: BookingStatusFilter) => void
  onDateFilterChange: (value: BookingDateFilter) => void
  onContactFilterChange: (value: BookingContactFilter) => void
  onKindFilterChange: (value: BookingKindFilter) => void
  getStatusFilterCount: (value: BookingStatusFilter) => number
  getDateFilterCount: (value: BookingDateFilter) => number
  getContactFilterCount: (value: BookingContactFilter) => number
  getBookingKindFilterCount: (value: BookingKindFilter) => number
}

const filterButtonClass = (isActive: boolean) =>
  `rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
    isActive
      ? 'border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_12px_28px_rgba(43,26,18,0.16)]'
      : 'border-[#D8C4B3] bg-white/80 text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA]'
  }`

export default function BookingFilters({
  isLoading,
  query,
  onQueryChange,
  hasActiveFilters,
  filteredBookingsCount,
  onResetFilters,
  onRefresh,
  statusFilters,
  dateFilters,
  contactFilters,
  bookingKindFilters,
  activeStatusFilter,
  activeDateFilter,
  activeContactFilter,
  activeKindFilter,
  onStatusFilterChange,
  onDateFilterChange,
  onContactFilterChange,
  onKindFilterChange,
  getStatusFilterCount,
  getDateFilterCount,
  getContactFilterCount,
  getBookingKindFilterCount,
}: BookingFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
            Schedule
          </p>

          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            Брони студии
          </h2>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Обновляем...' : 'Обновить'}
        </button>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A67C52]">
          Тип брони
        </p>

        <div className="flex flex-wrap gap-2">
          {bookingKindFilters.map((filter) => {
            const isActive = activeKindFilter === filter.value

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onKindFilterChange(filter.value)}
                className={filterButtonClass(isActive)}
              >
                {filter.label} {getBookingKindFilterCount(filter.value)}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A67C52]">
          Фильтр по дате
        </p>

        <div className="flex flex-wrap gap-2">
          {dateFilters.map((filter) => {
            const isActive = activeDateFilter === filter.value

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onDateFilterChange(filter.value)}
                className={filterButtonClass(isActive)}
              >
                {filter.label} {getDateFilterCount(filter.value)}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A67C52]">
          Фильтр по статусу
        </p>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const isActive = activeStatusFilter === filter.value

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onStatusFilterChange(filter.value)}
                className={filterButtonClass(isActive)}
              >
                {filter.label} {getStatusFilterCount(filter.value)}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A67C52]">
          Фильтр по связи
        </p>

        <div className="flex flex-wrap gap-2">
          {contactFilters.map((filter) => {
            const isActive = activeContactFilter === filter.value

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onContactFilterChange(filter.value)}
                className={filterButtonClass(isActive)}
              >
                {filter.label} {getContactFilterCount(filter.value)}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#A67C52]">
          Поиск клиента
        </p>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Имя, телефон или email"
            className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-sm text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20 lg:max-w-md"
          />

          {query.trim() && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
            >
              Очистить поиск
            </button>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="w-fit rounded-full border border-[#2B1A12] bg-[#2B1A12] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_12px_28px_rgba(43,26,18,0.16)] transition hover:bg-[#4A2D1E]"
            >
              Сбросить фильтры
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <p className="mt-2 text-sm text-[#7A6252]">
            Показано заявок: {filteredBookingsCount}
          </p>
        )}
      </div>
    </div>
  )
}
