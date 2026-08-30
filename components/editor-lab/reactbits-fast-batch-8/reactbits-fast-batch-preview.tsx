"use client";

import { RuntimeHost } from "@/components/editor-lab/puck/block-contract";
import styles from "@/components/editor-lab/reactbits-fast-batch-4/reactbits-fast-batch-preview.module.css";
import { fastBatch8Blocks } from "./puck-fast-batch-registry";

const groups = ["Marketing Blocks", "Application UI"] as const;

export default function ReactBitsFastBatch8Preview() {
  return (
    <main className={styles.page}>
      {groups.map((group) => (
        <section className={styles.group} key={group}>
          <h1 className={styles.heading}>{group}</h1>
          <div className={styles.grid}>
            {fastBatch8Blocks
              .filter((block) => block.batchGroup === group)
              .map((block) => {
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
      ))}
    </main>
  );
}
