"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function publicHomeFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const siteIndex = parts.indexOf("site");
  const businessSlug = parts[siteIndex + 1];
  if (!businessSlug) return "/demos";

  const possibleLocale = parts[siteIndex + 2];
  const hasLocale =
    Boolean(possibleLocale) &&
    possibleLocale !== "p" &&
    possibleLocale !== "portfolio";

  return hasLocale
    ? `/site/${businessSlug}/${possibleLocale}`
    : `/site/${businessSlug}`;
}

export default function PublicSiteNotFound() {
  const pathname = usePathname();
  const homeHref = publicHomeFromPath(pathname);

  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf8] px-6 text-[#3b211f]">
      <section className="w-full max-w-2xl rounded-[36px] border border-black/8 bg-white p-8 text-center shadow-[0_30px_100px_rgba(59,33,31,0.12)] sm:p-14">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9d3151]">
          Ошибка 404
        </p>
        <h1 className="mt-5 font-serif text-5xl leading-tight sm:text-6xl">
          Такой страницы нет
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-black/55">
          Возможно, страница была скрыта, удалена или её адрес изменился.
        </p>
        <Link
          href={homeHref}
          className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[#3b211f] px-7 text-sm font-semibold text-white"
        >
          Вернуться на сайт
          <span className="ml-8" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
