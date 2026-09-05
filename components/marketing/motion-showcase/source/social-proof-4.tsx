"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

// Licensed source component from the premium library. The preview keeps the
// source block's composition and uses the destination's existing local assets.

export default function SocialProof4() {
  const reducedMotion = useReducedMotion() ?? false;
  const allTestimonials = [
    {
      quote:
        "My anxious rescue dog is finally calm and happy. The trainers understood her needs immediately and worked wonders.",
      name: "Rachel Thompson",
      title: "Dog Owner, Golden Retriever",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-01.webp",
    },
    {
      quote:
        "Best grooming experience ever! They treated my cat like royalty and she actually enjoyed it.",
      name: "Marcus Liu",
      title: "Cat Parent, Maine Coon",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-02.webp",
    },
    {
      quote:
        "The daycare gave me peace of mind while at work. My puppy comes home tired and happy every single day.",
      name: "Sophia Patel",
      title: "Pet Parent, Labrador",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-03.webp",
    },
    {
      quote:
        "They saved my dog's life with their emergency care. Forever grateful for their expertise and compassion.",
      name: "David Chen",
      title: "Owner, German Shepherd",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-04.webp",
    },
    {
      quote:
        "The boarding facility is like a five-star hotel for pets. My dog literally runs inside excited every time.",
      name: "Emma Rodriguez",
      title: "Corgi Mom",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-05.webp",
    },
    {
      quote:
        "Finally found a vet who takes time to explain everything and genuinely cares about my pets' wellbeing.",
      name: "Tyler Joseph",
      title: "Multi-Pet Household",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-06.webp",
    },
    {
      quote:
        "The nutrition plan they created transformed my senior dog's energy levels. He acts like a puppy again!",
      name: "Jennifer Walsh",
      title: "Beagle Owner, 12 years",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-07.webp",
    },
    {
      quote:
        "Mobile grooming is a game changer. My three dogs get pampered at home without the stress of travel.",
      name: "Alex Kim",
      title: "Poodle Parent x3",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-08.webp",
    },
    {
      quote:
        "The behavioral training helped with my dog's separation anxiety. I can finally leave home without guilt.",
      name: "Olivia Bennett",
      title: "Rescue Dog Owner",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-09.webp",
    },
    {
      quote:
        "They handled my exotic bird with such care and knowledge. Hard to find avian specialists this good.",
      name: "Nathan Foster",
      title: "Parrot Parent, Macaw",
      avatar:
        "/images/demos/premium-studio/bright/portfolio-10.webp",
    },
    {
      quote:
        "The puppy socialization classes built my dog's confidence. She's now friendly with everyone she meets.",
      name: "Isabella Santos",
      title: "First-time Dog Owner",
      avatar:
        "/images/demos/premium-studio/bright/scene-morning.webp",
    },
    {
      quote:
        "Their teeth cleaning service is thorough and gentle. My dog's dental health has never been better.",
      name: "Christopher Lee",
      title: "French Bulldog Dad",
      avatar:
        "/images/demos/premium-studio/bright/scene-noon.webp",
    },
  ];

  const testimonials = [
    allTestimonials.slice(0, 4),
    allTestimonials.slice(4, 8),
    allTestimonials.slice(8, 12),
  ];

  const marquee1Ref = useRef<HTMLDivElement>(null);
  const marquee2Ref = useRef<HTMLDivElement>(null);
  const marquee3Ref = useRef<HTMLDivElement>(null);
  const marqueeMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const marquee1 = marquee1Ref.current;
    const marquee2 = marquee2Ref.current;
    const marquee3 = marquee3Ref.current;
    const marqueeMobile = marqueeMobileRef.current;

    let offset1 = 0;
    let offset2 = 0;
    let offset3 = 0;
    let offsetMobile = 0;

    let animationId = 0;

    const animate = () => {
      if (marqueeMobile) {
        offsetMobile += 0.5;
        const heightMobile = marqueeMobile.scrollHeight / 2;
        if (offsetMobile >= heightMobile) {
          offsetMobile = 0;
        }
        marqueeMobile.style.transform = `translateY(-${offsetMobile}px)`;
      }

      if (marquee1) {
        offset1 += 0.5;
        const height1 = marquee1.scrollHeight / 2;
        if (offset1 >= height1) {
          offset1 = 0;
        }
        marquee1.style.transform = `translateY(-${offset1}px)`;
      }

      if (marquee2) {
        offset2 += 0.6;
        const height2 = marquee2.scrollHeight / 2;
        if (offset2 >= height2) {
          offset2 = 0;
        }
        marquee2.style.transform = `translateY(-${offset2}px)`;
      }

      if (marquee3) {
        offset3 += 0.4;
        const height3 = marquee3.scrollHeight / 2;
        if (offset3 >= height3) {
          offset3 = 0;
        }
        marquee3.style.transform = `translateY(-${offset3}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [reducedMotion]);

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 dark:bg-neutral-950 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end lg:mb-16">
          <motion.h2
            initial={reducedMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-medium leading-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:text-6xl"
          >
            More love from <br /> our fluffy community
          </motion.h2>

          <motion.a
            initial={reducedMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            href="#"
            className="group whitespace-nowrap inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Wall of love
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>

        <div className="relative sm:hidden">
          <div className="relative h-[600px] overflow-hidden">
            <div ref={marqueeMobileRef}>
              {[...allTestimonials, ...allTestimonials].map(
                (testimonial, index) => (
                  <div
                    key={`mobile-${index}`}
                    className="mb-4 rounded-2xl bg-white/60 p-1.5 shadow-sm backdrop-blur-md dark:bg-neutral-800/40"
                  >
                    <div className="rounded-[10px] border border-neutral-300/60 bg-white p-6 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900">
                      <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="h-10 w-10 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
                        />
                        <div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white via-white/90 to-transparent dark:from-neutral-950 dark:via-neutral-950/90" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-white via-white/90 to-transparent dark:from-neutral-950 dark:via-neutral-950/90" />
          </div>
        </div>

        <div className="relative hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative h-[600px] overflow-hidden">
            <div ref={marquee1Ref}>
              {[...testimonials[0], ...testimonials[0]].map(
                (testimonial, index) => (
                  <div
                    key={`col1-${index}`}
                    className="mb-4 rounded-2xl bg-white/60 p-1.5 shadow-sm backdrop-blur-md dark:bg-neutral-800/40"
                  >
                    <div className="rounded-[10px] border border-neutral-300/60 bg-white p-6 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900">
                      <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="h-10 w-10 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
                        />
                        <div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white to-transparent dark:from-neutral-950" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent dark:from-neutral-950" />
          </div>

          <div className="relative h-[600px] overflow-hidden">
            <div ref={marquee2Ref}>
              {[...testimonials[1], ...testimonials[1]].map(
                (testimonial, index) => (
                  <div
                    key={`col2-${index}`}
                    className="mb-4 rounded-2xl bg-white/60 p-1.5 shadow-sm backdrop-blur-md dark:bg-neutral-800/40"
                  >
                    <div className="rounded-[10px] border border-neutral-300/60 bg-white p-6 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900">
                      <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="h-10 w-10 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
                        />
                        <div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white to-transparent dark:from-neutral-950" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent dark:from-neutral-950" />
          </div>

          <div className="relative h-[600px] overflow-hidden">
            <div ref={marquee3Ref}>
              {[...testimonials[2], ...testimonials[2]].map(
                (testimonial, index) => (
                  <div
                    key={`col3-${index}`}
                    className="mb-4 rounded-2xl bg-white/60 p-1.5 shadow-sm backdrop-blur-md dark:bg-neutral-800/40"
                  >
                    <div className="rounded-[10px] border border-neutral-300/60 bg-white p-6 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900">
                      <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="h-10 w-10 rounded-lg border border-neutral-200 object-cover dark:border-neutral-700"
                        />
                        <div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {testimonial.name}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white to-transparent dark:from-neutral-950" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent dark:from-neutral-950" />
          </div>
        </div>
      </div>
    </section>
  );
}
