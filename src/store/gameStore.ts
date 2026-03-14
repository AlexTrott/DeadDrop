import { create } from 'zustand'
import type { GameState, GameAction } from '../types/index.ts'
import { createInitialGameState } from '../engine/GameState.ts'
import { WORKERS_BY_ID } from '../data/workers.ts'
import { applyAction, advanceToMainPhase } from '../engine/GameEngine.ts'
import { getAvailableActions } from '../engine/ActionValidator.ts'
import { getAIAction, aiSelectTeam, aiBuildDeck, aiSelectStartingUnit } from '../engine/AIOpponent.ts'
import type { Company } from '../types/index.ts'

export type GameScreen = 'title' | 'team-select' | 'deck-build' | 'starting-unit' | 'game' | 'game-over'

interface GameStore {
  // Navigation
  screen: GameScreen
  setScreen: (screen: GameScreen) => void

  // Pre-game state
  playerCompany: Company | null
  playerWorkerIds: string[]
  playerDeck: string[]
  playerStartingUnit: number
  aiCompany: Company | null
  aiWorkerIds: string[]
  aiDeck: string[]

  // Game state
  gameState: GameState | null
  isAIThinking: boolean

  // Pre-game actions
  selectCompany: (company: Company) => void
  toggleWorker: (workerId: string) => void
  toggleDeckCard: (cardId: string) => void
  setPlayerStartingUnit: (index: number) => void
  startGame: () => void

  // Game actions
  dispatch: (action: GameAction) => void
  processAITurn: () => Promise<void>

  // Reset
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'title',
  setScreen: (screen) => set({ screen }),

  playerCompany: null,
  playerWorkerIds: [],
  playerDeck: [],
  playerStartingUnit: 0,
  aiCompany: null,
  aiWorkerIds: [],
  aiDeck: [],

  gameState: null,
  isAIThinking: false,

  selectCompany: (company) => {
    const seed = Date.now()
    const ai = aiSelectTeam([], seed, company)
    set({
      playerCompany: company,
      playerWorkerIds: [],
      aiWorkerIds: ai.workerIds,
      aiCompany: ai.company,
      aiDeck: aiBuildDeck(ai.company),
    })
  },

  toggleWorker: (workerId) => {
    const { playerWorkerIds } = get()
    const worker = WORKERS_BY_ID[workerId]
    if (!worker) return

    if (playerWorkerIds.includes(workerId)) {
      // Deselect
      set({ playerWorkerIds: playerWorkerIds.filter((id) => id !== workerId) })
    } else {
      // Remove any existing pick from the same tier, then add this one
      const filtered = playerWorkerIds.filter((id) => {
        const w = WORKERS_BY_ID[id]
        return w?.tier !== worker.tier
      })
      set({ playerWorkerIds: [...filtered, workerId] })
    }
  },

  toggleDeckCard: (cardId) => {
    const { playerDeck } = get()
    const count = playerDeck.filter((id) => id === cardId).length
    if (count > 0 && playerDeck.length > playerDeck.filter((id) => id !== cardId).length) {
      // Remove one copy
      const idx = playerDeck.indexOf(cardId)
      if (idx !== -1) {
        const newDeck = [...playerDeck]
        newDeck.splice(idx, 1)
        set({ playerDeck: newDeck })
      }
    } else if (count < 2 && playerDeck.length < 15) {
      set({ playerDeck: [...playerDeck, cardId] })
    }
  },

  setPlayerStartingUnit: (index) => set({ playerStartingUnit: index }),

  startGame: () => {
    const { playerWorkerIds, playerDeck, playerStartingUnit, aiWorkerIds, aiDeck } = get()
    const aiStart = aiSelectStartingUnit(aiWorkerIds as [string, string, string])
    const seed = Date.now()

    let state = createInitialGameState(
      playerWorkerIds as [string, string, string],
      playerDeck,
      playerStartingUnit,
      aiWorkerIds as [string, string, string],
      aiDeck,
      aiStart,
      seed,
    )

    state = advanceToMainPhase(state)
    set({ gameState: state, screen: 'game' })

    // If AI goes first, process their turn
    if (state.activePlayerId === 'player2') {
      setTimeout(() => get().processAITurn(), 500)
    }
  },

  dispatch: (action) => {
    const { gameState } = get()
    if (!gameState) return

    let newState = applyAction(gameState, action)

    set({ gameState: newState })

    // Check if game is over
    if (newState.phase === 'GAME_OVER') {
      setTimeout(() => set({ screen: 'game-over' }), 1500)
      return
    }

    // If it's now the AI's turn, process it
    if (newState.activePlayerId === 'player2' && newState.phase !== 'FORCED_SWAP') {
      setTimeout(() => get().processAITurn(), 600)
    }
    // If AI needs to make a forced swap
    if (newState.phase === 'FORCED_SWAP' && newState.awaitingForcedSwap === 'player2') {
      setTimeout(() => get().processAITurn(), 400)
    }
  },

  processAITurn: async () => {
    set({ isAIThinking: true })

    const processOneAction = () => {
      const { gameState } = get()
      if (!gameState || gameState.phase === 'GAME_OVER') {
        set({ isAIThinking: false })
        return
      }

      // If it's not the AI's turn (unless forced swap), stop
      if (gameState.activePlayerId !== 'player2' &&
          !(gameState.phase === 'FORCED_SWAP' && gameState.awaitingForcedSwap === 'player2')) {
        set({ isAIThinking: false })
        return
      }

      const action = getAIAction(gameState)
      const newState = applyAction(gameState, action)
      set({ gameState: newState })

      if (newState.phase === 'GAME_OVER') {
        set({ isAIThinking: false })
        setTimeout(() => set({ screen: 'game-over' }), 1500)
        return
      }

      // If AI still needs to act (multi-action turn), continue
      if (newState.activePlayerId === 'player2' && newState.phase !== 'FORCED_SWAP') {
        if (action.type === 'END_TURN') {
          // Turn ended, now it's player's turn after auto-advance
          set({ isAIThinking: false })
          return
        }
        setTimeout(processOneAction, 400)
      } else if (newState.phase === 'FORCED_SWAP' && newState.awaitingForcedSwap === 'player2') {
        setTimeout(processOneAction, 300)
      } else {
        set({ isAIThinking: false })
      }
    }

    setTimeout(processOneAction, 300)
  },

  resetGame: () => set({
    screen: 'title',
    playerCompany: null,
    playerWorkerIds: [],
    playerDeck: [],
    playerStartingUnit: 0,
    aiCompany: null,
    aiWorkerIds: [],
    aiDeck: [],
    gameState: null,
    isAIThinking: false,
  }),
}))

/** Get available actions for the current player */
export function useAvailableActions(): GameAction[] {
  const gameState = useGameStore((s) => s.gameState)
  if (!gameState) return []
  if (gameState.activePlayerId !== 'player1') return []
  return getAvailableActions(gameState)
}
