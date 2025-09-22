export default function Card({ className = '', children }) {
  return (
    <div className={`bg-gradient-to-b from-[#0F3A33] to-[#0A2A26] border border-white/10 rounded-xl ${className}`}>
      {children}
    </div>
  )
}
