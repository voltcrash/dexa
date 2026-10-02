import { STAT_KEYS, STAT_LABELS, type StatKey } from "#lib/pokemon/types.js";
import type { DexListEntry } from "./list.js";

export const AXES = [...STAT_KEYS, "total", "height", "weight"] as const;
export type Axis = (typeof AXES)[number];

export function isAxis(value: string | null): value is Axis {
  return (AXES as readonly (string | null)[]).includes(value);
}

export const AXIS_LABELS: Record<Axis, string> = {
  ...(Object.fromEntries(STAT_KEYS.map((key) => [key, STAT_LABELS[key].long])) as Record<
    StatKey,
    string
  >),
  total: "Base stat total",
  height: "Height (m)",
  weight: "Weight (kg)",
};

/** Height and weight span four orders of magnitude, so they plot on a log scale. */
export function isLog(axis: Axis): boolean {
  return axis === "height" || axis === "weight";
}

export function axisValue(entry: Pick<DexListEntry, "stats" | "height" | "weight">, axis: Axis) {
  if (axis === "total") return entry.stats.reduce((sum, s) => sum + s, 0);
  if (axis === "height") return entry.height / 10;
  if (axis === "weight") return entry.weight / 10;
  return entry.stats[STAT_KEYS.indexOf(axis)];
}

export interface Scale {
  domain: [number, number];
  ticks: number[];
  /** Map a value to 0–1 along the axis. */
  at: (value: number) => number;
}

function niceStep(span: number, target: number): number {
  const raw = span / target;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
}

/** Smallest 1, 2 or 5 × 10ⁿ at or above a value, so log axes end near the data. */
function logCeil(value: number): number {
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((m) => m * power >= value * 0.999) ?? 10;
  return Number((step * power).toPrecision(1));
}

export function makeScale(values: readonly number[], axis: Axis, target = 6): Scale {
  const max = Math.max(...values, 1);
  if (isLog(axis)) {
    const min = Math.max(Math.min(...values), 0.1);
    const low = 10 ** Math.floor(Math.log10(min));
    const high = logCeil(max);
    const ticks: number[] = [];
    for (let t = low; t < high * 0.999; t *= 10) ticks.push(Number(t.toPrecision(1)));
    ticks.push(high);
    const span = Math.log10(high) - Math.log10(low);
    return {
      domain: [low, high],
      ticks,
      at: (v) => (Math.log10(Math.max(v, low)) - Math.log10(low)) / span,
    };
  }
  const step = niceStep(max, target);
  const high = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(high / step) + 1 }, (_, i) => i * step);
  return { domain: [0, high], ticks, at: (v) => v / high };
}

export const PRESETS: { x: Axis; y: Axis; label: string }[] = [
  { x: "attack", y: "special-attack", label: "Physical or special" },
  { x: "defense", y: "special-defense", label: "Which defense" },
  { x: "speed", y: "total", label: "Fast and strong" },
  { x: "height", y: "weight", label: "Size" },
];
