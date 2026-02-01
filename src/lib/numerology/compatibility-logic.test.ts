import { describe, it, expect } from "vitest"
import { calculateCompatibilityScore } from "./compatibility-logic"
import type { NumerologyResult } from "./types"

describe("compatibility-logic", () => {
  const user1: NumerologyResult = {
    moolank: 1,
    bhagyank: 1,
    kua: 4,
    gridNumbers: [1, 1, 4, 1]
  }

  const user2: NumerologyResult = {
    moolank: 1,
    bhagyank: 1,
    kua: 4,
    gridNumbers: [1, 1, 4, 1]
  }

  const user3: NumerologyResult = {
    moolank: 8,
    bhagyank: 8,
    kua: 2,
    gridNumbers: [8, 8, 2, 8]
  }

  it("returns a high score for identical friendly profiles", () => {
    const score = calculateCompatibilityScore(user1, user2)
    expect(score).toBeGreaterThan(80)
  })

  it("returns a lower score for clashing profiles", () => {
    // 1 and 8 are often considered clashing
    const score = calculateCompatibilityScore(user1, user3)
    expect(score).toBeLessThan(60)
  })

  it("is deterministic", () => {
    const score1 = calculateCompatibilityScore(user1, user3)
    const score2 = calculateCompatibilityScore(user1, user3)
    expect(score1).toBe(score2)
  })

  it("accounts for grid synergy (filling gaps)", () => {
    const personA: NumerologyResult = {
      moolank: 5,
      bhagyank: 5,
      kua: 5,
      gridNumbers: [5] // Missing everything but 5
    }
    const personB: NumerologyResult = {
      moolank: 5,
      bhagyank: 5,
      kua: 5,
      gridNumbers: [1, 2, 3, 4, 6, 7, 8, 9] // Fills all gaps of personA
    }
    const personC: NumerologyResult = {
      moolank: 5,
      bhagyank: 5,
      kua: 5,
      gridNumbers: [5] // Fills no gaps
    }

    const scoreWithSynergy = calculateCompatibilityScore(personA, personB)
    const scoreWithoutSynergy = calculateCompatibilityScore(personA, personC)

    expect(scoreWithSynergy).toBeGreaterThan(scoreWithoutSynergy)
  })
})
