# CLAUDE.md

## Project Overview

BrokerFlow is an AI-powered commercial lines insurance broker platform. Monorepo built with Turborepo.

**Domain:** Independent commercial lines insurance broker placing business across multiple carriers. Key terms: servicer (internal staff), underwriter (external contact at carrier), client/insured (business being insured), carrier (insurance company), line of business (GL, Property, WC), capacity (limit an underwriter can write), submission (package requesting quote), placement (tracking submission through quote/bind).

## Repository Structure

```
brokerflow/
├── apps/web/          → React 18 + TypeScript + Vite + Tailwind + shadcn/ui
├── apps/api/          → Node.js + Express + PostgreSQL + Redis
├── packages/shared/   → Shared TypeScript interfaces, Zod schemas, enums, constants
├── packages/db/       → Database migrations, seeds, connection
├── packages/manifest/ → Config-driven architecture manifest schemas + defaults
├── e2e/               → Playwright E2E tests
└── docs/              → PRD and architecture docs
```

## Source of Truth

- **`docs/AGENTS.md`** — Multi-agent build plan. Agent number in issue title maps to a section here. Read the relevant section FIRST before writing any code.
- **`docs/BrokerFlow_PRD_v2.0.docx`** — Full PRD. Section 4 = data model, Section 5 = components, Section 6 = state architecture, Section 7 = AI specs, Section 8 = API routes, Section 13 = config-driven architecture.

## Build & Run

```bash
npm install
docker compose up -d          # PostgreSQL + Redis
npm run db:migrate
npm run db:seed
npm run dev                   # Start all dev servers
npm run test                  # Run all tests
npm run type-check            # TypeScript check all packages
```

## Coding Standards

### TypeScript
- Strict mode. No `any` — use generics or `unknown`.
- Entity interfaces: `packages/shared/src/types/entities/`. Import them, never redefine.
- Enums: `packages/shared/src/types/enums.ts`. Import them, never redefine.
- Zod schemas: `packages/shared/src/validation/schemas.ts`.

### Backend (`apps/api/`)
- Route handler pattern: Zod validate → authorize middleware → service call → typed response.
- Services hold business logic. Routes are thin wiring.
- Queries in separate `queries/*.ts` files — not inline.
- All list endpoints: `?page=&limit=&sort=&order=&search=&filters=`.
- Soft deletes only (`is_active = false`).
- Emit events on state changes.
- Error response: `{ error: { code: string, message: string, details?: any } }`
- Success response: `{ data: T, meta?: { page, limit, total } }`

### Frontend (`apps/web/`)
- Functional components + hooks only.
- State: Zustand with immer. One slice per domain in `src/store/`.
- API calls: custom hooks (e.g., `useClients()`) wrapping axios.
- Styling: Tailwind + shadcn/ui. No custom CSS unless necessary.
- Colors: Primary `#1B3A5C`, Secondary `#2E75B6`, Success `#16A34A`, Warning `#EAB308`, Danger `#DC2626`.
- Use `DataTable` from `src/components/shared/` for all lists.
- Use `EntityForm` from `src/components/shared/` for all forms.
- Validate with Zod schemas from `@brokerflow/shared`.

### Testing
- Backend: Vitest, integration tests against test DB.
- Frontend: Vitest + React Testing Library.
- E2E: Playwright.
- Every new file gets corresponding tests.

### Naming
- TypeScript: `kebab-case.ts` (e.g., `line-of-business.ts`)
- React components: `PascalCase.tsx` (e.g., `ClientManager.tsx`)
- Tests: `*.test.ts` / `*.test.tsx` co-located with source

### Imports
```typescript
// ✅ Always use package imports
import { Client, Contact, SubmissionStatus } from '@brokerflow/shared';
import { createClientSchema } from '@brokerflow/shared/validation';

// ❌ Never relative imports across packages
import { Client } from '../../../packages/shared/src/types/entities/client';
```

## Boundary Rules

- No writing outside your assigned directory except `packages/shared/`.
- All cross-module contracts via `packages/shared/types/`.
- Backend never imports from `apps/web/`. Frontend never imports from `apps/api/`.
- Both import from `packages/shared/`, `packages/db/`, `packages/manifest/`.

## AI Integration

- Model: `claude-sonnet-4-20250514` for all AI features.
- Anthropic SDK with tool use for AI Workflow Assistant.
- AI code in `apps/api/src/ai/`.
- API key from `process.env.ANTHROPIC_API_KEY` — never hardcode.

## Issue Labels

| Label | Meaning |
|-------|---------|
| `tier-0` through `tier-8` | Dependency tier — lower completes first |
| `agent-0` through `agent-19` | Maps to section in `docs/AGENTS.md` |
| `blocking` | Blocks other tiers — prioritize |
