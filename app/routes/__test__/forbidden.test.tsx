import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ForbiddenPage from "../forbidden";

describe("forbidden route", () => {
  it("explains when a signed-in party goer cannot access planner tools", () => {
    render(<ForbiddenPage />);

    expect(
      screen.getByRole("heading", {
        name: "Planner access required",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/only planners and co-planners can use these planning tools/i),
    ).toBeInTheDocument();
  });
});
