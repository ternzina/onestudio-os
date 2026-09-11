import { defineConfig } from "@playwright/test";

/** Public-only checks against an already running server; no database services. */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "journal-guides-stability.spec.ts",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: "list",
  outputDir: "/tmp/onestudio-journal-browser-results",
  use: {
    baseURL: process.env.JOURNAL_PREVIEW_URL ?? "http://127.0.0.1:3108",
    headless: true,
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
