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
  if (boost) {
    damage += boost.potency
  }
  return damage
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
    }
  }

  // Heal
  if (ability.heal) {
    if (ability.heal.target === 'self') {
      const healAmount = Math.min(ability.heal.amount, activeUnit.maxHp - activeUnit.currentHp)
      activeUnit.currentHp += healAmount
      if (healAmount > 0) messages.push(`Heals for ${healAmount} HP!`)
    } else if (ability.heal.target === 'all_allies') {
      for (const unit of player.workers) {
        if (!unit.isKnockedOut) {
          const healAmount = Math.min(ability.heal.amount, unit.maxHp - unit.currentHp)
          unit.currentHp += healAmount
        }
      }
      messages.push(`All allies heal for up to ${ability.heal.amount} HP!`)
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

  return { messages }
}
