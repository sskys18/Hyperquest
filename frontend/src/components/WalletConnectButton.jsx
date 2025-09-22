import { useState } from 'react'
import { useWallet } from '../context/WalletContext'

function short(a){ return a ? `${a.slice(0,6)}…${a.slice(-4)}` : '' }

export default function WalletConnectButton(){
  const { address, hasProvider, connect, disconnect } = useWallet()
  const [loading, setLoading] = useState(false)

  async function onConnect(){
    if (!hasProvider) { window.open('https://metamask.io/download/', '_blank'); return }
    setLoading(true)
    try { await connect() } finally { setLoading(false) }
  }

  if (!address) {
    return (
      <button
        onClick={onConnect}
        className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#95FCE4] text-[#001018]"
        disabled={loading}
      >{hasProvider ? (loading ? 'Connecting…' : 'Connect Wallet') : 'Install Wallet'}</button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="px-2 py-1 rounded-md text-xs bg-white/10 border border-white/10">{short(address)}</div>
      <button onClick={disconnect} className="text-xs text-white/70 hover:text-white">Disconnect</button>
    </div>
  )
}

