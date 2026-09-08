"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "motion/react";

const statBalls = [
  {
    id: 1,
    stat: "99.9%",
    label: "Average uptime",
    x: "8%",
    y: "70%",
    mobileX: "5%",
    mobileY: "65%",
    size: "180px",
    mobileSize: "120px",
    intensity: 0.0075,
  },
  {
    id: 2,
    stat: "Deploy",
    label: "& ship faster",
    sublabel: "Straight to production",
    x: "10%",
    y: "25%",
    mobileX: "10%",
    mobileY: "15%",
    size: "220px",
    mobileSize: "140px",
    intensity: 0.01,
  },
  {
    id: 3,
    stat: "2.4s",
    label: "avg. build time",
    x: "75%",
    y: "15%",
    mobileX: "70%",
    mobileY: "12%",
    size: "200px",
    mobileSize: "130px",
    intensity: 0.00625,
  },
  {
    id: 4,
    stat: "500K+",
    label: "Deployments this month",
    x: "72%",
    y: "55%",
    mobileX: "65%",
    mobileY: "70%",
    size: "280px",
    mobileSize: "160px",
    intensity: 0.005,
  },
  {
    id: 5,
    stat: "Zero",
    label: "Deployment downtime",
    x: "80%",
    y: "30%",
    mobileX: "80%",
    mobileY: "35%",
    size: "160px",
    mobileSize: "110px",
    intensity: 0.00875,
  },
];

function StatBall({
  ball,
  smoothMouseX,
  smoothMouseY,
  index,
}: {
  ball: (typeof statBalls)[0];
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
  index: number;
}) {
  const parallaxX = useTransform(
    smoothMouseX,
    [-1, 1],
    [-20 * ball.intensity * 100, 20 * ball.intensity * 100],
  );
  const parallaxY = useTransform(
    smoothMouseY,
    [-1, 1],
    [-15 * ball.intensity * 100, 15 * ball.intensity * 100],
  );

  return (
    <motion.div
      className="absolute hidden sm:block"
      style={{
        left: ball.x,
        top: ball.y,
        x: parallaxX,
        y: parallaxY,
        width: ball.size,
        height: ball.size,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      <div className="w-full h-full rounded-full bg-purple-400 dark:bg-purple-500 flex flex-col items-center justify-center text-center p-6">
        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tighter text-neutral-900 dark:text-neutral-900 mb-1">
          {ball.stat}
        </span>
        <p className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-900 font-medium tracking-tight">
          {ball.label}
        </p>
        {ball.sublabel && (
          <p className="text-xs text-neutral-800 dark:text-neutral-800 mt-1">
            {ball.sublabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Stats6() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section
      className="relative w-full min-h-[var(--rb-section-min-h,100vh)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 pointer-events-none">
        {statBalls.map((ball, index) => (
          <StatBall
            key={ball.id}
            ball={ball}
            smoothMouseX={smoothMouseX}
            smoothMouseY={smoothMouseY}
            index={index}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <div className="text-center mb-28">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-black dark:text-white leading-tight mb-4"
          >
            Lightning-fast deployments
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base tracking-tight text-black dark:text-white"
          >
            Ship code to production in seconds, not hours. Deploy with
            confidence every time
          </motion.p>
        </div>

        <div className="relative flex items-center justify-center gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative -translate-y-8 sm:-translate-y-12 md:-translate-y-16"
          >
            <div className="w-40 sm:w-[200px] md:w-60 lg:w-[280px] aspect-9/16 rounded-3xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="w-40 sm:w-[200px] md:w-60 lg:w-[280px] aspect-9/16 rounded-3xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"></div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 sm:hidden grid grid-cols-2 gap-4"
        >
          {statBalls.map((ball, index) => (
            <motion.div
              key={ball.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="aspect-square rounded-full bg-purple-400 dark:bg-purple-500 p-6 flex flex-col items-center justify-center text-center"
            >
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-900 mb-1">
                {ball.stat}
              </span>
              <p className="text-xs text-neutral-900 dark:text-neutral-900 font-medium leading-tight">
                {ball.label}
              </p>
              {ball.sublabel && (
                <p className="text-xs text-neutral-800 dark:text-neutral-800 mt-1">
                  {ball.sublabel}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
