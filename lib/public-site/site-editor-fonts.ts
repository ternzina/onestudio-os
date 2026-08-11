export const SITE_EDITOR_FONT_OPTIONS = [
  { value: "Arial", label: "Arial", stack: "Arial, sans-serif" },
  { value: "Helvetica", label: "Helvetica", stack: "Helvetica, Arial, sans-serif" },
  { value: "Verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { value: "Tahoma", label: "Tahoma", stack: "Tahoma, Geneva, sans-serif" },
  { value: "Trebuchet MS", label: "Trebuchet MS", stack: '"Trebuchet MS", Arial, sans-serif' },
  { value: "Gill Sans", label: "Gill Sans", stack: '"Gill Sans", "Trebuchet MS", sans-serif' },
  { value: "Century Gothic", label: "Century Gothic", stack: '"Century Gothic", Arial, sans-serif' },
  { value: "Georgia", label: "Georgia", stack: 'Georgia, "Times New Roman", serif' },
  { value: "Times New Roman", label: "Times New Roman", stack: '"Times New Roman", Times, serif' },
  { value: "Palatino Linotype", label: "Palatino", stack: '"Palatino Linotype", Palatino, serif' },
  { value: "Garamond", label: "Garamond", stack: "Garamond, Georgia, serif" },
  { value: "Baskerville", label: "Baskerville", stack: "Baskerville, Georgia, serif" },
  { value: "Book Antiqua", label: "Book Antiqua", stack: '"Book Antiqua", Palatino, serif' },
  { value: "Courier New", label: "Courier New", stack: '"Courier New", Courier, monospace' },
  { value: "Lucida Console", label: "Lucida Console", stack: '"Lucida Console", Monaco, monospace' },
  { value: "Monaco", label: "Monaco", stack: 'Monaco, "Lucida Console", monospace' },
  { value: "Impact", label: "Impact", stack: "Impact, Haettenschweiler, sans-serif" },
  { value: "Arial Black", label: "Arial Black", stack: '"Arial Black", Arial, sans-serif' },
  { value: "Comic Sans MS", label: "Comic Sans", stack: '"Comic Sans MS", cursive' },
  { value: "Brush Script MT", label: "Brush Script", stack: '"Brush Script MT", cursive' },
] as const;

export type SiteEditorFontFamily = (typeof SITE_EDITOR_FONT_OPTIONS)[number]["value"];

const optionByFamily = new Map<SiteEditorFontFamily, (typeof SITE_EDITOR_FONT_OPTIONS)[number]>(
  SITE_EDITOR_FONT_OPTIONS.map((option) => [option.value, option]),
);

export function normalizeSiteEditorFontFamily(value?: string | null): SiteEditorFontFamily | undefined {
  const family = value?.replace(/["']/g, "").trim() as SiteEditorFontFamily | undefined;
  return family && optionByFamily.has(family) ? family : undefined;
}

export function siteEditorFontStack(value: SiteEditorFontFamily) {
  return optionByFamily.get(value)?.stack;
}

export function typographyFontSelectValue(value?: string | null): "template" | SiteEditorFontFamily {
  if (value === "system") return "Arial";
  if (value === "humanist") return "Trebuchet MS";
  if (value === "editorial") return "Georgia";
  return normalizeSiteEditorFontFamily(value) ?? "template";
}
