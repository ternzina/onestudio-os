"use client";

import { motion } from "motion/react";

const articles = [
  {
    id: 1,
    title: "How AI is Transforming Modern Design Workflows",
    date: "Dec 15, 2024",
    category: "Technology",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Announcing Our Series B Funding Round",
    date: "Dec 10, 2024",
    category: "News",
    image:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Building Accessible User Interfaces in 2025",
    date: "Dec 05, 2024",
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "New Partnership with Leading Tech Companies",
    date: "Nov 28, 2024",
    category: "Partnership",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    title: "The Future of Remote Work and Collaboration",
    date: "Nov 20, 2024",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    title: "Introducing Our New Mobile App Features",
    date: "Nov 15, 2024",
    category: "Product",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
  },
];

function ArticleCard({
  title,
  date,
  category,
  image,
  delay = 0,
}: {
  title: string;
  date: string;
  category: string;
  image: string;
  delay?: number;
}) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group flex flex-col gap-3 cursor-pointer"
    >
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 px-3 py-1 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-medium rounded-full shadow-sm">
          {category}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white leading-snug line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        <span className="text-xs text-neutral-500 dark:text-neutral-500">
          {date}
        </span>
      </div>
    </motion.a>
  );
}

export function Blog1() {
  return (
    <section className="w-full pb-8 sm:pb-12 bg-white dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-0 bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-24 md:pb-28"
      >
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-neutral-900 dark:text-white">
              Blog
            </h1>

            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 lg:max-w-sm tracking-tight">
              Read our latest articles and insights on the latest trends and
              developments in the industry.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl sm:rounded-[2rem] pt-10 sm:pt-14 px-6 sm:px-10 pb-12 sm:pb-16 border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-medium text-neutral-900 dark:text-white mb-8 sm:mb-10"
            >
              Latest Articles
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {articles.map((article, idx) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  date={article.date}
                  category={article.category}
                  image={article.image}
                  delay={0.15 + idx * 0.05}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Blog1;
