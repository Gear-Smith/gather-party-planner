import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PartiesRoute, { loader as partiesLoader } from "../parties";
import PlanNewPartyRoute, { loader as newPartyLoader } from "../parties-new";

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

describe("planner-only planning routes", () => {
  it("lets co-planners open the new-party planning route", async () => {
    const result = await newPartyLoader(
      createLoaderArgs("gearsmith.integrations@gmail.com"),
    );

    expect(result.currentUser.partyRole).toBe("co_planner");
    expect(result.currentUser.canAccessPlanningTools).toBe(true);
  });

  it("redirects party goers away from planner routes", async () => {
    try {
      await newPartyLoader(createLoaderArgs("bj9627@utexas.edu"));
      throw new Error("Expected loader to redirect.");
    } catch (error) {
      const response = error as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/forbidden");
    }
  });

  it("renders the planner tool placeholders for authorized users", () => {
    render(
      createElement(
        PartiesRoute,
        {
          loaderData: {
            currentUser: {
              displayName: "Ray H.",
              identityEmail: "gearsmith.integrations@gmail.com",
              partyRole: "co_planner",
              canAccessPlanningTools: true,
            },
          },
        } as never,
      ),
    );

    expect(screen.getByRole("heading", { name: "Edit your parties" })).toBeInTheDocument();
    expect(screen.getByText(/planner tools are enabled for your role/i)).toBeInTheDocument();
  });

  it("lets co-planners open the existing-party planning route", async () => {
    const result = await partiesLoader(
      createLoaderArgs("gearsmith.integrations@gmail.com"),
    );

    expect(result.currentUser.partyRole).toBe("co_planner");
    expect(result.currentUser.canAccessPlanningTools).toBe(true);
  });
});
