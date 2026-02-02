"use server"

import { forecastCache } from "@/lib/ai/cache"
import { GEMINI_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { generateCompatibilityPrompt, SYSTEM_INSTRUCTION } from "@/lib/ai/prompts"
import { rateLimit } from "@/lib/ai/rate-limit"
import { calculateNumerologyData } from "@/lib/numerology/engine"
import type { Gender } from "@/lib/numerology/types"

const limiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 })

export interface ProfileInput {
  name: string
  dob: string
  gender: Gender
}

export async function getCompatibility(user: ProfileInput, partner: ProfileInput) {
  // 1. Calculate Numbers for both
  const userNums = calculateNumerologyData(user.dob, user.gender)
  const partnerNums = calculateNumerologyData(partner.dob, partner.gender)

  if (!userNums || !partnerNums) return { error: "Invalid birth data provided" }

  // 2. Check Cache
  // Key: sorted DOBs and normalized names to ensure A+B is same as B+A
  const keys = [
    `${user.dob}-${user.name.trim().toLowerCase()}`,
    `${partner.dob}-${partner.name.trim().toLowerCase()}`,
  ].sort()
  const cacheKey = `compat-${keys.join("-")}`

  if (forecastCache.has(cacheKey)) {
    return {
      analysis: forecastCache.get(cacheKey) as string,
      userNums,
      partnerNums,
      cached: true,
    }
  }

  // 3. Rate Limit
  const limitResult = limiter.check(5, "COMPAT_TOKEN")
  if (limitResult.isRateLimited) {
    return { error: "Rate limit exceeded. Please try again later." }
  }

  // 4. Generate AI Analysis
  const client = getGeminiClient()
  if (!client) {
    return { error: "AI service unavailable" }
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const prompt = generateCompatibilityPrompt(
      { name: user.name, moolank: userNums.moolank, bhagyank: userNums.bhagyank },
      { name: partner.name, moolank: partnerNums.moolank, bhagyank: partnerNums.bhagyank },
    )

    const result = await model.generateContent(prompt)
    const text = await result.response.text()

    forecastCache.set(cacheKey, text)

    return {
      analysis: text,
      userNums,
      partnerNums,
      cached: false,
    }
  } catch (error) {
    console.error("Compatibility AI Error:", error)
    return { error: "Failed to generate compatibility analysis" }
  }
}
