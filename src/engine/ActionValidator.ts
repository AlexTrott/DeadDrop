import type { GameState, GameAction } from '../types/index.ts'
import { RETREAT_COST_TIER_1, RETREAT_COST_TIER_2 } from './constants.ts'
import {
  getActiveUnit,
  getWorkerData,
  getNextLivingUnitIndex,
} from './GameState.ts'
import { ITEMS_BY_ID } from '../data/items.ts'
import { getEffectiveAbilityCost } from './CombatSystem.ts'

export interface ValidationResult {
  valid: boolean
  reason?: string
}

function ok(): ValidationResult {
  return { valid: true }
}

function fail(reason: string): ValidationResult {
  return { valid: false, reason }
}

export function validateAction(state: GameState, action: GameAction): ValidationResult {
  switch (action.type) {
    case 'ATTACK':
      return validateAttack(state)
    case 'USE_ABILITY':
      return validateUseAbility(state, action.abilityIndex)
    case 'PLAY_CARD':
      return validatePlayCard(state, action.cardId)
    case 'RETREAT':
      return validateRetreat(state)
    case 'END_TURN':
      return validateEndTurn(state)
    default:
      return fail('Unknown action type')
  }
}

function isMainPhaseOrAutoAdvanceable(state: GameState): boolean {
  return state.phase === 'MAIN_PHASE' || state.phase === 'START_OF_TURN' || state.phase === 'DRAW_PHASE'
}

function willAutoAdvance(state: GameState): boolean {
  return state.phase === 'START_OF_TURN' || state.phase === 'DRAW_PHASE'
}

function validateAttack(state: GameState): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only attack during MAIN_PHASE')
  const player = state.players[state.activePlayerId]!
  if (player.hasAttacked && !willAutoAdvance(state)) return fail('Already attacked this turn')
  return ok()
}

function validateUseAbility(state: GameState, abilityIndex: 0 | 1): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only use abilities during MAIN_PHASE')
  const player = state.players[state.activePlayerId]!

  if (abilityIndex === 0 && player.hasUsedBasicAbility && !willAutoAdvance(state)) return fail('Already used basic ability this turn')
  if (abilityIndex === 1 && player.hasUsedUltimateAbility && !willAutoAdvance(state)) return fail('Already used ultimate ability this turn')

  const activeUnit = getActiveUnit(player)
  const workerData = getWorkerData(activeUnit)
  const ability = workerData.abilities[abilityIndex]!
  const cost = getEffectiveAbilityCost(activeUnit, ability.manaCost)

  if (player.currentMana < cost) return fail(`Not enough mana (need ${cost}, have ${player.currentMana})`)
  return ok()
}

function validatePlayCard(state: GameState, cardId: string): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only play cards during MAIN_PHASE')
  const player = state.players[state.activePlayerId]!

  if (!player.hand.includes(cardId)) return fail('Card not in hand')

  const card = ITEMS_BY_ID[cardId]
  if (!card) return fail('Unknown card')

  if (player.currentMana < card.manaCost) return fail(`Not enough mana (need ${card.manaCost}, have ${player.currentMana})`)

  return ok()
}

function validateRetreat(state: GameState): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only retreat during MAIN_PHASE')
  const player = state.players[state.activePlayerId]!

  // Can't retreat from 3★ (last unit, index 2)
  const nextIndex = getNextLivingUnitIndex(player)
  if (nextIndex === null) return fail('No next unit to advance to')

  // Determine retreat cost based on current active unit's tier
  const activeUnit = getActiveUnit(player)
  const workerData = getWorkerData(activeUnit)
  const cost = workerData.tier === 1 ? RETREAT_COST_TIER_1 : RETREAT_COST_TIER_2

  if (player.currentMana < cost) return fail(`Not enough mana to retreat (need ${cost}, have ${player.currentMana})`)

  return ok()
}

function validateEndTurn(state: GameState): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only end turn during MAIN_PHASE')
  return ok()
}

/**
 * Get all available (valid) actions for the current player in the current phase.
 */
export function getAvailableActions(state: GameState): GameAction[] {
  const actions: GameAction[] = []

  if (state.phase === 'GAME_OVER') return actions

  // For START_OF_TURN and DRAW_PHASE, the only "action" is to advance
  // (handled automatically by the engine). Return main phase actions
  // since the engine auto-advances.
  if (state.phase === 'START_OF_TURN' || state.phase === 'DRAW_PHASE' || state.phase === 'MAIN_PHASE') {
    const player = state.players[state.activePlayerId]!

    // ATTACK
    if (validateAttack(state).valid) {
      actions.push({ type: 'ATTACK' })
    }

    // USE_ABILITY
    if (validateUseAbility(state, 0).valid) {
      actions.push({ type: 'USE_ABILITY', abilityIndex: 0 })
    }
    if (validateUseAbility(state, 1).valid) {
      actions.push({ type: 'USE_ABILITY', abilityIndex: 1 })
    }

    // PLAY_CARD
    for (const cardId of player.hand) {
      if (validatePlayCard(state, cardId).valid) {
        actions.push({ type: 'PLAY_CARD', cardId })
      }
    }

    // RETREAT
    if (validateRetreat(state).valid) {
      actions.push({ type: 'RETREAT' })
    }

    // END_TURN — always available in main phase
    actions.push({ type: 'END_TURN' })
  }

  return actions
}
