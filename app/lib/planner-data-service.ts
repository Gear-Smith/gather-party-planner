import itineraryFixtures from "../../test_data/json/itinerary.json";
import locationsFixtures from "../../test_data/json/locations.json";
import partiesFixtures from "../../test_data/json/parties.json";
import usersFixtures from "../../test_data/json/users.json";
import type {
  ItineraryRecord,
  LocationRecord,
  PartyRecord,
  UserRecord,
} from "../../test_data/json/test-data.types";

export const PLANNER_TABLE_NAMES = [
  "locations",
  "users",
  "parties",
  "itinerary",
] as const;

export type PlannerTableName = (typeof PLANNER_TABLE_NAMES)[number];

export interface PlannerTableRecordMap {
  locations: LocationRecord;
  users: UserRecord;
  parties: PartyRecord;
  itinerary: ItineraryRecord;
}

export type PlannerDataSnapshot = {
  [TableName in PlannerTableName]: PlannerTableRecordMap[TableName][];
};

export interface PlannerDataSource {
  readTable<TableName extends PlannerTableName>(
    tableName: TableName,
  ): Promise<PlannerTableRecordMap[TableName][]>;
}

export interface PlannerServices {
  data: PlannerDataSource;
}

export interface CreatePlannerServicesOptions {
  dataSource?: PlannerDataSource;
}

const fixtureSnapshot: PlannerDataSnapshot = {
  locations: locationsFixtures as LocationRecord[],
  users: usersFixtures as UserRecord[],
  parties: partiesFixtures as PartyRecord[],
  itinerary: itineraryFixtures as ItineraryRecord[],
};

const defaultPlannerServices = createPlannerServices({
  dataSource: createFixturePlannerDataSource(),
});

export function createFixturePlannerDataSource(
  snapshot: PlannerDataSnapshot = fixtureSnapshot,
): PlannerDataSource {
  return {
    async readTable<TableName extends PlannerTableName>(tableName: TableName) {
      return cloneRecords(snapshot[tableName]);
    },
  };
}

export function createPlannerServices(
  options: CreatePlannerServicesOptions = {},
): PlannerServices {
  return {
    data: options.dataSource ?? createFixturePlannerDataSource(),
  };
}

export function getPlannerServices(): PlannerServices {
  return defaultPlannerServices;
}

function cloneRecords<RecordType>(records: RecordType[]): RecordType[] {
  return structuredClone(records);
}
