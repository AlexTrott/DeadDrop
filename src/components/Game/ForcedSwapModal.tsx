import type { PlayerState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'
import { HPBar } from '../UI/HPBar.tsx'

interface ForcedSwapModalProps {
  player: PlayerState
  onSelect: (benchIndex: number) => void
}

export function ForcedSwapModal({ player, onSelect }: ForcedSwapModalProps) {
  const benchUnits = player.workers
    .map((unit, index) => ({ unit, index }))
    .filter(({ unit, index }) => index !== player.activeUnitIndex && !unit.isKnockedOut)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-6 w-full max-w-sm">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-1 text-yellow-400">
          Unit Knocked Out!
        </h2>
        <p className="text-gray-400 text-center text-xs sm:text-sm mb-4">
          Choose a replacement:
        </p>
        <div className="flex flex-col gap-3">
          {benchUnits.map(({ unit, index }) => {
            const worker = WORKERS_BY_ID[unit.workerId]
            if (!worker) return null
            const color = COMPANY_COLOURS[worker.company] ?? '#666'

            return (
              <button
                key={index}
                onClick={() => onSelect(index)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all active:scale-98 hover:brightness-110"
                style={{
                  borderColor: color,
                  background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-lg flex-shrink-0">
                  <img
                    src={`/art/workers/${worker.id}.webp`}
                    alt={worker.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'block'; }}
                  />
                  <span className="text-3xl hidden">{worker.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{worker.name}</div>
                  <HPBar current={unit.currentHp} max={unit.maxHp} size="sm" />
                </div>
                <span className="text-xs text-red-400">⚔️{worker.attack}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
