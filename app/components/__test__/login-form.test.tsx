import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginForm } from "../login-form";

describe("LoginForm", () => {
  it("renders expected fields and actions", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("heading", { name: "Login to your account" }),
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toBeRequired();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toBeRequired();

    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Login with Google" }),
    ).toBeInTheDocument();
  });
});
