import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AppContainer } from "../app-container"

vi.mock("~/components/theme-toggle", () => ({
  ThemeToggle: () => <button aria-label="Toggle theme">Toggle</button>,
}))

vi.mock("~/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}))

afterEach(() => {
  cleanup()
})

describe("AppContainer", () => {
  it("renders brand text, theme toggle, children, and toaster", () => {
    render(
      <AppContainer>
        <div>child content</div>
      </AppContainer>,
    )

    expect(screen.getByText("Gather Party Planner")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument()
    expect(screen.getByText("child content")).toBeInTheDocument()
    expect(screen.getByTestId("toaster")).toBeInTheDocument()
  })

  it("renders common top slot when provided", () => {
    render(
      <AppContainer commonTopSlot={<div>global banner</div>}>
        <div>child content</div>
      </AppContainer>,
    )

    expect(screen.getByTestId("app-common-top-slot")).toBeInTheDocument()
    expect(screen.getByText("global banner")).toBeInTheDocument()
  })

  it("does not render common top slot when omitted", () => {
    render(
      <AppContainer>
        <div>child content</div>
      </AppContainer>,
    )

    expect(screen.queryByTestId("app-common-top-slot")).not.toBeInTheDocument()
  })
})
