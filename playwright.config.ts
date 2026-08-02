import { defineConfig } from "@playwright/test";
import { execSync } from "node:child_process";

function readLocalSupabaseEnv() {
  const output = execSync("npx supabase@beta status -o env", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

  const result: Record<string, string> = {};

  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[match[1]] = value;
  }

  return result;
}

const local = readLocalSupabaseEnv();

const supabaseUrl =
  local.API_URL ||
  local.SUPABASE_URL ||
  "http://127.0.0.1:54321";

const anonKey =
  local.ANON_KEY ||
  local.PUBLISHABLE_KEY;

const serviceRoleKey =
  local.SERVICE_ROLE_KEY ||
  local.SECRET_KEY;

if (!anonKey) {
  throw new Error("Не найден локальный ANON_KEY.");
}

if (!serviceRoleKey) {
  throw new Error("Не найден локальный SERVICE_ROLE_KEY.");
}

process.env.E2E_SUPABASE_URL = supabaseUrl;
process.env.E2E_SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey;
process.env.E2E_MAIL_URL = local.INBUCKET_URL || "http://127.0.0.1:54324";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: {
    timeout: 30_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: anonKey,
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
    },
  },
});
