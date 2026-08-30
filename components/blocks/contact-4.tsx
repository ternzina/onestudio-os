"use client";

import { motion } from "motion/react";
import { ArrowRight, Download } from "lucide-react";

export default function Contact4() {
  return (
    <section className="w-full bg-white py-12 dark:bg-neutral-950 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mb-16 w-full lg:w-[80%]"
        >
          <div className="relative h-[400px] overflow-hidden rounded-4xl">
            <img
              src="https://images.unsplash.com/photo-1432107294469-414527cb5c65?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="City skyline"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/30 via-blue-600/20 to-blue-400/30" />
          </div>

          <div className="absolute inset-6 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl sm:left-12 sm:top-12 sm:right-auto sm:bottom-auto sm:max-w-md sm:p-8 lg:p-10">
            <h2 className="mb-3 text-3xl font-normal tracking-tight leading-tight text-white sm:text-3xl lg:text-3xl">
              Crafting exceptional coffee
              <br />
              since 1987.
            </h2>
            <p className="mb-4 text-sm tracking-tight text-white/90 sm:text-md lg:text-lg">
              Every bean is carefully selected from sustainable farms and
              roasted in small batches to unlock unique flavor profiles.
            </p>
            <a
              href="#"
              className="inline-flex tracking-tight items-center gap-2 text-sm font-medium text-white underline decoration-white/50 underline-offset-4 transition-all hover:decoration-white sm:text-base lg:text-lg"
            >
              Browse our collection
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        <div className="mx-auto grid w-full gap-12 sm:grid-cols-2 lg:w-[70%] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
              Roastery & Café
            </p>
            <p className="text-base text-neutral-900 dark:text-neutral-100 sm:text-lg">
              842 Valencia Street, San Francisco, CA 94110
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
              Wholesale
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-base text-neutral-900 transition-colors hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-400 sm:text-lg"
            >
              Download catalog
              <Download className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="sm:col-span-2"
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
              Get in touch
            </p>
            <a
              href="mailto:hello@peakcoffee.co"
              className="inline-block border-b-2 border-neutral-900 text-base text-neutral-900 transition-colors hover:border-neutral-600 hover:text-neutral-600 dark:border-neutral-100 dark:text-neutral-100 dark:hover:border-neutral-400 dark:hover:text-neutral-400 sm:text-lg"
            >
              hello@peakcoffee.co
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
