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
    description: "Authentication, workspace selection, role tiers, business identity and shared configuration.",
    stage: "enabled",
    version: "1.1.0",
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
    stage: "enabled",
    version: "1.0.0",
    dependsOn: ["core"],
  },
  {
    key: "scheduling",
    title: "Scheduling",
    description: "Availability, public and administrative booking flows, calendar views, resource allocation and operational status changes.",
    stage: "enabled",
    version: "1.3.0",
    dependsOn: ["core", "catalog"],
  },
  {
    key: "crm",
    title: "Clients and CRM",
    description: "Canonical client cards, contact details, language, notes, tags, booking history, archive rules and protected duplicate merges.",
    stage: "enabled",
    version: "1.1.0",
    dependsOn: ["core", "scheduling"],
  },
  {
    key: "payments",
    title: "Payments",
    description: "Provider-neutral immutable payment and refund ledger linked to canonical bookings and clients.",
    stage: "enabled",
    version: "1.0.0",
    dependsOn: ["core", "scheduling", "crm"],
  },
  {
    key: "notifications",
    title: "Email and reminders",
    description: "Language-aware templates, durable queue jobs, protected Resend delivery, idempotent retries and stale-processing recovery.",
    stage: "enabled",
    version: "1.1.0",
    dependsOn: ["core", "scheduling", "crm", "payments"],
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
