import { describe, expect, it } from "vite-plus/test";
import { answerFor, compareGuess, dateKey, puzzleNumber, shareText } from "./game.js";
import type { BaseStats, TypeName } from "#lib/pokemon/types.js";

const mon = (
  types: TypeName[],
  generation: number,
  height: number,
  weight: number,
  stats: BaseStats,
) => ({
  types,
  generation,
  height,
  weight,
  stats,
});

const charizard = mon(["fire", "flying"], 1, 17, 905, [78, 84, 78, 109, 85, 100]);
const talonflame = mon(["fire", "flying"], 6, 12, 245, [78, 81, 71, 74, 69, 126]);
const moltres = mon(["fire", "flying"], 1, 20, 600, [90, 100, 90, 125, 85, 90]);
const pidgeot = mon(["normal", "flying"], 1, 15, 395, [83, 80, 75, 70, 70, 101]);
const gyarados = mon(["water", "flying"], 1, 65, 2350, [95, 125, 79, 60, 100, 81]);

describe("puzzle dates", () => {
  it("numbers puzzles by local calendar day", () => {
    expect(puzzleNumber(new Date(2026, 8, 28, 0, 5))).toBe(1);
    expect(puzzleNumber(new Date(2026, 8, 28, 23, 55))).toBe(1);
    expect(puzzleNumber(new Date(2026, 9, 1, 9))).toBe(4);
    expect(dateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("answerFor", () => {
  const pool = Array.from({ length: 50 }, (_, i) => ({ speciesId: i + 1 }));

  it("is the same for everyone on a day and cycles through every species", () => {
    expect(answerFor(7, [...pool].reverse())).toEqual(answerFor(7, pool));
    const seen = new Set(Array.from({ length: 50 }, (_, i) => answerFor(i + 1, pool).speciesId));
    expect(seen.size).toBe(50);
    expect(answerFor(51, pool)).toBe(answerFor(1, pool));
  });
});

describe("compareGuess", () => {
  const hints = (guess: ReturnType<typeof mon>) =>
    compareGuess(guess, charizard).map((c) => c.hint);

  it("marks exact, misplaced and missing types", () => {
    expect(hints(talonflame).slice(0, 2)).toEqual(["match", "match"]);
    expect(hints(pidgeot).slice(0, 2)).toEqual(["miss", "match"]);
    expect(compareGuess(mon(["flying"], 1, 1, 1, charizard.stats), charizard)[0].hint).toBe("near");
  });

  it("points toward higher or lower numbers", () => {
    expect(hints(talonflame).slice(2)).toEqual(["lower", "higher", "higher", "higher"]);
    expect(hints(moltres).slice(2)).toEqual(["match", "lower", "higher", "lower"]);
    expect(hints(gyarados)[3]).toBe("lower");
  });
});

describe("shareText", () => {
  it("summarises guesses without names", () => {
    const rows = [compareGuess(pidgeot, charizard), compareGuess(charizard, charizard)];
    expect(shareText(3, rows, true)).toBe("Dexa daily #3 2/8\n⬛🟩🟩🔼🔼🔼\n🟩🟩🟩🟩🟩🟩");
  });
});
