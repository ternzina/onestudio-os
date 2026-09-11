"use client";

import { useReducedMotion } from "motion/react";
import {
  Component,
  memo,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { blogPreviewRegistry, type BlogPreviewId, type BlogPreviewComponent } from "./blog-preview-registry";
import styles from "./blog-preview.module.css";

function useNearViewport(ref: React.RefObject<HTMLDivElement | null>) {
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Load once on approach; scrolling away must never reset a live preview.
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "280px 0px", threshold: 0 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return isNearViewport;
}

type BlogPreviewErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type BlogPreviewErrorBoundaryState = {
  hasError: boolean;
};

class BlogPreviewErrorBoundary extends Component<
  BlogPreviewErrorBoundaryProps,
  BlogPreviewErrorBoundaryState
> {
  state: BlogPreviewErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): BlogPreviewErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function BlogPreview({
  componentId,
  title,
}: {
  componentId: BlogPreviewId;
  title: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const isNearViewport = useNearViewport(frameRef);
  const reducedMotion = useReducedMotion();
  const definition = blogPreviewRegistry[componentId];
  const [PreviewComponent, setPreviewComponent] = useState<BlogPreviewComponent | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [touchPinned, setTouchPinned] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const shouldLoad = hasActivated || (isNearViewport && !definition.interactionOnly && reducedMotion !== true);

  useEffect(() => {
    if (!shouldLoad || PreviewComponent) return;

    let cancelled = false;
    Promise.resolve()
      .then(() => definition.loader())
      .then(({ default: component }) => {
        if (typeof component !== "function") {
          throw new Error(`Blog preview ${componentId} has no default component export`);
        }
        if (!cancelled) setPreviewComponent(() => memo(component));
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [PreviewComponent, componentId, definition, shouldLoad]);

  const activate = () => {
    setIsActive(true);
    setHasActivated(true);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      const nextPinned = !touchPinned;
      setTouchPinned(nextPinned);
      setIsActive(nextPinned);
      if (nextPinned) setHasActivated(true);
      return;
    }
    activate();
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" && !touchPinned) setIsActive(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!touchPinned && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsActive(false);
    }
  };

  const handlePreviewClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, form, button")) event.preventDefault();
  };

  return (
    <div
      ref={frameRef}
      className={styles.previewFrame}
      data-active={isActive ? "true" : "false"}
      data-interaction-only={definition.interactionOnly ? "true" : "false"}
      data-component-id={componentId}
      data-preview-loaded={PreviewComponent ? "true" : "false"}
      data-source-path={definition.sourcePath}
      tabIndex={0}
      role="group"
      aria-label={`${title} live preview`}
      onPointerEnter={activate}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onFocus={activate}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClickCapture={handlePreviewClickCapture}
    >
      <div className={styles.previewStage}>
        {loadFailed ? (
          <span className={styles.previewError} data-preview-error>Preview unavailable</span>
        ) : null}
        {PreviewComponent ? (
          <BlogPreviewErrorBoundary
            fallback={<span className={styles.previewError} data-preview-error>Preview unavailable</span>}
          >
            <div data-preview-content={componentId}>
              <PreviewComponent key={componentId} />
            </div>
          </BlogPreviewErrorBoundary>
        ) : null}
      </div>
      <span className={styles.previewHint} aria-hidden="true">
        {isActive ? "live preview" : "hover · focus · tap"}
      </span>
    </div>
  );
}

export default memo(BlogPreview);
