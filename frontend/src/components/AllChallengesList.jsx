import { useState } from 'react'
import TierBadge from './TierBadge'

const TIER_BG = {
  degen: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--highlight), var(--primary))',
  gold: 'radial-gradient(circle at 30% 30%, #FFE680, #FFD34D 40%, #FFA500 100%)',
  silver: 'radial-gradient(circle at 30% 30%, #F0F0F0, #C0C0C0 45%, #8F8F8F 100%)',
  bronze: 'radial-gradient(circle at 30% 30%, #E6B17A, #CD7F32 45%, #8C5A22 100%)'
}

export default function AllChallengesList({ items }) {
  const [open, setOpen] = useState({})

  function toggle(id) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-2">
      {items.map((c) => {
        const isOpen = !!open[c.id]
        return (
          <div key={c.id} className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => toggle(c.id)}
              className="w-full px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg border border-white/10"
                     style={{
                       background: TIER_BG[c.tiers[c.tiers.length - 1]] || 'linear-gradient(180deg, #0e1620, #0b1219)'
                     }} />
                <div className="text-left min-w-0">
                  <div className="font-extrabold truncate">{c.name}</div>
                  <div className="text-xs text-white/60 truncate">{c.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TierBadge tier={c.tiers[c.tiers.length - 1]} />
                <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <div className="mt-1 text-xs text-white/70">Requirements</div>
                <ul className="mt-2 space-y-2">
                  {c.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--highlight)]" />
                      <span className="text-white/85 break-words">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
