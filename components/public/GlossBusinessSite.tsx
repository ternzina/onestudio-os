import Link from "next/link";
import BackToDashboardButton from "@/components/public/BackToDashboardButton";
import GlossBookingPanel from "@/components/public/GlossBookingPanel";
import GlossLeadDialog from "@/components/public/GlossLeadDialog";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicSiteAnalytics from "@/components/public/PublicSiteAnalytics";
import PublicSocialLinks from "@/components/public/PublicSocialLinks";
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
  PublicSiteProject,
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

function GlossLogo({
  href,
  light = false,
}: {
  href: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="GLOSS Nail Studio"
      className={`inline-flex -translate-y-0.5 flex-col leading-none ${
        light ? "text-white" : "text-[#551d1d]"
      }`}
    >
      <span className="font-serif text-[32px] tracking-[0.04em]">GLOSS</span>
      <span className="mt-1 pl-1 text-[8px] font-semibold tracking-[0.42em] opacity-70">
        NAIL STUDIO
      </span>
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

function GalleryTile({
  project,
  index,
}: {
  project: PublicSiteProject;
  index: number;
}) {
  return (
    <article className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-[#eadedb]">
      {project.image_url ? (
        // Portfolio URLs may be local template files or workspace-owned media.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image_url}
          alt={project.image_alt}
          width={project.width || 900}
          height={project.height || 1125}
          loading={index < 5 ? "eager" : "lazy"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      ) : null}
      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/10 text-sm text-white backdrop-blur-sm">
        ♡
      </span>
    </article>
  );
}

export default function GlossBusinessSite({
  site,
}: {
  site: PublicSiteData;
}) {
  const { business, company, content, services, portfolio, capabilities } = site;
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
  const filters = lines(content.work_filters);
  const customBlocks = (content.custom_blocks ?? []).filter(
    (block) => block.is_visible !== false,
  );
  const serviceImages = content.service_image_urls ?? SERVICE_IMAGES;
  const teamImages = content.team_image_urls ?? MASTER_IMAGES;
  const address =
    content.contact_address || company.address || "ул. Вишнёвая, 11";
  const hours = content.contact_hours || "Ежедневно: 09:00–21:00";
  const mapQuery = encodeURIComponent(content.map_query || address);
  const navigationPages = (content.pages ?? []).filter(
    (page) => page.is_visible !== false && page.show_in_navigation,
  );

  const pageHref = (page: (typeof navigationPages)[number]) =>
    page.type === "portfolio"
      ? publicSitePagePath(business.slug, page.slug, localized)
      : publicCustomPagePath(business.slug, page.slug, localized);

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

      <header className="border-b border-[#3b211f]/10 bg-white">
        <div className="mx-auto flex min-h-[82px] w-[calc(100%_-_40px)] max-w-[1240px] items-center justify-between gap-5">
          <GlossLogo href={homeHref} />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
            {content.show_services ? <a href="#services">Услуги</a> : null}
            {navigationPages.map((page) => (
              <Link key={page.id} href={pageHref(page)}>
                {page.nav_label}
              </Link>
            ))}
            {content.show_team ? <a href="#team">Мастера</a> : null}
            {content.show_about ? <a href="#about">О студии</a> : null}
            {content.show_contact ? <a href="#contact">Контакты</a> : null}
          </nav>
          {capabilities.booking ? (
            <Link
              href={bookingHref}
              className="rounded-md bg-[var(--site-accent)] px-6 py-3 text-xs font-semibold text-white"
            >
              Записаться
            </Link>
          ) : null}
        </div>
      </header>

      {content.show_hero !== false ? (
      <section className="border-b border-[#3b211f]/8 bg-white">
        <div className="mx-auto grid w-full max-w-[1240px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center px-5 py-16 sm:px-9 lg:py-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#765b57]">
              {content.hero_eyebrow}
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.03] tracking-[-0.035em] sm:text-7xl">
              {content.hero_title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#6a5551]">
              {content.hero_text}
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              {capabilities.booking ? (
                <Link
                  href={bookingHref}
                  className="inline-flex min-h-12 items-center rounded-md bg-[var(--site-accent)] px-7 text-sm font-semibold text-white"
                >
                  {content.booking_label}
                </Link>
              ) : null}
              <a
                href="#portfolio"
                className="inline-flex min-h-12 items-center border-b border-[#3b211f]/30 px-1 text-sm font-semibold"
              >
                Выбрать дизайн <span className="ml-8">→</span>
              </a>
            </div>
            <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#7f6c68]">
              <span>✓ Стерильные инструменты</span>
              <span>· гарантия 7 дней</span>
              <span>· более 500 оттенков</span>
            </p>
          </div>
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[600px]">
            {/* Hero may be replaced with a workspace-owned remote media URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.hero_image_url || "/templates/gloss/gloss-hero.webp"}
              alt="Интерьер GLOSS Nail Studio"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
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
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {services.slice(0, 4).map((service, index) => (
                  <article
                    key={service.id}
                    className="overflow-hidden rounded-xl border border-[#3b211f]/10 bg-white p-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                      {/* Editable media URLs may point to the workspace CDN. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={serviceImages[index] || SERVICE_IMAGES[index]}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="px-2 pb-2 pt-4">
                      <h3 className="text-sm font-semibold">{service.title}</h3>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                        <span>{formatPrice(service, business.locale)}</span>
                        <span className="text-[#8a7773]">
                          {service.duration_min_minutes
                            ? `${service.duration_min_minutes} минут`
                            : ""}
                        </span>
                      </div>
                      <Link
                        href={{
                          pathname: bookingHref,
                          query: { service: service.slug },
                        }}
                        className="mt-4 flex min-h-10 items-center justify-center rounded-md border border-[var(--site-accent)] text-xs font-semibold text-[var(--site-accent)]"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </article>
                ))}
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
                {filters.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filters.map((filter, index) => (
                      <span
                        key={filter}
                        className={`rounded-full px-4 py-2 text-[10px] font-semibold ${
                          index === 0
                            ? "bg-[var(--site-accent)] text-white"
                            : "border border-[#3b211f]/10 bg-white"
                        }`}
                      >
                        {filter}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {portfolio.slice(0, 10).map((project, index) => (
                    <GalleryTile
                      key={project.id}
                      project={project}
                      index={index}
                    />
                  ))}
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
              <h2 className="text-center font-serif text-4xl">
                {content.safety_title || "Красиво и безопасно"}
              </h2>
              <div className="mt-8 grid gap-7 md:grid-cols-3">
                {safety.map((item, index) => {
                  const feature = labeledLine(item);
                  return (
                    <article
                      key={item}
                      className="grid grid-cols-[48px_1fr] gap-4 text-[#60312e]"
                    >
                      <SafetyIcon index={index % 3} />
                      <div>
                        <h3 className="text-sm font-semibold">{feature.title}</h3>
                        <p className="mt-2 text-xs leading-5 text-[#7d6864]">
                          {feature.detail}
                        </p>
                      </div>
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

        {content.show_about && content.about_text ? (
          <section
            id="about"
            style={{ order: layoutPosition(sectionLayoutId("about")) }}
            className="px-5 py-16"
          >
            <div className="mx-auto grid w-full max-w-[1240px] gap-8 border-t border-[#3b211f]/10 pt-12 lg:grid-cols-[0.7fr_1.3fr]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-accent)]">
                {content.about_label}
              </p>
              <div>
                <h2 className="font-serif text-4xl sm:text-5xl">
                  {content.about_title}
                </h2>
                <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-[#6c5753]">
                  {content.about_text}
                </p>
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
                <div className="mt-6 space-y-3 text-sm text-[#67534f]">
                  <p>◷ {hours}</p>
                  <p>⌖ {address}</p>
                  {company.email ? <p>✉ {company.email}</p> : null}
                  {company.phone ? <p>☎ {company.phone}</p> : null}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex min-h-11 items-center rounded-md bg-[var(--site-accent)] px-6 text-xs font-semibold text-white"
                >
                  Построить маршрут
                </a>
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
          <GlossLogo href={homeHref} light />
          <nav className="flex flex-wrap justify-start gap-x-7 gap-y-3 text-xs sm:justify-center">
            <a href="#services">Услуги</a>
            <a href="#portfolio">Дизайны</a>
            <a href="#team">Мастера</a>
            <a href="#about">О студии</a>
            <a href="#contact">Контакты</a>
          </nav>
          <div className="sm:justify-self-end">
            <PublicSocialLinks content={content} light />
          </div>
        </div>
        <p className="mx-auto mt-7 max-w-[1240px] border-t border-white/20 pt-5 text-center text-[10px] text-white/65">
          © {new Date().getFullYear()} GLOSS · Сайт и система управления созданы
          на OneStudio OS
        </p>
      </footer>
      <PublicSiteAnalytics content={content} />
      <BackToDashboardButton />
    </main>
  );
}
