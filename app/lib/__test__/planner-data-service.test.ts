import { describe, expect, it } from "vitest";

import {
  getDefaultPartyDetail,
  getFixturePlannerDataService,
} from "../planner-data-service";

describe("fixture planner data service", () => {
  const service = getFixturePlannerDataService();

  it("returns the fixture collections with stable record counts", async () => {
    await expect(service.listLocations()).resolves.toHaveLength(257);
    await expect(service.listUsers()).resolves.toHaveLength(6);
    await expect(service.listParties()).resolves.toHaveLength(1);
    await expect(service.listItineraryEntries()).resolves.toHaveLength(53);
  });

  it("returns defensive copies instead of mutable shared references", async () => {
    const firstRead = await service.listLocations();
    const secondRead = await service.listLocations();

    expect(firstRead).toEqual(secondRead);
    expect(firstRead).not.toBe(secondRead);

    firstRead[0]!.location_name = "Mutated";

    const thirdRead = await service.listLocations();

    expect(thirdRead[0]?.location_name).toBe("The Driskill");
  });

  it("can resolve a party detail aggregate for upcoming frontend screens", async () => {
    const detail = await service.getPartyDetail("10000000001");

    expect(detail).toMatchObject({
      party: {
        party_id: "10000000001",
        party_name: "Evan's Graduation Party",
      },
      creator: {
        user_id: "1000000001",
        user_display_name: "Evan A.",
      },
    });
    expect(detail?.itinerary).toHaveLength(53);
  });

  it("returns null when a requested record does not exist", async () => {
    await expect(service.getLocationById("missing")).resolves.toBeNull();
    await expect(service.getUserById("missing")).resolves.toBeNull();
    await expect(service.getPartyById("missing")).resolves.toBeNull();
    await expect(service.getPartyDetail("missing")).resolves.toBeNull();
  });

  it("provides a default party aggregate for bootstrapping frontend flows", async () => {
    const detail = await getDefaultPartyDetail();

    expect(detail?.party.party_id).toBe("10000000001");
    expect(detail?.itinerary[0]?.party_id).toBe("10000000001");
  });
});
