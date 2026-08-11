import Image from "next/image";
import type { CSSProperties } from "react";
import PublicRichText from "@/components/public/PublicRichText";
import PublicRichHeading from "@/components/public/PublicRichHeading";
import PublicCustomBlock from "@/components/public/PublicCustomBlock";
import PublicReveal from "@/components/public/PublicReveal";
import { colorOverrideStyle } from "@/lib/public-site/colors";
import { publicSiteButtonStyle, type PublicSiteButtonTheme } from "@/lib/public-site/button-style";
import {
  publicSiteBlockCompositionStyle,
  publicSiteCompositionItemStyle,
  resolvePublicSiteBlockComposition,
} from "@/lib/public-site/block-composition";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import { safePublicActionHref } from "@/lib/public-site/editor-actions";
import { publicSiteBlockColumnCards } from "@/lib/public-site/custom-block-registry";
import { publicSiteCustomBlockContentStyle, publicSiteCustomBlockMediaStyle, publicSiteCustomBlockVisualStyle, publicSiteMediaVariables } from "@/lib/public-site/visual-tokens";
import type { PremiumKidsBlock } from "@/lib/public-site/premium-kids-content";
import styles from "./Platform.module.css";

/* eslint-disable @next/next/no-img-element */

function PremiumImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  return src.startsWith("/") ? <Image className="os-managed-media" src={src} alt={alt} fill sizes={sizes} /> : <img className="os-managed-media" src={src} alt={alt} loading="lazy" />;
}

const BEMBI_BUTTON_THEME: PublicSiteButtonTheme = {
  size: "large",
  backgroundColor: "var(--ink)",
  textColor: "var(--paper)",
};

export default function PremiumUniversalBlock({ block }: { block: PremiumKidsBlock }) {
  const content = block.props.universal_block;
  if (!content || !block.visible) return null;
  const reveal = { animation: content.animation ?? "none", animateOnMobile: content.animate_on_mobile !== false };
  const sectionStyle = {
    ...publicSiteCustomBlockVisualStyle(content),
    ...colorOverrideStyle(content.colors),
    ...(content.colors?.mode === "custom" && content.colors.accent ? { "--apricot": content.colors.accent } : {}),
  } as CSSProperties;
  const contentStyle = publicSiteCustomBlockContentStyle(content);
  const mediaStyle = publicSiteCustomBlockMediaStyle(content);
  const mediaVariables = publicSiteMediaVariables(content);
  const composition = resolvePublicSiteBlockComposition(content);
  const compositionStyle = publicSiteBlockCompositionStyle(content);
  const compositionAttributes = composition.enabled ? {
    "data-os-composition": "enabled" as const,
    "data-os-composition-layout": composition.layout,
    "data-os-composition-mobile-layout": composition.mobileLayout,
    "data-os-composition-kind": content.kind,
    "data-os-composition-card-layout": composition.cardLayout,
    "data-os-composition-mobile-card-layout": composition.mobileCardLayout,
  } : {};
  const itemStyle = (element: Parameters<typeof publicSiteCompositionItemStyle>[1]) => publicSiteCompositionItemStyle(content, element);
  const buttonStyle = publicSiteButtonStyle(content, BEMBI_BUTTON_THEME);
  const mediaClass = `${styles.premiumUniversalMedia} ${content.media_frame === "none" ? styles.premiumUniversalMediaNoFrame : content.media_frame === "card" ? styles.premiumUniversalMediaCard : styles.premiumUniversalMediaLine}`;
  const heading = <><p data-os-composition-slot="eyebrow" style={itemStyle("eyebrow")} className={styles.premiumUniversalEyebrow}>{content.eyebrow}</p><h2 data-os-composition-slot="title" style={{ ...publicTypographyStyle(content.title_typography), ...itemStyle("title") }}><PublicRichHeading value={content.title} /></h2></>;

  if (content.kind === "text") {
    return <PublicReveal {...reveal} className={`${styles.premiumUniversal} ${styles.premiumUniversalText}`} style={sectionStyle}>
      <div data-premium-block-id={block.id} className={`${styles.premiumUniversalInner} os-block-composition`} style={{ ...contentStyle, ...compositionStyle }} {...compositionAttributes}>{heading}<div data-os-composition-slot="text" style={itemStyle("text")} className={styles.premiumUniversalCopy}><PublicRichText value={content.text} /></div></div>
    </PublicReveal>;
  }

  if (content.kind === "media_text") {
    const mediaFirst = content.media_position === "left";
    return <PublicReveal {...reveal} className={styles.premiumUniversal} style={sectionStyle}>
      <div data-premium-block-id={block.id} data-os-media-mobile-position={content.media_mobile_position ?? "after"} data-os-composition-media-position={mediaFirst ? "left" : "right"} data-os-composition-mobile-media-position={content.media_mobile_position ?? "after"} style={{ ...contentStyle, ...mediaVariables, ...compositionStyle }} className={`${styles.premiumUniversalInner} ${styles.premiumUniversalSplit} ${mediaFirst ? styles.premiumUniversalMediaFirst : ""} os-block-composition`} {...compositionAttributes}>
        <div data-os-media-body className={`${styles.premiumUniversalBody} os-composition-sequence`} data-os-composition={composition.enabled ? "enabled" : undefined}>{heading}<div data-os-composition-slot="text" style={itemStyle("text")} className={styles.premiumUniversalCopy}><PublicRichText value={content.text} /></div>{content.button_label ? <a data-os-composition-slot="action" style={{ ...buttonStyle, ...itemStyle("action") }} href={safePublicActionHref(content.button_url, "#top")}>{content.button_label}<span aria-hidden="true">↗</span></a> : null}</div>
        <div data-os-media-slot data-os-composition-slot="media" className={`${mediaClass} os-managed-media-frame`} style={{ ...mediaStyle, minHeight: (content.media_height && content.media_height !== "auto") || (content.media_mobile_height && content.media_mobile_height !== "auto") ? 0 : undefined }}>{content.media_url ? <PremiumImage src={content.media_url} alt={content.media_alt || ""} sizes="(max-width: 760px) 100vw, 48vw" /> : <span>Добавьте изображение</span>}</div>
      </div>
    </PublicReveal>;
  }

  if (content.kind === "columns") {
    const columnCount = content.columns_count === 2 ? 2 : 3;
    const cards = publicSiteBlockColumnCards(content).slice(0, columnCount);
    return <PublicReveal {...reveal} className={styles.premiumUniversal} style={sectionStyle}>
      <div data-premium-block-id={block.id} style={{ ...contentStyle, ...compositionStyle }} className={`${styles.premiumUniversalInner} ${styles.premiumUniversalColumns} os-block-composition`} {...compositionAttributes}>{heading}{content.text ? <div data-os-composition-slot="text" style={itemStyle("text")} className={styles.premiumUniversalIntro}><PublicRichText value={content.text} /></div> : null}<div data-os-composition-slot="cards" style={itemStyle("cards")} data-premium-columns={columnCount} className={`${styles.premiumUniversalCards} ${columnCount === 2 ? styles.premiumUniversalCardsTwo : ""}`}>{cards.map((card, index) => <article key={card.id} data-os-composition-card data-os-composition-has-media={card.media_type === "image" ? "true" : "false"}>
        {card.media_type === "image" && card.media_url ? <div data-os-composition-card-media className={`${styles.premiumUniversalCardMedia} os-managed-media-surface`} style={mediaVariables}><PremiumImage src={card.media_url} alt={card.media_alt || ""} sizes="(max-width: 760px) 100vw, 31vw" /></div> : null}
        <span>0{index + 1}</span><h3>{card.title}</h3><PublicRichText value={card.text} />
      </article>)}</div></div>
    </PublicReveal>;
  }

  if (["features", "cta", "slider", "collage", "video"].includes(content.kind)) {
    return <div data-premium-block-id={block.id} className={styles.premiumUniversal} style={sectionStyle} data-premium-universal-kind={content.kind}>
      <PublicCustomBlock block={content} buttonTheme={BEMBI_BUTTON_THEME} />
    </div>;
  }

  return null;
}
