import type { GameAction } from '../../types/index.ts'
import type { UnitState } from '../../types/index.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { getEffectiveAbilityCost } from '../../engine/CombatSystem.ts'
import { RETREAT_COST_TIER_1, RETREAT_COST_TIER_2 } from '../../engine/constants.ts'
import { getWorkerData } from '../../engine/GameState.ts'

interface ActionBarProps {
  activeUnit: UnitState
  availableActions: GameAction[]
  onAction: (action: GameAction) => void
  disabled?: boolean
}

const ACTION_STYLES = {
  attack: {
    bg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    disabledBg: 'rgba(127,29,29,0.3)',
    glow: 'rgba(220,38,38,0.3)',
  },
  basic: {
    bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    disabledBg: 'rgba(30,64,175,0.3)',
    glow: 'rgba(37,99,235,0.3)',
  },
  ultimate: {
    bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    disabledBg: 'rgba(91,33,182,0.3)',
    glow: 'rgba(124,58,237,0.3)',
  },
  retreat: {
    bg: 'linear-gradient(135deg, #b45309, #92400e)',
    disabledBg: 'rgba(146,64,14,0.3)',
    glow: 'rgba(180,83,9,0.3)',
  },
  end: {
    bg: 'linear-gradient(135deg, #374151, #1f2937)',
    disabledBg: 'rgba(31,41,55,0.3)',
    glow: 'none',
  },
}

export function ActionBar({ activeUnit, availableActions, onAction, disabled }: ActionBarProps) {
  const worker = WORKERS_BY_ID[activeUnit.workerId]
  if (!worker) return null

  const canAttack = availableActions.some((a) => a.type === 'ATTACK')
  const canBasic = availableActions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 0)
  const canUltimate = availableActions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 1)
  const canRetreat = availableActions.some((a) => a.type === 'RETREAT')
  const canEndTurn = availableActions.some((a) => a.type === 'END_TURN')

  const basicCost = getEffectiveAbilityCost(activeUnit, worker.abilities[0]!.manaCost)
  const ultCost = getEffectiveAbilityCost(activeUnit, worker.abilities[1]!.manaCost)
  const workerData = getWorkerData(activeUnit)
  const retreatCost = workerData.tier === 1 ? RETREAT_COST_TIER_1 : RETREAT_COST_TIER_2

  const actions = [
    {
      key: 'attack' as const,
      label: 'Attack',
      sublabel: `${worker.attack} dmg`,
      action: { type: 'ATTACK' as const },
      available: canAttack,
    },
    {
      key: 'basic' as const,
      label: worker.abilities[0]!.name,
      sublabel: `${basicCost} mana`,
      action: { type: 'USE_ABILITY' as const, abilityIndex: 0 as const },
      available: canBasic,
    },
    {
      key: 'ultimate' as const,
      label: worker.abilities[1]!.name,
      sublabel: `${ultCost} mana`,
      action: { type: 'USE_ABILITY' as const, abilityIndex: 1 as const },
      available: canUltimate,
    },
    {
      key: 'retreat' as const,
      label: 'Retreat',
      sublabel: `${retreatCost} mana`,
      action: { type: 'RETREAT' as const },
      available: canRetreat,
    },
    {
      key: 'end' as const,
      label: 'End Turn',
      sublabel: '',
      action: { type: 'END_TURN' as const },
      available: canEndTurn,
    },
  ]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{
        background: 'rgba(10,14,20,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="grid grid-cols-5 gap-1.5 max-w-lg mx-auto p-1.5 sm:p-2">
        {actions.map((a) => {
          const isDisabled = disabled || !a.available
          const style = ACTION_STYLES[a.key]
          return (
            <button
              key={a.key}
              onClick={() => !isDisabled && onAction(a.action)}
              disabled={isDisabled}
              className={`
                flex flex-col items-center justify-center gap-0.5
                py-2 sm:py-2.5 px-1 rounded-lg transition-all
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'active:scale-95 hover:brightness-110'}
              `}
              style={{
                background: isDisabled ? style.disabledBg : style.bg,
                boxShadow: !isDisabled && style.glow !== 'none' ? `0 0 12px ${style.glow}` : 'none',
              }}
            >
              <span className="text-[11px] sm:text-xs font-bold leading-tight text-center truncate w-full px-0.5 text-white"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {a.label}
              </span>
              {a.sublabel && (
                <span className="text-[9px] sm:text-[10px] text-white/40 leading-tight">
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
