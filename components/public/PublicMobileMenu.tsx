"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MenuItem = {
  label: string;
  href: string;
};

type LocaleItem = MenuItem & {
  current?: boolean;
};

type MenuAction = MenuItem | null;

function isPlainAnchor(href: string) {
  return (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    /^https:\/\//i.test(href)
  );
}

function MenuLink({
  item,
  onNavigate,
  className,
}: {
  item: MenuItem;
  onNavigate: () => void;
  className: string;
}) {
  if (isPlainAnchor(item.href)) {
    return (
      <a
        href={item.href}
        className={className}
        onClick={onNavigate}
        {...(/^https:\/\//i.test(item.href)
          ? { target: "_blank", rel: "noreferrer" }
          : {})}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export default function PublicMobileMenu({
  items,
  locales = [],
  action = null,
  menuLabel = "Menu",
  closeLabel = "Close",
  alwaysVisible = false,
}: {
  items: MenuItem[];
  locales?: LocaleItem[];
  action?: MenuAction;
  menuLabel?: string;
  closeLabel?: string;
  alwaysVisible?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={menuLabel}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`grid h-11 w-11 place-items-center rounded-full border border-current/15 bg-white/70 text-current backdrop-blur ${alwaysVisible ? "" : "lg:hidden"}`}
      >
        <span aria-hidden="true" className="flex w-4 flex-col gap-1">
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] text-[var(--site-dark)]"
          style={{ backgroundColor: "var(--site-surface, #fffdfb)" }}
        >
          <div className="mx-auto flex min-h-screen w-[calc(100%_-_40px)] max-w-[760px] flex-col py-6">
            <div className="flex items-center justify-between border-b border-current/10 pb-5">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] opacity-55">
                {menuLabel}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-current/15"
                aria-label={closeLabel}
              >
                <span aria-hidden="true" className="text-2xl leading-none">×</span>
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center py-10" aria-label={menuLabel}>
              {items.map((item) => (
                <MenuLink
                  key={`${item.href}-${item.label}`}
                  item={item}
                  onNavigate={() => setOpen(false)}
                  className="border-b border-current/10 py-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl"
                />
              ))}
            </nav>

            {locales.length ? (
              <div className="flex flex-wrap gap-2 border-t border-current/10 pt-5">
                {locales.map((locale) => (
                  <MenuLink
                    key={`${locale.href}-${locale.label}`}
                    item={locale}
                    onNavigate={() => setOpen(false)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase ${locale.current ? "border-[var(--site-accent)] bg-[var(--site-accent)] text-white" : "border-current/15"}`}
                  />
                ))}
              </div>
            ) : null}

            {action ? (
              <div className="pt-5">
                <MenuLink
                  item={action}
                  onNavigate={() => setOpen(false)}
                  className="flex min-h-14 items-center justify-center rounded-full bg-[var(--site-accent)] px-6 text-sm font-semibold text-white"
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
