import Link from "next/link";
import BackToDashboardButton from "@/components/public/BackToDashboardButton";
import PublicSiteAnalytics from "@/components/public/PublicSiteAnalytics";
import PublicSocialLinks from "@/components/public/PublicSocialLinks";
import PublicPortfolioGallery from "@/components/public/PublicPortfolioGallery";
import {
  publicSitePagePath,
  publicSitePath,
} from "@/lib/public-site/metadata";
import type {
  PublicSiteData,
  PublicSitePage,
} from "@/lib/public-site/types";

export default function PublicPortfolioPage({
  site,
  page,
}: {
  site: PublicSiteData;
  page: PublicSitePage;
}) {
  const { business, company, content, portfolio, capabilities } = site;
  const localized = business.locale === business.primary_locale
    ? null
    : business.locale;
  const homeHref = publicSitePath(business.slug, localized);
  const pageHref = publicSitePagePath(business.slug, page.slug, localized);
  const bookingHref = `/book/${business.slug}`;

  return (
    <main
      lang={business.locale}
      className="min-h-screen text-[#191b20]"
      style={{
        backgroundColor: content.theme_surface ?? "#fff7f5",
        "--site-accent": content.theme_accent ?? "#9d3151",
        "--site-dark": content.theme_dark ?? "#321722",
      } as React.CSSProperties}
    >
      <header className="relative z-20">
        <div className="mx-auto flex min-h-24 w-[calc(100%_-_40px)] max-w-[1240px] flex-wrap items-center justify-between gap-4 border-b border-black/10 py-5">
          <Link
            href={homeHref}
            className="text-sm font-semibold uppercase tracking-[0.2em]"
          >
            {content.brand_name || company.display_name || business.name}
          </Link>
          <nav
            aria-label="Primary navigation"
            className="order-3 flex w-full items-center gap-5 overflow-x-auto text-xs font-semibold text-black/60 md:order-none md:w-auto"
          >
            <Link href={homeHref}>Главная</Link>
            <Link href={`${homeHref}#services`}>{content.services_label}</Link>
            <Link
              href={pageHref}
              aria-current="page"
              className="text-[var(--site-accent)]"
            >
              {page.nav_label}
            </Link>
            <Link href={`${homeHref}#contact`}>{content.contact_label}</Link>
          </nav>
          <div className="flex items-center gap-2">
            {site.available_locales.length > 1 ? (
              <nav aria-label="Language" className="hidden items-center gap-1 sm:flex">
                {site.available_locales.map((locale) => (
                  <Link
                    key={locale}
                    href={publicSitePagePath(
                      business.slug,
                      page.slug,
                      locale === business.primary_locale ? null : locale,
                    )}
                    hrefLang={locale}
                    className={`rounded-full px-2.5 py-2 text-[10px] font-semibold uppercase ${
                      locale === business.locale
                        ? "bg-white/70 text-black"
                        : "text-black/40"
                    }`}
                  >
                    {locale}
                  </Link>
                ))}
              </nav>
            ) : null}
            {capabilities.booking ? (
              <Link
                href={bookingHref}
                className="rounded-full bg-[var(--site-dark)] px-5 py-3 text-xs font-semibold text-white"
              >
                {content.booking_label}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden px-5 pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="absolute -right-24 top-4 -z-10 h-[440px] w-[440px] rounded-full border border-[var(--site-accent)]/20" />
        <div className="absolute right-16 top-24 -z-10 h-72 w-72 rounded-full bg-[var(--site-accent)]/10 blur-3xl" />
        <div className="mx-auto w-full max-w-[1240px]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--site-accent)]">
            {page.eyebrow}
          </p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.065em] sm:text-7xl lg:text-[88px] lg:leading-[0.96]">
              {page.title}
            </h1>
            <p className="max-w-xl text-base leading-8 text-black/55 sm:text-lg">
              {page.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:pb-32">
        <div className="mx-auto w-full max-w-[1240px]">
          <PublicPortfolioGallery
            projects={portfolio}
            locale={business.locale}
            layout={content.portfolio_layout ?? "masonry"}
            columns={content.portfolio_columns ?? 3}
            aspect={content.portfolio_card_aspect ?? "auto"}
            showFilters={content.portfolio_show_filters !== false}
            showCategory={content.portfolio_show_category !== false}
            showTitle={content.portfolio_show_title !== false}
            showDescription={content.portfolio_show_description === true}
            lightbox={content.portfolio_lightbox !== false}
            limit={0}
          />
        </div>
      </section>

      {page.show_booking_cta && capabilities.booking ? (
        <section className="bg-[var(--site-dark)] px-5 py-24 text-white sm:py-32">
          <div className="mx-auto grid w-full max-w-[1240px] gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#efc8d3]">
                ВЫБЕРИТЕ СВОЙ ДИЗАЙН
              </p>
              <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                Сохраним идею и подберём свободное время
              </h2>
            </div>
            <div>
              <p className="text-base leading-8 text-white/60">
                Выберите услугу, день и время в календаре. Свободные окна
                обновляются автоматически.
              </p>
              <Link
                href={bookingHref}
                className="mt-8 inline-flex min-h-14 items-center rounded-full bg-white px-7 text-sm font-semibold text-[var(--site-dark)]"
              >
                {content.booking_label}
                <span aria-hidden="true" className="ml-10 text-[var(--site-accent)]">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-black/10 px-5 py-8">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 text-xs text-black/45">
          <p>
            © {new Date().getFullYear()}{" "}
            {content.brand_name || company.display_name || business.name}
          </p>
          <Link href={homeHref} className="font-semibold text-black/65">
            Вернуться на главную
          </Link>
          <PublicSocialLinks content={content} />
        </div>
      </footer>
      <PublicSiteAnalytics content={content} />
      <BackToDashboardButton />
    </main>
  );
}
