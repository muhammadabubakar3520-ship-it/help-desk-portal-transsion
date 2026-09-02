export default function MiniLineChart({ data, width = 320, height = 140, color = '#005BAC' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map((d) => d.value), 1)
  const padX = 8
  const padY = 12
  const innerW = width - padX * 2
  const innerH = height - padY * 2
  const stepX = innerW / Math.max(data.length - 1, 1)

  const points = data.map((d, i) => {
    const x = padX + stepX * i
    const y = padY + innerH - (d.value / max) * innerH
    return [x, y]
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1][0]},${padY + innerH} L${points[0][0]},${padY + innerH} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lineFill)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="white" stroke={color} strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text
          key={d.label}
          x={points[i][0]}
          y={height - 2}
          textAnchor="middle"
          fontSize="9"
          fill="#94A3B8"
          fontFamily="Inter, sans-serif"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}
