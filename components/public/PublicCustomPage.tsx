import Link from "next/link";
import BackToDashboardButton from "@/components/public/BackToDashboardButton";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicSiteAnalytics from "@/components/public/PublicSiteAnalytics";
import PublicSocialLinks from "@/components/public/PublicSocialLinks";
import {
  publicCustomPagePath,
  publicSitePath,
} from "@/lib/public-site/metadata";
import type {
  PublicSiteData,
  PublicSitePage,
} from "@/lib/public-site/types";

export default function PublicCustomPage({
  site,
  page,
}: {
  site: PublicSiteData;
  page: PublicSitePage;
}) {
  const { business, company, content, capabilities } = site;
  const localized =
    business.locale === business.primary_locale ? null : business.locale;
  const homeHref = publicSitePath(business.slug, localized);
  const bookingHref = `/book/${business.slug}`;
  const pageHref = publicCustomPagePath(
    business.slug,
    page.slug,
    localized,
  );

  return (
    <main
      lang={business.locale}
      className="min-h-screen bg-[#fffdfb] text-[#3b211f]"
      style={{
        "--site-accent": content.theme_accent ?? "#a60918",
        "--site-dark": content.theme_dark ?? "#551214",
      } as React.CSSProperties}
    >
      {content.show_announcement !== false && content.announcement_text ? (
        <div className="bg-[var(--site-accent)] px-4 py-2 text-center text-xs font-medium text-white">
          {content.announcement_text}
        </div>
      ) : null}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-[82px] w-[calc(100%_-_40px)] max-w-[1240px] flex-wrap items-center justify-between gap-4 py-4">
          <Link href={homeHref} className="inline-flex flex-col leading-none">
            <span className="font-serif text-[30px] tracking-[0.04em]">
              {content.brand_name || company.display_name || business.name}
            </span>
            {content.template_id === "gloss-nail-studio" ? (
              <span className="mt-1 pl-1 text-[8px] font-semibold tracking-[0.42em] opacity-65">
                NAIL STUDIO
              </span>
            ) : null}
          </Link>
          <nav className="flex items-center gap-6 text-xs font-semibold text-black/60">
            <Link href={homeHref}>Главная</Link>
            <Link href={pageHref} aria-current="page" className="text-[var(--site-accent)]">
              {page.nav_label}
            </Link>
            <Link href={`${homeHref}#contact`}>{content.contact_label}</Link>
          </nav>
          {capabilities.booking ? (
            <Link
              href={bookingHref}
              className="rounded-md bg-[var(--site-accent)] px-6 py-3 text-xs font-semibold text-white"
            >
              {content.booking_label}
            </Link>
          ) : null}
        </div>
      </header>

      <section className="px-5 py-20 sm:py-28">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--site-accent)]">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.03] sm:text-7xl">
              {page.title}
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-black/55">
            {page.intro}
          </p>
        </div>
      </section>

      {(page.blocks ?? [])
        .filter((block) => block.is_visible !== false)
        .map((block) => (
          <PublicCustomBlock
            key={block.id}
            block={block}
            bookingHref={bookingHref}
            services={site.services}
          />
        ))}

      {page.show_booking_cta && capabilities.booking ? (
        <section className="bg-[var(--site-dark)] px-5 py-20 text-white">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                Онлайн-запись
              </p>
              <h2 className="mt-4 max-w-3xl font-serif text-4xl sm:text-5xl">
                Выберите удобное время
              </h2>
            </div>
            <Link
              href={bookingHref}
              className="inline-flex min-h-12 items-center rounded-md bg-white px-7 text-sm font-semibold text-[var(--site-dark)]"
            >
              {content.booking_label} <span className="ml-9">→</span>
            </Link>
          </div>
        </section>
      ) : null}

      <footer className="bg-[var(--site-accent)] px-5 py-8 text-white">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-5 text-xs">
          <p>
            © {new Date().getFullYear()}{" "}
            {content.brand_name || company.display_name || business.name}
          </p>
          <Link href={homeHref}>Вернуться на главную</Link>
          <PublicSocialLinks content={content} light />
          <p className="text-white/60">Создано на OneStudio OS</p>
        </div>
      </footer>
      <PublicSiteAnalytics content={content} />
      <BackToDashboardButton />
    </main>
  );
}
