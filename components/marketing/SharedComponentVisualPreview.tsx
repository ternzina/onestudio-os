"use client";

import {
  Component,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type ElementType,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

export type SharedVisualPreviewDefinition = {
  component: ElementType;
  getProps: (reducedMotion: boolean) => Record<string, unknown>;
  preload?: () => Promise<unknown>;
};

type PreviewBoundaryProps = { children: ReactNode; fallback?: ReactNode };
type PreviewBoundaryState = { failed: boolean };

class PreviewBoundary extends Component<PreviewBoundaryProps, PreviewBoundaryState> {
  state: PreviewBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // A third-party visual must never take down its catalog or host section.
  }

  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}

type FitCanvas = { width: number; height: number };

export function SharedComponentVisualPreview({
  preview,
  hostClassName,
  stageClassName,
  previewKey,
  fit = "native",
  canvas = { width: 1280, height: 800 },
  fallback,
}: {
  preview: SharedVisualPreviewDefinition;
  hostClassName: string;
  stageClassName: string;
  previewKey?: string;
  fit?: "native" | "contain";
  canvas?: FitCanvas;
  fallback?: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const preloadedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const [contentHeight, setContentHeight] = useState(canvas.height);
  const reducedMotion = useReducedMotion() ?? false;
  const Preview = preview.component as ComponentType<Record<string, unknown>>;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const preload = () => {
      if (preloadedRef.current) return;
      preloadedRef.current = true;
      void preview.preload?.().catch(() => undefined);
    };

    if (!("IntersectionObserver" in window)) {
      preload();
      setIsVisible(true);
      return;
    }

    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      preload();
      preloadObserver.disconnect();
    }, { rootMargin: "320px 0px" });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      setIsVisible(Boolean(entry?.isIntersecting));
    }, { rootMargin: "140px 0px" });

    preloadObserver.observe(host);
    visibilityObserver.observe(host);
    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [preview]);

  useLayoutEffect(() => {
    if (fit !== "contain") return;
    const host = hostRef.current;
    const canvasElement = canvasRef.current;
    if (!host || !canvasElement) return;

    const measure = () => {
      setHostSize({ width: host.clientWidth, height: host.clientHeight });
      setContentHeight(Math.max(canvas.height, canvasElement.scrollHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(canvasElement);
    return () => observer.disconnect();
  }, [canvas.height, fit, isVisible]);

  const scale = fit === "contain" && hostSize.width && hostSize.height
    ? Math.min(1, hostSize.width / canvas.width, hostSize.height / contentHeight)
    : 1;
  const stageStyle = fit === "contain" ? {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    width: `${canvas.width}px`,
    minHeight: `${canvas.height}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: "center center",
  } : undefined;

  return (
    <div ref={hostRef} className={hostClassName}>
      {isVisible ? (
        <PreviewBoundary key={previewKey} fallback={fallback}>
          <motion.div
            ref={canvasRef}
            className={stageClassName}
            style={stageStyle}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Preview {...preview.getProps(reducedMotion)} />
          </motion.div>
        </PreviewBoundary>
      ) : null}
    </div>
  );
}
