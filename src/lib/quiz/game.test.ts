import { describe, expect, it } from "vite-plus/test";
import { isCorrectGuess, nameHint, pickRandom } from "./game.js";

describe("quiz", () => {
  it("accepts forgiving guesses", () => {
    expect(isCorrectGuess("mr mime", { name: "Mr. Mime" })).toBe(true);
    expect(isCorrectGuess("FLABEBE", { name: "Flabébé" })).toBe(true);
    expect(isCorrectGuess("pikachu!", { name: "Pikachu" })).toBe(true);
    expect(isCorrectGuess("", { name: "Pikachu" })).toBe(false);
    expect(isCorrectGuess("raichu", { name: "Pikachu" })).toBe(false);
  });

  it("avoids recent picks", () => {
    const pool = [{ speciesId: 1 }, { speciesId: 2 }];
    expect(pickRandom(pool, [1], () => 0)?.speciesId).toBe(2);
    expect(pickRandom(pool, [1, 2], () => 0.99)?.speciesId).toBe(2);
    expect(pickRandom([], [])).toBeUndefined();
  });

  it("builds letter hints", () => {
    expect(nameHint("Mr. Mime", 0)).toBe("__. ____");
    expect(nameHint("Mr. Mime", 3)).toBe("Mr. M___");
  });
});
