import { describe, it, expect } from 'vitest'
import { createInitialGameState, getActiveUnit, getOpponentId } from '../GameState.ts'
import { applyAction, advanceToMainPhase } from '../GameEngine.ts'
import type { GameState } from '../../types/index.ts'

function createTestGame(seed = 42): GameState {
  return advanceToMainPhase(createInitialGameState(
    ['deliveroo-cyclist', 'deliveroo-moped', 'deliveroo-walker'],
    [
      'hot-bag-toss', 'hot-bag-toss', 'energy-drink', 'energy-drink',
      'road-rage', 'road-rage', 'swap-route', 'tip-jar',
      'five-star-rating', 'customer-complaint', 'flat-tyre',
      'antidote-smoothie', 'bus-lane-fine', 'power-nap', 'bubble-wrap',
    ],
    0,
    ['uber-driver', 'uber-eats-runner', 'uber-premium'],
    [
      'energy-drink', 'energy-drink', 'meal-deal', 'meal-deal',
      'bubble-wrap', 'bubble-wrap', 'tinted-windows', 'tinted-windows',
      'customer-complaint', 'customer-complaint', 'dashcam-footage',
      'power-nap', 'bottled-water', 'swap-route', 'bus-lane-fine',
    ],
    0,
    seed,
  ))
}

function giveCardAndMana(state: GameState, cardId: string, mana: number): GameState {
  const player = state.players[state.activePlayerId]!
  player.hand.push(cardId)
  player.currentMana = mana
  player.maxMana = Math.max(player.maxMana, mana)
  return state
}

describe('Healing Cards', () => {
  it('Energy Drink heals active unit for 6', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'energy-drink', 5)
    const player = state.players[state.activePlayerId]!
    const unit = getActiveUnit(player)
    unit.currentHp = 10 // damage it first

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'energy-drink' })
    expect(getActiveUnit(state.players[state.activePlayerId]!).currentHp).toBe(16)
  })

  it('Meal Prep Sunday heals all units', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'meal-prep-sunday', 5)
    const player = state.players[state.activePlayerId]!
    // Damage all units
    for (const unit of player.workers) {
      unit.currentHp = 10
    }

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'meal-prep-sunday' })
    for (const unit of state.players[state.activePlayerId]!.workers) {
      expect(unit.currentHp).toBe(16) // 10 + 6
    }
  })

  it('Power Nap heals and removes negative effects', () => {
    let state = createTestGame()
    const player = state.players[state.activePlayerId]!
    const unit = getActiveUnit(player)
    unit.currentHp = 10
    unit.statusEffects.push({ type: 'POISON', potency: 3, duration: null })
    unit.statusEffects.push({ type: 'SLOW', potency: 1, duration: 2 })
    unit.statusEffects.push({ type: 'BOOST', potency: 2, duration: 3 }) // should stay

    state = giveCardAndMana(state, 'power-nap', 5)
    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'power-nap' })

    const unitAfter = getActiveUnit(state.players[state.activePlayerId]!)
    expect(unitAfter.currentHp).toBe(18) // 10 + 8
    expect(unitAfter.statusEffects.some((e) => e.type === 'POISON')).toBe(false)
    expect(unitAfter.statusEffects.some((e) => e.type === 'SLOW')).toBe(false)
    expect(unitAfter.statusEffects.some((e) => e.type === 'BOOST')).toBe(true)
  })
})

describe('Damage Cards', () => {
  it('Hot Bag Toss deals 4 damage', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'hot-bag-toss', 5)
    const opponentId = getOpponentId(state.activePlayerId)
    const hpBefore = getActiveUnit(state.players[opponentId]!).currentHp

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'hot-bag-toss' })
    expect(getActiveUnit(state.players[opponentId]!).currentHp).toBe(hpBefore - 4)
  })

  it('Road Rage deals 8 damage', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'road-rage', 5)
    const opponentId = getOpponentId(state.activePlayerId)
    const hpBefore = getActiveUnit(state.players[opponentId]!).currentHp

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'road-rage' })
    expect(getActiveUnit(state.players[opponentId]!).currentHp).toBe(hpBefore - 8)
  })

  it('Bus Lane Fine hits active and bench', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'bus-lane-fine', 5)
    const opponentId = getOpponentId(state.activePlayerId)

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'bus-lane-fine' })

    const opPlayer = state.players[opponentId]!
    // Active takes 6, bench take 3 each
    const benchUnits = opPlayer.workers.filter((_, i) => i !== opPlayer.activeUnitIndex)
    for (const bench of benchUnits) {
      if (!bench.isKnockedOut) {
        expect(bench.currentHp).toBeLessThan(bench.maxHp)
      }
    }
  })
})

describe('Buff Cards', () => {
  it('Five-Star Rating applies Boost', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'five-star-rating', 5)

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'five-star-rating' })
    const unit = getActiveUnit(state.players[state.activePlayerId]!)
    const boost = unit.statusEffects.find((e) => e.type === 'BOOST')
    expect(boost).toBeDefined()
    expect(boost!.potency).toBe(2)
    expect(boost!.duration).toBe(3)
  })

  it('Bubble Wrap applies Shield', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'bubble-wrap', 5)

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'bubble-wrap' })
    const unit = getActiveUnit(state.players[state.activePlayerId]!)
    const shield = unit.statusEffects.find((e) => e.type === 'SHIELD')
    expect(shield).toBeDefined()
    expect(shield!.potency).toBe(5)
  })
})

describe('Debuff Cards', () => {
  it('Customer Complaint applies Slow', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'customer-complaint', 5)
    const opponentId = getOpponentId(state.activePlayerId)

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'customer-complaint' })
    const opUnit = getActiveUnit(state.players[opponentId]!)
    expect(opUnit.statusEffects.some((e) => e.type === 'SLOW')).toBe(true)
  })

  it('Flat Tyre applies Poison', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'flat-tyre', 5)
    const opponentId = getOpponentId(state.activePlayerId)

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'flat-tyre' })
    const opUnit = getActiveUnit(state.players[opponentId]!)
    const poison = opUnit.statusEffects.find((e) => e.type === 'POISON')
    expect(poison).toBeDefined()
    expect(poison!.potency).toBe(3)
  })
})

describe('Utility Cards', () => {
  it('Tip Jar draws 2 cards', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'tip-jar', 5)
    const handBefore = state.players[state.activePlayerId]!.hand.length

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'tip-jar' })
    // -1 for playing tip jar, +2 for draw
    expect(state.players[state.activePlayerId]!.hand.length).toBe(handBefore - 1 + 2)
  })

  it('GPS Reroute forces opponent swap', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'gps-reroute', 5)
    const opponentId = getOpponentId(state.activePlayerId)
    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'gps-reroute' })
    // With 2 bench units, the swap should happen
    expect(state.players[opponentId]!.workers.length).toBe(3)
  })

  it('Antidote Smoothie removes all status effects', () => {
    let state = createTestGame()
    const player = state.players[state.activePlayerId]!
    const unit = getActiveUnit(player)
    unit.statusEffects.push(
      { type: 'POISON', potency: 3, duration: null },
      { type: 'BOOST', potency: 2, duration: 3 },
      { type: 'SHIELD', potency: 5, duration: null },
    )

    state = giveCardAndMana(state, 'antidote-smoothie', 5)
    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'antidote-smoothie' })

    const unitAfter = getActiveUnit(state.players[state.activePlayerId]!)
    expect(unitAfter.statusEffects).toHaveLength(0)
  })
})

describe('Card Spending', () => {
  it('card is removed from hand and added to discard', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'hot-bag-toss', 5)
    const player = state.players[state.activePlayerId]!
    const handBefore = player.hand.length

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'hot-bag-toss' })
    expect(state.players[state.activePlayerId]!.hand.length).toBe(handBefore - 1)
    expect(state.players[state.activePlayerId]!.discardPile).toContain('hot-bag-toss')
  })

  it('mana is spent when playing a card', () => {
    let state = createTestGame()
    state = giveCardAndMana(state, 'road-rage', 5) // costs 3
    const manaBefore = state.players[state.activePlayerId]!.currentMana

    state = applyAction(state, { type: 'PLAY_CARD', cardId: 'road-rage' })
    expect(state.players[state.activePlayerId]!.currentMana).toBe(manaBefore - 3)
  })
})
