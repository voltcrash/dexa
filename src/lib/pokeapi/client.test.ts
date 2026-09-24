import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { PokeApiError, clearPokeApiCache, idFromUrl, pokeapi, toPath } from "./client.js";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("pokeapi", () => {
  beforeEach(() => clearPokeApiCache());

  it("requests the canonical URL and parses JSON", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ id: 6 }));
    await expect(pokeapi("pokemon/6", fetchFn)).resolves.toEqual({ id: 6 });
    expect(fetchFn).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon/6/", expect.anything());
  });

  it("shares requests for the same resource", async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ id: 1 }));
    await Promise.all([
      pokeapi("pokemon/1", fetchFn),
      pokeapi("https://pokeapi.co/api/v2/pokemon/1/", fetchFn),
    ]);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("throws PokeApiError on failure and does not cache it", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse({ id: 2 }));
    await expect(pokeapi("pokemon/nope", fetchFn)).rejects.toBeInstanceOf(PokeApiError);
    await expect(pokeapi("pokemon/nope", fetchFn)).resolves.toEqual({ id: 2 });
  });
});

describe("resource helpers", () => {
  it("normalises paths", () => {
    expect(toPath("https://pokeapi.co/api/v2/pokemon-species/6/")).toBe("pokemon-species/6");
    expect(toPath("/move/53/")).toBe("move/53");
  });

  it("reads ids from URLs", () => {
    expect(idFromUrl("https://pokeapi.co/api/v2/pokemon-species/133/")).toBe(133);
    expect(() => idFromUrl("https://pokeapi.co/api/v2/type/")).toThrow();
  });
});
