import {
  createFixturePlannerDataSource,
  type PlannerDataSource,
} from "./planner-data-source";

export interface PlannerServices {
  // Bootstrap-only escape hatch for future service composition.
  // Route and component code should depend on story-level service methods added
  // to this module over time, not on direct table reads.
  data: PlannerDataSource;
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
  return {
    data: options.dataSource ?? createFixturePlannerDataSource(),
  };
}

export function getPlannerServices(): PlannerServices {
  return defaultPlannerServices;
}
