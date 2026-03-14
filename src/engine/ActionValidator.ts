import type { GameState, GameAction } from '../types/index.ts'
import { SWAP_COST } from './constants.ts'
import {
  getActiveUnit,
  getWorkerData,
  getOpponentId,
  getLivingBenchIndices,
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
    case 'SWAP_UNIT':
      return validateSwapUnit(state, action.benchIndex)
    case 'END_TURN':
      return validateEndTurn(state)
    case 'FORCED_SWAP':
      return validateForcedSwap(state, action.benchIndex)
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
  const activeUnit = getActiveUnit(player)
  // Swap sickness is cleared during auto-advance (START_OF_TURN)
  if (activeUnit.swapSick && !willAutoAdvance(state)) return fail('Unit has swap sickness')
  return ok()
}

function validateUseAbility(state: GameState, abilityIndex: 0 | 1): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only use abilities during MAIN_PHASE')
  const player = state.players[state.activePlayerId]!

  if (abilityIndex === 0 && player.hasUsedBasicAbility && !willAutoAdvance(state)) return fail('Already used basic ability this turn')
  if (abilityIndex === 1 && player.hasUsedUltimateAbility && !willAutoAdvance(state)) return fail('Already used ultimate ability this turn')

  const activeUnit = getActiveUnit(player)
  if (activeUnit.swapSick && !willAutoAdvance(state)) return fail('Unit has swap sickness')

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

  // Special validation for utility cards
  if (card.effect.kind === 'free_swap') {
    const benchIndices = getLivingBenchIndices(player)
    if (benchIndices.length === 0) return fail('No bench units to swap with')
  }
  if (card.effect.kind === 'force_opponent_swap') {
    const opponent = state.players[getOpponentId(state.activePlayerId)]!
    const benchIndices = getLivingBenchIndices(opponent)
    if (benchIndices.length === 0) return fail('Opponent has no bench units to swap')
  }

  return ok()
}

function validateSwapUnit(state: GameState, benchIndex: number): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only swap during MAIN_PHASE')
  const player = state.players[state.activePlayerId]!

  if (player.hasSwapped && !willAutoAdvance(state)) return fail('Already swapped this turn')
  if (player.currentMana < SWAP_COST && !willAutoAdvance(state)) return fail('Not enough mana to swap')

  const unit = player.workers[benchIndex]
  if (!unit) return fail('Invalid bench index')
  if (unit.isKnockedOut) return fail('Cannot swap to a KO\'d unit')
  if (benchIndex === player.activeUnitIndex) return fail('Cannot swap to the active unit')

  return ok()
}

function validateEndTurn(state: GameState): ValidationResult {
  if (!isMainPhaseOrAutoAdvanceable(state)) return fail('Can only end turn during MAIN_PHASE')
  return ok()
}

function validateForcedSwap(state: GameState, benchIndex: number): ValidationResult {
  if (state.phase !== 'FORCED_SWAP') return fail('No forced swap pending')
  if (!state.awaitingForcedSwap) return fail('No player awaiting forced swap')

  const player = state.players[state.awaitingForcedSwap]!
  const unit = player.workers[benchIndex]
  if (!unit) return fail('Invalid bench index')
  if (unit.isKnockedOut) return fail('Cannot swap to a KO\'d unit')
  if (benchIndex === player.activeUnitIndex) return fail('Cannot swap to the already-active unit')

  return ok()
}

/**
 * Get all available (valid) actions for the current player in the current phase.
 */
export function getAvailableActions(state: GameState): GameAction[] {
  const actions: GameAction[] = []

  if (state.phase === 'GAME_OVER') return actions

  if (state.phase === 'FORCED_SWAP') {
    const player = state.players[state.awaitingForcedSwap!]!
    const benchIndices = getLivingBenchIndices(player)
    for (const idx of benchIndices) {
      actions.push({ type: 'FORCED_SWAP', benchIndex: idx })
    }
    return actions
  }

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

    // SWAP_UNIT
    const benchIndices = getLivingBenchIndices(player)
    for (const idx of benchIndices) {
      if (validateSwapUnit(state, idx).valid) {
        actions.push({ type: 'SWAP_UNIT', benchIndex: idx })
      }
    }

    // END_TURN — always available in main phase
    actions.push({ type: 'END_TURN' })
  }

  return actions
}
