export const CASH_PATH_BUSINESS_SLUG = "cashpath-909c00c9";

export function isCashPathBusinessSlug(businessSlug: string) {
  return businessSlug.trim().toLowerCase() === CASH_PATH_BUSINESS_SLUG;
}

export function isCashPathRequestLabel(label: string | null | undefined) {
  return label?.replace(/[→←➜➔]/g, "").replace(/\s+/g, " ").trim().toLowerCase() === "start your request";
}

export function isAllowedCashPathAnalyticsEvent(
  eventName: string,
  businessSlug: string,
) {
  return eventName !== "leadsgate_form_ready" || isCashPathBusinessSlug(businessSlug);
}
