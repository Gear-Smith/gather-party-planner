import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ThemeToggle } from "../theme-toggle"

const setTheme = vi.fn()

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme }),
}))

afterEach(() => {
  cleanup()
  setTheme.mockClear()
})

describe("ThemeToggle", () => {
  it("shows theme options and sets selected theme", () => {
    render(<ThemeToggle />)

    fireEvent.pointerDown(screen.getByRole("button", { name: "Toggle theme" }))

    expect(screen.getByRole("menuitem", { name: "Light" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Dark" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "System" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("menuitem", { name: "Dark" }))
    expect(setTheme).toHaveBeenCalledWith("dark")

    fireEvent.pointerDown(screen.getByRole("button", { name: "Toggle theme" }))
    fireEvent.click(screen.getByRole("menuitem", { name: "Light" }))
    expect(setTheme).toHaveBeenCalledWith("light")

    fireEvent.pointerDown(screen.getByRole("button", { name: "Toggle theme" }))
    fireEvent.click(screen.getByRole("menuitem", { name: "System" }))
    expect(setTheme).toHaveBeenCalledWith("system")
  })
})
