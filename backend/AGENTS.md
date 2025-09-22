Hyperliquid Quest Backend (MVP) — “No Period” Design

You asked to remove all period parameters and evaluate using only Wallet and Quest data models. This blueprint keeps the backend tiny: quests are pre-registered; given a wallet, we compute completion and progress on the fly (stateless), and provide a simple points leaderboard derived from completed quests.

⸻

1) Core Principles
	•	No client period. The server never accepts 7d/30d etc.
	•	Evaluation uses only Wallet and Quest.
No Activity or Progress tables. Activity is fetched from data sources at request time and never persisted (beyond an optional in-memory cache).
	•	Quests define their own time semantics (if any) inside the quest spec (e.g., window: "all_time" or an absolute range). Clients don’t pass time.

⸻

2) Tech Stack
	•	Node.js 20+, TypeScript
	•	Express (REST)
	•	Prisma + SQLite (only to store Wallet registry and Quest registry)
	•	dotenv
	•	Jest
	•	undici/axios for HTTP to data sources

⸻

3) Data Model (Prisma)

Only Wallet and Quest. Nothing else persisted.

// prisma/schema.prisma
datasource db { provider = "sqlite"; url = "file:./dev.db" }
generator client { provider = "prisma-client-js" }

model Wallet {
  // Known wallets (discovered when users first query or registered via POST)
  address    String   @id
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Quest {
  slug        String   @id
  title       String
  description String
  points      Int      @default(10)
  // Minimal spec, including any time semantics the quest needs
  spec        Json     // see “Quest Spec” below
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}


⸻

4) Quest Spec (tiny and explicit)

Two primitive rule types:
	•	count: count events (e.g., trades, liquidations)
	•	sum: sum numeric fields (e.g., notional, pnl)

Each quest owns its time semantics:
	•	"window": "all_time": evaluate using all available history
	•	"window": { "type": "fixed", "start": "...Z", "end": "...Z" }: evaluate against an absolute window (e.g., monthly campaign)
	•	You can omit window → treated as "all_time".

// src/schemas/quests.seed.json
[
  {
    "slug": "first-deposit",
    "title": "Make Your First Deposit",
    "description": "Make your first deposit on Hyperliquid.",
    "points": 5,
    "spec": {
      "rules": [
        { "type": "count", "kind": "TRANSFER", "gte": 1, "window": "all_time" }
      ],
      "target": 1,
      "scoringMetric": "count"
    }
  },
  {
    "slug": "first-trade",
    "title": "Execute Your First Trade",
    "description": "Complete at least 1 trade on Hyperliquid.",
    "points": 5,
    "spec": {
      "rules": [
        { "type": "count", "kind": "TRADE", "gte": 1, "window": "all_time" }
      ],
      "target": 1,
      "scoringMetric": "count"
    }
  },
  {
    "slug": "high-volume",
    "title": "Achieve Over 1M Volume",
    "description": "Achieve over 1M in total trading volume.",
    "points": 10,
    "spec": {
      "rules": [
        { "type": "sum", "field": "notionalUsd", "kind": "TRADE", "gte": 1000000, "window": "all_time" }
      ],
      "target": 1000000,
      "scoringMetric": "sum:notionalUsd"
    }
  },
  {
    "slug": "large-liquidation",
    "title": "Get Liquidated",
    "description": "Get liquidated at least once.",
    "points": 20,
    "spec": {
      "rules": [
        { "type": "count", "kind": "LIQUIDATION", "gte": 1, "window": "all_time" }
      ],
      "target": 1,
      "scoringMetric": "count"
    }
  }
]

Progress calculation (server-side, stateless):
	•	count: progressPct = min(100, floor(100 * count / target))
	•	sum: progressPct = min(100, floor(100 * sum / target))
	•	status: COMPLETED if threshold met; IN_PROGRESS if >0 and <100; else NOT_STARTED.

⸻

5) Evaluation Logic (stateless)

// Pseudocode
evaluateWallet(address: string): {
  wallet: string
  quests: Array<{ slug, title, status, progressPct, metrics }>
  summary: { totalPoints: number }
} {
  // 1) Load quests from DB (pre-registered at boot)
  const quests = db.quest.findMany()

  // 2) For each distinct "kind" and time window across all quests,
  //    batch-fetch activity directly from Hyperliquid (REST/WebSocket snapshot).
  //    Keep in memory only; do NOT persist.
  //    - If any rule is "all_time", either:
  //        a) use a data source endpoint that returns lifetime aggregates, or
  //        b) page through until done (MVP: set a sane cap and document it).
  const activityIndex = fetchAndNormalize(address, dedupeRequestedWindows(quests))

  // 3) Evaluate each quest purely from activityIndex
  const results = quests.map(q => compute(q.spec, activityIndex))

  // 4) Sum completed quest points for leaderboard
  const totalPoints = results
    .filter(r => r.status === "COMPLETED")
    .map(r => r.points)
    .reduce((a,b)=>a+b, 0)

  return { wallet: address, quests: decorate(results), summary: { totalPoints } }
}

Note on “all_time”:
For MVP, prefer endpoints that return lifetime totals per wallet/symbol to avoid deep pagination. Where not possible, set a fetch horizon and document it (e.g., “we scan up to N pages per request”); the evaluation remains stateless.

⸻

5.1) Quest Evaluation Examples

This section details how the stateless `evaluateWallet` function would process each of the quests defined in `src/schemas/quests.seed.json`.

*   **Quest: `first-deposit`**
    *   **Title:** Make Your First Deposit
    *   **Logic:** The evaluator will fetch all `TRANSFER` activities for the user's wallet. It will then apply the `count` rule from the quest's `spec`.
    *   **Evaluation:**
        *   The `rules` array specifies `{ "type": "count", "kind": "TRANSFER", "gte": 1 }`.
        *   The evaluator will count the number of `TRANSFER` events.
        *   If the count is `>= 1`, the quest is `COMPLETED`.
        *   `progressPct` will be `100` if completed, otherwise `0`.

*   **Quest: `first-trade`**
    *   **Title:** Execute Your First Trade
    *   **Logic:** The evaluator will fetch all `TRADE` activities for the user's wallet.
    *   **Evaluation:**
        *   The `rules` array specifies `{ "type": "count", "kind": "TRADE", "gte": 1 }`.
        *   The evaluator will count the number of `TRADE` events.
        *   If the count is `>= 1`, the quest is `COMPLETED`.
        *   `progressPct` will be `100` if completed, otherwise `0`.

*   **Quest: `high-volume`**
    *   **Title:** Achieve Over 1M Volume
    *   **Logic:** The evaluator will fetch all `TRADE` activities for the user's wallet within the `all_time` window.
    *   **Evaluation:**
        *   The `rules` array specifies `{ "type": "sum", "field": "notionalUsd", "kind": "TRADE", "gte": 1000000 }`.
        *   The evaluator will sum the `notionalUsd` field of all `TRADE` events.
        *   If the sum is `>= 1000000`, the quest is `COMPLETED`.
        *   `progressPct` will be calculated as `min(100, floor(100 * sum_of_notionalUsd / 1000000))`.

*   **Quest: `large-liquidation`**
    *   **Title:** Get Liquidated
    *   **Logic:** The evaluator will fetch all `LIQUIDATION` activities for the user's wallet.
    *   **Evaluation:**
        *   The `rules` array specifies `{ "type": "count", "kind": "LIQUIDATION", "gte": 1 }`.
        *   The evaluator will count the number of `LIQUIDATION` events.
        *   If the count is `>= 1`, the quest is `COMPLETED`.
        *   `progressPct` will be `100` if completed, otherwise `0`.

⸻

5.2) Unsupported Quest Evaluation Logic

The current `spec` is designed for simplicity and only supports a limited set of rules (`count` and `sum`). The following quests from `QUESTS.md` require more complex logic and are not supported by the current `spec`. This section describes the logic that would be needed to evaluate them.

*   **Quest: `high_pnl_percentage`**
    *   **Description:** Achieve over 100% PnL on a single trade.
    *   **Required Data:** A list of all the user's trades, with the PnL percentage for each trade.
    *   **Logic:** Iterate through all trades and check if any of them have a `pnl_percentage` greater than or equal to 100.
    *   **Proposed `spec` extension:** A new rule type, `max`, that can find the maximum value of a field in a list of activities.

*   **Quest: `buying_the_dip`**
    *   **Description:** Average down a losing position at least 3 times.
    *   **Required Data:** A history of the user's positions and trades, with enough detail to identify when a user is adding to a losing position.
    *   **Logic:** For each position, track the entry price and the price of subsequent trades. If the user makes 3 or more trades at a price lower than the original entry price while the position is at a loss, the quest is complete.
    *   **Proposed `spec` extension:** This would require a more stateful and complex rule type, perhaps a `sequence` rule that can detect a pattern of events.

*   **Quest: `all_in_yolo`**
    *   **Description:** Allocate 80%+ of total equity into a single position.
    *   **Required Data:** The user's account equity at the time of opening a position, and the notional value of that position.
    *   **Logic:** For each new position, calculate the ratio of the position's notional value to the user's total account equity at that time. If the ratio is `>= 0.8`, the quest is complete.
    *   **Proposed `spec` extension:** A new rule type, `ratio`, that can calculate the ratio of two values, one of which might be from the user's account state.

*   **Quest: Cross-Ecosystem Quests (`eco_explorer`, `liquidity_provider`, etc.)**
    *   **Description:** These quests involve interacting with other protocols in the Hyperliquid ecosystem.
    *   **Required Data:** Data from the other protocols' APIs (e.g., Kinetiq, Hyperps). This would require building new data fetchers for each protocol.
    *   **Logic:** The logic would be specific to each quest. For example, for `liquidity_provider`, we would need to check if the user has provided liquidity of a certain value to a specific vault on another protocol.
    *   **Proposed `spec` extension:** The `spec` would need to be extended to support new `kind`s of activities for each external protocol, and the data fetching logic would need to be extended to support these new data sources.

⸻

6) API Surface (no period parameter)

Base path: /v1
	•	GET /quests
Returns all pre-registered quests (slug, title, description, points, redacted spec summary).
	•	POST /wallets
Body { address }. Registers a wallet in the DB (idempotent). Useful for leaderboards.
	•	GET /wallets/:address/summary
Runs stateless evaluation now and returns:

{
  "wallet": "0xabc...123",
  "summary": { "totalPoints": 30 },
  "quests": [
    {
      "slug": "first-trade",
      "title": "Execute Your First Trade",
      "status": "COMPLETED",
      "progressPct": 100,
      "metrics": { "trades": 3, "firstTradeAt": "2025-09-20T02:11:00Z" },
      "points": 5
    },
    {
      "slug": "lifetime-100k-volume",
      "title": "Accumulate $100k Notional (All-Time)",
      "status": "IN_PROGRESS",
      "progressPct": 41,
      "metrics": { "sum:notionalUsd": 41032.55 },
      "points": 25
    }
  ]
}


	•	GET /leaderboards?type=points&limit=100
Evaluates each known wallet (from Wallet table) on demand, sums completed quest points, and returns a points leaderboard.
Response:

{
  "type": "points",
  "entries": [
    { "rank": 1, "wallet": "0xAAA...1", "points": 75 },
    { "rank": 2, "wallet": "0xBBB...2", "points": 65 }
  ]
}



Leaderboard is computed without any stored progress: it iterates over registered wallets and invokes the same stateless evaluator. For scale, you can add a memory cache later, but evaluation will still rely only on Wallet + Quest.

⸻

7) Folder Structure

hyperliquid-quest-mvp/
├─ src/
│  ├─ api/
│  │  ├─ quests.route.ts
│  │  ├─ wallets.route.ts
│  │  └─ leaderboards.route.ts
│  ├─ core/
│  │  ├─ evaluator.ts        // pure stateless evaluator
│  │  ├─ rules.ts            // count/sum rule executors
│  │  └─ spec.ts             // types + validators
│  ├─ hyperliquid/          // HTTP fetchers to HL APIs
│  │  ├─ exchangeClient.ts   // exchange API client
│  │  ├─ helpers.ts          // utility functions
│  │  ├─ index.ts            // main exports
│  │  ├─ infoClient.ts       // info API client
│  │  └─ types.ts            // type definitions
│  ├─ data/
│  │  └─ normalize.ts        // raw → { kind, ts, notionalUsd?, pnlUsd? }
│  ├─ db/prisma.ts
│  ├─ bootstrap/seedQuests.ts
│  ├─ utils/{env.ts, time.ts, math.ts}
│  └─ app.ts
├─ prisma/{schema.prisma,migrations/}
├─ src/schemas/quests.seed.json
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md


⸻

8) Minimal Types

// src/core/spec.ts
export type WindowSpec =
  | "all_time"
  | { type: "fixed"; start: string; end: string };

export type RuleCount = {
  type: "count";
  kind: "TRADE" | "LIQUIDATION" | "FUNDING" | "TRANSFER";
  gte: number;
  window?: WindowSpec; // default "all_time"
};

export type RuleSum = {
  type: "sum";
  field: "notionalUsd" | "pnlUsd";
  kind: "TRADE";
  gte: number;
  window?: WindowSpec; // default "all_time"
};

export type QuestSpec = {
  rules: (RuleCount | RuleSum)[];
  target: number;
  scoringMetric: "count" | `sum:${"notionalUsd" | "pnlUsd"}`;
};

// src/data/normalize.ts
export type Activity = {
  kind: "TRADE" | "LIQUIDATION" | "FUNDING" | "TRANSFER";
  ts: Date;
  notionalUsd?: number;
  pnlUsd?: number;
  meta?: Record<string, unknown>;
};


⸻

9) Leaderboard Logic (points only)

// Pseudocode
getPointsLeaderboard(limit: number) {
  const wallets = db.wallet.findMany()
  const scores = []
  for (const w of wallets) {
    const res = evaluateWallet(w.address) // stateless
    scores.push({ wallet: w.address,
                  points: res.quests
                    .filter(q => q.status === "COMPLETED")
                    .reduce((s, q) => s + q.points, 0) })
  }
  return scores.sort((a,b)=>b.points-a.points).slice(0, limit)
}


⸻

10) How to Ship Fast
	1.	Create Prisma schema (just Wallet, Quest).
	2.	Implement seedQuests.ts to upsert quests from quests.seed.json.
	3.	Write evaluator.ts that:
	•	Collects required windows from quest specs
	•	Fetches & normalizes activities for each window
	•	Applies rules and computes progress/status
	4.	Routes:
	•	GET /quests
	•	POST /wallets (register)
	•	GET /wallets/:address/summary
	•	GET /leaderboards?type=points&limit=100

This satisfies:
	•	Pre-registered quests
	•	Wallet-only input
	•	Stateless evaluation with no period param
	•	Simple leaderboard using completed quest points only
