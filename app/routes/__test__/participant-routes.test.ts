import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardRoute, { loader as dashboardLoader } from "../dashboard";
import VotesRoute, { loader as votesLoader } from "../votes";

function createLoaderArgs(devAccessEmail: string) {
  return {
    request: new Request("https://example.com/"),
    context: {
      cloudflare: {
        env: {
          VALUE_FROM_CLOUDFLARE: "x",
          CF_ACCESS_AUD: "",
          CF_ACCESS_TEAM_DOMAIN: "",
          DEV_ACCESS_EMAIL: devAccessEmail,
        },
      },
    },
  } as never;
}

describe("participant routes", () => {
  it("lets a party goer open the dashboard route", async () => {
    const result = await dashboardLoader(createLoaderArgs("bj9627@utexas.edu"));

    expect(result.currentUser.partyRole).toBe("party_goer");
    expect(result.party.party_name).toBe("Evan's Graduation Party");
  });

  it("lets a party goer open the voting route", async () => {
    const result = await votesLoader(createLoaderArgs("bj9627@utexas.edu"));

    expect(result.currentUser.partyRole).toBe("party_goer");
    expect(result.party.party_share_code).toBe("123456789ABC");
  });

  it("renders dashboard details without planner editing controls", () => {
    render(
      createElement(
        DashboardRoute,
        {
          loaderData: {
            currentUser: {
              displayName: "Brandon J.",
              identityEmail: "bj9627@utexas.edu",
              partyRole: "party_goer",
              canAccessPlanningTools: false,
              canAccessParticipantTools: true,
            },
            party: {
              party_id: "10000000001",
              party_name: "Evan's Graduation Party",
              party_status: "Pre-Party",
              party_share_code: "123456789ABC",
              party_location: "Austin TX",
              party_start: "2026-05-09T10:00:00Z",
            },
            itineraryPreview: [
              {
                itin_id: "20000000001",
                itin_title: "Arrival Window",
                itin_start: "2026-05-07T09:30:00Z",
                itin_location: "Austin-Bergstrom International Airport (AUS)",
              },
            ],
          },
        } as never,
      ),
    );

    expect(screen.getByRole("heading", { name: "Party Dashboard" })).toBeInTheDocument();
    expect(screen.getByText(/Evan's Graduation Party/)).toBeInTheDocument();
    expect(screen.queryByText(/Edit a Party/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Plan New Party/i)).not.toBeInTheDocument();
  });

  it("renders voting access details for party goers", () => {
    render(
      createElement(
        VotesRoute,
        {
          loaderData: {
            currentUser: {
              displayName: "Brandon J.",
              identityEmail: "bj9627@utexas.edu",
              partyRole: "party_goer",
              canAccessPlanningTools: false,
              canAccessParticipantTools: true,
            },
            party: {
              party_id: "10000000001",
              party_name: "Evan's Graduation Party",
              party_status: "Pre-Party",
              party_share_code: "123456789ABC",
            },
          },
        } as never,
      ),
    );

    expect(screen.getByRole("heading", { name: "Party Voting" })).toBeInTheDocument();
    expect(screen.getAllByText(/123456789ABC/)).not.toHaveLength(0);
    expect(screen.getByText(/voting access is enabled for your assigned role/i)).toBeInTheDocument();
  });
});
