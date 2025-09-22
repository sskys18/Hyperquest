import { CHALLENGES } from '../data/challenges'

function pseudoRandomFromAddress(address) {
  let x = 0
  for (let i = 0; i < address.length; i++) x = (x * 31 + address.charCodeAt(i)) % 1_000_000
  return x / 1_000_000
}

export async function getNFTHoldings(address) {
  // Simulate network
  await new Promise((r) => setTimeout(r, 250))
  const r = pseudoRandomFromAddress(address || '0x')
  const tiers = ['bronze', 'silver', 'gold', 'degen']
  const tierXp = { bronze: 50, silver: 120, gold: 260, degen: 420 }
  const sample = CHALLENGES.slice(0, 3).map((c, i) => ({
    id: `${c.id}-${i}`,
    name: `${c.name} #${i + 1}`,
    description: c.description,
    tier: tiers[Math.floor((r * 10 + i) % tiers.length)],
    xp: (() => {
      const t = tiers[Math.floor((r * 10 + i) % tiers.length)]
      const jitter = Math.floor((r * 100 + i * 17) % 40)
      return tierXp[t] + jitter
    })()
  }))
  return sample
}

export async function getClaimableChallenges(address) {
  await new Promise((r) => setTimeout(r, 350))
  const r = pseudoRandomFromAddress(address || '0x')
  const tiers = ['bronze', 'silver', 'gold', 'degen']
  const tierXp = { bronze: 50, silver: 120, gold: 260, degen: 420 }
  // Pick 3 random claimables with a chosen tier per challenge
  return CHALLENGES.slice(0, 4).map((c, i) => {
    const tier = tiers[Math.floor((r * 100 + i * 3) % tiers.length)]
    const jitter = Math.floor((r * 100 + i * 11) % 40)
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      tier,
      xp: (tierXp[tier] || 0) + jitter,
      requirements: c.requirements
    }
  })
}

export async function claimChallenge(address, challenge) {
  await new Promise((r) => setTimeout(r, 500))
  // Return a minted NFT-like object
  const tierXp = { bronze: 50, silver: 120, gold: 260, degen: 420 }
  return {
    id: `${challenge.id}-${Date.now()}`,
    name: `${challenge.name}`,
    description: challenge.description,
    tier: challenge.tier,
    xp: tierXp[challenge.tier] || 50
  }
}

export async function getIncompleteChallenges(address) {
  await new Promise((r) => setTimeout(r, 300))
  const seed = pseudoRandomFromAddress(address || '0x')
  // Build requirements with progress < 100
  return CHALLENGES.slice(0, 5).map((c, idx) => {
    const base = (seed * 100 + idx * 7) % 100
    const reqs = c.requirements.map((label, i) => ({
      label,
      progress: Math.min(95, Math.max(5, (base + i * 13) % 100))
    }))
    return {
      id: `${c.id}-incomplete`,
      name: c.name,
      description: c.description,
      targetTier: c.tiers[(idx + 1) % c.tiers.length],
      requirements: reqs
    }
  })
}
