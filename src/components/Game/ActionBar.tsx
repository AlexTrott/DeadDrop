import type { GameAction } from '../../types/index.ts'
import type { UnitState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { getEffectiveAbilityCost } from '../../engine/CombatSystem.ts'

interface ActionBarProps {
  activeUnit: UnitState
  availableActions: GameAction[]
  onAction: (action: GameAction) => void
  disabled?: boolean
}

export function ActionBar({ activeUnit, availableActions, onAction, disabled }: ActionBarProps) {
  const worker = WORKERS_BY_ID[activeUnit.workerId]
  if (!worker) return null

  const canAttack = availableActions.some((a) => a.type === 'ATTACK')
  const canBasic = availableActions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 0)
  const canUltimate = availableActions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 1)
  const canEndTurn = availableActions.some((a) => a.type === 'END_TURN')

  const basicCost = getEffectiveAbilityCost(activeUnit, worker.abilities[0]!.manaCost)
  const ultCost = getEffectiveAbilityCost(activeUnit, worker.abilities[1]!.manaCost)

  const actions = [
    {
      key: 'attack',
      label: 'Attack',
      sublabel: `${worker.attack} dmg`,
      bg: 'bg-red-800',
      activeBg: 'bg-red-700 hover:bg-red-600',
      action: { type: 'ATTACK' as const },
      available: canAttack,
    },
    {
      key: 'basic',
      label: worker.abilities[0]!.name,
      sublabel: `${basicCost} mana`,
      bg: 'bg-blue-900',
      activeBg: 'bg-blue-700 hover:bg-blue-600',
      action: { type: 'USE_ABILITY' as const, abilityIndex: 0 as const },
      available: canBasic,
    },
    {
      key: 'ultimate',
      label: worker.abilities[1]!.name,
      sublabel: `${ultCost} mana`,
      bg: 'bg-purple-900',
      activeBg: 'bg-purple-700 hover:bg-purple-600',
      action: { type: 'USE_ABILITY' as const, abilityIndex: 1 as const },
      available: canUltimate,
    },
    {
      key: 'end',
      label: 'End Turn',
      sublabel: '',
      bg: 'bg-gray-800',
      activeBg: 'bg-gray-600 hover:bg-gray-500',
      action: { type: 'END_TURN' as const },
      available: canEndTurn,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-950 border-t border-gray-700/80">
      <div className="grid grid-cols-4 max-w-lg mx-auto">
        {actions.map((a) => {
          const isDisabled = disabled || !a.available
          return (
            <button
              key={a.key}
              onClick={() => !isDisabled && onAction(a.action)}
              disabled={isDisabled}
              className={`
                flex flex-col items-center justify-center gap-0.5
                py-2.5 px-1 transition-colors
                ${isDisabled ? `${a.bg} opacity-40` : `${a.activeBg} text-white active:brightness-125`}
                ${isDisabled ? 'cursor-not-allowed' : ''}
              `}
            >
              <span className="text-[11px] sm:text-xs font-bold leading-tight text-center truncate w-full px-0.5">
                {a.label}
              </span>
              {a.sublabel && (
                <span className="text-[9px] sm:text-[10px] text-white/50 leading-tight">
                  {a.sublabel}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
