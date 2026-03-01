import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LoginPage } from "../page"

describe("LoginPage", () => {
  it("renders the login form content", () => {
    render(<LoginPage />)

    expect(screen.getByRole("heading", { name: "Prototype access" })).toBeInTheDocument()
    expect(
      screen.getByText(
        "This prototype is limited to approved testers and does not use passwords or self-service signup.",
      ),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument()
  })
})
