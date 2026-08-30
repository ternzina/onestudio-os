"use client";

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

function BlurText({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");

  return (
    <span className="inline-flex flex-wrap">
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex mr-[0.25em]">
          {word.split("").map((char, charIndex) => {
            const totalIndex =
              words.slice(0, wordIndex).join("").length + charIndex + wordIndex;
            return (
              <motion.span
                key={charIndex}
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.4,
                  delay: delay + totalIndex * 0.03,
                  ease: "easeOut",
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export function Hero9() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
      >
        <source
          src="https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />

      <div className="relative z-10 min-h-screen flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
            <div className="flex flex-col items-start">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-medium text-white leading-[1.1] tracking-tight">
                <BlurText text="Explore the" delay={0.1} />
                <br />
                <BlurText text="unknown" delay={0.5} />
              </h1>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-6 sm:mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Scroll
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-start lg:items-end gap-4 lg:gap-5"
            >
              <p className="text-lg sm:text-xl text-white/90 max-w-xs lg:text-right">
                Your next adventure starts here.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
                <a
                  href="#"
                  className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-colors w-full sm:w-auto cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] opacity-70 leading-none">
                      Download on the
                    </span>
                    <span className="text-sm font-semibold leading-tight">
                      App Store
                    </span>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium transition-colors w-full sm:w-auto cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] opacity-70 leading-none">
                      GET IT ON
                    </span>
                    <span className="text-sm font-semibold leading-tight">
                      Google Play
                    </span>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero9;
