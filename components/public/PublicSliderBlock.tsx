"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import type {
  PublicSiteMediaAspect,
  PublicSiteMediaFit,
  PublicSiteMediaFrame,
  PublicSiteMediaSize,
} from "@/lib/public-site/types";

const sizeClass: Record<PublicSiteMediaSize, string> = {
  full: "w-full",
  wide: "w-full max-w-5xl",
  medium: "w-full max-w-3xl",
  compact: "w-full max-w-xl",
};

const aspectClass: Record<PublicSiteMediaAspect, string> = {
  landscape: "aspect-video",
  classic: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
};

const frameClass: Record<PublicSiteMediaFrame, string> = {
  none: "",
  line: "rounded-2xl border border-current/15 p-1",
  card: "rounded-[28px] bg-white/10 p-3 shadow-[0_22px_65px_rgba(0,0,0,0.16)]",
};

export default function PublicSliderBlock({
  images,
  intervalSeconds,
  title,
  size = "wide",
  aspect = "landscape",
  fit = "cover",
  frame = "line",
}: {
  images: string[];
  intervalSeconds: number;
  title: string;
  size?: PublicSiteMediaSize;
  aspect?: PublicSiteMediaAspect;
  fit?: PublicSiteMediaFit;
  frame?: PublicSiteMediaFrame;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeInterval = Math.min(30, Math.max(2, intervalSeconds || 4));

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, safeInterval * 1000);

    return () => window.clearInterval(timer);
  }, [images.length, safeInterval]);

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0);
  }, [activeIndex, images.length]);

  if (!images.length) return null;

  return (
    <div className={`mx-auto mt-10 ${sizeClass[size]} ${frameClass[frame]}`}>
      <div
        className={`relative overflow-hidden bg-black/10 ${
          frame === "none" ? "" : "rounded-xl"
        } ${aspectClass[aspect]}`}
      >
        {images.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`${title} — слайд ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full ${
              fit === "contain" ? "object-contain" : "object-cover"
            } transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        ))}
        {images.length > 1 ? (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-12">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Показать слайд ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-7 bg-white" : "w-2 bg-white/55"
              }`}
            />
          ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
