"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Menu, X } from "lucide-react";

interface DropdownItem {
  title: string;
  description: string;
  badge?: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: {
    title: string;
    items: DropdownItem[];
  };
}

export function Navigation7() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(
    null,
  );

  const navItems: NavItem[] = [
    {
      label: "Product",
      dropdown: {
        title: "PLATFORM OVERVIEW",
        items: [
          {
            title: "AI Analysis",
            description:
              "Automatic analysis to turn raw feedback to structured intelligence",
            href: "#ai-analysis",
          },
          {
            title: "AI Dashboards",
            description:
              "Visualize customer trends alongside key business metrics",
            badge: "BETA",
            href: "#ai-dashboards",
          },
          {
            title: "AI Chat and search",
            description:
              "Get instant answers and discover anything across customer data",
            href: "#ai-chat",
          },
          {
            title: "AI Docs",
            description:
              "Create shareable AI outputs to drive decisions and action",
            badge: "BETA",
            href: "#ai-docs",
          },
          {
            title: "API and integrations",
            description:
              "Connect your stack end-to-end: data in, intelligence out",
            href: "#api",
          },
          {
            title: "AI Agents",
            description:
              "Transform customer signals into intelligent, automated action",
            badge: "BETA",
            href: "#ai-agents",
          },
        ],
      },
    },
    {
      label: "Resources",
      dropdown: {
        title: "LEARN & EXPLORE",
        items: [
          {
            title: "Documentation",
            description: "Get started with guides and API references",
            href: "#docs",
          },
          {
            title: "Blog",
            description: "Latest insights and product updates",
            href: "#blog",
          },
          {
            title: "Case Studies",
            description: "Learn how teams succeed with our platform",
            href: "#case-studies",
          },
          {
            title: "Webinars",
            description: "Join live sessions and watch recordings",
            href: "#webinars",
          },
        ],
      },
    },
    {
      label: "Enterprise",
      dropdown: {
        title: "ENTERPRISE SOLUTIONS",
        items: [
          {
            title: "Enterprise Plan",
            description: "Advanced features and dedicated support",
            href: "#enterprise-plan",
          },
          {
            title: "Security",
            description: "Enterprise-grade security and compliance",
            href: "#security",
          },
          {
            title: "Custom Integration",
            description: "Tailored solutions for your organization",
            href: "#custom-integration",
          },
          {
            title: "White Glove Setup",
            description: "Dedicated onboarding and implementation",
            href: "#white-glove",
          },
        ],
      },
    },
    {
      label: "Customers",
      dropdown: {
        title: "SUCCESS STORIES",
        items: [
          {
            title: "Customer Stories",
            description: "See how organizations transform with AI",
            href: "#stories",
          },
          {
            title: "Wall of Love",
            description: "What our customers are saying",
            href: "#testimonials",
          },
          {
            title: "Community",
            description: "Connect with other users and experts",
            href: "#community",
          },
          {
            title: "Partner Network",
            description: "Find certified implementation partners",
            href: "#partners",
          },
        ],
      },
    },
  ];

  return (
    <>
      <nav className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="flex items-center justify-center aspect-square h-10 bg-neutral-200 dark:bg-neutral-900 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Home"
            >
              <div className="h-4 w-4 rounded-full bg-neutral-900 dark:bg-white" />
            </a>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className="flex items-center gap-1.5 px-4 h-10 bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded-md transition-colors text-sm tracking-tight font-medium text-neutral-900 dark:text-neutral-100"
                    aria-expanded={activeDropdown === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                  </button>

                  <AnimatePresence>
                    {activeDropdown === item.label && item.dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="absolute top-full left-0 pt-2 z-50"
                      >
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl py-2 min-w-[500px]">
                          <div className="text-xs font-medium text-neutral-400 dark:text-neutral-500 tracking-wider my-4 px-4">
                            {item.dropdown.title}
                          </div>
                          <div className="grid grid-cols-2 gap-3 px-2">
                            {item.dropdown.items.map((dropdownItem, idx) => (
                              <motion.a
                                key={idx}
                                href={dropdownItem.href}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: idx * 0.03,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                                className="group p-3 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                                    {dropdownItem.title}
                                  </h3>
                                  {dropdownItem.badge && (
                                    <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                      {dropdownItem.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                  {dropdownItem.description}
                                </p>
                              </motion.a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:block px-4 h-10 bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded-md text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 transition-colors">
              Log in
            </button>
            <button className="px-4 h-10 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-sm font-medium tracking-tight transition-colors">
              Try Free
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden px-4 h-10 bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded-md text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 transition-colors flex items-center gap-2"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white dark:bg-neutral-950 md:hidden"
          >
            <div className="flex items-center justify-between py-6 px-4">
              <div className="flex items-center justify-center aspect-square h-10 bg-neutral-200 dark:bg-neutral-900 rounded-md">
                <div className="h-4 w-4 rounded-full bg-neutral-900 dark:bg-white" />
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setMobileExpandedItem(null);
                }}
                className="flex items-center gap-2 px-4 h-10 bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded-md text-sm font-medium text-neutral-900 dark:text-neutral-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100vh-240px)] p-4 sm:p-6">
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <button
                      onClick={() =>
                        setMobileExpandedItem(
                          mobileExpandedItem === item.label ? null : item.label,
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md text-left transition-colors"
                    >
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {item.label}
                      </span>
                      <motion.div
                        animate={{
                          rotate: mobileExpandedItem === item.label ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {mobileExpandedItem === item.label && item.dropdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 pb-1 space-y-1">
                            {item.dropdown.items.map((dropdownItem, idx) => (
                              <motion.a
                                key={idx}
                                href={dropdownItem.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: idx * 0.03,
                                }}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileExpandedItem(null);
                                }}
                                className="block p-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {dropdownItem.title}
                                  </h3>
                                  {dropdownItem.badge && (
                                    <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                                      {dropdownItem.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                  {dropdownItem.description}
                                </p>
                              </motion.a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </nav>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 space-y-3 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800"
            >
              <button className="w-full px-4 py-3 bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 rounded-md text-sm font-medium text-neutral-900 dark:text-neutral-100 transition-colors">
                Log in
              </button>
              <button className="w-full px-4 py-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-md text-sm font-medium transition-colors">
                Try For Free
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navigation7;
