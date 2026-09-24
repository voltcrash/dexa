export interface Generation {
  id: number;
  numeral: string;
  region: string;
  /** Inclusive National Dex range of species introduced in this generation. */
  range: [number, number];
}

export const GENERATIONS: Generation[] = [
  { id: 1, numeral: "I", region: "Kanto", range: [1, 151] },
  { id: 2, numeral: "II", region: "Johto", range: [152, 251] },
  { id: 3, numeral: "III", region: "Hoenn", range: [252, 386] },
  { id: 4, numeral: "IV", region: "Sinnoh", range: [387, 493] },
  { id: 5, numeral: "V", region: "Unova", range: [494, 649] },
  { id: 6, numeral: "VI", region: "Kalos", range: [650, 721] },
  { id: 7, numeral: "VII", region: "Alola", range: [722, 809] },
  { id: 8, numeral: "VIII", region: "Galar", range: [810, 905] },
  { id: 9, numeral: "IX", region: "Paldea", range: [906, 1025] },
];

const ROMAN: Record<string, number> = { i: 1, v: 5, x: 10 };

/** Parse a PokéAPI generation name such as `generation-iv`. */
export function generationFromName(name: string): number {
  const numeral = name.replace("generation-", "").toLowerCase();
  let total = 0;
  for (let i = 0; i < numeral.length; i++) {
    const value = ROMAN[numeral[i]] ?? 0;
    const next = ROMAN[numeral[i + 1]] ?? 0;
    total += value < next ? -value : value;
  }
  return total;
}

export function generationOfSpecies(speciesId: number): Generation | undefined {
  return GENERATIONS.find(({ range: [start, end] }) => speciesId >= start && speciesId <= end);
}
