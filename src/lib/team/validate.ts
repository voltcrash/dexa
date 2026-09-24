import { TEAM_SIZE } from "./analysis.js";

export const MAX_TEAM_NAME = 60;

export interface TeamInput {
  name: string;
  members: string[];
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Validate a saved-team payload; `partial` allows updating only some fields. */
export function validateTeamInput(
  body: unknown,
  isKnownSlug: (slug: string) => boolean,
  partial = false,
): ValidationResult<Partial<TeamInput>> {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Send a JSON object" };
  const { name, members } = body as Record<string, unknown>;
  const value: Partial<TeamInput> = {};

  if (name !== undefined || !partial) {
    if (typeof name !== "string" || !name.trim())
      return { ok: false, error: "Give the team a name" };
    if (name.trim().length > MAX_TEAM_NAME) {
      return { ok: false, error: `Team names can be up to ${MAX_TEAM_NAME} characters` };
    }
    value.name = name.trim();
  }

  if (members !== undefined || !partial) {
    if (!Array.isArray(members) || members.some((m) => typeof m !== "string")) {
      return { ok: false, error: "Members must be a list of Pokémon" };
    }
    if (members.length === 0 || members.length > TEAM_SIZE) {
      return { ok: false, error: `A team has between 1 and ${TEAM_SIZE} Pokémon` };
    }
    const unknown = (members as string[]).find((slug) => !isKnownSlug(slug));
    if (unknown) return { ok: false, error: `Unknown Pokémon: ${unknown}` };
    value.members = members as string[];
  }

  if (partial && Object.keys(value).length === 0) return { ok: false, error: "Nothing to update" };
  return { ok: true, value };
}
