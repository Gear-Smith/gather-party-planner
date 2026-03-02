import { describe, expect, it } from "vitest";

import { createPartyParticipationService } from "../party-participation-service";
import {
  createFixturePlannerDataSource,
  type PlannerDataSnapshot,
} from "../planner-data-source";

function createService(snapshotOverrides: Partial<PlannerDataSnapshot> = {}) {
  const baseSnapshot: PlannerDataSnapshot = {
    locations: [],
    users: [
      {
        user_id: "1000000002",
        user_created: null,
        user_first_name: "Brandon",
        user_last_name: "Jennings",
        user_display_name: "Brandon J.",
        user_role: "Party Goer",
        user_phone: null,
        user_email: "bj9627@utexas.edu",
        user_last_active: null,
        user_status: "active",
      },
      {
        user_id: "1000000006",
        user_created: null,
        user_first_name: "Ray",
        user_last_name: "Huff",
        user_display_name: "Ray H.",
        user_role: "Co-Planner",
        user_phone: null,
        user_email: "gearsmith.integrations@gmail.com",
        user_last_active: null,
        user_status: "active",
      },
    ],
    parties: [
      {
        party_id: "10000000001",
        party_creator: "1000000006",
        party_created_at: null,
        party_updated_at: null,
        party_name: "Evan's Graduation Party",
        party_type: "Celebration",
        party_status: "Pre-Party",
        party_start: "2026-05-09T10:00:00Z",
        party_end: "2026-05-09T23:00:00Z",
        party_location: "Austin TX",
        party_headcount: 6,
        party_tone: 2,
        party_exposure: 3,
        party_morality: 3,
        party_budget: 3,
        party_planner: "Evan A.",
        party_share_code: "123456789ABC",
      },
    ],
    itinerary: [
      {
        itin_id: "20000000001",
        party_id: "10000000001",
        itin_title: "Arrival Window",
        itin_start: "2026-05-07T09:30:00Z",
        itin_end: "2026-05-07T10:30:00Z",
        itin_location: "Austin-Bergstrom International Airport (AUS)",
        itin_roster: "Brandon J.",
      },
      {
        itin_id: "20000000002",
        party_id: "10000000001",
        itin_title: "Group Check-In",
        itin_start: "2026-05-07T16:30:00Z",
        itin_end: "2026-05-07T17:15:00Z",
        itin_location: "The Driskill",
        itin_roster: "Brandon J., Ray H.",
      },
    ],
    partyMemberships: [
      {
        party_id: "10000000001",
        user_id: "1000000002",
        party_role: "party_goer",
      },
      {
        party_id: "10000000001",
        user_id: "1000000006",
        party_role: "co_planner",
      },
    ],
  };

  return createPartyParticipationService({
    dataSource: createFixturePlannerDataSource({
      ...baseSnapshot,
      ...snapshotOverrides,
    }),
  });
}

describe("party participation service", () => {
  it("loads dashboard context for a party goer", async () => {
    const service = createService();

    const result = await service.loadDashboardContext({
      request: new Request("https://example.com/dashboard"),
      cloudflareEnv: {
        CF_ACCESS_AUD: "",
        CF_ACCESS_TEAM_DOMAIN: "",
      },
      environmentName: "test",
      devAccessEmail: "bj9627@utexas.edu",
    });

    expect(result.currentUser.partyRole).toBe("party_goer");
    expect(result.party.party_name).toBe("Evan's Graduation Party");
    expect(result.itineraryPreview).toHaveLength(2);
  });

  it("loads voting access for a party goer without granting planning rights", async () => {
    const service = createService();

    const result = await service.loadVotingContext({
      request: new Request("https://example.com/votes"),
      cloudflareEnv: {
        CF_ACCESS_AUD: "",
        CF_ACCESS_TEAM_DOMAIN: "",
      },
      environmentName: "test",
      devAccessEmail: "bj9627@utexas.edu",
    });

    expect(result.currentUser.partyRole).toBe("party_goer");
    expect(result.currentUser.canAccessPlanningTools).toBe(false);
    expect(result.party.party_share_code).toBe("123456789ABC");
  });
});
