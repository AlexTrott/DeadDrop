import type { UnitState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'
import { HPBar } from '../UI/HPBar.tsx'
import { StatusEffectIcon } from '../UI/StatusEffectIcon.tsx'

interface FighterRowProps {
  unit: UnitState
  isPlayer: boolean
  isActive: boolean
}

function FighterRow({ unit, isPlayer, isActive }: FighterRowProps) {
  const worker = WORKERS_BY_ID[unit.workerId]
  if (!worker) return null

  const borderColor = COMPANY_COLOURS[worker.company] ?? '#666'

  return (
    <div
      className={`
        flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl transition-all duration-300
        ${isActive ? 'bg-gray-800/60' : 'bg-gray-900/30 opacity-70'}
        ${unit.isKnockedOut ? 'opacity-30 grayscale' : ''}
      `}
    >
      {/* Card avatar */}
      <div
        className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: `2px solid ${borderColor}`,
          boxShadow: isActive ? `0 0 10px ${borderColor}30` : 'none',
        }}
      >
        <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
          <img
            src={`/art/workers/${worker.id}.webp`}
            alt={worker.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'block'; }}
          />
          <span className="text-3xl sm:text-4xl hidden">{worker.emoji}</span>
        </div>
        {unit.swapSick && (
          <div className="absolute -top-1 -left-1 text-[8px] bg-yellow-900 text-yellow-300 px-0.5 rounded">sick</div>
        )}
        {unit.isKnockedOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <span className="text-lg">💀</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold truncate">{worker.name}</span>
          <span className="text-xs text-red-400 flex-shrink-0">⚔️{worker.attack}</span>
        </div>

        <HPBar current={unit.currentHp} max={unit.maxHp} size="sm" />

        {/* Status effects */}
        {unit.statusEffects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {unit.statusEffects.map((effect, i) => (
              <StatusEffectIcon key={i} effect={effect} />
            ))}
          </div>
        )}

        {/* Abilities (player only) */}
        {isPlayer && !unit.isKnockedOut && (
          <div className="flex gap-1.5 mt-0.5">
            {worker.abilities.map((ability, i) => (
              <div
                key={i}
                className="group relative text-[10px] sm:text-xs bg-gray-700/60 rounded px-1.5 py-0.5 cursor-help"
              >
                <span className="text-blue-400">{ability.manaCost}💧</span>{' '}
                <span className="opacity-80">{ability.name}</span>
                {/* Tooltip */}
                <div className="absolute z-50 bottom-full left-0 mb-1.5 w-44 sm:w-52 p-2 rounded-lg bg-gray-900 border border-gray-600 shadow-xl text-xs leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  <div className="font-bold text-white">{ability.name}</div>
                  <div className="text-blue-400">{ability.manaCost} mana{ability.damage ? ` · ${ability.damage} dmg` : ''}</div>
                  <div className="text-gray-300 mt-0.5">{ability.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface BattlefieldProps {
  playerUnit: UnitState
  opponentUnit: UnitState
  turnNumber: number
  isPlayerTurn: boolean
  isAIThinking: boolean
}

export function Battlefield({ playerUnit, opponentUnit, turnNumber, isPlayerTurn, isAIThinking }: BattlefieldProps) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 px-2 sm:px-4">
      {/* Opponent fighter */}
      <FighterRow unit={opponentUnit} isPlayer={false} isActive={!isPlayerTurn} />

      {/* Divider */}
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1 h-px bg-gray-700" />
        <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 flex-shrink-0">
          <span>⚔️</span>
          <span className="font-mono">T{turnNumber}</span>
          <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${
            isPlayerTurn
              ? 'bg-green-900/60 text-green-400 border border-green-800'
              : 'bg-red-900/60 text-red-400 border border-red-800'
          }`}>
            {isAIThinking ? '🤖 AI' : isPlayerTurn ? 'Your turn' : 'Opponent'}
          </span>
        </div>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      {/* Player fighter */}
      <FighterRow unit={playerUnit} isPlayer={true} isActive={isPlayerTurn} />
    </div>
  )
}
