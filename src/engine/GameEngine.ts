import type { GameState, GameAction, GamePhase, PlayerId } from '../types/index.ts'
import { MAX_MANA, RETREAT_COST_TIER_1, RETREAT_COST_TIER_2 } from './constants.ts'
import {
  getActiveUnit,
  getWorkerData,
  getOpponentId,
  getNextLivingUnitIndex,
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
 * Handle KO for a player's active unit.
 * Auto-advances to the next tier unit (linear progression).
 * Returns true if game is over.
 */
function handleKO(state: GameState, targetPlayerId: PlayerId): boolean {
  const player = state.players[targetPlayerId]!
  const activeUnit = getActiveUnit(player)

  if (!activeUnit.isKnockedOut) return false

  const workerData = getWorkerData(activeUnit)
  addLog(state, targetPlayerId, `${workerData.name} was knocked out!`)

  // Check if game is over
  if (checkGameOver(state)) return true

  // Auto-advance to next tier unit
  const nextIndex = getNextLivingUnitIndex(player)
  if (nextIndex !== null) {
    player.activeUnitIndex = nextIndex
    const newWorker = getWorkerData(getActiveUnit(player))
    addLog(state, targetPlayerId, `${newWorker.name} enters the fight!`)
  }

  return false
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

  // Process poison ticks on ALL owned units
  const poisonMessages = processPoisonTicks(player)
  for (const msg of poisonMessages) {
    addLog(state, state.activePlayerId, msg)
  }

  // Fatigue: if deck is empty, active unit takes escalating damage each turn
  if (player.deck.length === 0) {
    const fatigueDamage = Math.max(1, state.turnNumber - 10)
    const activeUnit = getActiveUnit(player)
    if (!activeUnit.isKnockedOut) {
      activeUnit.currentHp -= fatigueDamage
      addLog(state, state.activePlayerId, `Fatigue! Deck empty — takes ${fatigueDamage} damage.`)
    }
  }

  // Check for KOs from poison/fatigue
  for (const unit of player.workers) {
    if (unit.currentHp <= 0 && !unit.isKnockedOut) {
      unit.currentHp = 0
      unit.isKnockedOut = true
    }
  }

  // Handle active unit KO from poison/fatigue — auto-advance to next tier
  const activeUnit = getActiveUnit(player)
  if (activeUnit.isKnockedOut) {
    const workerData = getWorkerData(activeUnit)
    addLog(state, state.activePlayerId, `${workerData.name} was knocked out by poison!`)
    if (checkGameOver(state)) return state
    const nextIndex = getNextLivingUnitIndex(player)
    if (nextIndex !== null) {
      player.activeUnitIndex = nextIndex
      const newWorker = getWorkerData(getActiveUnit(player))
      addLog(state, state.activePlayerId, `${newWorker.name} enters the fight!`)
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
  if (phase() === 'START_OF_TURN') {
    processStartOfTurn(newState)
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

    case 'RETREAT': {
      const activeUnit = getActiveUnit(player)
      const workerData = getWorkerData(activeUnit)

      // Pay retreat cost
      const cost = workerData.tier === 1 ? RETREAT_COST_TIER_1 : RETREAT_COST_TIER_2
      player.currentMana -= cost

      // KO the current unit (sacrifice)
      activeUnit.currentHp = 0
      activeUnit.isKnockedOut = true
      addLog(newState, newState.activePlayerId, `${workerData.name} retreats (sacrificed)!`)

      // Advance to next tier
      const nextIndex = getNextLivingUnitIndex(player)
      if (nextIndex !== null) {
        player.activeUnitIndex = nextIndex
        const newWorker = getWorkerData(getActiveUnit(player))
        addLog(newState, newState.activePlayerId, `${newWorker.name} enters the fight!`)
      }
      break
    }

    case 'END_TURN': {
      processEndOfTurn(newState)
      break
    }
  }

  return newState
}

/**
 * Auto-advance through non-interactive phases.
 * Call this after creating initial state to advance to MAIN_PHASE.
 */
export function advanceToMainPhase(state: GameState): GameState {
  let current = cloneState(state)

  const p = (): GamePhase => current.phase
  if (p() === 'START_OF_TURN') {
    processStartOfTurn(current)
    if (p() === 'GAME_OVER') return current
  }

  if (p() === 'DRAW_PHASE') {
    processDrawPhase(current)
  }

  return current
}
