"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  parallaxX: number;
  parallaxY: number;
  parallaxStrength: number;
}

export function Hero5() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const isDarkMode = () => {
      return document.documentElement.classList.contains("dark");
    };

    const orbs: Orb[] = [];

    const darkColors = [
      "rgba(147, 51, 234, 0.5)",
      "rgba(59, 130, 246, 0.5)",
      "rgba(249, 115, 22, 0.4)",
      "rgba(168, 85, 247, 0.45)",
      "rgba(96, 165, 250, 0.45)",
    ];

    const lightColors = [
      "rgba(147, 51, 234, 0.35)",
      "rgba(59, 130, 246, 0.35)",
      "rgba(249, 115, 22, 0.25)",
      "rgba(168, 85, 247, 0.3)",
      "rgba(96, 165, 250, 0.3)",
    ];

    const orbPositions = [
      { x: 0.15, y: 0.15 }, // top-left
      { x: 0.5, y: 0.1 }, // top-center
      { x: 0.85, y: 0.15 }, // top-right
      { x: 0.08, y: 0.5 }, // middle-left
      { x: 0.92, y: 0.5 }, // middle-right
      { x: 0.15, y: 0.85 }, // bottom-left
      { x: 0.35, y: 0.75 }, // bottom-left-center
      { x: 0.5, y: 0.9 }, // bottom-center
      { x: 0.65, y: 0.75 }, // bottom-right-center
      { x: 0.85, y: 0.85 }, // bottom-right
      { x: 0.25, y: 0.4 }, // left-center
      { x: 0.75, y: 0.4 }, // right-center
    ];

    const isDark = isDarkMode();
    const colors = isDark ? darkColors : lightColors;

    for (let i = 0; i < orbPositions.length; i++) {
      const pos = orbPositions[i];
      orbs.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 150 + 200,
        color: colors[i % colors.length],
        opacity: Math.random() * 0.2 + 0.5,
        parallaxX: 0,
        parallaxY: 0,
        parallaxStrength: 0.02 + Math.random() * 0.03,
      });
    }

    const section = sectionRef.current;
    if (!section) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    section.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.filter = "blur(50px)";

      orbs.forEach((orb) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const mouseOffsetX =
          (mouseRef.current.x - centerX) * orb.parallaxStrength;
        const mouseOffsetY =
          (mouseRef.current.y - centerY) * orb.parallaxStrength;

        orb.parallaxX += (mouseOffsetX - orb.parallaxX) * 0.1;
        orb.parallaxY += (mouseOffsetY - orb.parallaxY) * 0.1;

        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius || orb.x > canvas.width + orb.radius) {
          orb.vx *= -1;
        }
        if (orb.y < -orb.radius || orb.y > canvas.height + orb.radius) {
          orb.vy *= -1;
        }

        const drawX = orb.x + orb.parallaxX;
        const drawY = orb.y + orb.parallaxY;

        const distFromCenterX = Math.abs(drawX - centerX) / centerX;
        const distFromCenterY = Math.abs(drawY - centerY) / centerY;
        const maxDist = Math.max(distFromCenterX, distFromCenterY);
        const edgeFade = Math.max(0, 1 - Math.pow(maxDist, 2) * 0.8);

        const colorMatch = orb.color.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/,
        );
        const r = colorMatch ? colorMatch[1] : "147";
        const g = colorMatch ? colorMatch[2] : "51";
        const b = colorMatch ? colorMatch[3] : "234";
        const baseAlpha =
          colorMatch && colorMatch[4] ? parseFloat(colorMatch[4]) : 0.5;
        const fadedAlpha = baseAlpha * edgeFade;

        const gradient = ctx.createRadialGradient(
          drawX,
          drawY,
          0,
          drawX,
          drawY,
          orb.radius,
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${fadedAlpha})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(drawX, drawY, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ctx.filter = "none";

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      if (section) {
        section.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0 bg-white dark:bg-[#0a0a0a]" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        style={{
          opacity: 0.8,
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative z-20 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28 lg:py-32">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="relative flex flex-col items-start sm:items-center justify-center text-left sm:text-center space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium">
                Cloud Infrastructure
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl font-medium text-neutral-900 dark:text-white leading-[1.1] tracking-tight max-w-5xl w-full"
            >
              Deploy Faster.{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                Scale Smarter.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="text-base sm:text-md text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl w-full"
            >
              Modern cloud infrastructure that scales with your business and
              deploys in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 w-full sm:w-auto"
            >
              <button className="cursor-pointer group px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-medium text-sm sm:text-base hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto shadow-sm">
                View Pricing
              </button>

              <button className="cursor-pointer group px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm sm:text-base hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
                Deploy Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto mt-12 sm:mt-16 md:mt-20"
            >
              <div className="relative p-px rounded-xl overflow-hidden">
                <div
                  className="absolute inset-0 rounded-xl opacity-70"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.5), rgba(249, 115, 22, 0.5), rgba(147, 51, 234, 0.5))",
                    backgroundSize: "300% 300%",
                    animation: "gradientShift 6s ease infinite",
                  }}
                />

                <div className="relative rounded-xl overflow-hidden bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-2xl border border-white/20 dark:border-white/10">
                  <div className="h-10 bg-white/50 dark:bg-neutral-800/50 border-b border-neutral-200/50 dark:border-neutral-700/50 flex items-center px-4 gap-2 backdrop-blur-md">
                    <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm" />
                    <div className="ml-4 flex-1 h-6 rounded-md bg-neutral-200/50 dark:bg-neutral-700/50 border border-neutral-200/50 dark:border-neutral-600/50" />
                  </div>

                  <div className="aspect-video w-full bg-white/50 dark:bg-black/50 p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://assets.justinmind.com/wp-content/uploads/2020/02/dashboard-design-example-hcare.png"
                      alt="Product mockup"
                      className="w-full h-full object-cover object-top rounded-lg border border-neutral-200/50 dark:border-neutral-800/50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  );
}

export default Hero5;
