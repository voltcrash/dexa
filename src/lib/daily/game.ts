import type { DexListEntry } from "#lib/dex/list.js";
import { statTotal } from "#lib/dex/list.js";
import { titleCase } from "#lib/pokemon/format.js";

export const MAX_GUESSES = 8;

/** Puzzle 1 was played on this local date. */
const FIRST_DAY = Date.UTC(2026, 8, 28);
const DAY = 86_400_000;

/** Local calendar date as YYYY-MM-DD, so the puzzle turns over at each player's midnight. */
export function dateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function puzzleNumber(date: Date): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((local - FIRST_DAY) / DAY) + 1;
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * The answer for a puzzle. A fixed shuffle of the whole dex is walked one step a day, so no
 * Pokémon repeats until every species has had its turn.
 */
export function answerFor<T extends Pick<DexListEntry, "speciesId">>(
  puzzle: number,
  pool: readonly T[],
): T {
  const sorted = [...pool].sort((a, b) => a.speciesId - b.speciesId);
  const random = mulberry32(0xdec5a);
  for (let i = sorted.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
  }
  const index = (((puzzle - 1) % sorted.length) + sorted.length) % sorted.length;
  return sorted[index];
}

/** match: same; near: the type is the answer's other type; higher/lower: the answer's value is. */
export type Hint = "match" | "near" | "miss" | "higher" | "lower";

export interface Clue {
  key: "type1" | "type2" | "generation" | "height" | "weight" | "total";
  label: string;
  value: string;
  hint: Hint;
}

type Guessable = Pick<DexListEntry, "types" | "generation" | "height" | "weight" | "stats">;

function numeric(guess: number, answer: number): Hint {
  if (guess === answer) return "match";
  return answer > guess ? "higher" : "lower";
}

function typeHint(guess: Guessable, answer: Guessable, slot: 0 | 1): Hint {
  const type = guess.types[slot];
  if (type === answer.types[slot]) return "match";
  if (type && answer.types.includes(type)) return "near";
  return "miss";
}

export function compareGuess(guess: Guessable, answer: Guessable): Clue[] {
  return [
    {
      key: "type1",
      label: "Type 1",
      value: titleCase(guess.types[0]),
      hint: typeHint(guess, answer, 0),
    },
    {
      key: "type2",
      label: "Type 2",
      value: guess.types[1] ? titleCase(guess.types[1]) : "None",
      hint: typeHint(guess, answer, 1),
    },
    {
      key: "generation",
      label: "Gen",
      value: String(guess.generation),
      hint: numeric(guess.generation, answer.generation),
    },
    {
      key: "height",
      label: "Height",
      value: `${guess.height / 10} m`,
      hint: numeric(guess.height, answer.height),
    },
    {
      key: "weight",
      label: "Weight",
      value: `${guess.weight / 10} kg`,
      hint: numeric(guess.weight, answer.weight),
    },
    {
      key: "total",
      label: "Stat total",
      value: String(statTotal(guess)),
      hint: numeric(statTotal(guess), statTotal(answer)),
    },
  ];
}

const EMOJI: Record<Hint, string> = {
  match: "🟩",
  near: "🟨",
  miss: "⬛",
  higher: "🔼",
  lower: "🔽",
};

/** A spoiler-free summary to paste into a chat. */
export function shareText(puzzle: number, rows: Clue[][], won: boolean): string {
  const score = won ? `${rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const grid = rows.map((row) => row.map((clue) => EMOJI[clue.hint]).join("")).join("\n");
  return `Dexa daily #${puzzle} ${score}\n${grid}`;
}
