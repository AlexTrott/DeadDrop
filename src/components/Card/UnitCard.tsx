import type { UnitState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'
import { HPBar } from '../UI/HPBar.tsx'
import { StatusEffectIcon } from '../UI/StatusEffectIcon.tsx'

interface UnitCardProps {
  unit: UnitState
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  showAbilities?: boolean
}

export function UnitCard({ unit, size = 'md', onClick, selected, disabled, showAbilities }: UnitCardProps) {
  const worker = WORKERS_BY_ID[unit.workerId]
  if (!worker) return null

  const borderColor = COMPANY_COLOURS[worker.company] ?? '#666'
  const isKO = unit.isKnockedOut

  const sizeClasses = {
    sm: 'w-24 p-2',
    md: 'w-36 p-3',
    lg: 'w-48 p-4',
  }

  const emojiSize = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  return (
    <div
      onClick={!disabled && !isKO ? onClick : undefined}
      className={`
        ${sizeClasses[size]} rounded-xl transition-all duration-200 relative
        ${isKO ? 'opacity-30 grayscale' : ''}
        ${onClick && !disabled && !isKO ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}
        ${selected ? 'ring-3 ring-yellow-400 scale-105' : ''}
        ${disabled ? 'opacity-50' : ''}
        ${unit.swapSick ? 'animate-pulse' : ''}
      `}
      style={{
        background: selected
          ? 'linear-gradient(135deg, #2a2a1e 0%, #1e2e10 100%)'
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: selected ? '3px solid #facc15' : `2px solid ${borderColor}`,
        boxShadow: selected
          ? '0 0 20px rgba(250, 204, 21, 0.4), 0 4px 12px rgba(0,0,0,0.3)'
          : `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Company badge */}
      <div
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
        style={{ backgroundColor: borderColor }}
      />

      {/* Card Art */}
      <div className={`text-center mb-1 ${size === 'sm' ? 'h-12' : size === 'md' ? 'h-20' : 'h-28'} flex items-center justify-center overflow-hidden rounded-lg`}>
        <img
          src={`/art/workers/${worker.id}.webp`}
          alt={worker.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'block'
          }}
        />
        <span className={`${emojiSize[size]} hidden`}>{worker.emoji}</span>
      </div>

      {/* Name */}
      <div className={`text-center font-semibold truncate ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {worker.name}
      </div>

      {/* Attack stat */}
      <div className={`text-center ${size === 'sm' ? 'text-xs' : 'text-sm'} text-red-400`}>
        ⚔️ {worker.attack}
      </div>

      {/* HP Bar */}
      <div className="mt-1">
        <HPBar current={unit.currentHp} max={unit.maxHp} size={size === 'sm' ? 'sm' : 'md'} />
      </div>

      {/* Status Effects */}
      {unit.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
          {unit.statusEffects.map((effect, i) => (
            <StatusEffectIcon key={i} effect={effect} />
          ))}
        </div>
      )}

      {/* Abilities (shown on large cards) */}
      {showAbilities && size === 'lg' && (
        <div className="mt-2 space-y-1">
          {worker.abilities.map((ability, i) => (
            <div key={i} className="group relative text-xs bg-gray-800/60 rounded px-2 py-1 cursor-help">
              <span className="text-blue-400">{ability.manaCost}💧</span>{' '}
              <span className="font-medium">{ability.name}</span>
              {/* Tooltip */}
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-lg bg-gray-900 border border-gray-600 shadow-xl text-xs leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                <div className="font-bold text-white mb-1">{ability.name}</div>
                <div className="text-blue-400 mb-1">{ability.manaCost} mana {ability.damage ? `• ${ability.damage} damage` : ''}</div>
                <div className="text-gray-300">{ability.description}</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Swap sickness indicator */}
      {unit.swapSick && (
        <div className="absolute top-1 left-1 text-xs bg-yellow-900/80 text-yellow-300 px-1 rounded">
          😵 Sick
        </div>
      )}

      {/* KO overlay */}
      {isKO && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">💀</span>
        </div>
      )}
    </div>
  )
}
