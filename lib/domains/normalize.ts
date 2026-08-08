const PLATFORM_HOSTS = new Set([
  "onestudioos.com",
  "www.onestudioos.com",
  "localhost",
  "127.0.0.1",
]);

export function hostnameWithoutPort(value: string) {
  return value.trim().toLowerCase().split(":")[0]?.replace(/\.$/, "") || "";
}

export function isPlatformHostname(value: string) {
  const hostname = hostnameWithoutPort(value);
  return PLATFORM_HOSTS.has(hostname) || hostname.endsWith(".vercel.app");
}

export function isCanonicalPlatformHostname(value: string) {
  const hostname = hostnameWithoutPort(value);
  return hostname === "onestudioos.com" || hostname === "www.onestudioos.com";
}

export function isTechnicalPlatformHostname(value: string) {
  return hostnameWithoutPort(value).endsWith(".vercel.app");
}

export function normalizeCustomDomain(value: string) {
  const raw = value.trim();
  if (!raw) throw new Error("invalid_domain");

  let hostname: string;
  try {
    hostname = new URL(
      raw.includes("://") ? raw : `https://${raw}`,
    ).hostname.toLowerCase();
  } catch {
    throw new Error("invalid_domain");
  }

  hostname = hostname.replace(/\.$/, "");

  if (
    !hostname ||
    hostname.length > 253 ||
    isPlatformHostname(hostname) ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
      hostname,
    )
  ) {
    throw new Error("invalid_domain");
  }

  return hostname;
}
