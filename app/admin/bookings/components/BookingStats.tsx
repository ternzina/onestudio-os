type BookingStatsProps = {
  totalCount: number
  todayCount: number
  futureCount: number
  contactedCount: number
  notContactedCount: number
  photoBookingsCount: number
  rentalBookingsCount: number
}

const statCards = [
  {
    key: "totalCount",
    label: "Всего заявок",
    className: "bg-white/70",
  },
  {
    key: "todayCount",
    label: "Сегодня",
    className: "bg-white/70",
  },
  {
    key: "futureCount",
    label: "Будущие",
    className: "bg-white/70",
  },
  {
    key: "contactedCount",
    label: "Связались",
    className: "bg-white/70",
  },
  {
    key: "notContactedCount",
    label: "Не связались",
    className: "bg-white/70",
  },
  {
    key: "photoBookingsCount",
    label: "Фотосессии",
    className: "bg-[#F4E8FF]/70",
  },
  {
    key: "rentalBookingsCount",
    label: "Аренда",
    className: "bg-[#FFF1E3]/70",
  },
] as const

export default function BookingStats({
  totalCount,
  todayCount,
  futureCount,
  contactedCount,
  notContactedCount,
  photoBookingsCount,
  rentalBookingsCount,
}: BookingStatsProps) {
  const values = {
    totalCount,
    todayCount,
    futureCount,
    contactedCount,
    notContactedCount,
    photoBookingsCount,
    rentalBookingsCount,
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-7">
      {statCards.map((card) => (
        <div
          key={card.key}
          className={`rounded-[28px] border border-[#E5D5C8] ${card.className} p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl`}
        >
          <p className="text-sm text-[#7A6252]">{card.label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
            {values[card.key]}
          </p>
        </div>
      ))}
    </div>
  )
}
