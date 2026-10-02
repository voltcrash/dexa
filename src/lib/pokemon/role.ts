import { normalize } from "#lib/dex/search.js";
import type { BaseStats } from "./types.js";

export type RoleKind =
  | "sweeper"
  | "glass-cannon"
  | "tank"
  | "slow-hitter"
  | "attacker"
  | "wall"
  | "speedster"
  | "all-rounder";

export type Side = "physical" | "special" | "mixed";

export interface Role {
  kind: RoleKind;
  /** Which attacking or defensive stat the role leans on; absent for balanced roles. */
  side?: Side;
  label: string;
  description: string;
}

const SIDE_WORD: Record<Side, string> = {
  physical: "Physical",
  special: "Special",
  mixed: "Mixed",
};
const ATTACK_STAT: Record<Side, string> = {
  physical: "Attack",
  special: "Sp. Atk",
  mixed: "both Attack and Sp. Atk",
};

function role(kind: RoleKind, side: Side | undefined, name: string, description: string): Role {
  const label = side ? `${SIDE_WORD[side]} ${name.toLowerCase()}` : name;
  return { kind, side, label, description };
}

/**
 * Classify a stat spread into a battle role, judged against the Pokémon's own average stat so
 * unevolved Pokémon get a role too. A heuristic from base stats alone; abilities and moves
 * can change how a Pokémon is really used.
 */
export function statRole(stats: BaseStats): Role {
  const [, atk, , spa] = stats;
  const mean = stats.reduce((sum, s) => sum + s, 0) / 6;
  const [hp, attack, defense, spAtk, spDef, speed] = stats.map((s) => s / mean);
  const offense = Math.max(attack, spAtk);
  const bulk = (hp + defense + spDef) / 3;
  const physicalBulk = (hp + 2 * defense) / 3;
  const specialBulk = (hp + 2 * spDef) / 3;
  const guard = Math.max(physicalBulk, specialBulk);

  if (guard >= 1.15 && guard >= offense + 0.1) {
    if (physicalBulk >= 1.1 && specialBulk >= 1.1 && Math.abs(physicalBulk - specialBulk) < 0.2) {
      return role("wall", undefined, "Wall", "Soaks up physical and special hits alike.");
    }
    return physicalBulk > specialBulk
      ? role("wall", "physical", "Wall", "Built to absorb physical hits with HP and Defense.")
      : role("wall", "special", "Wall", "Built to absorb special hits with HP and Sp. Def.");
  }

  if (offense >= 1.15) {
    const mixed =
      Math.min(atk, spa) / Math.max(atk, spa) >= 0.88 && Math.min(attack, spAtk) >= 1.05;
    const side: Side = mixed ? "mixed" : atk >= spa ? "physical" : "special";
    const stat = ATTACK_STAT[side];
    if (bulk <= 0.8 && offense >= 1.3 && speed >= 0.9) {
      return role(
        "glass-cannon",
        side,
        "Glass cannon",
        `Fast, with a huge ${stat}, but it can’t take many hits.`,
      );
    }
    if (speed >= 1) {
      return role("sweeper", side, "Sweeper", `Fast and strong in ${stat}, built to strike first.`);
    }
    if (bulk >= 1) {
      return role(
        "tank",
        side,
        "Tank",
        `Hits hard with ${stat} and takes hits well, but isn’t fast.`,
      );
    }
    if (speed <= 0.7) {
      return role(
        "slow-hitter",
        side,
        "Slow hitter",
        `Hits hard with ${stat} but usually moves last.`,
      );
    }
    return role("attacker", side, "Attacker", `Leans on ${stat} more than bulk or speed.`);
  }

  if (speed >= 1.35) {
    return role(
      "speedster",
      undefined,
      "Speedster",
      "Its Speed stands out more than its power or bulk.",
    );
  }
  return role("all-rounder", undefined, "All-rounder", "No stat stands far above the rest.");
}

/** Whether a role matches a search term such as "sweeper", "physical" or "special-wall". */
export function roleMatches(role: Role, term: string): boolean {
  const label = normalize(role.label);
  const query = normalize(term);
  return query.length > 0 && (label === query || label.startsWith(query) || label.endsWith(query));
}

const KINDS = [
  "sweeper",
  "glasscannon",
  "tank",
  "slowhitter",
  "attacker",
  "wall",
  "speedster",
  "allrounder",
];
const SIDES = ["physical", "special", "mixed"];

/** Whether a search term names a role, a side or both, e.g. "wall", "special" or "physical-tank". */
export function isRoleTerm(term: string): boolean {
  const query = normalize(term);
  if (SIDES.includes(query) || KINDS.includes(query)) return true;
  return SIDES.some((side) => query.startsWith(side) && KINDS.includes(query.slice(side.length)));
}
