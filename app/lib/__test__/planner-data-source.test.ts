import { describe, expect, it } from "vitest";

import {
  createFixturePlannerDataSource,
  PLANNER_TABLE_NAMES,
} from "../planner-data-source";

describe("planner data source foundation", () => {
  it("exposes the supported table names for future slice work", () => {
    expect(PLANNER_TABLE_NAMES).toEqual([
      "locations",
      "users",
      "parties",
      "itinerary",
      "partyMemberships",
    ]);
  });

  it("reads fixture-backed tables through a generic typed data source", async () => {
    const dataSource = createFixturePlannerDataSource();

    await expect(dataSource.readTable("locations")).resolves.toHaveLength(257);
    await expect(dataSource.readTable("users")).resolves.toHaveLength(6);
    await expect(dataSource.readTable("parties")).resolves.toHaveLength(1);
    await expect(dataSource.readTable("itinerary")).resolves.toHaveLength(53);
    await expect(dataSource.readTable("partyMemberships")).resolves.toHaveLength(6);
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
});
