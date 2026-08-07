import Link from "next/link";
import type {
  PublicSiteData,
  PublicSiteSection,
  PublicSiteService,
} from "@/lib/public-site/types";
import {
  publicCustomPagePath,
  publicSitePagePath,
  publicSitePath,
} from "@/lib/public-site/metadata";
import BackToDashboardButton from "@/components/public/BackToDashboardButton";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicRichText from "@/components/public/PublicRichText";
import PublicReveal from "@/components/public/PublicReveal";
import PublicSiteAnalytics from "@/components/public/PublicSiteAnalytics";
import PublicSocialLinks from "@/components/public/PublicSocialLinks";
import PublicMobileMenu from "@/components/public/PublicMobileMenu";
import PublicPortfolioGallery from "@/components/public/PublicPortfolioGallery";
import { publicSiteReviews } from "@/lib/public-site/content";
import { sectionColorStyle } from "@/lib/public-site/colors";
import { richTextPlainText } from "@/lib/public-site/rich-text";
import { publicSiteDesignClass } from "@/lib/public-site/design-system";
import {
  publicSystemSectionAnimation,
  publicSystemSectionClass,
  publicSystemSectionContentClass,
  publicSystemSectionHeadingClass,
  publicSystemSectionHeadingStyle,
  publicSystemSectionStyle,
} from "@/lib/public-site/system-sections";
import {
  customBlockLayoutId,
  resolvePublicSiteLayoutOrder,
  sectionLayoutId,
} from "@/lib/public-site/layout";

function lines(value?: string) {
  return richTextPlainText(value).split("\n").map((item) => item.trim()).filter(Boolean);
}

function labeledLine(value: string) {
  const [title, ...rest] = value.split("·").map((item) => item.trim());
  return { title, detail: rest.join(" · ") };
}

function formatPrice(service: PublicSiteService, locale: string) {
  const language = locale.split("-")[0];
  const labels = {
    ru: { free: "Бесплатно", request: "По запросу", hour: "ч", person: "чел." },
    uk: { free: "Безкоштовно", request: "За запитом", hour: "год", person: "особа" },
    pl: { free: "Bezpłatnie", request: "Na zapytanie", hour: "godz.", person: "os." },
    en: { free: "Free", request: "On request", hour: "h", person: "person" },
  }[language] ?? { free: "Free", request: "On request", hour: "h", person: "person" };

  if (service.pricing_model === "free") return labels.free;
  if (service.pricing_model === "quote" || service.price_minor === null) {
    return labels.request;
  }

  try {
    const value = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: service.currency,
      maximumFractionDigits: service.price_minor % 100 === 0 ? 0 : 2,
    }).format(service.price_minor / 100);

    if (service.pricing_model === "per_hour") return `${value} / ${labels.hour}`;
    if (service.pricing_model === "per_person") return `${value} / ${labels.person}`;
    return value;
  } catch {
    return `${(service.price_minor / 100).toFixed(2)} ${service.currency}`;
  }
}

function durationLabel(service: PublicSiteService) {
  const minimum = service.duration_min_minutes;
  const maximum = service.duration_max_minutes;
  if (!minimum) return "";
  if (maximum && maximum !== minimum) return `${minimum}–${maximum} min`;
  return `${minimum} min`;
}

function serviceImage(content: PublicSiteData["content"], service: PublicSiteService, index: number) {
  if (Object.prototype.hasOwnProperty.call(content.service_card_images ?? {}, service.slug)) {
    return content.service_card_images?.[service.slug] ?? "";
  }
  return content.service_image_urls?.[index] || "";
}

function serviceGridClass(columns: number | undefined) {
  if (columns === 2) return "md:grid-cols-2";
  if (columns === 4) return "md:grid-cols-2 xl:grid-cols-4";
  return "md:grid-cols-2 lg:grid-cols-3";
}

function requestLabels(locale: string) {
  const language = locale.split("-")[0];
  return {
    ru: { general: "Обсудить проект", service: "Оставить заявку" },
    uk: { general: "Обговорити проєкт", service: "Залишити заявку" },
    pl: { general: "Omów projekt", service: "Wyślij zapytanie" },
    en: { general: "Discuss your project", service: "Send request" },
  }[language] ?? { general: "Discuss your project", service: "Send request" };
}

function contactLabels(locale: string) {
  const language = locale.split("-")[0];
  return {
    ru: { route: "Открыть карту", hours: "Часы работы", mapMissing: "Добавьте адрес для карты в редакторе контактов." },
    uk: { route: "Відкрити карту", hours: "Години роботи", mapMissing: "Додайте адресу для карти в редакторі контактів." },
    pl: { route: "Otwórz mapę", hours: "Godziny otwarcia", mapMissing: "Dodaj adres mapy w edytorze kontaktów." },
    en: { route: "Open map", hours: "Opening hours", mapMissing: "Add a map address in the contact editor." },
  }[language] ?? { route: "Open map", hours: "Opening hours", mapMissing: "Add a map address in the contact editor." };
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

function logoSizeClass(size: "small" | "medium" | "large" | undefined) {
  if (size === "small") return "max-h-9 max-w-[150px]";
  if (size === "large") return "max-h-[68px] max-w-[280px]";
  return "max-h-14 max-w-[220px]";
}

function heroTitleSizeClass(
  size: "small" | "medium" | "large" | undefined,
) {
  if (size === "small") return "text-4xl";
  if (size === "large") return "text-6xl";
  return "text-5xl";
}

function menuLabels(locale: string) {
  const language = locale.split("-")[0];
  return {
    ru: { menu: "Меню", close: "Закрыть" },
    uk: { menu: "Меню", close: "Закрити" },
    pl: { menu: "Menu", close: "Zamknij" },
    en: { menu: "Menu", close: "Close" },
  }[language] ?? { menu: "Menu", close: "Close" };
}

export default function PublicBusinessSite({ site }: { site: PublicSiteData }) {
  const {
    business,
    company,
    content,
    services,
    portfolio,
    capabilities,
    available_locales: availableLocales,
  } = site;
  const bookingHref = `/book/${business.slug}`;
  const requestHref = `/request/${business.slug}`;
  const portfolioPage =
    content.pages?.find(
      (page) => page.type === "portfolio" && page.is_visible !== false,
    ) ?? null;
  const customPages =
    content.pages?.filter(
      (page) =>
        page.type === "custom" &&
        page.is_visible !== false &&
        page.show_in_navigation,
    ) ?? [];
  const portfolioPageHref = portfolioPage
    ? publicSitePagePath(
        business.slug,
        portfolioPage.slug,
        business.locale === business.primary_locale ? null : business.locale,
      )
    : null;
  const requestCopy = requestLabels(business.locale);
  const contactCopy = contactLabels(business.locale);
  const brandName = content.brand_name || company.display_name || business.name;
  const contactEmail = content.contact_email?.trim() || company.email?.trim() || "";
  const contactPhone = content.contact_phone?.trim() || company.phone?.trim() || "";
  const contactAddress = content.contact_address?.trim() || company.address?.trim() || "";
  const contactHours = content.contact_hours?.trim() || "";
  const contactNote = richTextPlainText(content.contact_note).trim();
  const mapQuery = (content.map_query?.trim() || contactAddress).trim();
  const mapHref = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : "";
  const hasSocialLinks = Boolean(
    content.show_social_icons === true
    && (content.social_links ?? []).some((item) => item.platform && item.url),
  );
  const hasContact = Boolean(
    contactEmail
    || contactPhone
    || contactAddress
    || contactHours
    || contactNote
    || mapQuery
    || hasSocialLinks,
  );
  const showServices = content.show_services && services.length > 0;
  const showPortfolio = content.show_portfolio && portfolio.length > 0;
  const showAbout = Boolean(
    content.show_about
    && (
      content.about_text
      || content.about_image_url
      || lines(content.about_facts).length
    ),
  );
  const showContact = content.show_contact && hasContact;
  const showTeam = Boolean(content.show_team && lines(content.team_items).length);
  const reviews = publicSiteReviews(content);
  const showReviews = Boolean(content.show_reviews && reviews.length);
  const showMembership = Boolean(
    content.show_membership
    && (content.membership_text || lines(content.membership_items).length),
  );
  const showGift = Boolean(content.show_gift && content.gift_text);
  const showFaq = Boolean(content.show_faq && lines(content.faq_items).length);
  const showSafety = Boolean(
    content.show_safety !== false && lines(content.safety_items).length,
  );
  const sectionOrder = resolvePublicSiteLayoutOrder(content);
  const sectionPosition = (section: PublicSiteSection) => {
    const position = sectionOrder.indexOf(sectionLayoutId(section));
    return position === -1 ? sectionOrder.length : position;
  };
  const headerLogoPosition = content.header_logo_position ?? "left";
  const headerLogoSize = content.header_logo_size ?? "medium";
  const menuText = menuLabels(business.locale);
  const heroLayout = content.hero_layout ?? "split";
  const primaryHref = safeActionHref(
    content.hero_primary_url,
    capabilities.booking ? bookingHref : requestHref,
  );
  const primaryLabel =
    content.hero_primary_label?.trim()
    || (capabilities.booking ? content.booking_label : requestCopy.general);
  const secondaryHref = safeActionHref(content.hero_secondary_url, requestHref);
  const secondaryLabel =
    content.hero_secondary_label?.trim() || requestCopy.general;
  const navigationItems = [
    ...(showServices ? [{ href: "#services", label: content.services_label }] : []),
    ...(portfolioPage?.show_in_navigation && portfolioPageHref
      ? [{ href: portfolioPageHref, label: portfolioPage.nav_label }]
      : showPortfolio
        ? [{ href: "#portfolio", label: content.portfolio_label }]
        : []),
    ...customPages.map((page) => ({
      href: publicCustomPagePath(
        business.slug,
        page.slug,
        business.locale === business.primary_locale ? null : business.locale,
      ),
      label: page.nav_label,
    })),
    ...(showAbout ? [{ href: "#about", label: content.about_label }] : []),
    ...(showContact ? [{ href: "#contact", label: content.contact_label }] : []),
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
      className={publicSiteDesignClass(content, "min-h-screen text-[#191b20]")}
      style={{
        backgroundColor: content.theme_surface ?? "#f3f0e9",
        "--site-accent": content.theme_accent ?? "#9a742e",
        "--site-dark": content.theme_dark ?? "#191b20",
        "--site-surface": content.theme_surface ?? "#f3f0e9",
      } as React.CSSProperties}
    >
      <header
        className={content.header_sticky === true
          ? "sticky top-0 z-50 border-b border-black/10 backdrop-blur-xl"
          : "absolute inset-x-0 top-0 z-40"}
        style={content.header_sticky === true
          ? { backgroundColor: content.theme_surface ?? "#f3f0e9" }
          : undefined}
      >
        <div className="relative mx-auto flex h-24 w-[calc(100%_-_40px)] max-w-[1240px] items-center justify-between gap-4 border-b border-black/10">
          <div className={headerLogoPosition === "center" ? "absolute left-1/2 -translate-x-1/2" : "shrink-0"}>
            <Link
              href={`/site/${business.slug}`}
              className="flex max-w-[55vw] items-center"
              aria-label={brandName}
            >
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt={brandName}
                  className={`${logoSizeClass(headerLogoSize)} object-contain object-left`}
                />
              ) : (
                <span className="truncate text-sm font-semibold uppercase tracking-[0.2em]">
                  {brandName}
                </span>
              )}
            </Link>
          </div>

          {headerLogoPosition === "left" ? (
            <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
              {navigationItems.map((item) => (
                item.href.startsWith("#") ? (
                  <a key={`${item.href}-${item.label}`} href={item.href} className="text-xs font-semibold text-black/60">
                    {item.label}
                  </a>
                ) : (
                  <Link key={`${item.href}-${item.label}`} href={item.href} className="text-xs font-semibold text-black/60">
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          ) : (
            <div className="mr-auto">
              <PublicMobileMenu
                items={navigationItems}
                locales={localeItems}
                action={{ href: primaryHref, label: primaryLabel }}
                menuLabel={menuText.menu}
                closeLabel={menuText.close}
                alwaysVisible
              />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {headerLogoPosition === "left" ? (
              <PublicMobileMenu
                items={navigationItems}
                locales={localeItems}
                action={{ href: primaryHref, label: primaryLabel }}
                menuLabel={menuText.menu}
                closeLabel={menuText.close}
              />
            ) : null}
            {availableLocales.length > 1 ? (
              <nav aria-label="Language" className="hidden items-center gap-1 xl:flex">
                {availableLocales.map((locale) => (
                  <Link
                    key={locale}
                    href={publicSitePath(
                      business.slug,
                      locale === business.primary_locale ? null : locale,
                    )}
                    hrefLang={locale}
                    aria-current={locale === business.locale ? "page" : undefined}
                    className={`rounded-full px-2.5 py-2 text-[10px] font-semibold uppercase ${locale === business.locale ? "bg-white/70 text-black" : "text-black/40"}`}
                  >
                    {locale}
                  </Link>
                ))}
              </nav>
            ) : null}
            <Link
              href={primaryHref}
              className="os-site-button hidden rounded-full bg-[var(--site-dark)] px-5 py-3 text-xs font-semibold text-white sm:inline-flex"
            >
              {primaryLabel}
            </Link>
          </div>
        </div>
      </header>

      {content.show_hero !== false ? (
        heroLayout === "cover" && content.hero_image_url ? (
          <section className={`relative isolate min-h-[680px] overflow-hidden px-5 ${content.header_sticky === true ? "py-24" : "pb-24 pt-40"} text-white sm:min-h-[760px] sm:py-32`} style={sectionColorStyle(content, "hero")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.hero_image_url}
              alt=""
              fetchPriority="high"
              className={`absolute inset-0 -z-20 h-full w-full ${heroObjectClass(content.hero_image_fit, content.hero_image_position)}`}
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(25,27,32,0.86),rgba(25,27,32,0.48),rgba(25,27,32,0.12))]" />
            <div className="mx-auto flex min-h-[520px] w-full max-w-[1240px] items-center">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">{content.hero_eyebrow}</p>
                <h1 style={publicSystemSectionHeadingStyle(content, "hero")} className={publicSystemSectionHeadingClass(content, "hero", `mt-7 break-words font-semibold tracking-[-0.065em] [overflow-wrap:anywhere] sm:text-7xl lg:text-[92px] lg:leading-[0.96] ${heroTitleSizeClass(content.hero_title_mobile_size)}`)}>{content.hero_title}</h1>
                <PublicRichText value={content.hero_text} className="mt-8 max-w-xl text-base leading-8 text-white/75 sm:text-lg" />
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryHref} className="os-site-button inline-flex min-h-14 items-center rounded-full bg-[var(--site-accent)] px-7 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">{primaryLabel}</Link>
                  {content.show_hero_secondary !== false ? (
                    <Link href={secondaryHref} className="os-site-button inline-flex min-h-14 items-center rounded-full border border-white/35 px-7 text-sm font-semibold text-white">{secondaryLabel}<span aria-hidden="true" className="ml-8">→</span></Link>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className={`relative isolate overflow-hidden px-5 pb-24 ${content.header_sticky === true ? "pt-20" : "pt-40"} sm:pb-32 ${content.header_sticky === true ? "sm:pt-28" : "sm:pt-48"}`} style={sectionColorStyle(content, "hero")}>
            <div className="absolute -right-24 top-12 -z-10 h-[460px] w-[460px] rounded-full border border-[var(--site-accent)]/20" />
            <div className="absolute right-20 top-36 -z-10 h-[280px] w-[280px] rounded-full bg-[var(--site-accent)]/10 blur-3xl" />
            <div className={`mx-auto grid w-full max-w-[1240px] gap-12 ${heroLayout === "text" || !content.hero_image_url ? "lg:grid-cols-1" : "lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch"}`}>
              <div className={content.hero_image_placement === "left" ? "lg:order-2" : "lg:order-1"}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--site-accent)]">{content.hero_eyebrow}</p>
                <h1 style={publicSystemSectionHeadingStyle(content, "hero")} className={publicSystemSectionHeadingClass(content, "hero", `mt-7 max-w-4xl break-words font-semibold tracking-[-0.065em] [overflow-wrap:anywhere] sm:text-7xl lg:text-[92px] lg:leading-[0.96] ${heroTitleSizeClass(content.hero_title_mobile_size)}`)}>{content.hero_title}</h1>
                <PublicRichText value={content.hero_text} className="mt-8 max-w-xl text-base leading-8 text-[#656159] sm:text-lg" />
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryHref} className="os-site-button inline-flex min-h-14 items-center rounded-full bg-[var(--site-dark)] px-7 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(25,27,32,0.18)]">{primaryLabel}</Link>
                  {content.show_hero_secondary !== false ? (
                    <Link href={secondaryHref} className="os-site-button inline-flex min-h-14 items-center rounded-full border border-black/15 px-7 text-sm font-semibold text-black/65">{secondaryLabel}<span aria-hidden="true" className="ml-8 text-[var(--site-accent)]">→</span></Link>
                  ) : null}
                </div>
              </div>
              {heroLayout !== "text" && content.hero_image_url ? (
                <div className={`relative min-h-[420px] overflow-hidden rounded-[36px] shadow-[0_35px_90px_rgba(50,23,34,0.16)] lg:min-h-[620px] ${content.hero_image_fit === "contain" ? "bg-white" : ""} ${content.hero_image_placement === "left" ? "lg:order-1" : "lg:order-2"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.hero_image_url}
                    alt=""
                    className={`absolute inset-0 h-full w-full ${heroObjectClass(content.hero_image_fit, content.hero_image_position)}`}
                    fetchPriority="high"
                  />
                  {content.hero_image_fit === "contain" ? null : <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--site-dark)]/35 to-transparent" />}
                </div>
              ) : null}
            </div>
          </section>
        )
      ) : null}

      <div className="flex flex-col">
      {showServices ? (
        <PublicReveal
            id="services"
            {...publicSystemSectionAnimation(content, "services")}
            style={publicSystemSectionStyle(content, "services", { order: sectionPosition("services") })}
            className={publicSystemSectionClass(content, "services", "border-y border-black/8 bg-[var(--site-dark)] py-24 text-white sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "services")}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b36a]">
              {content.services_label}
            </p>
            <h2 style={publicSystemSectionHeadingStyle(content, "services")} className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {content.services_title}
            </h2>
            <div className={`mt-14 grid ${content.services_layout === "list" ? "grid-cols-1 gap-4" : `border-l border-t border-white/12 ${serviceGridClass(content.services_columns)}`}`}>
              {services.map((service, index) => {
                const image = serviceImage(content, service, index);
                return (
                  <article key={service.id} className={`os-site-card ${content.services_layout === "list" ? "grid overflow-hidden rounded-2xl border border-white/12 md:grid-cols-[260px_1fr]" : "min-h-72 border-b border-r border-white/12"}`}>
                    {image ? (
                      <div className={`${content.services_layout === "list" ? "min-h-52" : "aspect-[16/10]"} overflow-hidden`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex h-full flex-col p-7">
                      <div className="flex items-start justify-between gap-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/40">{service.kind}</p>
                        {content.services_show_price !== false ? <p className="text-sm font-semibold text-[#d8b36a]">{formatPrice(service, business.locale)}</p> : null}
                      </div>
                      <h3 className="mt-8 text-2xl font-semibold tracking-[-0.04em]">{service.title}</h3>
                      {content.services_show_description !== false && service.description ? (
                        <p className="mt-4 text-sm leading-6 text-white/55">{service.description}</p>
                      ) : null}
                      {content.services_show_duration !== false && durationLabel(service) ? (
                        <p className="mt-6 text-xs uppercase tracking-[0.15em] text-white/35">{durationLabel(service)}</p>
                      ) : null}
                      <Link
                        href={capabilities.booking ? { pathname: bookingHref, query: { service: service.slug } } : { pathname: requestHref, query: { subject: service.title } }}
                        className="mt-auto inline-flex items-center gap-4 pt-8 text-sm font-semibold text-[#d8b36a]"
                      >
                        {content.services_button_label || (capabilities.booking ? content.booking_label : requestCopy.service)}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showPortfolio ? (
        <PublicReveal
            id="portfolio"
            {...publicSystemSectionAnimation(content, "portfolio")}
            style={publicSystemSectionStyle(content, "portfolio", { order: sectionPosition("portfolio") })}
            className={publicSystemSectionClass(content, "portfolio", "py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "portfolio")}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a742e]">
              {content.portfolio_label}
            </p>
            <h2 style={publicSystemSectionHeadingStyle(content, "portfolio")} className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {content.portfolio_title}
            </h2>
            <div className="mt-14">
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
                limit={content.portfolio_home_limit ?? 9}
              />
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showAbout ? (
        <PublicReveal
            id="about"
            {...publicSystemSectionAnimation(content, "about")}
            style={publicSystemSectionStyle(content, "about", { order: sectionPosition("about") })}
            className={publicSystemSectionClass(content, "about", "py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "about", "border-t border-black/10 pt-16")}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">
              {content.about_label}
            </p>
            <div className={`mt-8 grid gap-10 ${content.about_image_url ? "lg:grid-cols-[0.9fr_1.1fr] lg:items-center" : ""}`}>
              {content.about_image_url ? (
                <div className="overflow-hidden rounded-[30px] bg-black/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.about_image_url}
                    alt={content.about_title}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div>
                <h2 style={publicSystemSectionHeadingStyle(content, "about")} className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                  {content.about_title}
                </h2>
                {content.about_text ? (
                  <PublicRichText value={content.about_text} className="mt-8 max-w-3xl text-base leading-8 text-[#656159] sm:text-lg" />
                ) : null}
                {lines(content.about_facts).length ? (
                  <div className="mt-9 grid gap-3 sm:grid-cols-3">
                    {lines(content.about_facts).map((item, index) => {
                      const fact = labeledLine(item);
                      return (
                        <article key={`${item}-${index}`} className="os-site-card rounded-2xl border border-black/10 bg-white/60 p-5">
                          <p className="text-2xl font-semibold tracking-[-0.04em]">
                            {fact.title}
                          </p>
                          {fact.detail ? (
                            <p className="mt-2 text-xs leading-5 text-black/50">
                              {fact.detail}
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
                    className="os-site-button mt-9 inline-flex min-h-12 items-center rounded-full bg-[var(--site-dark)] px-7 text-sm font-semibold text-white"
                  >
                    {content.about_button_label}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showTeam ? (
        <PublicReveal
            id="team"
            {...publicSystemSectionAnimation(content, "team")}
            style={publicSystemSectionStyle(content, "team", { order: sectionPosition("team") })}
            className={publicSystemSectionClass(content, "team", "py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "team")}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">
              {content.team_label}
            </p>
            <h2 style={publicSystemSectionHeadingStyle(content, "team")} className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {content.team_title}
            </h2>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lines(content.team_items).map((item, index) => {
                const [name = "", role = "", ...descriptionParts] = item
                  .split("·")
                  .map((part) => part.trim());
                const description = descriptionParts.join(" · ");
                const image = content.team_image_urls?.[index] ?? "";

                return (
                  <article
                    key={`${item}-${index}`}
                    className="os-site-card overflow-hidden rounded-[28px] border border-black/8 bg-white/70"
                  >
                    {image ? (
                      <div className="aspect-[4/3] overflow-hidden bg-black/5">
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center bg-[var(--site-dark)] text-4xl font-semibold text-white">
                        {name.slice(0, 1)}
                      </div>
                    )}
                    <div className="p-7">
                      <h3 className="text-2xl font-semibold">{name}</h3>
                      {role ? (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-accent)]">
                          {role}
                        </p>
                      ) : null}
                      {description ? (
                        <p className="mt-4 text-sm leading-6 text-black/55">
                          {description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showSafety ? (
        <PublicReveal
            id="safety"
            {...publicSystemSectionAnimation(content, "safety")}
            style={publicSystemSectionStyle(content, "safety", { order: sectionPosition("safety") })}
            className={publicSystemSectionClass(content, "safety", "py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "safety")}>
            <div className="max-w-3xl">
              {content.safety_label ? (
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">
                  {content.safety_label}
                </p>
              ) : null}
              <h2 style={publicSystemSectionHeadingStyle(content, "safety")} className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                {content.safety_title || "Безопасность и гарантии"}
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lines(content.safety_items).map((item, index) => {
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
                    className="os-site-card rounded-[28px] border border-black/8 bg-white/70 p-7"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--site-accent)]/25 text-xl text-[var(--site-accent)]">
                      {icon || (index === 0 ? "⌁" : index === 1 ? "◒" : "◇")}
                    </span>
                    <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                    {description ? (
                      <p className="mt-3 text-sm leading-6 text-black/55">
                        {description}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showReviews ? (
        <PublicReveal
            id="reviews"
            {...publicSystemSectionAnimation(content, "reviews")}
            style={publicSystemSectionStyle(content, "reviews", { order: sectionPosition("reviews") })}
            className={publicSystemSectionClass(content, "reviews", "bg-[var(--site-dark)] py-24 text-white sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "reviews")}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">{content.reviews_label}</p>
            <h2 style={publicSystemSectionHeadingStyle(content, "reviews")} className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{content.reviews_title}</h2>
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {reviews.map((review) => (
                <blockquote key={review.id} className="os-site-card rounded-[28px] border border-white/12 bg-white/5 p-7 text-base leading-8 text-white/75">
                  <p className="text-[#d8b36a]">
                    {"★".repeat(review.rating)}
                  </p>
                  <p className="mt-4">“{review.text}”</p>
                  <footer className="mt-6 text-sm font-semibold text-white">
                    {review.author}
                    {review.source ? ` · ${review.source}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showMembership ? (
        <PublicReveal
            id="membership"
            {...publicSystemSectionAnimation(content, "membership")}
            style={publicSystemSectionStyle(content, "membership", { order: sectionPosition("membership") })}
            className={publicSystemSectionClass(content, "membership", "py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "membership")}>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">
                  {content.membership_label}
                </p>
                <h2 style={publicSystemSectionHeadingStyle(content, "membership")} className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                  {content.membership_title}
                </h2>
              </div>
              {content.membership_text ? (
                <PublicRichText value={content.membership_text} className="text-base leading-8 text-black/60" />
              ) : null}
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  buttonUrl = "#contact",
                ] = item.split("·").map((part) => part.trim());
                const image =
                  content.membership_image_urls?.[index]
                  || content.membership_image_url
                  || "";

                return (
                  <article
                    key={`${item}-${index}`}
                    className="os-site-card overflow-hidden rounded-[28px] border border-black/8 bg-white/70"
                  >
                    {image ? (
                      <div className="aspect-[4/3] overflow-hidden bg-black/5">
                        <img
                          src={image}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="p-7">
                      <h3 className="text-2xl font-semibold">{title}</h3>
                      {condition ? (
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-accent)]">
                          {condition}
                        </p>
                      ) : null}
                      {description ? (
                        <p className="mt-4 text-sm leading-6 text-black/55">
                          {description}
                        </p>
                      ) : null}
                      <a
                        href={buttonUrl || "#contact"}
                        className="os-site-button mt-6 inline-flex rounded-full bg-[var(--site-dark)] px-5 py-3 text-xs font-semibold text-white"
                      >
                        {buttonLabel || "Вступить"}
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showGift ? (
        <PublicReveal
            id="gift"
            {...publicSystemSectionAnimation(content, "gift")}
            style={publicSystemSectionStyle(content, "gift", { order: sectionPosition("gift") })}
            className={publicSystemSectionClass(content, "gift", "py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "gift")}>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">{content.gift_label}</p>
                <h2 style={publicSystemSectionHeadingStyle(content, "gift")} className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{content.gift_title}</h2>
              </div>
              <PublicRichText value={content.gift_text} className="text-base leading-8 text-black/60" />
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lines(content.gift_items || "").map((item, index) => {
                const [title = "", amount = "", description = "", buttonLabel = "Выбрать", buttonUrl = "#contact"] =
                  item.split("·").map((part) => part.trim());
                const image = content.gift_image_urls?.[index] || content.gift_image_url || "";
                return (
                  <article key={`${item}-${index}`} className="os-site-card overflow-hidden rounded-[28px] border border-black/8 bg-white/70">
                    {image ? (
                      <div className="aspect-[4/3] overflow-hidden bg-black/5">
                        <img src={image} alt={title} className="h-full w-full object-cover" />
                      </div>
                    ) : null}
                    <div className="p-7">
                      <h3 className="text-2xl font-semibold">{title}</h3>
                      {amount ? <p className="mt-3 text-xl font-semibold text-[var(--site-accent)]">{amount}</p> : null}
                      {description ? <p className="mt-4 text-sm leading-6 text-black/55">{description}</p> : null}
                      <a href={buttonUrl || "#contact"} className="os-site-button mt-6 inline-flex rounded-full bg-[var(--site-dark)] px-5 py-3 text-xs font-semibold text-white">
                        {buttonLabel || "Выбрать"}
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showFaq ? (
        <PublicReveal
            id="faq"
            {...publicSystemSectionAnimation(content, "faq")}
            style={publicSystemSectionStyle(content, "faq", { order: sectionPosition("faq") })}
            className={publicSystemSectionClass(content, "faq", "py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "faq", "grid gap-12 lg:grid-cols-[0.8fr_1.2fr]")}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">{content.faq_label}</p>
              <h2 style={publicSystemSectionHeadingStyle(content, "faq")} className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{content.faq_title}</h2>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {lines(content.faq_items).map((item, index) => {
                const [question, ...answer] = item.split("|");
                return (
                  <details key={`${item}-${index}`} className="group py-6">
                    <summary className="flex cursor-pointer list-none justify-between gap-5 text-lg font-semibold">
                      {question.trim()} <span className="text-[var(--site-accent)] transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-4 pr-10 text-sm leading-7 text-black/55">{answer.join("|").trim()}</p>
                  </details>
                );
              })}
            </div>
          </div>
        </PublicReveal>
      ) : null}

      {showContact ? (
        <PublicReveal
            id="contact"
            {...publicSystemSectionAnimation(content, "contact")}
            style={publicSystemSectionStyle(content, "contact", { order: sectionPosition("contact") })}
            className={publicSystemSectionClass(content, "contact", "bg-[#d9d1c0] py-24 sm:py-32")}
          >
          <div className={publicSystemSectionContentClass(content, "contact", "os-site-card grid gap-8 overflow-hidden rounded-[32px] border border-black/10 bg-white/45 lg:grid-cols-[0.9fr_1.1fr]")}>
            <div className="p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#725924]">
                {content.contact_label}
              </p>
              <h2 style={publicSystemSectionHeadingStyle(content, "contact")} className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                {content.contact_title}
              </h2>
              <address className="mt-8 grid content-start gap-4 not-italic">
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`} className="border-b border-black/15 pb-4 text-xl font-semibold">
                    {contactEmail}
                  </a>
                ) : null}
                {contactPhone ? (
                  <a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className="border-b border-black/15 pb-4 text-xl font-semibold">
                    {contactPhone}
                  </a>
                ) : null}
                {contactAddress ? (
                  <p className="border-b border-black/15 pb-4 text-base leading-7 text-black/60">
                    {contactAddress}
                  </p>
                ) : null}
                {contactHours ? (
                  <p className="border-b border-black/15 pb-4 text-sm leading-7 text-black/60">
                    <span className="font-semibold text-black/75">{contactCopy.hours}:</span> {contactHours}
                  </p>
                ) : null}
              </address>
              {contactNote ? (
                <PublicRichText value={content.contact_note} className="mt-5 max-w-xl text-sm leading-7 text-black/55" />
              ) : null}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {mapHref ? (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="os-site-button inline-flex min-h-11 items-center rounded-full bg-[var(--site-dark)] px-6 text-xs font-semibold text-white"
                  >
                    {content.contact_route_label || contactCopy.route}
                  </a>
                ) : null}
                <PublicSocialLinks content={content} />
              </div>
            </div>
            <div className="min-h-[340px] overflow-hidden bg-[#cfc7b8]">
              {mapQuery ? (
                <iframe
                  title={`${content.contact_title}: ${contactAddress || mapQuery}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[340px] w-full border-0"
                />
              ) : (
                <div className="grid h-full min-h-[340px] place-items-center px-8 text-center text-sm text-black/45">
                  {contactCopy.mapMissing}
                </div>
              )}
            </div>
          </div>
        </PublicReveal>
      ) : null}
      {(content.custom_blocks ?? [])
        .filter((block) => block.is_visible !== false)
        .map((block) => (
        <div
          key={block.id}
          style={{
            order: sectionOrder.indexOf(customBlockLayoutId(block.id)),
          }}
        >
          <PublicCustomBlock
            block={block}
            bookingHref={bookingHref}
            services={services}
          />
        </div>
      ))}
      </div>

      <footer className="bg-[var(--site-dark)] px-5 py-10 text-white">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <Link
              href={`/site/${business.slug}`}
              aria-label={brandName}
              className="inline-flex max-w-[260px] items-center"
            >
              {company.logo_url ? (
                // The published logo is isolated from its editor draft.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt={brandName}
                  className="max-h-14 max-w-[240px] object-contain object-left"
                />
              ) : (
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                  {brandName}
                </span>
              )}
            </Link>
            {content.footer_note ? (
              <PublicRichText value={content.footer_note} className="mt-4 max-w-lg text-sm leading-6 text-white/55" />
            ) : null}
          </div>
          <div className="grid gap-5 sm:justify-items-end">
            <nav className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/75" aria-label="Footer navigation">
              {showServices ? <a href="#services">{content.services_label}</a> : null}
              {showPortfolio ? <a href="#portfolio">{content.portfolio_label}</a> : null}
              {showAbout ? <a href="#about">{content.about_label}</a> : null}
              {showContact ? <a href="#contact">{content.contact_label}</a> : null}
            </nav>
            <PublicSocialLinks content={content} light />
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55">
              {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : null}
              {contactPhone ? <a href={`tel:${contactPhone.replace(/\s+/g, "")}`}>{contactPhone}</a> : null}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-[1240px] flex-col gap-2 border-t border-white/15 pt-5 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brandName}</p>
          <p>Powered by OneStudio OS</p>
        </div>
      </footer>
      <PublicSiteAnalytics content={content} />
      <BackToDashboardButton />
    </main>
  );
}
