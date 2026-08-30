"use client";

import { RuntimeHost } from "@/components/editor-lab/puck/block-contract";
import styles from "@/components/editor-lab/reactbits-fast-batch-4/reactbits-fast-batch-preview.module.css";
import { fastBatch9Blocks } from "./puck-fast-batch-registry";

const groups = ["CURSORS", "GALLERIES", "BACKGROUNDS"] as const;

export default function ReactBitsFastBatch9Preview() {
  return (
    <main className={styles.page}>
      {groups.map((group) => (
        <section className={styles.group} key={group}>
          <h1 className={styles.heading}>{group}</h1>
          <div className={styles.grid}>
            {fastBatch9Blocks
              .filter((block) => block.batchGroup === group)
              .map((block) => {
                const Block = block.component;

                return (
                  <article className={styles.item} key={block.catalogKey}>
                    <h2 className={styles.label}>{block.displayName}</h2>
                    {block.batchStatus === "DIRECT_RENDER_PASS" ? (
                      <RuntimeHost host={block.host}>
                        <Block {...block.defaultProps} />
                      </RuntimeHost>
                    ) : (
                      <p className={styles.blocked}>{block.blocker}</p>
                    )}
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </main>
  );
}
