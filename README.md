# BrokerFlow

**AI-powered commercial lines insurance broker platform.**

BrokerFlow unifies contact management, underwriter matching, submission workflows, email communication, document generation, capacity tracking, and renewal management into a single intelligent system — purpose-built for independent commercial lines brokers.

## Architecture

```
brokerflow/
├── apps/
│   ├── web/              # React 18 + TypeScript + Tailwind + shadcn/ui
│   └── api/              # Node.js + Express + PostgreSQL
├── packages/
│   ├── shared/           # Shared types, Zod schemas, constants
│   ├── db/               # Database migrations, seeds, connection
│   └── manifest/         # Platform manifest schemas + defaults
├── e2e/                  # Playwright E2E tests
├── docs/                 # PRD + agent orchestration
└── .github/workflows/    # CI/CD
```

## Quick Start

```bash
git clone <repo-url> && cd brokerflow
npm install
cp .env.example .env        # fill in values
docker compose up -d         # PostgreSQL + Redis
npm run db:migrate
npm run db:seed
npm run dev
```

## Multi-Agent Build

This repo is designed to be built by **20 parallel AI agents** across 9 dependency tiers. See [`docs/AGENTS.md`](docs/AGENTS.md) for agent boundaries, shared contracts, and spawn order.

## Key Docs

| Document | Description |
|----------|-------------|
| [`docs/BrokerFlow_PRD_v2.0.docx`](docs/BrokerFlow_PRD_v2.0.docx) | Full PRD — 13 sections, 25 components, 18 entities |
| [`docs/AGENTS.md`](docs/AGENTS.md) | Multi-agent build orchestration |

## Tech Stack

React 18 · TypeScript · Tailwind · shadcn/ui · Zustand · Node.js · Express · PostgreSQL · Redis · Claude API · SendGrid · S3 · Turborepo
