Overview

This document defines a set of quests for Hyperliquid DEX and ecosystem DeFi protocols
	•	Quests are pre-defined by the system (not self-reported by users).
	•	Completion is automatically verified via API conditions.

	•	Each quest includes:
	•	Quest ID (unique key for API logic)
	•	Description
	•	Reward (badge/points/title)
	•	Difficulty (Easy, Medium, Hard, Extreme, Legendary)

⸻

1. Basic Trading Quests
	•	Quest ID: first_trade
	•	Description: Complete your very first order on Hyperliquid.
	•	Reward: Rookie Trader
	•	Difficulty: Easy

	•	Quest ID: first_deposit
	•	Description: Make your first deposit on Hyperliquid.
	•	Reward: First Step
	•	Difficulty: Easy

⸻

2. Extreme Trading Quests
	•	Quest ID: high_pnl_percentage
	•	Description: Achieve over 100% PnL on a single trade.
	•	Reward: Profit Pro
	•	Difficulty: Medium

	•	Quest ID: large_liquidation
	•	Description: Get liquidated on a position worth over $10,000.
	•	Reward: Whale Down
	•	Difficulty: Hard

	•	Quest ID: buying the dip
	•	Description: Average down a losing position at least 3 times.
	•	Reward: Averager
	•	Difficulty: Medium

	•	Quest ID: all_in_yolo
	•	Description: Allocate 80%+ of total equity into a single position.
	•	Reward: YOLO
	•	Difficulty: Legendary

⸻

3. Cross-Ecosystem
	•	Quest ID: eco_explorer
	•	Description: Interact with Hyperliquid DEX and at least one ecosystem DeFi protocol (e.g., Kinetiq).
	•	Reward: Explorer
	•	Difficulty: Medium

⸻

Notes for Implementation
	•	All quests are validated server-side using Hyperliquid APIs.
	•	Difficulty scaling encourages both beginners and extreme risk-takers.
