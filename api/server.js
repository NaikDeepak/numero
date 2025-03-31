import express from "express"
import cors from "cors"
import PDFDocument from "pdfkit"
import { createRequire } from 'module'; // Import createRequire
import { fileURLToPath } from 'url';
import path from 'path';
import {
    calculateNumerologyData,
    calculatePersonalYear,
    calculatePersonalMonth,
    calculatePersonalDay,
    calculateCompatibilityScore,
    calculateTimeFactorScore
} from './utils/numerologyUtils.js';

// --- Load JSON Data using createRequire ---
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to resolve path and require JSON safely
function loadJsonData(relativePath) {
  try {
    const absolutePath = path.resolve(__dirname, relativePath);
    return require(absolutePath);
  } catch (error) {
    console.error(`Error loading JSON data from ${relativePath}:`, error);
    return {}; // Return empty object on error
  }
}

const houseMeanings = loadJsonData('./data/houseMeanings.json');
const moolankBhagyankRelations = loadJsonData('./data/moolankBhagyankRelations.json');
const missingNumberRemedies = loadJsonData('./data/missingNumberRemedies.json');
const repeatingNumberImpact = loadJsonData('./data/repeatingNumberImpact.json');
const compatibilityData = loadJsonData('./data/compatibilityData.json'); // Load compatibility data
const iplTeamsData = loadJsonData('./data/iplTeams.json'); // Load IPL team data
// --- End JSON Data Loading ---


const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()) // Enable CORS for all origins (adjust for production)
app.use(express.json()) // Parse JSON request bodies

// API Endpoint for Numerology Calculation
app.post("/api/calculate", (req, res) => {
  const { dob, gender } = req.body

  // Basic validation for presence of dob and gender
  if (!dob || !gender) {
    return res.status(400).json({ error: "Missing required fields: dob and gender" })
  }

  try {
    const numerologyData = calculateNumerologyData(dob, gender)

    if (numerologyData) {
      // Return only the calculation data, report generation moved to separate endpoint
      res.json(numerologyData)
    } else {
      // calculateNumerologyData returns null for invalid input format/values
      res.status(400).json({ error: "Invalid input data provided (e.g., date format, values)." })
    }
  } catch (error) {
    console.error("Calculation error:", error)
    res.status(500).json({ error: "An internal server error occurred during calculation." })
  }
})

// --- NEW: API Endpoint for PDF Report Generation ---
// PDFDocument import moved to top

app.get("/api/report/pdf", (req, res) => {
  const { dob, gender } = req.query // Get data from query parameters

  // Basic validation
  if (!dob || !gender) {
    return res.status(400).json({ error: "Missing required query parameters: dob and gender" })
  }

  try {
    const numerologyData = calculateNumerologyData(dob, gender)

    if (!numerologyData) {
      return res.status(400).json({ error: "Invalid input data provided (e.g., date format, values)." })
    }

    // JSON data is now loaded globally, no need to load it here.

    // --- PDF Styling Constants ---
    const colors = {
      primary: "#ff8c00", // Dark Orange (from CSS)
      secondary: "#a0522d", // Sienna/Brown (from CSS light mode)
      text: "#333333",
      muted: "#666666",
      gridLine: "#cccccc",
      gridText: "#111111",
      gridBg: "#f9f9f9", // Light background for grid cells
      heading: "#111111", // Near black for main headings
    }
    const fonts = {
      heading: "Helvetica-Bold",
      subheading: "Helvetica-Bold",
      body: "Helvetica",
      bodyBold: "Helvetica-Bold",
    }
    const margin = 50

    // Create a new PDF document
    const doc = new PDFDocument({ size: "A4", margin: margin })

    // Set headers for PDF download
    const filename = `Numerology_Report_${dob.replace(/-/g, "")}.pdf`
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)

    // Pipe the PDF document directly to the response stream
    doc.pipe(res)

    // --- PDF Content Generation ---

    // Header
    doc
      .font(fonts.heading)
      .fontSize(20)
      .fillColor(colors.heading)
      .text("Numerology Insights Report", { align: "center" })
    doc.moveDown(0.5)
    doc
      .font(fonts.body)
      .fontSize(12)
      .fillColor(colors.muted)
      .text(`For Date of Birth: ${dob} (${gender})`, { align: "center" })
    doc.moveDown(2)

    // --- Section Helper ---
    const addSection = (title, contentFn) => {
      doc.font(fonts.subheading).fontSize(14).fillColor(colors.secondary).text(title, { underline: true })
      doc.moveDown(0.7)
      doc.font(fonts.body).fontSize(10).fillColor(colors.text) // Reset font for content
      contentFn()
      doc.moveDown(1.5)
    }

    // --- Draw Lo Shu Grid Function ---
    const drawLoShuGrid = (gridNumbers, startX, startY, cellSize = 30, gap = 3) => {
      const positionMap = { 4: 0, 9: 1, 2: 2, 3: 3, 5: 4, 7: 5, 8: 6, 1: 7, 6: 8 }
      let cells = Array(9).fill("")
      const counts = {}

      if (gridNumbers && Array.isArray(gridNumbers)) {
        gridNumbers.forEach((num) => {
          counts[num] = (counts[num] || 0) + 1
          if (num !== 0 && positionMap.hasOwnProperty(num)) {
            let cellIndex = positionMap[num]
            // Append number, potentially multiple times if repeated
            cells[cellIndex] += (cells[cellIndex] ? " " : "") + num
          }
        })
      }

      doc.save() // Save current style state
      doc.lineWidth(0.5).strokeColor(colors.gridLine)

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const cellIndex = row * 3 + col
          const x = startX + col * (cellSize + gap)
          const y = startY + row * (cellSize + gap)

          // Draw cell background and border
          doc.rect(x, y, cellSize, cellSize).fillAndStroke(colors.gridBg, colors.gridLine)

          // Draw cell content (numbers)
          if (cells[cellIndex]) {
            doc
              .font(fonts.bodyBold)
              .fontSize(10)
              .fillColor(colors.gridText)
              .text(cells[cellIndex], x, y + cellSize / 2 - 5, {
                // Adjust vertical position
                width: cellSize,
                align: "center",
              })
          }
        }
      }
      doc.restore() // Restore previous style state
      return startY + 3 * cellSize + 2 * gap // Return Y position after the grid
    }

    // --- Report Sections ---
    const { moolank, bhagyank, kua, gridNumbers } = numerologyData

    // 1. Basic Numbers & Grid
    addSection("Core Numbers & Lo Shu Grid", () => {
      const gridStartY = doc.y
      const gridStartX = doc.page.width / 2 - (3 * 30 + 2 * 3) / 2 // Center the grid
      const gridEndY = drawLoShuGrid(gridNumbers, gridStartX, gridStartY)

      // Place text next to or below grid
      const textStartY = gridStartY // Start text at the same Y as grid
      const textStartX = margin
      const textWidth = gridStartX - margin - 20 // Width for text column

      doc.font(fonts.bodyBold).text("Moolank:", textStartX, textStartY, { width: textWidth })
      doc.font(fonts.body).text(`${moolank} (${houseMeanings[moolank] || "N/A"})`, { width: textWidth })
      doc.moveDown(0.5)

      doc.font(fonts.bodyBold).text("Bhagyank:", textStartX, doc.y, { width: textWidth })
      doc.font(fonts.body).text(`${bhagyank} (${houseMeanings[bhagyank] || "N/A"})`, { width: textWidth })
      doc.moveDown(0.5)

      doc.font(fonts.bodyBold).text("Kua Number:", textStartX, doc.y, { width: textWidth })
      doc.font(fonts.body).text(`${kua}`, { width: textWidth })

      // Ensure content after this section starts below the grid
      doc.y = Math.max(doc.y, gridEndY) + 10 // Add some padding below grid/text
    })

    // 2. Moolank-Bhagyank Relationship
    addSection(`Moolank-Bhagyank (${moolank}-${bhagyank}) Relationship`, () => {
      if (moolankBhagyankRelations[moolank] && moolankBhagyankRelations[moolank][bhagyank]) {
        const relation = moolankBhagyankRelations[moolank][bhagyank]
        doc.font(fonts.bodyBold).text("Rating: ", { continued: true })
        doc.font(fonts.body).text(relation.rating || "N/A")
        doc.font(fonts.bodyBold).text("Indication: ", { continued: true })
        doc.font(fonts.body).text(relation.indication || "N/A")
      } else {
        doc.text("No specific data found for this combination.")
      }
    })

    // 3. Repeating Numbers Impact
    addSection("Impact of Repeating Numbers", () => {
      const counts = {}
      if (gridNumbers && Array.isArray(gridNumbers)) {
        gridNumbers.forEach((num) => {
          counts[num] = (counts[num] || 0) + 1
        })
      }
      let repeatingFound = false
      for (const num in counts) {
        if (counts[num] > 1) {
          const repeatSequence = num.toString().repeat(counts[num])
          if (repeatingNumberImpact[repeatSequence]) {
            doc.font(fonts.bodyBold).text(`- ${repeatSequence}: `, { continued: true })
            doc.font(fonts.body).text(repeatingNumberImpact[repeatSequence])
            repeatingFound = true
          }
        }
      }
      if (!repeatingFound) {
        doc.text("No significant repeating number patterns found with specific impacts in the data.")
      }
    })

    // 4. Missing Numbers Analysis
    addSection("Missing Numbers Analysis", () => {
      const presentNumbers = new Set(gridNumbers)
      let missingFound = false
      for (let i = 1; i <= 9; i++) {
        if (!presentNumbers.has(i)) {
          missingFound = true
          const numStr = i.toString()
          doc.font(fonts.bodyBold).text(`Missing Number ${numStr}:`)
          if (missingNumberRemedies[numStr]) {
            doc.font(fonts.body).text(`  Impact: ${missingNumberRemedies[numStr].impact.join(" ")}`)
            doc.font(fonts.bodyBold).text(`  Remedies: `, { continued: true })
            doc.font(fonts.body).text(missingNumberRemedies[numStr].remedies.join("; "))
          } else {
            doc.font(fonts.body).text("  No specific impact/remedy data found.")
          }
          doc.moveDown(0.5)
        }
      }
      if (!missingFound) {
        doc.text("No missing numbers (1-9) found in the chart.")
      }
    })

    // --- Finalize PDF ---
    doc.end()
  } catch (error) {
    console.error("PDF Generation error:", error)
    // Avoid sending partial PDF if error occurs mid-stream
    if (!res.headersSent) {
      res.status(500).json({ error: "An internal server error occurred during PDF generation." })
    } else {
      // If headers already sent, we might just have to end the response abruptly
      res.end()
    }
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Numerology API server listening on port ${port}`)
})

// --- NEW: API Endpoint for Team Win Percentage ---
app.post('/api/win-percentage', (req, res) => {
    const { teamKey, matchDate } // Expect team key (e.g., "CSK") and match date "YYYY-MM-DD"
        = req.body;

    // --- Input Validation ---
    if (!teamKey || !matchDate) {
        return res.status(400).json({ error: 'Missing required fields: teamKey and matchDate' });
    }

    const teamInfo = iplTeamsData[teamKey];
    if (!teamInfo) {
        return res.status(404).json({ error: `Team data not found for key: ${teamKey}` });
    }

    const matchDateParts = matchDate.split('-');
    if (matchDateParts.length !== 3) {
        return res.status(400).json({ error: 'Invalid matchDate format. Expected YYYY-MM-DD.' });
    }
    const [matchYear, matchMonth, matchDay] = matchDateParts.map(p => parseInt(p, 10));
     if (isNaN(matchYear) || isNaN(matchMonth) || isNaN(matchDay)) {
         return res.status(400).json({ error: 'Invalid date components in matchDate.' });
     }
     const matchDateParsed = { day: matchDay, month: matchMonth, year: matchYear };


    try {
        // --- Calculate Base Numbers ---
        const teamNumbers = calculateNumerologyData(teamInfo.dob, 'Neutral'); // Gender might not apply to team DOB
        const captainNumbers = calculateNumerologyData(teamInfo.captainDob, 'Neutral'); // Assume neutral or fetch actual gender if needed
        const matchNumbers = calculateNumerologyData(matchDate, 'Neutral');

        if (!teamNumbers || !captainNumbers || !matchNumbers) {
            console.error("Failed to calculate base numbers for team, captain, or match date.");
            return res.status(500).json({ error: 'Internal error during number calculation.' });
        }

        // --- Calculate Compatibility Scores (CCS & TCS) ---
        const ccs = calculateCompatibilityScore(captainNumbers, matchNumbers, compatibilityData);
        const tcs = calculateCompatibilityScore(teamNumbers, matchNumbers, compatibilityData);

        // --- Calculate Time Factor Scores ---
        // Helper to parse DOB string into parts
        const parseDob = (dobString) => {
            const parts = dobString.split('-');
            return { day: parseInt(parts[2], 10), month: parseInt(parts[1], 10), year: parseInt(parts[0], 10) };
        };
        const teamDobParts = parseDob(teamInfo.dob);
        const captainDobParts = parseDob(teamInfo.captainDob);

        const captainTimeScore = calculateTimeFactorScore(captainDobParts, matchDateParsed, matchNumbers, compatibilityData);
        const teamTimeScore = calculateTimeFactorScore(teamDobParts, matchDateParsed, matchNumbers, compatibilityData);

        // Average the time scores for the final Time Factor Score
        const finalTimeFactorScore = Math.round((captainTimeScore + teamTimeScore) / 2);

        // --- Apply Weighted Formula ---
        const winPercentage = (0.4 * ccs) + (0.4 * tcs) + (0.2 * finalTimeFactorScore);

        // --- Return Result ---
        res.json({
            team: teamInfo.fullName,
            captain: teamInfo.captain,
            matchDate: matchDate,
            captainCompatibilityScore: ccs,
            teamCompatibilityScore: tcs,
            timeFactorScore: finalTimeFactorScore,
            calculatedWinPercentage: Math.round(winPercentage) // Round to nearest whole number
        });

    } catch (error) {
        console.error('Win Percentage Calculation error:', error);
        res.status(500).json({ error: 'An internal server error occurred during win percentage calculation.' });
    }
});
