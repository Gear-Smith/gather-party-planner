import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import Home, { loader, meta } from "../home";

describe("home route", () => {
  it("returns the expected metadata", () => {
    expect(meta({} as never)).toEqual([
      { title: "Gather: Party Planner" },
      { name: "description", content: "Welcome to Gather party planning app!" },
    ]);
  });

  it("redirects to login when no approved identity is present", async () => {
    try {
      await loader({
        request: new Request("https://example.com/"),
        context: {
          cloudflare: {
            env: {
              VALUE_FROM_CLOUDFLARE: "x",
              CF_ACCESS_AUD: "",
              CF_ACCESS_TEAM_DOMAIN: "",
              DEV_ACCESS_EMAIL: "",
            },
          },
        },
      } as never);
      throw new Error("Expected loader to redirect.");
    } catch (error) {
      const response = error as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/login");
    }
  });

  it("redirects to unauthorized when the approved identity is not assigned in app data", async () => {
    try {
      await loader({
        request: new Request("https://example.com/"),
        context: {
          cloudflare: {
            env: {
              VALUE_FROM_CLOUDFLARE: "x",
              CF_ACCESS_AUD: "",
              CF_ACCESS_TEAM_DOMAIN: "",
              DEV_ACCESS_EMAIL: "missing@example.com",
            },
          },
        },
      } as never);
      throw new Error("Expected loader to redirect.");
    } catch (error) {
      const response = error as Response;
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/unauthorized");
    }
  });

  it("returns authenticated user context for Ray in local development mode", async () => {
    const result = await loader({
      request: new Request("https://example.com/"),
      context: {
        cloudflare: {
          env: {
            VALUE_FROM_CLOUDFLARE: "x",
            CF_ACCESS_AUD: "",
            CF_ACCESS_TEAM_DOMAIN: "",
            DEV_ACCESS_EMAIL: "gearsmith.integrations@gmail.com",
          },
        },
      },
    } as never);

    expect(result).toEqual({
      message: "x",
      currentUser: {
        displayName: "Ray H.",
        identityEmail: "gearsmith.integrations@gmail.com",
        partyRole: "co_planner",
        canAccessPlanningTools: true,
        canAccessParticipantTools: true,
      },
    });
  });

  it("renders authenticated home navigation choices and user context", () => {
    render(
      createElement(
        Home,
        {
          loaderData: {
            message: "x",
            currentUser: {
              displayName: "Ray H.",
              identityEmail: "gearsmith.integrations@gmail.com",
              partyRole: "co_planner",
              canAccessPlanningTools: true,
              canAccessParticipantTools: true,
            },
          },
        } as never,
      ),
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
    expect(screen.getByText(/Signed in as Ray H\./)).toBeInTheDocument();
    expect(screen.getByText(/Co-Planner/)).toBeInTheDocument();
  });
});
