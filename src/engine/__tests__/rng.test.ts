import { describe, it, expect } from 'vitest'
import { createRNG, shuffle } from '../rng.ts'

describe('Seeded RNG', () => {
  it('produces deterministic output for same seed', () => {
    const rng1 = createRNG(42)
    const rng2 = createRNG(42)
    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next())
    }
  })

  it('produces different output for different seeds', () => {
    const rng1 = createRNG(42)
    const rng2 = createRNG(99)
    const results1 = Array.from({ length: 10 }, () => rng1.next())
    const results2 = Array.from({ length: 10 }, () => rng2.next())
    expect(results1).not.toEqual(results2)
  })

  it('nextInt returns values in range', () => {
    const rng = createRNG(42)
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(0, 10)
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(10)
    }
  })

  it('can resume from a counter position', () => {
    const rng1 = createRNG(42)
    // Advance 5 times
    for (let i = 0; i < 5; i++) rng1.next()
    const counter = rng1.getCounter()

    // Create new RNG starting at that counter
    const rng2 = createRNG(42, counter)

    // They should produce the same values from here
    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBe(rng2.next())
    }
  })
})

describe('Fisher-Yates shuffle', () => {
  it('produces deterministic shuffle for same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const rng1 = createRNG(42)
    const rng2 = createRNG(42)
    expect(shuffle(arr, rng1)).toEqual(shuffle(arr, rng2))
  })

  it('does not modify the original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const rng = createRNG(42)
    const shuffled = shuffle(arr, rng)
    expect(arr).toEqual([1, 2, 3, 4, 5])
    expect(shuffled).not.toEqual(arr) // very unlikely to be identical
  })

  it('contains the same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const rng = createRNG(42)
    const shuffled = shuffle(arr, rng)
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })
})
