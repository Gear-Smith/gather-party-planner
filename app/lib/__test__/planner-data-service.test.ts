import { describe, expect, it, vi } from "vitest";

import {
  createPlannerServices,
  getPlannerServices,
} from "../planner-data-service";
import {
  createFixturePlannerDataSource,
  type PlannerDataSnapshot,
} from "../planner-data-source";

describe("planner data service foundation", () => {
  it("allows service-layer composition through data-source injection", async () => {
    const customSnapshot: PlannerDataSnapshot = {
      locations: [],
      users: [],
      parties: [
        {
          party_id: "custom-party",
          party_creator: "custom-user",
          party_created_at: null,
          party_updated_at: null,
          party_name: "Custom Party",
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
          party_planner: null,
          party_share_code: null,
        },
      ],
      itinerary: [],
    };
    const customSource = createFixturePlannerDataSource(customSnapshot);
    const readTableSpy = vi.spyOn(customSource, "readTable");

    const services = createPlannerServices({ dataSource: customSource });
    const parties = await services.data.readTable("parties");

    expect(parties).toHaveLength(1);
    expect(parties[0]?.party_id).toBe("custom-party");
    expect(readTableSpy).toHaveBeenCalledWith("parties");
  });

  it("defaults the service container to the fixture-backed source", async () => {
    const services = getPlannerServices();
    const parties = await services.data.readTable("parties");

    expect(parties[0]?.party_id).toBe("10000000001");
  });

  it("keeps the service module separate from the fixture-backed infrastructure export", async () => {
    const serviceModule = await import("../planner-data-service");

    expect(serviceModule).not.toHaveProperty("createFixturePlannerDataSource");
  });
});
