export const PUCK_SITE_EDITOR_PILOT_FLAG = "PUCK_SITE_EDITOR_PILOT" as const;

export function isPuckSiteEditorPilotEnabled(
  value = process.env[PUCK_SITE_EDITOR_PILOT_FLAG],
) {
  return value === "1" || value?.toLowerCase() === "true";
}
