import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen text-white" style={{
      background:
        'radial-gradient(1200px 800px at 80% -20%, rgba(149,252,228,0.18), transparent 60%), radial-gradient(900px 600px at -20% 10%, rgba(139,218,204,0.14), transparent 60%), #0A2A26'
    }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-5">{children}</main>
      <Footer />
    </div>
  )
}
