"use client";

import { SectionReveal } from "./SectionReveal";
import styles from "./OneStudioInfrastructure.module.css";

export type InfrastructureItem = {
  index: string;
  title: string;
  detail: string;
};

export type InfrastructureCopy = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  supporting: string;
  items: readonly InfrastructureItem[];
  microcopy: string;
};

const itemPositions = ["domain", "hosting", "ssl", "updates"] as const;

export function OneStudioInfrastructure({
  copy,
  id = "launch",
}: {
  copy: InfrastructureCopy;
  id?: string;
}) {
  const titleId = `${id}-title`;

  const accentStart = copy.title.indexOf(copy.titleAccent);
  const titleContent = accentStart >= 0 ? (
    <>
      {copy.title.slice(0, accentStart)}
      <span className={styles.titleAccent}>{copy.titleAccent}</span>
      {copy.title.slice(accentStart + copy.titleAccent.length)}
    </>
  ) : copy.title;

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
              <p className={`${styles.eyebrow} os-type-eyebrow`}>
                <span />
                {copy.eyebrow}
              </p>
              <h2 id={titleId} className="os-type-h2">{titleContent}</h2>
            </div>
            <p className={`${styles.supporting} os-type-supporting`}>{copy.supporting}</p>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className="os-type-micro">ONESTUDIO / FOUNDATION</span>
              <span className={styles.panelHeaderStatus}><i />READY TO PUBLISH</span>
            </div>

            <div className={styles.systemCanvas}>
              <ol className={styles.infrastructureList}>
                {copy.items.map((item, index) => (
                  <li
                    className={`${styles.infrastructureItem} ${styles[itemPositions[index]]}`}
                    key={item.index}
                  >
                    <span className={`${styles.itemIndex} os-type-micro`}>{item.index}</span>
                    <div className={styles.itemCopy}>
                      <strong className={`${styles.itemTitle} os-type-action`}>{item.title}</strong>
                      <span className={styles.itemDetail}>{item.detail}</span>
                    </div>
                    <span className={styles.itemConnector} aria-hidden="true"><i /></span>
                  </li>
                ))}
              </ol>

              <div className={styles.siteAnchor} aria-hidden="true">
                <div className={styles.siteGlow} />
                <div className={styles.browser}>
                  <div className={styles.browserBar}>
                  <span className={styles.browserDots}><i /><i /><i /></span>
                  <span className={styles.browserAddress}>yourdomain.com</span>
                  <span className={styles.browserSecure}>↗</span>
                  </div>
                  <div className={styles.browserBody}>
                  <div className={styles.previewTop}>
                    <span className={styles.mockMicro}>PUBLISHED SITE</span>
                    <span className={styles.online}><i />ONLINE</span>
                  </div>
                  <div className={styles.previewContent}>
                    <div className={styles.previewCopy}>
                      <span className={styles.mockMicro}>ONESTUDIO / 01</span>
                      <span className={styles.previewRule} />
                      <div className={styles.previewLines}><i /><i /><i /></div>
                      <span className={styles.previewArrow}>↘</span>
                    </div>
                    <div className={styles.previewArt}>
                      <span />
                      <i />
                      <b />
                    </div>
                  </div>
                  <div className={styles.previewFooter}>
                    <span>YOUR SITE</span>
                    <i />
                    <span>01 — 03</span>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <p className={`${styles.microcopy} os-type-micro`}>{copy.microcopy}</p>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
