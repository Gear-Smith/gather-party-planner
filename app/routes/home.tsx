import type { Route } from "./+types/home";
import { redirect } from "react-router";
import {
  AccountAccessError,
  hasPlanningAccess,
} from "~/lib/account-access-service";
import { getPlannerServices } from "~/lib/planner-data-service";
import { WelcomePage } from "~/pages/welcome/page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gather: Party Planner" },
    { name: "description", content: "Welcome to Gather party planning app!" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  try {
    const access = await getPlannerServices().accountAccess.requireCurrentUserContext({
      request,
      cloudflareEnv: context.cloudflare.env,
      environmentName: import.meta.env.MODE,
      devAccessEmail: context.cloudflare.env.DEV_ACCESS_EMAIL,
    });

    return {
      message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
      currentUser: {
        displayName: access.user.user_display_name ?? access.user.user_email ?? "Unknown user",
        identityEmail: access.identityEmail,
        partyRole: access.memberships[0]?.party_role ?? "party_goer",
        canAccessPlanningTools: hasPlanningAccess(access.memberships),
        canAccessParticipantTools: true,
      },
    };
  } catch (error) {
    if (error instanceof AccountAccessError) {
      if (error.code === "unauthenticated") {
        throw redirect("/login");
      }

      if (error.code === "unmatched_identity") {
        throw redirect("/unauthorized");
      }
    }

    throw error;
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <WelcomePage
      message={loaderData.message}
      currentUser={loaderData.currentUser}
    />
  );
}
