import type { DexListEntry } from "$lib/dex/list.js";
import { normalize } from "$lib/dex/search.js";

/** Accept the exact name, ignoring case, accents and punctuation ("mr mime", "flabebe"). */
export function isCorrectGuess(guess: string, entry: Pick<DexListEntry, "name">): boolean {
  const g = normalize(guess);
  return g.length > 0 && g === normalize(entry.name);
}

/** Pick a random entry, avoiding recently seen species when possible. */
export function pickRandom<T extends Pick<DexListEntry, "speciesId">>(
  pool: readonly T[],
  recent: readonly number[],
  random: () => number = Math.random,
): T | undefined {
  const fresh = pool.filter((e) => !recent.includes(e.speciesId));
  const source = fresh.length ? fresh : pool;
  return source[Math.floor(random() * source.length)];
}

/** Reveal letters of a name one hint at a time, keeping spaces and punctuation visible. */
export function nameHint(name: string, revealed: number): string {
  let shown = 0;
  const graphemes = Array.from(
    new Intl.Segmenter("en", { granularity: "grapheme" }).segment(name),
    (s) => s.segment,
  );
  return graphemes
    .map((char) => {
      if (!/[\p{L}\p{N}]/u.test(char)) return char;
      shown++;
      return shown <= revealed ? char : "_";
    })
    .join("");
}
