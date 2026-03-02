import type { Route } from "./+types/dashboard";
import { redirect } from "react-router";
import { AccountAccessError } from "~/lib/account-access-service";
import { getPlannerServices } from "~/lib/planner-data-service";

export async function loader({ context, request }: Route.LoaderArgs) {
  try {
    return await getPlannerServices().partyParticipation.loadDashboardContext({
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

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Party Dashboard</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Welcome, {loaderData.currentUser.displayName}. You can view the current
          party plan for {loaderData.party.party_name}.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p>Location: {loaderData.party.party_location}</p>
          <p>Status: {loaderData.party.party_status}</p>
          <p>Start: {loaderData.party.party_start}</p>
          <p>Share code: {loaderData.party.party_share_code}</p>
        </div>
        <div className="mt-6">
          <h2 className="font-medium">Upcoming itinerary</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {loaderData.itineraryPreview.map((item) => (
              <li key={item.itin_id} className="rounded-md border p-3">
                <p className="font-medium">{item.itin_title}</p>
                <p className="text-muted-foreground">{item.itin_start}</p>
                <p className="text-muted-foreground">{item.itin_location}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
