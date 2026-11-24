import { memo, useId, useMemo, type CSSProperties } from 'react'
import { decomposePlates } from '@training/shared/utils/plates'

interface PlateDiagramProps {
  weight: number
  barWeight?: number
}

interface PlatePiece {
  weight: number
  x: number
  y: number
  width: number
  height: number
  side: 'left' | 'right'
  delay: number
}

function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function plateToken(weight: number): string {
  return `--plate-${String(weight).replace('.', '_')}`
}

function plateHeight(weight: number): number {
  return Math.max(20, Math.min(48, 20 + (weight / 20) * 28))
}

function plateWidth(weight: number): number {
  return Math.max(7, Math.min(16, 7 + (weight / 20) * 9))
}

function buildPieces(plates: number[], side: 'left' | 'right'): PlatePiece[] {
  let offset = 0
  const collarX = side === 'left' ? 126 : 274
  return plates.map((weight, index) => {
    const width = plateWidth(weight)
    const height = plateHeight(weight)
    const x = side === 'left' ? collarX - offset - width : collarX + offset
    offset += width
    return { weight, x, y: 60 - height / 2, width, height, side, delay: index * 80 }
  })
}

export const PlateDiagram = memo(function PlateDiagram({
  weight,
  barWeight = 20,
}: PlateDiagramProps) {
  const titleId = useId()
  const result = useMemo(() => decomposePlates(weight, barWeight), [barWeight, weight])

  const pieces = useMemo(() => {
    if (!result.ok) return []
    return [...buildPieces(result.plates, 'left'), ...buildPieces(result.plates, 'right')]
  }, [result])

  // Unique plate weights used in this decomposition, heaviest first.
  // Each entry counts how many pairs of that weight sit on the bar so the
  // legend can read "25 кг · 2×" rather than just listing the colour twice.
  const usedPlates = useMemo(() => {
    if (!result.ok) return []
    const counts = new Map<number, number>()
    for (const w of result.plates) {
      counts.set(w, (counts.get(w) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([weight, pairs]) => ({ weight, pairs }))
      .sort((a, b) => b.weight - a.weight)
  }, [result])

  const formula = result.ok
    ? result.plates.length
      ? `${formatWeight(result.barWeight)} + 2 × (${result.plates.map(formatWeight).join(' + ')}) = ${formatWeight(result.totalWeight)} кг`
      : `Только гриф · ${formatWeight(result.barWeight)} кг`
    : `Вес ${formatWeight(weight)} кг не раскладывается. Ближайший доступный: ${formatWeight(result.suggestion)} кг`

  return (
    <figure className="ta-calc-plates">
      <svg
        className="ta-calc-plates__svg"
        viewBox="0 0 400 120"
        role="img"
        aria-labelledby={`${titleId}-title ${titleId}-desc`}
      >
        <title id={`${titleId}-title`}>Состав штанги</title>
        <desc id={`${titleId}-desc`}>{formula}</desc>
        <rect className="ta-calc-plates__bar" x="52" y="57" width="296" height="6" rx="3" />
        <rect className="ta-calc-plates__sleeve" x="112" y="52" width="10" height="16" rx="3" />
        <rect className="ta-calc-plates__sleeve" x="278" y="52" width="10" height="16" rx="3" />
        {pieces.map((piece, index) => (
          <rect
            key={`${piece.side}-${index}-${piece.weight}`}
            className="ta-calc-plates__plate"
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx="3"
            style={{
              '--plate-color': `var(${plateToken(piece.weight)})`,
              '--plate-offset': piece.side === 'left' ? '120px' : '-120px',
              animationDelay: `${piece.delay}ms`,
            } as CSSProperties}
          />
        ))}
        <text className="ta-calc-plates__bar-label" x="200" y="82" textAnchor="middle">
          {formatWeight(barWeight)} кг
        </text>
      </svg>
      {usedPlates.length > 0 && (
        <ul className="ta-calc-plates__legend" aria-label="Цвета блинов">
          {usedPlates.map(({ weight, pairs }) => (
            <li
              key={weight}
              className="ta-calc-plates__legend-item"
              style={{ '--plate-color': `var(${plateToken(weight)})` } as CSSProperties}
            >
              <span className="ta-calc-plates__legend-swatch" aria-hidden="true" />
              <span className="ta-calc-plates__legend-weight">{formatWeight(weight)} кг</span>
              <span className="ta-calc-plates__legend-pairs">{pairs}×2</span>
            </li>
          ))}
        </ul>
      )}
      <figcaption className="ta-calc-plates__formula">{formula}</figcaption>
    </figure>
  )
})
