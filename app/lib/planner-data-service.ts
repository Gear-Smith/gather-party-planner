import {
  createAccountAccessService,
  type AccountAccessService,
} from "./account-access-service";
import {
  createPartyParticipationService,
  type PartyParticipationService,
} from "./party-participation-service";
import {
  createFixturePlannerDataSource,
  type PlannerDataSource,
} from "./planner-data-source";

export interface PlannerServices {
  // Bootstrap-only escape hatch for future service composition.
  // Route and component code should depend on story-level service methods added
  // to this module over time, not on direct table reads.
  data: PlannerDataSource;
  accountAccess: AccountAccessService;
  partyParticipation: PartyParticipationService;
}

export interface CreatePlannerServicesOptions {
  dataSource?: PlannerDataSource;
}

const defaultPlannerServices = createPlannerServices({
  dataSource: createFixturePlannerDataSource(),
});

export function createPlannerServices(
  options: CreatePlannerServicesOptions = {},
): PlannerServices {
  const dataSource = options.dataSource ?? createFixturePlannerDataSource();

  return {
    data: dataSource,
    accountAccess: createAccountAccessService({ dataSource }),
    partyParticipation: createPartyParticipationService({ dataSource }),
  };
}

export function getPlannerServices(): PlannerServices {
  return defaultPlannerServices;
}
