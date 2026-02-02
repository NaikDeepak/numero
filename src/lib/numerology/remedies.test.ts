import { describe, expect, it } from "vitest"
import { getMissingNumbers, getRemediesForNumbers } from "./remedies"

describe("remedies logic", () => {
  describe("getMissingNumbers", () => {
    it("identifies missing numbers correctly", () => {
      const gridNumbers = [1, 5, 9]
      const missing = getMissingNumbers(gridNumbers)
      expect(missing).toEqual([2, 3, 4, 6, 7, 8])
    })

    it("returns empty array if all numbers are present", () => {
      const gridNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      const missing = getMissingNumbers(gridNumbers)
      expect(missing).toEqual([])
    })

    it("handles duplicates in gridNumbers", () => {
      const gridNumbers = [1, 1, 2, 2, 3]
      const missing = getMissingNumbers(gridNumbers)
      expect(missing).toEqual([4, 5, 6, 7, 8, 9])
    })
  })

  describe("getRemediesForNumbers", () => {
    it("returns correct remedies for missing numbers", () => {
      const missingNumbers = [1]
      const remedies = getRemediesForNumbers(missingNumbers)

      expect(remedies).toHaveLength(1)
      expect(remedies[0].number).toBe(1)
      expect(remedies[0].impact).toBeDefined()
      expect(remedies[0].remedies).toBeDefined()
      expect(remedies[0].remedies.length).toBeGreaterThan(0)
    })

    it("returns empty array for empty input", () => {
      const remedies = getRemediesForNumbers([])
      expect(remedies).toEqual([])
    })
  })
})
