import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import App from "../root"

vi.mock("react-router", () => ({
  Outlet: () => <div data-testid="mock-outlet">Outlet</div>,
  Links: () => null,
  Meta: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
  isRouteErrorResponse: () => false,
}))

vi.mock("../components/app-container", () => ({
  AppContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-app-container">{children}</div>
  ),
}))

describe("root App", () => {
  it("renders the outlet through AppContainer", () => {
    render(<App />)

    expect(screen.getByTestId("mock-app-container")).toBeInTheDocument()
    expect(screen.getByTestId("mock-outlet")).toBeInTheDocument()
  })
})
