import Link from "next/link";
import BackToDashboardButton from "@/components/public/BackToDashboardButton";
import GlossBookingPanel from "@/components/public/GlossBookingPanel";
import GlossLeadDialog from "@/components/public/GlossLeadDialog";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicSiteAnalytics from "@/components/public/PublicSiteAnalytics";
import PublicSocialLinks from "@/components/public/PublicSocialLinks";
import PublicMobileMenu from "@/components/public/PublicMobileMenu";
import PublicPortfolioGallery from "@/components/public/PublicPortfolioGallery";
import {
  publicCustomPagePath,
  publicSitePagePath,
  publicSitePath,
} from "@/lib/public-site/metadata";
import { publicSiteReviews } from "@/lib/public-site/content";
import {
  customBlockLayoutId,
  resolvePublicSiteLayoutOrder,
  sectionLayoutId,
} from "@/lib/public-site/layout";
import type {
  PublicSiteData,
  PublicSiteService,
} from "@/lib/public-site/types";

const SERVICE_IMAGES = [
  "/templates/gloss/gloss-gallery-4.webp",
  "/templates/gloss/gloss-gallery-1.webp",
  "/templates/gloss/gloss-gallery-3.webp",
  "/templates/gloss/gloss-gallery-8.webp",
];

const MASTER_IMAGES = [
  "/templates/gloss/gloss-master-anna.webp",
  "/templates/gloss/gloss-master-maria.webp",
  "/templates/gloss/gloss-master-elena.webp",
];

function lines(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function labeledLine(value: string) {
  const [title, ...rest] = value.split("·").map((item) => item.trim());
  return { title, detail: rest.join(" · ") };
}

function formatPrice(service: PublicSiteService, locale: string) {
  if (service.pricing_model === "free") return "Бесплатно";
  if (service.pricing_model === "quote" || service.price_minor === null) {
    return "По запросу";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: service.currency,
      maximumFractionDigits: service.price_minor % 100 === 0 ? 0 : 2,
    }).format(service.price_minor / 100);
  } catch {
    return `${(service.price_minor / 100).toFixed(0)} ${service.currency}`;
  }
}

function serviceImage(content: PublicSiteData["content"], service: PublicSiteService, index: number) {
  if (Object.prototype.hasOwnProperty.call(content.service_card_images ?? {}, service.slug)) {
    return content.service_card_images?.[service.slug] ?? "";
  }
  return content.service_image_urls?.[index]
    || SERVICE_IMAGES[index % SERVICE_IMAGES.length]
    || "";
}

function serviceGridClass(columns: number | undefined) {
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

function GlossLogo({
  href,
  logoUrl,
  brandName,
  light = false,
  size = "medium",
}: {
  href: string;
  logoUrl?: string;
  brandName: string;
  light?: boolean;
  size?: "small" | "medium" | "large";
}) {
  return (
    <Link
      href={href}
      aria-label={brandName}
      className={`inline-flex -translate-y-0.5 flex-col leading-none ${
        light ? "text-white" : "text-[#551d1d]"
      }`}
    >
      {logoUrl ? (
        // The logo is stored in the workspace-owned company profile.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={brandName}
          className={`${size === "small" ? "max-h-9 max-w-[150px]" : size === "large" ? "max-h-[68px] max-w-[280px]" : "max-h-14 max-w-[220px]"} object-contain object-left`}
        />
      ) : (
        <>
          <span className="font-serif text-[32px] tracking-[0.04em]">
            {brandName}
          </span>
          <span className="mt-1 pl-1 text-[8px] font-semibold tracking-[0.42em] opacity-70">
            NAIL STUDIO
          </span>
        </>
      )}
    </Link>
  );
}

function SafetyIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
        <path d="M17 7h14v8H17zM15 18h18v22H15z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 27c3-5 5-5 8 0M24 23v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
        <path d="M24 6c6 8 11 14 11 22a11 11 0 1 1-22 0C13 20 18 14 24 6Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="m19 29 3 3 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden="true">
      <path d="m24 6 15 6v11c0 10-6 16-15 19C15 39 9 33 9 23V12l15-6Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m18 24 4 4 8-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function safeActionHref(value: string | undefined, fallback: string) {
  const href = value?.trim() ?? "";
  if (!href) return fallback;
  if (
    href.startsWith("#") ||
    href.startsWith("/") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    /^https:\/\//i.test(href)
  ) {
    return href;
  }
  return fallback;
}

function heroObjectClass(
  fit: "cover" | "contain" | undefined,
  position: "top" | "center" | "bottom" | undefined,
) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  const positionClass =
    position === "top"
      ? "object-top"
      : position === "bottom"
        ? "object-bottom"
        : "object-center";
  return `${fitClass} ${positionClass}`;
}

function menuCopy(locale: string) {
  const language = locale.split("-")[0];
  return {
    ru: { menu: "Меню", close: "Закрыть" },
    uk: { menu: "Меню", close: "Закрити" },
    pl: { menu: "Menu", close: "Zamknij" },
    en: { menu: "Menu", close: "Close" },
  }[language] ?? { menu: "Menu", close: "Close" };
}

export default function GlossBusinessSite({
  site,
}: {
  site: PublicSiteData;
}) {
  const {
    business,
    company,
    content,
    services,
    portfolio,
    capabilities,
    available_locales: availableLocales,
  } = site;
  const localized =
    business.locale === business.primary_locale ? null : business.locale;
  const homeHref = publicSitePath(business.slug, localized);
  const bookingHref = `/book/${business.slug}`;
  const order = resolvePublicSiteLayoutOrder(content);
  const layoutPosition = (item: string) => {
    const position = order.indexOf(item);
    return position === -1 ? order.length : position;
  };
  const team = lines(content.team_items);
  const reviews = publicSiteReviews(content);
  const safety = lines(content.safety_items);
  const customBlocks = (content.custom_blocks ?? []).filter(
    (block) => block.is_visible !== false,
  );
  const servicesLayout = content.services_layout ?? "cards";
  const teamImages = content.team_image_urls ?? MASTER_IMAGES;
  const brandName = content.brand_name || company.display_name || business.name;
  const address =
    content.contact_address || company.address || "ул. Вишнёвая, 11";
  const email = content.contact_email?.trim() || company.email?.trim() || "";
  const phone = content.contact_phone?.trim() || company.phone?.trim() || "";
  const hours = content.contact_hours || "Ежедневно: 09:00–21:00";
  const contactNote = content.contact_note?.trim() || "";
  const routeLabel = content.contact_route_label?.trim() || "Построить маршрут";
  const mapSearch = content.map_query || address;
  const mapQuery = encodeURIComponent(mapSearch);
  const navigationPages = (content.pages ?? []).filter(
    (page) => page.is_visible !== false && page.show_in_navigation,
  );

  const pageHref = (page: (typeof navigationPages)[number]) =>
    page.type === "portfolio"
      ? publicSitePagePath(business.slug, page.slug, localized)
      : publicCustomPagePath(business.slug, page.slug, localized);
  const headerLogoPosition = content.header_logo_position ?? "left";
  const headerLogoSize = content.header_logo_size ?? "medium";
  const menuText = menuCopy(business.locale);
  const primaryHref = safeActionHref(
    content.hero_primary_url,
    capabilities.booking ? bookingHref : `/request/${business.slug}`,
  );
  const primaryLabel =
    content.hero_primary_label?.trim() || content.booking_label || "Записаться";
  const secondaryHref = safeActionHref(
    content.hero_secondary_url,
    "#portfolio",
  );
  const secondaryLabel =
    content.hero_secondary_label?.trim() || "Выбрать дизайн";
  const heroLayout = content.hero_layout ?? "split";
  const heroImage = content.hero_image_url || "/templates/gloss/gloss-hero.webp";
  const navItems = [
    ...(content.show_services ? [{ href: "#services", label: content.services_label || "Услуги" }] : []),
    ...navigationPages.map((page) => ({ href: pageHref(page), label: page.nav_label })),
    ...(content.show_team ? [{ href: "#team", label: content.team_label || "Мастера" }] : []),
    ...(content.show_about ? [{ href: "#about", label: content.about_label || "О студии" }] : []),
    ...(content.show_contact ? [{ href: "#contact", label: content.contact_label || "Контакты" }] : []),
  ];
  const localeItems = availableLocales.map((locale) => ({
    label: locale.toUpperCase(),
    href: publicSitePath(
      business.slug,
      locale === business.primary_locale ? null : locale,
    ),
    current: locale === business.locale,
  }));

  return (
    <main
      lang={business.locale}
      className="min-h-screen bg-[#fffdfb] text-[#3b211f]"
      style={{
        "--site-accent": content.theme_accent ?? "#a60918",
        "--site-dark": content.theme_dark ?? "#551214",
        "--site-surface": content.theme_surface ?? "#fffdfb",
      } as React.CSSProperties}
    >
      {content.show_announcement !== false && content.announcement_text ? (
        <div className="bg-[var(--site-accent)] px-4 py-2 text-center text-xs font-medium text-white">
          {content.announcement_text}
        </div>
      ) : null}

      <header
        className={`${content.header_sticky === true ? "sticky top-0 z-50 bg-white/95 backdrop-blur-xl" : "relative z-40 bg-white"} border-b border-[#3b211f]/10`}
      >
        <div className="relative mx-auto flex min-h-[82px] w-[calc(100%_-_40px)] max-w-[1240px] items-center justify-between gap-5">
          <div className={headerLogoPosition === "center" ? "absolute left-1/2 -translate-x-1/2" : "shrink-0"}>
            <GlossLogo
              href={homeHref}
              logoUrl={company.logo_url}
              brandName={brandName}
              size={headerLogoSize}
            />
          </div>
          {headerLogoPosition === "left" ? (
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
              {navItems.map((item) => (
                item.href.startsWith("#") ? (
                  <a key={`${item.href}-${item.label}`} href={item.href}>{item.label}</a>
                ) : (
                  <Link key={`${item.href}-${item.label}`} href={item.href}>{item.label}</Link>
                )
              ))}
            </nav>
          ) : (
            <div className="mr-auto">
              <PublicMobileMenu
                items={navItems}
                locales={localeItems}
                action={capabilities.booking ? { href: bookingHref, label: content.booking_label } : null}
                menuLabel={menuText.menu}
                closeLabel={menuText.close}
                alwaysVisible
              />
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {headerLogoPosition === "left" ? (
              <PublicMobileMenu
                items={navItems}
                locales={localeItems}
                action={capabilities.booking ? { href: bookingHref, label: content.booking_label } : null}
                menuLabel={menuText.menu}
                closeLabel={menuText.close}
              />
            ) : null}
            {capabilities.booking ? (
              <Link
                href={bookingHref}
                className="hidden rounded-md bg-[var(--site-accent)] px-6 py-3 text-xs font-semibold text-white sm:inline-flex"
              >
                {content.booking_label}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {content.show_hero !== false ? (
        heroLayout === "cover" ? (
          <section className="relative isolate min-h-[620px] overflow-hidden border-b border-[#3b211f]/8 bg-[var(--site-dark)] text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt=""
              fetchPriority="high"
              className={`absolute inset-0 h-full w-full ${heroObjectClass(content.hero_image_fit, content.hero_image_position)}`}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(50,23,34,0.86),rgba(50,23,34,0.48),rgba(50,23,34,0.14))]" />
            <div className="relative mx-auto flex min-h-[620px] w-[calc(100%_-_40px)] max-w-[1240px] items-center py-20">
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">{content.hero_eyebrow}</p>
                <h1 className="mt-5 font-serif text-5xl leading-[1.03] tracking-[-0.035em] sm:text-7xl">{content.hero_title}</h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/78">{content.hero_text}</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href={primaryHref} className="inline-flex min-h-12 items-center rounded-md bg-[var(--site-accent)] px-7 text-sm font-semibold text-white">{primaryLabel}</Link>
                  {content.show_hero_secondary !== false ? (
                    <Link href={secondaryHref} className="inline-flex min-h-12 items-center border-b border-white/50 px-1 text-sm font-semibold text-white">{secondaryLabel}<span className="ml-8">→</span></Link>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="border-b border-[#3b211f]/8 bg-white">
            <div className={`mx-auto grid w-full max-w-[1240px] ${heroLayout === "text" ? "" : "lg:grid-cols-[0.92fr_1.08fr]"}`}>
              <div className={`flex flex-col justify-center px-5 py-16 sm:px-9 lg:py-20 ${content.hero_image_placement === "left" ? "lg:order-2" : "lg:order-1"}`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#765b57]">{content.hero_eyebrow}</p>
                <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.03] tracking-[-0.035em] sm:text-7xl">{content.hero_title}</h1>
                <p className="mt-6 max-w-md text-base leading-7 text-[#6a5551]">{content.hero_text}</p>
                <div className="mt-7 flex flex-wrap gap-4">
                  <Link href={primaryHref} className="inline-flex min-h-12 items-center rounded-md bg-[var(--site-accent)] px-7 text-sm font-semibold text-white">{primaryLabel}</Link>
                  {content.show_hero_secondary !== false ? (
                    <Link href={secondaryHref} className="inline-flex min-h-12 items-center border-b border-[#3b211f]/30 px-1 text-sm font-semibold">{secondaryLabel}<span className="ml-8">→</span></Link>
                  ) : null}
                </div>
              </div>
              {heroLayout !== "text" ? (
                <div className={`relative min-h-[420px] overflow-hidden lg:min-h-[600px] ${content.hero_image_fit === "contain" ? "bg-[#f8efed]" : ""} ${content.hero_image_placement === "left" ? "lg:order-1" : "lg:order-2"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage}
                    alt=""
                    fetchPriority="high"
                    className={`absolute inset-0 h-full w-full ${heroObjectClass(content.hero_image_fit, content.hero_image_position)}`}
                  />
                </div>
              ) : null}
            </div>
          </section>
        )
      ) : null}

      <div className="flex flex-col">
        {content.show_services && services.length ? (
          <section
            id="services"
            style={{ order: layoutPosition(sectionLayoutId("services")) }}
            className="px-5 py-16 sm:py-20"
          >
            <div className="mx-auto w-full max-w-[1240px]">
              <h2 className="text-center font-serif text-4xl sm:text-5xl">
                {content.services_title}
              </h2>
              <div className={`mt-8 grid gap-4 ${servicesLayout === "list" ? "grid-cols-1" : serviceGridClass(content.services_columns)}`}>
                {services.map((service, index) => {
                  const image = serviceImage(content, service, index);
                  return (
                    <article
                      key={service.id}
                      className={`overflow-hidden rounded-xl border border-[#3b211f]/10 bg-white p-2 ${servicesLayout === "list" ? "grid gap-3 sm:grid-cols-[220px_1fr]" : ""}`}
                    >
                      {image ? (
                        <div className={`relative overflow-hidden rounded-lg ${servicesLayout === "list" ? "min-h-40" : "aspect-[16/10]"}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                        </div>
                      ) : null}
                      <div className="flex flex-col px-2 pb-2 pt-4">
                        <h3 className="text-sm font-semibold">{service.title}</h3>
                        {content.services_show_description !== false && service.description ? (
                          <p className="mt-3 text-xs leading-6 text-[#7d6a66]">{service.description}</p>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                          {content.services_show_price !== false ? <span>{formatPrice(service, business.locale)}</span> : <span />}
                          {content.services_show_duration !== false ? (
                            <span className="text-[#8a7773]">{service.duration_min_minutes ? `${service.duration_min_minutes} минут` : ""}</span>
                          ) : null}
                        </div>
                        <Link
                          href={{ pathname: bookingHref, query: { service: service.slug } }}
                          className="mt-auto pt-4"
                        >
                          <span className="flex min-h-10 items-center justify-center rounded-md border border-[var(--site-accent)] text-xs font-semibold text-[var(--site-accent)]">
                            {content.services_button_label || "Подробнее"}
                          </span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {content.show_portfolio && portfolio.length ? (
          <section
            id="portfolio"
            style={{ order: layoutPosition(sectionLayoutId("portfolio")) }}
            className="px-5 pb-16 sm:pb-20"
          >
            <div className="mx-auto grid w-full max-w-[1240px] gap-8 lg:grid-cols-[1.45fr_0.72fr]">
              <div>
                <h2 className="font-serif text-4xl sm:text-5xl">
                  {content.portfolio_title}
                </h2>
                <div className="mt-5">
                  <PublicPortfolioGallery
                    projects={portfolio}
                    locale={business.locale}
                    layout={content.portfolio_layout ?? "masonry"}
                    columns={content.portfolio_columns ?? 3}
                    aspect={content.portfolio_card_aspect ?? "portrait"}
                    showFilters={content.portfolio_show_filters !== false}
                    showCategory={content.portfolio_show_category !== false}
                    showTitle={content.portfolio_show_title !== false}
                    showDescription={content.portfolio_show_description === true}
                    lightbox={content.portfolio_lightbox !== false}
                    limit={content.portfolio_home_limit ?? 9}
                    variant="gloss"
                  />
                </div>
              </div>

              <aside className="rounded-xl border border-[#3b211f]/10 bg-white p-5">
                <h3 className="font-serif text-3xl">
                  {content.popular_title || "Чаще выбирают"}
                </h3>
                <div className="mt-5 grid gap-3">
                  {services.slice(0, 3).map((service, index) => {
                    const project = portfolio[index];
                    return (
                      <Link
                        key={service.id}
                        href={{
                          pathname: bookingHref,
                          query: { service: service.slug },
                        }}
                        className="grid grid-cols-[92px_1fr] overflow-hidden rounded-lg border border-[#3b211f]/10"
                      >
                        <div className="relative min-h-[92px] bg-[#eadedb]">
                          {project?.image_url ? (
                            // Portfolio URLs may be local or workspace-owned.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.image_url}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm font-semibold">
                            {service.title}
                          </h4>
                          <p className="mt-2 text-xs text-[#806e6a]">
                            {formatPrice(service, business.locale)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {content.show_team && team.length ? (
          <section
            id="team"
            style={{ order: layoutPosition(sectionLayoutId("team")) }}
            className="px-5 pb-16 sm:pb-20"
          >
            <div className="mx-auto w-full max-w-[1240px]">
              <h2 className="font-serif text-4xl sm:text-5xl">
                {content.team_title}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((item, index) => {
                  const [name = "", role = "", ...descriptionParts] = item
                    .split("·")
                    .map((part) => part.trim());
                  const description = descriptionParts.join(" · ");
                  const image =
                    teamImages[index]
                    || MASTER_IMAGES[index % MASTER_IMAGES.length];

                  return (
                    <article
                      key={`${item}-${index}`}
                      className="overflow-hidden rounded-xl border border-[#3b211f]/10 bg-white"
                    >
                      <div className="relative aspect-[4/3] bg-[#eadde0]">
                        {/* Editable media URLs may point to the workspace CDN. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover object-top"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-2xl">{name}</h3>
                        {role ? (
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--site-accent)]">
                            {role}
                          </p>
                        ) : null}
                        {description ? (
                          <p className="mt-3 text-xs leading-5 text-[#77635f]">
                            {description}
                          </p>
                        ) : null}
                        <a
                          href="#portfolio"
                          className="mt-5 inline-block text-xs font-semibold text-[var(--site-accent)]"
                        >
                          Работы мастера →
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {content.show_booking !== false && capabilities.booking ? (
          <section
            id="booking"
            style={{ order: layoutPosition(sectionLayoutId("booking")) }}
            className="px-5 pb-6"
          >
            <div className="mx-auto w-full max-w-[1240px]">
              <GlossBookingPanel
                bookingHref={bookingHref}
                bookingLabel="Показать свободное время"
                services={services}
              />
            </div>
          </section>
        ) : null}

        {content.show_membership && (content.membership_text || lines(content.membership_items).length) ? (
          <section
            id="membership"
            style={{ order: layoutPosition(sectionLayoutId("membership")) }}
            className="px-5 py-10"
          >
            <div className="mx-auto w-full max-w-[1240px]">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--site-accent)]">
                    {content.membership_label}
                  </p>
                  <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                    {content.membership_title}
                  </h2>
                </div>
                {content.membership_text ? (
                  <p className="whitespace-pre-line text-sm leading-7 text-[#77635f]">
                    {content.membership_text}
                  </p>
                ) : null}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(lines(content.membership_items).length
                  ? lines(content.membership_items)
                  : lines(content.membership_text).map(
                      (benefit) => `${benefit} · · · Вступить · #contact`,
                    )
                ).map((item, index) => {
                  const [
                    title = "",
                    condition = "",
                    description = "",
                    buttonLabel = "Вступить",
                    buttonUrl = "",
                  ] = item.split("·").map((part) => part.trim());
                  const image =
                    content.membership_image_urls?.[index]
                    || content.membership_image_url
                    || "/templates/gloss/gloss-club.webp";

                  return (
                    <article
                      key={`${item}-${index}`}
                      className="overflow-hidden rounded-2xl border border-[#3b211f]/10 bg-white"
                    >
                      <div className="relative aspect-[4/3] bg-[#eadde0]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-serif text-2xl">{title}</h3>
                        {condition ? (
                          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--site-accent)]">
                            {condition}
                          </p>
                        ) : null}
                        {description ? (
                          <p className="mt-3 text-xs leading-6 text-[#77635f]">
                            {description}
                          </p>
                        ) : null}
                        <div className="mt-6">
                          {buttonUrl && !buttonUrl.startsWith("#") ? (
                            <a
                              href={buttonUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-full bg-[var(--site-dark)] px-5 py-3 text-xs font-semibold text-white"
                            >
                              {buttonLabel || "Вступить"}
                            </a>
                          ) : (
                            <GlossLeadDialog
                              businessSlug={business.slug}
                              kind="club"
                              buttonLabel={buttonLabel || "Вступить"}
                              currency={business.currency}
                            />
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {content.show_safety !== false && safety.length ? (
          <section
            id="safety"
            style={{ order: layoutPosition(sectionLayoutId("safety")) }}
            className="px-5 py-6"
          >
            <div className="mx-auto w-full max-w-[1240px] rounded-2xl border border-[#3b211f]/10 bg-white p-7 sm:p-10">
              {content.safety_label ? (
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--site-accent)]">
                  {content.safety_label}
                </p>
              ) : null}
              <h2 className="mt-3 text-center font-serif text-4xl">
                {content.safety_title || "Красиво и безопасно"}
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {safety.map((item, index) => {
                  const parts = item.split("·").map((part) => part.trim());
                  const hasIcon = parts.length >= 3;
                  const icon = hasIcon ? parts[0] : "";
                  const title = hasIcon ? parts[1] : parts[0] ?? "";
                  const description = (
                    hasIcon ? parts.slice(2) : parts.slice(1)
                  ).join(" · ");

                  return (
                    <article
                      key={`${item}-${index}`}
                      className="rounded-xl border border-[#3b211f]/10 bg-[#fffaf8] p-6 text-[#60312e]"
                    >
                      {icon ? (
                        <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--site-accent)]/25 text-xl text-[var(--site-accent)]">
                          {icon}
                        </span>
                      ) : (
                        <SafetyIcon index={index % 3} />
                      )}
                      <h3 className="mt-5 text-sm font-semibold">{title}</h3>
                      {description ? (
                        <p className="mt-2 text-xs leading-5 text-[#7d6864]">
                          {description}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {content.show_reviews && reviews.length ? (
          <section
            id="reviews"
            style={{ order: layoutPosition(sectionLayoutId("reviews")) }}
            className="px-5 py-6"
          >
            <div className="mx-auto w-full max-w-[1240px] rounded-2xl border border-[#3b211f]/10 bg-white p-8 text-center sm:p-12">
              <h2 className="font-serif text-4xl">
                {content.reviews_title}
              </h2>
              <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
                {reviews.map((review) => (
                  <blockquote
                    key={review.id}
                    className="flex min-h-64 flex-col rounded-xl border border-[#3b211f]/10 bg-[#fffaf8] p-6"
                  >
                    <p
                      className="text-sm tracking-[0.2em] text-[var(--site-accent)]"
                      aria-label={`${review.rating} из 5`}
                    >
                      {"★".repeat(review.rating)}
                      <span className="text-black/10">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </p>
                    <p className="mt-5 flex-1 text-sm leading-7 text-[#66514e]">
                      “{review.text}”
                    </p>
                    <footer className="mt-6 border-t border-black/8 pt-4">
                      <p className="font-serif text-xl">{review.author}</p>
                      {review.source ? (
                        review.source_url ? (
                          <a
                            href={review.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--site-accent)]"
                          >
                            {review.source} ↗
                          </a>
                        ) : (
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">
                            {review.source}
                          </p>
                        )
                      ) : null}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {content.show_gift && content.gift_text ? (
          <section
            id="gift"
            style={{ order: layoutPosition(sectionLayoutId("gift")) }}
            className="px-5 py-10"
          >
            <div className="mx-auto w-full max-w-[1240px]">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--site-accent)]">
                    {content.gift_label}
                  </p>
                  <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                    {content.gift_title}
                  </h2>
                </div>
                <p className="text-sm leading-7 text-[#77635f]">
                  {content.gift_text}
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lines(content.gift_items || "").map((item, index) => {
                  const [
                    title = "",
                    amount = "",
                    description = "",
                    buttonLabel = "Выбрать",
                    buttonUrl = "",
                  ] = item.split("·").map((part) => part.trim());
                  const image =
                    content.gift_image_urls?.[index]
                    || content.gift_image_url
                    || "/templates/gloss/gloss-gift.webp";

                  return (
                    <article
                      key={`${item}-${index}`}
                      className="overflow-hidden rounded-2xl border border-[#3b211f]/10 bg-white"
                    >
                      <div className="relative aspect-[4/3] bg-[#eadde0]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt={title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-serif text-2xl">{title}</h3>
                        {amount ? (
                          <p className="mt-3 text-xl font-semibold text-[var(--site-accent)]">
                            {amount}
                          </p>
                        ) : null}
                        {description ? (
                          <p className="mt-3 text-xs leading-6 text-[#77635f]">
                            {description}
                          </p>
                        ) : null}
                        <div className="mt-6">
                          {buttonUrl && !buttonUrl.startsWith("#") ? (
                            <a
                              href={buttonUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-full bg-[var(--site-dark)] px-5 py-3 text-xs font-semibold text-white"
                            >
                              {buttonLabel || "Выбрать"}
                            </a>
                          ) : (
                            <GlossLeadDialog
                              businessSlug={business.slug}
                              kind="gift"
                              buttonLabel={buttonLabel || "Выбрать"}
                              currency={business.currency}
                            />
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {content.show_faq && content.faq_items ? (
          <section
            id="faq"
            style={{ order: layoutPosition(sectionLayoutId("faq")) }}
            className="px-5 py-16"
          >
            <div className="mx-auto grid w-full max-w-[1240px] gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <h2 className="font-serif text-4xl sm:text-5xl">
                {content.faq_title}
              </h2>
              <div className="divide-y divide-[#3b211f]/10 border-y border-[#3b211f]/10">
                {lines(content.faq_items).map((item) => {
                  const [question, ...answer] = item.split("|");
                  return (
                    <details key={item} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold">
                        {question.trim()}
                        <span className="text-[var(--site-accent)] transition group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-4 pr-10 text-sm leading-7 text-[#75615d]">
                        {answer.join("|").trim()}
                      </p>
                    </details>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {content.show_about
        && (
          content.about_text
          || content.about_image_url
          || lines(content.about_facts).length
        ) ? (
          <section
            id="about"
            style={{ order: layoutPosition(sectionLayoutId("about")) }}
            className="px-5 py-16"
          >
            <div className="mx-auto w-full max-w-[1240px] border-t border-[#3b211f]/10 pt-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-accent)]">
                {content.about_label}
              </p>
              <div className={`mt-7 grid gap-9 ${content.about_image_url ? "lg:grid-cols-[0.9fr_1.1fr] lg:items-center" : ""}`}>
                {content.about_image_url ? (
                  <div className="overflow-hidden rounded-lg bg-[#eadedb]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={content.about_image_url}
                      alt={content.about_title}
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <h2 className="font-serif text-4xl sm:text-5xl">
                    {content.about_title}
                  </h2>
                  {content.about_text ? (
                    <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-[#6c5753]">
                      {content.about_text}
                    </p>
                  ) : null}
                  {lines(content.about_facts).length ? (
                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                      {lines(content.about_facts).map((item, index) => {
                        const [value = "", ...labelParts] = item
                          .split("·")
                          .map((part) => part.trim());
                        const label = labelParts.join(" · ");
                        return (
                          <article key={`${item}-${index}`} className="rounded-lg border border-[#3b211f]/10 bg-white p-5">
                            <p className="font-serif text-3xl">{value}</p>
                            {label ? (
                              <p className="mt-2 text-xs leading-5 text-[#75615d]">
                                {label}
                              </p>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  ) : null}
                  {content.about_button_label ? (
                    <a
                      href={content.about_button_url || "#contact"}
                      className="mt-8 inline-flex min-h-12 items-center rounded-md bg-[var(--site-accent)] px-7 text-sm font-semibold text-white"
                    >
                      {content.about_button_label}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {customBlocks.map((block) => (
          <div
            key={block.id}
            style={{ order: layoutPosition(customBlockLayoutId(block.id)) }}
          >
            <PublicCustomBlock
              block={block}
              bookingHref={bookingHref}
              services={services}
            />
          </div>
        ))}

        {content.show_contact ? (
          <section
            id="contact"
            style={{ order: layoutPosition(sectionLayoutId("contact")) }}
            className="px-5 pb-6 pt-10"
          >
            <div className="mx-auto grid w-full max-w-[1240px] overflow-hidden rounded-2xl border border-[#3b211f]/10 bg-white lg:grid-cols-[0.8fr_1.2fr]">
              <div className="p-8 sm:p-10">
                <h2 className="font-serif text-4xl">
                  {content.contact_title || "Ждём вас"}
                </h2>
                <address className="mt-6 space-y-3 text-sm not-italic text-[#67534f]">
                  <p>◷ {hours}</p>
                  <p>⌖ {address}</p>
                  {email ? (
                    <p>
                      ✉ <a href={`mailto:${email}`} className="font-semibold underline-offset-4 hover:underline">{email}</a>
                    </p>
                  ) : null}
                  {phone ? (
                    <p>
                      ☎ <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-semibold underline-offset-4 hover:underline">{phone}</a>
                    </p>
                  ) : null}
                </address>
                {contactNote ? (
                  <p className="mt-5 whitespace-pre-line text-sm leading-6 text-[#67534f]">
                    {contactNote}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-md bg-[var(--site-accent)] px-6 text-xs font-semibold text-white"
                  >
                    {routeLabel}
                  </a>
                  <PublicSocialLinks content={content} />
                </div>
              </div>
              <div className="min-h-[320px] overflow-hidden bg-[#eee7df]">
                <iframe
                  title={`Карта: ${address}`}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[320px] w-full border-0"
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <footer className="mt-8 bg-[var(--site-accent)] px-5 py-10 text-white">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 sm:grid-cols-[0.8fr_1.4fr_0.8fr] sm:items-center">
          <div>
            <GlossLogo
              href={homeHref}
              logoUrl={company.logo_url}
              brandName={brandName}
              light
            />
            {content.footer_note ? (
              <p className="mt-4 max-w-xs whitespace-pre-line text-xs leading-5 text-white/70">
                {content.footer_note}
              </p>
            ) : null}
          </div>
          <nav className="flex flex-wrap justify-start gap-x-7 gap-y-3 text-xs sm:justify-center">
            {content.show_services ? <a href="#services">{content.services_label || "Услуги"}</a> : null}
            {content.show_portfolio ? <a href="#portfolio">{content.portfolio_label || "Дизайны"}</a> : null}
            {content.show_team ? <a href="#team">{content.team_label || "Мастера"}</a> : null}
            {content.show_about ? <a href="#about">{content.about_label || "О студии"}</a> : null}
            {content.show_contact ? <a href="#contact">{content.contact_label || "Контакты"}</a> : null}
          </nav>
          <div className="grid gap-4 sm:justify-items-end">
            <PublicSocialLinks content={content} light />
            <div className="grid gap-1 text-xs text-white/75 sm:text-right">
              {email ? <a href={`mailto:${email}`}>{email}</a> : null}
              {phone ? <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a> : null}
            </div>
          </div>
        </div>
        <p className="mx-auto mt-7 max-w-[1240px] border-t border-white/20 pt-5 text-center text-[10px] text-white/65">
          © {new Date().getFullYear()} {brandName} · Сайт и система управления созданы на OneStudio OS
        </p>
      </footer>
      <PublicSiteAnalytics content={content} />
      <BackToDashboardButton />
    </main>
  );
}
