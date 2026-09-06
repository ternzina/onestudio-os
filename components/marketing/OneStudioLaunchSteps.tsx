"use client";

import Link from "next/link";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioLaunchSteps.module.css";

type StepKind = "design" | "customize" | "publish";

function DesignVisual() {
  return (
    <div className={styles.designVisual} aria-hidden="true">
      <div className={`${styles.designSheet} ${styles.designSheetBack} ${styles.designSheetBackWide}`}>
        <i /><i /><i />
      </div>
      <div className={`${styles.designSheet} ${styles.designSheetBack}`}>
        <i /><i /><i />
      </div>
      <div className={`${styles.designSheet} ${styles.designSheetActive}`}>
        <span className={styles.designTopline}><i /><i /></span>
        <span className={styles.designHeroLine} />
        <span className={styles.designHeroBlock} />
        <span className={styles.designBottomline}><i /><i /><i /></span>
        <b className={styles.selectedMark}>✓</b>
      </div>
    </div>
  );
}

function CustomizeVisual() {
  return (
    <div className={styles.customizeVisual} aria-hidden="true">
      <div className={styles.customizePanel}>
        <span className={styles.customizePanelTop}><i /><i /><i /></span>
        <div className={styles.customizeRow}>
          <span className={styles.typeGlyph}>Aa</span>
          <span className={styles.customizeLines}><i /><i /></span>
          <b>✓</b>
        </div>
        <div className={styles.customizeRow}>
          <span className={styles.imageGlyph}><i /></span>
          <span className={styles.customizeLines}><i /><i /></span>
          <b>✓</b>
        </div>
        <div className={styles.swatchRow}><i /><i /><i /><i /><span /></div>
      </div>
      <div className={styles.customizeCanvas}>
        <span className={styles.canvasNav}><i /><i /><i /></span>
        <span className={styles.canvasHeading}><i /><i /></span>
        <span className={styles.canvasImage} />
      </div>
    </div>
  );
}

function PublishVisual({ online }: { online: string }) {
  return (
    <div className={styles.publishVisual} aria-hidden="true">
      <div className={styles.publishBrowser}>
        <span className={styles.publishChrome}><i /><i /><i /><b /></span>
        <span className={styles.publishPage}>
          <i className={styles.publishPageNav} />
          <i className={styles.publishPageTitle} />
          <i className={styles.publishPageImage} />
          <i className={styles.publishPageLine} />
        </span>
      </div>
      <div className={styles.publishStatus}>
        <strong>yourdomain.com</strong>
        <span><i />{online}</span>
      </div>
    </div>
  );
}

function StepVisual({ kind, online }: { kind: StepKind; online: string }) {
  if (kind === "design") return <DesignVisual />;
  if (kind === "customize") return <CustomizeVisual />;
  return <PublishVisual online={online} />;
}

export function OneStudioLaunchSteps({ lang }: { lang: Locale }) {
  const t = getTranslations(lang).home.launch;
  const online = "ONLINE";

  return (
    <section
      id="launch"
      className={styles.section}
      aria-labelledby="launch-title"
    >
      <SectionReveal>
        <div className="os-public-content-guide">
          <div className={styles.intro}>
            <div className={styles.introMain}>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{t.eyebrow}</p>
              <h2 id="launch-title" className={`${styles.title} os-type-h2`}>
                {t.titleBefore}<span className={styles.titleAccent}>{t.titleAccent}</span>
              </h2>
            </div>
            <div className={styles.introAside}>
              <p className={`${styles.supporting} os-type-supporting`}>{t.supporting}</p>
              <p className={`${styles.microline} os-type-micro`}>{t.microline}</p>
              <Link className={`${styles.cta} os-button primary os-type-action`} href="/demos">{t.cta}<b>↗</b></Link>
            </div>
          </div>
        </div>

        <div className="os-public-content-guide-wide">
          <div className={styles.flow}>
            <span className={styles.flowRail} aria-hidden="true"><i /></span>
            <ol className={styles.steps}>
              {t.steps.map((step) => {
                return (
                  <li
                    className={styles.step}
                    key={step.number}
                  >
                    <div className={styles.stepHeader}>
                      <span className={`${styles.stepNumber} os-type-micro`}>{step.number}</span>
                      <span className={styles.stepNode} aria-hidden="true" />
                    </div>
                    <div className={styles.stepCopy}>
                      <h3 className="os-type-card-title">{step.title}</h3>
                      <p className="os-type-card-body">{step.body}</p>
                    </div>
                    <StepVisual kind={step.kind as StepKind} online={online} />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
