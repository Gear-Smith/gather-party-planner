import type { ItineraryRecord, PartyRecord } from "../../test_data/json/test-data.types";
import {
  createAccountAccessService,
  hasPlanningAccess,
  type AccountAccessService,
  type PartyRole,
  type RequireCurrentUserContextArgs,
} from "./account-access-service";
import type { PlannerDataSource } from "./planner-data-source";

export interface ParticipantCurrentUser {
  displayName: string;
  identityEmail: string;
  partyRole: PartyRole;
  canAccessPlanningTools: boolean;
  canAccessParticipantTools: true;
}

export interface ParticipantDashboardContext {
  currentUser: ParticipantCurrentUser;
  party: Pick<
    PartyRecord,
    | "party_id"
    | "party_name"
    | "party_status"
    | "party_share_code"
    | "party_location"
    | "party_start"
  >;
  itineraryPreview: Pick<
    ItineraryRecord,
    "itin_id" | "itin_title" | "itin_start" | "itin_location"
  >[];
}

export interface ParticipantVotingContext {
  currentUser: ParticipantCurrentUser;
  party: Pick<
    PartyRecord,
    "party_id" | "party_name" | "party_status" | "party_share_code"
  >;
}

export interface PartyParticipationService {
  loadDashboardContext(
    args: RequireCurrentUserContextArgs,
  ): Promise<ParticipantDashboardContext>;
  loadVotingContext(
    args: RequireCurrentUserContextArgs,
  ): Promise<ParticipantVotingContext>;
}

export interface CreatePartyParticipationServiceOptions {
  dataSource: PlannerDataSource;
  accountAccessService?: AccountAccessService;
}

export function createPartyParticipationService({
  dataSource,
  accountAccessService = createAccountAccessService({ dataSource }),
}: CreatePartyParticipationServiceOptions): PartyParticipationService {
  return {
    async loadDashboardContext(args) {
      const participantParty = await loadParticipantPartyContext({
        args,
        dataSource,
        accountAccessService,
      });

      const itinerary = await dataSource.readTable("itinerary");
      const itineraryPreview = itinerary
        .filter((item) => item.party_id === participantParty.party.party_id)
        .slice(0, 3)
        .map((item) => ({
          itin_id: item.itin_id,
          itin_title: item.itin_title,
          itin_start: item.itin_start,
          itin_location: item.itin_location,
        }));

      return {
        currentUser: participantParty.currentUser,
        party: {
          party_id: participantParty.party.party_id,
          party_name: participantParty.party.party_name,
          party_status: participantParty.party.party_status,
          party_share_code: participantParty.party.party_share_code,
          party_location: participantParty.party.party_location,
          party_start: participantParty.party.party_start,
        },
        itineraryPreview,
      };
    },
    async loadVotingContext(args) {
      const participantParty = await loadParticipantPartyContext({
        args,
        dataSource,
        accountAccessService,
      });

      return {
        currentUser: participantParty.currentUser,
        party: {
          party_id: participantParty.party.party_id,
          party_name: participantParty.party.party_name,
          party_status: participantParty.party.party_status,
          party_share_code: participantParty.party.party_share_code,
        },
      };
    },
  };
}

async function loadParticipantPartyContext({
  args,
  dataSource,
  accountAccessService,
}: {
  args: RequireCurrentUserContextArgs;
  dataSource: PlannerDataSource;
  accountAccessService: AccountAccessService;
}) {
  const access = await accountAccessService.requireCurrentUserContext(args);
  const primaryMembership = access.memberships[0];

  if (!primaryMembership) {
    throw new Error("Expected at least one party membership for participant access.");
  }

  const parties = await dataSource.readTable("parties");
  const party = parties.find((item) => item.party_id === primaryMembership.party_id);

  if (!party) {
    throw new Error(`Missing party record for membership: ${primaryMembership.party_id}`);
  }

  return {
    currentUser: {
      displayName:
        access.user.user_display_name ?? access.user.user_email ?? "Unknown user",
      identityEmail: access.identityEmail,
      partyRole: primaryMembership.party_role,
      canAccessPlanningTools: hasPlanningAccess(access.memberships),
      canAccessParticipantTools: true as const,
    },
    party,
  };
}
