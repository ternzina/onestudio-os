"use client";

import { useMemo, useState } from "react";
import { RuntimeHost } from "@/components/editor-lab/puck/block-contract";
import styles from "@/components/editor-lab/reactbits-fast-batch-4/reactbits-fast-batch-preview.module.css";
import {
  fastBatch12Blocks,
  type FastBatch12Block,
  type FastBatch12Group,
} from "./puck-fast-batch-registry";

const groups = [
  "HERO / PREMIUM",
  "SHOWCASE / MEDIA",
  "NAV / CTA / FOOTER",
  "PRICING / CONTACT",
  "APP / CONTENT",
  "BACKGROUNDS / INTERACTIVE",
  "OTHER",
] as const;

function firstBlock(group: FastBatch12Group) {
  return fastBatch12Blocks.find(
    (block) => block.batchGroup === group && !block.batchStatus.startsWith("BLOCKED"),
  )?.catalogKey ?? "";
}

export default function ReactBitsFastBatch12Preview() {
  const [activeByGroup, setActiveByGroup] = useState<Record<FastBatch12Group, string>>({
    "HERO / PREMIUM": firstBlock("HERO / PREMIUM"),
    "SHOWCASE / MEDIA": firstBlock("SHOWCASE / MEDIA"),
    "NAV / CTA / FOOTER": firstBlock("NAV / CTA / FOOTER"),
    "PRICING / CONTACT": firstBlock("PRICING / CONTACT"),
    "APP / CONTENT": firstBlock("APP / CONTENT"),
    "BACKGROUNDS / INTERACTIVE": firstBlock("BACKGROUNDS / INTERACTIVE"),
    OTHER: firstBlock("OTHER"),
  });

  const blocksByGroup = useMemo(
    () => Object.fromEntries(
      groups.map((group) => [group, fastBatch12Blocks.filter((block) => block.batchGroup === group)]),
    ) as Record<FastBatch12Group, FastBatch12Block[]>,
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
          <section className={styles.group} data-batch12-group={group} key={group}>
            <h1 className={styles.heading}>{group}</h1>
            <div className={styles.grid} aria-label={`${group} candidates`}>
              {blocks.map((block) => (
                <button
                  type="button"
                  data-batch12-select={block.catalogKey}
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
            <article className={styles.item} data-batch12-preview={active.catalogKey}>
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
