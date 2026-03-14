import type { PlayerState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'

const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

interface CenterStripProps {
  opponent: PlayerState
  player: PlayerState
  turnNumber: number
  isPlayerTurn: boolean
  isAIThinking: boolean
  onSwap?: (benchIndex: number) => void
  canSwap?: boolean
}

function BenchCircle({ unit, index, color, canSwap, onSwap }: {
  unit: PlayerState['workers'][number]
  index: number
  color: string
  canSwap: boolean
  onSwap?: (index: number) => void
}) {
  const worker = WORKERS_BY_ID[unit.workerId]
  if (!worker) return null

  const hpPct = unit.maxHp > 0 ? (unit.currentHp / unit.maxHp) * 100 : 0
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 30 ? '#eab308' : '#ef4444'

  return (
    <button
      onClick={canSwap ? () => onSwap?.(index) : undefined}
      disabled={!canSwap}
      className={`
        relative flex-shrink-0 transition-all
        ${unit.isKnockedOut ? 'opacity-30' : ''}
        ${canSwap ? 'cursor-pointer active:scale-90 hover:scale-105' : ''}
      `}
      title={`${worker.name} ${unit.currentHp}/${unit.maxHp} HP`}
    >
      {/* HP ring using conic gradient */}
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[3px]"
        style={{
          background: unit.isKnockedOut
            ? '#333'
            : `conic-gradient(${hpColor} ${hpPct * 3.6}deg, rgba(255,255,255,0.1) ${hpPct * 3.6}deg)`,
          boxShadow: canSwap ? `0 0 12px ${color}30` : 'none',
        }}
      >
        {/* Inner circle with art */}
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
          {unit.isKnockedOut ? (
            <div className="w-full h-full flex items-center justify-center text-xl">💀</div>
          ) : (
            <>
              <img
                src={`/art/workers/${worker.id}.webp`}
                alt={worker.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'flex'; }}
              />
              <div className="hidden items-center justify-center w-full h-full bg-gray-900 text-lg">
                {worker.emoji}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Name label */}
      <div className="text-[8px] sm:text-[9px] text-center text-gray-500 mt-0.5 truncate w-14 sm:w-16" style={{ fontFamily: 'var(--font-display)' }}>
        {worker.name.split(' ').pop()}
      </div>
    </button>
  )
}

export function CenterStrip({ opponent, player, turnNumber, isPlayerTurn, isAIThinking, onSwap, canSwap }: CenterStripProps) {
  const opponentBench = opponent.workers
    .map((unit, index) => ({ unit, index }))
    .filter(({ index }) => index !== opponent.activeUnitIndex)

  const playerBench = player.workers
    .map((unit, index) => ({ unit, index }))
    .filter(({ index }) => index !== player.activeUnitIndex)

  const playerActiveWorker = WORKERS_BY_ID[player.workers[player.activeUnitIndex]!.workerId]
  const playerColor = playerActiveWorker ? COMPANY_ACCENT[playerActiveWorker.company] ?? '#666' : '#666'

  return (
    <div
      className="relative z-10 flex-shrink-0 px-3 sm:px-4 py-2"
      style={{
        background: '#0a0e14',
      }}
    >
      {/* Main row: bench + turn + bench */}
      <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
        {/* Opponent bench */}
        <div className="flex gap-2">
          {opponentBench.map(({ unit, index }) => {
            const w = WORKERS_BY_ID[unit.workerId]
            const c = w ? COMPANY_ACCENT[w.company] ?? '#666' : '#666'
            return (
              <BenchCircle key={index} unit={unit} index={index} color={c} canSwap={false} />
            )
          })}
        </div>

        {/* Turn indicator + mana */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs">⚔</span>
            <span className="text-xs font-bold text-gray-500" style={{ fontFamily: 'var(--font-display)' }}>T{turnNumber}</span>
            <span
              className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: isPlayerTurn ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: isPlayerTurn ? '#4ade80' : '#f87171',
                border: `1px solid ${isPlayerTurn ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}
            >
              {isAIThinking ? '🤖 AI' : isPlayerTurn ? 'Your turn' : 'Opponent'}
            </span>
          </div>

          {/* Mana dots */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(player.maxMana, 10) }, (_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  background: i < player.currentMana
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: i < player.currentMana ? '0 0 3px rgba(59,130,246,0.4)' : 'none',
                }}
              />
            ))}
            <span className="text-[9px] text-blue-400/60 ml-1 font-mono tabular-nums font-bold">
              {player.currentMana}/{player.maxMana}
            </span>
          </div>
        </div>

        {/* Player bench */}
        <div className="flex gap-2">
          {playerBench.map(({ unit, index }) => {
            const canSwapThis = canSwap && !unit.isKnockedOut
            return (
              <BenchCircle
                key={index}
                unit={unit}
                index={index}
                color={playerColor}
                canSwap={!!canSwapThis}
                onSwap={onSwap}
              />
            )
          })}
        </div>
      </div>

      {/* Deck counts */}
      <div className="flex justify-between max-w-2xl mx-auto mt-1">
        <span className="text-[9px] text-gray-600 tabular-nums">Hand:{opponent.hand.length} Deck:{opponent.deck.length}</span>
        <span className="text-[9px] text-gray-600 tabular-nums">Deck:{player.deck.length}</span>
      </div>
    </div>
  )
}

// Keep the old export name for backwards compat during transition
export { CenterStrip as InfoBar }
