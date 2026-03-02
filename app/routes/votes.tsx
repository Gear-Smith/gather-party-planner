import type { Route } from "./+types/votes";
import { redirect } from "react-router";
import { AccountAccessError } from "~/lib/account-access-service";
import { getPlannerServices } from "~/lib/planner-data-service";

export async function loader({ context, request }: Route.LoaderArgs) {
  try {
    return await getPlannerServices().partyParticipation.loadVotingContext({
      request,
      cloudflareEnv: context.cloudflare.env,
      environmentName: import.meta.env.MODE,
      devAccessEmail: context.cloudflare.env.DEV_ACCESS_EMAIL,
    });
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

export default function VotesRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Party Voting</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Voting access is enabled for your assigned role in this prototype.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Party: {loaderData.party.party_name}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Share code: {loaderData.party.party_share_code}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Full voting mechanics will be implemented in the dedicated voting story.
        </p>
      </div>
    </main>
  );
}
