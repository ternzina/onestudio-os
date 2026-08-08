import Image from "next/image";
import PublicRichText from "@/components/public/PublicRichText";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import { publicSiteBlockColumnCards } from "@/lib/public-site/custom-block-registry";
import type { PremiumKidsBlock } from "@/lib/public-site/premium-kids-content";
import EditorialMotion from "./EditorialMotion";
import styles from "./Platform.module.css";

/* eslint-disable @next/next/no-img-element */

function PremiumImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  return src.startsWith("/") ? <Image src={src} alt={alt} fill sizes={sizes} /> : <img src={src} alt={alt} loading="lazy" />;
}

export default function PremiumUniversalBlock({ block }: { block: PremiumKidsBlock }) {
  const content = block.props.universal_block;
  if (!content || !block.visible) return null;
  const heading = <><p className={styles.premiumUniversalEyebrow}>{content.eyebrow}</p><h2 style={publicTypographyStyle(content.title_typography)}>{content.title}</h2></>;

  if (content.kind === "text") {
    return <EditorialMotion className={`${styles.premiumUniversal} ${styles.premiumUniversalText}`} distance={24}>
      <section data-premium-block-id={block.id}>{heading}<div className={styles.premiumUniversalCopy}><PublicRichText value={content.text} /></div></section>
    </EditorialMotion>;
  }

  if (content.kind === "media_text") {
    const mediaFirst = content.media_position === "left";
    return <EditorialMotion className={styles.premiumUniversal} distance={24}>
      <section data-premium-block-id={block.id} className={`${styles.premiumUniversalSplit} ${mediaFirst ? styles.premiumUniversalMediaFirst : ""}`}>
        <div className={styles.premiumUniversalBody}>{heading}<div className={styles.premiumUniversalCopy}><PublicRichText value={content.text} /></div>{content.button_label ? <a href={content.button_url || "#top"}>{content.button_label}<span aria-hidden="true">↗</span></a> : null}</div>
        <div className={styles.premiumUniversalMedia}>{content.media_url ? <PremiumImage src={content.media_url} alt={content.media_alt || ""} sizes="(max-width: 760px) 100vw, 48vw" /> : <span>Добавьте изображение</span>}</div>
      </section>
    </EditorialMotion>;
  }

  if (content.kind === "columns") {
    const cards = publicSiteBlockColumnCards(content).slice(0, content.columns_count ?? 3);
    return <EditorialMotion className={styles.premiumUniversal} distance={24}>
      <section data-premium-block-id={block.id} className={styles.premiumUniversalColumns}>{heading}{content.text ? <div className={styles.premiumUniversalIntro}><PublicRichText value={content.text} /></div> : null}<div className={styles.premiumUniversalCards}>{cards.map((card, index) => <article key={card.id}>
        {card.media_type === "image" && card.media_url ? <div className={styles.premiumUniversalCardMedia}><PremiumImage src={card.media_url} alt={card.media_alt || ""} sizes="(max-width: 760px) 100vw, 31vw" /></div> : null}
        <span>0{index + 1}</span><h3>{card.title}</h3><PublicRichText value={card.text} />
      </article>)}</div></section>
    </EditorialMotion>;
  }

  return null;
}
