import type { GameState, PlayerId, PlayerViewState } from '../types/index.ts'
import { getOpponentId } from './GameState.ts'

/**
 * Create a censored view of the game state for a specific player.
 * Hides opponent's hand and deck contents.
 */
export function getPlayerView(state: GameState, playerId: PlayerId): PlayerViewState {
  const opponentId = getOpponentId(playerId)
  const opponent = state.players[opponentId]!

  return {
    phase: state.phase,
    turnNumber: state.turnNumber,
    activePlayerId: state.activePlayerId,
    winner: state.winner,
    winReason: state.winReason,
    myState: state.players[playerId]!,
    opponentState: {
      id: opponentId,
      workers: opponent.workers,
      activeUnitIndex: opponent.activeUnitIndex,
      handSize: opponent.hand.length,
      deckSize: opponent.deck.length,
      discardPile: opponent.discardPile,
      maxMana: opponent.maxMana,
      currentMana: opponent.currentMana,
    },
    combatLog: state.combatLog,
  }
}
