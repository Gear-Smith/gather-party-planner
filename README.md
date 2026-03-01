# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

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
bun run test
```

Run tests in watch mode:

```bash
bun run test:watch
```

Run tests with coverage output:

```bash
bun run test:coverage
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

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
