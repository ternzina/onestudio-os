"use client";

import { RuntimeHost } from "@/components/editor-lab/puck/block-contract";

import { fastBatch1Blocks } from "./puck-fast-batch-registry";
import styles from "./reactbits-fast-batch-preview.module.css";

const groups = ["Animated Components", "Marketing Blocks", "Application UI"] as const;

export default function ReactBitsFastBatch1Preview() {
  return (
    <main className={styles.page}>
      {groups.map((group) => {
        const blocks = fastBatch1Blocks.filter(
          (block) => block.batchGroup === group && block.batchStatus === "DIRECT_RENDER_PASS",
        );

        return (
          <section className={styles.group} key={group} aria-labelledby={`fast-batch-1-${group}`}>
            <h1 className={styles.heading} id={`fast-batch-1-${group}`}>{group}</h1>
            <div className={styles.grid}>
              {blocks.map((block) => {
                const Block = block.component;
                return (
                  <article className={styles.item} key={block.catalogKey}>
                    <h2 className={styles.label}>{block.displayName}</h2>
                    <RuntimeHost host={block.host}>
                      <Block {...block.defaultProps} />
                    </RuntimeHost>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
