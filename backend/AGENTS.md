HyperQuest Backend (MVP) — TypeScript Repo Design

A minimal backend where quests are pre-registered, users submit a wallet address, and the API returns which quests are completed, current progress %, and simple leaderboards. NFT minting is handled by another service (out of scope).

⸻

1) MVP Goals
	•	Pre-register quests in code (seed file) using a tiny JSON spec.
	•	Stateless evaluation on demand: given a wallet, fetch activity from Hyperliquid, map to quest criteria, compute progress & completion.
	•	Persist lightweight caches (SQLite) for faster repeat queries and to power leaderboards (by points, notional volume, PnL, count of quests).
	•	Small surface area: a few routes, one worker (optional cron), one DB.

Non-Goals (MVP)
	•	No auth/roles, no user accounts.
	•	No webhooks, no background streaming.
	•	No NFT minting here.

⸻

2) Tech Stack
	•	Node.js 20+, TypeScript
	•	Express for REST (tiny, familiar)
	•	Prisma + SQLite (file DB)
	•	dotenv for config
	•	Jest for tests
	•	axios (or undici) for Hyperliquid/partner HTTP calls
	•	node-cron (optional) to refresh leaderboards periodically

⸻

3) High-Level Flow

Client → GET /wallets/:address/summary
   ↳ If cache is stale or missing:
       1) Pull recent activity (trades, PnL, liquidations, etc.) from Hyperliquid APIs
       2) Normalize and cache minimal rows
       3) Evaluate every pre-registered quest against normalized data
       4) Store progress rows for the wallet
   ↳ Return: list of quests with status + progress%, and a short wallet summary

Client → GET /leaderboards?type=points&period=7d
   ↳ Returns a simple ranking over cached aggregates (recomputed hourly by cron or on-demand)


⸻

4) API Surface (MVP)

Base path: /v1
	•	GET /quests → list pre-registered quests (slug, title, description, criteria summary)
	•	GET /quests/:slug → single quest detail
	•	GET /wallets/:address/summary?period=7d|30d
Returns:
	•	wallet summary (volume, pnl, liquidations, lastSyncAt)
	•	quests[] with slug, title, status: "COMPLETED"|"IN_PROGRESS"|"NOT_STARTED", progressPct, metrics
	•	POST /wallets/:address/sync
Forces refresh (pull + evaluate) now; returns same payload as /summary
	•	GET /leaderboards?type=points|volume|pnl&period=7d|30d&limit=100
Returns simple ranking with rank, wallet, value, completedQuests

Example response:

{
  "wallet": "0xabc...123",
  "period": "7d",
  "lastSyncAt": "2025-09-22T03:00:12Z",
  "metrics": { "perpVolumeUsd": 15234.12, "netPnlUsd": 87.4, "liquidations": 0 },
  "quests": [
    {
      "slug": "first-trade",
      "title": "Execute Your First Trade",
      "status": "COMPLETED",
      "progressPct": 100,
      "metrics": { "trades": 3, "firstTradeAt": "2025-09-20T02:11:00Z" }
    },
    {
      "slug": "weekly-10k-volume",
      "title": "Trade $10k Notional (7d)",
      "status": "COMPLETED",
      "progressPct": 100,
      "metrics": { "perpVolumeUsd7d": 15234.12 }
    },
    {
      "slug": "pnl-positive",
      "title": "Finish Week Positive",
      "status": "IN_PROGRESS",
      "progressPct": 64,
      "metrics": { "netPnlUsd7d": 87.4, "target": 135.0 }
    }
  ]
}


⸻

5) Project Structure

backend/
├─ src/
│  ├─ api/
│  │  ├─ quests.route.ts
│  │  ├─ wallets.route.ts
│  │  ├─ leaderboards.route.ts
│  │  └─ server.ts
│  ├─ core/
│  │  ├─ quests.registry.ts        // in-memory registry from seed JSON
│  │  ├─ evaluate.ts               // core evaluation funcs
│  │  └─ progress.ts               // progress % helpers
│  ├─ data/
│  │  ├─ hl.client.ts              // Hyperliquid fetchers
│  │  └─ normalize.ts              // shape raw → normalized Activity
│  ├─ jobs/
│  │  ├─ refresh.wallet.ts         // on-demand sync
│  │  └─ recompute.leaderboards.ts // cron (optional)
│  ├─ db/
│  │  └─ prisma.ts
│  ├─ schemas/
│  │  └─ quests.seed.json          // pre-registered quests
│  ├─ utils/
│  │  ├─ env.ts
│  │  ├─ time.ts
│  │  └─ math.ts
│  └─ app.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ test/
│  ├─ evaluate.test.ts
│  └─ routes.test.ts
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ Dockerfile
└─ README.md


⸻

6) Data Model (Prisma, minimal)

// prisma/schema.prisma
datasource db { provider = "sqlite"; url = "file:./dev.db" }
generator client { provider = "prisma-client-js" }

model Wallet {
  id           String   @id @default(cuid())
  address      String   @unique
  lastSyncAt   DateTime?
  // cached aggregates for leaderboards
  volume7dUsd  Float    @default(0)
  volume30dUsd Float    @default(0)
  pnl7dUsd     Float    @default(0)
  pnl30dUsd    Float    @default(0)
  points7d     Int      @default(0)
  points30d    Int      @default(0)
  progresses   Progress[]
  activities   Activity[]
}

model Quest {
  slug         String   @id
  title        String
  description  String
  // serialized tiny JSON spec (from quests.seed.json)
  spec         Json
  // static point value used in leaderboards
  points       Int      @default(10)
  // optional tag for grouping
  tag          String? 
  progresses   Progress[]
}

model Progress {
  id           String   @id @default(cuid())
  walletId     String
  questSlug    String
  wallet       Wallet   @relation(fields: [walletId], references: [id])
  quest        Quest    @relation(fields: [questSlug], references: [slug])
  status       String   // COMPLETED | IN_PROGRESS | NOT_STARTED
  progressPct  Int      @default(0) // 0..100
  metrics      Json?    // computed numbers used for UI
  updatedAt    DateTime @default(now())
  @@unique([walletId, questSlug])
}


⸻

7) Quest Spec (tiny, MVP)

Keep it very small and explicit—two primitive rule types:
	•	count: count events filtered by kind (e.g., TRADE) and optional window
	•	sum: sum a numeric field (e.g., notionalUsd, pnlUsd) with optional window

// src/schemas/quests.seed.json (example)
[
  {
    "slug": "first-trade",
    "title": "Execute Your First Trade",
    "description": "Complete at least 1 trade on Hyperliquid.",
    "points": 5,
    "spec": {
      "rules": [
        { "type": "count", "kind": "TRADE", "gte": 1, "window": "all" }
      ],
      "target": 1, "scoringMetric": "count"
    }
  },
  {
    "slug": "weekly-10k-volume",
    "title": "Trade $10k Notional (7d)",
    "description": "Accumulate $10,000 notional volume over the last 7 days.",
    "points": 15,
    "spec": {
      "rules": [
        { "type": "sum", "field": "notionalUsd", "kind": "TRADE", "gte": 10000, "window": "7d" }
      ],
      "target": 10000, "scoringMetric": "sum:notionalUsd"
    }
  },
  {
    "slug": "finish-week-positive",
    "title": "Finish Week Positive",
    "description": "Have positive net PnL over the last 7 days.",
    "points": 20,
    "spec": {
      "rules": [
        { "type": "sum", "field": "pnlUsd", "kind": "TRADE", "gte": 0.01, "window": "7d" }
      ],
      "target": 0.01, "scoringMetric": "sum:pnlUsd"
    }
  }
]

Progress calculation (MVP):
	•	For count quests: progressPct = min(100, floor(100 * currentCount / target))
	•	For sum quests: progressPct = min(100, floor(100 * currentSum / target))
	•	Status: COMPLETED if threshold met; IN_PROGRESS if >0 but <100; else NOT_STARTED

⸻

8) Evaluation Logic (concise)

evaluate(wallet, period)
	1.	Pull activities for period (e.g., last 7 or 30 days) from Hyperliquid REST (one or two endpoints you can hit by symbol or by address).
	2.	Normalize to Activity[] (only fields we need).
	3.	For each quest in registry:
	•	Apply filter by kind and window (window is either all, 7d, 30d relative to now).
	•	Compute either count or sum(field).
	•	Compare with gte threshold → determine status, progressPct, and small metrics blob.
	•	Upsert Progress row.
	4.	Update wallet aggregates (volume7d, pnl7d, etc.) for leaderboards.
	5.	Touch lastSyncAt.

No background stream in MVP: we re-pull on request or via a tiny cron.

⸻

9) Leaderboards (simple)
	•	points: sum of quest points for quests with status = COMPLETED in the relevant window
	•	volume: sum of notionalUsd over the window
	•	pnl: sum of pnlUsd over the window

Implementation options:
	•	On demand: When /leaderboards is called, compute rankings from cached wallet aggregates for the selected period.
	•	Cron: node-cron job every hour to recompute and cache a top-N list.

Response example:

{
  "type": "points",
  "period": "7d",
  "updatedAt": "2025-09-22T03:00:00Z",
  "entries": [
    { "rank": 1, "wallet": "0xabc...1", "value": 65, "completedQuests": 6 },
    { "rank": 2, "wallet": "0xdef...2", "value": 55, "completedQuests": 5 }
  ]
}


⸻

10) Minimal Interfaces (for core code)

// src/core/quests.registry.ts
export type RuleCount = {
  type: "count";
  kind: "TRADE" | "FUNDING" | "LIQUIDATION" | "TRANSFER";
  gte: number;
  window: "all" | "7d" | "30d";
};

export type RuleSum = {
  type: "sum";
  field: "notionalUsd" | "pnlUsd";
  kind: "TRADE";
  gte: number;
  window: "7d" | "30d";
};

export type QuestSpec = {
  rules: (RuleCount | RuleSum)[];
  target: number;
  scoringMetric: string; // "count" or "sum:<field>"
};

// src/data/normalize.ts
export type Activity = {
  kind: "TRADE" | "FUNDING" | "LIQUIDATION" | "TRANSFER";
  ts: Date;
  notionalUsd?: number;
  pnlUsd?: number;
  meta?: Record<string, unknown>;
};


⸻

11) Example Route Behaviors
	•	GET /v1/wallets/:address/summary?period=7d
	•	If lastSyncAt older than 10 minutes (configurable), call refresh.wallet.ts.
	•	Fetch cached Progress for all quests + wallet aggregates; return JSON.
	•	POST /v1/wallets/:address/sync
	•	Force refresh.wallet.ts (ignores staleness).
	•	Returns the same payload as /summary.
	•	GET /v1/leaderboards?type=points&period=7d&limit=100
	•	Read precomputed ranking (or compute now).
	•	Return list of {rank, wallet, value, completedQuests}.

⸻

12) Configuration

.env.example

PORT=8080
NODE_ENV=development
HL_API_BASE=https://api.hyperliquid.xyz   # example; adjust to real
SYNC_STALE_SECONDS=600
LEADERBOARD_TOP_N=100


⸻

13) Testing (what to cover)
	•	Unit:
	•	evaluate.ts for count/sum rules, windows, progress%.
	•	normalize.ts given a small HL payload → Activity[].
	•	Integration:
	•	/wallets/:address/summary with mocked HL client (fixtures).
	•	Leaderboard computation given seeded data.

⸻

14) How to Build It Fast
	1.	Scaffold Prisma + SQLite; add models above and migrations.
	2.	Implement quests.seed.json and a bootstrap that upserts Quest rows on server start.
	3.	Implement hl.client.ts with 1–2 fetchers and pure normalize.ts.
	4.	Implement evaluate.ts using the tiny rule set; write unit tests for it.
	5.	Wire /summary → refresh if stale → read Progress + aggregates.
	6.	Add a simple hourly cron to recompute leaderboard aggregates (optional).

This keeps the system tiny while delivering:
	•	pre-registered quests,
	•	per-wallet progress and completion,
	•	simple 7d/30d leaderboards.