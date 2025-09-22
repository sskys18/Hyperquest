export default function Header() {
  return (
    <header className="pt-6 pb-2">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="w-9 h-9 rounded-xl"
              style={{
                background:
                  'conic-gradient(from 0deg, var(--primary), var(--accent), var(--accent-2), var(--primary))',
                boxShadow: '0 0 24px rgba(0,229,255,0.35)'
              }}
            />
            <div>
              <div className="font-black text-xl tracking-wide">Hyperquest</div>
              <div className="text-xs muted mt-0.5">Degen Dashboard</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
