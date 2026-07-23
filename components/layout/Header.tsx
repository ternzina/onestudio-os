"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../lib/language-provider";
import { useSiteSettings } from "@/lib/site-settings-provider";

const navLinks = [
  ["home", "/"],
  ["rent", "/wynajem-studia"],
  ["photoshoots", "/sesje-zdjeciowe"],
  ["learning", "/szkolenia"],
  ["portfolio", "/portfolio"],
  ["contacts", "/kontakt"],
] as const;

type NavKey = (typeof navLinks)[number][0];

const getLogoLines = (logoText: string) => {
  const normalizedLogoText = logoText.trim().replace(/\s+/g, " ");

  if (!normalizedLogoText) {
    return {
      main: "SISTERS",
      sub: "PHOTO STUDIO",
    };
  }

  if (normalizedLogoText.toLowerCase() === "sisters studio") {
    return {
      main: "SISTERS",
      sub: "PHOTO STUDIO",
    };
  }

  const words = normalizedLogoText.split(" ");

  if (words.length === 1) {
    return {
      main: words[0].toUpperCase(),
      sub: "PHOTO STUDIO",
    };
  }

  return {
    main: words[0].toUpperCase(),
    sub: words.slice(1).join(" ").toUpperCase(),
  };
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<NavKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const { global: siteGlobalSettings } = useSiteSettings();

  useEffect(() => {
    document.documentElement.lang = lang === "pl" ? "pl" : "uk";
  }, [lang]);

  const logoLines = useMemo(() => {
    const logoText =
      siteGlobalSettings.logo_text.trim() ||
      siteGlobalSettings.studio_name.trim() ||
      "Sisters Photo Studio";

    return getLogoLines(logoText);
  }, [siteGlobalSettings]);

  const logoAlt =
    siteGlobalSettings.studio_name.trim() ||
    siteGlobalSettings.logo_text.trim() ||
    "Sisters Photo Studio";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const getNavLabel = (key: NavKey) => {
    const labels = {
      uk: {
        home: "Головна",
        photoshoots: "Фотосесії",
        rent: "Оренда",
        portfolio: "Портфоліо",
        learning: "Навчання",
        contacts: "Контакти",
      },
      pl: {
        home: "Start",
        photoshoots: "Sesje",
        rent: "Wynajem",
        portfolio: "Portfolio",
        learning: "Szkolenia",
        contacts: "Kontakt",
      },
    };

    return labels[lang][key];
  };

  const isCurrentPage = (key: NavKey, href: string) => {
    if (key === "home") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 pt-4 sm:px-6">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border transition-all duration-500 lg:rounded-full ${
          scrolled
            ? "border-[#f0a9b533] bg-[#070504]/82 px-4 py-3 shadow-2xl shadow-black/45 backdrop-blur-2xl sm:px-5"
            : "border-[#f0a9b52e] bg-[#090604]/62 px-4 py-3 shadow-xl shadow-black/25 backdrop-blur-xl sm:px-5"
        }`}
      >
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[15px] border border-[#f0a9b55a] bg-[#d58b99]/20 shadow-[0_0_28px_rgba(240,169,181,0.16)] transition duration-300 group-hover:border-[#f0a9b5aa] group-hover:shadow-[0_0_34px_rgba(240,169,181,0.23)]">
            <Image
              src="/images/brand/sisters-logo-icon.webp"
              alt={logoAlt}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </span>

          <span className="leading-none">
            <span className="block text-[20px] font-light uppercase tracking-[0.26em] text-[#f0a9b5] drop-shadow-[0_0_12px_rgba(240,169,181,0.22)] sm:text-[22px]">
              {logoLines.main}
            </span>

            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.43em] text-[#d9b3ac]">
              {logoLines.sub}
            </span>
          </span>
        </Link>

        <nav
          onMouseLeave={() => setHoveredKey(null)}
          className="hidden items-center gap-2 lg:flex xl:gap-3"
        >
          {navLinks.map(([key, href]) => {
            const current = isCurrentPage(key, href);
            const highlighted = hoveredKey ? hoveredKey === key : current;

            return (
              <a
                key={key}
                href={href}
                onMouseEnter={() => setHoveredKey(key)}
                className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 xl:text-[11px] ${
                  highlighted
                    ? "border-[#f0a9b570] bg-[#f0a9b5]/14 text-[#ffd0d6] shadow-[0_0_24px_rgba(240,169,181,0.14)]"
                    : "border-transparent text-[#f6eee8]/62 hover:border-[#f0a9b570] hover:bg-[#f0a9b5]/12 hover:text-[#ffd0d6] hover:shadow-[0_0_24px_rgba(240,169,181,0.13)]"
                }`}
              >
                {getNavLabel(key)}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-[#f0a9b52e] bg-[#120b08]/70 p-1 sm:flex">
            <button
              type="button"
              onClick={() => setLang("uk")}
              className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                lang === "uk"
                  ? "bg-[#f0a9b5] text-[#160d0a]"
                  : "text-[#f6eee8]/58 hover:text-[#f0a9b5]"
              }`}
              aria-pressed={lang === "uk"}
            >
              UA
            </button>

            <button
              type="button"
              onClick={() => setLang("pl")}
              className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                lang === "pl"
                  ? "bg-[#f0a9b5] text-[#160d0a]"
                  : "text-[#f6eee8]/58 hover:text-[#f0a9b5]"
              }`}
              aria-pressed={lang === "pl"}
            >
              PL
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#f0a9b552] bg-[#120b08]/75 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd0d6] shadow-[0_0_24px_rgba(240,169,181,0.1)] backdrop-blur transition hover:border-[#f0a9b5] hover:bg-[#f0a9b5]/12 lg:hidden"
            aria-expanded={mobileOpen}
          >
            {mobileOpen
              ? lang === "pl"
                ? "Zamknij"
                : "Закрити"
              : lang === "pl"
                ? "Menu"
                : "Меню"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-[28px] border border-[#f0a9b533] bg-[#070504]/92 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:hidden">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#f0a9b526] bg-[#120b08]/70 p-2">
            <span className="pl-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f6eee8]/62">
              {lang === "pl" ? "Język" : "Мова"}
            </span>

            <div className="flex items-center rounded-full border border-[#f0a9b52e] bg-[#090604]/70 p-1">
              <button
                type="button"
                onClick={() => setLang("uk")}
                className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                  lang === "uk"
                    ? "bg-[#f0a9b5] text-[#160d0a]"
                    : "text-[#f6eee8]/58"
                }`}
              >
                UA
              </button>

              <button
                type="button"
                onClick={() => setLang("pl")}
                className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                  lang === "pl"
                    ? "bg-[#f0a9b5] text-[#160d0a]"
                    : "text-[#f6eee8]/58"
                }`}
              >
                PL
              </button>
            </div>
          </div>

          <nav className="grid gap-2">
            {navLinks.map(([key, href]) => {
              const current = isCurrentPage(key, href);

              return (
                <a
                  key={key}
                  href={href}
                  className={`rounded-2xl border px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] transition ${
                    current
                      ? "border-[#f0a9b570] bg-[#f0a9b5]/14 text-[#ffd0d6]"
                      : "border-[#f0a9b51f] bg-[#120b08]/58 text-[#f6eee8]/72 hover:border-[#f0a9b570] hover:bg-[#f0a9b5]/12 hover:text-[#ffd0d6]"
                  }`}
                >
                  {getNavLabel(key)}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
