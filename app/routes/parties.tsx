import type { Route } from "./+types/parties";
import { redirect } from "react-router";
import { AccountAccessError } from "~/lib/account-access-service";
import { getPlannerServices } from "~/lib/planner-data-service";

export async function loader({ context, request }: Route.LoaderArgs) {
  try {
    const access = await getPlannerServices().accountAccess.requirePlanningAccess({
      request,
      cloudflareEnv: context.cloudflare.env,
      environmentName: import.meta.env.MODE,
      devAccessEmail: context.cloudflare.env.DEV_ACCESS_EMAIL,
    });

    return {
      currentUser: {
        displayName: access.user.user_display_name ?? access.user.user_email ?? "Unknown user",
        identityEmail: access.identityEmail,
        partyRole: access.planningMemberships[0]?.party_role ?? "co_planner",
        canAccessPlanningTools: true,
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

      if (error.code === "forbidden") {
        throw redirect("/forbidden");
      }
    }

    throw error;
  }
}

export default function PartiesRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Edit your parties</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Planner tools are enabled for your role in this prototype.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Signed in as {loaderData.currentUser.displayName} (
          {loaderData.currentUser.partyRole.replace("_", "-")}).
        </p>
      </div>
    </main>
  );
}
