"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export type Footer3Props = { ctaLabel?: string; description?: string; copyright?: string };
export default function Footer3({ ctaLabel = "SCHEDULE A SECURITY ASSESSMENT FOR YOUR BUSINESS", description = "CyberGuard provides enterprise-grade cybersecurity solutions that protect your infrastructure from emerging threats, reliably.", copyright = "© 2024 CyberGuard Security. All rights reserved." }: Footer3Props = {}) {
  const [isHovered, setIsHovered] = useState(false);

  const footerLinks = [
    {
      title: "Services & Solutions",
      links: [
        { text: "Penetration Testing", href: "#" },
        { text: "Security Audits", href: "#" },
        { text: "Threat Intelligence", href: "#" },
        { text: "Incident Response", href: "#" },
        { text: "Compliance Services", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About Us", href: "#" },
        { text: "Careers", href: "#" },
        { text: "Contact", href: "#" },
        { text: "Book a Meeting", href: "#" },
        { text: "FAQ", href: "#" },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <footer className="w-full bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.button
          variants={itemVariants}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group cursor-pointer relative w-full overflow-hidden border-y border-neutral-200 py-12 text-left transition-colors dark:border-neutral-800"
          style={{
            backgroundColor: isHovered ? "#FF9FFC" : "transparent",
          }}
        >
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between">
            <h2 className="text-md tracking-tight sm:text-2xl font-medium text-neutral-900 transition-colors group-hover:text-black dark:text-white dark:group-hover:text-black">
              {ctaLabel}
            </h2>
            <ArrowRight className="h-8 w-8 shrink-0 text-neutral-900 transition-colors group-hover:text-black dark:text-white dark:group-hover:text-black" />
          </div>
        </motion.button>

        <div className="mx-auto w-full max-w-[1400px] py-12 sm:py-16 lg:py-20">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:gap-16"
          >
            <div>
              <p className="max-w-md text-base text-neutral-600 dark:text-neutral-400 sm:text-lg">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              {footerLinks.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 text-sm font-bold text-neutral-900 dark:text-white sm:mb-6 sm:text-base">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.text}>
                        <a
                          href={link.href}
                          className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:text-base"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="w-full border-t border-neutral-200 dark:border-neutral-800"
        />

        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <motion.p
            variants={itemVariants}
            className="text-right text-xs text-neutral-600 dark:text-neutral-400 sm:text-sm"
          >
            {copyright}
          </motion.p>
        </div>
      </motion.div>
    </footer>
  );
}
