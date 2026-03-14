import type { PlayerState, UnitState, StatusEffect, StatusEffectType } from '../types/index.ts'
import type { GameState, PlayerId } from '../types/index.ts'
import {
  getActiveUnit,
  getWorkerData,
  getOpponentId,
} from './GameState.ts'

/** Apply damage to a unit, respecting Shield. Returns actual damage dealt to HP. */
export function applyDamageToUnit(unit: UnitState, damage: number): number {
  let remaining = damage

  // Check for shield
  const shieldIndex = unit.statusEffects.findIndex((e) => e.type === 'SHIELD')
  if (shieldIndex !== -1) {
    const shield = unit.statusEffects[shieldIndex]!
    if (shield.potency >= remaining) {
      shield.potency -= remaining
      if (shield.potency === 0) {
        unit.statusEffects.splice(shieldIndex, 1)
      }
      return 0
    } else {
      remaining -= shield.potency
      unit.statusEffects.splice(shieldIndex, 1)
    }
  }

  unit.currentHp -= remaining
  if (unit.currentHp < 0) unit.currentHp = 0
  return remaining
}

export interface AbilityResult {
  messages: string[]
}

/** Calculate damage including Boost modifier */
export function calculateDamage(unit: UnitState, baseDamage: number): number {
  let damage = baseDamage
  const boost = unit.statusEffects.find((e) => e.type === 'BOOST')
  if (boost && !isOnBench(unit)) {
    // Boost only applies when active — but we only call this for active units anyway
    damage += boost.potency
  }
  return damage
}

/** Check if a unit is "on the bench" — helper used internally */
function isOnBench(_unit: UnitState): boolean {
  // This is called for active units during damage calculation,
  // so it always returns false in current usage.
  // For proper bench checking, use the player's activeUnitIndex.
  return false
}

/** Get the effective mana cost of an ability (base + Slow modifier) */
export function getEffectiveAbilityCost(unit: UnitState, baseCost: number): number {
  const slow = unit.statusEffects.find((e) => e.type === 'SLOW')
  return slow ? baseCost + 1 : baseCost
}

/** Apply a status effect to a unit (refreshes if same type already exists) */
export function applyStatusEffect(unit: UnitState, effect: { type: StatusEffectType; potency: number; duration: number | null }): void {
  const existing = unit.statusEffects.findIndex((e) => e.type === effect.type)
  const newEffect: StatusEffect = {
    type: effect.type,
    potency: effect.potency,
    duration: effect.duration,
  }
  if (existing !== -1) {
    // Refresh — replace existing
    unit.statusEffects[existing] = newEffect
  } else {
    unit.statusEffects.push(newEffect)
  }
}

/** Process poison ticks on ALL of a player's units. Returns log messages. */
export function processPoisonTicks(player: PlayerState): string[] {
  const messages: string[] = []
  for (const unit of player.workers) {
    if (unit.isKnockedOut) continue
    const poison = unit.statusEffects.find((e) => e.type === 'POISON')
    if (poison) {
      const workerData = getWorkerData(unit)
      // Shield absorbs poison damage
      const shieldIdx = unit.statusEffects.findIndex((e) => e.type === 'SHIELD')
      if (shieldIdx !== -1) {
        const shield = unit.statusEffects[shieldIdx]!
        if (shield.potency >= poison.potency) {
          shield.potency -= poison.potency
          if (shield.potency === 0) {
            unit.statusEffects.splice(shieldIdx, 1)
          }
          messages.push(`${workerData.name}'s shield absorbs ${poison.potency} poison damage.`)
          continue
        } else {
          const absorbed = shield.potency
          const remaining = poison.potency - absorbed
          unit.statusEffects.splice(shieldIdx, 1)
          unit.currentHp -= remaining
          messages.push(`${workerData.name} takes ${poison.potency} poison damage (${absorbed} absorbed by shield).`)
          continue
        }
      }
      unit.currentHp -= poison.potency
      messages.push(`${workerData.name} takes ${poison.potency} poison damage!`)
    }
  }
  return messages
}

/** Decrement timed status effects at end of turn. Remove expired ones. */
export function decrementStatusEffects(player: PlayerState): void {
  for (const unit of player.workers) {
    unit.statusEffects = unit.statusEffects.filter((effect) => {
      if (effect.duration === null) return true // Infinite duration (Poison, Shield)
      effect.duration -= 1
      return effect.duration > 0
    })
  }
}

/** Resolve an ability and apply its effects. */
export function resolveAbility(
  state: GameState,
  playerId: PlayerId,
  abilityIndex: 0 | 1,
): AbilityResult {
  const player = state.players[playerId]!
  const opponent = state.players[getOpponentId(playerId)]!
  const activeUnit = getActiveUnit(player)
  const workerData = getWorkerData(activeUnit)
  const ability = workerData.abilities[abilityIndex]!
  const messages: string[] = []

  // Pay mana cost (including Slow)
  const cost = getEffectiveAbilityCost(activeUnit, ability.manaCost)
  player.currentMana -= cost

  messages.push(`${workerData.name} uses ${ability.name}!`)

  // Deal damage to opponent's active unit
  if (ability.damage) {
    const damage = calculateDamage(activeUnit, ability.damage)
    const opUnit = getActiveUnit(opponent)
    const actual = applyDamageToUnit(opUnit, damage)
    if (actual > 0) {
      messages.push(`Deals ${actual} damage!`)
    } else {
      messages.push(`${damage} damage absorbed by shield!`)
    }
  }

  // Apply status effect
  if (ability.effect) {
    const target = ability.effect.target
    if (target === 'opponent') {
      const opUnit = getActiveUnit(opponent)
      applyStatusEffect(opUnit, {
        type: ability.effect.type,
        potency: ability.effect.potency,
        duration: ability.effect.duration,
      })
      messages.push(`Applied ${ability.effect.type} to opponent!`)
    } else if (target === 'self') {
      applyStatusEffect(activeUnit, {
        type: ability.effect.type,
        potency: ability.effect.potency,
        duration: ability.effect.duration,
      })
      messages.push(`Applied ${ability.effect.type} to self!`)
    } else if (target === 'all_opponent_bench') {
      // Hit all bench units (Moped Rider's ult)
      for (let i = 0; i < opponent.workers.length; i++) {
        if (i !== opponent.activeUnitIndex && !opponent.workers[i]!.isKnockedOut) {
          // Bench damage doesn't go through the active unit's shield
          opponent.workers[i]!.currentHp -= ability.effect.potency
        }
      }
    }
  }

  // Apply bench damage (e.g. Rush Hour Rampage)
  if (ability.benchDamage) {
    for (let i = 0; i < opponent.workers.length; i++) {
      if (i !== opponent.activeUnitIndex && !opponent.workers[i]!.isKnockedOut) {
        opponent.workers[i]!.currentHp -= ability.benchDamage
        const benchWorker = getWorkerData(opponent.workers[i]!)
        messages.push(`${benchWorker.name} takes ${ability.benchDamage} bench damage!`)
      }
    }
  }

  // Heal
  if (ability.heal) {
    if (ability.heal.target === 'self') {
      const healAmount = Math.min(ability.heal.amount, activeUnit.maxHp - activeUnit.currentHp)
      activeUnit.currentHp += healAmount
      if (healAmount > 0) messages.push(`Heals for ${healAmount} HP!`)
    } else if (ability.heal.target === 'all_allies') {
      // Heal active for full amount, bench for half (Van Driver's ult special case)
      const healActive = Math.min(ability.heal.amount, activeUnit.maxHp - activeUnit.currentHp)
      activeUnit.currentHp += healActive
      if (healActive > 0) messages.push(`Heals self for ${healActive} HP!`)
      // Heal bench for 5 HP (specific to Warehouse Recall)
      for (let i = 0; i < player.workers.length; i++) {
        if (i !== player.activeUnitIndex && !player.workers[i]!.isKnockedOut) {
          const unit = player.workers[i]!
          const benchHeal = Math.min(5, unit.maxHp - unit.currentHp)
          unit.currentHp += benchHeal
          if (benchHeal > 0) {
            const bw = getWorkerData(unit)
            messages.push(`${bw.name} heals for ${benchHeal} HP!`)
          }
        }
      }
    } else if (ability.heal.target === 'bench_allies') {
      // Heal all allies (active + bench) for the amount
      for (const unit of player.workers) {
        if (!unit.isKnockedOut) {
          const healAmt = Math.min(ability.heal.amount, unit.maxHp - unit.currentHp)
          unit.currentHp += healAmt
        }
      }
    }
  }

  // Draw cards
  if (ability.draw) {
    for (let i = 0; i < ability.draw; i++) {
      if (player.deck.length > 0) {
        player.hand.push(player.deck.shift()!)
      }
    }
    messages.push(`Draws ${ability.draw} card(s)!`)
  }

  // Handle Just Eat Scooter's ultimate special case (Shield + Boost combo)
  // The Full English Fortify gives Shield(12) AND Boost(+2, 2 turns)
  // The Shield is handled by the effect field, but we need to add Boost too
  if (workerData.id === 'justeat-scooter' && abilityIndex === 1) {
    applyStatusEffect(activeUnit, { type: 'BOOST', potency: 2, duration: 2 })
    messages.push('Applied BOOST to self!')
  }

  return { messages }
}
