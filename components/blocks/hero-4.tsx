"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function Hero4() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  const videos = [
    {
      id: 1,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      alt: "Video 1",
    },
    {
      id: 2,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      alt: "Video 2",
    },
    {
      id: 3,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      alt: "Video 3",
    },
    {
      id: 4,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      alt: "Video 4",
    },
    {
      id: 5,
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      alt: "Video 5",
    },
  ];

  const allVideos = [...videos, ...videos, ...videos];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    if (isPaused) {
      scrollPositionRef.current = scrollContainer.scrollLeft;
      return;
    }

    let animationFrameId: number;
    const scrollSpeed = 0.5;

    const scroll = () => {
      scrollPositionRef.current += scrollSpeed;

      const maxScroll = scrollContainer.scrollWidth / 3;
      if (scrollPositionRef.current >= maxScroll) {
        scrollPositionRef.current = 0;
      }

      scrollContainer.scrollLeft = scrollPositionRef.current;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  return (
    <section className="w-full overflow-hidden flex flex-col items-start justify-start py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col space-y-8 sm:space-y-12">
        <div className="flex flex-col space-y-6 sm:space-y-8 max-w-4xl mx-auto mb-28">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
              <span className="text-sm sm:text-base text-neutral-900 dark:text-white font-medium">
                Premium streaming
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col space-y-3 sm:space-y-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-neutral-900 dark:text-white leading-[1.1] md:whitespace-nowrap">
              Unlimited entertainment, forever.
            </h1>
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-neutral-500 dark:text-neutral-500 leading-[1.1] md:whitespace-nowrap">
              Watch anywhere, anytime.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <button className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium text-sm sm:text-base hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              Start watching free
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="w-screen relative left-[calc(-1*var(--scroll-padding))] ml-0"
          style={
            {
              "--scroll-padding": "1rem",
            } as React.CSSProperties
          }
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {allVideos.map((video, index) => (
              <div
                key={`${video.id}-${index}`}
                className="shrink-0 border border-border/20 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] h-[280px] sm:h-[360px] md:h-[400px] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 relative group"
              >
                <video
                  src={video.src}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                <div className="absolute bottom-4 left-4 flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>
            ))}
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 bg-linear-to-r from-white dark:from-neutral-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-linear-to-l from-white dark:from-neutral-950 to-transparent pointer-events-none" />
        </motion.div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default Hero4;
