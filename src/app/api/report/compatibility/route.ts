import { type NextRequest, NextResponse } from "next/server"
import { forecastCache } from "@/lib/ai/cache"
import { GEMINI_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { generateCompatibilityPrompt, SYSTEM_INSTRUCTION } from "@/lib/ai/prompts"
import { calculateNumerologyData } from "@/lib/numerology/engine"
import type { Gender } from "@/lib/numerology/types"
import { generateCompatibilityPDF } from "@/lib/pdf/compatibility"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const name1 = searchParams.get("name1")
  const dob1 = searchParams.get("dob1")
  const gender1 = searchParams.get("gender1")
  const name2 = searchParams.get("name2")
  const dob2 = searchParams.get("dob2")
  const gender2 = searchParams.get("gender2")

  if (!name1 || !dob1 || !gender1 || !name2 || !dob2 || !gender2) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  try {
    const userNums = calculateNumerologyData(dob1, gender1 as Gender)
    const partnerNums = calculateNumerologyData(dob2, gender2 as Gender)

    if (!userNums || !partnerNums) {
      return NextResponse.json({ error: "Invalid birth data" }, { status: 400 })
    }

    // AI Analysis (Check Cache)
    const keys = [
      `${dob1}-${name1.trim().toLowerCase()}`,
      `${dob2}-${name2.trim().toLowerCase()}`,
    ].sort()
    const cacheKey = `compat-${keys.join("-")}`
    let analysis = forecastCache.get(cacheKey) as string

    if (!analysis) {
      const client = getGeminiClient()
      if (client) {
        try {
          const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: SYSTEM_INSTRUCTION,
          })
          const prompt = generateCompatibilityPrompt(
            { name: name1, moolank: userNums.moolank, bhagyank: userNums.bhagyank },
            { name: name2, moolank: partnerNums.moolank, bhagyank: partnerNums.bhagyank },
          )
          const result = await model.generateContent(prompt)
          analysis = await result.response.text()
          forecastCache.set(cacheKey, analysis)
        } catch (aiError) {
          console.error("Compatibility AI failed:", aiError)
          analysis =
            "Cosmic analysis currently unavailable. Focus on the core numbers and grids below."
        }
      } else {
        analysis =
          "AI analysis requires an API key. Please check the core compatibility numbers below."
      }
    }

    // Generate PDF
    const pdfBuffer = await generateCompatibilityPDF({
      user: { name: name1, dob: dob1, result: userNums },
      partner: { name: name2, dob: dob2, result: partnerNums },
      analysis: analysis,
    })

    const filename = `Compatibility_${name1}_${name2}`.replace(/[^a-zA-Z0-9]/g, "_")
    return new NextResponse(new Blob([new Uint8Array(pdfBuffer)]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Compatibility PDF Error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
