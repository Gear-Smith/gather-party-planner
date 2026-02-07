import brandLogo from "~/pages/welcome/g-logo-t.png"
import { ThemeToggle } from "~/components/theme-toggle"
import { Separator } from "~/components/ui/separator"
import { Toaster } from "~/components/ui/sonner"

export interface AppContainerProps {
  children: React.ReactNode
  commonTopSlot?: React.ReactNode
}

export function AppContainer({ children, commonTopSlot }: AppContainerProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={brandLogo}
              alt="Gather Party Planner"
              className="size-8 rounded-md object-contain"
            />
            <p className="text-sm font-semibold tracking-tight">Gather Party Planner</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {commonTopSlot ? (
        <div data-testid="app-common-top-slot">
          <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            {commonTopSlot}
          </div>
          <Separator />
        </div>
      ) : null}

      <main data-testid="app-main-content" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <Toaster />
    </div>
  )
}
