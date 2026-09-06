"use client";

import type { CSSProperties } from "react";
import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioWorkflow.module.css";

export type WorkflowVisual = {
  kind: "website" | "enquiry" | "client" | "payment" | "automation" | "analytics";
  label: string;
  secondary?: string;
  headline?: string;
  action?: string;
  status?: string;
  amount?: string;
  steps?: readonly string[];
  metric?: string;
};

export type WorkflowStage = {
  index: string;
  title: string;
  description: string;
  visual: WorkflowVisual;
};

export type WorkflowCopy = {
  eyebrow: string;
  title: string;
  supporting: string;
  flowLabel: string;
  flowNote: string;
  stages: readonly WorkflowStage[];
};

function StageVisual({ visual }: { visual: WorkflowVisual }) {
  if (visual.kind === "website") {
    return (
      <div className={`${styles.visual} ${styles.websiteVisual}`} aria-hidden="true">
        <div className={styles.uiBar}>
          <span className={styles.uiDots}><i /><i /><i /></span>
          <span>{visual.label}</span>
          <b>↗</b>
        </div>
        <div className={styles.websiteBody}>
          <small>{visual.secondary}</small>
          <strong>{visual.headline}</strong>
          <div className={styles.uiAction}><span>{visual.action}</span><b>→</b></div>
        </div>
      </div>
    );
  }

  if (visual.kind === "enquiry") {
    return (
      <div className={`${styles.visual} ${styles.enquiryVisual}`} aria-hidden="true">
        <div className={styles.visualLabel}>{visual.label}<span>{visual.status}</span></div>
        <div className={styles.formRow}><span>{visual.secondary}</span><i /></div>
        <div className={styles.formRow}><span>{visual.action}</span><i /></div>
        <div className={styles.confirmed}><i>✓</i><span>{visual.status}</span><b>09:30</b></div>
      </div>
    );
  }

  if (visual.kind === "client") {
    return (
      <div className={`${styles.visual} ${styles.clientVisual}`} aria-hidden="true">
        <div className={styles.visualLabel}>{visual.label}<span>•••</span></div>
        <div className={styles.clientRecord}>
          <span className={styles.avatar}>AK</span>
          <div><strong>{visual.secondary}</strong><small>{visual.action}</small></div>
          <i>{visual.status}</i>
        </div>
        <div className={styles.recordLine}><span /><span /><span /></div>
      </div>
    );
  }

  if (visual.kind === "payment") {
    return (
      <div className={`${styles.visual} ${styles.paymentVisual}`} aria-hidden="true">
        <div className={styles.visualLabel}>{visual.label}<span>•••</span></div>
        <div className={styles.paymentAmount}>{visual.amount}</div>
        <div className={styles.paymentStatus}><i>✓</i><span>{visual.status}</span><b>↗</b></div>
      </div>
    );
  }

  if (visual.kind === "automation") {
    return (
      <div className={`${styles.visual} ${styles.automationVisual}`} aria-hidden="true">
        <div className={styles.visualLabel}>{visual.label}<span>{visual.status}</span></div>
        <div className={styles.automationSteps}>
          {visual.steps?.map((step, index) => (
            <span key={step}>
              <i>{index + 1}</i><em>{step}</em>
              {index < (visual.steps?.length ?? 0) - 1 ? <b>→</b> : null}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.visual} ${styles.analyticsVisual}`} aria-hidden="true">
      <div className={styles.visualLabel}>{visual.label}<span>{visual.status}</span></div>
      <div className={styles.analyticsBody}>
        <div className={styles.chart}>
          <i /><i /><i /><i /><i /><i />
        </div>
        <div className={styles.analyticsMetric}><strong>{visual.metric}</strong><small>{visual.secondary}</small></div>
      </div>
    </div>
  );
}

export function OneStudioWorkflow({ copy, id = "businesses" }: { copy: WorkflowCopy; id?: string }) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      className={styles.section}
      aria-labelledby={titleId}
    >
      <SectionReveal>
        <div className="os-public-content-guide">
          <div className={styles.intro}>
            <div className={styles.introMain}>
              <p className={`${styles.eyebrow} os-type-eyebrow`}><span />{copy.eyebrow}</p>
              <h2 id={titleId} className="os-type-h2">{copy.title}</h2>
            </div>
            <p className={`${styles.supporting} os-type-supporting`}>{copy.supporting}</p>
          </div>
        </div>

        <div className="os-public-content-guide-wide">
          <div className={styles.flow}>
            <div className={styles.flowMeta}>
              <span>{copy.flowLabel}</span>
              <span>{copy.flowNote}</span>
            </div>

            <div className={styles.desktopTrack} aria-hidden="true">
              <span className={styles.trackBase} />
              <span className={styles.trackActive} />
              <span className={styles.signalDot} />
            </div>
            <div className={styles.mobileTrack} aria-hidden="true">
              <span className={styles.trackBase} />
              <span className={styles.trackActive} />
              <span className={styles.signalDot} />
            </div>

            <ol className={styles.stages}>
              {copy.stages.map((stage, index) => (
                <li
                  className={styles.stage}
                  key={stage.index}
                  style={{
                    "--signal-delay": `${1.45 + index * 2.7}s`,
                  } as CSSProperties}
                >
                  <div className={styles.stageHeader}>
                    <span className={styles.stageIndex}>{stage.index}</span>
                    <h3 className="os-type-card-title">{stage.title}</h3>
                  </div>
                  <span className={styles.stageMarker} />
                  <StageVisual visual={stage.visual} />
                  <p className={`${styles.stageDescription} os-type-card-body`}>{stage.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
