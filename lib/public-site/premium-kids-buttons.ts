import type { PublicSiteButtonAppearance, PublicSiteButtonTheme } from "./button-style.ts";

export const PREMIUM_KIDS_NATIVE_BUTTON_KEYS = [
  "primary_cta_label",
  "secondary_cta_label",
  "final_cta_label",
] as const;

export type PremiumKidsNativeButtonKey = (typeof PREMIUM_KIDS_NATIVE_BUTTON_KEYS)[number];
export type PremiumKidsNativeButtonConfig = PublicSiteButtonAppearance & { href?: string };
export type PremiumKidsNativeButtons = Partial<Record<PremiumKidsNativeButtonKey, PremiumKidsNativeButtonConfig>>;

export const PREMIUM_KIDS_NATIVE_BUTTON_THEMES: Record<PremiumKidsNativeButtonKey, PublicSiteButtonTheme> = {
  primary_cta_label: { size: "large", backgroundColor: "#3e263e", textColor: "#fef9ef" },
  secondary_cta_label: { size: "large", backgroundColor: "#fcf5e4", textColor: "#3e263e" },
  final_cta_label: { size: "large", backgroundColor: "#e0bcb3", textColor: "#3e263e" },
};

export function isPremiumKidsNativeButtonKey(value: string): value is PremiumKidsNativeButtonKey {
  return PREMIUM_KIDS_NATIVE_BUTTON_KEYS.includes(value as PremiumKidsNativeButtonKey);
}
