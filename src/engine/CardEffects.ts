import type { GameState, PlayerId, ItemCard } from '../types/index.ts'
import {
  getActiveUnit,
  getWorkerData,
  getOpponentId,
  getLivingBenchIndices,
} from './GameState.ts'
import { applyStatusEffect, applyDamageToUnit } from './CombatSystem.ts'
import { createRNG } from './rng.ts'

export interface CardEffectResult {
  messages: string[]
}

/**
 * Resolve an item card's effect.
 * Mutates the state in place (caller should have cloned first).
 */
export function resolveCardEffect(
  state: GameState,
  playerId: PlayerId,
  card: ItemCard,
  _target?: string,
): CardEffectResult {
  const messages: string[] = []

  messages.push(`Plays ${card.name} ${card.emoji}!`)

  resolveEffect(state, playerId, card.effect, messages)

  return { messages }
}

function resolveEffect(
  state: GameState,
  playerId: PlayerId,
  effect: import('../types/index.ts').CardEffectType,
  messages: string[],
): void {
  const player = state.players[playerId]!
  const opponent = state.players[getOpponentId(playerId)]!

  switch (effect.kind) {
    case 'heal': {
      if (effect.target === 'active') {
        const unit = getActiveUnit(player)
        const healAmount = Math.min(effect.amount, unit.maxHp - unit.currentHp)
        unit.currentHp += healAmount
        if (healAmount > 0) messages.push(`Heals for ${healAmount} HP!`)
      } else if (effect.target === 'all_allies') {
        for (const unit of player.workers) {
          if (!unit.isKnockedOut) {
            const healAmount = Math.min(effect.amount, unit.maxHp - unit.currentHp)
            unit.currentHp += healAmount
          }
        }
        messages.push(`All units heal for up to ${effect.amount} HP!`)
      }
      break
    }

    case 'damage': {
      if (effect.target === 'opponent_active') {
        const unit = getActiveUnit(opponent)
        const actual = applyDamageToUnit(unit, effect.amount)
        messages.push(`Deals ${actual > 0 ? actual : 0} damage!`)
      }
      break
    }

    case 'damage_conditional': {
      const unit = getActiveUnit(opponent)
      const hasBuff = unit.statusEffects.some((e) => e.type === 'BOOST')
      const damage = hasBuff ? effect.bonusAmount : effect.amount
      const actual = applyDamageToUnit(unit, damage)
      if (hasBuff) {
        messages.push(`Target has Boost — deals ${actual > 0 ? actual : 0} damage!`)
      } else {
        messages.push(`Deals ${actual > 0 ? actual : 0} damage!`)
      }
      break
    }

    case 'damage_aoe': {
      // Active unit damage
      const activeOp = getActiveUnit(opponent)
      const actualActive = applyDamageToUnit(activeOp, effect.activeDamage)
      messages.push(`Deals ${actualActive > 0 ? actualActive : 0} damage to active unit!`)

      // Bench damage
      for (let i = 0; i < opponent.workers.length; i++) {
        const unit = opponent.workers[i]!
        if (i !== opponent.activeUnitIndex && !unit.isKnockedOut) {
          unit.currentHp -= effect.benchDamage
          if (unit.currentHp < 0) unit.currentHp = 0
          const w = getWorkerData(unit)
          messages.push(`${w.name} takes ${effect.benchDamage} bench damage!`)
        }
      }
      break
    }

    case 'buff': {
      const unit = getActiveUnit(player)
      applyStatusEffect(unit, effect.statusEffect)
      messages.push(`Applied ${effect.statusEffect.type} to active unit!`)
      break
    }

    case 'debuff': {
      const unit = getActiveUnit(opponent)
      applyStatusEffect(unit, effect.statusEffect)
      messages.push(`Applied ${effect.statusEffect.type} to opponent!`)
      break
    }

    case 'heal_and_cleanse': {
      const unit = getActiveUnit(player)
      const healAmount = Math.min(effect.healAmount, unit.maxHp - unit.currentHp)
      unit.currentHp += healAmount
      if (healAmount > 0) messages.push(`Heals for ${healAmount} HP!`)

      if (effect.cleanse === 'negative') {
        unit.statusEffects = unit.statusEffects.filter(
          (e) => e.type !== 'POISON' && e.type !== 'SLOW'
        )
        messages.push('Removed negative status effects!')
      } else {
        unit.statusEffects = []
        messages.push('Removed all status effects!')
      }
      break
    }

    case 'draw': {
      let drawn = 0
      for (let i = 0; i < effect.amount; i++) {
        if (player.deck.length > 0) {
          player.hand.push(player.deck.shift()!)
          drawn++
        }
      }
      if (drawn > 0) messages.push(`Drew ${drawn} card(s)!`)
      break
    }

    case 'free_swap': {
      // This requires player to choose a bench unit
      // For now, the card play triggers a free swap selection
      // The UI/AI will handle choosing the target via the 'target' parameter
      // For simplicity, auto-pick the first available bench unit if no target specified
      const benchIndices = getLivingBenchIndices(player)
      if (benchIndices.length > 0) {
        // Store that this is a free swap pending
        // The swap itself will be handled as a special case
        state.pendingFreeSwap = playerId
        messages.push('Choose a bench unit to swap in (no swap sickness)!')
      }
      break
    }

    case 'force_opponent_swap': {
      const benchIndices = getLivingBenchIndices(opponent)
      if (benchIndices.length > 0) {
        // Pick a random bench unit using seeded RNG
        const rng = createRNG(state.rngSeed, state.rngCounter)
        const randomIdx = rng.nextInt(0, benchIndices.length - 1)
        state.rngCounter = rng.getCounter()

        const targetIdx = benchIndices[randomIdx]!
        const oldWorker = getWorkerData(getActiveUnit(opponent))
        opponent.activeUnitIndex = targetIdx
        // No swap sickness from card-forced swap
        const newWorker = getWorkerData(getActiveUnit(opponent))
        messages.push(`${oldWorker.name} is forced out! ${newWorker.name} swaps in!`)
      }
      break
    }

    case 'cleanse': {
      const unit = getActiveUnit(player)
      if (effect.cleanse === 'negative') {
        unit.statusEffects = unit.statusEffects.filter(
          (e) => e.type !== 'POISON' && e.type !== 'SLOW'
        )
        messages.push('Removed negative status effects!')
      } else {
        unit.statusEffects = []
        messages.push('Removed all status effects!')
      }
      break
    }

    case 'multi': {
      for (const subEffect of effect.effects) {
        resolveEffect(state, playerId, subEffect, messages)
      }
      break
    }
  }
}
