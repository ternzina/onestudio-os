"use client";

import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY } from "@/components/puck-site-editor/production-component-sources";
import type { PublicComponentVariant } from "@/lib/public-component-catalog";
import styles from "./page.module.css";

type PreviewErrorBoundaryProps = { children: ReactNode; label: string };
type PreviewErrorBoundaryState = { failed: boolean };

class PreviewErrorBoundary extends Component<PreviewErrorBoundaryProps, PreviewErrorBoundaryState> {
  state: PreviewErrorBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // A catalog preview is optional: a bad third-party source must not take down /components.
  }

  render() {
    if (this.state.failed) return <PreviewFallback label={this.props.label} />;
    return this.props.children;
  }
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
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || variant.previewMode === "fallback") return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { rootMargin: "320px 0px" });
    observer.observe(preview);
    return () => observer.disconnect();
  }, [variant.previewMode]);

  if (variant.previewMode === "fallback") {
    return <PreviewFallback label={variant.label} reason={variant.previewReason} />;
  }

  const Source = PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY[variant.catalogKey];
  if (!Source) return <PreviewFallback label={variant.label} />;
  const LazySource = lazy(async () => ({ default: Source }));

  return (
    <div ref={previewRef} className={styles.registryPreviewStage}>
      <PreviewErrorBoundary label={variant.label}>
        {isVisible ? (
          <Suspense fallback={<PreviewFallback label={variant.label} reason="Loading preview…" />}>
            <LazySource {...variant.defaults} />
          </Suspense>
        ) : null}
      </PreviewErrorBoundary>
    </div>
  );
}
