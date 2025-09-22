const COLORS = {
  bronze: '#cd7f32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  degen: '#00e5ff'
}

export default function TierBadge({ tier }) {
  const color = COLORS[tier] || 'var(--muted)'
  return (
    <span
      className="text-[12px] font-bold tracking-wide border border-white/15 rounded-full px-2 py-0.5"
      style={{ color }}
    >
      {tier.toUpperCase()}
    </span>
  )
}
