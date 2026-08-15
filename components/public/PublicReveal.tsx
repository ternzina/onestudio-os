"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { PublicSiteBlockAnimation } from "@/lib/public-site/types";

export default function PublicReveal({
  id,
  editorAnchor,
  animation = "none",
  animateOnMobile = true,
  className = "",
  style,
  children,
}: {
  id?: string;
  editorAnchor?: string;
  animation?: PublicSiteBlockAnimation;
  animateOnMobile?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(animation === "none");

  useEffect(() => {
    setReady(true);
    if (animation === "none") {
      setVisible(true);
      return;
    }

    const node = sectionRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animation]);

  return (
    <section
      id={id}
      data-editor-anchor={editorAnchor}
      ref={sectionRef}
      className={`os-public-reveal ${className}`.trim()}
      style={style}
      data-animation={animation}
      data-ready={ready ? "true" : "false"}
      data-visible={visible ? "true" : "false"}
      data-mobile={animateOnMobile ? "true" : "false"}
    >
      {children}
    </section>
  );
}
