export default function MiniBarChart({ data, width = 320, height = 160, color = '#005BAC' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map((d) => d.value), 1)
  const padX = 8
  const padBottom = 20
  const padTop = 10
  const innerW = width - padX * 2
  const innerH = height - padBottom - padTop
  const gap = 14
  const barW = (innerW - gap * (data.length - 1)) / data.length

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * innerH
        const x = padX + i * (barW + gap)
        const y = padTop + innerH - barH
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(barH, 2)}
              rx="5"
              fill={d.color || color}
              opacity="0.9"
            />
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#94A3B8"
              fontFamily="Inter, sans-serif"
            >
              {d.label}
            </text>
            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#1E293B"
              fontFamily="Inter, sans-serif"
            >
              {d.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
