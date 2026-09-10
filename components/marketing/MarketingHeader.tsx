"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent } from "react";
import { type Locale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import MarketingBrand from "./MarketingBrand";

type NavigationGroup = "product" | "oneStudio";

type NavigationItem = {
  label: string;
  href: string;
};

const NAVIGATION_CLOSE_DELAY = 220;

type DesktopNavigationGroupProps = {
  group: NavigationGroup;
  label: string;
  menuLabel: string;
  items: readonly NavigationItem[];
  menuId: string;
  isOpen: boolean;
  onOpen: (group: NavigationGroup, trigger: HTMLButtonElement | null) => void;
  onToggle: (group: NavigationGroup, trigger: HTMLButtonElement | null) => void;
  onClose: () => void;
  onNavigate: () => void;
  closeLanguageMenu: () => void;
};

function DesktopNavigationGroup({
  group,
  label,
  menuLabel,
  items,
  menuId,
  isOpen,
  onOpen,
  onToggle,
  onClose,
  onNavigate,
  closeLanguageMenu,
}: DesktopNavigationGroupProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onClose();
    }
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(document.activeElement)) {
      onClose();
    }
  };

  return (
    <div
      className={`os-nav-group${isOpen ? " is-open" : ""}`}
      data-nav-group={group}
      onMouseEnter={() => onOpen(group, triggerRef.current)}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        className="os-nav-trigger"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label={menuLabel}
        onFocus={() => {
          closeLanguageMenu();
          onOpen(group, triggerRef.current);
        }}
        onClick={() => {
          closeLanguageMenu();
          onToggle(group, triggerRef.current);
        }}
      >
        <span>{label}</span>
        <span className="os-nav-chevron" aria-hidden="true">⌄</span>
      </button>

      <div id={menuId} className="os-nav-popover" aria-label={label}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function MarketingHeader({
  lang,
  onLangChange,
  inFlow = false,
  languageTone = "dark",
}: {
  lang: Locale;
  onLangChange: (lang: Locale) => void;
  inFlow?: boolean;
  languageTone?: "light" | "dark";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<NavigationGroup | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const idPrefix = useId().replace(/:/g, "");
  const t = getTranslations(lang).common;

  const productItems: readonly NavigationItem[] = [
    { label: t.footer.links.features, href: "/features" },
    { label: t.footer.links.solutions, href: "/solutions" },
    { label: t.footer.links.templates, href: "/demos" },
    { label: t.footer.links.components, href: "/components" },
    { label: t.footer.links.pricing, href: "/pricing" },
    { label: t.footer.links.website, href: "/website" },
  ];
  const oneStudioItems: readonly NavigationItem[] = [
    { label: t.footer.links.about, href: "/about" },
    { label: t.footer.links.faq, href: "/faq" },
    { label: t.footer.links.journal, href: "/journal" },
    { label: t.footer.links.contact, href: "/contact" },
  ];
  const productMenuId = `marketing-product-menu-${idPrefix}`;
  const oneStudioMenuId = `marketing-onestudio-menu-${idPrefix}`;
  const navigationId = `marketing-primary-navigation-${idPrefix}`;

  const closeLanguageMenu = () => {
    headerRef.current?.querySelectorAll("details[open]").forEach((details) => {
      details.removeAttribute("open");
    });
  };

  const cancelScheduledNavigationClose = () => {
    if (closeTimerRef.current === null) return;

    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const scheduleNavigationClose = () => {
    cancelScheduledNavigationClose();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setOpenGroup(null);
      lastTriggerRef.current = null;
    }, NAVIGATION_CLOSE_DELAY);
  };

  const closeNavigation = () => {
    cancelScheduledNavigationClose();
    setMenuOpen(false);
    setOpenGroup(null);
    lastTriggerRef.current = null;
  };

  const handleGroupOpen = (group: NavigationGroup, trigger: HTMLButtonElement | null) => {
    cancelScheduledNavigationClose();
    closeLanguageMenu();
    lastTriggerRef.current = trigger;
    setOpenGroup(group);
  };

  const handleGroupToggle = (group: NavigationGroup, trigger: HTMLButtonElement | null) => {
    cancelScheduledNavigationClose();
    const nextGroup = openGroup === group ? null : group;
    lastTriggerRef.current = nextGroup ? trigger : null;
    setOpenGroup(nextGroup);
  };

  const handleMenuToggle = () => {
    cancelScheduledNavigationClose();
    const nextOpen = !menuOpen;
    if (nextOpen) closeLanguageMenu();
    setMenuOpen(nextOpen);
    setOpenGroup(null);
  };

  const handleLanguageChange = (nextLang: Locale) => {
    closeNavigation();
    onLangChange(nextLang);
  };

  useEffect(() => {
    if (!menuOpen && !openGroup) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeNavigation();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      if (openGroup) {
        cancelScheduledNavigationClose();
        const trigger = lastTriggerRef.current;
        setOpenGroup(null);
        lastTriggerRef.current = null;
        requestAnimationFrame(() => trigger?.focus());
      } else {
        setMenuOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, openGroup]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const headerClassName = `os-header${inFlow ? " os-header-in-flow" : ""}`;

  return (
    <header ref={headerRef} className={headerClassName}>
      <MarketingBrand />

      <nav
        id={navigationId}
        className={menuOpen ? "os-nav is-open" : "os-nav"}
        aria-label={t.header.navigationLabel}
      >
        <div className="os-nav-desktop">
          <DesktopNavigationGroup
            group="product"
            label={t.header.product}
            menuLabel={t.header.productMenuLabel}
            items={productItems}
            menuId={productMenuId}
            isOpen={openGroup === "product"}
            onOpen={handleGroupOpen}
            onToggle={handleGroupToggle}
            onClose={scheduleNavigationClose}
            onNavigate={closeNavigation}
            closeLanguageMenu={closeLanguageMenu}
          />
          <DesktopNavigationGroup
            group="oneStudio"
            label={t.header.oneStudio}
            menuLabel={t.header.oneStudioMenuLabel}
            items={oneStudioItems}
            menuId={oneStudioMenuId}
            isOpen={openGroup === "oneStudio"}
            onOpen={handleGroupOpen}
            onToggle={handleGroupToggle}
            onClose={scheduleNavigationClose}
            onNavigate={closeNavigation}
            closeLanguageMenu={closeLanguageMenu}
          />
        </div>

        <div className="os-nav-mobile">
          <div className="os-nav-mobile-group">
            <span className="os-nav-mobile-heading">{t.header.product}</span>
            {productItems.map((item) => (
              <Link key={item.href} className="os-nav-mobile-link" href={item.href} onClick={closeNavigation}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="os-nav-mobile-group">
            <span className="os-nav-mobile-heading">{t.header.oneStudio}</span>
            {oneStudioItems.map((item) => (
              <Link key={item.href} className="os-nav-mobile-link" href={item.href} onClick={closeNavigation}>
                {item.label}
              </Link>
            ))}
          </div>
          <Link className="os-nav-mobile-cta os-login" href="/login" onClick={closeNavigation}>
            {t.header.login}
          </Link>
        </div>
      </nav>

      <div className="os-header-actions">
        <LanguageSwitcher lang={lang} onLangChange={handleLanguageChange} tone={languageTone} />
        <Link href="/login" className="os-login" onClick={closeNavigation}>
          {t.header.login}
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          className="os-menu"
          aria-label={t.header.menuLabel}
          aria-expanded={menuOpen}
          aria-controls={navigationId}
          onClick={handleMenuToggle}
        >
          <span /><span />
        </button>
      </div>
    </header>
  );
}
