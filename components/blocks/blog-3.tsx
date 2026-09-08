"use client";

import { useState } from "react";
import { motion } from "motion/react";

const categories = ["All Posts", "Product", "Engineering", "Company"];

const articles = [
  {
    id: 1,
    title: "Introducing our new AI-powered features",
    excerpt:
      "We're excited to announce a suite of new AI features designed to boost your productivity and streamline your workflow.",
    category: "Product",
    date: "Dec 17, 2024",
  },
  {
    id: 2,
    title: "Series B funding announcement",
    excerpt:
      "We've raised $50M to accelerate our mission of building the future of developer tools.",
    category: "Company",
    date: "Dec 10, 2024",
  },
  {
    id: 3,
    title: "Building scalable systems with modern architecture",
    excerpt:
      "A deep dive into how we rebuilt our infrastructure to handle 10x more traffic.",
    category: "Engineering",
    date: "Dec 5, 2024",
  },
  {
    id: 4,
    title: "New dashboard experience now available",
    excerpt:
      "Announcing the redesigned dashboard with improved navigation and faster load times.",
    category: "Product",
    date: "Nov 28, 2024",
  },
  {
    id: 5,
    title: "Year in review: What we accomplished in 2024",
    excerpt:
      "Looking back at our biggest milestones and what's ahead for the new year.",
    category: "Company",
    date: "Nov 20, 2024",
  },
];

export function Blog3() {
  const [activeCategory, setActiveCategory] = useState("All Posts");

  const filteredArticles =
    activeCategory === "All Posts"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <section
      className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950"
      aria-label="Blog"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-neutral-900 dark:text-white mb-12 sm:mb-16"
        >
          Blog
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:w-40 flex-shrink-0"
          >
            <nav className="flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap text-sm font-medium px-3 py-1.5 lg:px-0 lg:py-1 rounded-full lg:rounded-none text-left transition-colors cursor-pointer ${
                    activeCategory === category
                      ? "bg-neutral-900 text-white lg:bg-transparent lg:text-neutral-900 dark:lg:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </motion.aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4">
              {filteredArticles.map((article, idx) => (
                <motion.a
                  key={article.id}
                  href="#"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                  className="group block p-5 sm:p-6 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <h2 className="text-lg sm:text-xl font-medium text-neutral-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 dark:text-neutral-500">
                    <span>{article.category}</span>
                    <span>·</span>
                    <span>{article.date}</span>
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mt-8 sm:mt-10"
            >
              <button className="group flex items-center gap-3 p-4 sm:p-5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    ← Previous
                  </span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    Newer posts
                  </span>
                </div>
              </button>

              <button className="group flex items-center justify-end gap-3 p-4 sm:p-5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    Next →
                  </span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    Older posts
                  </span>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Blog3;
