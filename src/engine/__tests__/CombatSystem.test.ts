import { describe, it, expect } from 'vitest'
import { createInitialGameState, getActiveUnit, getWorkerData, getOpponentId } from '../GameState.ts'
import { applyAction, advanceToMainPhase } from '../GameEngine.ts'
import { getAvailableActions } from '../ActionValidator.ts'
import { applyStatusEffect } from '../CombatSystem.ts'
import type { GameState } from '../../types/index.ts'

function createTestGame(seed = 42): GameState {
  return advanceToMainPhase(createInitialGameState(
    ['deliveroo-cyclist', 'deliveroo-moped', 'deliveroo-walker'],
    Array(20).fill('hot-bag-toss'),
    ['uber-driver', 'uber-eats-runner', 'uber-premium'],
    Array(20).fill('energy-drink'),
    seed,
  ))
}

function setupWithMana(state: GameState, mana: number): GameState {
  const player = state.players[state.activePlayerId]!
  player.maxMana = mana
  player.currentMana = mana
  return state
}

/** Ensure the active player is the one with the given worker company */
function ensureActiveTeam(state: GameState, company: string): GameState {
  const worker = getWorkerData(getActiveUnit(state.players[state.activePlayerId]!))
  if (worker.company === company) return state
  // Switch by ending turn + auto advancing
  let s = applyAction(state, { type: 'END_TURN' })
  return setupWithMana(s, 10)
}

describe('Abilities', () => {
  it('basic ability costs mana and deals damage', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)
    state = ensureActiveTeam(state, 'DELIVEROO')

    const opponentId = getOpponentId(state.activePlayerId)
    const hpBefore = getActiveUnit(state.players[opponentId]!).currentHp

    // Deliveroo Cyclist's Hot Bag Slam: 1 mana, 4 damage (restatted)
    state = applyAction(state, { type: 'USE_ABILITY', abilityIndex: 0 })

    expect(getActiveUnit(state.players[opponentId]!).currentHp).toBe(hpBefore - 4)
    expect(state.players[state.activePlayerId]!.currentMana).toBe(9) // 10 - 1
  })

  it('cannot use same ability twice per turn', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    state = applyAction(state, { type: 'USE_ABILITY', abilityIndex: 0 })
    const actions = getAvailableActions(state)
    expect(actions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 0)).toBe(false)
  })

  it('can use basic AND ultimate in same turn', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    state = applyAction(state, { type: 'USE_ABILITY', abilityIndex: 0 })
    const actions = getAvailableActions(state)
    expect(actions.some((a) => a.type === 'USE_ABILITY' && a.abilityIndex === 1)).toBe(true)
  })

  it('can attack AND use ability in same turn', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    state = applyAction(state, { type: 'ATTACK' })
    const actions = getAvailableActions(state)
    expect(actions.some((a) => a.type === 'USE_ABILITY')).toBe(true)
  })
})

describe('Status Effects', () => {
  it('Poison applies via ability and ticks at start of turn', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)
    state = ensureActiveTeam(state, 'DELIVEROO')

    const opponentId = getOpponentId(state.activePlayerId)
    // Deliveroo Cyclist ult: 8 damage + Poison (2/tick) (restatted)
    state = applyAction(state, { type: 'USE_ABILITY', abilityIndex: 1 })

    const opUnit = getActiveUnit(state.players[opponentId]!)
    expect(opUnit.statusEffects.some((e) => e.type === 'POISON')).toBe(true)
    const hpAfterAbility = opUnit.currentHp

    // End our turn. Opponent takes action which triggers their start-of-turn (poison tick)
    state = applyAction(state, { type: 'END_TURN' })
    // Opponent acts — auto-advance processes their START_OF_TURN with poison
    state = applyAction(state, { type: 'ATTACK' })
    // Poison should have ticked (2 damage) before attack
    expect(getActiveUnit(state.players[opponentId]!).currentHp).toBe(hpAfterAbility - 2)
  })

  it('Shield absorbs damage', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    // Apply shield to active unit
    const myId = state.activePlayerId
    const unit = getActiveUnit(state.players[myId]!)
    unit.statusEffects.push({ type: 'SHIELD', potency: 20, duration: null })
    const hpBefore = unit.currentHp

    // End turn, opponent attacks us
    state = applyAction(state, { type: 'END_TURN' })
    state = setupWithMana(state, 10)
    const attackerData = getWorkerData(getActiveUnit(state.players[state.activePlayerId]!))
    state = applyAction(state, { type: 'ATTACK' })

    const myUnit = getActiveUnit(state.players[myId]!)
    // All damage absorbed by shield
    expect(myUnit.currentHp).toBe(hpBefore)
    expect(myUnit.statusEffects.find((e) => e.type === 'SHIELD')?.potency).toBe(20 - attackerData.attack)
  })

  it('Slow increases ability mana cost by 1', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    const unit = getActiveUnit(state.players[state.activePlayerId]!)
    const workerData = getWorkerData(unit)
    const basicCost = workerData.abilities[0]!.manaCost

    unit.statusEffects.push({ type: 'SLOW', potency: 1, duration: 2 })

    state = applyAction(state, { type: 'USE_ABILITY', abilityIndex: 0 })
    // Should cost basicCost + 1
    expect(state.players[state.activePlayerId]!.currentMana).toBe(10 - basicCost - 1)
  })

  it('Boost increases attack damage', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    const unit = getActiveUnit(state.players[state.activePlayerId]!)
    const workerData = getWorkerData(unit)
    unit.statusEffects.push({ type: 'BOOST', potency: 5, duration: 3 })

    const opponentId = getOpponentId(state.activePlayerId)
    const hpBefore = getActiveUnit(state.players[opponentId]!).currentHp

    state = applyAction(state, { type: 'ATTACK' })
    // base attack + 5 boost
    expect(getActiveUnit(state.players[opponentId]!).currentHp).toBe(hpBefore - workerData.attack - 5)
  })

  it('status effects refresh on reapply (no stacking)', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    const opponentId = getOpponentId(state.activePlayerId)
    const opUnit = getActiveUnit(state.players[opponentId]!)

    // Manually apply poison
    opUnit.statusEffects.push({ type: 'POISON', potency: 2, duration: null })
    expect(opUnit.statusEffects.filter((e) => e.type === 'POISON')).toHaveLength(1)

    // Apply poison again with different potency (simulating a second application)
    applyStatusEffect(opUnit, { type: 'POISON', potency: 5, duration: null })

    // Should still be 1 poison, with refreshed potency
    const poisons = opUnit.statusEffects.filter((e) => e.type === 'POISON')
    expect(poisons).toHaveLength(1)
    expect(poisons[0]!.potency).toBe(5)
  })

  it('timed effects decrement at end of turn', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    const myId = state.activePlayerId
    const unit = getActiveUnit(state.players[myId]!)
    unit.statusEffects.push({ type: 'BOOST', potency: 2, duration: 2 })

    state = applyAction(state, { type: 'END_TURN' })

    const unitAfter = state.players[myId]!.workers.find((w) =>
      w.statusEffects.some((e) => e.type === 'BOOST')
    )
    expect(unitAfter?.statusEffects.find((e) => e.type === 'BOOST')?.duration).toBe(1)
  })

  it('timed effects expire when duration reaches 0', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)

    const myId = state.activePlayerId
    const unit = getActiveUnit(state.players[myId]!)
    unit.statusEffects.push({ type: 'BOOST', potency: 2, duration: 1 })

    state = applyAction(state, { type: 'END_TURN' })

    const unitAfter = state.players[myId]!.workers.find((w) => w.workerId === unit.workerId)
    expect(unitAfter?.statusEffects.some((e) => e.type === 'BOOST')).toBe(false)
  })
})

describe('KO and Forced Swap', () => {
  it('KO triggers auto-swap when 1 bench unit remains', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)
    const opponentId = getOpponentId(state.activePlayerId)
    const opPlayer = state.players[opponentId]!

    // KO one bench unit
    const benchUnit = opPlayer.workers.find((_, i) => i !== opPlayer.activeUnitIndex)!
    benchUnit.currentHp = 0
    benchUnit.isKnockedOut = true

    // Set active to 1 HP
    getActiveUnit(opPlayer).currentHp = 1

    state = applyAction(state, { type: 'ATTACK' })
    // Should auto-swap to the remaining bench unit
    expect(getActiveUnit(state.players[opponentId]!).isKnockedOut).toBe(false)
  })

  it('game ends when all 3 units KO\'d', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)
    const opponentId = getOpponentId(state.activePlayerId)

    // KO both bench units
    for (const unit of state.players[opponentId]!.workers) {
      if (unit !== getActiveUnit(state.players[opponentId]!)) {
        unit.currentHp = 0
        unit.isKnockedOut = true
      }
    }
    getActiveUnit(state.players[opponentId]!).currentHp = 1

    state = applyAction(state, { type: 'ATTACK' })
    expect(state.phase).toBe('GAME_OVER')
    expect(state.winner).toBe(state.activePlayerId === 'player1' ? 'player1' : 'player2')
  })

  it('forced swap after KO brings in a healthy unit', () => {
    let state = createTestGame()
    state = setupWithMana(state, 10)
    const opponentId = getOpponentId(state.activePlayerId)
    const opPlayer = state.players[opponentId]!

    // KO one bench, set active to 1 HP
    let benchKOd = false
    for (let i = 0; i < opPlayer.workers.length; i++) {
      if (i !== opPlayer.activeUnitIndex && !benchKOd) {
        opPlayer.workers[i]!.currentHp = 0
        opPlayer.workers[i]!.isKnockedOut = true
        benchKOd = true
      }
    }
    getActiveUnit(opPlayer).currentHp = 1

    state = applyAction(state, { type: 'ATTACK' })
    expect(getActiveUnit(state.players[opponentId]!).isKnockedOut).toBe(false)
  })
})
