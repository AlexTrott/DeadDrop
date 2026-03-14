import type { PlayerState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'

const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

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
    <div
      className="flex items-center gap-2.5 px-3 sm:px-4 py-2"
      style={{
        background: 'rgba(12,16,22,0.6)',
        borderBottom: isPlayer ? 'none' : '1px solid rgba(255,255,255,0.04)',
        borderTop: isPlayer ? '1px solid rgba(255,255,255,0.04)' : 'none',
      }}
    >
      {/* Bench units - mini cards with art + name */}
      <div className="flex gap-2 items-center">
        {benchUnits.map(({ unit, index }) => {
          const worker = WORKERS_BY_ID[unit.workerId]
          if (!worker) return null
          const color = COMPANY_ACCENT[worker.company] ?? '#666'
          const canSwapThis = isPlayer && canSwap && !unit.isKnockedOut
          const hpPct = unit.maxHp > 0 ? (unit.currentHp / unit.maxHp) * 100 : 0

          return (
            <button
              key={index}
              onClick={canSwapThis ? () => onSwap?.(index) : undefined}
              disabled={!canSwapThis}
              className={`
                relative flex items-center gap-2 rounded-lg overflow-hidden transition-all pr-2
                ${unit.isKnockedOut ? 'opacity-25' : ''}
                ${canSwapThis ? 'cursor-pointer active:scale-95 hover:brightness-110' : ''}
              `}
              style={{
                background: '#12161e',
                border: `1.5px solid ${unit.isKnockedOut ? '#333' : `${color}40`}`,
                boxShadow: canSwapThis ? `0 0 8px ${color}15` : 'none',
              }}
              title={`${worker.name} ${unit.currentHp}/${unit.maxHp} HP`}
            >
              {/* Mini portrait */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 overflow-hidden">
                {unit.isKnockedOut ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-lg">💀</div>
                ) : (
                  <>
                    <img
                      src={`/art/workers/${worker.id}.webp`}
                      alt={worker.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'flex'; }}
                    />
                    <div className="hidden items-center justify-center w-full h-full bg-gray-900 text-lg">
                      {worker.emoji}
                    </div>
                  </>
                )}
              </div>

              {/* Name + HP */}
              <div className="min-w-0 py-1 hidden sm:block">
                <div className="text-[10px] font-bold text-gray-300 truncate max-w-[70px]" style={{ fontFamily: 'var(--font-display)' }}>
                  {worker.name.split(' ').pop()}
                </div>
                <div className="text-[9px] text-gray-500 tabular-nums">{unit.currentHp}/{unit.maxHp}</div>
              </div>

              {/* HP bar at bottom */}
              {!unit.isKnockedOut && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/60">
                  <div
                    className={`h-full transition-all ${hpPct > 60 ? 'bg-green-500' : hpPct > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
              )}
            </button>
          )
        })}
        {isPlayer && canSwap && (
          <span className="text-[9px] text-blue-400/70 font-medium tracking-wide uppercase">swap</span>
        )}
      </div>

      <div className="flex-1" />

      {/* Mana dots */}
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">
          {Array.from({ length: Math.min(player.maxMana, 10) }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-colors duration-300"
              style={{
                background: i < player.currentMana
                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  : 'rgba(255,255,255,0.06)',
                boxShadow: i < player.currentMana ? '0 0 4px rgba(59,130,246,0.4)' : 'none',
              }}
            />
          ))}
        </div>
        <span className="text-[10px] text-blue-400/70 ml-1 font-mono tabular-nums font-bold">
          {player.currentMana}/{player.maxMana}
        </span>
      </div>

      {/* Card counts */}
      <div className="text-[10px] text-gray-600 tabular-nums font-medium">
        {!isPlayer && <span className="mr-1.5">Hand:{player.hand.length}</span>}
        <span>Deck:{player.deck.length}</span>
      </div>
    </div>
  )
}
