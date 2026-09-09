"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAdminI18n,
} from "@/components/i18n/AdminI18nProvider";

import { supabase } from "@/lib/supabase";

type SiteSummary = {
  page_views: number;
  visits: number;
  pages_per_visit: number;
};

type DailyRow = {
  date: string;
  page_views: number;
  visits: number;
};

type PageRow = {
  path: string;
  page_views: number;
  visits: number;
};

type SourceRow = {
  source: string;
  medium: string;
  page_views: number;
  visits: number;
};

type DeviceRow = {
  device_class: string;
  page_views: number;
  visits: number;
};

type CountryRow = {
  country_code: string;
  page_views: number;
  visits: number;
};

type CityRow = {
  city: string;
  country_code: string;
  page_views: number;
  visits: number;
};

type SiteAnalytics = {
  summary: SiteSummary;
  daily: DailyRow[];
  pages: PageRow[];
  sources: SourceRow[];
  devices: DeviceRow[];
  countries: CountryRow[];
  cities: CityRow[];
};

function number(value: unknown) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function normalize(
  value: unknown,
): SiteAnalytics {
  const raw =
    value &&
    typeof value === "object"
      ? value as Partial<SiteAnalytics>
      : {};

  const summary =
    raw.summary ??
    {} as Partial<SiteSummary>;

  return {
    summary: {
      page_views:
        number(summary.page_views),

      visits:
        number(summary.visits),

      pages_per_visit:
        number(summary.pages_per_visit),
    },

    daily:
      Array.isArray(raw.daily)
        ? raw.daily.map(row => ({
            ...row,
            page_views:
              number(row.page_views),
            visits:
              number(row.visits),
          }))
        : [],

    pages:
      Array.isArray(raw.pages)
        ? raw.pages.map(row => ({
            ...row,
            page_views:
              number(row.page_views),
            visits:
              number(row.visits),
          }))
        : [],

    sources:
      Array.isArray(raw.sources)
        ? raw.sources.map(row => ({
            ...row,
            page_views:
              number(row.page_views),
            visits:
              number(row.visits),
          }))
        : [],

    devices:
      Array.isArray(raw.devices)
        ? raw.devices.map(row => ({
            ...row,
            page_views:
              number(row.page_views),
            visits:
              number(row.visits),
          }))
        : [],

    countries:
      Array.isArray(raw.countries)
        ? raw.countries.map(row => ({
            ...row,
            page_views:
              number(row.page_views),
            visits:
              number(row.visits),
          }))
        : [],

    cities:
      Array.isArray(raw.cities)
        ? raw.cities.map(row => ({
            ...row,
            page_views:
              number(row.page_views),
            visits:
              number(row.visits),
          }))
        : [],
  };
}

export default function SiteAnalyticsPanel({
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
    useState<SiteAnalytics | null>(
      null,
    );

  const [
    previousData,
    setPreviousData,
  ] =
    useState<SiteAnalytics | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const start =
        new Date(
          `${startDate}T12:00:00Z`,
        );

      const end =
        new Date(
          `${endDate}T12:00:00Z`,
        );

      const periodDays =
        Math.max(
          1,
          Math.round(
            (
              end.getTime() -
              start.getTime()
            ) /
            86_400_000,
          ) + 1,
        );

      const previousEnd =
        new Date(start);

      previousEnd.setUTCDate(
        previousEnd.getUTCDate() - 1,
      );

      const previousStart =
        new Date(previousEnd);

      previousStart.setUTCDate(
        previousStart.getUTCDate()
        - (periodDays - 1),
      );

      const previousStartDate =
        previousStart
          .toISOString()
          .slice(0, 10);

      const previousEndDate =
        previousEnd
          .toISOString()
          .slice(0, 10);

      const [
        result,
        previousResult,
      ] =
        await Promise.all([
          supabase.rpc(
            "get_admin_site_analytics",
            {
              p_business_id:
                businessId,

              p_start_date:
                startDate,

              p_end_date:
                endDate,
            },
          ),

          supabase.rpc(
            "get_admin_site_analytics",
            {
              p_business_id:
                businessId,

              p_start_date:
                previousStartDate,

              p_end_date:
                previousEndDate,
            },
          ),
        ]);

      if (!active) return;

      if (
        result.error ||
        previousResult.error
      ) {
        setError(
          result.error?.message ||
          previousResult.error?.message ||
          "site_analytics_compare_failed",
        );

        setLoading(false);
        return;
      }

      setData(
        normalize(result.data),
      );

      setPreviousData(
        normalize(
          previousResult.data,
        ),
      );

      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [
    businessId,
    startDate,
    endDate,
  ]);

  const maxViews =
    useMemo(
      () =>
        Math.max(
          1,
          ...(
            data?.daily.map(
              row =>
                row.page_views,
            ) ?? [1]
          ),
        ),
      [data],
    );

  const directShareFor =
    (
      analytics:
        SiteAnalytics | null,
    ) => {
      if (
        !analytics ||
        analytics.summary.visits <= 0
      ) {
        return 0;
      }

      const directVisits =
        analytics.sources
          .filter(
            row =>
              row.source ===
              "direct",
          )
          .reduce(
            (total, row) =>
              total +
              row.visits,
            0,
          );

      return Math.round(
        directVisits
        / analytics.summary.visits
        * 100,
      );
    };

  const directShare =
    directShareFor(data);

  const previousDirectShare =
    directShareFor(
      previousData,
    );

  const changeLabel =
    (
      current: number,
      previous: number,
    ) => {
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
    };

  const pointChangeLabel =
    (
      current: number,
      previous: number,
    ) => {
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
    };

  const deviceLabel =
    (value: string) => {
      if (value === "mobile") {
        return ru
          ? "Телефон"
          : "Mobile";
      }

      if (value === "tablet") {
        return ru
          ? "Планшет"
          : "Tablet";
      }

      if (value === "desktop") {
        return ru
          ? "Компьютер"
          : "Desktop";
      }

      return ru
        ? "Неизвестно"
        : "Unknown";
    };

  if (loading) {
    return (
      <section className="rounded-[30px] border border-black/8 bg-white p-7 text-base text-[#6f6c65]">
        {ru
          ? "Загрузка посещений сайта…"
          : "Loading website traffic…"}
      </section>
    );
  }

  if (
    error ||
    !data ||
    !previousData
  ) {
    return (
      <section className="rounded-[30px] border border-red-900/10 bg-red-50 p-7 text-base text-red-800">
        {ru
          ? "Не удалось загрузить статистику сайта."
          : "Website traffic could not be loaded."}

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

  const cards = [
    {
      label:
        ru
          ? "Просмотры страниц"
          : "Page views",

      value:
        String(
          data.summary.page_views,
        ),

      change:
        changeLabel(
          data.summary.page_views,
          previousData.summary
            .page_views,
        ),

      hint:
        ru
          ? "Все реальные загрузки страниц"
          : "All real page loads",
    },

    {
      label:
        ru
          ? "Визиты"
          : "Visits",

      value:
        String(
          data.summary.visits,
        ),

      change:
        changeLabel(
          data.summary.visits,
          previousData.summary
            .visits,
        ),

      hint:
        ru
          ? "Анонимные сессии"
          : "Anonymous sessions",
    },

    {
      label:
        ru
          ? "Страниц за визит"
          : "Pages per visit",

      value:
        data.summary
          .pages_per_visit
          .toFixed(2),

      change:
        changeLabel(
          data.summary
            .pages_per_visit,

          previousData.summary
            .pages_per_visit,
        ),

      hint:
        ru
          ? "Средняя глубина просмотра"
          : "Average browsing depth",
    },

    {
      label:
        ru
          ? "Прямой трафик"
          : "Direct traffic",

      value:
        `${directShare}%`,

      change:
        pointChangeLabel(
          directShare,
          previousDirectShare,
        ),

      hint:
        ru
          ? "Без внешнего источника"
          : "No external source",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-[#9a742e]/18 bg-[#fffaf0] p-6 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
              {ru
                ? "Трафик сайта"
                : "Website traffic"}
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
              {ru
                ? "Что происходит до бронирования"
                : "What happens before a booking"}
            </h2>
          </div>

          <p className="max-w-xl text-base leading-7 text-[#6f6c65]">
            {ru
              ? "Собственная аналитика OneStudio без cookies, email, имени и сохранения исходного IP."
              : "First-party OneStudio analytics without cookies, email, names or stored raw IP addresses."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          card => (
            <article
              key={card.label}
              className="rounded-[26px] border border-black/8 bg-white p-6 shadow-[0_16px_45px_rgba(20,20,20,0.055)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.13em] text-[#9a742e]">
                  {card.label}
                </p>

                <span className="shrink-0 rounded-full border border-black/8 bg-[#faf8f3] px-2.5 py-1 text-[11px] font-semibold text-[#706c64]">
                  {card.change}
                </span>
              </div>

              <p className="mt-3 text-4xl font-semibold tracking-[-0.055em]">
                {card.value}
              </p>

              <p className="mt-2 text-base leading-6 text-[#77736a]">
                {card.hint}
              </p>
            </article>
          ),
        )}
      </section>

      {data.summary.page_views === 0
        ? (
          <section className="rounded-[30px] border border-black/8 bg-white p-8 text-base leading-7 text-[#6f6c65]">
            {ru
              ? "Реальные посещения появятся здесь после первых просмотров опубликованного сайта. Тестовые Preview-переходы в эту статистику не входят."
              : "Real visits will appear here after the published site receives traffic. Preview test traffic is excluded."}
          </section>
        )
        : (
          <>
            <section className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
                {ru
                  ? "Динамика трафика"
                  : "Traffic trend"}
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {ru
                  ? "Просмотры по дням"
                  : "Page views by day"}
              </h3>

              <div className="mt-8 overflow-x-auto pb-2">
                <div
                  className="flex h-56 min-w-full items-end gap-2"
                  style={{
                    width:
                      `${Math.max(
                        680,
                        data.daily.length
                        * 30,
                      )}px`,
                  }}
                >
                  {data.daily.map(
                    day => {
                      const height =
                        Math.max(
                          4,
                          day.page_views
                          / maxViews
                          * 100,
                        );

                      return (
                        <div
                          key={
                            day.date
                          }
                          className="flex min-w-[22px] flex-1 flex-col items-center justify-end gap-2"
                          title={`${day.date}: ${day.page_views} / ${day.visits}`}
                        >
                          <span className="text-xs font-semibold text-[#77736a]">
                            {
                              day.page_views
                            }
                          </span>

                          <div
                            className="w-full max-w-[24px] rounded-t-full bg-[#d8b36a]"
                            style={{
                              height:
                                `${height}%`,
                            }}
                          />

                          <span className="text-[11px] text-[#8b877e]">
                            {day.date.slice(5)}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm text-[#77736a]">
                {ru
                  ? "Число над столбиком: просмотры. Визиты считаются отдельно по анонимным сессиям."
                  : "Number above each bar: page views. Visits are counted separately from anonymous sessions."}
              </p>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
                  {ru
                    ? "Популярные страницы"
                    : "Popular pages"}
                </p>

                <div className="mt-6 space-y-3">
                  {data.pages.map(
                    row => (
                      <div
                        key={
                          row.path
                        }
                        className="flex items-center justify-between gap-5 rounded-2xl bg-[#f8f6f1] px-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold">
                            {
                              row.path
                            }
                          </p>

                          <p className="mt-1 text-sm text-[#77736a]">
                            {
                              row.visits
                            }{" "}
                            {ru
                              ? "визитов"
                              : "visits"}
                          </p>
                        </div>

                        <p className="shrink-0 text-xl font-semibold">
                          {
                            row.page_views
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
                  {ru
                    ? "Источники трафика"
                    : "Traffic sources"}
                </p>

                <div className="mt-6 space-y-3">
                  {data.sources.map(
                    row => (
                      <div
                        key={`${row.source}:${row.medium}`}
                        className="flex items-center justify-between gap-5 rounded-2xl bg-[#f8f6f1] px-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold">
                            {row.source
                              === "direct"
                              ? (
                                ru
                                  ? "Прямой переход"
                                  : "Direct"
                              )
                              : row.source}
                          </p>

                          <p className="mt-1 text-sm text-[#77736a]">
                            {
                              row.medium
                            }
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-semibold">
                            {
                              row.visits
                            }
                          </p>

                          <p className="text-sm text-[#77736a]">
                            {ru
                              ? "визитов"
                              : "visits"}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
                  {ru
                    ? "Устройства"
                    : "Devices"}
                </p>

                <div className="mt-6 space-y-4">
                  {data.devices.map(
                    row => (
                      <div
                        key={
                          row.device_class
                        }
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-base">
                          {
                            deviceLabel(
                              row.device_class,
                            )
                          }
                        </span>

                        <strong className="text-lg">
                          {
                            row.visits
                          }
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
                  {ru
                    ? "Страны"
                    : "Countries"}
                </p>

                <div className="mt-6 space-y-4">
                  {data.countries.map(
                    row => (
                      <div
                        key={
                          row.country_code
                        }
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-base">
                          {row.country_code
                            === "unknown"
                            ? (
                              ru
                                ? "Неизвестно"
                                : "Unknown"
                            )
                            : row.country_code}
                        </span>

                        <strong className="text-lg">
                          {
                            row.visits
                          }
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-[30px] border border-black/8 bg-white p-6 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
                  {ru
                    ? "Города"
                    : "Cities"}
                </p>

                <div className="mt-6 space-y-4">
                  {data.cities.map(
                    row => (
                      <div
                        key={`${row.city}:${row.country_code}`}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="min-w-0 truncate text-base">
                          {row.city
                            === "unknown"
                            ? (
                              ru
                                ? "Неизвестно"
                                : "Unknown"
                            )
                            : row.city}

                          {row.country_code
                            !== "unknown"
                            ? ` · ${row.country_code}`
                            : ""}
                        </span>

                        <strong className="text-lg">
                          {
                            row.visits
                          }
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>
          </>
        )}
    </div>
  );
}
