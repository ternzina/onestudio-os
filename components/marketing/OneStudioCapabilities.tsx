import OneStudioStatsVisual from "./OneStudioStatsVisual";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioCapabilities.module.css";
import { getTranslations } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
type Lang = Locale;
type CapabilitiesCopy = Translations["home"]["capabilities"];

function renderTitle(title: readonly string[], accent: string) {
  return <>{title.map((part) => part === accent ? <strong key={part}>{part}</strong> : <span key={part}>{part}</span>)}</>;
}

function BookingVisual({ t }: { t: CapabilitiesCopy }) {
  return <div className={styles.bookingVisual}>
    <div className={styles.mockTopbar} aria-hidden="true">
      <span>{t.booking.label}</span>
      <b>{t.booking.month}</b>
    </div>
    <div className={styles.bookingUpperZone} aria-hidden="true">
      <div className={styles.bookingLayout}>
        <div className={styles.bookingCalendar}>
          <div className={styles.weekdays}>{t.booking.weekdays.map((day) => <span key={day}>{day}</span>)}</div>
          <div className={styles.days}>{t.booking.days.map((day, index) => <span key={`${day || "empty"}-${index}`} className={day === "16" ? styles.selectedDay : ""}>{day}</span>)}</div>
        </div>
        <div className={styles.bookingDetails}>
          <span className={styles.uiLabel}>{t.booking.serviceLabel}</span>
          <div className={styles.selectField}><b>{t.booking.service}</b><span>⌄</span></div>
          <span className={styles.uiLabel}>{t.booking.timeLabel}</span>
          <div className={styles.slotGrid}>{t.booking.slots.map((slot) => <span key={slot} className={slot === "14:30" ? styles.activeSlot : ""}>{slot}</span>)}</div>
        </div>
      </div>
    </div>
    <section className={styles.bookingBenefits} aria-labelledby="booking-benefits-title">
      <h4 id="booking-benefits-title" className={`os-type-card-title ${styles.benefitsHeading}`}>{t.booking.benefitsTitle}</h4>
      <div className={styles.benefitGrid}>
        {t.booking.benefits.map((benefit, index) => (
          <div className={styles.benefitItem} key={benefit.title}>
            <h5 className={`os-type-action ${styles.benefitTitle}`}><span className={`os-type-micro ${styles.benefitNumber}`}>{String(index + 1).padStart(2, "0")}</span>{benefit.title}</h5>
            <p className={`os-type-micro ${styles.benefitCopy}`}>{benefit.copy}</p>
          </div>
        ))}
      </div>
    </section>
  </div>;
}

function SiteVisual({ t }: { t: CapabilitiesCopy }) {
  return <div className={styles.siteVisual} aria-hidden="true">
    <div className={styles.siteWindow}>
      <div className={styles.siteChrome}>
        <span /><span /><span /><small>{t.site.domain}</small><b>↗</b>
      </div>
      <div className={styles.siteContentPreview}>
        <aside className={styles.siteSidebar}>
          <span className={styles.uiLabel}>{t.site.pages}</span>
          {t.site.pageItems.map((item, index) => <b key={item} className={index === 0 ? styles.activePage : ""}>{item}<small>{index === 0 ? "01" : `0${index + 1}`}</small></b>)}
          <span className={styles.uiLabel}>{t.site.media}</span>
          <div className={styles.mediaThumbs}>{t.site.mediaItems.map((item, index) => <i key={item} className={`${styles.mediaThumb} ${index === 0 ? styles.mediaThumbActive : ""}`}><span>{item}</span></i>)}</div>
        </aside>
        <div className={styles.siteCanvas}>
          <div className={styles.siteCanvasNav}><b>STUDIO / 01</b><span /><i /></div>
          <div className={styles.siteCanvasHero}>
            <div><span>{t.site.sectionLabel}</span><strong>{t.site.headline[0]}<br />{t.site.headline[1]}</strong></div>
            <figure className={styles.siteCanvasComposition}>
              <div className={styles.compositionHeader}><small>{t.site.detailLabel}</small><span>01 / 03</span></div>
              <div className={styles.compositionBody}>
                <div className={styles.compositionGraph}><i /><i /><i /><i /><i /></div>
                <div className={styles.compositionGrid}><i /><i /><i /><i /></div>
              </div>
              <div className={styles.compositionFooter}><span /><span /><span /></div>
            </figure>
          </div>
          <div className={styles.siteCanvasDetail}><small>{t.site.detailLabel}</small><b>{t.site.detail}</b></div>
          <div className={styles.siteCanvasFooter}><span>01 – 03</span><b>{t.site.published}</b></div>
        </div>
      </div>
    </div>
  </div>;
}

function CrmVisual({ t }: { t: CapabilitiesCopy }) {
  return <div className={styles.crmVisual} aria-hidden="true">
    <div className={styles.mockTopbar}><span>{t.crm.label}</span><b>{t.crm.records}</b></div>
    <div className={styles.crmLayout}>
      <div className={styles.crmList}>{t.crm.people.map((person, index) => <div key={person.name} className={`${styles.personRow} ${index === 0 ? styles.selectedPerson : ""}`}><span className={styles.avatar}>{person.initials}</span><span><b>{person.name}</b><small>{person.detail}</small></span><i /></div>)}</div>
      <div className={styles.crmRecord}>
        <div className={styles.recordHeading}><span className={styles.avatarLarge}>{t.crm.people[0].initials}</span><span><b>{t.crm.people[0].name}</b><small>{t.crm.selectedEmail}</small></span></div>
        <div className={styles.tags}><span>{t.crm.status}</span><span>{t.crm.tag}</span></div>
        <div className={styles.historyRow}><small>{t.crm.historyLabel}</small><b>{t.crm.history}</b></div>
      </div>
    </div>
  </div>;
}

function PaymentsVisual({ t }: { t: CapabilitiesCopy }) {
  return <div className={styles.paymentsVisual} aria-hidden="true">
    <div className={styles.paymentHeader}><span>{t.payments.label}</span><b><i />{t.payments.status}</b></div>
    <div className={styles.paymentAmount}><strong>{t.payments.amount}</strong></div>
    <div className={styles.paymentRelation}><span><small>{t.payments.clientLabel}</small><b>{t.payments.client}</b></span><span><small>{t.payments.orderLabel}</small><b>{t.payments.order}</b></span></div>
    <small className={styles.illustrative}>{t.payments.illustrative}</small>
  </div>;
}

function AutomationVisual({ t }: { t: CapabilitiesCopy }) {
  return <div className={styles.automationVisual} aria-hidden="true">
    <div className={styles.mockTopbar}><span>{t.automation.label}</span><b className={styles.activeStatus}><i />{t.automation.status}</b></div>
    <div className={styles.automationFlow}>{t.automation.steps.map((step, index) => <div key={step} className={styles.automationStep}><div className={styles.automationNode}><span>{String(index + 1).padStart(2, "0")}</span><b>{step}</b></div><small>{t.automation.timing[index]}</small>{index < t.automation.steps.length - 1 ? <i className={styles.connector} /> : null}</div>)}</div>
  </div>;
}

export function OneStudioCapabilities({ lang }: { lang: Lang }) {
  const t = getTranslations(lang).home.capabilities;

  return <section id="capabilities" className={styles.section} aria-labelledby="capabilities-title">
    <SectionReveal>
      <div className="os-public-content-guide">
        <div className={styles.intro}>
          <div>
            <p className={`os-type-eyebrow ${styles.eyebrow}`}><span />{t.eyebrow}</p>
            <h2 id="capabilities-title" className={`os-type-h2 ${styles.title}`}>{renderTitle(t.title, t.accent)}</h2>
          </div>
          <div className={styles.introAside}>
            <p className="os-type-supporting">{t.supporting}</p>
            <p className="os-type-micro">{t.microline}</p>
          </div>
        </div>
      </div>

      <div className="os-public-content-guide-wide">
        <div className={styles.bento}>
          <article className={`${styles.card} ${styles.bookingCard}`}>
            <div className={styles.cardCopy}><span className={styles.cardIndex}>01</span><h3 className="os-type-card-title">{t.booking.title}</h3><p className="os-type-card-body">{t.booking.body}</p></div>
            <BookingVisual t={t} />
          </article>

          <article className={`${styles.card} ${styles.siteCard}`}>
            <div className={styles.cardCopy}><span className={styles.cardIndex}>02</span><h3 className="os-type-card-title">{t.site.title}</h3><p className="os-type-card-body">{t.site.body}</p></div>
            <SiteVisual t={t} />
          </article>

          <article className={`${styles.card} ${styles.crmCard}`}>
            <div className={styles.cardCopy}><span className={styles.cardIndex}>03</span><h3 className="os-type-card-title">{t.crm.title}</h3><p className="os-type-card-body">{t.crm.body}</p></div>
            <CrmVisual t={t} />
          </article>

          <article className={`${styles.card} ${styles.paymentsCard}`}>
            <div className={styles.cardCopy}><span className={styles.cardIndex}>04</span><h3 className="os-type-card-title">{t.payments.title}</h3><p className="os-type-card-body">{t.payments.body}</p></div>
            <PaymentsVisual t={t} />
          </article>

          <article className={`${styles.card} ${styles.automationCard}`}>
            <div className={styles.cardCopy}><span className={styles.cardIndex}>05</span><h3 className="os-type-card-title">{t.automation.title}</h3><p className="os-type-card-body">{t.automation.body}</p></div>
            <AutomationVisual t={t} />
          </article>

          <article className={`${styles.card} ${styles.analyticsCard}`}>
            <div className={styles.cardCopy}><span className={styles.cardIndex}>06</span><h3 className="os-type-card-title">{t.analytics.title}</h3><p className="os-type-card-body">{t.analytics.body}</p></div>
            <OneStudioStatsVisual labels={t.analytics.labels} />
          </article>
        </div>
      </div>
    </SectionReveal>
  </section>;
}
