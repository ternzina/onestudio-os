"use client";

import { useEffect, useRef } from "react";
import {
  BlurHighlight,
  type BlurHighlightRef,
} from "@/components/react-bits/blur-highlight";

export default function ProductionBlurHighlight({ text }: { text: string }) {
  const blurHighlightRef = useRef<BlurHighlightRef>(null);

  useEffect(() => {
    blurHighlightRef.current?.trigger();
    return () => blurHighlightRef.current?.reset();
  }, []);

  return <BlurHighlight ref={blurHighlightRef}>{text}</BlurHighlight>;
}
