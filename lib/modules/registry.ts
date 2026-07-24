import type { CoreModuleKey, CoreModuleStage } from "./contracts";

export type CoreModuleDefinition = {
  key: CoreModuleKey;
  title: string;
  description: string;
  stage: CoreModuleStage;
  version: string;
  dependsOn: CoreModuleKey[];
};

export const CORE_MODULES: readonly CoreModuleDefinition[] = [
  {
    key: "core",
    title: "Core foundation",
    description: "Authentication, business identity, permissions and shared configuration.",
    stage: "enabled",
    version: "1.0.0",
    dependsOn: [],
  },
  {
    key: "media",
    title: "Media library",
    description: "Cloudflare R2 assets and reusable media records.",
    stage: "enabled",
    version: "1.0.0",
    dependsOn: ["core"],
  },
  {
    key: "portfolio",
    title: "Portfolio",
    description: "Categories, projects and publishable media selections.",
    stage: "enabled",
    version: "1.0.0",
    dependsOn: ["core", "media"],
  },
  {
    key: "catalog",
    title: "Services and resources",
    description: "One catalog for appointments, rentals, classes and other bookable offers.",
    stage: "contract-ready",
    version: "1.0.0",
    dependsOn: ["core"],
  },
  {
    key: "scheduling",
    title: "Scheduling",
    description: "Availability rules, exceptions and conflict-safe resource allocation.",
    stage: "contract-ready",
    version: "1.0.0",
    dependsOn: ["core", "catalog"],
  },
  {
    key: "crm",
    title: "Clients and CRM",
    description: "Guest and registered clients, notes, tags and booking history.",
    stage: "contract-ready",
    version: "1.0.0",
    dependsOn: ["core"],
  },
  {
    key: "payments",
    title: "Payments",
    description: "Provider-neutral payment records, checkout and refunds.",
    stage: "planned",
    version: "0.0.0",
    dependsOn: ["core", "scheduling", "crm"],
  },
  {
    key: "notifications",
    title: "Email and reminders",
    description: "Confirmations, reminders and language-aware templates.",
    stage: "planned",
    version: "0.0.0",
    dependsOn: ["core", "scheduling", "crm"],
  },
  {
    key: "analytics",
    title: "Analytics",
    description: "Operational metrics derived from bookings, clients and payments.",
    stage: "planned",
    version: "0.0.0",
    dependsOn: ["core", "scheduling", "crm"],
  },
] as const;

export function getCoreModule(key: CoreModuleKey) {
  return CORE_MODULES.find((module) => module.key === key);
}
