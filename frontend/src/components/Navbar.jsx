import { Link, NavLink } from 'react-router-dom'
import WalletConnectButton from './WalletConnectButton'

export default function Navbar() {
  return (
    <header className="pt-6 pb-3">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/hyperquest.png"
                alt="Hyperquest logo"
                className="w-9 h-9 rounded-md object-contain"
              />
              <div>
                <div className="font-black text-xl tracking-wide">Hyperquest</div>
                <div className="text-xs text-white/60 mt-0.5">Degen Dashboard</div>
              </div>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-white/70 text-sm">
              <NavLink to="/" className={({isActive})=> isActive? 'text-white' : 'hover:text-white'}>Home</NavLink>
              <NavLink to="/challenges" className={({isActive})=> isActive? 'text-white' : 'hover:text-white'}>Challenges</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3"><WalletConnectButton /></div>
        </div>
      </div>
    </header>
  )
}
