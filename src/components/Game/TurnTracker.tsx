import type { PlayerState, GameAction } from '../../types/index.ts'
import { getActiveUnit, getWorkerData } from '../../engine/GameState.ts'
import { getEffectiveAbilityCost } from '../../engine/CombatSystem.ts'

interface TurnTrackerProps {
  player: PlayerState
  availableActions: GameAction[]
  isPlayerTurn: boolean
}

export function TurnTracker({ player, availableActions, isPlayerTurn }: TurnTrackerProps) {
  if (!isPlayerTurn) return null

  const activeUnit = getActiveUnit(player)
  const workerData = getWorkerData(activeUnit)

  const canAttack = availableActions.some((a) => a.type === 'ATTACK')
  const canBasic = availableActions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 0)
  const canUltimate = availableActions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 1)
  const canSwap = availableActions.some((a) => a.type === 'SWAP_UNIT')
  const playableCards = availableActions.filter((a) => a.type === 'PLAY_CARD').length

  const didAttack = player.hasAttacked
  const didBasic = player.hasUsedBasicAbility
  const didUltimate = player.hasUsedUltimateAbility
  const didSwap = player.hasSwapped

  const basicCost = getEffectiveAbilityCost(activeUnit, workerData.abilities[0]!.manaCost)
  const ultCost = getEffectiveAbilityCost(activeUnit, workerData.abilities[1]!.manaCost)

  const items = [
    {
      label: `Attack (${workerData.attack} dmg)`,
      icon: '⚔️',
      done: didAttack,
      available: canAttack,
      cost: 'Free',
    },
    {
      label: workerData.abilities[0]!.name,
      icon: '✨',
      done: didBasic,
      available: canBasic,
      cost: `${basicCost}💧`,
      tooltip: workerData.abilities[0]!.description,
    },
    {
      label: workerData.abilities[1]!.name,
      icon: '💥',
      done: didUltimate,
      available: canUltimate,
      cost: `${ultCost}💧`,
      tooltip: workerData.abilities[1]!.description,
    },
    {
      label: 'Swap Unit',
      icon: '🔄',
      done: didSwap,
      available: canSwap,
      cost: '1💧',
    },
    {
      label: `Play Cards (${playableCards})`,
      icon: '🃏',
      done: false,
      available: playableCards > 0,
      cost: 'Varies',
    },
  ]

  return (
    <div className="bg-gray-900/70 rounded-lg border border-gray-700/50 px-3 py-2">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Actions this turn</div>
      <div className="flex gap-3 flex-wrap">
        {items.map((item) => (
          <div
            key={item.label}
            className={`group relative flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all ${
              item.done
                ? 'bg-gray-800 text-gray-600 line-through'
                : item.available
                  ? 'bg-gray-800/80 text-white border border-gray-600'
                  : 'bg-gray-800/40 text-gray-600'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            <span className={`text-[10px] ${item.done ? 'text-gray-700' : 'text-blue-400'}`}>{item.cost}</span>
            {item.done && <span className="text-green-500 ml-0.5">✓</span>}

            {/* Tooltip for abilities */}
            {item.tooltip && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-gray-900 border border-gray-600 shadow-xl text-xs leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                <div className="text-gray-300">{item.tooltip}</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
