import type { BaseStats } from "./types.js";

/**
 * STAT_KEYS indices in the order the games draw their stat radar: HP at the top, then
 * clockwise Attack, Defense, Speed, Sp. Def, Sp. Atk. Physical sits on the right, special
 * on the left and Speed at the bottom, so a shape reads at a glance.
 */
export const SHAPE_ORDER = [0, 1, 2, 5, 4, 3] as const;

/** Base stat at the rim of the shape; the few stats above it are clamped. */
export const SHAPE_MAX = 180;

/** A small floor keeps very low stats from collapsing the shape into a line. */
const FLOOR = 0.04;

export interface Point {
  x: number;
  y: number;
}

function vertex(index: number, fraction: number, radius: number, center: number): Point {
  const angle = -Math.PI / 2 + (index * Math.PI) / 3;
  return {
    x: center + Math.cos(angle) * radius * fraction,
    y: center + Math.sin(angle) * radius * fraction,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toPath(points: readonly Point[]): string {
  return points.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");
}

/**
 * Share of the radius a base stat reaches. The square root makes the shape's area, not its
 * radius, follow the stat, which keeps low-stat shapes legible at icon sizes.
 */
export function shapeFraction(base: number): number {
  return FLOOR + (1 - FLOOR) * Math.sqrt(Math.min(1, Math.max(0, base) / SHAPE_MAX));
}

/** Vertices of a Pokémon's stat shape, in SHAPE_ORDER, for a square of side 2 × center. */
export function shapePoints(stats: BaseStats, radius: number, center = radius): Point[] {
  return SHAPE_ORDER.map((stat, i) => vertex(i, shapeFraction(stats[stat]), radius, center));
}

/** A regular hexagon at a fraction of the radius, for rims and guide rings. */
export function ringPoints(fraction: number, radius: number, center = radius): Point[] {
  return SHAPE_ORDER.map((_, i) => vertex(i, fraction, radius, center));
}
