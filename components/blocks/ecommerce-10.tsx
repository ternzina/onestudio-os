"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Plus, ShoppingBag } from "lucide-react";

type Piece = { name: string; detail: string; price: number };

type Look = { title: string; description: string; pieces: Piece[] };

const looks: Look[] = [
  {
    title: "First frost",
    description:
      "Long wool over soft rib for the first properly cold morning of the season.",
    pieces: [
      { name: "Wool Wrap Coat", detail: "Double-faced, unlined", price: 340 },
      { name: "Rib Knit Crew", detail: "Extra-fine merino", price: 148 },
      { name: "Felt Carry Tote", detail: "Pressed wool felt", price: 96 },
    ],
  },
  {
    title: "Museum hours",
    description:
      "Pressed cotton and suede for a slow Saturday spent mostly indoors.",
    pieces: [
      { name: "Box-Cut Shirt", detail: "Compact poplin", price: 120 },
      { name: "Cropped Bomber", detail: "Brushed twill", price: 260 },
      { name: "Suede Low Sneaker", detail: "Tonal rubber sole", price: 170 },
    ],
  },
  {
    title: "Last train",
    description:
      "A storm shell over tailored jersey for the ride home after close.",
    pieces: [
      {
        name: "Storm Shell Parka",
        detail: "Three-layer, taped seams",
        price: 310,
      },
      {
        name: "Tailored Jersey Pant",
        detail: "Ponte knit, pressed crease",
        price: 135,
      },
      { name: "Roll Beanie", detail: "Ribbed lambswool", price: 40 },
    ],
  },
];

export default function Ecommerce10() {
  const [activeLook, setActiveLook] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const look = looks[activeLook];
  const lookTotal = look.pieces.reduce(
    (total, piece) => total + piece.price,
    0,
  );

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full bg-white dark:bg-neutral-950 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-[1.1fr_minmax(0,420px)] gap-6 lg:gap-12 items-end"
        >
          <motion.div variants={fadeUp}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-neutral-900 dark:text-white text-balance">
              Three ways through a cold week
            </h2>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 text-pretty"
          >
            Each look is built from three pieces that carry their weight alone,
            then photographed the way they actually get worn.
          </motion.p>
        </motion.div>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-10 lg:gap-16 items-start">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:sticky lg:top-8 border-t border-neutral-200 dark:border-neutral-800"
          >
            {looks.map((entry, index) => {
              const total = entry.pieces.reduce(
                (sum, piece) => sum + piece.price,
                0,
              );
              const active = activeLook === index;

              return (
                <motion.button
                  key={entry.title}
                  variants={fadeUp}
                  onClick={() => setActiveLook(index)}
                  aria-pressed={active}
                  className="group relative block w-full border-b border-neutral-200 dark:border-neutral-800 py-5 pl-6 pr-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                >
                  {active && (
                    <motion.span
                      layoutId="ecommerce10-look"
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-neutral-900 dark:bg-white"
                    />
                  )}
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500">
                        0{index + 1}
                      </span>
                      <span
                        className={`truncate text-lg font-medium transition-colors duration-200 ${
                          active
                            ? "text-neutral-900 dark:text-white"
                            : "text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400"
                        }`}
                      >
                        {entry.title}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
                      ${total}
                    </span>
                  </span>
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.span
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.35,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="block overflow-hidden"
                      >
                        <span className="block pt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                          {entry.description}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeLook}
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              exit={{
                opacity: 0,
                transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
              }}
              className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-start"
            >
              <motion.div
                variants={fadeUp}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900"
              >
                <img
                  src="/svg/placeholder.svg"
                  alt={`${look.title} look, worn in full`}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute left-5 top-5 rounded-full bg-white/90 dark:bg-neutral-950/90 backdrop-blur px-3 py-1.5 text-[11px] font-medium tracking-wide text-neutral-700 dark:text-neutral-300">
                  Look 0{activeLook + 1}: {look.title}
                </span>
              </motion.div>

              <div className="flex flex-col">
                {look.pieces.map((piece) => (
                  <motion.div
                    key={piece.name}
                    variants={fadeUp}
                    className="flex items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 py-4 first:pt-0"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
                      <img
                        src="/svg/placeholder.svg"
                        alt={piece.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {piece.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {piece.detail}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums text-neutral-900 dark:text-white">
                      ${piece.price}
                    </p>
                    <button
                      aria-label={`Add ${piece.name} to bag`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}

                <motion.div
                  variants={fadeUp}
                  className="mt-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Complete look
                    </p>
                    <p className="text-lg font-semibold tracking-tight tabular-nums text-neutral-900 dark:text-white">
                      ${lookTotal}
                    </p>
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-6 py-3.5 text-sm font-medium text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950">
                    <ShoppingBag className="h-4 w-4" />
                    Add all three pieces
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
