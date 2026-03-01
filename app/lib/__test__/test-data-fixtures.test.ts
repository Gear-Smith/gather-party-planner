import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  LOCATION_EXPOSURE_LABELS,
  LOCATION_BUDGET_LABELS,
  LOCATION_MORALITY_LABELS,
  LOCATION_RATING_LABELS,
  LOCATION_TONE_LABELS,
  LOCATION_TYPE_VALUES,
  PARTY_STATUS_VALUES,
  PARTY_TYPE_VALUES,
  USER_ROLE_VALUES,
  USER_STATUS_VALUES,
} from "../../../test_data/json/test-data.types";

const projectRoot = process.cwd();
const jsonDir = path.join(projectRoot, "test_data", "json");

function readJsonFile<T>(filename: string): T {
  return JSON.parse(
    readFileSync(path.join(jsonDir, filename), "utf-8"),
  ) as T;
}

function renderLabelMap(
  name: string,
  values: Record<number, string>,
): string {
  const lines = [`export const ${name} = {`];

  for (const [score, label] of Object.entries(values)) {
    lines.push(`  ${score}: ${JSON.stringify(label)},`);
  }

  lines.push("} as const;");
  return lines.join("\n");
}

function renderLiteralArray(name: string, values: readonly string[]): string {
  const lines = [`export const ${name} = [`];

  for (const value of values) {
    lines.push(`  ${JSON.stringify(value)},`);
  }

  lines.push("] as const;");
  return lines.join("\n");
}

function renderTypesModule(): string {
  return [
    renderLabelMap("LOCATION_RATING_LABELS", LOCATION_RATING_LABELS),
    "",
    renderLabelMap("LOCATION_TONE_LABELS", LOCATION_TONE_LABELS),
    "",
    renderLabelMap("LOCATION_EXPOSURE_LABELS", LOCATION_EXPOSURE_LABELS),
    "",
    renderLabelMap("LOCATION_MORALITY_LABELS", LOCATION_MORALITY_LABELS),
    "",
    renderLabelMap("LOCATION_BUDGET_LABELS", LOCATION_BUDGET_LABELS),
    "",
    "export type LocationRating = 1 | 2 | 3 | 4 | 5;",
    "export type LocationTone = 1 | 2 | 3 | 4 | 5;",
    "export type LocationExposure = 1 | 2 | 3 | 4 | 5;",
    "export type LocationMorality = 1 | 2 | 3 | 4 | 5;",
    "export type LocationBudget = 1 | 2 | 3 | 4 | 5;",
    "",
    renderLiteralArray("LOCATION_TYPE_VALUES", LOCATION_TYPE_VALUES),
    "",
    renderLiteralArray("USER_ROLE_VALUES", USER_ROLE_VALUES),
    "",
    renderLiteralArray("USER_STATUS_VALUES", USER_STATUS_VALUES),
    "",
    renderLiteralArray("PARTY_TYPE_VALUES", PARTY_TYPE_VALUES),
    "",
    renderLiteralArray("PARTY_STATUS_VALUES", PARTY_STATUS_VALUES),
    "",
    "export interface LocationRecord {",
    "  location_id: string;",
    "  location_type: (typeof LOCATION_TYPE_VALUES)[number];",
    "  location_city: string | null;",
    "  location_name: string | null;",
    "  location_rating: LocationRating | null;",
    "  location_address: string | null;",
    "  location_hours: string | null;",
    "  location_phone: string | null;",
    "  location_website: string | null;",
    "  location_pictures: string | null;",
    "  location_tone: LocationTone | null;",
    "  location_exposure: LocationExposure | null;",
    "  location_morality: LocationMorality | null;",
    "  location_budget: LocationBudget | null;",
    "}",
    "",
    "export interface UserRecord {",
    "  user_id: string;",
    "  user_created: string | null;",
    "  user_first_name: string | null;",
    "  user_last_name: string | null;",
    "  user_display_name: string | null;",
    "  user_role: (typeof USER_ROLE_VALUES)[number] | null;",
    "  user_phone: string | null;",
    "  user_email: string | null;",
    "  user_last_active: string | null;",
    "  user_status: (typeof USER_STATUS_VALUES)[number] | null;",
    "}",
    "",
    "export interface PartyRecord {",
    "  party_id: string;",
    "  party_creator: string | null;",
    "  party_created_at: string | null;",
    "  party_updated_at: string | null;",
    "  party_name: string | null;",
    "  party_type: (typeof PARTY_TYPE_VALUES)[number] | null;",
    "  party_status: (typeof PARTY_STATUS_VALUES)[number] | null;",
    "  party_start: string | null;",
    "  party_end: string | null;",
    "  party_location: string | null;",
    "  party_headcount: number | null;",
    "  party_tone: LocationTone | null;",
    "  party_exposure: LocationExposure | null;",
    "  party_morality: LocationMorality | null;",
    "  party_budget: LocationBudget | null;",
    "  party_planner: string | null;",
    "  party_share_code: string | null;",
    "}",
    "",
    "export interface ItineraryRecord {",
    "  itin_id: string;",
    "  party_id: string | null;",
    "  itin_title: string | null;",
    "  itin_start: string | null;",
    "  itin_end: string | null;",
    "  itin_location: string | null;",
    "  itin_roster: string | null;",
    "}",
    "",
  ].join("\n");
}

describe("generated test data fixtures", () => {
  it("exports valid, normalized json fixtures", () => {
    const locations = readJsonFile<Array<Record<string, unknown>>>("locations.json");
    const users = readJsonFile<Array<Record<string, unknown>>>("users.json");
    const parties = readJsonFile<Array<Record<string, unknown>>>("parties.json");
    const itinerary = readJsonFile<Array<Record<string, unknown>>>("itinerary.json");

    expect(locations).toHaveLength(257);
    expect(users).toHaveLength(6);
    expect(parties).toHaveLength(1);
    expect(itinerary).toHaveLength(53);

    expect(locations[0]?.location_rating).toBe(5);
    expect(locations[0]?.location_budget).toBe(4);
    expect(locations[0]?.location_pictures).toBeNull();

    expect(users[2]?.user_first_name).toBe("Ashley");
    expect(users[0]?.user_created).toBe("2026-02-22T00:01:00Z");

    expect(parties[0]?.party_budget).toBe(3);
    expect(parties[0]?.party_headcount).toBe(6);
    expect(parties[0]?.party_start).toBe("2026-05-09T10:00:00Z");

    expect(itinerary[0]?.itin_start).toBe("2026-05-07T09:30:00Z");
  });

  it("exports enum metadata for ordinal traversal", () => {
    expect(LOCATION_BUDGET_LABELS[1]).toBe("$");
    expect(LOCATION_MORALITY_LABELS[5]).toBe("NC-17");
    expect(LOCATION_TONE_LABELS[4]).toBe("Smart");
  });

  it("matches the generator's canonical output format", () => {
    for (const filename of [
      "locations.json",
      "users.json",
      "parties.json",
      "itinerary.json",
    ]) {
      const source = readFileSync(path.join(jsonDir, filename), "utf-8");
      expect(source).toBe(`${JSON.stringify(JSON.parse(source), null, 2)}\n`);
    }

    expect(readFileSync(path.join(jsonDir, "test-data.types.ts"), "utf-8")).toBe(
      `${renderTypesModule()}\n`,
    );
  });
});
