# Gather Party Planner

Prototype party-planning application built with React Router and deployed to Cloudflare.

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
npm run preview
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage output:

```bash
npm run test:coverage
```

## Data Service Foundation

Frontend and route work should build on the fixture-backed service foundation in
[`app/lib/planner-data-service.ts`](app/lib/planner-data-service.ts).

- [`app/lib/planner-data-source.ts`](app/lib/planner-data-source.ts) is
  infrastructure-only. It owns the typed table reader and the fixture-backed
  adapter over `test_data/json`.
- [`app/lib/planner-data-service.ts`](app/lib/planner-data-service.ts) is the
  app-facing entry point. Future story methods should be added here or in
  adjacent service modules.
- `createPlannerServices()` is the composition seam for swapping the backing
  store later.
- `getPlannerServices()` returns the default app-level service container backed
  by the fixture data today.

This layer is intentionally minimal. Story-specific queries and mutations should
be added incrementally as full-stack slices are implemented, rather than
building a broad generic API up front.

Boundary rules:
- routes, loaders, actions, and components should not import fixture JSON files;
- frontend code should not normalize around raw table reads;
- future database migration should happen by replacing the injected data source,
  not by rewriting route/component call sites.

## Prototype Access

This prototype does not implement product-owned passwords, signup, or custom OTP
delivery. Staging access is expected to be handled by Cloudflare Access, while
the app maps the verified identity to fixture-backed user and party membership
records.

- Configure Cloudflare Access for the staging hostname with One-Time PIN by
  email.
- Restrict the Access policy to approved tester email addresses.
- Add these Worker vars in [`wrangler.jsonc`](wrangler.jsonc):
  - `CF_ACCESS_TEAM_DOMAIN`
  - `CF_ACCESS_AUD`
  - `DEV_ACCESS_EMAIL`
- `DEV_ACCESS_EMAIL` is for local development and tests only. Do not rely on it
  in staging or production.
- App authorization is resolved from the service layer using fixture-backed user
  and party membership data, not from Cloudflare roles.
- The repo now has a dedicated Wrangler staging environment that targets
  `staging.gatherpartyplanner.com`. Deploy it with `npm run deploy:staging`.

The current prototype membership fixture lives in
[`test_data/manual/party-memberships.json`](test_data/manual/party-memberships.json).
This keeps party roles app-owned until the workbook model or database schema
catches up.

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
npm run deploy
```

To build and deploy the staging Worker to the custom domain:

```sh
npm run deploy:staging
```

After the first staging deploy, finish the Zero Trust side in the Cloudflare
dashboard:

- create or confirm the Zero Trust organization and team domain;
- enable the `One-Time PIN` identity provider;
- create a self-hosted Access application for
  `staging.gatherpartyplanner.com`;
- copy the Access application AUD into `CF_ACCESS_AUD`;
- allow only approved tester emails such as
  `gearsmith.integrations@gmail.com`.

Wrangler deploys the Worker and custom domain, but Cloudflare Access
applications and policies are still managed in Zero Trust, not in this repo.

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

Tailwind CSS is configured for the application UI.
