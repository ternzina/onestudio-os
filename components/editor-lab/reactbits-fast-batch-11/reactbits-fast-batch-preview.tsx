"use client";

import { useMemo, useState } from "react";
import { RuntimeHost } from "@/components/editor-lab/puck/block-contract";
import styles from "@/components/editor-lab/reactbits-fast-batch-4/reactbits-fast-batch-preview.module.css";
import {
  fastBatch11Blocks,
  type FastBatch11Block,
  type FastBatch11Group,
} from "./puck-fast-batch-registry";

const groups = [
  "HERO / PREMIUM",
  "SHOWCASE / MEDIA",
  "NAV / CTA / FOOTER",
  "APP / CONTENT",
  "BACKGROUNDS / INTERACTIVE",
] as const;

function firstBlock(group: FastBatch11Group) {
  return fastBatch11Blocks.find(
    (block) => block.batchGroup === group && !block.batchStatus.startsWith("BLOCKED"),
  )?.catalogKey ?? "";
}

export default function ReactBitsFastBatch11Preview() {
  const [activeByGroup, setActiveByGroup] = useState<Record<FastBatch11Group, string>>({
    "HERO / PREMIUM": firstBlock("HERO / PREMIUM"),
    "SHOWCASE / MEDIA": firstBlock("SHOWCASE / MEDIA"),
    "NAV / CTA / FOOTER": firstBlock("NAV / CTA / FOOTER"),
    "APP / CONTENT": firstBlock("APP / CONTENT"),
    "BACKGROUNDS / INTERACTIVE": firstBlock("BACKGROUNDS / INTERACTIVE"),
  });

  const blocksByGroup = useMemo(
    () => Object.fromEntries(
      groups.map((group) => [group, fastBatch11Blocks.filter((block) => block.batchGroup === group)]),
    ) as Record<FastBatch11Group, FastBatch11Block[]>,
    [],
  );

  return (
    <main className={styles.page}>
      {groups.map((group) => {
        const blocks = blocksByGroup[group];
        const active = blocks.find((block) => block.catalogKey === activeByGroup[group]) ?? blocks[0];
        const Block = active.component;
        const blocked = active.batchStatus.startsWith("BLOCKED") || !Block;

        return (
          <section className={styles.group} data-batch11-group={group} key={group}>
            <h1 className={styles.heading}>{group}</h1>
            <div className={styles.grid} aria-label={`${group} candidates`}>
              {blocks.map((block) => (
                <button
                  type="button"
                  data-batch11-select={block.catalogKey}
                  aria-pressed={block.catalogKey === active.catalogKey}
                  key={block.catalogKey}
                  onClick={() => setActiveByGroup((current) => ({ ...current, [group]: block.catalogKey }))}
                  style={{
                    border: "1px solid currentColor",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    textAlign: "left",
                    opacity: block.catalogKey === active.catalogKey ? 1 : 0.65,
                  }}
                >
                  {block.displayName}
                </button>
              ))}
            </div>
            <article className={styles.item} data-batch11-preview={active.catalogKey}>
              <h2 className={styles.label}>{active.displayName}</h2>
              {blocked || !Block ? (
                <p className={styles.blocked}>{active.blocker ?? active.batchStatus}</p>
              ) : (
                <RuntimeHost host={active.host}>
                  <Block {...active.defaultProps} />
                </RuntimeHost>
              )}
            </article>
          </section>
        );
      })}
    </main>
  );
}
