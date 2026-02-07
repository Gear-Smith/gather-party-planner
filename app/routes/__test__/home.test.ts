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

  it("returns cloudflare env message from loader context", () => {
    const result = loader({
      context: {
        cloudflare: {
          env: { VALUE_FROM_CLOUDFLARE: "x" },
        },
      },
    } as never);

    expect(result).toEqual({ message: "x" });
  });

  it("renders home navigation choices for opening and creating a party", () => {
    render(createElement(Home, { loaderData: { message: "x" } } as never));

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
