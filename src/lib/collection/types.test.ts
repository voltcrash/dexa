import { describe, expect, it } from "vite-plus/test";
import { isEmpty, parseFlags } from "./types.js";

describe("collection flags", () => {
  it("parses only boolean flags", () => {
    expect(parseFlags({ caught: true, shiny: "yes", admin: true })).toEqual({ caught: true });
    expect(parseFlags(null)).toEqual({});
  });

  it("detects empty entries", () => {
    expect(isEmpty({ caught: false, shiny: false, favorite: false })).toBe(true);
    expect(isEmpty({ caught: false, shiny: false, favorite: true })).toBe(false);
  });
});
