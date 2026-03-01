import { describe, expect, it, vi } from "vitest";

import {
  createFixturePlannerDataSource,
  createPlannerServices,
  getPlannerServices,
  PLANNER_TABLE_NAMES,
  type PlannerDataSnapshot,
} from "../planner-data-service";

describe("planner data service foundation", () => {
  it("exposes the supported table names for future slice work", () => {
    expect(PLANNER_TABLE_NAMES).toEqual([
      "locations",
      "users",
      "parties",
      "itinerary",
    ]);
  });

  it("reads fixture-backed tables through a generic typed data source", async () => {
    const dataSource = createFixturePlannerDataSource();

    await expect(dataSource.readTable("locations")).resolves.toHaveLength(257);
    await expect(dataSource.readTable("users")).resolves.toHaveLength(6);
    await expect(dataSource.readTable("parties")).resolves.toHaveLength(1);
    await expect(dataSource.readTable("itinerary")).resolves.toHaveLength(53);
  });

  it("returns defensive copies so consumers cannot mutate shared fixture state", async () => {
    const dataSource = createFixturePlannerDataSource();
    const firstRead = await dataSource.readTable("locations");
    const secondRead = await dataSource.readTable("locations");

    expect(firstRead).toEqual(secondRead);
    expect(firstRead).not.toBe(secondRead);

    firstRead[0]!.location_name = "Mutated";

    const thirdRead = await dataSource.readTable("locations");

    expect(thirdRead[0]?.location_name).toBe("The Driskill");
  });

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
});
