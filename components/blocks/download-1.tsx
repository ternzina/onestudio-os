"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, ChevronDown, ArrowRight, Apple } from "lucide-react";

const versions = [
  {
    version: "2.4",
    isLatest: true,
    releaseDate: "December 2024",
    macOS: [
      { name: "Mac (ARM64)", id: "mac-arm64" },
      { name: "Mac (x64)", id: "mac-x64" },
    ],
    windows: [
      { name: "Windows (x64)", id: "win-x64" },
      { name: "Windows (ARM64)", id: "win-arm64" },
    ],
    linux: [
      { name: "Linux .deb (x64)", id: "linux-deb-x64" },
      { name: "Linux AppImage (x64)", id: "linux-appimage-x64" },
    ],
  },
  {
    version: "2.3",
    isLatest: false,
    releaseDate: "November 2024",
    macOS: [
      { name: "Mac (ARM64)", id: "mac-arm64" },
      { name: "Mac (x64)", id: "mac-x64" },
    ],
    windows: [
      { name: "Windows (x64)", id: "win-x64" },
      { name: "Windows (ARM64)", id: "win-arm64" },
    ],
    linux: [
      { name: "Linux .deb (x64)", id: "linux-deb-x64" },
      { name: "Linux AppImage (x64)", id: "linux-appimage-x64" },
    ],
  },
  {
    version: "2.2",
    isLatest: false,
    releaseDate: "October 2024",
    macOS: [
      { name: "Mac (ARM64)", id: "mac-arm64" },
      { name: "Mac (x64)", id: "mac-x64" },
    ],
    windows: [
      { name: "Windows (x64)", id: "win-x64" },
      { name: "Windows (ARM64)", id: "win-arm64" },
    ],
    linux: [
      { name: "Linux .deb (x64)", id: "linux-deb-x64" },
      { name: "Linux AppImage (x64)", id: "linux-appimage-x64" },
    ],
  },
  {
    version: "2.1",
    isLatest: false,
    releaseDate: "September 2024",
    macOS: [
      { name: "Mac (ARM64)", id: "mac-arm64" },
      { name: "Mac (x64)", id: "mac-x64" },
    ],
    windows: [
      { name: "Windows (x64)", id: "win-x64" },
      { name: "Windows (ARM64)", id: "win-arm64" },
    ],
    linux: [
      { name: "Linux .deb (x64)", id: "linux-deb-x64" },
      { name: "Linux AppImage (x64)", id: "linux-appimage-x64" },
    ],
  },
  {
    version: "2.0",
    isLatest: false,
    releaseDate: "August 2024",
    macOS: [
      { name: "Mac (ARM64)", id: "mac-arm64" },
      { name: "Mac (x64)", id: "mac-x64" },
    ],
    windows: [
      { name: "Windows (x64)", id: "win-x64" },
      { name: "Windows (ARM64)", id: "win-arm64" },
    ],
    linux: [
      { name: "Linux .deb (x64)", id: "linux-deb-x64" },
      { name: "Linux AppImage (x64)", id: "linux-appimage-x64" },
    ],
  },
];

function DownloadRow({
  name,
  onClick,
}: {
  name: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3 px-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
    >
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        {name}
      </span>
      <Download className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
    </motion.button>
  );
}

function PlatformSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { name: string; id: string }[];
}) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        {icon}
        <span className="text-sm font-medium text-neutral-900 dark:text-white">
          {title}
        </span>
      </div>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {items.map((item) => (
          <DownloadRow key={item.id} name={item.name} />
        ))}
      </div>
    </div>
  );
}

function VersionAccordion({
  version,
  isLatest,
  macOS,
  windows,
  linux,
  isOpen,
  onToggle,
}: {
  version: string;
  isLatest: boolean;
  macOS: { name: string; id: string }[];
  windows: { name: string; id: string }[];
  linux: { name: string; id: string }[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-1 cursor-pointer group"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-neutral-900 dark:text-white">
            {version}
          </span>
          {isLatest && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
              Latest
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <PlatformSection
                  title="macOS"
                  icon={
                    <svg
                      className="w-4 h-4 text-neutral-600 dark:text-neutral-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                    </svg>
                  }
                  items={macOS}
                />
                <PlatformSection
                  title="Windows"
                  icon={
                    <svg
                      className="w-4 h-4 text-neutral-600 dark:text-neutral-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                    </svg>
                  }
                  items={windows}
                />
                <PlatformSection
                  title="Linux"
                  icon={
                    <svg
                      className="w-4 h-4 text-neutral-600 dark:text-neutral-400"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M16.63 1.004c-0.194 0-0.394 0.010-0.6 0.026-5.281 0.416-3.88 6.007-3.961 7.87-0.050 1.426-0.534 2.729-1.325 3.792l0.013-0.018c-1.407 1.602-2.555 3.474-3.351 5.523l-0.043 0.127c-0.258 0.685-0.408 1.476-0.408 2.302 0 0.285 0.018 0.566 0.052 0.841l-0.003-0.033c-0.056 0.046-0.103 0.102-0.136 0.166l-0.001 0.003c-0.325 0.335-0.562 0.75-0.829 1.048-0.283 0.217-0.615 0.388-0.975 0.494l-0.021 0.005c-0.464 0.139-0.842 0.442-1.075 0.841l-0.005 0.009c-0.104 0.212-0.165 0.461-0.165 0.725 0 0.010 0 0.019 0 0.029l-0-0.001c0.002 0.238 0.026 0.469 0.073 0.693l-0.004-0.023c0.056 0.219 0.088 0.471 0.088 0.73 0 0.17-0.014 0.337-0.041 0.5l0.002-0.018c-0.167 0.313-0.264 0.685-0.264 1.080 0 0.278 0.048 0.544 0.137 0.791l-0.005-0.016c0.273 0.388 0.686 0.662 1.164 0.749l0.011 0.002c1.274 0.107 2.451 0.373 3.561 0.78l-0.094-0.030c0.698 0.415 1.539 0.66 2.436 0.66 0.294 0 0.582-0.026 0.862-0.077l-0.029 0.004c0.667-0.151 1.211-0.586 1.504-1.169l0.006-0.013c0.734-0.004 1.537-0.336 2.824-0.417 0.873-0.072 1.967 0.334 3.22 0.25 0.037 0.159 0.086 0.298 0.148 0.429l-0.006-0.013 0.004 0.004c0.384 0.804 1.19 1.35 2.124 1.35 0.081 0 0.161-0.004 0.24-0.012l-0.010 0.001c1.151-0.17 2.139-0.768 2.813-1.623l0.007-0.009c0.843-0.768 1.827-1.401 2.905-1.853l0.067-0.025c0.432-0.191 0.742-0.585 0.81-1.059l0.001-0.007c-0.059-0.694-0.392-1.299-0.888-1.716l-0.004-0.003v-0.121l-0.004-0.004c-0.214-0.33-0.364-0.722-0.421-1.142l-0.002-0.015c-0.053-0.513-0.278-0.966-0.615-1.307l0 0h-0.004c-0.074-0.067-0.154-0.084-0.235-0.169-0.066-0.047-0.148-0.076-0.237-0.080l-0.001-0c0.195-0.602 0.308-1.294 0.308-2.013 0-0.94-0.193-1.835-0.541-2.647l0.017 0.044c-0.704-1.672-1.619-3.111-2.732-4.369l0.014 0.017c-1.105-1.082-1.828-2.551-1.948-4.187l-0.001-0.021c0.033-2.689 0.295-7.664-4.429-7.671z" />
                    </svg>
                  }
                  items={linux}
                />
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors group"
              >
                View release notes
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Download1() {
  const [openVersion, setOpenVersion] = useState<string>("2.4");

  return (
    <section
      className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950"
      aria-label="Downloads"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start gap-6 mb-12"
        >
          <div className="self-stretch aspect-square sm:aspect-auto sm:w-28 rounded-4xl bg-linear-to-br from-neutral-400 via-neutral-500 to-neutral-600 dark:from-neutral-600 dark:via-neutral-700 dark:to-neutral-800 flex items-center justify-center shadow-lg shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm" />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">
                Download Flowcast
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Available for macOS, Windows, and Linux.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer self-start"
            >
              Download for macOS
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-t border-neutral-200 dark:border-neutral-800"
        >
          {versions.map((v, idx) => (
            <VersionAccordion
              key={v.version}
              version={v.version}
              isLatest={v.isLatest}
              macOS={v.macOS}
              windows={v.windows}
              linux={v.linux}
              isOpen={openVersion === v.version}
              onToggle={() =>
                setOpenVersion(openVersion === v.version ? "" : v.version)
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Download1;
