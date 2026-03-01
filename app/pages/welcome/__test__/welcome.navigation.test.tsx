import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WelcomePage } from "../page";

describe("Welcome navigation choices", () => {
  it("shows actionable Open Party and New Party controls", () => {
    render(
      <WelcomePage
        message="test message"
        currentUser={{
          displayName: "Ray H.",
          identityEmail: "gearsmith.integrations@gmail.com",
          partyRole: "co_planner",
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
    expect(openPartyControl).toBeEnabled();
    expect(newPartyControl).toBeEnabled();
  });
});
