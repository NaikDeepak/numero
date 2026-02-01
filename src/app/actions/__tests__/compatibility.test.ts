import { beforeEach, describe, expect, it, vi } from "vitest"
import { forecastCache } from "@/lib/ai/cache"
import { getGeminiClient } from "@/lib/ai/gemini"
import { calculateNumerologyData } from "@/lib/numerology/engine"
import { getCompatibility } from "../compatibility"

// Mock the dependencies
vi.mock("@/lib/numerology/engine", () => ({
  calculateNumerologyData: vi.fn(),
}))

vi.mock("@/lib/ai/gemini", () => ({
  getGeminiClient: vi.fn(),
  GEMINI_MODEL: "gemini-2.0-flash",
}))

vi.mock("@/lib/ai/prompts", () => ({
  generateCompatibilityPrompt: vi.fn(() => "mocked prompt"),
  SYSTEM_INSTRUCTION: "mocked instruction",
}))

vi.mock("@/lib/ai/cache", () => ({
  forecastCache: {
    has: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  },
}))

describe("getCompatibility Server Action", () => {
  const mockUser = { name: "Alice", dob: "1990-01-01", gender: "Female" as const }
  const mockPartner = { name: "Bob", dob: "1992-02-02", gender: "Male" as const }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return cached results if available", async () => {
    vi.mocked(calculateNumerologyData).mockReturnValue({
      moolank: 1,
      bhagyank: 2,
      kua: 5,
      gridNumbers: [1, 2],
    })
    vi.mocked(forecastCache.has).mockReturnValue(true)
    vi.mocked(forecastCache.get).mockReturnValue("cached analysis")

    const result = await getCompatibility(mockUser, mockPartner)

    expect(result).toEqual({
      analysis: "cached analysis",
      userNums: { moolank: 1, bhagyank: 2, kua: 5, gridNumbers: [1, 2] },
      partnerNums: { moolank: 1, bhagyank: 2, kua: 5, gridNumbers: [1, 2] },
      cached: true,
    })
    expect(forecastCache.get).toHaveBeenCalled()
  })

  it("should call Gemini API and cache the result if not cached", async () => {
    vi.mocked(calculateNumerologyData).mockReturnValueOnce({
      moolank: 1,
      bhagyank: 2,
      kua: 5,
      gridNumbers: [1, 2],
    })
    vi.mocked(calculateNumerologyData).mockReturnValueOnce({
      moolank: 3,
      bhagyank: 4,
      kua: 6,
      gridNumbers: [3, 4],
    })
    vi.mocked(forecastCache.has).mockReturnValue(false)

    const mockText = vi.fn().mockResolvedValue("ai analysis")
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: { text: mockText },
    })
    const mockModel = {
      generateContent: mockGenerateContent,
    }
    const mockClient = {
      getGenerativeModel: vi.fn().mockReturnValue(mockModel),
    }
    vi.mocked(getGeminiClient).mockReturnValue(mockClient as unknown as ReturnType<typeof getGeminiClient>)

    const result = await getCompatibility(mockUser, mockPartner)

    expect(result).toEqual({
      analysis: "ai analysis",
      userNums: { moolank: 1, bhagyank: 2, kua: 5, gridNumbers: [1, 2] },
      partnerNums: { moolank: 3, bhagyank: 4, kua: 6, gridNumbers: [3, 4] },
      cached: false,
    })
    expect(forecastCache.set).toHaveBeenCalled()
  })

  it("should return error if birth data is invalid", async () => {
    vi.mocked(calculateNumerologyData).mockReturnValue(null)

    const result = await getCompatibility(mockUser, mockPartner)

    expect(result).toEqual({ error: "Invalid birth data provided" })
  })
})
