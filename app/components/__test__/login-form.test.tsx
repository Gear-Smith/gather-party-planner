import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginForm } from "../login-form";

describe("LoginForm", () => {
  it("renders prototype access guidance instead of password auth controls", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("heading", { name: "Prototype access" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not use passwords or self-service signup/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/approved users authenticate through the prototype access gateway/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to home" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
    expect(screen.queryByText(/Sign up/i)).not.toBeInTheDocument();
  });
});
