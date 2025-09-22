Overview

This document defines a set of quests for Hyperliquid DEX and ecosystem DeFi protocols
	•	Quests are pre-defined by the system (not self-reported by users).
	•	Completion is automatically verified via API conditions.
	•	Each quest includes:
	•	Quest ID (unique key for API logic)
	•	Title
	•	Description
	•	Condition (verifiable event/metric from API)
	•	Reward (badge/points/title)
	•	Difficulty (Easy, Medium, Hard, Extreme, Legendary)

⸻

1. Basic Trading Quests
	•	Quest ID: first_trade
	•	Title: First Strike
	•	Description: Complete your very first order on Hyperliquid.
	•	Condition: event.type == 'order_execution' and count(user.orders) == 1
	•	Reward: Badge 🌱 Rookie Trader
	•	Difficulty: Easy
	•	Quest ID: limit_hunter
	•	Title: Limit Hunter
	•	Description: Enter a position using only a limit order.
	•	Condition: order.type == 'limit' and event.type == 'order_execution'
	•	Reward: Badge 🎯 Precision
	•	Difficulty: Easy
	•	Quest ID: two_sided
	•	Title: Two-Sided Arena
	•	Description: Open and close both a Long and a Short position within 24h.
	•	Condition: exists(position.side == 'long') and exists(position.side == 'short')
	•	Reward: Badge ⚖️ Balanced
	•	Difficulty: Medium

⸻

2. Fun & Meme Quests
	•	Quest ID: weird_size
	•	Title: Weird Flex Trader
	•	Description: Open a position with a meme size (69, 420, 1337, etc.).
	•	Condition: position.size in {69, 420, 1337}
	•	Reward: Badge 😂 Meme Lord
	•	Difficulty: Easy
	•	Quest ID: time_traveler
	•	Title: Time Traveler Trader
	•	Description: Execute a trade only between 3:00–5:00 AM UTC.
	•	Condition: order.timestamp in [03:00, 05:00]
	•	Reward: Badge 🌙 Midnight Trader
	•	Difficulty: Medium
	•	Quest ID: streak_master
	•	Title: Streak Master
	•	Description: Trade at least once every day for 7 consecutive days.
	•	Condition: count(trading_days_consecutive) >= 7
	•	Reward: Badge 🔥 Consistency King
	•	Difficulty: Hard

⸻

3. Extreme Trading Quests
	•	Quest ID: liq_survivor
	•	Title: Liquidation Survivor
	•	Description: Get liquidated once. Painful but educational.
	•	Condition: event.type == 'liquidation'
	•	Reward: Badge 💀 Survivor
	•	Difficulty: Extreme
	•	Quest ID: avg_down3
	•	Title: Triple Averager
	•	Description: Average down a losing position at least 3 times.
	•	Condition: avgEntryPrice updated downwards 3+ times in same position.
	•	Reward: Badge 🎯 Averager
	•	Difficulty: Medium
	•	Quest ID: all_in_yolo
	•	Title: YOLO All-in
	•	Description: Allocate 80%+ of total equity into a single position.
	•	Condition: abs(position.notional) / account.equity >= 0.8
	•	Reward: Badge 🔥 YOLO
	•	Difficulty: Legendary
	•	Quest ID: stoploss_trigger
	•	Title: Stop-Loss Samurai
	•	Description: Have your own stop-loss trigger and execute.
	•	Condition: order.reason == 'stop' and event.type == 'order_execution'
	•	Reward: Badge 🗡️ Samurai
	•	Difficulty: Hard
	•	Quest ID: rev_trade
	•	Title: Revenge Trader
	•	Description: After a losing trade, immediately open a new position and recover at least the previous loss.
	•	Condition: prev.pnl < 0 and next.pnl >= abs(prev.pnl)
	•	Reward: Badge ⚔️ Avenger
	•	Difficulty: Extreme
	•	Quest ID: double_liq
	•	Title: Double Liquidation Dance
	•	Description: Experience liquidation on both Long and Short positions.
	•	Condition: liquidation.side == 'long' and liquidation.side == 'short'
	•	Reward: Badge 💀💀 Double Dead
	•	Difficulty: Legendary

⸻

4. Cross-Ecosystem & Advanced Quests
	•	Quest ID: funding_fee
	•	Title: Funding Raider
	•	Description: Pay or receive funding at least once.
	•	Condition: funding.payment != 0
	•	Reward: Badge ⚡ Raider
	•	Difficulty: Medium
	•	Quest ID: eco_explorer
	•	Title: Eco Explorer
	•	Description: Interact with Hyperliquid DEX and at least one ecosystem DeFi protocol (e.g., Kinetiq).
	•	Condition: event.protocol in {hyperliquid, kinetiq}
	•	Reward: Badge 🌍 Explorer
	•	Difficulty: Medium
	•	Quest ID: hedge_master
	•	Title: Perfect Hedge
	•	Description: Build a delta-neutral position combining Spot and Perp.
	•	Condition: abs(net_delta) < 0.01
	•	Reward: Badge 🛡️ Hedge Master
	•	Difficulty: Expert

⸻

Notes for Implementation
	•	All quests are validated server-side using Hyperliquid APIs.
	•	Difficulty scaling encourages both beginners and extreme risk-takers.

⸻