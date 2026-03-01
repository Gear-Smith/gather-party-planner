import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import UnauthorizedPage from "../unauthorized";

describe("unauthorized route", () => {
  it("explains the prototype access mismatch without offering self-service signup", () => {
    render(<UnauthorizedPage />);

    expect(
      screen.getByRole("heading", {
        name: "You are not assigned to this prototype",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/could not match you to an approved app user/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/no self-service signup/i)).toBeInTheDocument();
  });
});
