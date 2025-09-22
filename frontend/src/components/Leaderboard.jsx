import { SHORT_LEADERBOARD } from '../data/leaderboard'

function shortAddr(a){
  return a ? `${a.slice(0,6)}…${a.slice(-4)}` : ''
}

export default function Leaderboard(){
  const data = SHORT_LEADERBOARD
  return (
    <div className="bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-lg">Leaderboard</h3>
        <span className="text-xs text-white/60">Top degens</span>
      </div>
      <div className="divide-y divide-white/10">
        {data.map((row, idx) => (
          <div key={row.address} className="flex items-center gap-3 py-3">
            <div className="w-8 text-white/70 text-sm">{idx+1}</div>
            <div className="w-9 h-9 rounded-lg border border-white/10"
              style={{background:'conic-gradient(from 0deg, var(--primary), var(--accent), var(--accent-2), var(--primary))'}} />
            <div className="flex-1">
              <div className="font-semibold">{shortAddr(row.address)}</div>
              <div className="text-[11px] text-white/60">{row.title}</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold">{row.points}</div>
              <div className="text-[11px] text-white/60">pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
