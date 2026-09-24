import { describe, expect, it } from "vite-plus/test";
import {
  averageStats,
  parseTeam,
  sharedWeaknesses,
  teamDefense,
  teamOffense,
  type TeamMember,
} from "./analysis.js";

const member = (slug: string, types: TeamMember["types"], stats = [100, 100, 100, 100, 100, 100]) =>
  ({ id: 1, speciesId: 1, slug, name: slug, types, stats }) as TeamMember;

const team = [
  member("charizard", ["fire", "flying"], [78, 84, 78, 109, 85, 100]),
  member("gyarados", ["water", "flying"], [95, 125, 79, 60, 100, 81]),
  member("zapdos", ["electric", "flying"]),
];

describe("team analysis", () => {
  it("counts weaknesses, resistances and immunities", () => {
    const rows = teamDefense(team);
    const rock = rows.find((r) => r.attack === "rock");
    expect(rock).toMatchObject({ weak: 3, resist: 0, immune: 0 });
    const ground = rows.find((r) => r.attack === "ground");
    expect(ground?.immune).toBe(3);
  });

  it("finds shared weaknesses", () => {
    expect(sharedWeaknesses(teamDefense(team))).toContain("rock");
    expect(sharedWeaknesses(teamDefense(team))).not.toContain("ground");
  });

  it("lists same-type coverage", () => {
    const offense = teamOffense(team);
    expect(offense.find((o) => o.defend === "grass")?.hitters).toEqual([
      "charizard",
      "gyarados",
      "zapdos",
    ]);
    expect(offense.find((o) => o.defend === "water")?.hitters).toEqual(["zapdos"]);
  });

  it("averages stats and parses the URL", () => {
    expect(averageStats([])).toEqual([0, 0, 0, 0, 0, 0]);
    expect(averageStats(team.slice(0, 2))[0]).toBe(87);
    expect(parseTeam(" Pikachu,,eevee,a,b,c,d,e")).toEqual([
      "pikachu",
      "eevee",
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});
