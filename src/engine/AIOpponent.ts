import type { GameState, GameAction } from '../types/index.ts'
import { getActiveUnit, getWorkerData, getOpponentId, getNextLivingUnitIndex } from './GameState.ts'
import { getAvailableActions } from './ActionValidator.ts'
import { ITEMS_BY_ID } from '../data/items.ts'
import { WORKERS_BY_COMPANY } from '../data/workers.ts'
import { PRESET_DECKS } from '../data/decks.ts'
import type { Company } from '../types/index.ts'
import { createRNG } from './rng.ts'

const COMPANIES: Company[] = ['DELIVEROO', 'UBER', 'AMAZON', 'JUST_EAT']

/**
 * AI selects a team: picks a random company (excluding the player's) and
 * takes 1 worker from each tier (1-star, 2-star, 3-star).
 * Workers are returned in tier order: [1★, 2★, 3★].
 */
export function aiSelectTeam(
  takenWorkerIds: string[],
  seed: number,
  excludeCompany?: Company,
): { workerIds: [string, string, string]; company: Company } {
  const rng = createRNG(seed)

  const candidates = excludeCompany
    ? COMPANIES.filter((c) => c !== excludeCompany)
    : COMPANIES

  const shuffled = [...candidates].sort(() => rng.next() - 0.5)

  for (const company of shuffled) {
    const workers = WORKERS_BY_COMPANY[company]!
    const available = workers.filter((w) => !takenWorkerIds.includes(w.id))

    // Pick one from each tier
    const tier1 = available.filter((w) => w.tier === 1)
    const tier2 = available.filter((w) => w.tier === 2)
    const tier3 = available.filter((w) => w.tier === 3)

    if (tier1.length > 0 && tier2.length > 0 && tier3.length > 0) {
      const pick1 = tier1[Math.floor(rng.next() * tier1.length)]!
      const pick2 = tier2[Math.floor(rng.next() * tier2.length)]!
      const pick3 = tier3[Math.floor(rng.next() * tier3.length)]!
      return {
        workerIds: [pick1.id, pick2.id, pick3.id], // [1★, 2★, 3★]
        company,
      }
    }
  }

  throw new Error('AI cannot find a valid team')
}

/**
 * AI builds a deck using the preset for its company.
 */
export function aiBuildDeck(company: Company): string[] {
  return [...PRESET_DECKS[company]]
}

/**
 * Get the AI's action for the current game state.
 * Uses a priority-based decision system.
 */
export function getAIAction(state: GameState): GameAction {
  const available = getAvailableActions(state)

  if (available.length === 0) {
    return { type: 'END_TURN' }
  }

  const playerId = state.activePlayerId
  const player = state.players[playerId]!
  const opponent = state.players[getOpponentId(playerId)]!
  const activeUnit = getActiveUnit(player)
  const workerData = getWorkerData(activeUnit)
  const opActiveUnit = getActiveUnit(opponent)

  // Priority 1: Consider retreat if active unit is low HP
  // Retreat sacrifices current unit and brings in next tier
  const retreatAction = available.find((a) => a.type === 'RETREAT')
  if (retreatAction && activeUnit.currentHp <= activeUnit.maxHp * 0.25) {
    // Don't retreat if we can KO the opponent with ultimate
    const ult = workerData.abilities[1]!
    const canLethal = ult.damage && ult.damage >= opActiveUnit.currentHp
    if (!canLethal) {
      // More willing to retreat early (1★ is expendable)
      const nextIdx = getNextLivingUnitIndex(player)
      if (nextIdx !== null) {
        return retreatAction
      }
    }
  }

  // Priority 2: If ultimate ability would KO the opponent → use it
  const ultAction = available.find((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 1)
  if (ultAction && ultAction.type === 'USE_ABILITY') {
    const ult = workerData.abilities[1]!
    if (ult.damage) {
      const boostEffect = activeUnit.statusEffects.find((e) => e.type === 'BOOST')
      const totalDamage = ult.damage + (boostEffect ? boostEffect.potency : 0)
      const opShield = opActiveUnit.statusEffects.find((e) => e.type === 'SHIELD')
      const effectiveDamage = opShield ? Math.max(0, totalDamage - opShield.potency) : totalDamage
      if (effectiveDamage >= opActiveUnit.currentHp) {
        return ultAction
      }
    }
  }

  // Priority 3: Basic attack (always attack if possible — it's free)
  const attackAction = available.find((a) => a.type === 'ATTACK')
  if (attackAction) {
    return attackAction
  }

  // Priority 4: Use basic ability if affordable
  const basicAction = available.find((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 0)
  if (basicAction) {
    return basicAction
  }

  // Priority 5: Use ultimate if we can afford it
  if (ultAction) {
    return ultAction
  }

  // Priority 6: Play high-value item cards (phase-aware)
  const cardActions = available.filter((a) => a.type === 'PLAY_CARD')
  const priorityCard = pickBestCard(state, cardActions)
  if (priorityCard) {
    return priorityCard
  }

  // Priority 7: Play any remaining affordable cards
  if (cardActions.length > 0) {
    return cardActions[0]!
  }

  // Default: end turn
  return { type: 'END_TURN' }
}

function pickBestCard(state: GameState, cardActions: GameAction[]): GameAction | null {
  const playerId = state.activePlayerId
  const player = state.players[playerId]!
  const opponent = state.players[getOpponentId(playerId)]!
  const activeUnit = getActiveUnit(player)
  const opActiveUnit = getActiveUnit(opponent)

  let bestAction: GameAction | null = null
  let bestScore = 0

  for (const action of cardActions) {
    if (action.type !== 'PLAY_CARD') continue
    const card = ITEMS_BY_ID[action.cardId]
    if (!card) continue

    let score = 0

    switch (card.type) {
      case 'HEALING': {
        const missingHp = activeUnit.maxHp - activeUnit.currentHp
        if (missingHp > 5) {
          score = Math.min(missingHp, 15)
        }
        break
      }
      case 'DAMAGE': {
        score = 8
        // Bonus if it would KO
        if (card.effect.kind === 'damage' && card.effect.amount >= opActiveUnit.currentHp) {
          score = 20
        }
        break
      }
      case 'BUFF': {
        score = 6
        // Shields are better when low HP
        if (card.effect.kind === 'buff' && card.effect.statusEffect.type === 'SHIELD') {
          score = activeUnit.currentHp < activeUnit.maxHp * 0.5 ? 10 : 5
        }
        break
      }
      case 'DEBUFF': {
        score = 7
        // Poison is more valuable against high-HP targets
        if (card.effect.kind === 'debuff' && card.effect.statusEffect.type === 'POISON') {
          score = opActiveUnit.currentHp > 20 ? 10 : 5
        }
        break
      }
      case 'UTILITY': {
        if (card.effect.kind === 'draw') score = 8
        if (card.effect.kind === 'draw_and_buff') score = 9
        if (card.effect.kind === 'cleanse') {
          const hasNegative = activeUnit.statusEffects.some((e) => e.type === 'POISON' || e.type === 'SLOW')
          score = hasNegative ? 12 : 1
        }
        break
      }
    }

    // Phase-aware scoring: prefer cheap cards early, expensive cards late
    const isEarlyGame = state.turnNumber <= 4
    if (isEarlyGame && card.manaCost > 3) {
      score *= 0.5 // Penalize expensive cards in early game
    }

    // Penalize expensive cards that eat too much of our mana
    if (card.manaCost > player.currentMana * 0.7) {
      score *= 0.7
    }

    if (score > bestScore) {
      bestScore = score
      bestAction = action
    }
  }

  return bestScore > 4 ? bestAction : null
}
