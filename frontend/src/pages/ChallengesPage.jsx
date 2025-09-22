import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import Challenges from '../components/Challenges'
import NFTHoldingsList from '../components/NFTHoldingsList'
import IncompleteChallenges from '../components/IncompleteChallenges'
import { CHALLENGES } from '../data/challenges'
import AllChallengesList from '../components/AllChallengesList'
import { useWallet } from '../context/WalletContext'
import { getClaimableChallenges, getIncompleteChallenges, getNFTHoldings } from '../lib/mockApi'

export default function ChallengesPage() {
  const { address } = useWallet()
  const [tab, setTab] = useState('claimable')
  const [claimables, setClaimables] = useState([])
  const [incomplete, setIncomplete] = useState([])
  const [loading, setLoading] = useState(false)
  const [holdings, setHoldings] = useState([])

  async function loadFor(addr) {
    setLoading(true)
    try {
      const [claims, inc, nfts] = await Promise.all([
        getClaimableChallenges(addr),
        getIncompleteChallenges(addr),
        getNFTHoldings(addr)
      ])
      setClaimables(claims)
      setIncomplete(inc)
      setHoldings(nfts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (address) loadFor(address)
  }, [address])

  return (
    <>
      <section className="mb-6">
        <SectionHeader title="Challenges" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 space-y-3">
          <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-1 flex w-fit">
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${tab === 'claimable' ? 'bg-white/10 font-semibold' : 'text-white/70'}`}
              onClick={() => setTab('claimable')}
            >Claimable</button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${tab === 'incomplete' ? 'bg-white/10 font-semibold' : 'text-white/70'}`}
              onClick={() => setTab('incomplete')}
            >Incomplete</button>
            <button
              className={`px-3 py-1.5 text-sm rounded-lg ${tab === 'holdings' ? 'bg-white/10 font-semibold' : 'text-white/70'}`}
              onClick={() => setTab('holdings')}
            >Your NFTs</button>
          </div>

          {tab === 'claimable' ? (
            loading ? (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Loading...</div>
              </div>
            ) : address ? (
              <Challenges claimables={claimables} onClaim={() => {}} />
            ) : (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Connect your wallet to see claimable challenges.</div>
              </div>
            )
          ) : tab === 'incomplete' ? (
            loading ? (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Loading...</div>
              </div>
            ) : address ? (
              <IncompleteChallenges items={incomplete} />
            ) : (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Connect your wallet to see progress.</div>
              </div>
            )
          ) : (
            // holdings tab
            loading ? (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Loading...</div>
              </div>
            ) : address ? (
              <NFTHoldingsList items={holdings} />
            ) : (
              <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
                <div className="muted">Connect your wallet to view your NFTs.</div>
              </div>
            )
          )}
        </section>

        <aside className="space-y-3">
          <SectionHeader title="All Challenges" />
          <AllChallengesList items={CHALLENGES} />
        </aside>
      </div>

      
    </>
  )
}
