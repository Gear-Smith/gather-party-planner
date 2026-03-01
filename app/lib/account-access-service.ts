import type { UserRecord } from "../../test_data/json/test-data.types";
import {
  resolvePrototypeIdentity,
  type ResolvePrototypeIdentityArgs,
} from "./cloudflare-access";
import type { PlannerDataSource } from "./planner-data-source";

export type PartyRole = "planner" | "co_planner" | "party_goer";

export interface PartyMembershipRecord {
  party_id: string;
  user_id: string;
  party_role: PartyRole;
}

export interface AuthenticatedPrototypeUser {
  identityEmail: string;
  user: UserRecord;
  memberships: PartyMembershipRecord[];
}

export type AccountAccessResult =
  | { status: "unauthenticated" }
  | { status: "unmatched_identity"; identityEmail: string }
  | ({
      status: "authenticated";
    } & AuthenticatedPrototypeUser);

export interface GetCurrentUserContextArgs {
  identityEmail: string | null;
  devAccessEmail?: string | null;
  environmentName?: string;
}

export interface AccountAccessService {
  getCurrentUserContext(
    args: GetCurrentUserContextArgs,
  ): Promise<AccountAccessResult>;
  requireCurrentUserContext(
    args: RequireCurrentUserContextArgs,
  ): Promise<AuthenticatedPrototypeUser>;
}

export interface CreateAccountAccessServiceOptions {
  dataSource: PlannerDataSource;
  resolveIdentity?: (
    args: ResolvePrototypeIdentityArgs,
  ) => Promise<string | null>;
}

export interface RequireCurrentUserContextArgs extends ResolvePrototypeIdentityArgs {
  devAccessEmail?: string | null;
}

export class AccountAccessError extends Error {
  constructor(
    public readonly code: "unauthenticated" | "unmatched_identity",
    public readonly identityEmail?: string,
  ) {
    super(code);
  }
}

export function createAccountAccessService({
  dataSource,
  resolveIdentity = resolvePrototypeIdentity,
}: CreateAccountAccessServiceOptions): AccountAccessService {
  return {
    async getCurrentUserContext({
      identityEmail,
      devAccessEmail,
      environmentName,
    }) {
      const normalizedEmail = resolveIdentityEmail({
        identityEmail,
        devAccessEmail,
        environmentName,
      });

      if (!normalizedEmail) {
        return { status: "unauthenticated" };
      }

      const [users, memberships] = await Promise.all([
        dataSource.readTable("users"),
        dataSource.readTable("partyMemberships"),
      ]);

      const matchingUsers = users.filter(
        (user) => normalizeEmail(user.user_email) === normalizedEmail,
      );

      if (matchingUsers.length > 1) {
        throw new Error(`Duplicate user records found for email: ${normalizedEmail}`);
      }

      const user = matchingUsers[0];
      if (!user) {
        return {
          status: "unmatched_identity",
          identityEmail: normalizedEmail,
        };
      }

      const resolvedMemberships = memberships.filter(
        (membership) => membership.user_id === user.user_id,
      );

      if (resolvedMemberships.length === 0) {
        return {
          status: "unmatched_identity",
          identityEmail: normalizedEmail,
        };
      }

      return {
        status: "authenticated",
        identityEmail: normalizedEmail,
        user,
        memberships: resolvedMemberships,
      };
    },
    async requireCurrentUserContext({
      request,
      cloudflareEnv,
      environmentName,
      devAccessEmail,
    }) {
      const identityEmail = await resolveIdentity({
        request,
        cloudflareEnv,
        environmentName,
        devAccessEmail,
      });
      const result = await this.getCurrentUserContext({
        identityEmail,
        devAccessEmail,
        environmentName,
      });

      if (result.status === "unauthenticated") {
        throw new AccountAccessError("unauthenticated");
      }

      if (result.status === "unmatched_identity") {
        throw new AccountAccessError("unmatched_identity", result.identityEmail);
      }

      return result;
    },
  };
}

function resolveIdentityEmail({
  identityEmail,
  devAccessEmail,
  environmentName,
}: GetCurrentUserContextArgs): string | null {
  const normalizedIdentityEmail = normalizeEmail(identityEmail);
  if (normalizedIdentityEmail) {
    return normalizedIdentityEmail;
  }

  const allowDevOverride =
    environmentName === "development" || environmentName === "test";
  return allowDevOverride ? normalizeEmail(devAccessEmail) : null;
}

function normalizeEmail(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "" ? null : normalized;
}
