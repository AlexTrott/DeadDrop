import type { PlayerState } from '../../types/index.ts'
import { UnitCard } from '../Card/UnitCard.tsx'

interface BenchProps {
  player: PlayerState
  onSwap?: (benchIndex: number) => void
  canSwap?: boolean
}

export function Bench({ player, onSwap, canSwap }: BenchProps) {
  const benchUnits = player.workers
    .map((unit, index) => ({ unit, index }))
    .filter(({ index }) => index !== player.activeUnitIndex)

  return (
    <div className="flex gap-2 items-center">
      {benchUnits.map(({ unit, index }) => (
        <UnitCard
          key={index}
          unit={unit}
          size="sm"
          onClick={canSwap && !unit.isKnockedOut ? () => onSwap?.(index) : undefined}
          disabled={!canSwap || unit.isKnockedOut}
        />
      ))}
    </div>
  )
}
