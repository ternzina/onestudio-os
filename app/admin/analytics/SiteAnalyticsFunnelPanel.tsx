"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAdminI18n,
} from "@/components/i18n/AdminI18nProvider";

import {
  supabase,
} from "@/lib/supabase";

type FunnelStages = {
  visits: number;
  cta_clicks: number;
  booking_started: number;
  form_submit: number;
  booking_completed: number;
  paid: number;
};

type FunnelData = {
  period: {
    start_date: string;
    end_date: string;
    timezone: string;
  };

  previous_period: {
    start_date: string;
    end_date: string;
    timezone: string;
  };

  current: FunnelStages;
  previous: FunnelStages;
};

function number(
  value: unknown,
) {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function normalizeStages(
  value: unknown,
): FunnelStages {
  const raw =
    value &&
    typeof value === "object"
      ? value as Partial<FunnelStages>
      : {};

  return {
    visits:
      number(raw.visits),

    cta_clicks:
      number(raw.cta_clicks),

    booking_started:
      number(raw.booking_started),

    form_submit:
      number(raw.form_submit),

    booking_completed:
      number(
        raw.booking_completed,
      ),

    paid:
      number(raw.paid),
  };
}

function normalize(
  value: unknown,
): FunnelData {
  const raw =
    value &&
    typeof value === "object"
      ? value as Partial<FunnelData>
      : {};

  return {
    period: {
      start_date:
        raw.period?.start_date ||
        "",

      end_date:
        raw.period?.end_date ||
        "",

      timezone:
        raw.period?.timezone ||
        "UTC",
    },

    previous_period: {
      start_date:
        raw.previous_period
          ?.start_date ||
        "",

      end_date:
        raw.previous_period
          ?.end_date ||
        "",

      timezone:
        raw.previous_period
          ?.timezone ||
        "UTC",
    },

    current:
      normalizeStages(
        raw.current,
      ),

    previous:
      normalizeStages(
        raw.previous,
      ),
  };
}

function rate(
  value: number,
  base: number,
) {
  if (base <= 0) {
    return 0;
  }

  return Math.round(
    value /
    base *
    100,
  );
}

function countChange(
  current: number,
  previous: number,
  ru: boolean,
) {
  if (
    previous === 0 &&
    current === 0
  ) {
    return "0%";
  }

  if (previous === 0) {
    return ru
      ? "новые"
      : "new";
  }

  const change =
    Math.round(
      (
        (
          current -
          previous
        ) /
        previous
      ) *
      100,
    );

  return `${
    change > 0
      ? "+"
      : ""
  }${change}%`;
}

function pointChange(
  current: number,
  previous: number,
  ru: boolean,
) {
  const difference =
    current -
    previous;

  return `${
    difference > 0
      ? "+"
      : ""
  }${difference}${
    ru
      ? " п.п."
      : " pp"
  }`;
}

export default function
SiteAnalyticsFunnelPanel({
  businessId,
  startDate,
  endDate,
}: {
  businessId: string;
  startDate: string;
  endDate: string;
}) {
  const { locale } =
    useAdminI18n();

  const ru =
    locale === "ru";

  const [data, setData] =
    useState<FunnelData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active =
      true;

    async function load() {
      setLoading(true);
      setError("");

      const result =
        await supabase.rpc(
          "get_admin_site_funnel_analytics",
          {
            p_business_id:
              businessId,

            p_start_date:
              startDate,

            p_end_date:
              endDate,
          },
        );

      if (!active) {
        return;
      }

      if (result.error) {
        setError(
          result.error.message,
        );

        setLoading(false);
        return;
      }

      setData(
        normalize(
          result.data,
        ),
      );

      setLoading(false);
    }

    void load();

    return () => {
      active =
        false;
    };
  }, [
    businessId,
    startDate,
    endDate,
  ]);

  const stages =
    useMemo(() => {
      if (!data) {
        return [];
      }

      return [
        {
          key:
            "visits",

          label:
            ru
              ? "Визиты"
              : "Visits",

          hint:
            ru
              ? "Пришли на сайт"
              : "Reached the site",
        },

        {
          key:
            "cta_clicks",

          label:
            ru
              ? "Клики записи"
              : "Booking clicks",

          hint:
            ru
              ? "Нажали перейти к записи"
              : "Clicked toward booking",
        },

        {
          key:
            "booking_started",

          label:
            ru
              ? "Открыли запись"
              : "Booking opened",

          hint:
            ru
              ? "Открыли форму бронирования"
              : "Opened the booking flow",
        },

        {
          key:
            "form_submit",

          label:
            ru
              ? "Отправили форму"
              : "Form submitted",

          hint:
            ru
              ? "Попытались создать бронь"
              : "Submitted booking details",
        },

        {
          key:
            "booking_completed",

          label:
            ru
              ? "Забронировали"
              : "Booked",

          hint:
            ru
              ? "Создана настоящая бронь"
              : "Canonical booking created",
        },

        {
          key:
            "paid",

          label:
            ru
              ? "Оплатили"
              : "Paid",

          hint:
            ru
              ? "Бронь сейчас оплачена"
              : "Canonical booking is paid",
        },
      ] as const;
    }, [
      data,
      ru,
    ]);

  if (loading) {
    return (
      <section className="rounded-[30px] border border-black/8 bg-white p-7 text-base text-[#6f6c65]">
        {ru
          ? "Загрузка воронки продаж…"
          : "Loading sales funnel…"}
      </section>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <section className="rounded-[30px] border border-red-900/10 bg-red-50 p-7 text-base text-red-800">
        {ru
          ? "Не удалось загрузить воронку."
          : "Sales funnel could not be loaded."}

        {error
          ? (
            <div className="mt-2 text-sm opacity-70">
              {error}
            </div>
          )
          : null}
      </section>
    );
  }

  const bookingRate =
    rate(
      data.current
        .booking_completed,
      data.current.visits,
    );

  const previousBookingRate =
    rate(
      data.previous
        .booking_completed,
      data.previous.visits,
    );

  const paidRate =
    rate(
      data.current.paid,
      data.current.visits,
    );

  const previousPaidRate =
    rate(
      data.previous.paid,
      data.previous.visits,
    );

  return (
    <section className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
            {ru
              ? "Воронка продаж"
              : "Sales funnel"}
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
            {ru
              ? "От визита до оплаты"
              : "From visit to payment"}
          </h2>
        </div>

        <p className="max-w-xl text-sm leading-6 text-[#77736a]">
          {ru
            ? `Сравнение с предыдущим периодом такой же длины: ${data.previous_period.start_date} → ${data.previous_period.end_date}.`
            : `Compared with the previous equal-length period: ${data.previous_period.start_date} → ${data.previous_period.end_date}.`}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-[24px] border border-[#9a742e]/16 bg-[#fffaf0] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9a742e]">
            {ru
              ? "Конверсия в бронь"
              : "Booking conversion"}
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-4xl font-semibold tracking-[-0.055em]">
              {bookingRate}%
            </p>

            <span className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-semibold text-[#706c64]">
              {pointChange(
                bookingRate,
                previousBookingRate,
                ru,
              )}
            </span>
          </div>
        </article>

        <article className="rounded-[24px] border border-[#9a742e]/16 bg-[#fffaf0] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9a742e]">
            {ru
              ? "Конверсия в оплату"
              : "Paid conversion"}
          </p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-4xl font-semibold tracking-[-0.055em]">
              {paidRate}%
            </p>

            <span className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-semibold text-[#706c64]">
              {pointChange(
                paidRate,
                previousPaidRate,
                ru,
              )}
            </span>
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stages.map(
          stage => {
            const current =
              data.current[
                stage.key
              ];

            const previous =
              data.previous[
                stage.key
              ];

            const percent =
              rate(
                current,
                data.current
                  .visits,
              );

            return (
              <article
                key={stage.key}
                className="rounded-[24px] border border-black/8 bg-[#faf8f3] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9a742e]">
                    {stage.label}
                  </p>

                  <span className="shrink-0 rounded-full border border-black/8 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#706c64]">
                    {countChange(
                      current,
                      previous,
                      ru,
                    )}
                  </span>
                </div>

                <p className="mt-4 text-4xl font-semibold tracking-[-0.055em]">
                  {current}
                </p>

                <p className="mt-2 min-h-10 text-sm leading-5 text-[#77736a]">
                  {stage.hint}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#d8b36a]"
                    style={{
                      width:
                        `${
                          Math.min(
                            100,
                            percent,
                          )
                        }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#77736a]">
                  {stage.key ===
                  "visits"
                    ? (
                      ru
                        ? "100% базы воронки"
                        : "100% funnel base"
                    )
                    : (
                      ru
                        ? `${percent}% от визитов`
                        : `${percent}% of visits`
                    )}
                </p>
              </article>
            );
          },
        )}
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <p className="rounded-2xl bg-[#f8f6f1] px-4 py-3 text-sm leading-6 text-[#6f6c65]">
          {ru
            ? "Этапы могут быть не строго убывающими: посетитель может открыть страницу бронирования напрямую, минуя кнопку на сайте."
            : "Stages do not have to decrease strictly: a visitor can open the booking page directly without clicking a site CTA."}
        </p>

        <p className="rounded-2xl bg-[#f8f6f1] px-4 py-3 text-sm leading-6 text-[#6f6c65]">
          {ru
            ? "«Оплатили» берётся из настоящего статуса бронирования OneStudio. Браузер не может сам объявить оплату успешной."
            : "Paid conversions come from OneStudio's canonical booking state. The browser cannot declare a payment successful."}
        </p>
      </div>
    </section>
  );
}
