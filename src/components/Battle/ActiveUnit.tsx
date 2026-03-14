import type { UnitState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { UnitCard } from '../Card/UnitCard.tsx'

interface ActiveUnitProps {
  unit: UnitState
  isPlayer: boolean
  isCurrentTurn: boolean
}

export function ActiveUnit({ unit, isPlayer, isCurrentTurn }: ActiveUnitProps) {
  const worker = WORKERS_BY_ID[unit.workerId]
  if (!worker) return null

  return (
    <div className={`flex flex-col items-center ${isCurrentTurn ? '' : 'opacity-80'}`}>
      {!isPlayer && (
        <div className="text-xs text-gray-500 mb-1">Opponent</div>
      )}
      <div className={isCurrentTurn ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}>
        <UnitCard unit={unit} size="lg" showAbilities={isPlayer} />
      </div>
      {isPlayer && (
        <div className="text-xs text-gray-500 mt-1">Your Active Unit</div>
      )}
    </div>
  )
}
