import { describe, expect, it } from "vitest"
import { NumerologyInputSchema } from "./types"

describe("Numerology Schemas", () => {
  it("should validate valid input", () => {
    const valid = { name: "John Doe", dob: "1990-01-01", gender: "Male" }
    expect(NumerologyInputSchema.safeParse(valid).success).toBe(true)
  })

  it("should reject invalid name", () => {
    const invalid = { name: "", dob: "1990-01-01", gender: "Male" }
    expect(NumerologyInputSchema.safeParse(invalid).success).toBe(false)
  })

  it("should reject invalid dob format", () => {
    const invalid = { name: "John", dob: "90-01-01", gender: "Male" }
    expect(NumerologyInputSchema.safeParse(invalid).success).toBe(false)
  })

  it("should reject invalid gender", () => {
    const invalid = { name: "John", dob: "1990-01-01", gender: "None" }
    expect(NumerologyInputSchema.safeParse(invalid).success).toBe(false)
  })
})
