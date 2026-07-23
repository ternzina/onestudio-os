"use client";

import Image from "next/image";
import { useLanguage } from "../../lib/language-provider";

type Placement = "after_hero" | "after_programs" | "after_benefits" | "page_bottom";

export type LearningExtraBlock = {
  id: string;
  block_type: "text" | "image" | "video";
  title_uk: string;
  title_pl: string;
  text_uk: string;
  text_pl: string;
  media_url: string;
  placement: Placement;
  size: "small" | "medium" | "large" | "full";
  align: "left" | "center" | "right";
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  sort_order: number;
  is_visible: boolean;
};

const widthClasses = {
  small: "max-w-xl",
  medium: "max-w-3xl",
  large: "max-w-5xl",
  full: "max-w-none",
};

const alignClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

export default function LearningExtraBlocksRenderer({
  placement,
  blocks,
}: {
  placement: Placement;
  blocks: LearningExtraBlock[];
}) {
  const { lang } = useLanguage();
  const placementBlocks = blocks.filter((block) => block.placement === placement);

  if (placementBlocks.length === 0) return null;

  return (
    <section className="mt-16 space-y-8">
      {placementBlocks.map((block) => {
        const wrapper = `${widthClasses[block.size || "large"]} ${
          alignClasses[block.align || "center"]
        } w-full`;

        if (block.block_type === "text") {
          const title = lang === "pl" ? block.title_pl : block.title_uk;
          const text = lang === "pl" ? block.text_pl : block.text_uk;

          return (
            <article
              key={block.id}
              className={`${wrapper} rounded-[32px] border border-[#F5A2B7]/20 bg-[#100A08]/72 p-8 shadow-[0_0_60px_rgba(245,162,183,0.05)] sm:p-10`}
            >
              {title && (
                <h2 className="font-serif text-4xl text-[#FFF7F2] sm:text-5xl">
                  {title}
                </h2>
              )}
              {text && (
                <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#D7C8C0]">
                  {text}
                </p>
              )}
            </article>
          );
        }

        if (block.block_type === "image" && block.media_url) {
          return (
            <article
              key={block.id}
              className={`${wrapper} overflow-hidden rounded-[32px] border border-[#F5A2B7]/20 bg-[#100A08]/72 shadow-[0_0_60px_rgba(245,162,183,0.05)]`}
            >
              <Image
                src={block.media_url}
                alt=""
                width={1600}
                height={1100}
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="max-h-[820px] w-full object-cover"
              />
            </article>
          );
        }

        if (block.block_type === "video" && block.media_url) {
          return (
            <article
              key={block.id}
              className={`${wrapper} overflow-hidden rounded-[32px] border border-[#F5A2B7]/20 bg-black shadow-[0_0_60px_rgba(245,162,183,0.05)]`}
            >
              <video
                src={block.media_url}
                controls={block.controls}
                autoPlay={block.autoplay}
                muted={block.muted}
                loop={block.loop}
                playsInline
                preload="metadata"
                className="w-full"
              />
            </article>
          );
        }

        return null;
      })}
    </section>
  );
}
