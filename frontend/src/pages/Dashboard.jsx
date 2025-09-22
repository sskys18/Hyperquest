import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import StatTiles from '../components/StatTiles'
import ActivityFeed from '../components/ActivityFeed'
import NFTHoldingsList from '../components/NFTHoldingsList'
import Challenges from '../components/Challenges'
import Leaderboard from '../components/Leaderboard'
import Hero from '../components/Hero'
import { getNFTHoldings, getClaimableChallenges, claimChallenge } from '../lib/mockApi'

export default function Dashboard() {
  const [address, setAddress] = useState('')
  const [holdings, setHoldings] = useState([])
  const [claimables, setClaimables] = useState([])
  const [backendOk, setBackendOk] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/health').then((r) => setBackendOk(r.ok)).catch(() => setBackendOk(false))
  }, [])

  async function loadFor(addr) {
    setAddress(addr)
    setLoading(true)
    try {
      const [nfts, claims] = await Promise.all([
        getNFTHoldings(addr),
        getClaimableChallenges(addr)
      ])
      setHoldings(nfts)
      setClaimables(claims)
    } finally {
      setLoading(false)
    }
  }

  async function handleClaim(challenge) {
    const minted = await claimChallenge(address, challenge)
    setHoldings((prev) => [minted, ...prev])
    setClaimables((prev) => prev.filter((c) => c.id !== challenge.id))
  }

  const totalXp = holdings.reduce((sum, n) => sum + (n.xp || 0), 0)

  return (
    <>
      <Hero onSubmit={loadFor} />
      <div className="mb-6 flex items-center gap-2 justify-center">
        <span className={`w-2 h-2 rounded-full ${backendOk ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="text-white/60 text-xs">{backendOk ? 'Backend online' : 'Backend offline'}</span>
      </div>

      <section className="mb-6">
        <SectionHeader title="Overview" subtitle={address ? `Address: ${address}` : 'Enter a wallet to begin'} />
        <StatTiles />
      </section>

      <section className="mb-6">
        <SectionHeader title="Claimable Challenges" />
        {address ? (
          loading && claimables.length === 0 ? (
            <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
              <div className="muted">Loading...</div>
            </div>
          ) : (
            <Challenges claimables={claimables} onClaim={handleClaim} />
          )
        ) : (
          <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
            <div className="muted">Enter an address above to see claimable challenges.</div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 w-full">
          <SectionHeader title="NFT Holdings" subtitle={`Total XP: ${totalXp.toLocaleString()}`}/>
          {loading && holdings.length === 0 ? (
            <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
              <div className="muted">Loading...</div>
            </div>
          ) : (
            <NFTHoldingsList items={holdings} />
          )}
          <div className="mt-6">
            <ActivityFeed />
          </div>
        </section>

        <aside className="lg:col-span-1 w-full space-y-4">
          <section>
            <SectionHeader title="Leaderboard" />
            <Leaderboard />
          </section>
        </aside>
      </div>
    </>
  )
}
