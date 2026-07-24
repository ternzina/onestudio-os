"use client";

import { useAdminI18n } from "./AdminI18nProvider";

export default function AdminLanguageSwitcher({ theme = "light" }: { theme?: "light" | "dark" }) {
  const { locale, setLocale, t } = useAdminI18n();
  const dark = theme === "dark";

  return (
    <div
      className={`inline-flex items-center rounded-full border p-1 ${
        dark ? "border-white/12 bg-black/20" : "border-black/10 bg-[#f3f1eb]"
      }`}
      aria-label={t("Language")}
    >
      {(["ru", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          aria-pressed={locale === item}
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
            locale === item
              ? dark
                ? "bg-white text-[#0b0d12]"
                : "bg-[#17191f] text-white"
              : dark
                ? "text-white/55 hover:text-white"
                : "text-[#77736a] hover:text-[#17191f]"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
