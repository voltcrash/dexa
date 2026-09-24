/** Lowercase, strip accents and punctuation so "Flabébé" matches "flabebe" and "Mr. Mime" matches "mrmime". */
export function normalize(text: string): string {
  return text
    .replace(/♀/g, "f")
    .replace(/♂/g, "m")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (const char of haystack) {
    if (char === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return needle.length === 0;
}

/**
 * Score how well a query matches a name: lower is better, null means no match.
 * Words are matched at their start so "zard" finds Charizard but ranks below "Zard…" names.
 */
export function matchScore(query: string, name: string): number | null {
  const q = normalize(query);
  if (!q) return 0;
  const n = normalize(name);
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  const words = name
    .toLowerCase()
    .split(/[\s\-.:()’']+/)
    .map(normalize);
  if (words.some((w) => w.startsWith(q))) return 2;
  if (n.includes(q)) return 3;
  if (q.length >= 3 && isSubsequence(q, n)) return 4;
  return null;
}

/** "25", "#025" and "no. 25" are dex number queries. */
export function parseDexNumber(query: string): number | null {
  const match = /^(?:#|no\.?\s*)?0*(\d{1,4})$/i.exec(query.trim());
  return match ? Number(match[1]) : null;
}
