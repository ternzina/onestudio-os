export type AgeRange = Readonly<{ min: number; max: number }>;

const AGE_RANGE_PATTERN = /(\d+)\s*[-–]\s*(\d+)/u;

export function parseAgeRange(value: string): AgeRange | null {
  const match = value.match(AGE_RANGE_PATTERN);
  if (!match) return null;
  const first = Number.parseInt(match[1], 10);
  const second = Number.parseInt(match[2], 10);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  return { min: Math.min(first, second), max: Math.max(first, second) };
}

export function ageRangesOverlap(filterValue: string, taskValue: string): boolean {
  const filterRange = parseAgeRange(filterValue);
  const taskRange = parseAgeRange(taskValue);
  if (!filterRange || !taskRange) return false;
  return filterRange.min <= taskRange.max && taskRange.min <= filterRange.max;
}
