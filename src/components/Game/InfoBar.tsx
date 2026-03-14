import type { PlayerState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'

interface InfoBarProps {
  player: PlayerState
  isPlayer: boolean
  onSwap?: (benchIndex: number) => void
  canSwap?: boolean
}

export function InfoBar({ player, isPlayer, onSwap, canSwap }: InfoBarProps) {
  const benchUnits = player.workers
    .map((unit, index) => ({ unit, index }))
    .filter(({ index }) => index !== player.activeUnitIndex)

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/40">
      {/* Bench units */}
      <div className="flex gap-1.5">
        {benchUnits.map(({ unit, index }) => {
          const worker = WORKERS_BY_ID[unit.workerId]
          if (!worker) return null
          const color = COMPANY_COLOURS[worker.company] ?? '#666'
          const canSwapThis = isPlayer && canSwap && !unit.isKnockedOut
          const hpPct = unit.maxHp > 0 ? (unit.currentHp / unit.maxHp) * 100 : 0

          return (
            <button
              key={index}
              onClick={canSwapThis ? () => onSwap?.(index) : undefined}
              disabled={!canSwapThis}
              className={`
                relative w-10 h-10 rounded-md flex items-center justify-center text-lg
                transition-transform
                ${unit.isKnockedOut ? 'opacity-25' : ''}
                ${canSwapThis ? 'cursor-pointer active:scale-90' : ''}
              `}
              style={{
                background: '#1a1a2e',
                border: `1.5px solid ${unit.isKnockedOut ? '#333' : color}`,
              }}
              title={`${worker.name} ${unit.currentHp}/${unit.maxHp} HP`}
            >
              {unit.isKnockedOut ? '💀' : (
                <>
                  <img
                    src={`/art/workers/${worker.id}.webp`}
                    alt={worker.name}
                    className="w-full h-full object-cover rounded-sm"
                    onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'inline'; }}
                  />
                  <span className="hidden">{worker.emoji}</span>
                </>
              )}
              {/* HP bar at bottom */}
              {!unit.isKnockedOut && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-800 rounded-b-sm overflow-hidden">
                  <div
                    className={`h-full ${hpPct > 60 ? 'bg-green-500' : hpPct > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}
        {isPlayer && canSwap && (
          <span className="text-[9px] text-blue-400 self-center ml-0.5">swap</span>
        )}
      </div>

      <div className="flex-1" />

      {/* Mana dots */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: Math.min(player.maxMana, 10) }, (_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${
              i < player.currentMana
                ? 'bg-blue-500'
                : 'bg-gray-800 border border-gray-700'
            }`}
          />
        ))}
        <span className="text-[10px] text-blue-400 ml-1 font-mono tabular-nums">
          {player.currentMana}/{player.maxMana}
        </span>
      </div>

      {/* Card counts */}
      <div className="text-[10px] text-gray-500 tabular-nums">
        {!isPlayer && <span className="mr-1.5">Hand:{player.hand.length}</span>}
        <span>Deck:{player.deck.length}</span>
      </div>
    </div>
  )
}
