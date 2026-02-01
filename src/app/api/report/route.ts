import { NextRequest, NextResponse } from "next/server"
import { getGeminiClient, GEMINI_MODEL } from "@/lib/ai/gemini"
import { generateReportPrompt, SYSTEM_INSTRUCTION } from "@/lib/ai/prompts"
import { generateNumerologyPDF } from "@/lib/pdf/generator"
import { calculateNumerologyData } from "@/lib/numerology/engine"
import { forecastCache } from "@/lib/ai/cache"

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
    // Cast gender to expected type since we validated it exists, though strict validation would be better
    const nums = calculateNumerologyData(dob, gender as any)
    if (!nums) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

    // 2. Get AI Analysis (Check Cache First)
    const cacheKey = `report-${dob}-${name.toLowerCase().trim()}`
    let analysis = forecastCache.get(cacheKey) as string

    if (!analysis) {
      const client = getGeminiClient()
      if (client) {
        const model = client.getGenerativeModel({
          model: GEMINI_MODEL,
          systemInstruction: SYSTEM_INSTRUCTION
        })
        const prompt = generateReportPrompt(name, dob, nums.moolank, nums.bhagyank, nums.gridNumbers)
        const result = await model.generateContent(prompt)
        analysis = await result.response.text()
        forecastCache.set(cacheKey, analysis) // Cache report text
      } else {
        analysis = "AI service unavailable. Please try again later."
      }
    }

    // 3. Generate PDF
    const pdfBuffer = await generateNumerologyPDF({
      name,
      dob,
      moolank: nums.moolank,
      bhagyank: nums.bhagyank,
      aiAnalysis: analysis
    })

    // 4. Return Stream
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Numerology_Report_${name}.pdf"`
      }
    })

  } catch (error) {
    console.error("Report Generation Error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
