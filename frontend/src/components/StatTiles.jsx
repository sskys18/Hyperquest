import Card from './Card'

export default function StatTiles({ stats }) {
  const items = stats || [
    { label: 'Total Badges', value: '12' },
    { label: 'Claimable', value: '4' },
    { label: 'Completed Challenges', value: '8' },
    { label: 'XP', value: '24,560' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((s, i) => (
        <Card key={i} className="p-4">
          <div className="text-white/60 text-xs">{s.label}</div>
          <div className="text-2xl font-extrabold mt-1">{s.value}</div>
        </Card>
      ))}
    </div>
  )
}

