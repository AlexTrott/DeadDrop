import type { GameState, GameAction, GamePhase, PlayerId } from '../types/index.ts'
import { MAX_MANA } from './constants.ts'
import {
  getActiveUnit,
  getWorkerData,
  getOpponentId,
  getLivingBenchIndices,
} from './GameState.ts'
import { validateAction } from './ActionValidator.ts'
import { resolveAbility, processPoisonTicks, decrementStatusEffects, calculateDamage, applyDamageToUnit } from './CombatSystem.ts'
import { resolveCardEffect } from './CardEffects.ts'
import { ITEMS_BY_ID } from '../data/items.ts'

/** Deep clone a game state (simple JSON approach — all data is serialisable) */
function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState
}

function addLog(state: GameState, playerId: PlayerId, message: string): void {
  state.combatLog.push({ turn: state.turnNumber, playerId, message })
}

/**
 * Check if a player has lost (all units KO'd).
 * If so, set winner and transition to GAME_OVER.
 * Returns true if game is over.
 */
function checkGameOver(state: GameState): boolean {
  for (const pid of ['player1', 'player2'] as PlayerId[]) {
    const player = state.players[pid]!
    const allKO = player.workers.every((w) => w.isKnockedOut)
    if (allKO) {
      const winnerId = getOpponentId(pid)
      state.winner = winnerId
      state.winReason = `All of ${pid}'s workers have been knocked out`
      state.phase = 'GAME_OVER'
      addLog(state, winnerId, `${winnerId} wins! All opponent workers KO'd.`)
      return true
    }
  }
  return false
}

/**
 * Handle KO for the defending player's active unit.
 * If the active unit is KO'd, either trigger forced swap or game over.
 * Returns true if a forced swap is now pending.
 */
function handleKO(state: GameState, targetPlayerId: PlayerId): boolean {
  const player = state.players[targetPlayerId]!
  const activeUnit = getActiveUnit(player)

  if (!activeUnit.isKnockedOut) return false

  const workerData = getWorkerData(activeUnit)
  addLog(state, targetPlayerId, `${workerData.name} was knocked out!`)

  // Check if game is over
  if (checkGameOver(state)) return false

  // Need forced swap
  const benchIndices = getLivingBenchIndices(player)
  if (benchIndices.length === 1) {
    // Auto-swap if only one bench unit
    player.activeUnitIndex = benchIndices[0]!
    const newWorker = getWorkerData(getActiveUnit(player))
    addLog(state, targetPlayerId, `${newWorker.name} swaps in!`)
    return false
  }

  // Multiple bench units — player must choose
  state.awaitingForcedSwap = targetPlayerId
  state.phase = 'FORCED_SWAP'
  return true
}

/** Process START_OF_TURN phase: mana, poison ticks, KO checks */
function processStartOfTurn(state: GameState): GameState {
  const player = state.players[state.activePlayerId]!

  // Increment and refill mana
  if (player.maxMana < MAX_MANA) {
    player.maxMana += 1
  }
  player.currentMana = player.maxMana

  // Reset per-turn flags
  player.hasAttacked = false
  player.hasUsedBasicAbility = false
  player.hasUsedUltimateAbility = false
  player.hasSwapped = false

  // Clear swap sickness on all units
  for (const unit of player.workers) {
    unit.swapSick = false
  }

  // Process poison ticks on ALL owned units
  const poisonMessages = processPoisonTicks(player)
  for (const msg of poisonMessages) {
    addLog(state, state.activePlayerId, msg)
  }

  // Fatigue: if deck is empty, active unit takes escalating damage each turn
  // This prevents infinite stalemates in sustain-heavy matchups
  if (player.deck.length === 0) {
    const fatigueDamage = Math.max(1, state.turnNumber - 10)
    const activeUnit = getActiveUnit(player)
    if (!activeUnit.isKnockedOut) {
      activeUnit.currentHp -= fatigueDamage
      addLog(state, state.activePlayerId, `Fatigue! Deck empty — takes ${fatigueDamage} damage.`)
    }
  }

  // Check for KOs from poison
  for (const unit of player.workers) {
    if (unit.currentHp <= 0 && !unit.isKnockedOut) {
      unit.currentHp = 0
      unit.isKnockedOut = true
    }
  }

  // Handle active unit KO from poison
  const activeUnit = getActiveUnit(player)
  if (activeUnit.isKnockedOut) {
    if (checkGameOver(state)) return state
    const benchIndices = getLivingBenchIndices(player)
    if (benchIndices.length === 1) {
      player.activeUnitIndex = benchIndices[0]!
      const newWorker = getWorkerData(getActiveUnit(player))
      addLog(state, state.activePlayerId, `${newWorker.name} swaps in after poison KO!`)
    } else if (benchIndices.length > 1) {
      state.awaitingForcedSwap = state.activePlayerId
      state.phase = 'FORCED_SWAP'
      return state
    }
  }

  // Transition to draw phase
  state.phase = 'DRAW_PHASE'
  return state
}

/** Process DRAW_PHASE: draw a card */
function processDrawPhase(state: GameState): GameState {
  const player = state.players[state.activePlayerId]!

  if (player.isFirstTurn) {
    // First player skips first draw
    player.isFirstTurn = false
  } else if (player.deck.length > 0) {
    const card = player.deck.shift()!
    player.hand.push(card)
  }

  state.phase = 'MAIN_PHASE'
  return state
}

/** Process END_OF_TURN: decrement status effects, switch player */
function processEndOfTurn(state: GameState): GameState {
  const player = state.players[state.activePlayerId]!

  // Decrement timed status effects on ALL of this player's units
  decrementStatusEffects(player)

  // Switch active player
  state.activePlayerId = getOpponentId(state.activePlayerId)
  state.turnNumber += 1

  // Start the next player's turn
  state.phase = 'START_OF_TURN'
  return state
}

/**
 * The core game engine function.
 * Takes current state + action, returns new state.
 * Pure function — no side effects.
 */
export function applyAction(state: GameState, action: GameAction): GameState {
  // Validate the action
  const validation = validateAction(state, action)
  if (!validation.valid) {
    throw new Error(`Invalid action: ${validation.reason}`)
  }

  const newState = cloneState(state)
  newState.actionHistory.push(action)

  // Auto-advance through non-interactive phases
  const phase = (): GamePhase => newState.phase
  if (phase() === 'START_OF_TURN' && action.type !== 'FORCED_SWAP') {
    processStartOfTurn(newState)
    if (phase() === 'FORCED_SWAP') {
      // Poison KO requires forced swap — return state in FORCED_SWAP phase
      // The original action is discarded; caller must send FORCED_SWAP action next
      return newState
    }
    if (phase() === 'GAME_OVER') return newState
    if (phase() === 'DRAW_PHASE') {
      processDrawPhase(newState)
    }
  }

  const player = newState.players[newState.activePlayerId]!
  const opponent = newState.players[getOpponentId(newState.activePlayerId)]!

  switch (action.type) {
    case 'ATTACK': {
      const attacker = getActiveUnit(player)
      const defender = getActiveUnit(opponent)
      const attackerData = getWorkerData(attacker)
      const damage = calculateDamage(attacker, attackerData.attack)

      // Apply damage through shield
      const actualDamage = applyDamageToUnit(defender, damage)
      player.hasAttacked = true
      addLog(newState, newState.activePlayerId, `${attackerData.name} attacks for ${actualDamage} damage!`)

      // Check KO
      if (defender.currentHp <= 0) {
        defender.currentHp = 0
        defender.isKnockedOut = true
        handleKO(newState, getOpponentId(newState.activePlayerId))
      }
      break
    }

    case 'USE_ABILITY': {
      const result = resolveAbility(newState, newState.activePlayerId, action.abilityIndex)
      if (action.abilityIndex === 0) {
        player.hasUsedBasicAbility = true
      } else {
        player.hasUsedUltimateAbility = true
      }
      for (const msg of result.messages) {
        addLog(newState, newState.activePlayerId, msg)
      }

      // Check KO on opponent
      const opActiveUnit = getActiveUnit(opponent)
      if (opActiveUnit.currentHp <= 0 && !opActiveUnit.isKnockedOut) {
        opActiveUnit.currentHp = 0
        opActiveUnit.isKnockedOut = true
        handleKO(newState, getOpponentId(newState.activePlayerId))
      }

      // Check KO on opponent bench (from bench damage abilities)
      for (const unit of opponent.workers) {
        if (unit.currentHp <= 0 && !unit.isKnockedOut) {
          unit.currentHp = 0
          unit.isKnockedOut = true
        }
      }
      checkGameOver(newState)
      break
    }

    case 'PLAY_CARD': {
      const cardIndex = player.hand.indexOf(action.cardId)
      const card = ITEMS_BY_ID[action.cardId]!

      // Spend mana
      player.currentMana -= card.manaCost

      // Remove from hand
      player.hand.splice(cardIndex, 1)

      // Resolve effect
      const result = resolveCardEffect(newState, newState.activePlayerId, card, action.target)
      for (const msg of result.messages) {
        addLog(newState, newState.activePlayerId, msg)
      }

      // Add to discard
      player.discardPile.push(action.cardId)

      // Check KOs on opponent
      for (const unit of opponent.workers) {
        if (unit.currentHp <= 0 && !unit.isKnockedOut) {
          unit.currentHp = 0
          unit.isKnockedOut = true
        }
      }
      const opActive = getActiveUnit(opponent)
      if (opActive.isKnockedOut) {
        handleKO(newState, getOpponentId(newState.activePlayerId))
      }
      checkGameOver(newState)
      break
    }

    case 'SWAP_UNIT': {
      const oldUnit = getActiveUnit(player)
      const oldWorker = getWorkerData(oldUnit)
      player.activeUnitIndex = action.benchIndex
      const newUnit = getActiveUnit(player)
      newUnit.swapSick = true
      player.currentMana -= 1
      player.hasSwapped = true
      const newWorker = getWorkerData(newUnit)
      addLog(newState, newState.activePlayerId, `${oldWorker.name} swaps out, ${newWorker.name} swaps in!`)
      break
    }

    case 'END_TURN': {
      processEndOfTurn(newState)
      break
    }

    case 'FORCED_SWAP': {
      const swapPlayer = newState.players[newState.awaitingForcedSwap!]!
      swapPlayer.activeUnitIndex = action.benchIndex
      const newWorker = getWorkerData(getActiveUnit(swapPlayer))
      addLog(newState, swapPlayer.id, `${newWorker.name} swaps in!`)
      newState.awaitingForcedSwap = null

      // Resume the phase we were in
      // If we were in START_OF_TURN processing, continue to DRAW_PHASE
      if (newState.phase === 'FORCED_SWAP') {
        // Check if this was during start of turn (poison KO) or during main phase
        // If the forced swap player is the active player, we were in start of turn
        if (swapPlayer.id === newState.activePlayerId) {
          newState.phase = 'DRAW_PHASE'
          processDrawPhase(newState)
        } else {
          // Opponent's unit was KO'd during our main phase — back to main phase
          newState.phase = 'MAIN_PHASE'
        }
      }
      break
    }
  }

  return newState
}

/**
 * Auto-advance through non-interactive phases.
 * Call this after creating initial state or after a FORCED_SWAP to advance to MAIN_PHASE.
 */
export function advanceToMainPhase(state: GameState): GameState {
  let current = cloneState(state)

  const p = (): GamePhase => current.phase
  if (p() === 'START_OF_TURN') {
    processStartOfTurn(current)
    if (p() === 'GAME_OVER' || p() === 'FORCED_SWAP') return current
  }

  if (p() === 'DRAW_PHASE') {
    processDrawPhase(current)
  }

  return current
}
