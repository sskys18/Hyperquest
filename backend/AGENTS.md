Hyperliquid Quest Backend (MVP) — Stateless JSON Design

All quest definitions ship with the backend inside `src/schemas/quests.seed.json`. No databases, migrations, or leaderboards exist. Every request is handled statelessly: given a wallet, the service loads the static quest catalog, fetches activity data on demand (integration stubs provided), and returns completion / progress metrics computed in memory.

⸻

1) Core Principles
  •  No database or persistence. Wallet activity is never stored.
  •  Quests are defined in the repo JSON file and validated at startup.
  •  Evaluation is fully stateless: every call recomputes quest status for the provided wallet.
  •  No leaderboard surfaces — responses are per-wallet only.

⸻

2) Tech Stack
  •  Node.js 20+, TypeScript
  •  Express (REST)
  •  dotenv
  •  Zod for schema validation

  •  undici/axios for external data fetchers (axios included now)

⸻

3) Quest Catalog

`src/schemas/quests.seed.json` hosts the quests. On startup we load and validate each quest spec via `src/core/questRegistry.ts`. The resulting in-memory array feeds the evaluator.

Quest Spec supports four primitive rule types:
  •  count: count matching events
  •  sum: sum numeric fields
  •  max: highest numeric field observed
  •  ratio: ratio of two values (numerator/denominator kinds)

Time semantics live inside each quest spec via optional `window` fields (`"all_time"` or fixed start/end ISO strings). Clients never send periods.

⸻

4) Rule & Progress Semantics

Progress and completion are calculated statelessly:
  •  count/sum/max: `progressPct = min(100, floor(100 * metric / target))`
  •  ratio: same formula using the computed ratio value
  •  status: `COMPLETED` if thresholds met for all rules and target reached; `IN_PROGRESS` if progress > 0; otherwise `NOT_STARTED`.

`src/core/rules.ts` houses the primitive evaluators. `src/core/evaluator.ts` orchestrates quest evaluation using the quest registry and the activity index fetched per request.

⸻

5) Activity Fetching

`src/data/normalize.ts` defines the normalized activity shape (`Activity`) and provides `fetchActivityIndex(address, requests)`. The current implementation returns empty arrays (stubs). Integrators should add calls to Hyperliquid / ecosystem APIs and normalize the responses into the shared activity structure.

Kinds supported: `TRADE`, `LIQUIDATION`, `FUNDING`, `TRANSFER`, `AVERAGE_DOWN`, `ACCOUNT_STATE`, `ECO_INTERACTION`.

⸻

6) API Surface (stateless)

Base path: `/v1`
  •  `GET /quests`
     Returns all quests with redacted spec summaries (target, scoring metric, simplified rules).
  •  `GET /wallets/:address/summary`
     Loads the quest catalog, fetches activity data for the wallet, and returns stateless evaluation:

```
{
  "wallet": "0xabc...123",
  "summary": { "totalPoints": 30 },
  "quests": [
    {
      "slug": "first-trade",
      "title": "Execute Your First Trade",
      "status": "COMPLETED",
      "progressPct": 100,
      "metrics": { "count": 3 },
      "points": 5
    }
  ]
}
```

No leaderboard endpoint, no wallet registry, no persistence.

  •  `GET /nft/:slug`
     Returns NFT metadata for the quest. Optional query `wallet` attaches per-wallet evaluation attributes. Supports environment variables `NFT_IMAGE_BASE_URI` / `NFT_ANIMATION_BASE_URI` for asset URLs.

⸻

7) Folder Structure

hyperliquid-quest-mvp/
├─ src/
│  ├─ api/
│  │  ├─ quests.route.ts
│  │  └─ wallets.route.ts
│  ├─ core/
│  │  ├─ evaluator.ts        // stateless quest evaluator
│  │  ├─ questRegistry.ts    // loads quests from JSON
│  │  ├─ rules.ts            // rule executors
│  │  └─ spec.ts             // types + validators
│  ├─ hyperliquid/           // HTTP fetchers to HL APIs (unchanged)
│  ├─ data/
│  │  └─ normalize.ts        // request batching + normalization (stubs)
│  ├─ utils/{env.ts, math.ts}
│  └─ app.ts
├─ src/schemas/quests.seed.json
├─ dist/
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ AGENTS.md

⸻

8) Implementation Notes
  •  `src/core/questRegistry.ts` parses quest specs once, throwing at startup if the JSON is invalid.
  •  `src/core/evaluator.ts` deduplicates activity requests by kind/window and computes quest metrics in memory.
  •  Activity fetchers should honor the `window` semantics when implemented. For `all_time`, prefer aggregate endpoints or clearly document pagination limits.
  •  Because everything is stateless, consider adding short-lived in-memory caches later if evaluation latency becomes an issue; this won’t change the persistence model.

⸻

9) Future Work Ideas
  •  Implement actual Hyperliquid + ecosystem fetchers inside `fetchActivitiesForKind`.
  •  Add Jest suites to lock in quest evaluation logic with synthetic activity fixtures.
  •  Introduce optional in-memory caching for hot wallets or quest lookups.
  •  Expand quest spec validation (e.g., cross-field checks) as new quest types are introduced.

⸻
