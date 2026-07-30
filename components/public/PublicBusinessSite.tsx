import Link from "next/link";
import type {
  PublicSiteData,
  PublicSiteProject,
  PublicSiteSection,
  PublicSiteService,
} from "@/lib/public-site/types";
import {
  publicCustomPagePath,
  publicSitePagePath,
  publicSitePath,
} from "@/lib/public-site/metadata";
import BackToDashboardButton from "@/components/public/BackToDashboardButton";
import GlossBusinessSite from "@/components/public/GlossBusinessSite";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicSiteAnalytics from "@/components/public/PublicSiteAnalytics";
import PublicSocialLinks from "@/components/public/PublicSocialLinks";
import { publicSiteReviews } from "@/lib/public-site/content";
import {
  customBlockLayoutId,
  resolvePublicSiteLayoutOrder,
  sectionLayoutId,
} from "@/lib/public-site/layout";

function lines(value?: string) {
  return (value ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
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

function requestLabels(locale: string) {
  const language = locale.split("-")[0];
  return {
    ru: { general: "Обсудить проект", service: "Оставить заявку" },
    uk: { general: "Обговорити проєкт", service: "Залишити заявку" },
    pl: { general: "Omów projekt", service: "Wyślij zapytanie" },
    en: { general: "Discuss your project", service: "Send request" },
  }[language] ?? { general: "Discuss your project", service: "Send request" };
}

function ProjectCard({ project }: { project: PublicSiteProject }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-black/8 bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(145deg,#dedbd2,#f3f0e9)]">
        {project.image_url ? (
          // URLs originate from the workspace-owned media library and R2 adapter.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image_url}
            alt={project.image_alt}
            width={project.width || 1200}
            height={project.height || 900}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="h-24 w-24 rounded-full border border-black/10" />
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
          {project.category}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          {project.title}
        </h3>
        {project.description ? (
          <p className="mt-3 text-sm leading-6 text-[#716d65]">
            {project.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default function PublicBusinessSite({ site }: { site: PublicSiteData }) {
  if (site.content.template_id === "gloss-nail-studio") {
    return <GlossBusinessSite site={site} />;
  }

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
  const hasContact = Boolean(company.email || company.phone || company.address);
  const showServices = content.show_services && services.length > 0;
  const showPortfolio = content.show_portfolio && portfolio.length > 0;
  const showAbout = content.show_about && Boolean(content.about_text);
  const showContact = content.show_contact && hasContact;
  const showTeam = Boolean(content.show_team && lines(content.team_items).length);
  const reviews = publicSiteReviews(content);
  const showReviews = Boolean(content.show_reviews && reviews.length);
  const showMembership = Boolean(content.show_membership && content.membership_text);
  const showGift = Boolean(content.show_gift && content.gift_text);
  const showFaq = Boolean(content.show_faq && lines(content.faq_items).length);
  const sectionOrder = resolvePublicSiteLayoutOrder(content);
  const sectionPosition = (section: PublicSiteSection) => {
    const position = sectionOrder.indexOf(sectionLayoutId(section));
    return position === -1 ? sectionOrder.length : position;
  };

  return (
    <main
      lang={business.locale}
      className="min-h-screen text-[#191b20]"
      style={{
        backgroundColor: content.theme_surface ?? "#f3f0e9",
        "--site-accent": content.theme_accent ?? "#9a742e",
        "--site-dark": content.theme_dark ?? "#191b20",
      } as React.CSSProperties}
    >
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-24 w-[calc(100%_-_40px)] max-w-[1240px] items-center justify-between border-b border-black/10">
          <Link
            href={`/site/${business.slug}`}
            className="max-w-[55vw] truncate text-sm font-semibold uppercase tracking-[0.2em]"
          >
            {content.brand_name || company.display_name || business.name}
          </Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
            {showServices ? (
              <a href="#services" className="text-xs font-semibold text-black/60">
                {content.services_label}
              </a>
            ) : null}
            {portfolioPage?.show_in_navigation && portfolioPageHref ? (
              <Link
                href={portfolioPageHref}
                className="text-xs font-semibold text-black/60"
              >
                {portfolioPage.nav_label}
              </Link>
            ) : showPortfolio ? (
              <a href="#portfolio" className="text-xs font-semibold text-black/60">
                {content.portfolio_label}
              </a>
            ) : null}
            {customPages.map((page) => (
              <Link
                key={page.id}
                href={publicCustomPagePath(
                  business.slug,
                  page.slug,
                  business.locale === business.primary_locale
                    ? null
                    : business.locale,
                )}
                className="text-xs font-semibold text-black/60"
              >
                {page.nav_label}
              </Link>
            ))}
            {showAbout ? (
              <a href="#about" className="text-xs font-semibold text-black/60">
                {content.about_label}
              </a>
            ) : null}
            {showContact ? (
              <a href="#contact" className="text-xs font-semibold text-black/60">
                {content.contact_label}
              </a>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            {availableLocales.length > 1 ? (
              <nav aria-label="Language" className="hidden items-center gap-1 sm:flex">
                {availableLocales.map((locale) => (
                  <Link
                    key={locale}
                    href={publicSitePath(
                      business.slug,
                      locale === business.primary_locale ? null : locale,
                    )}
                    hrefLang={locale}
                    aria-current={locale === business.locale ? "page" : undefined}
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
                className="hidden rounded-full border border-black/15 px-5 py-3 text-xs font-semibold text-black/65 sm:inline-flex"
              >
                {content.booking_label}
              </Link>
            ) : null}
            <Link
              href={requestHref}
              className="rounded-full bg-[var(--site-dark)] px-5 py-3 text-xs font-semibold text-white"
            >
              {requestCopy.general}
            </Link>
          </div>
        </div>
      </header>

      {content.show_hero !== false ? (
      <section className="relative isolate overflow-hidden px-5 pb-24 pt-40 sm:pb-32 sm:pt-48">
        <div className="absolute -right-24 top-12 -z-10 h-[460px] w-[460px] rounded-full border border-[var(--site-accent)]/20" />
        <div className="absolute right-20 top-36 -z-10 h-[280px] w-[280px] rounded-full bg-[var(--site-accent)]/10 blur-3xl" />
        <div className={`mx-auto grid w-full max-w-[1240px] gap-12 ${content.hero_image_url ? "lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch" : "lg:grid-cols-[1.15fr_0.85fr] lg:items-end"}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--site-accent)]">
              {content.hero_eyebrow}
            </p>
            <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.065em] sm:text-7xl lg:text-[92px] lg:leading-[0.96]">
              {content.hero_title}
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#656159] sm:text-lg">
              {content.hero_text}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {capabilities.booking ? (
                <Link
                  href={bookingHref}
                  className="inline-flex min-h-14 items-center rounded-full bg-[var(--site-dark)] px-7 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(25,27,32,0.18)]"
                >
                  {content.booking_label}
                </Link>
              ) : null}
              <Link
                href={requestHref}
                className="inline-flex min-h-14 items-center rounded-full border border-black/15 px-7 text-sm font-semibold text-black/65"
              >
                {requestCopy.general}
                <span aria-hidden="true" className="ml-8 text-[var(--site-accent)]">→</span>
              </Link>
            </div>
          </div>
          {content.hero_image_url ? (
            <div className="relative min-h-[420px] overflow-hidden rounded-[36px] bg-white shadow-[0_35px_90px_rgba(50,23,34,0.16)] lg:min-h-[620px]">
              {/* Template images are local; user-managed URLs are validated by the media workflow. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.hero_image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--site-dark)]/35 to-transparent" />
            </div>
          ) : null}
        </div>
      </section>
      ) : null}

      <div className="flex flex-col">
      {showServices ? (
        <section id="services" style={{ order: sectionPosition("services") }} className="border-y border-black/8 bg-[var(--site-dark)] px-5 py-24 text-white sm:py-32">
          <div className="mx-auto w-full max-w-[1240px]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b36a]">
              {content.services_label}
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {content.services_title}
            </h2>
            <div className="mt-14 grid border-l border-t border-white/12 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article key={service.id} className="min-h-72 border-b border-r border-white/12 p-7">
                  <div className="flex items-start justify-between gap-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                      {service.kind}
                    </p>
                    <p className="text-sm font-semibold text-[#d8b36a]">
                      {formatPrice(service, business.locale)}
                    </p>
                  </div>
                  <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-white/55">
                    {service.description || durationLabel(service)}
                  </p>
                  {durationLabel(service) && service.description ? (
                    <p className="mt-6 text-xs uppercase tracking-[0.15em] text-white/35">
                      {durationLabel(service)}
                    </p>
                  ) : null}
                  <Link
                    href={
                      capabilities.booking
                        ? {
                            pathname: bookingHref,
                            query: { service: service.slug },
                          }
                        : {
                            pathname: requestHref,
                            query: { subject: service.title },
                          }
                    }
                    className="mt-8 inline-flex items-center gap-4 text-sm font-semibold text-[#d8b36a]"
                  >
                    {capabilities.booking
                      ? content.booking_label
                      : requestCopy.service}
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showPortfolio ? (
        <section id="portfolio" style={{ order: sectionPosition("portfolio") }} className="px-5 py-24 sm:py-32">
          <div className="mx-auto w-full max-w-[1240px]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a742e]">
              {content.portfolio_label}
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {content.portfolio_title}
            </h2>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showAbout ? (
        <section id="about" style={{ order: sectionPosition("about") }} className="px-5 py-24 sm:py-32">
          <div className="mx-auto grid w-full max-w-[1240px] gap-10 border-t border-black/10 pt-16 lg:grid-cols-[0.7fr_1.3fr]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a742e]">
              {content.about_label}
            </p>
            <div>
              <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                {content.about_title}
              </h2>
              <p className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-[#656159] sm:text-lg">
                {content.about_text}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {showTeam ? (
        <section id="team" style={{ order: sectionPosition("team") }} className="px-5 py-24 sm:py-32">
          <div className="mx-auto w-full max-w-[1240px]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">
              {content.team_label}
            </p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
              {content.team_title}
            </h2>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {lines(content.team_items).map((item, index) => {
                const member = labeledLine(item);
                return (
                  <article key={`${item}-${index}`} className="rounded-[28px] border border-black/8 bg-white/70 p-7">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--site-dark)] text-xl font-semibold text-white">
                      {member.title.slice(0, 1)}
                    </div>
                    <h3 className="mt-8 text-2xl font-semibold">{member.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/55">{member.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {showReviews ? (
        <section id="reviews" style={{ order: sectionPosition("reviews") }} className="bg-[var(--site-dark)] px-5 py-24 text-white sm:py-32">
          <div className="mx-auto w-full max-w-[1240px]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">{content.reviews_label}</p>
            <h2 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{content.reviews_title}</h2>
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {reviews.map((review) => (
                <blockquote key={review.id} className="rounded-[28px] border border-white/12 bg-white/5 p-7 text-base leading-8 text-white/75">
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
        </section>
      ) : null}

      {showMembership ? (
        <section id="membership" style={{ order: sectionPosition("membership") }} className="px-5 py-24 sm:py-32">
          <div className="mx-auto grid w-full max-w-[1240px] overflow-hidden rounded-[36px] bg-[var(--site-accent)] text-white lg:grid-cols-[0.8fr_1.2fr]">
            <p className="p-8 text-xs font-semibold uppercase tracking-[0.24em] lg:p-14">{content.membership_label}</p>
            <div className="border-t border-white/20 p-8 lg:border-l lg:border-t-0 lg:p-14">
              <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{content.membership_title}</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {lines(content.membership_text).map((benefit) => (
                  <p key={benefit} className="rounded-2xl border border-white/20 bg-white/8 px-4 py-4 text-sm leading-6 text-white/85">
                    ✓ {benefit}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {showGift ? (
        <section id="gift" style={{ order: sectionPosition("gift") }} className="px-5 py-24 sm:py-32">
          <div className="mx-auto grid w-full max-w-[1240px] gap-10 border-y border-black/10 py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">{content.gift_label}</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{content.gift_title}</h2>
            </div>
            <p className="whitespace-pre-line text-base leading-8 text-black/60">{content.gift_text}</p>
          </div>
        </section>
      ) : null}

      {showFaq ? (
        <section id="faq" style={{ order: sectionPosition("faq") }} className="px-5 py-24 sm:py-32">
          <div className="mx-auto grid w-full max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--site-accent)]">{content.faq_label}</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{content.faq_title}</h2>
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
        </section>
      ) : null}

      {showContact ? (
        <section id="contact" style={{ order: sectionPosition("contact") }} className="bg-[#d9d1c0] px-5 py-24 sm:py-32">
          <div className="mx-auto grid w-full max-w-[1240px] gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#725924]">
                {content.contact_label}
              </p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                {content.contact_title}
              </h2>
            </div>
            <address className="grid content-start gap-4 not-italic">
              {company.email ? (
                <a href={`mailto:${company.email}`} className="border-b border-black/15 pb-4 text-xl font-semibold">
                  {company.email}
                </a>
              ) : null}
              {company.phone ? (
                <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="border-b border-black/15 pb-4 text-xl font-semibold">
                  {company.phone}
                </a>
              ) : null}
              {company.address ? (
                <p className="border-b border-black/15 pb-4 text-base leading-7 text-black/60">
                  {company.address}
                </p>
              ) : null}
            </address>
          </div>
        </section>
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
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {content.brand_name || company.display_name || business.name}</p>
          <PublicSocialLinks content={content} light />
          <p>Powered by OneStudio OS</p>
        </div>
      </footer>
      <PublicSiteAnalytics content={content} />
      <BackToDashboardButton />
    </main>
  );
}
