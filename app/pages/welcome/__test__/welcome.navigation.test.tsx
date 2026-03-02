import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WelcomePage } from "../page";

afterEach(() => {
  cleanup();
});

describe("Welcome navigation choices", () => {
  it("shows actionable planner and participant controls for co-planners", () => {
    render(
      <WelcomePage
        message="test message"
        currentUser={{
          displayName: "Ray H.",
          identityEmail: "gearsmith.integrations@gmail.com",
          partyRole: "co_planner",
          canAccessPlanningTools: true,
          canAccessParticipantTools: true,
        }}
      />,
    );

    const openPartyControl =
      screen.queryByRole("button", { name: "Edit a Party" }) ??
      screen.queryByRole("link", { name: "Edit a Party" });
    const newPartyControl =
      screen.queryByRole("button", { name: "Plan New Party" }) ??
      screen.queryByRole("link", { name: "Plan New Party" });
    const dashboardControl =
      screen.queryByRole("button", { name: "View Party Dashboard" }) ??
      screen.queryByRole("link", { name: "View Party Dashboard" });
    const votingControl =
      screen.queryByRole("button", { name: "Vote on Party Decisions" }) ??
      screen.queryByRole("link", { name: "Vote on Party Decisions" });

    expect(openPartyControl).toBeInTheDocument();
    expect(newPartyControl).toBeInTheDocument();
    expect(dashboardControl).toBeInTheDocument();
    expect(votingControl).toBeInTheDocument();
    expect(openPartyControl).toHaveAttribute("href", "/parties");
    expect(newPartyControl).toHaveAttribute("href", "/parties/new");
    expect(dashboardControl).toHaveAttribute("href", "/dashboard");
    expect(votingControl).toHaveAttribute("href", "/votes");
  });

  it("withholds planning tool access from party goers on the welcome screen", () => {
    render(
      <WelcomePage
        message="test message"
        currentUser={{
          displayName: "Taylor P.",
          identityEmail: "taylor@example.com",
          partyRole: "party_goer",
          canAccessPlanningTools: false,
          canAccessParticipantTools: true,
        }}
      />,
    );

    const dashboardControl =
      screen.queryByRole("button", { name: "View Party Dashboard" }) ??
      screen.queryByRole("link", { name: "View Party Dashboard" });
    const votingControl =
      screen.queryByRole("button", { name: "Vote on Party Decisions" }) ??
      screen.queryByRole("link", { name: "Vote on Party Decisions" });

    expect(dashboardControl).toBeInTheDocument();
    expect(votingControl).toBeInTheDocument();
    expect(dashboardControl).toHaveAttribute("href", "/dashboard");
    expect(votingControl).toHaveAttribute("href", "/votes");
    expect(
      screen.getByText(/planning tools are limited to planners and co-planners/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plan New Party" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit a Party" })).toBeDisabled();
  });
});
