// List-style view of NFT holdings
const TIER_COLORS = {
  bronze: '#cd7f32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  degen: '#8BDACC'
}

export default function NFTHoldingsList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
        <div className="muted">No NFTs found.</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((nft) => (
        <div key={nft.id} className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-3">
          <div className="flex items-start gap-3">
            <div
              aria-hidden
              className="w-12 h-12 rounded-xl border border-white/10 flex-shrink-0"
              style={{
                background:
                  nft.tier === 'degen'
                    ? 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--highlight), var(--primary))'
                    : 'linear-gradient(180deg, #0e1620, #0b1219)'
              }}
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
      ))}
    </div>
  )
}
