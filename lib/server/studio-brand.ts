const cleanHeaderValue = (value: string) =>
  value.replace(/[\r\n<>]/g, " ").replace(/\s+/g, " ").trim();

const firstValidEmail = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((email) => email.trim())
    .find((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

export const STUDIO_NAME =
  cleanHeaderValue(process.env.STUDIO_NAME || "OneStudio OS") || "OneStudio OS";

export const STUDIO_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.STRIPE_SITE_URL ||
  "https://onestudioos.com"
).replace(/\/$/, "");

export const STUDIO_ADDRESS = (process.env.STUDIO_ADDRESS || "").trim();

export const STUDIO_TIME_ZONE =
  (process.env.STUDIO_TIME_ZONE || "Europe/Kyiv").trim() || "Europe/Kyiv";

const resendFromEmail =
  firstValidEmail(process.env.RESEND_FROM_EMAIL) || "hello@onestudioos.com";

export const RESEND_FROM = `${STUDIO_NAME} <${resendFromEmail}>`;
