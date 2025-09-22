Overview

This document defines a set of quests for Hyperliquid DEX and ecosystem DeFi protocols
	•	Quests are pre-defined by the system (not self-reported by users).
	•	Completion is automatically verified via API conditions.

	•	Each quest includes:
	•	Quest ID (unique key for API logic)
	•	Description
    •	Condition (verifiable event/metric from API)
	•	Reward (badge/points/title)
	•	Difficulty (Easy, Medium, Hard, Extreme, Legendary)

⸻

1. Basic Trading Quests
	•	Quest ID: first_deposit
	•	Description: Make your first deposit on Hyperliquid.
    •	Condition: user.deposits.count == 1
	•	Reward: First Step
	•	Difficulty: Easy

	•	Quest ID: first_trade
	•	Description: Complete your very first order on Hyperliquid.
    •	Condition: user.trades.count == 1
	•	Reward: Rookie Trader
	•	Difficulty: Easy

⸻

2. Extreme Trading Quests
	•	Quest ID: high_volume
	•	Description: Achieve over 1M Volume.
    •	Condition: user.total_volume >= 1000000
	•	Reward: Volume Pro
	•	Difficulty: Medium

	•	Quest ID: high_pnl_percentage
	•	Description: Achieve over 100% PnL on a single trade.
    •	Condition: trade.pnl_percentage >= 100
	•	Reward: Profit Pro
	•	Difficulty: Medium

	•	Quest ID: large_liquidation
	•	Description: Get liquidated on a position worth over $10,000.
    •	Condition: liquidation.value >= 10000
	•	Reward: Whale Down
	•	Difficulty: Hard

	•	Quest ID: buying_the_dip
	•	Description: Average down a losing position at least 3 times.
    •	Condition: position.average_down_count >= 3
	•	Reward: Averager
	•	Difficulty: Medium

	•	Quest ID: all_in_yolo
	•	Description: Allocate 80%+ of total equity into a single position.
    •	Condition: position.notional_value / user.equity >= 0.8
	•	Reward: YOLO
	•	Difficulty: Legendary

⸻

3. Cross-Ecosystem
	•	Quest ID: eco_explorer
	•	Description: Interact with Hyperliquid DEX and at least one ecosystem DeFi protocol (e.g., Kinetiq).
    •	Condition: user.interacted_protocols.count >= 2 and 'hyperliquid' in user.interacted_protocols
	•	Reward: Explorer
	•	Difficulty: Medium

	•	Quest ID: liquidity_provider
	•	Description: Provide liquidity to a vault on an ecosystem protocol (e.g., Kinetiq, Hyperps).
    •	Condition: user.liquidity_provided.usd_value >= 1000
	•	Reward: Liquidity Farmer
	•	Difficulty: Medium

	•	Quest ID: staking_supporter
	•	Description: Stake HLP or other tokens on a partner protocol.
    •	Condition: user.staked_tokens.usd_value >= 1000
	•	Reward: Ecosystem Staker
	•	Difficulty: Medium

	•	Quest ID: eco_borrower
	•	Description: Borrow assets from a lending protocol within the Hyperliquid ecosystem.
    •	Condition: user.borrowed_assets.usd_value >= 1000
	•	Reward: DeFi Debtor
	•	Difficulty: Hard

	•	Quest ID: yield_aggregator_user
	•	Description: Deposit assets into a yield aggregator that uses Hyperliquid.
    •	Condition: user.yield_aggregator_deposits.usd_value >= 1000
	•	Reward: Yield Optimizer
	•	Difficulty: Hard

⸻

Notes for Implementation
	•	All quests are validated server-side using Hyperliquid APIs.
	•	Difficulty scaling encourages both beginners and extreme risk-takers.

⸻