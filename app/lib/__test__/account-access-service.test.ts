import { describe, expect, it } from "vitest";

import {
  createAccountAccessService,
  type PartyMembershipRecord,
} from "../account-access-service";
import {
  createFixturePlannerDataSource,
  type PlannerDataSnapshot,
} from "../planner-data-source";

function createService(snapshotOverrides: Partial<PlannerDataSnapshot> = {}) {
  const baseSnapshot: PlannerDataSnapshot = {
    locations: [],
    users: [
      {
        user_id: "1000000001",
        user_created: null,
        user_first_name: "Evan",
        user_last_name: "Adams",
        user_display_name: "Evan A.",
        user_role: "Party Planner",
        user_phone: null,
        user_email: "evan@example.com",
        user_last_active: null,
        user_status: "active",
      },
      {
        user_id: "1000000006",
        user_created: null,
        user_first_name: "Ray",
        user_last_name: "Huff",
        user_display_name: "Ray H.",
        user_role: "Party Goer",
        user_phone: null,
        user_email: "gearsmith.integrations@gmail.com",
        user_last_active: null,
        user_status: "active",
      },
    ],
    parties: [
      {
        party_id: "10000000001",
        party_creator: "1000000001",
        party_created_at: null,
        party_updated_at: null,
        party_name: "Evan's Graduation Party",
        party_type: "Celebration",
        party_status: "Pre-Party",
        party_start: null,
        party_end: null,
        party_location: null,
        party_headcount: null,
        party_tone: null,
        party_exposure: null,
        party_morality: null,
        party_budget: null,
        party_planner: "Evan A.",
        party_share_code: null,
      },
    ],
    itinerary: [],
    partyMemberships: [
      {
        party_id: "10000000001",
        user_id: "1000000001",
        party_role: "planner",
      },
      {
        party_id: "10000000001",
        user_id: "1000000006",
        party_role: "co_planner",
      },
    ],
  };

  return createAccountAccessService({
    dataSource: createFixturePlannerDataSource({
      ...baseSnapshot,
      ...snapshotOverrides,
    }),
  });
}

describe("account access service", () => {
  it("resolves Ray Huff from a verified email and returns party-specific memberships", async () => {
    const service = createService();

    const result = await service.getCurrentUserContext({
      identityEmail: "GEARSMITH.INTEGRATIONS@GMAIL.COM",
    });

    expect(result.status).toBe("authenticated");
    if (result.status !== "authenticated") {
      throw new Error("Expected authenticated result.");
    }

    expect(result.user.user_id).toBe("1000000006");
    expect(result.user.user_display_name).toBe("Ray H.");
    expect(result.memberships).toEqual<PartyMembershipRecord[]>([
      {
        party_id: "10000000001",
        user_id: "1000000006",
        party_role: "co_planner",
      },
    ]);
  });

  it("does not use the legacy global user role as party authorization truth", async () => {
    const service = createService({
      partyMemberships: [
        {
          party_id: "10000000001",
          user_id: "1000000006",
          party_role: "party_goer",
        },
      ],
    });

    const result = await service.getCurrentUserContext({
      identityEmail: "gearsmith.integrations@gmail.com",
    });

    expect(result.status).toBe("authenticated");
    if (result.status !== "authenticated") {
      throw new Error("Expected authenticated result.");
    }

    expect(result.user.user_role).toBe("Party Goer");
    expect(result.memberships[0]?.party_role).toBe("party_goer");
  });

  it("returns unmatched identity when a verified email has no matching app user", async () => {
    const service = createService();

    const result = await service.getCurrentUserContext({
      identityEmail: "missing@example.com",
    });

    expect(result).toEqual({
      status: "unmatched_identity",
      identityEmail: "missing@example.com",
    });
  });

  it("fails closed when duplicate users share the same email", async () => {
    const service = createService({
      users: [
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
        {
          user_id: "1000000099",
          user_created: null,
          user_first_name: "Other",
          user_last_name: "Ray",
          user_display_name: "Other Ray",
          user_role: "Party Goer",
          user_phone: null,
          user_email: "gearsmith.integrations@gmail.com",
          user_last_active: null,
          user_status: "active",
        },
      ],
      partyMemberships: [],
    });

    await expect(
      service.getCurrentUserContext({
        identityEmail: "gearsmith.integrations@gmail.com",
      }),
    ).rejects.toThrow("Duplicate user records found");
  });

  it("uses the development override only in development or test mode", async () => {
    const service = createService();

    const testResult = await service.getCurrentUserContext({
      identityEmail: null,
      devAccessEmail: "gearsmith.integrations@gmail.com",
      environmentName: "test",
    });

    expect(testResult.status).toBe("authenticated");

    const productionResult = await service.getCurrentUserContext({
      identityEmail: null,
      devAccessEmail: "gearsmith.integrations@gmail.com",
      environmentName: "production",
    });

    expect(productionResult).toEqual({ status: "unauthenticated" });
  });
});
