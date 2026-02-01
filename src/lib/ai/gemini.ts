import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || ""

// Singleton instance to avoid re-initialization
let genAI: GoogleGenerativeAI | null = null

export function getGeminiClient() {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI features will be disabled or mocked.")
    return null
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }

  return genAI
}

export const GEMINI_MODEL = "gemini-2.0-flash"
