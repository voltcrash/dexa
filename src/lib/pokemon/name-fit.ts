/**
 * How to set a Pokémon's name so it fills its column: short names use Archivo's widest
 * setting, long names its narrowest. `em` is the average advance per character at that
 * width, measured on Archivo Bold, used to size the name in container units before any
 * script runs.
 */
const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" });

export function nameFit(name: string): { stretch: number; em: number; chars: number } {
  const chars = Array.from(graphemes.segment(name)).length;
  const t = Math.min(1, Math.max(0, (chars - 5) / 8));
  const stretch = Math.round(125 - t * 50);
  // Short names lean on wide capitals, so they run wider per character.
  const em = 0.4 + ((stretch - 75) / 50) * 0.26 + (chars <= 4 ? 0.12 : 0);
  return { stretch, em: Math.round(em * 1000) / 1000, chars };
}
