import { hostnameWithoutPort } from "../domains/normalize.ts";

export const PLATFORM_LOCALE = "ru";

export type HostKind = "canonical-platform" | "technical-platform" | "localhost" | "tenant";

export function classifyHostname(value: string): HostKind {
  const hostname = hostnameWithoutPort(value);
  if (hostname === "onestudioos.com" || hostname === "www.onestudioos.com") return "canonical-platform";
  if (hostname === "localhost" || hostname === "127.0.0.1" || !hostname) return "localhost";
  if (hostname.endsWith(".vercel.app")) return "technical-platform";
  return "tenant";
}

export function safeLocale(value: string | null | undefined, fallback = PLATFORM_LOCALE) {
  const locale = value?.trim().toLowerCase();
  return locale && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(locale) ? locale : fallback;
}

export function requestHtmlLang(headers: { get(name: string): string | null }) {
  return safeLocale(
    headers.get("x-onestudio-request-locale") || headers.get("x-onestudio-primary-locale"),
  );
}

export function localeFromTenantPath(pathname: string, customDomain: boolean) {
  const parts = pathname.split("/").filter(Boolean);
  const candidate = customDomain ? parts[0] : parts[0] === "site" ? parts[2] : undefined;
  return candidate && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(candidate.toLowerCase())
    ? candidate.toLowerCase()
    : null;
}
