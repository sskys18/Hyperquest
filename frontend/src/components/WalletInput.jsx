import { useState } from 'react'

export default function WalletInput({ onSubmit, large=false, placeholder='Enter wallet address (0x...)' }) {
  const [addr, setAddr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!addr) return
    setLoading(true)
    try { await onSubmit(addr) } finally { setLoading(false) }
  }

  const formClass = large
    ? 'shadow-glow bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-3'
    : 'shadow-glow bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3'
  const inputClass = large
    ? 'flex-1 bg-[#06201C] border border-white/10 text-white rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[rgba(139,218,204,0.4)]'
    : 'flex-1 bg-[#06201C] border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[rgba(139,218,204,0.4)]'
  const buttonClass = large
    ? 'font-bold text-[#001018] bg-gradient-to-r from-primary to-accent rounded-xl px-5 py-3'
    : 'font-bold text-[#001018] bg-gradient-to-r from-primary to-accent rounded-lg px-4 py-2'

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <input
        className={inputClass}
        placeholder={placeholder}
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
      />
      <button className={`${buttonClass} disabled:opacity-60`} disabled={!addr || loading}>
        {loading ? 'Loading...' : 'Load'}
      </button>
    </form>
  )
}
