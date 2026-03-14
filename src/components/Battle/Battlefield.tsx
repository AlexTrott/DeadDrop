import type { UnitState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { StatusEffectIcon } from '../UI/StatusEffectIcon.tsx'

const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

interface FighterPanelProps {
  unit: UnitState
  isPlayer: boolean
  isActive: boolean
  layout?: 'auto'
}

function FighterPanel({ unit, isPlayer, isActive }: FighterPanelProps) {
  const worker = WORKERS_BY_ID[unit.workerId]
  if (!worker) return null

  const color = COMPANY_ACCENT[worker.company] ?? '#666'
  const hpPct = unit.maxHp > 0 ? Math.round((unit.currentHp / unit.maxHp) * 100) : 0
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 30 ? '#eab308' : '#ef4444'

  return (
    <div
      className={`relative h-full min-h-[160px] overflow-hidden ${unit.isKnockedOut ? 'grayscale opacity-40' : ''}`}
    >
      {/* Full artwork background */}
      <img
        src={`/art/workers/${worker.id}.webp`}
        alt={worker.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center center' }}
        onError={(e) => { e.currentTarget.style.display = 'none'; const f = e.currentTarget.nextElementSibling as HTMLElement; if (f) f.style.display = 'flex'; }}
      />
      <div className="hidden absolute inset-0 items-center justify-center bg-gray-900 text-6xl">
        {worker.emoji}
      </div>

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0a0e14 0%, #0a0e14cc 30%, transparent 100%)' }}
      />

      {/* Top gradient for opponent on mobile (blends into center strip) */}
      {!isPlayer && (
        <div
          className="absolute top-0 left-0 right-0 h-1/4 pointer-events-none lg:hidden"
          style={{ background: 'linear-gradient(to bottom, #0a0e14 0%, transparent 100%)' }}
        />
      )}

      {/* Side gradient on desktop: opponent fades right, player fades left (into center column) */}
      {!isPlayer && (
        <div
          className="absolute top-0 right-0 bottom-0 w-1/4 pointer-events-none hidden lg:block"
          style={{ background: 'linear-gradient(to left, #0a0e14 0%, transparent 100%)' }}
        />
      )}
      {isPlayer && (
        <div
          className="absolute top-0 left-0 bottom-0 w-1/4 pointer-events-none hidden lg:block"
          style={{ background: 'linear-gradient(to right, #0a0e14 0%, transparent 100%)' }}
        />
      )}

      {/* Active turn glow */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: isPlayer
              ? `inset 0 -3px 0 ${color}, inset 0 0 30px ${color}15`
              : `inset 0 3px 0 ${color}, inset 0 0 30px ${color}15`,
          }}
        />
      )}

      {/* Tier stars */}
      <div className="absolute top-3 left-3 lg:top-4 lg:left-4 flex gap-0.5 z-10">
        {Array.from({ length: worker.tier }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-sm lg:text-base" style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.7))' }}>★</span>
        ))}
      </div>

      {/* Swap sickness */}
      {unit.swapSick && (
        <div className="absolute top-3 right-3 text-[10px] bg-yellow-900/90 text-yellow-300 px-2 py-0.5 rounded-full font-bold z-10">
          SWAP SICK
        </div>
      )}

      {/* KO overlay */}
      {unit.isKnockedOut && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span className="text-5xl">💀</span>
        </div>
      )}

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-3 lg:px-5 lg:pb-4">
        {/* Name row */}
        <div className="flex items-end justify-between gap-2 mb-1.5">
          <h2
            className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide text-white"
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            {worker.name}
          </h2>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
              <span className="text-orange-400 text-xs">⚔</span>
              <span className="text-white text-sm font-bold">{worker.attack}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
              <span className="text-xs" style={{ color: hpColor }}>♥</span>
              <span className="text-white text-sm font-bold">{unit.currentHp}<span className="text-gray-400 text-xs">/{unit.maxHp}</span></span>
            </div>
          </div>
        </div>

        {/* HP bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${hpPct}%`, background: hpColor, boxShadow: `0 0 8px ${hpColor}60` }}
          />
        </div>

        {/* Flavour text — desktop only */}
        <p className="hidden lg:block text-[11px] text-gray-400 italic mb-2 leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          "{worker.flavourText}"
        </p>

        {/* Status effects */}
        {unit.statusEffects.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {unit.statusEffects.map((effect, i) => (
              <StatusEffectIcon key={i} effect={effect} />
            ))}
          </div>
        )}

        {/* Abilities — shown for both player and opponent on desktop, player only on mobile */}
        {!unit.isKnockedOut && (
          <div className={`flex gap-2 ${!isPlayer ? 'hidden lg:flex' : ''}`}>
            {worker.abilities.map((ability, i) => (
              <div
                key={i}
                className="group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 backdrop-blur-sm cursor-help"
                style={{
                  background: i === 0 ? 'rgba(37,99,235,0.2)' : 'rgba(124,58,237,0.2)',
                  border: `1px solid ${i === 0 ? 'rgba(37,99,235,0.3)' : 'rgba(124,58,237,0.3)'}`,
                }}
              >
                <span
                  className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  }}
                >
                  {ability.manaCost}
                </span>
                <span className="text-xs sm:text-sm text-white font-semibold">{ability.name}</span>
                {/* Show damage/description on desktop */}
                <span className="text-[10px] text-gray-400 hidden lg:inline">
                  {ability.damage ? `${ability.damage} dmg` : ability.description.split('.')[0]}
                </span>
                {/* Tooltip */}
                <div className="absolute z-50 bottom-full left-0 mb-2 w-56 p-3 rounded-xl bg-[#12161e] border border-gray-700/50 shadow-2xl text-xs leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  <div className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>{ability.name}</div>
                  <div className="text-blue-400 text-[11px] mt-0.5">{ability.manaCost} mana{ability.damage ? ` · ${ability.damage} dmg` : ''}</div>
                  <div className="text-gray-400 mt-1.5 leading-relaxed">{ability.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { FighterPanel }
