import { describe, it, expect } from 'vitest'
import { aiSelectTeam, aiBuildDeck, getAIAction } from '../AIOpponent.ts'
import { createInitialGameState } from '../GameState.ts'
import { applyAction, advanceToMainPhase } from '../GameEngine.ts'
import { validateAction } from '../ActionValidator.ts'
import { DECK_SIZE } from '../constants.ts'
import { ALL_WORKERS } from '../../data/workers.ts'

describe('AI Team Selection', () => {
  it('selects 3 workers from the same company', () => {
    const { workerIds, company } = aiSelectTeam([], 42)
    expect(workerIds).toHaveLength(3)
    for (const id of workerIds) {
      const worker = ALL_WORKERS.find((w) => w.id === id)
      expect(worker).toBeDefined()
      expect(worker!.company).toBe(company)
    }
  })

  it('avoids taken workers', () => {
    const taken = ALL_WORKERS.filter((w) => w.company === 'DELIVEROO').map((w) => w.id)
    const { workerIds, company } = aiSelectTeam(taken, 42)
    expect(company).not.toBe('DELIVEROO')
    for (const id of workerIds) {
      expect(taken).not.toContain(id)
    }
  })
})

describe('AI Deck Building', () => {
  it('builds a deck of exactly 15 cards', () => {
    const deck = aiBuildDeck('DELIVEROO')
    expect(deck).toHaveLength(DECK_SIZE)
  })
})

describe('AI Decision Making', () => {
  it('always produces a valid action', () => {
    let state = advanceToMainPhase(createInitialGameState(
      ['deliveroo-cyclist', 'deliveroo-moped', 'deliveroo-walker'],
      aiBuildDeck('DELIVEROO'),
      ['uber-driver', 'uber-eats-runner', 'uber-premium'],
      aiBuildDeck('UBER'),
      42,
    ))

    // Run 20 turns and verify AI always produces valid actions
    for (let i = 0; i < 40; i++) {
      if (state.phase === 'GAME_OVER') break

      const action = getAIAction(state)
      const validation = validateAction(state, action)
      expect(validation.valid).toBe(true)
      state = applyAction(state, action)
    }
  })
})

describe('AI vs AI Integration', () => {
  it('completes 100 games without errors', () => {
    const results = { player1Wins: 0, player2Wins: 0, totalTurns: 0 }

    for (let game = 0; game < 100; game++) {
      const seed = game * 1000 + 1

      // AI team selection
      const ai1 = aiSelectTeam([], seed)
      const ai2 = aiSelectTeam(ai1.workerIds, seed + 1)

      let state = createInitialGameState(
        ai1.workerIds,
        aiBuildDeck(ai1.company),
        ai2.workerIds,
        aiBuildDeck(ai2.company),
        seed + 2,
      )

      state = advanceToMainPhase(state)
      let turnCount = 0
      const maxTurns = 1000 // safety limit (actions, not turns)

      while (state.phase !== 'GAME_OVER' && turnCount < maxTurns) {
        const action = getAIAction(state)
        const validation = validateAction(state, action)

        if (!validation.valid) {
          throw new Error(
            `Game ${game}, turn ${turnCount}: AI produced invalid action ${JSON.stringify(action)}: ${validation.reason}`
          )
        }

        state = applyAction(state, action)
        turnCount++
      }

      if (state.phase === 'GAME_OVER') {
        if (state.winner === 'player1') results.player1Wins++
        else results.player2Wins++
        results.totalTurns += state.turnNumber
      }
    }

    // Verify games completed
    const totalGames = results.player1Wins + results.player2Wins
    expect(totalGames).toBe(100)

    // Average game length should be reasonable (not infinite loops)
    const avgTurns = results.totalTurns / 100
    expect(avgTurns).toBeGreaterThan(5)
    expect(avgTurns).toBeLessThan(50)
  }, 30000) // 30s timeout for 100 games
})
