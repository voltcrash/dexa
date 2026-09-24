import { describe, expect, it } from "vite-plus/test";
import { validateTeamInput } from "./validate.js";

const known = (slug: string) => ["pikachu", "eevee", "mew"].includes(slug);

describe("validateTeamInput", () => {
  it("accepts a full team", () => {
    expect(validateTeamInput({ name: "  Rain  ", members: ["pikachu", "eevee"] }, known)).toEqual({
      ok: true,
      value: { name: "Rain", members: ["pikachu", "eevee"] },
    });
  });

  it("rejects bad input", () => {
    expect(validateTeamInput({ name: "", members: ["pikachu"] }, known).ok).toBe(false);
    expect(validateTeamInput({ name: "x".repeat(61), members: ["pikachu"] }, known).ok).toBe(false);
    expect(validateTeamInput({ name: "A", members: [] }, known).ok).toBe(false);
    expect(validateTeamInput({ name: "A", members: Array(7).fill("mew") }, known).ok).toBe(false);
    expect(validateTeamInput({ name: "A", members: ["missingno"] }, known)).toEqual({
      ok: false,
      error: "Unknown Pokémon: missingno",
    });
  });

  it("allows partial updates", () => {
    expect(validateTeamInput({ name: "New" }, known, true)).toEqual({
      ok: true,
      value: { name: "New" },
    });
    expect(validateTeamInput({}, known, true).ok).toBe(false);
  });
});
