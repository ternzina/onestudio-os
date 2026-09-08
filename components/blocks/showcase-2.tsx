"use client";

import { motion, useMotionValue, useAnimationFrame } from "motion/react";
import { useRef, useState, useEffect } from "react";

const SHOWCASE_ITEMS = [
  {
    id: 1,
    image:
      "https://cdn.dribbble.com/userupload/46030284/file/8dfdc9a8b09fdbd99b010c1dcb279841.jpg?resize=1024x1693&vertical=center",
    height: "h-[400px]",
    bgColor: "bg-rose-200 dark:bg-rose-900/30",
  },
  {
    id: 2,
    image:
      "https://cdn.dribbble.com/userupload/46029941/file/f3b0e906d38980bf48e008f5542a58b5.jpg?resize=1024x1693&vertical=center",
    height: "h-[450px]",
    bgColor: "bg-lime-200 dark:bg-lime-900/30",
  },
  {
    id: 3,
    image:
      "https://cdn.dribbble.com/userupload/45777759/file/acf14657b38cd25e64bb16b4f201bef8.jpg?resize=1024x1529&vertical=center",
    height: "h-[420px]",
    bgColor: "bg-blue-200 dark:bg-blue-900/30",
  },
  {
    id: 4,
    image:
      "https://cdn.dribbble.com/userupload/46068721/file/3910087a60fe6f781ddae7c14daf1804.jpg?resize=1024x1589&vertical=center",
    height: "h-[380px]",
    bgColor: "bg-neutral-200 dark:bg-neutral-800",
  },
];

export function Showcase2() {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [oneSetWidth, setOneSetWidth] = useState(0);

  const baseVelocity = -20;
  const baseX = useMotionValue(0);
  const scrollVelocity = useRef(baseVelocity);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const items = [
    ...SHOWCASE_ITEMS,
    ...SHOWCASE_ITEMS,
    ...SHOWCASE_ITEMS,
    ...SHOWCASE_ITEMS,
    ...SHOWCASE_ITEMS,
    ...SHOWCASE_ITEMS,
  ];

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      const itemWidth = isMobile ? 280 : 320;
      const gap = 24;
      const width = (itemWidth + gap) * SHOWCASE_ITEMS.length;
      setOneSetWidth(width);

      baseX.set(-width);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [baseX]);

  useAnimationFrame((t, delta) => {
    if (!oneSetWidth) return;

    if (!isDragging) {
      scrollVelocity.current =
        scrollVelocity.current * 0.9 + baseVelocity * 0.1;

      const moveBy = scrollVelocity.current * (delta / 1000);
      baseX.set(baseX.get() + moveBy);

      const x = baseX.get();
      if (x <= -oneSetWidth * 2) {
        baseX.set(x + oneSetWidth);
      } else if (x > 0) {
        baseX.set(x - oneSetWidth);
      }
    }
  });

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-xl">
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4">
              Featured Work
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-8 sm:mb-10">
              Crafting digital experiences that inspire and engage.
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium text-sm sm:text-base hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-200"
            >
              View Projects
            </motion.button>
          </div>
        </motion.div>

        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden py-20">
          <motion.div
            ref={scrollerRef}
            className="flex items-end gap-6 cursor-grab active:cursor-grabbing"
            style={{ x: baseX }}
            drag="x"
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
              setIsDragging(false);
              scrollVelocity.current = info.velocity.x;
            }}
            dragElastic={0.05}
            dragMomentum={false}
          >
            {items.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                className={`shrink-0 w-[280px] sm:w-[320px] ${item.height} rounded-2xl overflow-hidden select-none relative pointer-events-auto`}
                initial={{ rotateX: 0, opacity: 1 }}
                animate={
                  hoveredId === index
                    ? {
                        scale: 1.05,
                        rotateX: -15,
                        y: -25,
                        zIndex: 50,
                      }
                    : {
                        scale: 1,
                        rotateX: 0,
                        y: 0,
                        zIndex: 1,
                      }
                }
                transition={{
                  duration: 0.3,
                  ease: "backOut",
                  zIndex: { delay: hoveredId === index ? 0 : 0.4 },
                }}
                onMouseEnter={() => setHoveredId(index)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ transformPerspective: 1000 }}
              >
                <div className={`w-full h-full ${item.bgColor}`}>
                  <img
                    src={item.image}
                    alt="Showcase item"
                    className="w-full h-full object-cover object-top pointer-events-none"
                    draggable="false"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Showcase2;
