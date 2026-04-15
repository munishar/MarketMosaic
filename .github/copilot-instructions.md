# marketmosaic — Copilot Instructions

## Project Overview

marketmosaic is an AI-powered commercial lines insurance broker platform. It is a monorepo built with Turborepo containing a React frontend, Node.js backend, and shared packages.

**Domain context:** This platform serves independent commercial lines insurance brokers who place business across multiple carriers via their underwriters. Key domain terms: servicer (internal team member), underwriter (external contact at a carrier), client/insured (the business being insured), carrier (insurance company), line of business (GL, Property, WC, etc.), capacity (how much limit an underwriter can write), submission (package sent to underwriter requesting a quote), placement (tracking a submission through quote/bind lifecycle).

## Repository Structure

```
marketmosaic/
├── apps/web/          → React 18 + TypeScript + Vite + Tailwind + shadcn/ui
├── apps/api/          → Node.js + Express + PostgreSQL + Redis
├── packages/shared/   → Shared TypeScript interfaces, Zod schemas, enums, constants
├── packages/db/       → Database migrations, seeds, connection
├── packages/manifest/ → Config-driven architecture manifest schemas + defaults
├── e2e/               → Playwright E2E tests
└── docs/              → PRD (marketmosaic_PRD_v2.0.docx) and AGENTS.md
```

## Source of Truth

**Always read `docs/AGENTS.md` first** when working on any issue. It contains the exact file deliverables, instructions, and acceptance criteria for each agent/task. The agent number in the issue title maps directly to a section in AGENTS.md.

**Read `docs/marketmosaic_PRD_v2.0.docx`** for data model details (Section 4), component specifications (Section 5), shared state architecture (Section 6), AI integration specs (Section 7), API routes (Section 8), and config-driven architecture (Section 13).

## Coding Standards

### TypeScript
- Strict mode enabled. No `any` types — use proper generics or `unknown`.
- All entity interfaces live in `packages/shared/src/types/entities/`. Import them — never redefine.
- All enums live in `packages/shared/src/types/enums.ts`. Import them — never redefine.
- All validation schemas live in `packages/shared/src/validation/schemas.ts` (Zod).

### Backend (apps/api)
- Every route handler: validate request with Zod middleware → check permissions via authorize middleware → call service → return typed response.
- Services contain business logic. Routes are thin — just wire middleware and call services.
- Queries are in separate files (`queries/*.ts`) — raw SQL or query builder, not inline in services.
- All list endpoints support: `?page=&limit=&sort=&order=&search=&filters=`.
- Soft deletes only (`is_active = false`), never hard delete.
- Emit events via the event bus on state-changing operations.
- Error responses follow: `{ error: { code: string, message: string, details?: any } }`.
- Success responses follow: `{ data: T, meta?: { page, limit, total } }`.

### Frontend (apps/web)
- Functional components with hooks only. No class components.
- State management: Zustand with immer middleware. One slice per domain (see `src/store/`).
- API calls: use custom hooks (e.g., `useClients()`) that wrap axios calls and manage loading/error state.
- Styling: Tailwind CSS utility classes. shadcn/ui for base components. No custom CSS files unless absolutely necessary.
- Color palette: Primary `#1B3A5C`, Secondary `#2E75B6`, Success `#16A34A`, Warning `#EAB308`, Danger `#DC2626`.
- Use `DataTable` component from `src/components/shared/DataTable.tsx` for all list views.
- Use `EntityForm` component from `src/components/shared/EntityForm.tsx` for all forms.
- Forms validate with Zod schemas imported from `@marketmosaic/shared`.

### Testing
- Backend: Vitest with integration tests against a test database.
- Frontend: Vitest with React Testing Library.
- E2E: Playwright.
- Every file that an agent creates must have corresponding tests.

### File Naming
- TypeScript files: `kebab-case.ts` (e.g., `line-of-business.ts`)
- React components: `PascalCase.tsx` (e.g., `ClientManager.tsx`)
- Test files: `*.test.ts` or `*.test.tsx` co-located with source

### Imports
```typescript
// Always use package imports for shared code
import { Client, Contact, SubmissionStatus } from '@marketmosaic/shared';
import { createClientSchema } from '@marketmosaic/shared/validation';

// Never use relative imports across package boundaries
// ❌ import { Client } from '../../../packages/shared/src/types/entities/client';
// ✅ import { Client } from '@marketmosaic/shared';
```

## Dependency Rules

- **No agent writes outside its own directory** except into `packages/shared/`.
- **All cross-module communication** happens through TypeScript interfaces in `packages/shared/types/`.
- **Backend agents** never import from `apps/web/`. Frontend agents never import from `apps/api/`.
- **Both frontend and backend** import from `packages/shared/`, `packages/db/`, and `packages/manifest/`.

## Build & Run

```bash
npm install              # Install all workspace dependencies
docker compose up -d     # Start PostgreSQL + Redis
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed sample data
npm run dev              # Start all dev servers (Turbo)
npm run test             # Run all tests
npm run type-check       # TypeScript check across all packages
```

## AI Integration

- Model: `claude-sonnet-4-20250514` for all AI features (assistant, email parser, enrichment).
- Use Anthropic SDK with tool use (function calling) for the AI Workflow Assistant.
- AI service code lives in `apps/api/src/ai/`.
- Never hardcode API keys — always read from `process.env.ANTHROPIC_API_KEY`.

## Issue Labels

| Label | Meaning |
|-------|---------|
| `tier-0` through `tier-8` | Dependency tier — lower tiers must complete first |
| `agent-0` through `agent-19` | Which agent section in AGENTS.md this maps to |
| `backend` | Backend work (apps/api or packages/) |
| `frontend` | Frontend work (apps/web) |
| `blocking` | This issue blocks other tiers — prioritize |
| `contracts` | Shared types/schemas that other agents depend on |
