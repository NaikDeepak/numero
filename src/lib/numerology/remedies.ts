import remediesData from "../../../api/data/missingNumberRemedies.json"

export interface Remedy {
  number: number
  impact: string[]
  remedies: string[]
}

/**
 * Identifies numbers (1-9) missing from the input grid numbers.
 */
export function getMissingNumbers(gridNumbers: number[]): number[] {
  const present = new Set(gridNumbers)
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !present.has(n))
}

/**
 * Maps numbers to their remedies from the JSON dataset.
 */
export function getRemediesForNumbers(numbers: number[]): Remedy[] {
  const data = remediesData as Record<string, { impact: string[]; remedies: string[] }>

  return numbers
    .map((num) => {
      const entry = data[num.toString()]
      if (!entry) return null
      return {
        number: num,
        impact: entry.impact,
        remedies: entry.remedies,
      }
    })
    .filter((r): r is Remedy => r !== null)
}
