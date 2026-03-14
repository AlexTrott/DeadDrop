import type { UnitState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'
import { HPBar } from '../UI/HPBar.tsx'
import { StatusEffectIcon } from '../UI/StatusEffectIcon.tsx'

const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

interface FighterRowProps {
  unit: UnitState
  isPlayer: boolean
  isActive: boolean
}

function FighterRow({ unit, isPlayer, isActive }: FighterRowProps) {
  const worker = WORKERS_BY_ID[unit.workerId]
  if (!worker) return null

  const color = COMPANY_ACCENT[worker.company] ?? '#666'

  return (
    <div
      className={`
        flex items-stretch gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl transition-all duration-300
        ${unit.isKnockedOut ? 'opacity-30 grayscale' : ''}
      `}
      style={{
        background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: isActive ? `1px solid rgba(255,255,255,0.06)` : '1px solid transparent',
      }}
    >
      {/* Card art - larger portrait */}
      <div
        className="flex-shrink-0 w-24 h-28 sm:w-32 sm:h-36 rounded-xl overflow-hidden relative"
        style={{
          border: `2px solid ${isActive ? color : `${color}40`}`,
          boxShadow: isActive ? `0 0 20px ${color}25` : 'none',
        }}
      >
        <img
          src={`/art/workers/${worker.id}.webp`}
          alt={worker.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'flex'; }}
        />
        <div className="hidden items-center justify-center w-full h-full bg-gray-900 text-4xl">
          {worker.emoji}
        </div>

        {/* Tier stars */}
        <div className="absolute top-1.5 left-1.5 flex gap-0.5">
          {Array.from({ length: worker.tier }).map((_, i) => (
            <span key={i} className="text-yellow-400 text-[10px]" style={{ filter: 'drop-shadow(0 0 2px rgba(250,204,21,0.6))' }}>★</span>
          ))}
        </div>

        {unit.swapSick && (
          <div className="absolute top-1 right-1 text-[7px] bg-yellow-900/90 text-yellow-300 px-1 rounded font-bold">SICK</div>
        )}
        {unit.isKnockedOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-2xl">💀</span>
          </div>
        )}

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent" />

        {/* ATK badge on art */}
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
          <span className="text-orange-400 text-[9px]">⚔</span>
          <span className="text-white text-[10px] font-bold">{worker.attack}</span>
        </div>

        {/* HP badge on art */}
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
          <span className="text-red-400 text-[9px]">♥</span>
          <span className="text-white text-[10px] font-bold">{unit.currentHp}</span>
        </div>
      </div>

      {/* Info panel */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
        <div>
          <span className="text-sm sm:text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: isActive ? '#e8e6e3' : '#888' }}>
            {worker.name}
          </span>
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
          <div className="flex flex-col sm:flex-row gap-1.5 mt-0.5">
            {worker.abilities.map((ability, i) => (
              <div
                key={i}
                className="group relative flex items-center gap-1.5 rounded-lg px-2 py-1 cursor-help"
                style={{ background: i === 0 ? 'rgba(37,99,235,0.12)' : 'rgba(124,58,237,0.12)' }}
              >
                <span
                  className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  }}
                >
                  {ability.manaCost}
                </span>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm text-gray-200 font-semibold">{ability.name}</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-500 ml-1.5 hidden sm:inline">{ability.damage ? `${ability.damage} dmg` : ability.description.split('.')[0]}</span>
                </div>
                {/* Tooltip */}
                <div className="absolute z-50 bottom-full left-0 mb-2 w-52 p-2.5 rounded-xl bg-[#12161e] border border-gray-700/50 shadow-2xl text-xs leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  <div className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{ability.name}</div>
                  <div className="text-blue-400 text-[10px] mt-0.5">{ability.manaCost} mana{ability.damage ? ` · ${ability.damage} dmg` : ''}</div>
                  <div className="text-gray-400 mt-1">{ability.description}</div>
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
    <div className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-6">
      {/* Opponent fighter */}
      <FighterRow unit={opponentUnit} isPlayer={false} isActive={!isPlayerTurn} />

      {/* Divider */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-600 text-xs">⚔</span>
          <span className="text-xs font-bold text-gray-500" style={{ fontFamily: 'var(--font-display)' }}>T{turnNumber}</span>
          <span
            className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isPlayerTurn ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: isPlayerTurn ? '#4ade80' : '#f87171',
              border: `1px solid ${isPlayerTurn ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {isAIThinking ? '🤖 Thinking...' : isPlayerTurn ? 'Your turn' : 'Opponent'}
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      </div>

      {/* Player fighter */}
      <FighterRow unit={playerUnit} isPlayer={true} isActive={isPlayerTurn} />
    </div>
  )
}
