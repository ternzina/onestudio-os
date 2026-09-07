import type { PublicSiteContent } from "./types";

export const CASH_PATH_REQUEST_BLOCK_ID = "cashpath-request";
export const CASH_PATH_LEADSGATE_AID = "4848";
export const CASH_PATH_LEADSGATE_TEMPLATE = "wallet-lines" as const;

function cashPathRequestBlock(content: PublicSiteContent) {
  return (content.custom_blocks ?? []).find(
    (block) => block.id === CASH_PATH_REQUEST_BLOCK_ID,
  );
}

/** True only for the legacy text block; never offers to append a second form. */
export function needsCashPathRequestFormRepair(content: PublicSiteContent) {
  if (content.template_id !== "cashpath") return false;
  const block = cashPathRequestBlock(content);
  return block?.kind === "text";
}

/**
 * Converts the one legacy CashPath request block in-memory. It deliberately
 * leaves pages, layout, settings, and every other block untouched.
 */
export function repairCashPathRequestForm(
  content: PublicSiteContent,
): PublicSiteContent {
  if (!needsCashPathRequestFormRepair(content)) return content;

  return {
    ...content,
    custom_blocks: (content.custom_blocks ?? []).map((block) =>
      block.id === CASH_PATH_REQUEST_BLOCK_ID
        ? {
            ...block,
            kind: "leadsgate_form",
            leadsgate_aid: CASH_PATH_LEADSGATE_AID,
            leadsgate_template: CASH_PATH_LEADSGATE_TEMPLATE,
          }
        : block,
    ),
  };
}
