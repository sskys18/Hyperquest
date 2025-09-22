import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import SectionHeader from '../components/SectionHeader'
import StatTiles from '../components/StatTiles'
import NFTHoldingsList from '../components/NFTHoldingsList'
import Challenges from '../components/Challenges'
import IncompleteChallenges from '../components/IncompleteChallenges'
import { getNFTHoldings, getClaimableChallenges, getIncompleteChallenges, claimChallenge } from '../lib/mockApi'

function shortAddr(a){ return a ? `${a.slice(0,6)}…${a.slice(-4)}` : '' }

export default function Profile() {
  const { address: connectedAddress, chainId, hasProvider } = useWallet()
  const { address: routeAddress } = useParams()
  const address = routeAddress || connectedAddress
  const [loading, setLoading] = useState(false)
  const [holdings, setHoldings] = useState([])
  const [claimables, setClaimables] = useState([])
  const [incomplete, setIncomplete] = useState([])

  const totalXp = useMemo(() => holdings.reduce((s, n) => s + (n.xp || 0), 0), [holdings])

  useEffect(() => {
    let mounted = true
    async function load(addr) {
      setLoading(true)
      try {
        const [nfts, claims, inc] = await Promise.all([
          getNFTHoldings(addr),
          getClaimableChallenges(addr),
          getIncompleteChallenges(addr)
        ])
        if (!mounted) return
        setHoldings(nfts)
        setClaimables(claims)
        setIncomplete(inc)
      } finally {
        setLoading(false)
      }
    }
    if (address) load(address)
    return () => { mounted = false }
  }, [address])

  async function handleClaim(challenge) {
    const minted = await claimChallenge(address, challenge)
    setHoldings((prev) => [minted, ...prev])
    setClaimables((prev) => prev.filter((c) => c.id !== challenge.id))
  }

  if (!address) {
    return (
      <section className="mb-6">
        <SectionHeader title="Profile" subtitle={hasProvider ? 'Connect your wallet to view profile' : 'Install a wallet to continue'} />
        <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
          <div className="muted">Please connect your wallet using the button in the top right.</div>
        </div>
      </section>
    )
  }

  const stats = [
    { label: 'Total XP', value: totalXp.toLocaleString() },
    { label: 'NFTs', value: String(holdings.length) },
    { label: 'Claimable', value: String(claimables.length) },
    { label: 'In Progress', value: String(incomplete.length) }
  ]

  return (
    <>
      <section className="mb-4">
        <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <img src="/hyperquest.png" alt="profile" className="w-14 h-14 rounded-lg border border-white/10 object-cover" />
            <div className="min-w-0">
              <div className="text-xl font-extrabold truncate">{address}</div>
              <div className="text-xs text-white/60 mt-0.5 truncate">
                Total XP: {totalXp.toLocaleString()} {(!routeAddress && chainId) ? `• Chain ${parseInt(chainId,16)}` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <SectionHeader title="Profile" subtitle={routeAddress ? `Viewing external profile` : `${address} ${chainId ? `(chain ${parseInt(chainId, 16)})` : ''}`} />
        <StatTiles stats={stats} />
      </section>

      <section className="mb-6">
        <SectionHeader title="NFT Holdings" subtitle={`Total XP: ${totalXp.toLocaleString()}`} />
        {loading && holdings.length === 0 ? (
          <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
            <div className="muted">Loading...</div>
          </div>
        ) : (
          <NFTHoldingsList items={holdings} />
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section>
          <SectionHeader title="Claimable Challenges" />
          {loading && claimables.length === 0 ? (
            <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
              <div className="muted">Loading...</div>
            </div>
          ) : (
            <Challenges claimables={claimables} onClaim={handleClaim} />
          )}
        </section>
        <section>
          <SectionHeader title="In Progress" />
          {loading && incomplete.length === 0 ? (
            <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
              <div className="muted">Loading...</div>
            </div>
          ) : (
            <IncompleteChallenges items={incomplete} />
          )}
        </section>
      </div>
    </>
  )
}
