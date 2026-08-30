"use client";

import { Box, Layers, Zap, Globe } from "lucide-react";

export function Footer5() {
  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col items-center">
        <div
          className="relative w-full rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden"
          style={{ backgroundColor: "#5227FF" }}
        >
          <div className="absolute inset-0 flex flex-row items-end justify-center pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => {
              const distFromCenter = Math.abs(i - 4);
              const height = Math.max(20, 90 - distFromCenter * 15);
              const opacity = Math.max(0.1, 1.0 - distFromCenter * 0.2);

              return (
                <div
                  key={i}
                  className="flex-1 relative"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, rgba(0,0,0,${opacity * 0.3}) 0%, rgba(0,0,0,0) 100%)`,
                  }}
                />
              );
            })}
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
            <div className="flex flex-col space-y-6 sm:space-y-8">
              <div className="flex items-center gap-2">
                <img
                  src="/mock-logos/featherdev.svg"
                  alt="FeatherDev"
                  className="h-10 w-auto invert"
                />
              </div>

              <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-sm font-medium">
                FeatherDev is a React component library that provides a set of
                pre-built UI components for building modern web applications.
                Trusted by over 10,000 companies worldwide.
              </p>

              <div className="flex items-center gap-4">
                {[Box, Layers, Zap, Globe].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
                    aria-label="Social link"
                  >
                    <Icon className="w-5 h-5 fill-current" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-medium tracking-tight text-white/90">
                  Product
                </h3>
                <ul className="space-y-3">
                  {[
                    "Features",
                    "Integrations",
                    "Pricing",
                    "Updates",
                    "Roadmap",
                    "Enterprise",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-white/90 hover:text-neutral-900 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-medium tracking-tight text-white/90">
                  Company
                </h3>
                <ul className="space-y-3">
                  {[
                    "About Us",
                    "Careers",
                    "Contact",
                    "Press Kit",
                    "Partners",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-white/90 hover:text-neutral-900 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-medium tracking-tight text-white/90">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {[
                    "Documentation",
                    "API Reference",
                    "Help Center",
                    "Blog",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-white/90 hover:text-neutral-900 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center text-sm sm:text-base text-neutral-500 dark:text-neutral-500 font-medium">
          © 2025 FeatherDev. All rights reserved.
        </div>
      </div>
    </section>
  );
}

export default Footer5;
