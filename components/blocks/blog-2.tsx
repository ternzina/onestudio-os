"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "7 best expense management software in December 2025",
    excerpt:
      "Expense management software helps streamline your finance operations. See our picks for today's best options...",
    date: "Dec 12",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop",
  },
  {
    id: 2,
    title: "The 7 best productivity alternatives in December 2025",
    excerpt:
      "Finding the right productivity tool is essential for modern teams. If you're looking for an alternative, see our...",
    date: "Dec 12",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop",
  },
  {
    id: 3,
    title:
      "What is a business card? How it works, key benefits, and best options for small businesses",
    excerpt:
      "A business card requires full monthly payment and has no preset limit. Learn how they work, key pros and cons,...",
    date: "Dec 12",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=150&fit=crop",
  },
  {
    id: 4,
    title:
      "The best instant or pre-approved business credit cards in December 2025",
    excerpt:
      "Discover the top instant or pre-approved business credit cards. Get the best options for business credit card...",
    date: "Dec 12",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=200&h=150&fit=crop",
  },
  {
    id: 5,
    title: "Economic order quantity (EOQ): Definition, formula, and examples",
    excerpt:
      "Economic order quantity (EOQ) is the optimal order quantity to minimize your total inventory costs. Learn how to...",
    date: "Dec 12",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop",
  },
];

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 sm:mt-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((page, idx) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 dark:text-neutral-500"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              currentPage === page
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Blog2() {
  const [[currentPage, direction], setPage] = useState([1, 0]);
  const totalPages = 20;

  const paginate = (newPage: number) => {
    setPage([newPage, newPage > currentPage ? 1 : -1]);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <section
      className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950"
      aria-label="Blog articles"
    >
      <div className="max-w-[900px] mx-auto w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 dark:text-white mb-10 sm:mb-14"
        >
          Recently published
        </motion.h1>

        <div className="border-t border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {articles.map((article, idx) => (
                <motion.a
                  key={`${currentPage}-${article.id}`}
                  href="#"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.05,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="group flex gap-4 sm:gap-6 py-5 border-b border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 -mx-4 px-4 transition-colors"
                >
                  <div className="flex-shrink-0 w-24 sm:w-32 md:w-40 aspect-[4/3] rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white leading-snug line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 hidden sm:block">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center">
                    <span className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                      {article.date}
                    </span>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      </div>
    </section>
  );
}

export default Blog2;
