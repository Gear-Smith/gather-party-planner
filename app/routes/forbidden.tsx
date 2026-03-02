export default function ForbiddenPage() {
  return (
    <main className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Planner access required</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Your identity was verified, but only planners and co-planners can use
          these planning tools.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Party-goer access for dashboards and participation features will be
          handled separately from planner editing access.
        </p>
      </div>
    </main>
  );
}
