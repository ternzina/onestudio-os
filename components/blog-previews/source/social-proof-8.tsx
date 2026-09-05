"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";

const testimonials = [
  {
    quote:
      "The scalability and performance have been game-changing for our organization. We've seen a 50% improvement in response times.",
    name: "Imani Olowe",
    role: "VP of Engineering at Nexus",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1887&auto=format&fit=crop",
  },
  {
    quote:
      "A simplified workflow that actually works. It has transformed how our cross-functional teams collaborate on daily tasks.",
    name: "David Park",
    role: "Product Manager at Suralink",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
  },
  {
    quote:
      "The insights we gain from the analytics dashboard are invaluable. We can now make data-driven decisions with confidence.",
    name: "Sofia Davis",
    role: "CMO at BrightWave",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
  },
];

export function SocialProof8() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 10000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }
  };

  return (
    <section className="w-full py-24 bg-white dark:bg-neutral-950 overflow-hidden flex items-center justify-start select-none px-4 sm:px-6 lg:px-8">
      <div
        ref={containerRef}
        className="max-w-[1400px] mx-auto w-full relative cursor-none"
        onClick={nextSlide}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                translateX: cursorX,
                translateY: cursorY,
                position: "absolute",
                top: -20,
                left: -40,
                zIndex: 50,
              }}
              className="pointer-events-none"
            >
              <div className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-xl whitespace-nowrap">
                Next
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-stretch gap-6">
            <div className="w-full md:w-1/3 shrink-0">
              <div className="relative aspect-[1] w-full max-w-[260px] mx-auto md:mr-auto border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm h-full">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col justify-between">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <blockquote className="text-2xl md:text-3xl tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
                      "{testimonials[currentIndex].quote}"
                    </blockquote>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h4 className="text-xl font-medium tracking-tight text-neutral-900 dark:text-white mb-1">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-neutral-500 dark:text-neutral-400 text-base tracking-tight">
                      {testimonials[currentIndex].role}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-end gap-3 pointer-events-none pb-2">
                  {testimonials.map((_, idx) => (
                    <div
                      key={idx}
                      className="relative h-0.5 w-12 bg-neutral-300 dark:bg-neutral-800 overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-neutral-900 dark:bg-white"
                        initial={{ width: 0 }}
                        animate={{
                          width: idx === currentIndex ? "100%" : "0%",
                        }}
                        transition={{
                          duration: idx === currentIndex ? 10 : 0,
                          ease: "linear",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SocialProof8;
