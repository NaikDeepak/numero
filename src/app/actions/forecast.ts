"use server"

import { forecastCache } from "@/lib/ai/cache"
import { GEMINI_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { generateDailyForecastPrompt, SYSTEM_INSTRUCTION } from "@/lib/ai/prompts"
import { rateLimit } from "@/lib/ai/rate-limit"
import {
  calculateNumerologyData,
  calculatePersonalDay,
  calculatePersonalMonth,
  calculatePersonalYear,
} from "@/lib/numerology/engine"
import type { Gender } from "@/lib/numerology/types"

// Initialize rate limiter: 5 requests per minute per IP (mocking IP with simple string for now in server actions)
const limiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 })

export async function getDailyForecast(dob: string, gender: Gender) {
  // 1. Calculate Numbers
  const nums = calculateNumerologyData(dob, gender)
  if (!nums) return { error: "Invalid birth data" }

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()

  const [, birthMonth, birthDay] = dob.split("-").map(Number)

  const personalYear = calculatePersonalYear(birthDay, birthMonth, currentYear)
  const personalMonth = calculatePersonalMonth(personalYear, currentMonth)
  const personalDayNum = calculatePersonalDay(personalMonth, currentDay)

  // 2. Check Cache
  const dateKey = `${currentYear}-${currentMonth}-${currentDay}`
  const cacheKey = `${dateKey}-${nums.moolank}-${nums.bhagyank}`

  if (forecastCache.has(cacheKey)) {
    return {
      forecast: forecastCache.get(cacheKey) as string,
      personalDay: personalDayNum,
      cached: true,
    }
  }

  // 3. Rate Limit
  // In a real app we'd get IP or Session ID. For V1 MVP, we'll use a placeholder since we don't have auth yet in this context
  const limitResult = limiter.check(5, "CACHE_TOKEN") // Global limit for now to prevent abuse
  if (limitResult.isRateLimited) {
    return { error: "Rate limit exceeded. Please try again later." }
  }

  // 4. Generate with AI
  const client = getGeminiClient()
  if (!client) {
    return {
      forecast: `AI service unavailable. Today is Personal Day ${personalDayNum}`,
      personalDay: personalDayNum,
    }
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const prompt = generateDailyForecastPrompt(
      personalDayNum,
      nums.moolank,
      nums.bhagyank,
      today.toDateString(),
    )

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // 5. Cache result
    forecastCache.set(cacheKey, text)

    return {
      forecast: text,
      personalDay: personalDayNum,
      cached: false,
    }
  } catch (error) {
    console.error("AI Generation Error:", error)
    return { error: "Failed to generate forecast" }
  }
}
