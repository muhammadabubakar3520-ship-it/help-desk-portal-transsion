export default function MiniDonutChart({ data, size = 160, thickness = 22 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0
    const dash = fraction * circumference
    const seg = { ...d, dash, offset }
    offset += dash
    return seg
  })

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#EEF2F7" strokeWidth={thickness} />
        {total > 0 &&
          segments.map((seg) => (
            <circle
              key={seg.label}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
      </svg>
      <ul className="space-y-2 text-xs">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="font-medium text-ink-700">{d.label}</span>
            <span className="text-slate-400">({d.value})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
