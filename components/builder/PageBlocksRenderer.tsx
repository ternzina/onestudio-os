'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/language-provider';
import type { PageBlock } from '@/lib/page-builder';

const widthClasses = {
  narrow: 'max-w-2xl',
  normal: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-none',
};

const backgroundClasses = {
  transparent: 'bg-transparent',
  light: 'bg-[#FFF7F2] text-[#2B1A12]',
  dark: 'bg-[#120B09] text-[#FFF7F2]',
  accent: 'bg-[#F5A2B7] text-[#2B1A12]',
};

export default function PageBlocksRenderer({
  pageSlug,
  zone = 'after_main',
}: {
  pageSlug: string;
  zone?: string;
}) {
  const { lang } = useLanguage();
  const [blocks, setBlocks] = useState<PageBlock[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('zone', zone)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      setBlocks((data ?? []) as PageBlock[]);
    };
    void load();
  }, [pageSlug, zone]);

  if (blocks.length === 0) return null;

  return (
    <div className="bg-[#0B0908] py-10 text-[#FFF7F2]">
      {blocks.map((block) => {
        const align = block.styles.align === 'left' ? 'text-left' : block.styles.align === 'right' ? 'text-right' : 'text-center';
        const width = widthClasses[block.styles.width ?? 'normal'];
        const background = backgroundClasses[block.styles.background ?? 'transparent'];
        const wrapper = `mx-auto my-5 rounded-[28px] px-6 py-10 sm:px-10 ${width} ${background} ${align}`;

        if (block.block_type === 'spacer') return <div key={block.id} style={{ height: block.content.height ?? 64 }} />;
        if (block.block_type === 'heading') return <section key={block.id} className={wrapper}><h2 className="font-serif text-4xl sm:text-5xl">{lang === 'pl' ? block.content.title_pl : block.content.title_uk}</h2></section>;
        if (block.block_type === 'text') return <section key={block.id} className={wrapper}><p className="whitespace-pre-wrap text-base leading-8">{lang === 'pl' ? block.content.text_pl : block.content.text_uk}</p></section>;
        if (block.block_type === 'image' && block.content.media_url) return <section key={block.id} className={wrapper}><img src={block.content.media_url} alt={lang === 'pl' ? block.content.alt_pl : block.content.alt_uk} className="mx-auto max-h-[760px] w-full rounded-[24px] object-cover" /></section>;
        if (block.block_type === 'video' && block.content.media_url) return <section key={block.id} className={wrapper}><video src={block.content.media_url} controls playsInline preload="metadata" className="mx-auto w-full rounded-[24px]" /></section>;
        if (block.block_type === 'button') return <section key={block.id} className={wrapper}><a href={block.content.button_href ?? '#'} className="inline-flex rounded-full bg-[#F5A2B7] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#2B1A12]">{lang === 'pl' ? block.content.button_label_pl : block.content.button_label_uk}</a></section>;
        return null;
      })}
    </div>
  );
}
