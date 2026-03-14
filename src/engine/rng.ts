/**
 * Seeded PRNG using mulberry32 algorithm.
 * Deterministic: same seed + same call sequence = same results.
 */

export interface RNG {
  /** Returns a float in [0, 1) */
  next(): number
  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number
  /** Returns the current counter (for serialising RNG state) */
  getCounter(): number
}

function mulberry32(seed: number): () => number {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createRNG(seed: number, startCounter = 0): RNG {
  const gen = mulberry32(seed)
  let counter = 0

  // Advance to the starting counter position
  for (let i = 0; i < startCounter; i++) {
    gen()
    counter++
  }

  return {
    next() {
      counter++
      return gen()
    },
    nextInt(min: number, max: number) {
      const value = this.next()
      return Math.floor(value * (max - min + 1)) + min
    },
    getCounter() {
      return counter
    },
  }
}

/** Fisher-Yates shuffle using seeded RNG. Returns a new array. */
export function shuffle<T>(array: readonly T[], rng: RNG): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i)
    const temp = result[i]!
    result[i] = result[j]!
    result[j] = temp
  }
  return result
}
