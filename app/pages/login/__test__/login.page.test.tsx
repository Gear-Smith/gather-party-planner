import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LoginPage } from "../page"

describe("LoginPage", () => {
  it("renders the login form content", () => {
    render(<LoginPage />)

    expect(
      screen.getByRole("heading", { name: "Login to your account" }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
  })
})
