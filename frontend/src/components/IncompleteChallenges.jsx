import TierBadge from './TierBadge'

const TIER_XP = { bronze: 50, silver: 120, gold: 260, degen: 420 }

export default function IncompleteChallenges({ items }) {
  if (!items) return null
  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
        <div className="muted">No incomplete challenges — nice!</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((c) => (
        <div key={c.id}>
          <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4 w-full">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-extrabold">{c.name}</div>
                  <TierBadge tier={c.targetTier} />
                </div>
                <div className="muted text-xs mt-1.5 break-words">{c.description}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-extrabold">{TIER_XP[c.targetTier] ?? 0}</div>
                <div className="text-[11px] text-white/60">XP</div>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {c.requirements.map((r, i) => (
                <div key={i} className="">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="muted">{r.label}</span>
                    <span className="text-white/80">{Math.round(r.progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
