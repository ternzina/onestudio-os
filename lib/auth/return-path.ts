const DEFAULT_AUTH_RETURN_PATH = "/dashboard";

export function safeAuthReturnPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_RETURN_PATH,
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  if (
    value.includes("\\") ||
    /%(?:2f|5c)/i.test(value) ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://onestudio.invalid");
    if (parsed.origin !== "https://onestudio.invalid") return fallback;

    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    const allowed =
      parsed.pathname === "/dashboard" ||
      parsed.pathname === "/launch" ||
      parsed.pathname === "/admin" ||
      parsed.pathname.startsWith("/admin/") ||
      parsed.pathname.startsWith("/site-preview/");
    return allowed ? path : fallback;
  } catch {
    return fallback;
  }
}

export function loginPathForReturnPath(returnPath: string) {
  const params = new URLSearchParams({
    next: safeAuthReturnPath(returnPath),
  });
  return `/login?${params.toString()}`;
}
