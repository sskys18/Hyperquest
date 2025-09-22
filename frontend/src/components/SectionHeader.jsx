export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <div className="flex items-end justify-between gap-2">
        <h2 className="m-0 text-2xl font-extrabold tracking-wide">{title}</h2>
        {subtitle && <p className="m-0 text-white/60 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}
