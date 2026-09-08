"use client";

import { motion } from "motion/react";

export type Testimonial = { quote: string; name: string; title: string; avatar: string };
export type SocialProof3Props = { heading?: string; mainTestimonial?: Testimonial; testimonials?: Testimonial[] };
const defaultMainTestimonial: Testimonial = {
    quote:
      "The personalized itinerary was flawless. Every detail exceeded our expectations.",
    name: "Victoria Chen",
    title: "CEO, Tech Ventures",
    avatar:
      "https://images.unsplash.com/photo-1600481453173-55f6a844a4ea?q=80&w=750&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

const defaultTestimonials: Testimonial[] = [
    {
      quote: "Three weeks exploring hidden gems across Southeast Asia.",
      name: "Marcus Rodriguez",
      title: "Investment Banker",
      avatar:
        "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: "The yacht charter in the Mediterranean was impeccable.",
      name: "Sarah Al-Rashid",
      title: "Entrepreneur",
      avatar:
        "https://images.unsplash.com/photo-1561406636-b80293969660?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: "From Maldives to Santorini, each spot was thoughtfully selected.",
      name: "James Thornton",
      title: "Creative Director",
      avatar:
        "https://images.unsplash.com/photo-1675108278067-41ebf3e5edcd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
];

export default function SocialProof3({ heading = "Hear it from our customers.", mainTestimonial = defaultMainTestimonial, testimonials = defaultTestimonials }: SocialProof3Props = {}) {

  return (
    <section className="relative w-full min-h-[var(--rb-section-min-h,100vh)] overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 60% 20%, rgba(160, 90, 255, 1), transparent 65%),
            radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255, 80, 160, 1), transparent 65%),
            radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255, 180, 50, 1), transparent 62%),
            radial-gradient(ellipse 65% 40% at 50% 60%, rgba(100, 170, 255, 1), transparent 68%),
            linear-gradient(180deg, #d4b0ff 0%, #ffb0d0 100%)
          `,
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center text-2xl font-normal text-white sm:text-3xl lg:mb-16 lg:text-4xl"
        >
          {heading}
        </motion.h2>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-between rounded-3xl border border-white/30 bg-neutral-300/30 p-6 backdrop-blur-md sm:p-8 lg:col-span-3 lg:p-12"
          >
            <blockquote className="mb-6 text-sm leading-relaxed text-white/90 sm:text-base lg:mb-8 lg:text-center lg:text-4xl lg:font-medium lg:text-white lg:leading-relaxed">
              &ldquo;{mainTestimonial.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 lg:justify-center lg:gap-4">
              <img
                src={mainTestimonial.avatar}
                alt={mainTestimonial.name}
                className="h-10 w-10 rounded-full border-2 border-white/30 object-cover lg:h-12 lg:w-12"
              />
              <div>
                <div className="text-sm font-semibold text-white sm:text-base lg:text-lg">
                  {mainTestimonial.name}
                </div>
                <div className="text-sm uppercase tracking-tight text-white/80">
                  {mainTestimonial.title}
                </div>
              </div>
            </div>
          </motion.div>

          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col justify-between rounded-3xl border border-white/30 bg-neutral-300/30 p-6 backdrop-blur-md sm:p-8"
            >
              <blockquote className="mb-6 text-sm leading-relaxed text-white/90 sm:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full border-2 border-white/30 object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs uppercase tracking-tight text-white/80">
                    {testimonial.title}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
