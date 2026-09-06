const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_FUNCTION = /^rgba?\((.*)\)$/i;

function parseNumericPart(value: string, min: number, max: number) {
  const match = value.trim().match(/^([+-]?(?:\d+\.?\d*|\.\d+))(%?)$/);
  if (!match) return undefined;
  const numeric = Number(match[1]);
  const result = match[2] === "%" ? (numeric / 100) * max : numeric;
  return Number.isFinite(result) && result >= min && result <= max ? result : undefined;
}

function parseRgb(value: string) {
  const match = value.trim().match(RGB_FUNCTION);
  if (!match) return undefined;
  const parts = match[1].includes(",")
    ? match[1].split(",").map((part) => part.trim())
    : match[1].trim().split(/\s+/);
  if (parts.length !== 3 && parts.length !== 4) return undefined;
  const channels = parts.slice(0, 3).map((part) => parseNumericPart(part, 0, 255));
  if (channels.some((channel) => channel === undefined)) return undefined;
  if (parts.length === 4 && parseNumericPart(parts[3], 0, 1) === undefined) return undefined;
  return channels as [number, number, number];
}

export function isProductionColor(value: unknown): value is string {
  return typeof value === "string" && (HEX_COLOR.test(value.trim()) || parseRgb(value) !== undefined);
}

function channelToHex(channel: number) {
  return Math.round(channel).toString(16).padStart(2, "0");
}

/** Converts supported opaque CSS colors to the browser color-input format. */
export function productionColorToPickerHex(value: unknown, fallback = "#000000") {
  if (typeof value !== "string") return fallback;
  const candidate = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(candidate)) return candidate;
  const shortHex = candidate.match(/^#([0-9a-f]{3})$/i);
  if (shortHex) return `#${shortHex[1].split("").map((digit) => `${digit}${digit}`).join("")}`;
  const rgb = parseRgb(candidate);
  if (rgb) return `#${rgb.map(channelToHex).join("")}`;
  return fallback;
}
