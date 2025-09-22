export default function ClaimButton({ disabled, onClick, label = 'Claim' }) {
  return (
    <button
      className="font-bold text-[#001018] bg-[#95FCE4] rounded-lg px-4 py-2 disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
