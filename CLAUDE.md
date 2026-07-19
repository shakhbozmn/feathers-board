# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Feathers Playground — interactive API testing tool for FeathersJS v5 apps. Ships as both a monorepo (with example apps) and two published NPM packages:

- `feathers-playground` (`packages/core`) — Feathers plugin: mounts `/services` discovery endpoint + serves the prebuilt UI at a configurable path
- `@feathers-playground/types` (`packages/types`) — shared types + Zod schemas

Two integration modes: **embedded** (plugin on the user's Feathers app) and **standalone** (Next.js app pointed at any Feathers API via `NEXT_PUBLIC_API_URL`).

## Monorepo Layout

pnpm workspaces + Turborepo. `pnpm-workspace.yaml` globs `apps/*` and `packages/*`. Node ≥ 20, pnpm ≥ 8.

- `apps/backend` — Feathers v5 + Express demo server (`@feathersjs/express`, `socketio`, `authentication`, Zod validation, helmet, in-memory stores). Two example services: `users`, `messages`. Mounts the playground at `/playground` and exposes `GET /services` → array of `{ name, path, methods, schema?, description? }`.
- `apps/frontend` — Next.js 15 App Router UI. Single page at `app/page.tsx` with three panels: `ServicesSidebar`, `RequestBuilder`, `SchemaViewer`, `ResponseViewer`. State lifted to the page (no router, no store). `lib/api-client.ts` is the only outbound HTTP layer. React Query in `providers.tsx` (1-min staleTime, retry 1).
- `packages/core` — the published plugin. Entry: `src/index.ts` exports `playground(options)`. Two transports detected at runtime: Koa (has `.callback()`) vs Express. Static UI is the Next.js export under `playground/` (copied at build via `scripts/`).
- `packages/types` — types + Zod schemas. No runtime deps beyond `zod`.

Root scripts: `pnpm dev | build | lint | test | type-check | clean | format | sync-versions`.

## Key Commands

All commands run from repo root unless noted.

```bash
pnpm install                    # workspace install
pnpm build                      # turbo build (depends on ^build)
pnpm dev                        # turbo dev (concurrent apps/backend + apps/frontend)
pnpm lint                       # turbo lint
pnpm test                       # turbo test (most packages stub: "echo 'No tests yet'")
pnpm type-check                 # turbo type-check
pnpm format                     # prettier write
pnpm clean                      # rm dist/.next

# Per-package
pnpm --filter @feathers-playground/backend dev
pnpm --filter @feathers-playground/frontend dev
pnpm --filter @feathers-playground/frontend build
pnpm --filter @feathers-playground/core build

# Versioning + release (root package.json is source of truth)
pnpm sync-versions              # copies root version + resolves workspace:* deps to ^version
pnpm release                    # build + publish types + publish core
```

Single test: there are no real tests yet — every package's `test` script echoes a stub. Don't write a runner expecting vitest/jest unless you add the dep first.

## Architecture Details

### Plugin transport (`packages/core/src/index.ts`)

`playground(options)` returns a Feathers config function. On register:

1. `registerPlaygroundHeaders` installs a path-scoped middleware (sets a relaxed CSP for the UI path so Next.js inline bootstrap scripts run under strict host CSP like helmet's `script-src 'self'`, plus optional CORS for `/services` and the UI mount). Scoped to playground routes only — consumer's helmet/CSP elsewhere is untouched.
2. Registers `/services` as a valid Feathers service with `find()` → `getServiceInfo(app)`.
3. Serves static UI from `<pkg>/playground/` at `config.path` (default `/playground`). Picks transport by sniffing `.callback()` on the app. Throws if static dir missing.

Static serving: Express prefers `@feathersjs/express`'s `serveStatic`, falls back to hand-rolled middleware. Koa prefers `koa-mount` + `koa-static` (require'd lazily), falls back to hand-rolled. Hand-rolled resolver guards path traversal and falls back to `index.html` for SPA routes.

### Service discovery (`getServiceInfo`)

Iterates `app.services`, skips `/services` itself, probes each service for `find|get|create|patch|remove` methods, copies `service.schema` and `service.description` if present. Attach schema to a service via `(service as any).schema = { type, properties, required, ... }` (JSON Schema, not Zod).

### Frontend data flow

`page.tsx` owns `selectedService`, `response`, `loading`. `useServices()` → React Query → `apiClient.getServices()` → `GET /services`. `RequestBuilder` builds `ApiRequest`, calls `apiClient.makeRequest()`, surfaces real API errors as the `code` field (re-thrown as `ApiError`) instead of masking as `NETWORK_ERROR`. Bearer token input wins over headers JSON for `Authorization`. "Fill sample from schema" button uses `lib/utils.ts` `schemaToExample()` (uses `example`/`default`/`enum`/`format` + name heuristics; skips `id`, `_id`, `createdAt`, `updatedAt`).

### Versions + publishing

Root `package.json` version is the source of truth. `scripts/sync-versions.js` copies it into `apps/{frontend,backend}/package.json` and `packages/{core,types}/package.json`, and rewrites any `workspace:*` deps to `^<version>`. Run `pnpm sync-versions` after bumping root.

`.github/workflows/publish.yml` triggers on GitHub release. Skips publish if the version already exists on npm. Order: types first, then core. Also syncs root `README.md` + `LICENSE` into both packages so npm displays current GitHub docs.

### Tooling

- ESLint flat config at root (`eslint.config.js`) — `typescript-eslint` recommended + Prettier; `no-explicit-any` is a warning; ignores `dist/`, `.next/`, `coverage/`, `**/*.d.ts`.
- Prettier at root (`.prettierrc`).
- TS project references from root `tsconfig.json` → each workspace package.
- Backend uses `tsx watch` for dev (no build step until `pnpm build`).

## Layout Conventions

- Backend services: `apps/backend/src/services/<name>/<name>.ts` (configure), `<name>.class.ts` (service class), `<name>.schema.ts` (Zod + JSON Schema side-by-side).
- Frontend components: kebab-case files, PascalCase exports, `'use client'` directive, Tailwind + shadcn/ui (`components/ui/`).
- Workspace deps declared as `workspace:*` in package.json; resolved by `sync-versions` before publish.

## Environment

Backend listens on `process.env.PORT` (default 3030). Frontend reads `NEXT_PUBLIC_API_URL` (default `http://localhost:3030`) — set in `apps/frontend/.env.local` for standalone mode.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy to keep main context window clean

- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness — and when the change has a UI surface, drive it in a browser

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -> then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Skills

Use these project skills (via the Skill tool) when the task matches:

- **`/frontend-design`** — Build or style any UI component, page, or layout. Triggers bold aesthetic decision-making: commits to a distinctive visual direction (typography, color, motion, spatial composition) before writing code. Avoids generic AI aesthetics (Inter font, purple gradients, cookie-cutter layouts).

- **`/impaccable`** — Apply the Impeccable design system (from `.impeccable/design.json`) to any UI work. Enforces the Linen + Forest Floor + Honey Gold palette, Onest typography, and operational status colors. Avoids default Antd/Material styles.

- **`/simple-brainstorm`** — Invoke before any feature design, component creation, or architectural change. Runs a lightweight Discover → Propose → Converge loop (max 2 rounds). Does NOT write code until the user explicitly approves a direction.

- **`/commit`** — Stage and commit with conventional commit format (`type(scope): description`). Infers type/scope from the diff if not provided. Shows a preview and waits for confirmation before committing. Never adds AI co-author attribution.
