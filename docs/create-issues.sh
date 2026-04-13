#!/bin/bash
# =============================================================================
# BrokerFlow — GitHub Issue Generator
# =============================================================================
# Prerequisites:
#   1. GitHub CLI installed: brew install gh
#   2. Authenticated: gh auth login
#   3. Run from the repo root: cd brokerflow && bash docs/create-issues.sh
#
# What this script does:
#   1. Creates labels for tiers and agents
#   2. Creates all 20 agent issues
#   3. Creates 3 mega-issues that orchestrate agents in tier order
#   4. Assigns Claude to the first mega-issue to start the build
# =============================================================================

set -e

REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
echo "🏗️  Creating BrokerFlow issues in: $REPO"
echo ""

# =============================================================================
# STEP 1: Create Labels
# =============================================================================
echo "📌 Creating labels..."

declare -A TIER_COLORS=(
  ["tier-0"]="B60205"
  ["tier-1"]="D93F0B"
  ["tier-2"]="E99695"
  ["tier-3"]="F9D0C4"
  ["tier-4"]="FEF2C0"
  ["tier-5"]="C2E0C6"
  ["tier-6"]="BFDADC"
  ["tier-7"]="C5DEF5"
  ["tier-8"]="BFD4F2"
)

for tier in "${!TIER_COLORS[@]}"; do
  gh label create "$tier" --color "${TIER_COLORS[$tier]}" --description "Dependency $tier" --force 2>/dev/null || true
done

for i in $(seq 0 19); do
  gh label create "agent-$i" --color "EDEDED" --description "Agent $i from AGENTS.md" --force 2>/dev/null || true
done

gh label create "blocking" --color "B60205" --description "Blocks other tiers" --force 2>/dev/null || true
gh label create "backend" --color "0E8A16" --description "Backend work" --force 2>/dev/null || true
gh label create "frontend" --color "1D76DB" --description "Frontend work" --force 2>/dev/null || true
gh label create "contracts" --color "5319E7" --description "Shared types/schemas" --force 2>/dev/null || true
gh label create "mega-issue" --color "FBCA04" --description "Orchestration issue" --force 2>/dev/null || true

echo "✅ Labels created"
echo ""

# =============================================================================
# STEP 2: Create Agent Issues
# =============================================================================
echo "📝 Creating agent issues..."

# Store issue numbers as we create them
declare -A ISSUE_NUMS

# --- Agent 0 ---
ISSUE_NUMS[0]=$(gh issue create \
  --title "[Agent 0] Shared Contracts & Schema Foundation" \
  --label "tier-0,agent-0,backend,contracts,blocking" \
  --body '## Priority
🔴 **CRITICAL — blocks everything.**

## Instructions
Read `docs/AGENTS.md` section **"Agent 0: Shared Contracts & Schema Foundation"** for the complete file tree and instructions. Read `docs/BrokerFlow_PRD_v2.0.docx` Section 4 (Data Model), Section 6 (Shared State), Section 13 (Config-Driven Architecture).

## Deliverables
- `packages/shared/src/types/entities/` — TypeScript interfaces for all 18 entities (every field from PRD Section 4)
- `packages/shared/src/types/enums.ts` — All 20 enum types
- `packages/shared/src/types/api/` — Request/response/filter types
- `packages/shared/src/types/events.ts` — All 13 event bus event types
- `packages/shared/src/validation/schemas.ts` — Zod schema per entity
- `packages/shared/src/constants/` — defaults.ts, permissions.ts
- `packages/shared/src/utils/` — formatting.ts, capacity.ts
- `packages/db/schema/schema.sql` — Complete PostgreSQL DDL (18 tables, FKs, indexes, GIN indexes)
- `packages/manifest/src/schema/` — TypeScript types for all 7 manifest types
- `packages/manifest/src/defaults/` — Default JSON configs for entities, fields, workflows, navigation, permissions
- `packages/manifest/src/validation/manifest-validator.ts`
- Tests for Zod schemas, utils, and manifest validator

## Acceptance Criteria
- [ ] `cd packages/shared && npx tsc --noEmit` passes
- [ ] `cd packages/shared && npx vitest run` passes
- [ ] `cd packages/manifest && npx tsc --noEmit` passes
- [ ] All interfaces have JSDoc comments
- [ ] No `any` types
- [ ] SQL schema has all 18 tables with proper constraints

**Branch:** `agent-0/shared-contracts`' \
  --json number -q '.number')
echo "  ✅ Agent 0: #${ISSUE_NUMS[0]}"

# --- Agent 1 ---
ISSUE_NUMS[1]=$(gh issue create \
  --title "[Agent 1] Database & Migrations" \
  --label "tier-1,agent-1,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[0]} (Agent 0)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 1\"**. Split \`packages/db/schema/schema.sql\` from Agent 0 into ordered migrations. Create realistic seed data. Build connection module.

## Deliverables
- \`packages/db/migrations/\` — 15 ordered migration files
- \`packages/db/seeds/\` — 6 seed files with real carrier names, LOBs, sample clients/contacts
- \`packages/db/src/connection.ts\` — PostgreSQL connection via DATABASE_URL
- \`packages/db/src/migrate.ts\` — Migration runner
- \`packages/db/src/seed.ts\` — Seed runner

## Acceptance Criteria
- [ ] Migrations run forward cleanly on fresh PostgreSQL
- [ ] Seeds populate without constraint violations
- [ ] \`npm run db:migrate && npm run db:seed\` works end-to-end

**Branch:** \`agent-1/database\`" \
  --json number -q '.number')
echo "  ✅ Agent 1: #${ISSUE_NUMS[1]}"

# --- Agent 2 ---
ISSUE_NUMS[2]=$(gh issue create \
  --title "[Agent 2] Auth & RBAC" \
  --label "tier-1,agent-2,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[0]} (Agent 0)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 2\"**. Build JWT auth, role-based authorization reading from permission manifest, Zod validation middleware, audit logging.

## Deliverables
- \`apps/api/src/middleware/\` — authenticate.ts, authorize.ts, rate-limit.ts, error-handler.ts, validate.ts, audit-log.ts
- \`apps/api/src/routes/auth.ts\` — login, register, refresh, me, logout
- \`apps/api/src/services/auth.service.ts\`
- \`apps/api/src/lib/\` — jwt.ts, password.ts, permissions.ts
- Unit tests for JWT, permission evaluation, row-level filters

## Acceptance Criteria
- [ ] JWT access (15 min) + refresh (7 days) working
- [ ] \`authorize(entityKey, action)\` reads permission manifest
- [ ] Row-level filters inject WHERE clauses
- [ ] Audit log records all mutations
- [ ] Tests pass

**Branch:** \`agent-2/auth-rbac\`" \
  --json number -q '.number')
echo "  ✅ Agent 2: #${ISSUE_NUMS[2]}"

# --- Agent 3 ---
ISSUE_NUMS[3]=$(gh issue create \
  --title "[Agent 3] Core Entity APIs — Users, Teams, Clients, Contacts" \
  --label "tier-2,agent-3,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[0]}, #${ISSUE_NUMS[1]}, #${ISSUE_NUMS[2]} (Agents 0, 1, 2)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 3\"**. CRUD routes + services for Users, Teams, Clients, Contacts with filtering, pagination, permissions.

## Deliverables
- \`apps/api/src/routes/\` — users.ts, teams.ts, clients.ts, contacts.ts
- \`apps/api/src/services/\` — user/team/client/contact.service.ts
- \`apps/api/src/queries/\` — user/team/client/contact.queries.ts
- Integration tests for all endpoints

## Acceptance Criteria
- [ ] All CRUD endpoints with pagination, sorting, filtering
- [ ] Client filters: status, servicer, team, tags, industry, state
- [ ] Contact filters: type, carrier, LOB, region
- [ ] \`GET /contacts/:id/network\` and \`/capacity\` return joined data
- [ ] Events emitted on create
- [ ] Permission enforcement tested

**Branch:** \`agent-3/core-entities\`" \
  --json number -q '.number')
echo "  ✅ Agent 3: #${ISSUE_NUMS[3]}"

# --- Agent 4 ---
ISSUE_NUMS[4]=$(gh issue create \
  --title "[Agent 4] Reference Data APIs — Carriers, LOBs, Forms, Capacity" \
  --label "tier-2,agent-4,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[0]}, #${ISSUE_NUMS[1]}, #${ISSUE_NUMS[2]} (Agents 0, 1, 2)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 4\"**. CRUD for Carriers, LOBs (tree hierarchy), Forms, and the critical Capacity search endpoint.

## Deliverables
- \`apps/api/src/routes/\` — carriers.ts, lines.ts, forms.ts, capacity.ts
- \`apps/api/src/services/\` — carrier/line/form/capacity.service.ts
- \`apps/api/src/queries/\` — carrier/line/form/capacity.queries.ts
- Integration tests

## Acceptance Criteria
- [ ] LOB tree hierarchy with parent_line_id
- [ ] \`GET /capacity/search\` with: line_id, carrier_id, min_limit, state, industry_class, has_available_capacity — returns JOINed results
- [ ] Caching for reference data
- [ ] Tests for capacity search with various filter combos

**Branch:** \`agent-4/reference-data\`" \
  --json number -q '.number')
echo "  ✅ Agent 4: #${ISSUE_NUMS[4]}"

# --- Agent 5 ---
ISSUE_NUMS[5]=$(gh issue create \
  --title "[Agent 5] Document & Template Services" \
  --label "tier-2,agent-5,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[0]}, #${ISSUE_NUMS[1]}, #${ISSUE_NUMS[2]} (Agents 0, 1, 2)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 5\"**. File upload/download, template CRUD, merge field rendering engine.

## Deliverables
- \`apps/api/src/routes/\` — attachments.ts, templates.ts
- \`apps/api/src/services/\` — attachment.service.ts, template.service.ts, merge.service.ts
- \`apps/api/src/lib/storage.ts\` — S3/Firebase storage adapter
- Tests for upload round-trip and template merge

## Acceptance Criteria
- [ ] Multipart upload to cloud storage with DB metadata
- [ ] \`POST /templates/:id/render\` resolves \`{{entity.field}}\` from DB
- [ ] Upload/download round-trip test
- [ ] Template render tests

**Branch:** \`agent-5/documents\`" \
  --json number -q '.number')
echo "  ✅ Agent 5: #${ISSUE_NUMS[5]}"

# --- Agent 6 ---
ISSUE_NUMS[6]=$(gh issue create \
  --title "[Agent 6] Submission & Placement Engine" \
  --label "tier-3,agent-6,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[3]}, #${ISSUE_NUMS[4]} (Agents 3, 4)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 6\"**. Submission lifecycle, placement kanban, renewal detection.

## Deliverables
- \`apps/api/src/routes/\` — submissions.ts, placements.ts, renewals.ts
- \`apps/api/src/services/\` — submission/placement/renewal.service.ts
- \`apps/api/src/jobs/renewal-scanner.ts\`
- Integration tests for full lifecycle

## Acceptance Criteria
- [ ] Full lifecycle: create → targets → send → status transitions
- [ ] Transitions validated against workflow manifest
- [ ] Kanban endpoint returns grouped data with aging
- [ ] Renewal scanner detects upcoming expirations
- [ ] Renewal initiation clones submission

**Branch:** \`agent-6/submissions\`" \
  --json number -q '.number')
echo "  ✅ Agent 6: #${ISSUE_NUMS[6]}"

# --- Agent 7 ---
ISSUE_NUMS[7]=$(gh issue create \
  --title "[Agent 7] Email Pipeline — Compose, Inbox, Parse, Import" \
  --label "tier-3,agent-7,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[3]}, #${ISSUE_NUMS[4]} (Agents 3, 4)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 7\"**. Email send/receive, AI parser (Claude API), historical import with OAuth + AI enrichment.

## Deliverables
- \`apps/api/src/routes/\` — emails.ts, import.ts
- \`apps/api/src/services/\` — email.service.ts, email-parser.service.ts, email-import.service.ts
- \`apps/api/src/ai/\` — email-parser.ts, import-enricher.ts
- \`apps/api/src/webhooks/\` — inbound-email.ts, oauth-callback.ts
- \`apps/api/src/jobs/\` — email-import-worker.ts, email-parse-worker.ts
- Tests for parser with sample emails and import flow

## Acceptance Criteria
- [ ] Send via SendGrid + DB tracking
- [ ] Inbound webhook auto-links to Contact and Submission
- [ ] AI parser extracts quote data with confidence scoring (Claude API)
- [ ] Low confidence → review queue
- [ ] Import: OAuth → contact match → batch process → AI enrichment → NetworkRelationship update
- [ ] Tests pass

**Branch:** \`agent-7/email-pipeline\`" \
  --json number -q '.number')
echo "  ✅ Agent 7: #${ISSUE_NUMS[7]}"

# --- Agent 8 ---
ISSUE_NUMS[8]=$(gh issue create \
  --title "[Agent 8] Sync Engine & AMS Integration" \
  --label "tier-3,agent-8,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[4]}, #${ISSUE_NUMS[7]} (Agents 4, 7)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 8\"**. Sync scheduler, capacity refresh emails, AMS adapters (CSV), freshness engine, reconciliation, manifest CRUD.

## Deliverables
- \`apps/api/src/sync/\` — scheduler.ts, capacity-refresh.ts, ams-adapter.ts, freshness-engine.ts, reconciliation.ts, field-mapper.ts, adapters/csv-import.ts
- \`apps/api/src/routes/\` — sync.ts, config-manifest.ts
- \`apps/api/src/services/\` — sync.service.ts, freshness.service.ts, manifest.service.ts
- \`apps/api/src/jobs/\` — sync-worker.ts, freshness-decay.ts
- Tests for each sub-module

## Acceptance Criteria
- [ ] Scheduler triggers jobs from SyncSchedule via node-cron
- [ ] Capacity refresh sends inquiry emails from templates
- [ ] CSV import adapter works with sample file
- [ ] Freshness decay calculates scores
- [ ] Reconciliation flags submission vs AMS mismatches
- [ ] Manifest CRUD with versioning + rollback + events

**Branch:** \`agent-8/sync-engine\`" \
  --json number -q '.number')
echo "  ✅ Agent 8: #${ISSUE_NUMS[8]}"

# --- Agent 9 ---
ISSUE_NUMS[9]=$(gh issue create \
  --title "[Agent 9] UnderwriterMatcher & Network Graph" \
  --label "tier-4,agent-9,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[3]}, #${ISSUE_NUMS[4]} (Agents 3, 4)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 9\"**. Weighted scoring engine + network graph API with path-finding.

## Deliverables
- \`apps/api/src/routes/\` — match.ts, network.ts
- \`apps/api/src/services/\` — matcher.service.ts, network.service.ts
- \`apps/api/src/lib/scoring.ts\`
- Tests for scoring scenarios and path-finding

## Acceptance Criteria
- [ ] 6-factor weighted scoring (appetite, capacity, relationship, hit ratio, region, response time)
- [ ] Explain endpoint returns natural language breakdown
- [ ] Graph API returns nodes + edges
- [ ] BFS path-finding works
- [ ] Introduction request creates notification

**Branch:** \`agent-9/matcher-network\`" \
  --json number -q '.number')
echo "  ✅ Agent 9: #${ISSUE_NUMS[9]}"

# --- Agent 10 ---
ISSUE_NUMS[10]=$(gh issue create \
  --title "[Agent 10] AI Workflow Assistant" \
  --label "tier-4,agent-10,backend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[3]}, #${ISSUE_NUMS[4]}, #${ISSUE_NUMS[6]}, #${ISSUE_NUMS[9]} (Agents 3, 4, 6, 9)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 10\"**. Claude-powered assistant with dynamic system prompt, 17 tool definitions, multi-turn orchestration, action confirmation.

## Deliverables
- \`apps/api/src/routes/ai.ts\`
- \`apps/api/src/ai/assistant/\` — system-prompt.ts, tools.ts, orchestrator.ts, intent-parser.ts, context.ts
- \`apps/api/src/services/ai.service.ts\`
- Tests with sample conversations

## Acceptance Criteria
- [ ] Dynamic system prompt with user + page context
- [ ] All 17 tools defined and mapped to services
- [ ] Multi-turn tool chains work
- [ ] Write actions require confirmation
- [ ] Permission enforcement via assistant

**Branch:** \`agent-10/ai-assistant\`" \
  --json number -q '.number')
echo "  ✅ Agent 10: #${ISSUE_NUMS[10]}"

# --- Agent 11 ---
ISSUE_NUMS[11]=$(gh issue create \
  --title "[Agent 11] App Shell, Routing, Design System" \
  --label "tier-5,agent-11,frontend,blocking" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[0]} (Agent 0)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 11\"**. React app shell, all routes, Zustand store slices, shared UI components, API client, design system.

## Deliverables
- \`apps/web/src/app.tsx\` — Root app
- \`apps/web/src/routes/index.tsx\` — All routes from PRD Section 9.2
- \`apps/web/src/components/layout/\` — AppShell, Sidebar, Header, AIPanelSlot
- \`apps/web/src/components/shared/\` — DataTable, EntityForm, StatusBadge, FreshnessBadge, SearchInput, FilterBar, etc.
- \`apps/web/src/components/global-search/GlobalSearch.tsx\`
- \`apps/web/src/store/\` — All 15 Zustand slices
- \`apps/web/src/lib/\` — api-client.ts, event-bus.ts, hooks/
- \`apps/web/src/styles/globals.css\`
- Component tests

## Acceptance Criteria
- [ ] AppShell renders sidebar + header + content + AI panel
- [ ] All routes defined
- [ ] 15 store slices with standard pattern
- [ ] DataTable: sort, filter, paginate, select, bulk actions
- [ ] API client with JWT + refresh
- [ ] GlobalSearch with Cmd+K

**Branch:** \`agent-11/app-shell\`" \
  --json number -q '.number')
echo "  ✅ Agent 11: #${ISSUE_NUMS[11]}"

# --- Agent 12 ---
ISSUE_NUMS[12]=$(gh issue create \
  --title "[Agent 12] Frontend — Contacts, Clients, Teams" \
  --label "tier-6,agent-12,frontend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[3]}, #${ISSUE_NUMS[11]} (Agents 3, 11)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 12\"**. ClientManager, ClientDetail (tabbed), ContactManager, ContactDetail (tabbed), TeamManager.

## Acceptance Criteria
- [ ] Client list + detail with 5 tabs
- [ ] Contact list + detail with 4 tabs
- [ ] Team management
- [ ] All forms use EntityForm + Zod

**Branch:** \`agent-12/fe-contacts-clients\`" \
  --json number -q '.number')
echo "  ✅ Agent 12: #${ISSUE_NUMS[12]}"

# --- Agent 13 ---
ISSUE_NUMS[13]=$(gh issue create \
  --title "[Agent 13] Frontend — Carriers, LOB, Forms, Capacity Matrix" \
  --label "tier-6,agent-13,frontend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[4]}, #${ISSUE_NUMS[11]} (Agents 4, 11)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 13\"**. CarrierManager, LOB tree, FormsPaperRegistry, CapacityMatrix with search.

## Acceptance Criteria
- [ ] CapacityMatrix grid with color-coded utilization
- [ ] Advanced search panel
- [ ] LOB tree view
- [ ] Tests with mock data

**Branch:** \`agent-13/fe-carriers-capacity\`" \
  --json number -q '.number')
echo "  ✅ Agent 13: #${ISSUE_NUMS[13]}"

# --- Agent 14 ---
ISSUE_NUMS[14]=$(gh issue create \
  --title "[Agent 14] Frontend — Submissions, Placements, Renewals" \
  --label "tier-6,agent-14,frontend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[6]}, #${ISSUE_NUMS[11]} (Agents 6, 11)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 14\"**. SubmissionBuilder (8-step wizard), PlacementTracker (kanban), RenewalCalendar.

## Acceptance Criteria
- [ ] 8-step submission wizard with validation
- [ ] Kanban with drag-drop and aging indicators
- [ ] Calendar with color-coded renewals

**Branch:** \`agent-14/fe-submissions\`" \
  --json number -q '.number')
echo "  ✅ Agent 14: #${ISSUE_NUMS[14]}"

# --- Agent 15 ---
ISSUE_NUMS[15]=$(gh issue create \
  --title "[Agent 15] Frontend — Email UI" \
  --label "tier-6,agent-15,frontend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[7]}, #${ISSUE_NUMS[11]} (Agents 7, 11)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 15\"**. EmailInbox, EmailComposer, EmailParserReview, EmailImporter wizard.

## Acceptance Criteria
- [ ] Threaded inbox with auto-linking
- [ ] Rich text composer with recipient picker + templates
- [ ] Parser review side-by-side with confirm/edit
- [ ] Import wizard: Connect → Scan → Import → Report

**Branch:** \`agent-15/fe-email\`" \
  --json number -q '.number')
echo "  ✅ Agent 15: #${ISSUE_NUMS[15]}"

# --- Agent 16 ---
ISSUE_NUMS[16]=$(gh issue create \
  --title "[Agent 16] Frontend — AI Assistant, Network Graph, Dashboard" \
  --label "tier-6,agent-16,frontend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[9]}, #${ISSUE_NUMS[10]}, #${ISSUE_NUMS[11]} (Agents 9, 10, 11)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 16\"**. AI chat panel, D3.js network graph, Recharts dashboard.

## Acceptance Criteria
- [ ] Chat panel with action cards + confirmation cards
- [ ] Force-directed graph with team/underwriter nodes
- [ ] Dashboard KPIs + 6 chart types + data health gauge

**Branch:** \`agent-16/fe-ai-dashboard\`" \
  --json number -q '.number')
echo "  ✅ Agent 16: #${ISSUE_NUMS[16]}"

# --- Agent 17 ---
ISSUE_NUMS[17]=$(gh issue create \
  --title "[Agent 17] Frontend — Sync Admin, Config Admin, Notifications" \
  --label "tier-6,agent-17,frontend" \
  --body "## Depends on
Blocked by #${ISSUE_NUMS[8]}, #${ISSUE_NUMS[11]} (Agents 8, 11)

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 17\"**. SyncDashboard, ConfigAdmin, NotificationCenter, ActivityFeed.

## Acceptance Criteria
- [ ] Sync dashboard with schedules, jobs, freshness
- [ ] Config admin with manifest editors
- [ ] Notification bell + dropdown
- [ ] Activity feed timeline

**Branch:** \`agent-17/fe-sync-config\`" \
  --json number -q '.number')
echo "  ✅ Agent 17: #${ISSUE_NUMS[17]}"

# --- Agent 18 ---
ISSUE_NUMS[18]=$(gh issue create \
  --title "[Agent 18] Manifest System & Dynamic Renderers" \
  --label "tier-7,agent-18,frontend" \
  --body "## Depends on
Blocked by ALL previous issues.

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 18\"**. Dynamic renderers: DynamicEntityList, DynamicEntityDetail, DynamicEntityForm, DynamicWorkflowBoard, DynamicNavigation, DynamicFieldRenderer. Does NOT replace existing components — adds \`?dynamic=true\` path.

## Acceptance Criteria
- [ ] DynamicEntityList renders from manifest config
- [ ] DynamicEntityForm renders + validates from manifest config
- [ ] All field types handled by DynamicFieldRenderer
- [ ] Conditional visibility + permission-based hiding work
- [ ] \`?dynamic=true\` switches rendering for A/B comparison

**Branch:** \`agent-18/dynamic-renderers\`" \
  --json number -q '.number')
echo "  ✅ Agent 18: #${ISSUE_NUMS[18]}"

# --- Agent 19 ---
ISSUE_NUMS[19]=$(gh issue create \
  --title "[Agent 19] E2E Tests, CI/CD, Deploy" \
  --label "tier-8,agent-19,backend,frontend" \
  --body "## Depends on
Blocked by ALL previous issues.

## Instructions
Read \`docs/AGENTS.md\` section **\"Agent 19\"**. Playwright E2E tests, GitHub Actions CI/CD, Docker configs.

## Acceptance Criteria
- [ ] 8 E2E test suites covering full user journeys
- [ ] CI: lint → type-check → test → build (on PR)
- [ ] E2E: runs on merge to main
- [ ] Deploy: on git tag
- [ ] \`docker compose up\` starts full stack
- [ ] CI green on fresh clone

**Branch:** \`agent-19/e2e-cicd\`" \
  --json number -q '.number')
echo "  ✅ Agent 19: #${ISSUE_NUMS[19]}"

echo ""
echo "✅ All 20 agent issues created"
echo ""

# =============================================================================
# STEP 3: Create Mega Issues
# =============================================================================
echo "🚀 Creating mega issues..."

MEGA1=$(gh issue create \
  --title "🚀 MEGA 1: Backend Foundation (Tiers 0→1→2→3)" \
  --label "mega-issue,blocking" \
  --body "## Orchestration Issue — Assign to Claude

This mega issue drives the first half of the BrokerFlow build. Claude should solve the linked issues **in tier order**, committing after each tier. Do not start a tier until all issues in the previous tier are complete and compiling.

### Execution Order

**TIER 0 — Do first, everything depends on it:**
- [ ] #${ISSUE_NUMS[0]} — Shared Contracts & Schema Foundation

**TIER 1 — After Tier 0 merges (these two can be done in sequence):**
- [ ] #${ISSUE_NUMS[1]} — Database & Migrations
- [ ] #${ISSUE_NUMS[2]} — Auth & RBAC

**TIER 2 — After Tier 1 merges (these three can be done in sequence):**
- [ ] #${ISSUE_NUMS[3]} — Core Entity APIs
- [ ] #${ISSUE_NUMS[4]} — Reference Data APIs
- [ ] #${ISSUE_NUMS[5]} — Document & Template Services

**TIER 3 — After Tier 2 merges (these three can be done in sequence):**
- [ ] #${ISSUE_NUMS[6]} — Submission & Placement Engine
- [ ] #${ISSUE_NUMS[7]} — Email Pipeline
- [ ] #${ISSUE_NUMS[8]} — Sync Engine & AMS Integration

### Rules
1. Read \`CLAUDE.md\` at repo root for coding standards.
2. For each issue, read \`docs/AGENTS.md\` for the corresponding agent section — it has the exact file list and instructions.
3. Read \`docs/BrokerFlow_PRD_v2.0.docx\` for data model and component specs.
4. After completing each tier, verify: \`npm run type-check && npm run test\`
5. Commit with message format: \`feat(agent-N): <description>\`
6. Create one branch per agent: \`agent-N/description\`

### Done when
All 10 issues above are checked off, all code compiles, all tests pass." \
  --json number -q '.number')
echo "  ✅ Mega 1: #${MEGA1}"

MEGA2=$(gh issue create \
  --title "🚀 MEGA 2: Intelligence & Frontend (Tiers 4→5→6)" \
  --label "mega-issue,blocking" \
  --body "## Orchestration Issue — Assign to Claude

This mega issue builds the intelligence layer and full frontend. Requires MEGA 1 (#${MEGA1}) to be complete.

### Execution Order

**TIER 4 — Intelligence layer (sequence):**
- [ ] #${ISSUE_NUMS[9]} — UnderwriterMatcher & Network Graph
- [ ] #${ISSUE_NUMS[10]} — AI Workflow Assistant

**TIER 5 — Frontend shell (do first before Tier 6):**
- [ ] #${ISSUE_NUMS[11]} — App Shell, Routing, Design System

**TIER 6 — Frontend features (sequence, each builds on shell):**
- [ ] #${ISSUE_NUMS[12]} — Frontend: Contacts, Clients, Teams
- [ ] #${ISSUE_NUMS[13]} — Frontend: Carriers, LOB, Forms, Capacity Matrix
- [ ] #${ISSUE_NUMS[14]} — Frontend: Submissions, Placements, Renewals
- [ ] #${ISSUE_NUMS[15]} — Frontend: Email UI
- [ ] #${ISSUE_NUMS[16]} — Frontend: AI Assistant, Network Graph, Dashboard
- [ ] #${ISSUE_NUMS[17]} — Frontend: Sync Admin, Config Admin, Notifications

### Rules
Same as MEGA 1. Read \`CLAUDE.md\`, \`docs/AGENTS.md\`, and PRD before each agent.

### Done when
All 9 issues above are checked off, full frontend renders, all tests pass." \
  --json number -q '.number')
echo "  ✅ Mega 2: #${MEGA2}"

MEGA3=$(gh issue create \
  --title "🚀 MEGA 3: Config Architecture & E2E (Tiers 7→8)" \
  --label "mega-issue" \
  --body "## Orchestration Issue — Assign to Claude

Final mega issue. Requires MEGA 2 (#${MEGA2}) to be complete.

### Execution Order

**TIER 7 — Config-driven architecture:**
- [ ] #${ISSUE_NUMS[18]} — Manifest System & Dynamic Renderers

**TIER 8 — Integration testing & deploy:**
- [ ] #${ISSUE_NUMS[19]} — E2E Tests, CI/CD, Deploy

### Done when
Both issues checked off. E2E tests pass. CI pipeline green. Platform is deployable." \
  --json number -q '.number')
echo "  ✅ Mega 3: #${MEGA3}"

echo ""
echo "============================================="
echo "🎉 DONE! All issues created."
echo "============================================="
echo ""
echo "📋 Summary:"
echo "   Agent issues: #${ISSUE_NUMS[0]} through #${ISSUE_NUMS[19]}"
echo "   Mega Issue 1 (Backend):    #${MEGA1}"
echo "   Mega Issue 2 (Frontend):   #${MEGA2}"
echo "   Mega Issue 3 (Config/E2E): #${MEGA3}"
echo ""
echo "👉 Next step: Assign MEGA 1 (#${MEGA1}) to Claude to start the build."
echo "   gh issue edit ${MEGA1} --add-assignee @claude"
echo ""
