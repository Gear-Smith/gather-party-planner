import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WelcomePage } from "../page";

describe("Welcome navigation choices", () => {
  it("shows actionable Open Party and New Party controls for co-planners", () => {
    render(
      <WelcomePage
        message="test message"
        currentUser={{
          displayName: "Ray H.",
          identityEmail: "gearsmith.integrations@gmail.com",
          partyRole: "co_planner",
          canAccessPlanningTools: true,
        }}
      />,
    );

    const openPartyControl =
      screen.queryByRole("button", { name: "Edit a Party" }) ??
      screen.queryByRole("link", { name: "Edit a Party" });
    const newPartyControl =
      screen.queryByRole("button", { name: "Plan New Party" }) ??
      screen.queryByRole("link", { name: "Plan New Party" });

    expect(openPartyControl).toBeInTheDocument();
    expect(newPartyControl).toBeInTheDocument();
    expect(openPartyControl).toHaveAttribute("href", "/parties");
    expect(newPartyControl).toHaveAttribute("href", "/parties/new");
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
        }}
      />,
    );

    expect(
      screen.getByText(/planning tools are limited to planners and co-planners/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plan New Party" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Edit a Party" })).toBeDisabled();
  });
});
