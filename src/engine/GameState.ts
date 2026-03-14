import type { GameState, PlayerState, PlayerId, UnitState } from '../types/index.ts'
import type { GigWorker } from '../types/index.ts'
import { WORKERS_BY_ID } from '../data/workers.ts'
import { STARTING_HAND_SIZE } from './constants.ts'
import { createRNG, shuffle } from './rng.ts'

export function createUnitState(worker: GigWorker): UnitState {
  return {
    workerId: worker.id,
    currentHp: worker.hp,
    maxHp: worker.hp,
    isKnockedOut: false,
    statusEffects: [],
  }
}

export function createPlayerState(
  id: PlayerId,
  workerIds: [string, string, string],
  deckCardIds: string[],
): PlayerState {
  return {
    id,
    workers: workerIds.map((wid) => {
      const worker = WORKERS_BY_ID[wid]
      if (!worker) throw new Error(`Unknown worker: ${wid}`)
      return createUnitState(worker)
    }) as [UnitState, UnitState, UnitState],
    activeUnitIndex: 0, // Always start with first unit (1★)
    deck: [...deckCardIds],
    hand: [],
    discardPile: [],
    maxMana: 0,
    currentMana: 0,
    hasAttacked: false,
    hasUsedBasicAbility: false,
    hasUsedUltimateAbility: false,
    isFirstTurn: false,
  }
}

/**
 * Create the initial game state after both players have selected workers and decks.
 * Workers must be ordered [1★, 2★, 3★]. Active unit is always index 0 (1★).
 * Shuffles decks, draws starting hands, flips coin for first player.
 */
export function createInitialGameState(
  p1Workers: [string, string, string],
  p1Deck: string[],
  p2Workers: [string, string, string],
  p2Deck: string[],
  seed: number,
): GameState {
  const rng = createRNG(seed)

  const player1 = createPlayerState('player1', p1Workers, p1Deck)
  const player2 = createPlayerState('player2', p2Workers, p2Deck)

  // Shuffle decks
  player1.deck = shuffle(player1.deck, rng)
  player2.deck = shuffle(player2.deck, rng)

  // Draw starting hands
  for (let i = 0; i < STARTING_HAND_SIZE; i++) {
    if (player1.deck.length > 0) {
      player1.hand.push(player1.deck.shift()!)
    }
    if (player2.deck.length > 0) {
      player2.hand.push(player2.deck.shift()!)
    }
  }

  // Coin flip for first player
  const firstPlayer: PlayerId = rng.next() < 0.5 ? 'player1' : 'player2'

  // First player skips their first draw
  if (firstPlayer === 'player1') {
    player1.isFirstTurn = true
  } else {
    player2.isFirstTurn = true
  }

  return {
    phase: 'START_OF_TURN',
    turnNumber: 1,
    activePlayerId: firstPlayer,
    firstPlayerId: firstPlayer,
    winner: null,
    winReason: null,
    players: { player1, player2 },
    rngSeed: seed,
    rngCounter: rng.getCounter(),
    actionHistory: [],
    combatLog: [],
  }
}

/** Get the active unit for a player */
export function getActiveUnit(player: PlayerState): UnitState {
  return player.workers[player.activeUnitIndex]!
}

/** Get the worker data for a unit */
export function getWorkerData(unit: UnitState): GigWorker {
  const worker = WORKERS_BY_ID[unit.workerId]
  if (!worker) throw new Error(`Unknown worker: ${unit.workerId}`)
  return worker
}

/** Get the next living unit index after the active one (for tier progression) */
export function getNextLivingUnitIndex(player: PlayerState): number | null {
  for (let i = player.activeUnitIndex + 1; i < player.workers.length; i++) {
    if (!player.workers[i]!.isKnockedOut) return i
  }
  return null
}

/** Get the opponent's player ID */
export function getOpponentId(playerId: PlayerId): PlayerId {
  return playerId === 'player1' ? 'player2' : 'player1'
}
