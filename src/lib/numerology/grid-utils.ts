import type { GridAnalysisResult, GridPatternDefinition } from "./types"

/**
 * Analyzes the Lo Shu grid numbers for predefined patterns (arrows and planes).
 * @param gridNumbers - Array of numbers present in the grid (can have duplicates).
 * @param definitions - Array of definitions for patterns.
 * @returns Array of analysis results for found patterns.
 */
export function analyzeGrid(
  gridNumbers: number[],
  definitions: GridPatternDefinition[],
): GridAnalysisResult[] {
  if (!gridNumbers || gridNumbers.length === 0 || !definitions || definitions.length === 0) {
    return []
  }

  // Create a Set of unique, valid numbers present in the grid
  const presentNumbers = new Set(
    gridNumbers.map((n) => Math.floor(n)).filter((n) => !Number.isNaN(n) && n >= 1 && n <= 9),
  )

  const analysisResults: GridAnalysisResult[] = []

  for (const def of definitions) {
    let conditionMet = false

    if (def.type === "presence") {
      // Check if ALL required numbers are present in the grid set
      conditionMet = def.numbers.every((num) => presentNumbers.has(num))
    } else if (def.type === "absence") {
      // Check if ALL specified numbers are ABSENT from the grid set
      conditionMet = def.numbers.every((num) => !presentNumbers.has(num))
    }

    if (conditionMet) {
      analysisResults.push({
        name: def.name,
        category: def.category,
        interpretation: def.interpretation,
        numbers: def.numbers,
      })
    }
  }

  return analysisResults
}
