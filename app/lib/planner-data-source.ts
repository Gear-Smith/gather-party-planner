import itineraryFixtures from "../../test_data/json/itinerary.json";
import locationsFixtures from "../../test_data/json/locations.json";
import partiesFixtures from "../../test_data/json/parties.json";
import usersFixtures from "../../test_data/json/users.json";
import partyMembershipFixtures from "../../test_data/manual/party-memberships.json";
import type {
  ItineraryRecord,
  LocationRecord,
  PartyRecord,
  UserRecord,
} from "../../test_data/json/test-data.types";
import type { PartyMembershipRecord } from "./account-access-service";

// Infrastructure-only data access. App-facing code should depend on
// planner-data-service.ts rather than importing this module directly.
export const PLANNER_TABLE_NAMES = [
  "locations",
  "users",
  "parties",
  "itinerary",
  "partyMemberships",
] as const;

export type PlannerTableName = (typeof PLANNER_TABLE_NAMES)[number];

export interface PlannerTableRecordMap {
  locations: LocationRecord;
  users: UserRecord;
  parties: PartyRecord;
  itinerary: ItineraryRecord;
  partyMemberships: PartyMembershipRecord;
}

export type PlannerDataSnapshot = {
  [TableName in PlannerTableName]: PlannerTableRecordMap[TableName][];
};

export interface PlannerDataSource {
  readTable<TableName extends PlannerTableName>(
    tableName: TableName,
  ): Promise<PlannerTableRecordMap[TableName][]>;
}

const fixtureSnapshot: PlannerDataSnapshot = {
  locations: locationsFixtures as LocationRecord[],
  users: usersFixtures as UserRecord[],
  parties: partiesFixtures as PartyRecord[],
  itinerary: itineraryFixtures as ItineraryRecord[],
  partyMemberships: partyMembershipFixtures as PartyMembershipRecord[],
};

export function createFixturePlannerDataSource(
  snapshot: PlannerDataSnapshot = fixtureSnapshot,
): PlannerDataSource {
  return {
    async readTable<TableName extends PlannerTableName>(tableName: TableName) {
      return structuredClone(snapshot[tableName]);
    },
  };
}
