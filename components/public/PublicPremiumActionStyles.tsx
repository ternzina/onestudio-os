import { premiumNativeActionStyleSheet } from "@/lib/public-site/premium-action-style";
import type { PublicSiteContent } from "@/lib/public-site/types";

export default function PublicPremiumActionStyles({
  content,
  templateKey,
}: {
  content: PublicSiteContent;
  templateKey: string;
}) {
  const css = premiumNativeActionStyleSheet(content, templateKey);
  return css ? <style data-premium-action-styles>{css}</style> : null;
}
