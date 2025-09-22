import ClaimButton from './ClaimButton'

const TIER_COLORS = {
  bronze: '#cd7f32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  degen: '#8BDACC'
}

export default function Challenges({ claimables, onClaim }) {
  if (!claimables) return null
  if (claimables.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
        <div className="muted">No claimable challenges for this address.</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {claimables.map((c) => (
        <div key={c.id}>
          <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4 flex gap-3 w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-extrabold truncate">{c.name}</div>
                <span
                  className="text-[11px] font-extrabold tracking-wide"
                  style={{ color: TIER_COLORS[c.tier] || 'var(--muted)' }}
                >
                  {String(c.tier || '').toUpperCase()}
                </span>
              </div>
              <div className="muted text-xs mt-1.5 break-words">{c.description}</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                {c.requirements.map((r, i) => (
                  <span key={i} className="muted text-xs border border-white/10 px-2 py-1 rounded-full break-words">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-extrabold">{c.xp ?? 0}</div>
                <div className="text-[11px] text-white/60">XP</div>
              </div>
              <ClaimButton label="Claim" onClick={() => onClaim(c)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
