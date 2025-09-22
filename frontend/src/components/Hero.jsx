import WalletInput from './WalletInput'

export default function Hero({ onSubmit }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-24 right-10 w-[520px] h-[520px] rounded-full blur-3xl"
             style={{background:'radial-gradient(closest-side, rgba(139,218,204,0.25), transparent)'}} />
        <div className="absolute -left-24 top-10 w-[420px] h-[420px] rounded-full blur-3xl"
             style={{background:'radial-gradient(closest-side, rgba(19,195,154,0.20), transparent)'}} />
      </div>
      <div className="relative text-center max-w-3xl mx-auto py-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#95FCE4] via-white to-[#13C39A]">
          Check your claimable NFTs
        </h1>
        <p className="text-white/70 mt-3">Enter a wallet to discover challenges, claim badges, and flex your grind.</p>
        <div className="mt-6 max-w-2xl mx-auto">
          <WalletInput onSubmit={onSubmit} large placeholder="Enter wallet address to check claimables" />
        </div>
      </div>
    </section>
  )
}
