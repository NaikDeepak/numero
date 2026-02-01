import { z } from "zod"

// --- Schemas ---

export const MoolankMeaningSchema = z.object({
  number: z.number(),
  dates: z.array(z.number()),
  grah: z.string(),
  rashi: z.string(),
  antiNumber: z.array(z.number()),
  goodCombination: z.array(z.number()).optional(),
  keywords: z.array(z.string()),
  characteristics: z.array(z.string()),
  analysis: z.string(),
  negativeTraits: z.array(z.string()),
  suggestions: z.array(z.string()),
})

export const MoolankMeaningsMapSchema = z.record(z.string(), MoolankMeaningSchema)

export const GridAnalysisDefinitionSchema = z.object({
  name: z.string(),
  category: z.string(),
  numbers: z.array(z.number()),
  type: z.string(),
  interpretation: z.string(),
})

export const GridAnalysisDefinitionsSchema = z.array(GridAnalysisDefinitionSchema)

// --- Types ---

export type MoolankMeaning = z.infer<typeof MoolankMeaningSchema>
export type GridAnalysisDefinition = z.infer<typeof GridAnalysisDefinitionSchema>

// --- Loader ---

/**
 * Data loader for numerology interpretations.
 * In a real Next.js app, we might want to fetch these from /public/data
 * or import them directly if they are small enough.
 * For now, we'll provide a way to inject data or load it.
 */
class NumerologyDataLoader {
  private moolankMeanings: Record<string, MoolankMeaning> | null = null
  private gridAnalysis: GridAnalysisDefinition[] | null = null

  async loadData(moolankData: unknown, gridData: unknown) {
    this.moolankMeanings = MoolankMeaningsMapSchema.parse(moolankData)
    this.gridAnalysis = GridAnalysisDefinitionsSchema.parse(gridData)
  }

  getMoolankMeaning(num: number): MoolankMeaning | undefined {
    if (!this.moolankMeanings) {
      throw new Error("Data not loaded. Call loadData first.")
    }
    return this.moolankMeanings[num.toString()]
  }

  getGridAnalysis(): GridAnalysisDefinition[] {
    if (!this.gridAnalysis) {
      throw new Error("Data not loaded. Call loadData first.")
    }
    return this.gridAnalysis
  }
}

export const dataLoader = new NumerologyDataLoader()

/**
 * Helper to initialize the data loader with provided JSON data.
 * This can be used in both SSR and Client components.
 */
export function initDataLoader(moolankData: unknown, gridData: unknown) {
  dataLoader.loadData(moolankData, gridData)
}
