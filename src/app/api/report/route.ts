import { type NextRequest, NextResponse } from "next/server"
import { forecastCache } from "@/lib/ai/cache"
import { GEMINI_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { generateReportPrompt, SYSTEM_INSTRUCTION } from "@/lib/ai/prompts"
import { calculateNumerologyData } from "@/lib/numerology/engine"
import type { Gender } from "@/lib/numerology/types"
import { generateNumerologyPDF } from "@/lib/pdf/generator"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const name = searchParams.get("name")
  const dob = searchParams.get("dob")
  const gender = searchParams.get("gender")

  if (!name || !dob || !gender) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    // 1. Calculate Numbers
    // We cast gender here because we can't easily validate it against the strict Zod Enum in a simple check
    // In a real app we'd want better validation
    const nums = calculateNumerologyData(dob, gender as Gender)
    if (!nums) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

    // 2. Get AI Analysis (Check Cache First)
    // Use a specific prefix for report cache to distinguish from daily forecasts
    const cacheKey = `report-v1-${dob}-${name.toLowerCase().trim()}`
    let analysis = forecastCache.get(cacheKey) as string

    if (!analysis) {
      const client = getGeminiClient()
      if (client) {
        try {
          const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: SYSTEM_INSTRUCTION,
          })
          const prompt = generateReportPrompt(
            name,
            dob,
            nums.moolank,
            nums.bhagyank,
            nums.gridNumbers,
          )
          const result = await model.generateContent(prompt)
          analysis = await result.response.text()
          forecastCache.set(cacheKey, analysis)
        } catch (aiError) {
          console.error("AI Generation failed:", aiError)
          analysis =
            "We could not generate the AI portion of your report at this time. Please try again later."
        }
      } else {
        analysis = "AI service is currently unavailable (API Key missing). Please contact support."
      }
    }

    // 3. Generate PDF
    const pdfBuffer = await generateNumerologyPDF({
      name,
      dob,
      moolank: nums.moolank,
      bhagyank: nums.bhagyank,
      aiAnalysis: analysis,
    })

    // 4. Return Stream
    return new NextResponse(new Blob([new Uint8Array(pdfBuffer)]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Numerology_Report_${name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Report Generation Error:", error)
    return NextResponse.json(
      { error: "Failed to generate report", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
