import { create } from 'zustand'
import type { GameState, GameAction } from '../types/index.ts'
import { createInitialGameState, getActiveUnit } from '../engine/GameState.ts'
import { WORKERS_BY_ID } from '../data/workers.ts'
import { applyAction, advanceToMainPhase } from '../engine/GameEngine.ts'
import { getAvailableActions } from '../engine/ActionValidator.ts'
import { getAIAction, aiSelectTeam, aiBuildDeck } from '../engine/AIOpponent.ts'
import { getAIEmote } from '../data/emotes.ts'
import { useToastStore } from '../components/Game/Toast.tsx'
import type { Company } from '../types/index.ts'

export type GameScreen = 'title' | 'team-select' | 'deck-build' | 'game' | 'game-over'

interface GameStore {
  // Navigation
  screen: GameScreen
  setScreen: (screen: GameScreen) => void

  // Pre-game state
  playerCompany: Company | null
  playerWorkerIds: string[]
  playerDeck: string[]
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
  startGame: () => void

  // Game actions
  dispatch: (action: GameAction) => void
  processAITurn: () => Promise<void>

  // Reset
  resetGame: () => void
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'title',
  setScreen: (screen) => set({ screen }),

  playerCompany: null,
  playerWorkerIds: [],
  playerDeck: [],
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
      set({ playerWorkerIds: playerWorkerIds.filter((id) => id !== workerId) })
    } else {
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
      const idx = playerDeck.indexOf(cardId)
      if (idx !== -1) {
        const newDeck = [...playerDeck]
        newDeck.splice(idx, 1)
        set({ playerDeck: newDeck })
      }
    } else if (count < 2 && playerDeck.length < 20) {
      set({ playerDeck: [...playerDeck, cardId] })
    }
  },

  startGame: () => {
    const { playerWorkerIds, playerDeck, aiWorkerIds, aiDeck } = get()
    const seed = Date.now()

    let state = createInitialGameState(
      playerWorkerIds as [string, string, string],
      playerDeck,
      aiWorkerIds as [string, string, string],
      aiDeck,
      seed,
    )

    state = advanceToMainPhase(state)
    set({ gameState: state, screen: 'game' })

    if (state.activePlayerId === 'player2') {
      setTimeout(() => get().processAITurn(), 800)
    }
  },

  dispatch: (action) => {
    const { gameState } = get()
    if (!gameState) return

    const newState = applyAction(gameState, action)
    set({ gameState: newState })

    if (newState.phase === 'GAME_OVER') {
      setTimeout(() => set({ screen: 'game-over' }), 1500)
      return
    }

    if (newState.activePlayerId === 'player2') {
      setTimeout(() => get().processAITurn(), 800)
    }
  },

  processAITurn: async () => {
    set({ isAIThinking: true })
    const addEntry = useToastStore.getState().addEntry

    // Initial thinking delay
    await delay(600 + Math.random() * 400)

    // Opening emote (30% chance per turn)
    const { gameState: startState } = get()
    if (startState && Math.random() < 0.3) {
      const aiPlayer = startState.players.player2!
      const aiActive = getActiveUnit(aiPlayer)
      const emote = getAIEmote(aiActive.workerId, 'greeting')
      addEntry(`🤖 "${emote}"`, 'emote')
      await delay(800)
    }

    let actionCount = 0

    const processOneAction = async () => {
      const { gameState } = get()
      if (!gameState || gameState.phase === 'GAME_OVER') {
        set({ isAIThinking: false })
        return
      }

      if (gameState.activePlayerId !== 'player2') {
        set({ isAIThinking: false })
        return
      }

      const action = getAIAction(gameState)
      const aiPlayer = gameState.players.player2!
      const aiActive = getActiveUnit(aiPlayer)
      const opPlayer = gameState.players.player1!
      const opActive = getActiveUnit(opPlayer)

      // Apply the action
      const newState = applyAction(gameState, action)
      set({ gameState: newState })

      // Post-action emotes
      if (actionCount === 0 || Math.random() < 0.25) {
        await delay(300 + Math.random() * 200)

        // Check if the action KO'd the opponent
        const newOpActive = getActiveUnit(newState.players.player1!)
        const didKO = opActive.currentHp > 0 && newOpActive.isKnockedOut

        if (didKO) {
          const emote = getAIEmote(aiActive.workerId, 'kill')
          addEntry(`🤖 "${emote}"`, 'emote')
          await delay(600)
        } else if (action.type === 'ATTACK' && Math.random() < 0.3) {
          const emote = getAIEmote(aiActive.workerId, 'attack')
          addEntry(`🤖 "${emote}"`, 'emote')
        } else if (action.type === 'USE_ABILITY' && Math.random() < 0.35) {
          const emote = getAIEmote(aiActive.workerId, 'ability')
          addEntry(`🤖 "${emote}"`, 'emote')
        } else if (action.type === 'PLAY_CARD' && Math.random() < 0.3) {
          const emote = getAIEmote(aiActive.workerId, 'card')
          addEntry(`🤖 "${emote}"`, 'emote')
        } else if (action.type === 'RETREAT' && Math.random() < 0.4) {
          const emote = getAIEmote(aiActive.workerId, 'retreat')
          addEntry(`🤖 "${emote}"`, 'emote')
        }
      }

      actionCount++

      if (newState.phase === 'GAME_OVER') {
        set({ isAIThinking: false })
        setTimeout(() => set({ screen: 'game-over' }), 1500)
        return
      }

      // Continue if AI still has actions
      if (newState.activePlayerId === 'player2') {
        if (action.type === 'END_TURN') {
          // Low HP emote when ending turn (20% chance)
          if (Math.random() < 0.2) {
            const newAiActive = getActiveUnit(newState.players.player2!)
            if (newAiActive.currentHp <= newAiActive.maxHp * 0.3) {
              const emote = getAIEmote(newAiActive.workerId, 'lowHp')
              addEntry(`🤖 "${emote}"`, 'emote')
            }
          }
          set({ isAIThinking: false })
          return
        }
        // Delay between AI multi-actions (thinking feel)
        await delay(500 + Math.random() * 500)
        await processOneAction()
      } else {
        set({ isAIThinking: false })
      }
    }

    await processOneAction()
  },

  resetGame: () => set({
    screen: 'title',
    playerCompany: null,
    playerWorkerIds: [],
    playerDeck: [],
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
