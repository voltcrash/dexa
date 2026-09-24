import { describe, expect, it } from "vite-plus/test";
import { safeRedirect } from "./safe-redirect.js";

describe("safeRedirect", () => {
  it("keeps same-site paths", () => {
    expect(safeRedirect("/team?p=pikachu")).toBe("/team?p=pikachu");
  });

  it("rejects other origins", () => {
    expect(safeRedirect("https://evil.example")).toBe("/");
    expect(safeRedirect("//evil.example")).toBe("/");
    expect(safeRedirect("/\\evil.example")).toBe("/");
    expect(safeRedirect(null, "/collection")).toBe("/collection");
  });
});
