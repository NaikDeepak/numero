import PDFDocument from "pdfkit"
import { calculateCompatibilityScore } from "../numerology/compatibility-logic"
import { getMissingNumbers, getRemediesForNumbers } from "../numerology/remedies"
import type { NumerologyResult } from "../numerology/types"

interface CompatibilityPDFData {
  user: {
    name: string
    dob: string
    result: NumerologyResult
  }
  partner: {
    name: string
    dob: string
    result: NumerologyResult
  }
  analysis: string
}

export async function generateCompatibilityPDF(data: CompatibilityPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const buffers: Buffer[] = []

    doc.on("data", (chunk) => buffers.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(buffers)))
    doc.on("error", reject)

    // Colors
    const primaryColor = "#4F46E5"
    const secondaryColor = "#EC4899"
    const textColor = "#1F2937"
    const mutedColor = "#6B7280"
    const borderColor = "#E5E7EB"

    // Header
    doc.fontSize(24).fillColor(primaryColor).text("Numero", { align: "center" })
    doc.moveDown(0.2)
    doc
      .fontSize(10)
      .fillColor(mutedColor)
      .text("COSMIC COMPATIBILITY REPORT", { align: "center", characterSpacing: 2 })
    doc.moveDown(2)

    // Score Section
    const score = calculateCompatibilityScore(data.user.result, data.partner.result)
    doc.fontSize(14).fillColor(textColor).text("Compatibility Score", { align: "center" })
    doc.moveDown(0.5)

    let scoreColor = primaryColor
    if (score >= 80) scoreColor = "#10B981"
    else if (score < 50) scoreColor = "#EF4444"

    doc.fontSize(48).fillColor(scoreColor).text(`${score}%`, { align: "center" })
    doc.moveDown(1.5)

    // Profiles
    const profileY = doc.y
    const colWidth = (doc.page.width - 100 - 20) / 2

    // User Column
    doc
      .fontSize(14)
      .fillColor(primaryColor)
      .text(data.user.name, 50, profileY, { width: colWidth, align: "center" })
    doc
      .fontSize(10)
      .fillColor(mutedColor)
      .text(`DOB: ${data.user.dob}`, { width: colWidth, align: "center" })
    doc
      .fontSize(12)
      .fillColor(textColor)
      .text(`Moolank: ${data.user.result.moolank}  |  Bhagyank: ${data.user.result.bhagyank}`, {
        width: colWidth,
        align: "center",
      })

    // Partner Column
    doc
      .fontSize(14)
      .fillColor(secondaryColor)
      .text(data.partner.name, 50 + colWidth + 20, profileY, { width: colWidth, align: "center" })
    doc
      .fontSize(10)
      .fillColor(mutedColor)
      .text(`DOB: ${data.partner.dob}`, { width: colWidth, align: "center" })
    doc
      .fontSize(12)
      .fillColor(textColor)
      .text(
        `Moolank: ${data.partner.result.moolank}  |  Bhagyank: ${data.partner.result.bhagyank}`,
        { width: colWidth, align: "center" },
      )

    doc.moveDown(2)

    // Lo Shu Grids
    const gridY = doc.y
    const cellSize = 30
    const gridWidth = cellSize * 3
    const gridX1 = 50 + (colWidth - gridWidth) / 2
    const gridX2 = 50 + colWidth + 20 + (colWidth - gridWidth) / 2

    const renderGrid = (x: number, y: number, nums: number[]) => {
      const positions = [4, 9, 2, 3, 5, 7, 8, 1, 6]
      positions.forEach((num, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const cx = x + col * cellSize
        const cy = y + row * cellSize

        doc.rect(cx, cy, cellSize, cellSize).stroke(borderColor)

        if (nums.includes(num)) {
          doc
            .fontSize(12)
            .fillColor(textColor)
            .text(num.toString(), cx, cy + 8, { width: cellSize, align: "center" })
        } else {
          doc
            .fontSize(12)
            .fillColor("#DDDDDD")
            .text(num.toString(), cx, cy + 8, { width: cellSize, align: "center" })
        }
      })
    }

    const renderRemedies = (name: string, gridNumbers: number[]) => {
      const missing = getMissingNumbers(gridNumbers)
      const remedies = getRemediesForNumbers(missing)

      if (remedies.length > 0) {
        if (doc.y > 650) doc.addPage()

        doc.fontSize(16).fillColor(primaryColor).text(`Remedies for ${name}`, 50)
        doc.moveDown(1)

        remedies.forEach((r) => {
          if (doc.y > 700) doc.addPage()

          doc.fontSize(12).fillColor(textColor).text(`Number ${r.number}`, { underline: true })
          doc.fontSize(9).fillColor(mutedColor).text(r.impact[0])
          doc.moveDown(0.5)
          doc.fontSize(9).fillColor(textColor).text("Recommended:", { oblique: true })
          r.remedies.forEach((rem) => {
            doc.fontSize(9).text(`• ${rem}`, { indent: 10 })
          })
          doc.moveDown(1)
        })
      }
    }

    renderGrid(gridX1, gridY, data.user.result.gridNumbers)
    renderGrid(gridX2, gridY, data.partner.result.gridNumbers)

    doc.y = gridY + gridWidth + 30

    // Analysis
    doc.fontSize(16).fillColor(primaryColor).text("Synergy Analysis", 50)
    doc.moveDown(0.5)
    const cleanAnalysis = data.analysis.replace(/\*\*/g, "")
    doc.fontSize(10).fillColor(textColor).lineGap(2).text(cleanAnalysis, { align: "justify" })
    doc.moveDown(2)

    // Remedies
    renderRemedies(data.user.name, data.user.result.gridNumbers)
    renderRemedies(data.partner.name, data.partner.result.gridNumbers)

    // Footer
    doc
      .fontSize(8)
      .fillColor(mutedColor)
      .text("Generated by Numero AI • Professional Numerology Analysis", 50, doc.page.height - 50, {
        align: "center",
      })

    doc.end()
  })
}
