import type { NumerologyResult } from "./types"

/**
 * Compatibility relationships for numbers 1-9.
 * Based on standard Vedic/Indian Numerology compatibility.
 */
const RELATIONSHIPS: Record<number, { friends: number[]; enemies: number[] }> = {
  1: { friends: [2, 3, 5, 7, 9], enemies: [6, 8] },
  2: { friends: [1, 3, 5], enemies: [2, 7] },
  3: { friends: [1, 2, 5, 7, 9], enemies: [4] },
  4: { friends: [1, 2, 5, 6, 7, 8, 9], enemies: [3, 4] },
  5: { friends: [1, 2, 3, 4, 6, 7, 8, 9], enemies: [] },
  6: { friends: [4, 5, 7, 8], enemies: [1] },
  7: { friends: [1, 3, 4, 5, 6, 8, 9], enemies: [2, 7] },
  8: { friends: [4, 5, 6, 7], enemies: [1, 8] },
  9: { friends: [1, 2, 3, 5, 7], enemies: [9] },
}

function getRelationshipScore(n1: number, n2: number): number {
  if (n1 === n2) {
    if (RELATIONSHIPS[n1].enemies.includes(n2)) return 0.2
    return 1.0 // Same number is usually a good match unless explicitly an enemy
  }
  if (RELATIONSHIPS[n1].friends.includes(n2)) return 1.0
  if (RELATIONSHIPS[n1].enemies.includes(n2)) return 0.2
  return 0.6 // Neutral
}

/**
 * Calculates a deterministic compatibility score (0-100) between two profiles.
 */
export function calculateCompatibilityScore(
  user: NumerologyResult,
  partner: NumerologyResult,
): number {
  // Weights
  const MOOLANK_WEIGHT = 40
  const BHAGYANK_WEIGHT = 40
  const SYNERGY_WEIGHT = 20

  // 1. Moolank Match
  const moolankScore = getRelationshipScore(user.moolank, partner.moolank) * MOOLANK_WEIGHT

  // 2. Bhagyank Match
  const bhagyankScore = getRelationshipScore(user.bhagyank, partner.bhagyank) * BHAGYANK_WEIGHT

  // 3. Grid Synergy (Completion)
  // How many of the 9 numbers are present if we combine both grids?
  const combinedNumbers = new Set([...user.gridNumbers, ...partner.gridNumbers])
  // Filter for valid Lo Shu numbers 1-9
  const validNumbers = Array.from(combinedNumbers).filter((n) => n >= 1 && n <= 9)
  const synergyScore = (validNumbers.length / 9) * SYNERGY_WEIGHT

  const totalScore = Math.round(moolankScore + bhagyankScore + synergyScore)

  return Math.min(100, Math.max(0, totalScore))
}
