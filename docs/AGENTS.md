# marketmosaic — Multi-Agent Build Orchestration

> **Purpose:** This file defines the agentic architecture for building marketmosaic using parallel Claude Code agents. Each agent owns a bounded domain, produces artifacts against shared contracts, and integrates cleanly at defined seams.
>
> **Runtime:** Claude Code (GitHub) — spawn agents per section below.
>
> **Rule #1:** NO agent writes outside its own directory except into `packages/shared/`.
> **Rule #2:** ALL cross-agent communication happens through TypeScript interfaces in `packages/shared/types/`.
> **Rule #3:** Every agent MUST run its own tests green before declaring done.
> **Rule #4:** Agents in the same tier can run in parallel. Next tier starts only when previous tier passes CI.

---

## Architecture: Dependency Graph

```
TIER 0 — CONTRACTS (must complete first, everything depends on it)
  └── Agent 0: Shared Contracts & Schema Foundation

TIER 1 — DATA LAYER (parallel, no cross-dependencies)
  ├── Agent 1: Database & Migrations
  └── Agent 2: Auth & RBAC

TIER 2 — CORE API SERVICES (parallel, depends on Tier 0+1)
  ├── Agent 3: Core Entity APIs (User, Team, Client, Contact)
  ├── Agent 4: Reference Data APIs (Carrier, LOB, FormPaper, Capacity)
  └── Agent 5: Document & Template Services

TIER 3 — WORKFLOW & EMAIL (parallel, depends on Tier 2)
  ├── Agent 6: Submission & Placement Engine
  ├── Agent 7: Email Pipeline (Compose, Inbox, Parse, Import)
  └── Agent 8: Sync Engine & AMS Integration

TIER 4 — INTELLIGENCE LAYER (parallel, depends on Tier 2+3)
  ├── Agent 9: UnderwriterMatcher & Network Graph
  └── Agent 10: AI Workflow Assistant

TIER 5 — FRONTEND SHELL (depends on Tier 0, parallel with Tier 2+)
  └── Agent 11: App Shell, Routing, Design System

TIER 6 — FRONTEND FEATURES (parallel, depends on Tier 5 + respective backend agent)
  ├── Agent 12: Frontend — Contacts, Clients, Teams
  ├── Agent 13: Frontend — Carriers, LOB, Forms, Capacity Matrix
  ├── Agent 14: Frontend — Submissions, Placements, Renewals
  ├── Agent 15: Frontend — Email UI (Inbox, Composer, Parser Review, Import)
  ├── Agent 16: Frontend — AI Assistant, Network Graph, Dashboard
  └── Agent 17: Frontend — Sync Admin, Config Admin, Notifications

TIER 7 — CONFIG-DRIVEN ARCHITECTURE (depends on all Tiers above)
  └── Agent 18: Manifest System & Dynamic Renderers

TIER 8 — INTEGRATION TESTING (depends on everything)
  └── Agent 19: E2E Tests, CI/CD, Deploy
```

---

## Agent 0: Shared Contracts & Schema Foundation

**Priority:** CRITICAL — blocks everything. Run first.

**Owns:** `packages/shared/`, `packages/db/schema/`, `packages/manifest/`

**Deliverables:**

```
packages/
├── shared/
│   ├── types/
│   │   ├── entities/
│   │   │   ├── user.ts              # User, Team interfaces
│   │   │   ├── client.ts            # Client interface
│   │   │   ├── contact.ts           # Contact interface + ContactType enum
│   │   │   ├── carrier.ts           # Carrier interface
│   │   │   ├── line-of-business.ts  # LineOfBusiness interface
│   │   │   ├── form-paper.ts        # FormPaper interface
│   │   │   ├── capacity.ts          # UnderwriterCapacity interface
│   │   │   ├── submission.ts        # Submission, SubmissionTarget interfaces
│   │   │   ├── email.ts             # Email, EmailImportJob interfaces
│   │   │   ├── attachment.ts        # Attachment interface
│   │   │   ├── activity.ts          # Activity interface + ActivityType enum
│   │   │   ├── template.ts          # Template interface
│   │   │   ├── notification.ts      # Notification interface
│   │   │   ├── network.ts           # NetworkRelationship interface
│   │   │   ├── sync.ts              # SyncSchedule, SyncJob, DataFreshnessScore, AMSConnection
│   │   │   ├── manifest.ts          # PlatformManifest interface + all manifest type schemas
│   │   │   └── index.ts             # Re-exports everything
│   │   ├── api/
│   │   │   ├── requests.ts          # All API request payload types
│   │   │   ├── responses.ts         # All API response envelope types
│   │   │   ├── filters.ts           # Shared filter/query types per entity
│   │   │   └── index.ts
│   │   ├── enums.ts                 # ALL enums in one file (UserRole, ContactType, SubmissionStatus, etc.)
│   │   ├── events.ts                # Event bus event type definitions (submission:created, email:received, etc.)
│   │   └── index.ts
│   ├── validation/
│   │   ├── schemas.ts               # Zod schemas for every entity (used by both frontend + backend)
│   │   └── index.ts
│   ├── constants/
│   │   ├── defaults.ts              # Default values, pagination limits, freshness thresholds
│   │   ├── permissions.ts           # Default permission matrix
│   │   └── index.ts
│   └── utils/
│       ├── formatting.ts            # Currency, date, phone formatting
│       ├── capacity.ts              # Capacity calculation helpers
│       └── index.ts
├── db/
│   └── schema/
│       └── schema.sql               # Complete DDL — all 18 tables with constraints, indexes, FKs
├── manifest/
│   ├── schema/
│   │   ├── entity-definition.ts     # TypeScript type for entity definition manifest config
│   │   ├── field-schema.ts          # TypeScript type for field schema manifest config
│   │   ├── workflow-definition.ts   # TypeScript type for workflow definition manifest config
│   │   ├── ui-layout.ts             # TypeScript type for UI layout manifest config
│   │   ├── permission-matrix.ts     # TypeScript type for permission matrix manifest config
│   │   ├── navigation.ts            # TypeScript type for navigation manifest config
│   │   ├── business-rule.ts         # TypeScript type for business rule manifest config
│   │   └── index.ts
│   ├── defaults/
│   │   ├── entities.json            # Default entity definitions for all 18 entities
│   │   ├── fields.json              # Default field schemas for all entities
│   │   ├── workflows.json           # Default workflow definitions (placement_pipeline, renewal_pipeline)
│   │   ├── navigation.json          # Default sidebar navigation
│   │   └── permissions.json         # Default permission matrix per role
│   └── validation/
│       └── manifest-validator.ts    # Validates manifest configs against their schemas
```

**Instructions for Agent 0:**

1. Read the PRD document `docs/marketmosaic_PRD_v2.0.docx` — specifically Section 4 (Data Model), Section 6 (Shared State), Section 13 (Config-Driven Architecture).
2. For every entity in Section 4, create a TypeScript interface with JSDoc comments. Every field from the PRD tables must be present with correct types.
3. Enums: consolidate ALL enums into a single `enums.ts`. Include: `UserRole`, `ContactType`, `CarrierType`, `LOBCategory`, `FormPaperType`, `SubmissionStatus`, `SubmissionTargetStatus`, `EmailDirection`, `EmailSource`, `EmailParseStatus`, `AttachmentType`, `ActivityType`, `NotificationType`, `RelationshipStrength`, `SyncScheduleType`, `SyncFrequency`, `SyncJobStatus`, `DataFreshnessStatus`, `AMSProvider`, `ManifestType`.
4. Zod schemas: create a Zod schema for every entity that mirrors the TypeScript interface. These are used for API request validation (backend) and form validation (frontend).
5. Event types: define a discriminated union type for all event bus events from PRD Section 6.2.
6. SQL schema: generate complete DDL with proper constraints, indexes on foreign keys, and GIN indexes on JSONB/array columns.
7. Manifest schemas: TypeScript types for all 7 manifest types from PRD Section 13.2. Default JSON files that define the initial platform config matching the PRD exactly.
8. **Test:** Every type file must compile with `tsc --noEmit`. Zod schemas must have unit tests validating correct and incorrect payloads.

**Acceptance criteria:** `npm run build` in `packages/shared` passes. `npm test` passes. All other agents can `import { Client, Contact, Submission } from '@marketmosaic/shared'` and get full type safety.

---

## Agent 1: Database & Migrations

**Depends on:** Agent 0

**Owns:** `packages/db/`

**Deliverables:**

```
packages/db/
├── migrations/
│   ├── 001_create_users_teams.sql
│   ├── 002_create_clients.sql
│   ├── 003_create_contacts.sql
│   ├── 004_create_carriers_lob_forms.sql
│   ├── 005_create_capacity.sql
│   ├── 006_create_submissions.sql
│   ├── 007_create_emails.sql
│   ├── 008_create_attachments.sql
│   ├── 009_create_activities.sql
│   ├── 010_create_templates.sql
│   ├── 011_create_notifications.sql
│   ├── 012_create_network.sql
│   ├── 013_create_sync.sql
│   ├── 014_create_manifest.sql
│   └── 015_create_indexes_constraints.sql
├── seeds/
│   ├── 001_roles_teams.sql          # Sample teams and admin user
│   ├── 002_reference_data.sql       # Lines of business, sample carriers, sample forms
│   ├── 003_sample_clients.sql       # 20 sample clients across industries
│   ├── 004_sample_contacts.sql      # 30 sample underwriter contacts with capacity
│   ├── 005_manifest_defaults.sql    # Insert default manifest configs from packages/manifest/defaults/
│   └── 006_sample_submissions.sql   # 10 sample submissions in various stages
├── connection.ts                    # Database connection pool (PostgreSQL via pg or Supabase client)
├── migrate.ts                       # Migration runner
├── seed.ts                          # Seed runner
└── README.md
```

**Instructions for Agent 1:**

1. Use the SQL schema from Agent 0 (`packages/db/schema/schema.sql`) as the source of truth.
2. Split into ordered migrations — each migration handles one logical entity group.
3. All tables must have: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`, `created_by UUID REFERENCES users(id)`, `updated_by UUID REFERENCES users(id)`.
4. Create an `updated_at` trigger function that auto-updates on row modification.
5. Seed data must be realistic for an insurance brokerage. Use real carrier names (Zurich, Chubb, Hartford, Travelers, etc.), real LOB names, realistic NAICS codes.
6. Connection module must support both direct PostgreSQL and Supabase connection strings via env var.
7. **Test:** Migrations run forward and backward (up/down) cleanly. Seeds populate without constraint violations. Connection module connects successfully to a test database.

---

## Agent 2: Auth & RBAC

**Depends on:** Agent 0, Agent 1

**Owns:** `apps/api/src/middleware/`, `apps/api/src/routes/auth.ts`

**Deliverables:**

```
apps/api/src/
├── middleware/
│   ├── authenticate.ts        # JWT verification middleware
│   ├── authorize.ts           # Role-based permission middleware — reads from permission manifest
│   ├── rate-limit.ts          # Rate limiting middleware
│   ├── error-handler.ts       # Global error handler with typed error responses
│   ├── validate.ts            # Request validation middleware using Zod schemas from packages/shared
│   └── audit-log.ts           # Audit logging middleware — logs all mutations
├── routes/
│   └── auth.ts                # POST /login, POST /register, POST /refresh, GET /me, POST /logout
├── services/
│   └── auth.service.ts        # JWT generation, password hashing, token refresh logic
└── lib/
    ├── jwt.ts                 # JWT sign/verify helpers
    ├── password.ts            # bcrypt hash/compare
    └── permissions.ts         # Permission resolver — reads permission matrix manifest, evaluates row-level filters
```

**Instructions for Agent 2:**

1. JWT with access token (15 min) + refresh token (7 days). Store refresh tokens in DB.
2. `authorize` middleware signature: `authorize(entityKey: string, action: 'create' | 'read' | 'update' | 'delete')`. It reads the permission matrix manifest from the config store and evaluates against current user's role.
3. Row-level filtering: the `authorize` middleware must inject a `where` clause filter based on the permission manifest's `row_filter` config. E.g., servicers only see clients where `assigned_servicer_id = currentUser.id`.
4. `validate` middleware wraps Zod schemas: `validate(createClientSchema)` auto-validates request body.
5. Audit log: every POST/PUT/DELETE creates an audit record with: user_id, action, entity_type, entity_id, old_value (for updates), new_value, timestamp.
6. **Test:** Unit tests for JWT flow, permission evaluation with various role/entity/action combinations, row-level filter injection, Zod validation pass/fail cases.

---

## Agent 3: Core Entity APIs

**Depends on:** Agent 0, Agent 1, Agent 2

**Owns:** `apps/api/src/routes/{users,teams,clients,contacts}.ts`, `apps/api/src/services/{user,team,client,contact}.service.ts`

**Deliverables:**

```
apps/api/src/
├── routes/
│   ├── users.ts               # GET, POST, PUT /:id, DELETE /:id
│   ├── teams.ts               # GET, POST, PUT /:id, DELETE /:id, GET /:id/members
│   ├── clients.ts             # GET, POST, PUT /:id, DELETE /:id, GET /:id/submissions, GET /:id/activities, GET /:id/attachments
│   └── contacts.ts            # GET, POST, PUT /:id, DELETE /:id, GET /:id/capacity, GET /:id/network
├── services/
│   ├── user.service.ts
│   ├── team.service.ts
│   ├── client.service.ts
│   └── contact.service.ts
└── queries/
    ├── user.queries.ts         # Raw SQL or query builder queries
    ├── team.queries.ts
    ├── client.queries.ts
    └── contact.queries.ts
```

**Instructions for Agent 3:**

1. Every route handler: validate request with Zod → check permissions via middleware → call service → return typed response.
2. All list endpoints support: `?page=&limit=&sort=&order=&search=&filters=` (filters is JSON-encoded).
3. Soft deletes: set `is_active = false`, never hard delete.
4. Client list endpoint must support filtering by: status, assigned_servicer_id, assigned_team_id, tags, industry, state.
5. Contact list endpoint must support filtering by: contact_type, carrier_id, line_of_business (array contains), region, is_active.
6. `GET /contacts/:id/network` returns all `NetworkRelationship` records for that contact with joined user data.
7. `GET /contacts/:id/capacity` returns all `UnderwriterCapacity` records with joined carrier and LOB names.
8. Emit events via event bus: `contact:created`, `client:created` on successful creation.
9. **Test:** Integration tests against test database for every endpoint. Test permission enforcement (servicer can't delete, viewer can't create). Test pagination, filtering, sorting.

---

## Agent 4: Reference Data APIs

**Depends on:** Agent 0, Agent 1, Agent 2

**Owns:** `apps/api/src/routes/{carriers,lines,forms,capacity}.ts`, `apps/api/src/services/{carrier,line,form,capacity}.service.ts`

**Deliverables:**

```
apps/api/src/
├── routes/
│   ├── carriers.ts            # GET, POST, PUT /:id, GET /:id/contacts, GET /:id/forms, GET /:id/lines
│   ├── lines.ts               # GET, POST, PUT /:id, DELETE /:id (with tree structure support)
│   ├── forms.ts               # GET, POST, PUT /:id, DELETE /:id
│   └── capacity.ts            # GET (with advanced filters), POST, PUT /:id, GET /search
├── services/
│   ├── carrier.service.ts
│   ├── line.service.ts
│   ├── form.service.ts
│   └── capacity.service.ts
└── queries/
    ├── carrier.queries.ts
    ├── line.queries.ts
    ├── form.queries.ts
    └── capacity.queries.ts
```

**Instructions for Agent 4:**

1. Lines of Business: support parent-child hierarchy. `GET /lines` returns flat list with `parent_line_id`. Frontend builds tree.
2. `GET /capacity/search` is the power endpoint — must support: `?line_id=&carrier_id=&min_limit=&state=&industry_class=&has_available_capacity=true`. This is the query that the UnderwriterMatcher and AI assistant will use.
3. Capacity search must JOIN contacts, carriers, and LOBs to return denormalized results with names.
4. `GET /carriers/:id/forms` returns forms filtered by carrier, joined with LOB names.
5. All reference data endpoints cache aggressively (Redis or in-memory) — these change infrequently.
6. **Test:** Integration tests for all endpoints. Test capacity search with various filter combinations. Test LOB tree hierarchy.

---

## Agent 5: Document & Template Services

**Depends on:** Agent 0, Agent 1, Agent 2

**Owns:** `apps/api/src/routes/{attachments,templates}.ts`, `apps/api/src/services/{attachment,template}.service.ts`

**Deliverables:**

```
apps/api/src/
├── routes/
│   ├── attachments.ts         # POST /upload, GET, GET /:id, DELETE /:id, GET /by-client/:clientId
│   └── templates.ts           # GET, POST, PUT /:id, POST /:id/render, DELETE /:id
├── services/
│   ├── attachment.service.ts  # File upload to S3/Firebase Storage, metadata tracking
│   ├── template.service.ts    # CRUD + merge field rendering
│   └── merge.service.ts       # Template merge engine — resolves {{client.company_name}} etc.
└── lib/
    └── storage.ts             # Storage adapter (S3 or Firebase Storage)
```

**Instructions for Agent 5:**

1. File upload: accept multipart/form-data, store in cloud storage, save metadata to DB.
2. Template merge: `POST /templates/:id/render` accepts a JSON body with entity IDs → fetches entities from DB → replaces all `{{entity.field}}` placeholders → returns rendered content.
3. Supported merge fields: any field from Client, Contact, Carrier, Submission, User entities. Format: `{{entity_type.field_name}}`.
4. Support template types: email, document, cover_letter, acord.
5. **Test:** Upload/download round-trip test. Template render with various merge field combinations. Test missing merge field handling (leave placeholder vs. empty string — configurable).

---

## Agent 6: Submission & Placement Engine

**Depends on:** Agent 0, Agent 1, Agent 2, Agent 3, Agent 4

**Owns:** `apps/api/src/routes/{submissions,placements,renewals}.ts`, `apps/api/src/services/{submission,placement,renewal}.service.ts`

**Deliverables:**

```
apps/api/src/
├── routes/
│   ├── submissions.ts         # POST, PUT /:id, POST /:id/targets, POST /:id/send, GET /:id
│   ├── placements.ts          # GET (with filters), PUT /:id/status, GET /kanban, GET /timeline
│   └── renewals.ts            # GET, GET /upcoming, POST /:id/initiate
├── services/
│   ├── submission.service.ts  # Create submission, add targets, validate before send
│   ├── placement.service.ts   # Status transitions, kanban data aggregation, timeline view
│   └── renewal.service.ts     # Renewal detection, calendar data, initiation
└── jobs/
    └── renewal-scanner.ts     # Cron job: scan for upcoming renewals, create notifications
```

**Instructions for Agent 6:**

1. `POST /submissions/:id/send`: validates submission has targets, attachments, and cover letter → marks as sent → creates PlacementTracker entries for each target → emits `submission:created` event → triggers email send via email service.
2. `PUT /placements/:id/status`: validates transition is allowed (e.g., can't go from "declined" to "submitted") based on workflow definition manifest. Emits `placement:statusChanged` event.
3. `GET /placements/kanban`: returns submissions grouped by status column. Includes: client name, line, carrier, underwriter name, premium (if quoted), days in current status, aging flag.
4. Renewal scanner: runs daily, finds submissions where `expiration_date` is within configurable windows (120, 90, 60, 30 days). Creates notifications for assigned servicer.
5. `POST /renewals/:id/initiate`: creates a new submission with `renewal_of` pointing to the expiring submission, pre-populates lines and targets from the original.
6. **Test:** Full submission lifecycle test (create → add targets → send → receive quote → bind). Kanban aggregation test. Renewal detection test.

---

## Agent 7: Email Pipeline

**Depends on:** Agent 0, Agent 1, Agent 2, Agent 3

**Owns:** `apps/api/src/routes/emails.ts`, `apps/api/src/routes/import.ts`, `apps/api/src/services/{email,email-parser,email-import}.service.ts`, `apps/api/src/ai/email-parser.ts`

**Deliverables:**

```
apps/api/src/
├── routes/
│   ├── emails.ts              # GET /inbox, GET /thread/:id, POST /send, POST /draft, POST /:id/parse, GET /parse-queue
│   └── import.ts              # POST /connect, GET /preview, POST /start, GET /status, POST /cancel, GET /report, DELETE /purge, PUT /settings
├── services/
│   ├── email.service.ts       # Send via SendGrid, receive via webhook, thread management
│   ├── email-parser.service.ts  # AI parsing pipeline orchestrator
│   └── email-import.service.ts  # OAuth connect, historical scan, batch import, AI enrichment
├── ai/
│   ├── email-parser.ts        # Claude API integration for email data extraction
│   └── import-enricher.ts     # Claude API integration for relationship/sentiment analysis on imported emails
├── webhooks/
│   ├── inbound-email.ts       # Webhook handler for inbound email (SendGrid/Nylas)
│   └── oauth-callback.ts      # OAuth callback for Gmail/Outlook connect
└── jobs/
    ├── email-import-worker.ts # Background job for batch email import processing
    └── email-parse-worker.ts  # Background job for AI email parsing queue
```

**Instructions for Agent 7:**

1. **Email send**: compose email from parameters, send via SendGrid API, save to DB, link to client/submission/contact, emit `email:sent` event.
2. **Inbound webhook**: receive email via webhook → save to DB → auto-link sender to Contact by email address → auto-link to Submission by subject/thread → queue for AI parsing → emit `email:received` event.
3. **AI Parser** (see PRD Section 7.2 — 7-stage pipeline):
   - Call Claude API with system prompt: "Extract insurance quote data from this email. Return JSON: {type, premium, limits, deductible, sir, terms[], conditions[], exclusions[], effective_date, carrier, underwriter_name, confidence_score}"
   - Model: `claude-sonnet-4-20250514`
   - If confidence < 0.8, set `parse_status = 'review_needed'`
   - On confirm: update SubmissionTarget, emit `email:parsed`
4. **Email Import** (see PRD Section 5.16):
   - OAuth with Gmail API / Microsoft Graph API (read-only scope)
   - Scan user's sent/received for last N months
   - Match sender/recipient against Contact.email in DB
   - Only import matched emails
   - Background job processes in batches of 500
   - AI enrichment: per-contact corpus analysis → relationship strength, topics, sentiment
   - Update NetworkRelationship records
   - Emit `email:imported` event
5. **Test:** Send/receive round-trip test. Parser test with sample quote/decline/RFI emails. Import test with mock OAuth + mock email data. Enrichment test.

---

## Agent 8: Sync Engine & AMS Integration

**Depends on:** Agent 0, Agent 1, Agent 2, Agent 4 (capacity), Agent 7 (email for inquiries)

**Owns:** `apps/api/src/sync/`, `apps/api/src/routes/{sync,config-manifest}.ts`

**Deliverables:**

```
apps/api/src/
├── sync/
│   ├── scheduler.ts           # Cron-based schedule runner — reads SyncSchedule, triggers jobs
│   ├── capacity-refresh.ts    # Generates + sends capacity inquiry emails, tracks responses
│   ├── ams-adapter.ts         # Base AMS adapter interface
│   ├── adapters/
│   │   ├── applied-epic.ts    # Applied Epic API integration
│   │   ├── ams360.ts          # AMS360 API integration
│   │   ├── csv-import.ts      # Generic CSV/Excel file import adapter
│   │   └── index.ts
│   ├── freshness-engine.ts    # Freshness score calculator + staleness detector + auto-trigger
│   ├── reconciliation.ts      # Submission ↔ AMS policy matching + discrepancy flagging
│   └── field-mapper.ts        # Dynamic field mapping engine (external fields → platform fields)
├── routes/
│   ├── sync.ts                # All /api/sync/* routes
│   └── config-manifest.ts     # All /api/config/manifest/* routes
├── services/
│   ├── sync.service.ts        # Job orchestration, status tracking, logging
│   ├── freshness.service.ts   # Freshness CRUD + queries
│   └── manifest.service.ts    # Manifest CRUD + versioning + rollback + validation
└── jobs/
    ├── sync-worker.ts         # Background job runner for sync jobs
    └── freshness-decay.ts     # Daily job: decay freshness scores based on age
```

**Instructions for Agent 8:**

1. **Scheduler**: reads `SyncSchedule` table, uses `node-cron` to trigger jobs at configured intervals. Creates `SyncJob` record per execution.
2. **Capacity refresh**: generates email from template with merge fields (contact name, line name) → sends via email service → tracks `inquiry_status` per contact → on response (detected by EmailParser), updates capacity records.
3. **AMS adapters**: implement adapter interface `{ connect(), pullPolicies(dateRange), mapFields(rawData, fieldMapping) }`. Start with CSV import as the universal fallback.
4. **Freshness engine**: runs daily. For each `DataFreshnessScore` record, calculate `freshness_score = max(0, 1 - (days_since_verification / staleness_threshold_days))`. If score drops below 0.3, emit `sync:dataStale` event. If auto-trigger is configured, initiate refresh.
5. **Reconciliation**: compare `SubmissionTarget` records where `status = 'bound'` against policies from AMS. Flag mismatches. Emit `sync:reconciliationMismatch`.
6. **Manifest service**: CRUD for `PlatformManifest` table. On update, increment version, archive old version, emit `config:manifestUpdated` event. Rollback: set requested version as active, deactivate current.
7. **Test:** Scheduler triggers test. Capacity refresh email generation test. CSV import adapter test with sample file. Freshness decay calculation test. Reconciliation matching test. Manifest CRUD + versioning + rollback test.

---

## Agent 9: UnderwriterMatcher & Network Graph

**Depends on:** Agent 0, Agent 3, Agent 4

**Owns:** `apps/api/src/routes/{match,network}.ts`, `apps/api/src/services/{matcher,network}.service.ts`

**Deliverables:**

```
apps/api/src/
├── routes/
│   ├── match.ts               # POST /underwriters, GET /explain/:matchId
│   └── network.ts             # GET (graph data), GET /search, POST /relationships, PUT /relationships/:id, POST /introductions
├── services/
│   ├── matcher.service.ts     # Scoring engine with weighted factors
│   └── network.service.ts     # Network CRUD, graph query, path finding, introduction workflow
└── lib/
    └── scoring.ts             # Scoring algorithm implementation
```

**Instructions for Agent 9:**

1. **Matcher scoring** (from PRD Section 5.23):
   - Input: `{ client_id, line_of_business_id, requested_limit }`
   - Fetch client profile → get industry, state, size
   - Query capacity search for matching underwriters
   - For each candidate, calculate weighted score:
     - Appetite match (25%): does underwriter's `appetite_classes` include client's industry?
     - Available capacity (20%): is `available_capacity >= requested_limit`?
     - Relationship strength (20%): query NetworkRelationship for current user's team
     - Historical hit ratio (15%): count past `SubmissionTarget` where this underwriter quoted/bound vs total
     - Regional alignment (10%): underwriter's `appetite_states` includes client's state
     - Response time (10%): avg days between `sent_at` and first status change on past SubmissionTargets
   - Return ranked list with per-factor score breakdown
   - `GET /explain/:matchId` returns natural language explanation

2. **Network graph**:
   - `GET /network` returns nodes (users + contacts) and edges (relationships) for D3.js rendering
   - `GET /network/search` supports: "find path from current user to contact X" — BFS through NetworkRelationship graph
   - `POST /introductions` creates a notification to the colleague who has the relationship
3. **Test:** Matcher scoring with various scenarios (perfect match, no match, partial). Network path-finding test. Introduction workflow test.

---

## Agent 10: AI Workflow Assistant

**Depends on:** Agent 0, Agent 3, Agent 4, Agent 6, Agent 9

**Owns:** `apps/api/src/routes/ai.ts`, `apps/api/src/ai/assistant/`

**Deliverables:**

```
apps/api/src/
├── routes/
│   └── ai.ts                  # POST /chat, GET /history, POST /execute-action
├── ai/
│   └── assistant/
│       ├── system-prompt.ts   # Dynamic system prompt builder (includes user context, page context, entity schemas)
│       ├── tools.ts           # Claude tool definitions for all platform APIs (from PRD Section 7.1.2)
│       ├── orchestrator.ts    # Main assistant logic: receive message → call Claude with tools → execute actions → return response
│       ├── intent-parser.ts   # Post-processing: extract confirmed actions from Claude response
│       └── context.ts         # Builds context object: current user, current page, selected entities
└── services/
    └── ai.service.ts          # Chat history management, action execution with permission checks
```

**Instructions for Agent 10:**

1. **System prompt** must dynamically include:
   - User context: `{name, role, region, team}`
   - Page context: `{current_page, selected_client_id?, selected_submission_id?}`
   - Available tools (from `tools.ts`)
   - Behavioral rules: "Always confirm before creating or sending. Explain your reasoning. Respect user's permission level."
2. **Tool definitions** (from PRD Section 7.1.2): `search_clients`, `get_client`, `search_contacts`, `create_contact`, `search_capacity`, `match_underwriters`, `search_network`, `create_submission`, `add_submission_target`, `get_submission_status`, `send_notification`, `search_emails`, `draft_email`, `check_data_freshness`, `trigger_capacity_refresh`, `get_sync_status`, `get_reconciliation_mismatches`.
3. Each tool maps to an internal service call. The orchestrator handles multi-turn tool use (Claude calls tool → gets result → calls another tool → etc.).
4. **Action execution**: before executing write actions (create, send, update), return a confirmation card to the user. Only execute on explicit confirmation.
5. Model: `claude-sonnet-4-20250514`. Use Anthropic SDK with tool use.
6. **Test:** Test with sample conversations from PRD Section 5.22 sample interactions. Test permission enforcement (servicer can't execute admin actions via assistant). Test multi-tool-call chains.

---

## Agent 11: App Shell, Routing, Design System

**Depends on:** Agent 0

**Owns:** `apps/web/src/components/`, `apps/web/src/routes/`, `apps/web/src/store/`, `apps/web/src/lib/`, `apps/web/src/app.tsx`, `apps/web/tailwind.config.ts`

**Deliverables:**

```
apps/web/src/
├── app.tsx                    # Root app with router, store provider, auth guard
├── routes/
│   └── index.tsx              # All route definitions from PRD Section 9.2
├── components/
│   ├── ui/                    # shadcn/ui base components (Button, Input, Modal, Dialog, DropdownMenu, Badge, Avatar, etc.)
│   ├── layout/
│   │   ├── AppShell.tsx       # Main layout: sidebar + header + content + AI panel
│   │   ├── Sidebar.tsx        # Collapsible sidebar nav — reads from navigation manifest
│   │   ├── Header.tsx         # Logo, GlobalSearch trigger, notification bell, AI toggle, user menu
│   │   └── AIPanelSlot.tsx    # Right panel container for AI assistant (renders children from Agent 16)
│   ├── shared/
│   │   ├── DataTable.tsx      # Generic sortable/filterable/paginated table component
│   │   ├── EntityForm.tsx     # Generic form component with Zod validation
│   │   ├── StatusBadge.tsx    # Colored status badge (reads colors from enum/config)
│   │   ├── FreshnessBadge.tsx # Green/yellow/red freshness indicator
│   │   ├── SearchInput.tsx    # Reusable search input with debounce
│   │   ├── FilterBar.tsx      # Reusable filter bar component
│   │   ├── EmptyState.tsx     # Empty state placeholder
│   │   ├── LoadingState.tsx   # Skeleton loading states
│   │   ├── ConfirmDialog.tsx  # Confirmation modal
│   │   └── PageHeader.tsx     # Page title + actions bar
│   └── global-search/
│       └── GlobalSearch.tsx   # Cmd+K search modal
├── store/
│   ├── index.ts               # Combined Zustand store
│   ├── authSlice.ts
│   ├── clientSlice.ts
│   ├── contactSlice.ts
│   ├── carrierSlice.ts
│   ├── lobSlice.ts
│   ├── capacitySlice.ts
│   ├── submissionSlice.ts
│   ├── emailSlice.ts
│   ├── networkSlice.ts
│   ├── uiSlice.ts
│   ├── activitySlice.ts
│   ├── notificationSlice.ts
│   ├── syncSlice.ts
│   └── configSlice.ts
├── lib/
│   ├── api-client.ts          # Axios/fetch wrapper with auth header injection, error handling
│   ├── event-bus.ts           # Frontend event bus (EventEmitter or Zustand middleware)
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts  # Hook that checks current user's permissions against manifest
│   │   ├── usePagination.ts
│   │   ├── useDebounce.ts
│   │   └── useEventBus.ts
│   └── utils.ts               # Frontend utilities
└── styles/
    └── globals.css            # Tailwind base + custom design tokens
```

**Instructions for Agent 11:**

1. **Design system**: Use Tailwind CSS + shadcn/ui. Color palette: Primary `#1B3A5C` (navy), Secondary `#2E75B6` (blue), Success `#16A34A`, Warning `#EAB308`, Danger `#DC2626`. Background: `#F8FAFC`. Cards: white with subtle border.
2. **Sidebar**: reads navigation items from `configSlice` (populated from navigation manifest). Highlights active route. Collapsible to icons on small screens. Admin section only visible to admin role.
3. **Store slices**: each slice follows the pattern: `{ items: [], selectedId: null, filters: {}, isLoading: false, error: null, actions: { fetch, create, update, delete, setFilter, setSelected } }`. Use `immer` middleware for immutable updates.
4. **API client**: auto-injects JWT from authSlice. On 401, attempts token refresh. On failure, redirects to login.
5. **DataTable**: accepts column definitions + data + handlers. Supports: sort, filter, paginate, row selection, row click, bulk actions. This is the most reused component — make it excellent.
6. **GlobalSearch**: Cmd+K opens modal. Debounced search. Results grouped by entity type. Click navigates to entity detail page.
7. **Test:** Component rendering tests for all shared components. Store slice unit tests. API client mock tests. Route rendering test.

---

## Agent 12: Frontend — Contacts, Clients, Teams

**Depends on:** Agent 3 (API), Agent 11 (shell)

**Owns:** `apps/web/src/features/{clients,contacts,team}/`

**Deliverables:**

```
apps/web/src/features/
├── clients/
│   ├── ClientManager.tsx      # Client list page with DataTable, filters, search, create button
│   ├── ClientDetail.tsx       # Tabbed detail: Overview, Submissions, Documents, Activity, Renewals
│   ├── ClientForm.tsx         # Create/edit form with all fields from PRD 4.1.3
│   ├── hooks/
│   │   └── useClients.ts      # API hooks: useClients, useClient, useCreateClient, useUpdateClient
│   └── index.ts
├── contacts/
│   ├── ContactManager.tsx     # Contact list with carrier/LOB/region filters
│   ├── ContactDetail.tsx      # Tabbed detail: Profile, Capacity, Network, Activity
│   ├── ContactForm.tsx        # Create/edit with carrier link, LOB multi-select
│   ├── hooks/
│   │   └── useContacts.ts
│   └── index.ts
└── team/
    ├── TeamManager.tsx        # Team list + member assignment
    ├── UserProfile.tsx        # User detail: region, specialties, network
    ├── hooks/
    │   └── useTeam.ts
    └── index.ts
```

**Instructions for Agent 12:**

1. Use `DataTable` from Agent 11 for all list views. Pass column definitions specific to each entity.
2. Client detail tabs: Overview (fields), Submissions (linked submissions list), Documents (linked attachments), Activity (ActivityFeed scoped to client), Renewals (upcoming renewals for this client).
3. Contact detail tabs: Profile (fields), Capacity (CapacityMatrix filtered to this contact), Network (which internal team members know this contact), Activity.
4. All forms use `EntityForm` from Agent 11 with Zod schemas from `packages/shared`.
5. **Test:** Page render tests. Form submission tests (mock API). Filter/search tests.

---

## Agent 13: Frontend — Carriers, LOB, Forms, Capacity Matrix

**Depends on:** Agent 4 (API), Agent 11 (shell)

**Owns:** `apps/web/src/features/{carriers,lines,forms,capacity}/`

**Deliverables:**

```
apps/web/src/features/
├── carriers/
│   ├── CarrierManager.tsx     # Carrier directory with AM Best rating badges
│   ├── CarrierDetail.tsx      # Tabs: Profile, Contacts, Lines, Forms
│   ├── CarrierForm.tsx
│   ├── hooks/
│   │   └── useCarriers.ts
│   └── index.ts
├── lines/
│   ├── LineOfBusinessManager.tsx  # Tree view with parent-child hierarchy
│   ├── LineForm.tsx
│   ├── hooks/
│   │   └── useLines.ts
│   └── index.ts
├── forms/
│   ├── FormsPaperRegistry.tsx # Searchable registry with carrier/LOB filters
│   ├── FormForm.tsx
│   ├── hooks/
│   │   └── useForms.ts
│   └── index.ts
└── capacity/
    ├── CapacityMatrix.tsx     # THE power component — interactive grid: underwriter × line × carrier → capacity
    ├── CapacitySearch.tsx     # Advanced search panel: filter by line, carrier, limit, state, industry
    ├── CapacityForm.tsx       # Add/edit capacity entry
    ├── hooks/
    │   └── useCapacity.ts
    └── index.ts
```

**Instructions for Agent 13:**

1. **CapacityMatrix**: This is the most complex grid. Rows = underwriters. Columns = Line, Carrier, Form, Min Limit, Max Limit, Available Capacity, Appetite States, Status. Color-code capacity utilization: green (>50% available), yellow (20-50%), red (<20%).
2. **CapacitySearch**: sidebar filter panel with: LOB dropdown, carrier dropdown, min limit slider, state multi-select, industry class text search, "has available capacity" toggle. Hitting search calls `GET /capacity/search`.
3. **LOB tree view**: indented list showing parent lines with expandable children. Drag-and-drop reordering (optional).
4. **Test:** CapacityMatrix rendering with mock data. Filter interaction tests. Tree view expand/collapse.

---

## Agent 14: Frontend — Submissions, Placements, Renewals

**Depends on:** Agent 6 (API), Agent 11 (shell)

**Owns:** `apps/web/src/features/{submissions,placements,renewals}/`

**Deliverables:**

```
apps/web/src/features/
├── submissions/
│   ├── SubmissionBuilder.tsx  # Multi-step wizard: Client → Lines → Match → Targets → Attachments → Template → Review → Send
│   ├── SubmissionDetail.tsx   # Submission detail with targets list
│   ├── steps/
│   │   ├── SelectClient.tsx
│   │   ├── SelectLines.tsx
│   │   ├── MatchUnderwriters.tsx  # Shows UnderwriterMatcher results with scores
│   │   ├── SelectTargets.tsx
│   │   ├── AttachDocuments.tsx
│   │   ├── GenerateCoverLetter.tsx
│   │   ├── ReviewSubmission.tsx
│   │   └── ConfirmSend.tsx
│   ├── hooks/
│   │   └── useSubmissions.ts
│   └── index.ts
├── placements/
│   ├── PlacementTracker.tsx   # Kanban board with drag-and-drop status transitions
│   ├── PlacementCard.tsx      # Individual card: client, line, carrier, premium, aging
│   ├── PlacementTimeline.tsx  # Gantt-style timeline view
│   ├── PlacementDetail.tsx    # Side panel with full submission + quote comparison
│   ├── hooks/
│   │   └── usePlacements.ts
│   └── index.ts
└── renewals/
    ├── RenewalCalendar.tsx    # Month/week/list calendar with color-coded renewal cards
    ├── RenewalCard.tsx        # Individual renewal: client, line, expiration, status
    ├── hooks/
    │   └── useRenewals.ts
    └── index.ts
```

**Instructions for Agent 14:**

1. **SubmissionBuilder**: multi-step wizard with progress bar. Each step validates before proceeding. Step 3 (MatchUnderwriters) calls the matcher API and displays ranked results with score breakdowns. Allow user to select/deselect underwriters.
2. **PlacementTracker kanban**: columns from workflow definition manifest. Cards are draggable between columns (subject to allowed transitions). Clicking a card opens side panel with full detail. Show aging badge (orange if > expected response time, red if > 2x).
3. **RenewalCalendar**: use a calendar library (react-big-calendar or similar). Color: green = bound, yellow = in progress, red = not started, gray = lost. Click event opens client detail or starts new submission.
4. **Test:** Wizard step navigation tests. Kanban drag-drop tests. Calendar rendering with mock renewal data.

---

## Agent 15: Frontend — Email UI

**Depends on:** Agent 7 (API), Agent 11 (shell)

**Owns:** `apps/web/src/features/{email,import}/`

**Deliverables:**

```
apps/web/src/features/
├── email/
│   ├── EmailInbox.tsx         # Threaded inbox view with auto-linking badges
│   ├── EmailThread.tsx        # Conversation thread view
│   ├── EmailComposer.tsx      # Rich text editor with recipient picker, template select, attachments
│   ├── EmailParserReview.tsx  # Side-by-side: original email vs extracted data, confirm/edit/reject
│   ├── RecipientPicker.tsx    # Search contacts, select recipients, CC/BCC
│   ├── hooks/
│   │   ├── useEmails.ts
│   │   └── useEmailParser.ts
│   └── index.ts
└── import/
    ├── EmailImporter.tsx      # Import wizard: Connect → Scan → Preview → Import → Report
    ├── steps/
    │   ├── ConnectProvider.tsx # OAuth connect for Gmail/Outlook
    │   ├── ScanPreview.tsx    # Shows matched contacts + email counts before import
    │   ├── ImportProgress.tsx # Progress bar during batch import
    │   └── ImportReport.tsx   # Per-contact summary: emails imported, relationship strength assigned, topics
    ├── hooks/
    │   └── useEmailImport.ts
    └── index.ts
```

**Instructions for Agent 15:**

1. **EmailComposer**: rich text editor (TipTap or Slate). Recipient picker searches ContactManager. Template dropdown auto-populates body with merge fields resolved. Attach files from AttachmentManager or upload new.
2. **EmailParserReview**: left panel shows original email (HTML rendered). Right panel shows extracted JSON fields in editable form. Confidence badges per field (green/yellow/red). "Confirm" button updates SubmissionTarget.
3. **EmailImporter wizard**: Step 1 shows OAuth connect buttons (Google, Microsoft). Step 2 shows scanning animation then matched contacts table. Step 3 shows real-time progress. Step 4 shows enrichment results per contact.
4. **Test:** Composer form tests. Parser review confirm/edit flow. Import wizard step progression.

---

## Agent 16: Frontend — AI Assistant, Network Graph, Dashboard

**Depends on:** Agent 9, Agent 10 (APIs), Agent 11 (shell)

**Owns:** `apps/web/src/features/{ai,network,dashboard}/`

**Deliverables:**

```
apps/web/src/features/
├── ai/
│   ├── AIWorkflowAssistant.tsx  # Chat panel with message history, action cards, confirmation prompts
│   ├── ChatMessage.tsx          # Individual message bubble (user or assistant)
│   ├── ActionCard.tsx           # Rendered action result (e.g., underwriter recommendations, submission created)
│   ├── ConfirmationCard.tsx     # "Confirm action?" card with approve/reject buttons
│   ├── SuggestedActions.tsx     # Context-aware quick action buttons
│   ├── hooks/
│   │   └── useAIAssistant.ts
│   └── index.ts
├── network/
│   ├── NetworkGraph.tsx         # D3.js force-directed graph: team members ↔ underwriters
│   ├── NetworkSearch.tsx        # "Find path to contact" search
│   ├── RelationshipPanel.tsx    # Edit relationship: strength, notes, deals
│   ├── IntroductionRequest.tsx  # Request colleague to introduce you
│   ├── hooks/
│   │   └── useNetwork.ts
│   └── index.ts
└── dashboard/
    ├── Dashboard.tsx            # Main dashboard page
    ├── KPICards.tsx             # Top-level metric cards: submissions, hit ratio, bind ratio, etc.
    ├── charts/
    │   ├── SubmissionsOverTime.tsx     # Line chart
    │   ├── PlacementsByCarrier.tsx     # Bar chart
    │   ├── HitRatioByLine.tsx         # Bar chart
    │   ├── PremiumByLine.tsx          # Pie chart
    │   ├── PipelineFunnel.tsx         # Funnel chart
    │   └── DataHealthGauge.tsx        # Freshness percentage gauge
    ├── hooks/
    │   └── useDashboard.ts
    └── index.ts
```

**Instructions for Agent 16:**

1. **AI Assistant**: persistent right panel. Chat input at bottom. Messages scroll. When Claude returns tool results, render them as `ActionCard` components (e.g., a table of matched underwriters). When Claude wants to execute an action, render `ConfirmationCard`. On confirm, call `POST /ai/execute-action`.
2. **NetworkGraph**: D3.js force-directed graph. Blue nodes = internal team members. Green nodes = underwriter contacts. Edge thickness = relationship strength. Click node to see details. Filter by region, carrier. "Find path" highlights shortest connection.
3. **Dashboard**: top row = KPI cards (use Recharts). Main area = grid of charts. All charts accept date range and filter props. Data health gauge from DataSyncEngine freshness data.
4. **Test:** AI chat message rendering. Action card rendering. Network graph node/edge rendering. Dashboard chart rendering with mock data.

---

## Agent 17: Frontend — Sync Admin, Config Admin, Notifications

**Depends on:** Agent 8 (API), Agent 11 (shell)

**Owns:** `apps/web/src/features/{sync,config,notifications,activity}/`

**Deliverables:**

```
apps/web/src/features/
├── sync/
│   ├── SyncDashboard.tsx      # Overview: active schedules, recent jobs, connection status
│   ├── ScheduleBuilder.tsx    # Create/edit sync schedules with cron preview
│   ├── ConnectionManager.tsx  # Add/edit/test AMS connections
│   ├── FieldMappingEditor.tsx # Drag-and-drop field mapping
│   ├── FreshnessMonitor.tsx   # Platform-wide data freshness report with entity breakdown
│   ├── ReconciliationView.tsx # Submission vs AMS policy mismatches
│   ├── JobHistory.tsx         # Sync job history with logs
│   ├── hooks/
│   │   └── useSync.ts
│   └── index.ts
├── config/
│   ├── ConfigAdmin.tsx        # Main config admin page with tabs per manifest type
│   ├── EntityBuilder.tsx      # Visual entity definition editor
│   ├── FieldSchemaEditor.tsx  # Add/edit fields on entities
│   ├── WorkflowDesigner.tsx   # Visual pipeline stage editor
│   ├── PermissionManager.tsx  # Role × Entity CRUD matrix
│   ├── NavigationEditor.tsx   # Drag-and-drop nav ordering
│   ├── BusinessRuleBuilder.tsx # If-then rule builder
│   ├── ManifestHistory.tsx    # Version history with diff view
│   ├── hooks/
│   │   └── useConfig.ts
│   └── index.ts
├── notifications/
│   ├── NotificationCenter.tsx # Bell dropdown with notification list
│   ├── NotificationItem.tsx   # Individual notification with icon, message, timestamp
│   ├── hooks/
│   │   └── useNotifications.ts
│   └── index.ts
└── activity/
    ├── ActivityFeed.tsx       # Chronological timeline of activities
    ├── ActivityItem.tsx       # Individual activity with icon, message, entity link
    ├── hooks/
    │   └── useActivities.ts
    └── index.ts
```

**Instructions for Agent 17:**

1. **ConfigAdmin**: admin-only page. Tab per manifest type. Each tab shows list of current configs with edit buttons. Edit opens visual editor specific to that manifest type. Save creates new version, emits `config:manifestUpdated`.
2. **WorkflowDesigner**: show pipeline stages as connected cards. Add/remove/reorder stages. Define transitions with drag-and-drop arrows. Configure auto-actions per transition.
3. **FreshnessMonitor**: table view of all entities with freshness scores. Color-coded. Click to drill into specific records. "Refresh now" button triggers manual sync.
4. **NotificationCenter**: bell icon in header shows unread count badge. Dropdown shows recent notifications sorted by time. Click navigates to relevant entity. "Mark all read" button.
5. **Test:** Config editor save/load tests. Notification rendering. Activity feed rendering. Freshness monitor display.

---

## Agent 18: Manifest System & Dynamic Renderers

**Depends on:** ALL previous agents (this is the refactor layer)

**Owns:** `apps/web/src/features/dynamic/`, updates to `apps/web/src/store/configSlice.ts`

**Deliverables:**

```
apps/web/src/features/
└── dynamic/
    ├── DynamicEntityList.tsx   # Reads entity definition + field schema + UI layout → renders DataTable
    ├── DynamicEntityDetail.tsx # Reads entity definition + field schema + UI layout → renders tabbed detail
    ├── DynamicEntityForm.tsx   # Reads entity definition + field schema + UI layout → renders form
    ├── DynamicWorkflowBoard.tsx # Reads workflow definition → renders kanban
    ├── DynamicNavigation.tsx   # Reads navigation manifest → renders sidebar items
    ├── DynamicFieldRenderer.tsx # Reads field schema → renders correct input type
    ├── renderers/
    │   ├── TextFieldRenderer.tsx
    │   ├── EnumFieldRenderer.tsx
    │   ├── RefFieldRenderer.tsx    # UUID reference with autocomplete lookup
    │   ├── DateFieldRenderer.tsx
    │   ├── AddressFieldRenderer.tsx
    │   ├── TagsFieldRenderer.tsx
    │   ├── BooleanFieldRenderer.tsx
    │   ├── NumberFieldRenderer.tsx
    │   ├── RichTextFieldRenderer.tsx
    │   └── index.ts               # Field type → renderer mapping
    ├── hooks/
    │   ├── useManifest.ts          # Fetch + cache manifest configs
    │   ├── useDynamicEntity.ts     # Combines entity def + field schema + layout for a given entity key
    │   └── useDynamicPermissions.ts # Evaluates permission matrix for current user + entity
    └── index.ts
```

**Instructions for Agent 18:**

1. **DynamicEntityList**: given an `entityKey`, fetch the entity definition, field schemas (where `show_in_list = true`), and UI layout (list_view) from configSlice. Render a DataTable with columns, filters, and actions all driven by config. This component should be able to render a list view for ANY entity — existing or future.
2. **DynamicEntityForm**: given an `entityKey` and `mode` (create|edit), fetch field schemas and UI layout (create_form|edit_form). Render form fields using DynamicFieldRenderer. Apply Zod validation built from field schema validation_rules. Handle conditional visibility.
3. **DynamicFieldRenderer**: switch on `field_type` → delegate to specific renderer. Each renderer handles its own validation display, placeholder, help text.
4. **Migration path**: do NOT replace existing components. Add `?dynamic=true` query param support to existing routes. When present, render dynamic version. This allows A/B comparison during migration.
5. **Test:** Render DynamicEntityList for "client" entity with mock manifest → verify columns match field schemas. Render DynamicEntityForm → verify all field types render correctly. Test conditional visibility. Test permission-based field hiding.

---

## Agent 19: E2E Tests, CI/CD, Deploy

**Depends on:** ALL agents

**Owns:** `e2e/`, `.github/workflows/`, `docker-compose.yml`, deployment configs

**Deliverables:**

```
├── e2e/
│   ├── tests/
│   │   ├── auth.spec.ts           # Login, register, permission enforcement
│   │   ├── client-lifecycle.spec.ts # Create client → create submission → track placement
│   │   ├── submission-flow.spec.ts  # Full submission: client → lines → match → targets → send
│   │   ├── email-flow.spec.ts      # Send email → receive reply → parse → update placement
│   │   ├── capacity-search.spec.ts  # Query capacity matrix with filters
│   │   ├── ai-assistant.spec.ts     # Chat with AI → verify tool calls → confirm action
│   │   ├── sync-flow.spec.ts        # Trigger sync → verify capacity updated
│   │   └── config-change.spec.ts    # Change manifest → verify UI updates dynamically
│   ├── fixtures/
│   │   └── test-data.ts            # Seed data for E2E tests
│   └── playwright.config.ts
├── .github/
│   └── workflows/
│       ├── ci.yml                  # On PR: lint, type-check, unit tests, build
│       ├── e2e.yml                 # On merge to main: run E2E tests
│       └── deploy.yml              # On tag: deploy to staging/production
├── docker-compose.yml              # Local dev: PostgreSQL, Redis, API, Web
├── Dockerfile.api
├── Dockerfile.web
└── .env.example
```

**Instructions for Agent 19:**

1. **E2E tests**: use Playwright. Each test file covers a complete user journey, not individual components.
2. **CI pipeline**: lint (ESLint) → type-check (tsc --noEmit on all packages) → unit tests (Vitest) → build → E2E (on merge only).
3. **Docker compose**: PostgreSQL 16, Redis 7, API service (Node 20), Web service (Vite dev server). Single `docker compose up` starts everything.
4. **.env.example**: document all required env vars: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `SENDGRID_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `STORAGE_BUCKET`, etc.
5. **Test:** CI pipeline runs green on a fresh clone. Docker compose starts all services. E2E tests pass against docker compose environment.

---

## Cross-Agent Integration Contracts

These are the seams where agents must agree. Agent 0 defines them; all agents consume them.

| Contract | Defined In | Consumed By |
|----------|-----------|-------------|
| Entity TypeScript interfaces | `packages/shared/types/entities/` | All agents |
| API request/response types | `packages/shared/types/api/` | All backend + frontend agents |
| Zod validation schemas | `packages/shared/validation/` | Agent 2 (middleware), all frontend form agents |
| Event bus event types | `packages/shared/types/events.ts` | Agent 6, 7, 8 (emit), Agent 11+ (subscribe) |
| Zustand store slice interfaces | `apps/web/src/store/` (Agent 11) | All frontend agents |
| Shared UI components | `apps/web/src/components/` (Agent 11) | All frontend agents |
| Manifest schema types | `packages/manifest/schema/` (Agent 0) | Agent 8, 17, 18 |
| Database connection | `packages/db/connection.ts` (Agent 1) | All backend agents |
| Auth middleware | `apps/api/src/middleware/` (Agent 2) | All backend route agents |

---

## Spawn Order (for Claude Code)

```bash
# TIER 0 — Run first, wait for completion
claude-code agent-0-contracts

# TIER 1 — Run in parallel after Agent 0
claude-code agent-1-database &
claude-code agent-2-auth &
wait

# TIER 2 — Run in parallel after Tier 1
claude-code agent-3-core-entities &
claude-code agent-4-reference-data &
claude-code agent-5-documents &
wait

# TIER 3 — Run in parallel after Tier 2
claude-code agent-6-submissions &
claude-code agent-7-email &
claude-code agent-8-sync &
wait

# TIER 4 — Run in parallel after Tier 2+3
claude-code agent-9-matcher-network &
claude-code agent-10-ai-assistant &
wait

# TIER 5 — Can start after Agent 0 (parallel with Tier 2+)
# But listed here for clarity
claude-code agent-11-app-shell

# TIER 6 — Run in parallel after Tier 5 + respective backend
claude-code agent-12-fe-contacts-clients &
claude-code agent-13-fe-carriers-capacity &
claude-code agent-14-fe-submissions &
claude-code agent-15-fe-email &
claude-code agent-16-fe-ai-dashboard &
claude-code agent-17-fe-sync-config &
wait

# TIER 7 — After all above
claude-code agent-18-manifest-renderers

# TIER 8 — Final
claude-code agent-19-e2e-cicd
```
