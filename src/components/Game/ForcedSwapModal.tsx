import type { PlayerState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { HPBar } from '../UI/HPBar.tsx'

const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

interface ForcedSwapModalProps {
  player: PlayerState
  onSelect: (benchIndex: number) => void
}

export function ForcedSwapModal({ player, onSelect }: ForcedSwapModalProps) {
  const benchUnits = player.workers
    .map((unit, index) => ({ unit, index }))
    .filter(({ unit, index }) => index !== player.activeUnitIndex && !unit.isKnockedOut)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-sm rounded-2xl p-5 sm:p-6"
        style={{
          background: '#12161e',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(250,204,21,0.1)',
        }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-1" style={{ fontFamily: 'var(--font-display)', color: '#facc15' }}>
          Unit Knocked Out!
        </h2>
        <p className="text-gray-500 text-center text-xs sm:text-sm mb-5">
          Choose a replacement:
        </p>
        <div className="flex flex-col gap-3">
          {benchUnits.map(({ unit, index }) => {
            const worker = WORKERS_BY_ID[unit.workerId]
            if (!worker) return null
            const color = COMPANY_ACCENT[worker.company] ?? '#666'

            return (
              <button
                key={index}
                onClick={() => onSelect(index)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                  border: `1.5px solid ${color}40`,
                  boxShadow: `0 0 12px ${color}10`,
                }}
              >
                <div
                  className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden"
                  style={{ border: `1.5px solid ${color}50` }}
                >
                  <img
                    src={`/art/workers/${worker.id}.webp`}
                    alt={worker.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'flex'; }}
                  />
                  <div className="hidden items-center justify-center w-full h-full bg-gray-900 text-2xl">
                    {worker.emoji}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>{worker.name}</div>
                  <HPBar current={unit.currentHp} max={unit.maxHp} size="sm" />
                </div>
                <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-0.5 flex-shrink-0">
                  <span className="text-orange-400 text-[10px]">⚔</span>
                  <span className="text-xs font-bold text-orange-300">{worker.attack}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
