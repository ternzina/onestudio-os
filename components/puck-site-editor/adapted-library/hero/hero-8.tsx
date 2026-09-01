"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { hero8ContentDefaults } from "../../content-editability-batch-3-contracts";
import type { Hero8Image } from "../../content-editability-batch-3-contracts";

export { hero8ContentDefaults };

export type AdaptedHero8Props = {
  firstLeft: string;
  firstRight: string;
  secondLeft: string;
  secondRight: string;
  description: string;
  creatingImages: readonly Hero8Image[];
  buildingImages: readonly Hero8Image[];
  creatingImageAlt: string;
  buildingImageAlt: string;
  heroImageUrl: string;
  heroImageAlt: string;
};

type ImageData = Hero8Image;

interface MediaBetweenTextRowProps {
  leftText: string;
  rightText: string;
  images: readonly ImageData[];
  alt: string;
  isInView: boolean;
  delay?: number;
}

function MediaBetweenTextRow({
  leftText,
  rightText,
  images,
  alt,
  isInView,
  delay = 0,
}: MediaBetweenTextRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const shouldAnimate = isInView || isHovered;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const currentImage = images[currentImageIndex];
  const baseHeight = 100;
  const targetWidth = shouldAnimate ? baseHeight * currentImage.aspectRatio : 0;

  return (
    <>
      <motion.div
        className="sm:hidden text-2xl font-medium text-neutral-900 dark:text-white leading-tight uppercase tracking-tight text-left w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {leftText} {rightText}
      </motion.div>

      <div
        className="hidden sm:flex items-center justify-center gap-x-4 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.span
          layout
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-neutral-900 dark:text-white leading-none uppercase tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay }}
        >
          {leftText}
        </motion.span>
        <motion.div
          layout
          className="h-[60px] md:h-[70px] lg:h-20 xl:h-[100px] overflow-hidden rounded-md"
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: targetWidth,
            opacity: shouldAnimate ? 1 : 0,
          }}
          transition={{
            width: { duration: 0.5, type: "spring", bounce: 0 },
            opacity: { duration: 0.3 },
          }}
        >
          <img
            src={currentImage.url}
            alt={alt}
            className="h-full w-full object-cover"
          />
        </motion.div>
        <motion.span
          layout
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-neutral-900 dark:text-white leading-none uppercase tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
        >
          {rightText}
        </motion.span>
      </div>
    </>
  );
}

export function AdaptedHero8({
  firstLeft,
  firstRight,
  secondLeft,
  secondRight,
  description,
  creatingImages,
  buildingImages,
  creatingImageAlt,
  buildingImageAlt,
  heroImageUrl,
  heroImageAlt,
}: AdaptedHero8Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const shouldShowMedia = isInView || hasAnimated;

  return (
    <section className="w-full min-h-screen flex items-start lg:items-center py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div ref={sectionRef} className="max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col items-start sm:items-center space-y-8 sm:space-y-12 lg:space-y-16">
          <div className="flex flex-col items-start sm:items-center w-full space-y-2 sm:space-y-4">
            <MediaBetweenTextRow
              leftText={firstLeft}
              rightText={firstRight}
              images={creatingImages}
              alt={creatingImageAlt}
              isInView={shouldShowMedia}
              delay={0}
            />
            <MediaBetweenTextRow
              leftText={secondLeft}
              rightText={secondRight}
              images={buildingImages}
              alt={buildingImageAlt}
              isInView={shouldShowMedia}
              delay={0.15}
            />
          </div>

          <motion.p
            className="text-left sm:text-center text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed w-full sm:max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {description}
          </motion.p>

          <motion.div
            className="w-full overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-neutral-200 dark:bg-neutral-800">
              <img
                src={heroImageUrl}
                alt={heroImageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AdaptedHero8;
