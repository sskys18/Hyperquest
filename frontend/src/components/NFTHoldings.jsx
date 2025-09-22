// Inline tier label next to name
const TIER_COLORS = {
  bronze: '#cd7f32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  degen: '#8BDACC'
}

const TIER_BG = {
  degen: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--accent-2), var(--primary))',
  gold: 'radial-gradient(circle at 30% 30%, #FFE680, #FFD34D 40%, #FFA500 100%)',
  silver: 'radial-gradient(circle at 30% 30%, #F0F0F0, #C0C0C0 45%, #8F8F8F 100%)',
  bronze: 'radial-gradient(circle at 30% 30%, #E6B17A, #CD7F32 45%, #8C5A22 100%)'
}

export default function NFTHoldings({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
        <div className="muted">No NFTs found.</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((nft) => (
        <div key={nft.id}>
          <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4 w-full">
            <div className="flex gap-3 items-start">
              <div
                aria-hidden
                className="w-16 h-16 rounded-2xl border border-white/10"
                style={{ background: TIER_BG[nft.tier] || 'linear-gradient(180deg, #0e1620, #0b1219)' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-extrabold truncate">{nft.name}</div>
                  <span
                    className="text-[11px] font-extrabold tracking-wide"
                    style={{ color: TIER_COLORS[nft.tier] || 'var(--muted)' }}
                  >
                    {String(nft.tier || '').toUpperCase()}
                  </span>
                </div>
                <div className="muted text-xs mt-1.5 break-words">{nft.description}</div>
              </div>
              <div className="ml-3 text-right flex-shrink-0">
                <div className="font-extrabold">{nft.xp ?? 0}</div>
                <div className="text-[11px] text-white/60">XP</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
