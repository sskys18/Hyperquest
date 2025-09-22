Overview

This document defines a set of quests for Hyperliquid DEX and ecosystem DeFi protocols
	•	Quests are pre-defined by the system (not self-reported by users).
	•	Completion is automatically verified via API conditions.

	•	Each quest includes:
	•	Quest ID (unique key for API logic)
	•	Title
	•	Short Description
	•	Long Description
    •	Condition (verifiable event/metric from API) max 3
	•	Points
	•	Rank (Bronze, Silver, Gold, Degen)

⸻

1. Basic Trading Quests

	•	Quest ID: first_deposit
	•	Title: First Step
	•	Short Description: Make your first deposit.
	•	Long Description: Make your first USDC deposits on Hyperliquid to start your trading journey.
    •	Condition: user.deposits.count == 1
	•	Points: 5
	•	Rank: Bronze

	•	Quest ID: first_trade
	•	Title: Rookie Trader
	•	Short Description: Complete your first trade.
	•	Long Description: Complete your very first order on Hyperliquid and get a taste of the action.
    •	Condition: user.trades.count == 1
	•	Points: 5
	•	Rank: Bronze

⸻

2. Extreme Trading Quests

	•	Quest ID: high_volume
	•	Title: Volume Pro
	•	Short Description: Trade over 1M in volume.
	•	Long Description: Achieve over 1,000,000 USD in total trading volume.
    •	Condition: user.total_volume >= 1000000
	•	Points: 10
	•	Rank: Silver

	•	Quest ID: high_pnl_percentage
	•	Title: Profit Pro
	•	Short Description: Achieve 100% PnL on a trade.
	•	Long Description: Achieve over 100% Profit and Loss on a single trade.
    •	Condition: trade.pnl_percentage >= 100
	•	Points: 10
	•	Rank: Silver

	•	Quest ID: large_liquidation
	•	Title: Whale Down
	•	Short Description: Get liquidated on a large position.
	•	Long Description: Get liquidated on a position worth over $10,000.
    •	Condition: liquidation.value >= 10000
	•	Points: 20
	•	Rank: Gold

	•	Quest ID: averaging_down_artisan
	•	Title: Averaging Down Artisan
	•	Short Description: Master the art of averaging down.
	•	Long Description: When a position is down by at least 20%, average down by increasing your position size by at least 50% over 3 separate trades.
    •	Condition: position.unrealized_pnl_percentage <= -20, position.average_down_count >= 3, position.increase_size_percentage >= 50
	•	Points: 20
	•	Rank: Gold

	•	Quest ID: all_in_yolo
	•	Title: All-In Champion
	•	Short Description: Go all-in on a single position.
	•	Long Description: Allocate 80% or more of your total equity into a single position.
    •	Condition: position.notional_value / user.equity >= 0.8
	•	Points: 50
	•	Rank: Degen

⸻

3. Cross-Ecosystem

	•	Quest ID: eco_explorer
	•	Title: Explorer
	•	Short Description: Interact with Hyperliquid and a partner protocol.
	•	Long Description: Interact with Hyperliquid DEX and at least one ecosystem DeFi protocol (e.g., Kinetiq).
    •	Condition: user.interacted_protocols.count >= 2, 'hyperliquid' in user.interacted_protocols
	•	Points: 10
	•	Rank: Silver

	•	Quest ID: liquidity_provider
	•	Title: Liquidity Farmer
	•	Short Description: Provide liquidity on an ecosystem protocol.
	•	Long Description: Provide at least $1,000 of liquidity to a vault on an ecosystem protocol (e.g., Kinetiq, Hyperps).
    •	Condition: user.liquidity_provided.usd_value >= 1000
	•	Points: 10
	•	Rank: Silver

	•	Quest ID: staking_supporter
	•	Title: Ecosystem Staker
	•	Short Description: Stake tokens on a partner protocol.
	•	Long Description: Stake at least $1,000 worth of HLP or other tokens on a partner protocol.
    •	Condition: user.staked_tokens.usd_value >= 1000
	•	Points: 10
	•	Rank: Silver

	•	Quest ID: eco_borrower
	•	Title: DeFi Debtor
	•	Short Description: Borrow from a lending protocol in the ecosystem.
	•	Long Description: Borrow at least $1,000 of assets from a lending protocol within the Hyperliquid ecosystem.
    •	Condition: user.borrowed_assets.usd_value >= 1000
	•	Points: 20
	•	Rank: Gold

	•	Quest ID: yield_aggregator_user
	•	Title: Yield Optimizer
	•	Short Description: Use a yield aggregator in the ecosystem.
	•	Long Description: Deposit at least $1,000 of assets into a yield aggregator that uses Hyperliquid.
    •	Condition: user.yield_aggregator_deposits.usd_value >= 1000
	•	Points: 20
	•	Rank: Gold

⸻

4. Advanced Quests

	•	Quest ID: hip3_market_deployer
	•	Title: Market Maker
	•	Short Description: Deploy a new perp market.
	•	Long Description: Deploy a new perpetual market on Hyperliquid via HIP-3.
    •	Condition: user.deployed_markets.count >= 1
	•	Points: 50
	•	Rank: Degen

⸻

Notes for Implementation
	•	All quests are validated server-side using Hyperliquid APIs.
	•	Difficulty scaling encourages both beginners and extreme risk-takers.

⸻