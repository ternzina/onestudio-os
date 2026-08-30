"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Globe } from "lucide-react";

type TabKey =
  | "Documents & office"
  | "Photo & gifting"
  | "Marketing materials"
  | "Cards & stationery"
  | "Stickers & packaging"
  | "Clothing & bags";

const tabs: TabKey[] = [
  "Documents & office",
  "Photo & gifting",
  "Marketing materials",
  "Cards & stationery",
  "Stickers & packaging",
  "Clothing & bags",
];

const sets: Record<TabKey, { label: string; image: string }[]> = {
  "Documents & office": [
    {
      label: "Bound Documents",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
    },
    {
      label: "Business Cards",
      image:
        "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=900&q=80",
    },
    {
      label: "Envelopes",
      image:
        "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=900&q=80",
    },
    {
      label: "Infographics",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
    },
    {
      label: "Invoices",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80",
    },
    {
      label: "Letterheads",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
    },
    {
      label: "Mousepads",
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&q=80",
    },
    {
      label: "Notebooks",
      image:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=80",
    },
  ],
  "Photo & gifting": [
    {
      label: "Photo Books",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
    },
    {
      label: "Framed Prints",
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80",
    },
    {
      label: "Calendars",
      image:
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=900&q=80",
    },
    {
      label: "Posters",
      image:
        "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=900&q=80",
    },
    {
      label: "Mugs",
      image:
        "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=900&q=80",
    },
    {
      label: "Magnets",
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80",
    },
    {
      label: "Puzzles",
      image:
        "https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=900&q=80",
    },
    {
      label: "Ornaments",
      image:
        "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=900&q=80",
    },
  ],
  "Marketing materials": [
    {
      label: "Flyers",
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=80",
    },
    {
      label: "Brochures",
      image:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=80",
    },
    {
      label: "Posters",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
    },
    {
      label: "Banners",
      image:
        "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=900&q=80",
    },
    {
      label: "Yard Signs",
      image:
        "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=900&q=80",
    },
    {
      label: "Postcards",
      image:
        "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=900&q=80",
    },
    {
      label: "Stickers",
      image:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=80",
    },
    {
      label: "Table Tents",
      image:
        "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=900&q=80",
    },
  ],
  "Cards & stationery": [
    {
      label: "Greeting Cards",
      image:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=80",
    },
    {
      label: "Invitations",
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80",
    },
    {
      label: "Save the Dates",
      image:
        "https://images.unsplash.com/photo-1545231027-637d2f6210f8?w=900&q=80",
    },
    {
      label: "Thank You",
      image:
        "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=900&q=80",
    },
    {
      label: "Postcards",
      image:
        "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=900&q=80",
    },
    {
      label: "Envelopes",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
    },
    {
      label: "Notepads",
      image:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&q=80",
    },
    {
      label: "Labels",
      image:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=80",
    },
  ],
  "Stickers & packaging": [
    {
      label: "Die-Cut Stickers",
      image:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=80",
    },
    {
      label: "Sticker Sheets",
      image:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=80",
    },
    {
      label: "Boxes",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80",
    },
    {
      label: "Tape",
      image:
        "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?w=900&q=80",
    },
    {
      label: "Tissue Paper",
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80",
    },
    {
      label: "Mailers",
      image:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=80",
    },
    {
      label: "Wraps",
      image:
        "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=900&q=80",
    },
    {
      label: "Labels",
      image:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=900&q=80",
    },
  ],
  "Clothing & bags": [
    {
      label: "T-Shirts",
      image:
        "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=900&q=80",
    },
    {
      label: "Hoodies",
      image:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80",
    },
    {
      label: "Caps",
      image:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80",
    },
    {
      label: "Tote Bags",
      image:
        "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=900&q=80",
    },
    {
      label: "Beanies",
      image:
        "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=900&q=80",
    },
    {
      label: "Aprons",
      image:
        "https://images.unsplash.com/photo-1503602642458-232111445657?w=900&q=80",
    },
    {
      label: "Socks",
      image:
        "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=900&q=80",
    },
    {
      label: "Polos",
      image:
        "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=900&q=80",
    },
  ],
};

export default function Ecommerce7() {
  const [active, setActive] = useState<TabKey>(tabs[0]);

  return (
    <section className="w-full min-h-[var(--rb-section-min-h,100vh)] py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white tracking-tight"
            >
              Shop by category
            </motion.h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
              A full catalog of professionally-printed products, backed by our
              Happiness Guarantee and carbon-neutral shipping.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
            <Globe className="h-4 w-4" />
            Ships to 120+ countries
          </button>
        </div>

        <div className="mt-10 flex items-center gap-8 overflow-x-auto overflow-y-hidden border-b border-neutral-200 dark:border-neutral-800 relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`relative pb-3 whitespace-nowrap text-sm transition-colors cursor-pointer ${
                active === t
                  ? "text-neutral-900 dark:text-white font-medium"
                  : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {t}
              {active === t && (
                <motion.span
                  layoutId="ec7-tab"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-neutral-900 dark:bg-white"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {sets[active].map((c, i) => (
              <motion.a
                href="#"
                key={active + c.label}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.04 }}
                className="group flex flex-col gap-3"
              >
                <div className="aspect-4/3 rounded-xl bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  <img
                    src={c.image}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                  />
                </div>
                <p className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-white">
                  Shop {c.label}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
