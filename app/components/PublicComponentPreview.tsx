"use client";

import { autonomousPreviewBySource } from "@/components/marketing/catalog/generated-block-registry";
import { SharedComponentVisualPreview } from "@/components/marketing/SharedComponentVisualPreview";
import { PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY } from "@/components/puck-site-editor/production-component-sources";
import type { PublicComponentVariant } from "@/lib/public-component-catalog";
import styles from "./page.module.css";

function sourceFile(source: string) {
  return `${source.replace(/^@\//, "").replace(/\.(?:tsx?|jsx?)$/, "")}.tsx`;
}

function autonomousPreviewFor(variant: PublicComponentVariant) {
  return autonomousPreviewBySource.get(sourceFile(variant.rendererSource))
    ?? autonomousPreviewBySource.get(sourceFile(variant.physicalSource));
}

function PreviewFallback({ label, reason }: { label: string; reason?: string }) {
  return (
    <div className={styles.registryPreviewFallback}>
      <span className="os-type-micro">OneStudio component</span>
      <strong>{label}</strong>
      <small>{reason ?? "Preview available in the site editor"}</small>
    </div>
  );
}

export default function PublicComponentPreview({ variant }: { variant: PublicComponentVariant }) {
  if (variant.previewMode === "fallback") {
    return <PreviewFallback label={variant.label} reason={variant.previewReason} />;
  }

  const autonomousPreview = autonomousPreviewFor(variant);
  const Source = autonomousPreview?.component
    ?? PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY[variant.catalogKey];
  if (!Source) return <PreviewFallback label={variant.label} />;

  return (
    <SharedComponentVisualPreview
      previewKey={variant.id}
      preview={{
        component: Source,
        preload: autonomousPreview?.preload,
        getProps: () => autonomousPreview?.getProps() ?? variant.defaults,
      }}
      hostClassName={styles.registryPreviewStage}
      stageClassName={styles.registryPreviewCanvas}
      fit="contain"
      canvas={variant.taxonomy === "Navigation" ? { width: 1280, height: 640 } : { width: 1280, height: 900 }}
      fallback={<PreviewFallback label={variant.label} />}
    />
  );
}
