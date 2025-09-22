Overview

This document defines a set of quests for Hyperliquid DEX and ecosystem DeFi protocols
	•	Quests are pre-defined by the system (not self-reported by users).
	•	Completion is automatically verified via API conditions.
	
	•	Each quest includes:
	•	Quest ID (unique key for API logic)
	•	Title
	•	Description
	•	Reward (badge/points/title)
	•	Difficulty (Easy, Medium, Hard, Extreme, Legendary)

⸻

1. Basic Trading Quests
	•	Quest ID: first_trade
	•	Title: First Strike
	•	Description: Complete your very first order on Hyperliquid.
	•	Reward: Badge 🌱 Rookie Trader
	•	Difficulty: Easy

	•	Quest ID: first_deposit
	•	Title: First Deposit
	•	Description: Make your first deposit on Hyperliquid.
	•	Reward: Badge 💰 First Step
	•	Difficulty: Easy

	•	Quest ID: high_pnl_percentage
	•	Title: Profit Pro
	•	Description: Achieve over 100% PnL on a single trade.
	•	Reward: Badge 📈 Profit Pro
	•	Difficulty: Medium

	•	Quest ID: high_margin_trader
	•	Title: Margin Trader
	•	Description: Use over 50% of your margin in a single position.
	•	Reward: Badge 💪 Margin Trader
	•	Difficulty: Medium


⸻

2. Extreme Trading Quests
	•	Quest ID: liq_survivor
	•	Title: Liquidation Survivor
	•	Description: Get liquidated once. Painful but educational.
	•	Reward: Badge 💀 Survivor
	•	Difficulty: Extreme

	•	Quest ID: large_liquidation
	•	Title: Whale Liquidation
	•	Description: Get liquidated on a position worth over $10,000.
	•	Reward: Badge 🐋 Whale Down
	•	Difficulty: Hard

	•	Quest ID: buying the dip
	•	Title: Triple Averager
	•	Description: Average down a losing position at least 3 times.
	•	Reward: Badge 🎯 Averager
	•	Difficulty: Medium

	•	Quest ID: all_in_yolo
	•	Title: YOLO All-in
	•	Description: Allocate 80%+ of total equity into a single position.
	•	Reward: Badge 🔥 YOLO
	•	Difficulty: Legendary

	•	Quest ID: double_liq
	•	Title: Double Trouble
	•	Description: Experience liquidation on both Long and Short positions.
	•	Reward: Badge 💀💀 Double Dead
	•	Difficulty: Legendary

⸻

3. Cross-Ecosystem & Advanced Quests
	•	Quest ID: eco_explorer
	•	Title: Eco Explorer
	•	Description: Interact with Hyperliquid DEX and at least one ecosystem DeFi protocol (e.g., Kinetiq).
	•	Reward: Badge 🌍 Explorer
	•	Difficulty: Medium

	•	Quest ID: hedge_master
	•	Title: Perfect Hedge
	•	Description: Build a delta-neutral position combining Spot and Perp.
	•	Reward: Badge 🛡️ Hedge Master
	•	Difficulty: Expert

⸻

Notes for Implementation
	•	All quests are validated server-side using Hyperliquid APIs.
	•	Difficulty scaling encourages both beginners and extreme risk-takers.
