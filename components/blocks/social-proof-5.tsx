"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function SocialProof5() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote:
        "They transformed our dated 1970s kitchen into a modern masterpiece. The attention to detail and quality exceeded all our expectations.",
      name: "Jennifer Walsh",
      title: "Homeowner @ Pacific Heights",
      avatar:
        "https://images.unsplash.com/photo-1600481453173-55f6a844a4ea?q=80&w=750&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      color: "#fde047",
    },
    {
      quote:
        "From concept to completion, the entire renovation process was seamless. Our home value increased by 40% and we couldn't be happier with the results.",
      name: "Michael Torres",
      title: "Property Owner @ Riverside Estate",
      avatar:
        "https://images.unsplash.com/photo-1530466015235-1d47696ea847?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      color: "#d8b4fe",
    },
    {
      quote:
        "The design team brought our vision to life while staying within budget. Every room now feels luxurious yet functional for our growing family.",
      name: "Amanda Chen",
      title: "Homeowner @ Willow Creek",
      avatar:
        "https://images.unsplash.com/photo-1705408115324-6bd2cbfa4d93?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      color: "#67e8f9",
    },
    {
      quote:
        "Outstanding craftsmanship and project management. They finished our whole-house renovation two weeks ahead of schedule with zero compromises on quality.",
      name: "David Patterson",
      title: "Homeowner @ Heritage Hills",
      avatar:
        "https://images.unsplash.com/photo-1564172556663-2bef9580fc44?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      color: "#5eead4",
    },
  ];

  const companies = [
    { name: "Commandr", logo: "/mock-logos/commandr.svg" },
    { name: "Interlock", logo: "/mock-logos/interlock.svg" },
    { name: "Focalpoint", logo: "/mock-logos/focalpoint.svg" },
    { name: "Polymath", logo: "/mock-logos/polymath.svg" },
    { name: "Altshift", logo: "/mock-logos/altshift.svg" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="w-full bg-white py-8 dark:bg-neutral-950 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-4xl font-medium leading-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:mb-20 lg:text-6xl"
        >
          Trusted by homeowners
          <br />
          across the country
        </motion.h2>

        <div className="mb-16 grid gap-8 lg:mb-20 lg:grid-cols-2 lg:gap-12">
          <div className="flex items-center justify-start gap-4 lg:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: activeIndex === index ? 1.1 : 0.9,
                  opacity: activeIndex === index ? 1 : 0.6,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative"
              >
                <div
                  className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full transition-colors duration-500 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
                  style={{
                    backgroundColor:
                      activeIndex === index ? testimonial.color : undefined,
                  }}
                >
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-8 w-8 rounded-full object-cover sm:h-12 sm:w-12 lg:h-16 lg:w-16 grayscale"
                  />
                </div>

                {activeIndex === index && (
                  <svg
                    className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      fill="none"
                      stroke={testimonial.color}
                      strokeWidth="1.5"
                      opacity="0.2"
                    />
                    <motion.circle
                      key={`progress-${activeIndex}`}
                      cx="50"
                      cy="50"
                      r="48"
                      fill="none"
                      stroke={testimonial.color}
                      strokeWidth="1.5"
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 10, ease: "linear" }}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <blockquote className="mb-6 text-xl leading-relaxed text-neutral-700 dark:text-neutral-300">
                  &ldquo;{testimonials[activeIndex].quote}&rdquo;
                </blockquote>
                <div className="text-base font-medium text-neutral-900 dark:text-neutral-100 sm:text-lg">
                  {testimonials[activeIndex].name},{" "}
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {testimonials[activeIndex].title}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 lg:gap-8">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center"
            >
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-8 w-auto object-contain brightness-0 opacity-60 transition-all duration-300 hover:opacity-100 dark:invert dark:opacity-40 dark:hover:opacity-80 sm:h-10"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
