export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">You are not assigned to this prototype</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Your identity was verified, but this application could not match you to
          an approved app user with party access.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Access for this prototype is limited to pre-assigned testers. There is
          no self-service signup in this environment.
        </p>
      </div>
    </main>
  );
}
