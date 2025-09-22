import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import StatTiles from '../components/StatTiles'
import ActivityFeed from '../components/ActivityFeed'
import NFTHoldings from '../components/NFTHoldings'
import Challenges from '../components/Challenges'
import IncompleteChallenges from '../components/IncompleteChallenges'
import Leaderboard from '../components/Leaderboard'
import Hero from '../components/Hero'
import { getNFTHoldings, getClaimableChallenges, claimChallenge, getIncompleteChallenges } from '../lib/mockApi'

export default function Dashboard() {
  const [address, setAddress] = useState('')
  const [holdings, setHoldings] = useState([])
  const [claimables, setClaimables] = useState([])
  const [backendOk, setBackendOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('claimable')
  const [incomplete, setIncomplete] = useState([])

  useEffect(() => {
    fetch('/health').then((r) => setBackendOk(r.ok)).catch(() => setBackendOk(false))
  }, [])

  async function loadFor(addr) {
    setAddress(addr)
    setLoading(true)
    try {
      const [nfts, claims, inc] = await Promise.all([
        getNFTHoldings(addr),
        getClaimableChallenges(addr),
        getIncompleteChallenges(addr)
      ])
      setHoldings(nfts)
      setClaimables(claims)
      setIncomplete(inc)
    } finally {
      setLoading(false)
    }
  }

  async function handleClaim(challenge) {
    const minted = await claimChallenge(address, challenge)
    setHoldings((prev) => [minted, ...prev])
    setClaimables((prev) => prev.filter((c) => c.id !== challenge.id))
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 w-full">
          <SectionHeader title="NFT Holdings" />
          {loading && holdings.length === 0 ? (
            <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
              <div className="muted">Loading...</div>
            </div>
          ) : (
            <NFTHoldings items={holdings} />
          )}
          <div className="mt-6">
            <ActivityFeed />
          </div>
        </section>

        <aside className="lg:col-span-1 w-full space-y-4">
          <SectionHeader title="Challenges" />
          <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-1 mb-2 flex">
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${tab === 'claimable' ? 'bg-white/10 font-semibold' : 'text-white/70'}`}
              onClick={() => setTab('claimable')}
            >Claimable</button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${tab === 'incomplete' ? 'bg-white/10 font-semibold' : 'text-white/70'}`}
              onClick={() => setTab('incomplete')}
            >Incomplete</button>
          </div>
          {tab === 'claimable' ? (
            loading && claimables.length === 0 ? (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Loading...</div>
              </div>
            ) : (
              <Challenges claimables={claimables} onClaim={handleClaim} />
            )
          ) : (
            loading && incomplete.length === 0 ? (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Loading...</div>
              </div>
            ) : (
              <IncompleteChallenges items={incomplete} />
            )
          )}
          <section>
            <SectionHeader title="Leaderboard" />
            <Leaderboard />
          </section>
        </aside>
      </div>
    </>
  )
}

