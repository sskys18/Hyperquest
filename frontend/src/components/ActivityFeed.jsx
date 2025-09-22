import Card from './Card'

export default function ActivityFeed({ items }) {
  const data = items || [
    { id: 1, type: 'claim', title: 'Claimed Beast Mode (gold)', time: '2m ago' },
    { id: 2, type: 'progress', title: 'Dip Master 72% → 80%', time: '10m ago' },
    { id: 3, type: 'claim', title: 'Claimed Deposit Streak (silver)', time: '1h ago' },
  ]
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold">Recent Activity</h3>
        <span className="text-xs text-white/60">Live</span>
      </div>
      <div className="space-y-3">
        {data.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 ${a.type === 'claim' ? 'bg-cyan-400' : 'bg-fuchsia-400'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold break-words">{a.title}</div>
              <div className="text-[11px] text-white/60">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

