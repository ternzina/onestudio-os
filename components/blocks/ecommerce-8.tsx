"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

const views = ["Front", "Detail", "Material", "In situ"];

const finishes = [
  { name: "Chalk", swatch: "bg-[#e8e3d8]" },
  { name: "Olive", swatch: "bg-[#6b705c]" },
  { name: "Graphite", swatch: "bg-[#3b3b3b]" },
];

const specs = [
  { label: "Height", value: "46 cm, counterweighted" },
  { label: "Shade", value: "Ø 30 cm, spun aluminum" },
  { label: "Light", value: "2,700–4,000 K, dimmable" },
  { label: "Cable", value: "2 m braided cotton" },
];

const assurances = [
  { icon: Truck, label: "Ships in 2 days" },
  { icon: RotateCcw, label: "60-day returns" },
  { icon: ShieldCheck, label: "5-year warranty" },
];

export default function Ecommerce8() {
  const [activeView, setActiveView] = useState(0);
  const [activeFinish, setActiveFinish] = useState("Chalk");
  const [quantity, setQuantity] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="w-full bg-white dark:bg-neutral-950 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-10 lg:gap-16 items-start"
      >
        <div className="space-y-4">
          <motion.div
            variants={fadeUp}
            className="relative aspect-[4/5] lg:aspect-[5/4] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900"
          >
            <AnimatePresence>
              <motion.img
                key={activeView}
                src="/svg/placeholder.svg"
                alt={`Arc Lamp 01 in ${activeFinish}, ${views[activeView].toLowerCase()} view`}
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <span className="absolute left-5 top-5 rounded-full bg-white/90 dark:bg-neutral-950/90 backdrop-blur px-3 py-1.5 text-[11px] font-medium tracking-wide text-neutral-700 dark:text-neutral-300">
              New finish: Olive
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid grid-cols-4 gap-3 sm:gap-4"
          >
            {views.map((view, index) => (
              <button
                key={view}
                onClick={() => setActiveView(index)}
                aria-label={`Show ${view} view`}
                aria-pressed={activeView === index}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
                  activeView === index
                    ? "border-neutral-900 dark:border-white"
                    : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <img
                  src="/svg/placeholder.svg"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2 bottom-2 rounded-full bg-white/90 dark:bg-neutral-950/90 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                  {view}
                </span>
              </button>
            ))}
          </motion.div>
        </div>

        <div className="lg:sticky lg:top-8">
          <motion.div variants={fadeUp}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-neutral-900 dark:text-white">
                Arc Lamp 01
              </h1>
              <p className="text-2xl font-semibold tracking-tight tabular-nums text-neutral-900 dark:text-white">
                $420
              </p>
            </div>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400 text-pretty">
              A counterweighted task lamp in powder-coated steel. The dimmer
              rolls from reading-bright to late-evening amber without a single
              click.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Finish
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {activeFinish}
              </p>
            </div>
            <div className="mt-3 flex gap-3">
              {finishes.map((finish) => (
                <button
                  key={finish.name}
                  onClick={() => setActiveFinish(finish.name)}
                  aria-label={`Finish ${finish.name}`}
                  aria-pressed={activeFinish === finish.name}
                  className="relative grid h-12 w-12 place-items-center rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
                >
                  {activeFinish === finish.name && (
                    <motion.span
                      layoutId="ecommerce8-finish"
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-0 rounded-full border-2 border-neutral-900 dark:border-white"
                    />
                  )}
                  <span
                    className={`h-8 w-8 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15 ${finish.swatch}`}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.dl
            variants={fadeUp}
            className="mt-8 border-t border-neutral-200 dark:border-neutral-800"
          >
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 py-3.5"
              >
                <dt className="text-sm text-neutral-500 dark:text-neutral-400">
                  {spec.label}
                </dt>
                <dd className="text-sm text-right text-neutral-900 dark:text-neutral-200">
                  {spec.value}
                </dd>
              </div>
            ))}
          </motion.dl>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <div className="flex h-14 w-full sm:w-auto shrink-0 items-center justify-between rounded-full border border-neutral-300 dark:border-neutral-700">
              <button
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
                className="grid h-full w-12 place-items-center rounded-l-full text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium tabular-nums text-neutral-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((value) => Math.min(9, value + 1))}
                aria-label="Increase quantity"
                className="grid h-full w-12 place-items-center rounded-r-full text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <motion.button
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="flex h-14 w-full min-w-0 flex-1 items-center justify-center gap-2.5 rounded-full bg-black dark:bg-white px-6 text-sm sm:text-base font-medium text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to bag ·{" "}
              <span className="tabular-nums">${420 * quantity}</span>
            </motion.button>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {assurances.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </li>
              );
            })}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  );
}
