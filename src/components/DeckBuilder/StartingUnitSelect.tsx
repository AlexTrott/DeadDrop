import { useGameStore } from '../../store/gameStore.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { UnitCard } from '../Card/UnitCard.tsx'
import { createUnitState } from '../../engine/GameState.ts'

export function StartingUnitSelect() {
  const playerWorkerIds = useGameStore((s) => s.playerWorkerIds)
  const playerStartingUnit = useGameStore((s) => s.playerStartingUnit)
  const setPlayerStartingUnit = useGameStore((s) => s.setPlayerStartingUnit)
  const startGame = useGameStore((s) => s.startGame)
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center">Choose Your Lead</h1>
      <p className="text-gray-400 text-center text-xs sm:text-sm">
        Which worker starts in the active slot?
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-none sm:w-auto">
        {playerWorkerIds.map((id, index) => {
          const worker = WORKERS_BY_ID[id]!
          const unit = createUnitState(worker)

          return (
            <UnitCard
              key={id}
              unit={unit}
              size="md"
              selected={playerStartingUnit === index}
              onClick={() => setPlayerStartingUnit(index)}
              showAbilities
            />
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setScreen('deck-build')}
          className="px-4 py-2.5 min-h-[44px] bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 text-sm"
        >
          ← Back
        </button>
        <button
          onClick={startGame}
          className="px-8 py-3 min-h-[48px] bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-lg font-bold rounded-xl shadow-2xl transition-all active:scale-95"
        >
          BATTLE!
        </button>
      </div>
    </div>
  )
}
