"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import styles from "./OneStudioStatsVisual.module.css";

type OneStudioStatsVisualProps = {
  labels: readonly string[];
};

// Extracted from licensed Stats 7 visual for OneStudio marketing analytics.
const progressData = [
  { percentage: 68, tone: "orange" },
  { percentage: 45, tone: "blue" },
  { percentage: 23, tone: "green" },
  { percentage: 12, tone: "rose" },
  { percentage: 8, tone: "amber" },
  { percentage: 34, tone: "cream" },
  { percentage: 52, tone: "emerald" },
  { percentage: 15, tone: "cyan" },
] as const;

export default function OneStudioStatsVisual({ labels }: OneStudioStatsVisualProps) {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.rows}>
        {progressData.map((item, index) => {
          const label = labels[index] ?? labels[labels.length - 1] ?? "";
          const width = `${item.percentage}%`;

          return (
            <motion.div
              key={`${label}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
              className={styles.row}
            >
              <div className={styles.rowMeta}>
                <span className={styles.label}>{label}</span>
                <span className={styles.percentage}>{item.percentage}%</span>
              </div>

              <div className={styles.track}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 + index * 0.05, ease: "easeOut" }}
                  className={`${styles.fill} ${styles[item.tone]}`}
                  style={{ "--stats-width": width } as CSSProperties}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
