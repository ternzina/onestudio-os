"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef } from "react";

export function Hero6() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const slides = [
    {
      title: "Work smarter.",
      subtitle: "Ship faster.",
      description: "The #1 project tool trusted by developers.",
      image:
        "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      color: "bg-blue-500",
    },
    {
      title: "Build together.",
      subtitle: "Scale better.",
      description: "Real-time collaboration and team management.",
      image:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      color: "bg-purple-500",
    },
    {
      title: "Track metrics.",
      subtitle: "Grow revenue.",
      description: "Powerful analytics. Your business goals met.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      color: "bg-orange-500",
    },
  ];

  const slideDuration = 5000;

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setOverallProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / ((slideDuration * slides.length) / 50);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [slides.length]);

  useEffect(() => {
    const slideIndex = Math.floor((overallProgress / 100) * slides.length);
    setCurrentSlide(Math.min(slideIndex, slides.length - 1));
  }, [overallProgress, slides.length]);

  const handleSlideClick = (index: number) => {
    setOverallProgress((index / slides.length) * 100);
    setCurrentSlide(index);
  };

  return (
    <section className="w-full min-h-screen flex items-start lg:items-center py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-12 lg:gap-16 xl:gap-20 items-center">
          <div className="flex flex-col space-y-8 lg:space-y-12 justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.2 },
                  },
                  exit: {
                    opacity: 0,
                    transition: { duration: 0.2 },
                  },
                }}
                className="space-y-6"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-neutral-900 dark:text-white leading-tight">
                  <motion.span
                    variants={{
                      hidden: { y: 30, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          duration: 0.8,
                          ease: [0.2, 0.65, 0.3, 0.9],
                        },
                      },
                    }}
                    className="block"
                  >
                    {slides[currentSlide].title}
                  </motion.span>
                  <motion.span
                    variants={{
                      hidden: { y: 30, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          duration: 0.8,
                          ease: [0.2, 0.65, 0.3, 0.9],
                        },
                      },
                    }}
                    className="block text-neutral-500 dark:text-neutral-500"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.span>
                </h1>

                <motion.p
                  variants={{
                    hidden: { y: 30, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.8,
                        ease: [0.2, 0.65, 0.3, 0.9],
                      },
                    },
                  }}
                  className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md"
                >
                  {slides[currentSlide].description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row sm:relative gap-3 sm:gap-0 max-w-md w-full"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full pl-6 sm:pr-36 py-4 rounded-full bg-neutral-100 dark:bg-white text-neutral-900 dark:text-neutral-900 placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-white/50 transition-all duration-200"
              />
              <button className="sm:absolute sm:right-1.5 sm:top-1/2 sm:-translate-y-1/2 px-6 py-3 sm:py-2.5 rounded-full bg-neutral-900 dark:bg-neutral-950 text-white dark:text-white font-medium hover:bg-neutral-800 dark:hover:bg-neutral-900 transition-all duration-200 whitespace-nowrap">
                Get Started
              </button>
            </motion.div>
          </div>

          <div className="hidden lg:flex flex-col justify-center items-center gap-4 h-[500px]">
            {slides.map((_, index) => (
              <div
                key={index}
                className="relative w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden cursor-pointer group"
                onClick={() => handleSlideClick(index)}
              >
                <div className="absolute inset-0 bg-neutral-300 dark:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {index === currentSlide && (
                  <motion.div
                    className="absolute top-0 left-0 w-full bg-neutral-900 dark:bg-white origin-top"
                    initial={{ height: "0%" }}
                    animate={{
                      height: `${
                        ((overallProgress - (index * 100) / slides.length) /
                          (100 / slides.length)) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                )}
                {index < currentSlide && (
                  <div className="absolute inset-0 bg-neutral-900 dark:bg-white" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8 }}
                className={`absolute inset-0 blur-[100px] ${slides[currentSlide].color} rounded-full opacity-20 dark:opacity-10`}
              />
            </AnimatePresence>

            <div className="relative w-full h-[280px] sm:h-[350px] lg:max-w-md lg:h-[500px] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-2xl">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={currentSlide}
                  src={slides[currentSlide].image}
                  initial={
                    isFirstRender.current
                      ? { opacity: 0, scale: 1.1, y: 0 }
                      : { opacity: 1, scale: 1, y: "100%" }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: "-100%" }}
                  transition={{
                    duration: 0.8,
                    ease: [0.2, 0.65, 0.3, 0.9],
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex lg:hidden justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className="relative w-16 h-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden cursor-pointer"
              onClick={() => handleSlideClick(index)}
            >
              {index === currentSlide && (
                <motion.div
                  className="absolute inset-0 bg-neutral-900 dark:bg-white origin-left"
                  style={{
                    scaleX:
                      (overallProgress - (index * 100) / slides.length) /
                      (100 / slides.length),
                  }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
              )}
              {index < currentSlide && (
                <div className="absolute inset-0 bg-neutral-900 dark:bg-white" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero6;
