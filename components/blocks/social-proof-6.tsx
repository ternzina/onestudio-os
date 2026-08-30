"use client";

import { motion } from "motion/react";
import { useState } from "react";

type Category = "all" | "companies" | "agencies" | "studios";

interface Logo {
  name: string;
  category: Category[];
  logo: string;
}

export default function SocialProof6() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: "All" },
    { id: "companies", label: "Startups" },
    { id: "agencies", label: "Enterprise" },
    { id: "studios", label: "Scale-ups" },
  ];

  const logos: Logo[] = [
    {
      name: "Acme Corp",
      category: ["companies"],
      logo: "/mock-logos/acmecorp.svg",
    },
    {
      name: "Cloudwatch",
      category: ["agencies"],
      logo: "/mock-logos/cloudwatch.svg",
    },
    {
      name: "Epicurious",
      category: ["studios"],
      logo: "/mock-logos/epicurious.svg",
    },
    {
      name: "Galileo",
      category: ["companies"],
      logo: "/mock-logos/galileo.svg",
    },
    {
      name: "Global Bank",
      category: ["agencies"],
      logo: "/mock-logos/globalbank.svg",
    },
    {
      name: "Sisyphus",
      category: ["studios"],
      logo: "/mock-logos/sisyphus.svg",
    },
    {
      name: "Interlock",
      category: ["agencies"],
      logo: "/mock-logos/interlock.svg",
    },
    { name: "Layers", category: ["companies"], logo: "/mock-logos/layers.svg" },
    {
      name: "Lightbox",
      category: ["companies"],
      logo: "/mock-logos/lightbox.svg",
    },
    {
      name: "Nietzsche",
      category: ["agencies"],
      logo: "/mock-logos/nietzsche.svg",
    },
    {
      name: "Polymath",
      category: ["studios"],
      logo: "/mock-logos/polymath.svg",
    },
    {
      name: "Quotient",
      category: ["companies"],
      logo: "/mock-logos/quotient.svg",
    },
    {
      name: "Boltshift",
      category: ["companies"],
      logo: "/mock-logos/boltshift.svg",
    },
    {
      name: "Capsule",
      category: ["agencies"],
      logo: "/mock-logos/capsule.svg",
    },
    {
      name: "Catalog",
      category: ["studios"],
      logo: "/mock-logos/catalog.svg",
    },
    {
      name: "Commandr",
      category: ["companies"],
      logo: "/mock-logos/commandr.svg",
    },
  ];

  const isLogoVisible = (logo: Logo) => {
    if (activeCategory === "all") return true;
    return logo.category.includes(activeCategory);
  };

  return (
    <section className="w-full bg-white py-16 dark:bg-neutral-950 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center text-4xl font-medium leading-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:mb-16 lg:text-6xl tracking-tight"
        >
          Powering over 15,000 teams
          <br />
          building the future.
        </motion.h2>

        <div className="mb-12 hidden justify-center sm:flex lg:mb-16">
          <div className="relative inline-flex gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-900">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="relative px-6 py-2.5 text-sm font-medium transition-colors duration-200 sm:px-8 sm:py-3 sm:text-base"
              >
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-neutral-800"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    activeCategory === category.id
                      ? "text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  }`}
                >
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-2 sm:hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? "bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-12">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isLogoVisible(logo) ? 1 : 0.3,
                y: 0,
              }}
              transition={{
                opacity: { duration: 0.3 },
                y: { duration: 0.4, delay: index * 0.05 },
              }}
              className="flex items-center justify-center"
            >
              <img
                src={logo.logo}
                alt={`${logo.name} logo`}
                className="h-8 w-auto max-w-full object-contain brightness-0 transition-all duration-300 dark:invert sm:h-10"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
