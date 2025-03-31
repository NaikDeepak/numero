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
    calculateTimeFactorScore,
    calculateNameNumbers // Import the new function
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
const nameDestinyMeanings = loadJsonData('./data/nameDestinyMeanings.json');
const nameSoulUrgeMeanings = loadJsonData('./data/nameSoulUrgeMeanings.json');
const namePersonalityMeanings = loadJsonData('./data/namePersonalityMeanings.json');
// --- End JSON Data Loading ---

// Add logging to check loaded data
console.log("IPL Teams Data Loaded:", Object.keys(iplTeamsData).length > 0 ? `${Object.keys(iplTeamsData).length} teams loaded.` : "FAILED TO LOAD OR EMPTY");
console.log("Compatibility Data Loaded:", Object.keys(compatibilityData).length > 0 ? "OK" : "FAILED TO LOAD OR EMPTY");


const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()) // Enable CORS for all origins (adjust for production)
app.use(express.json()) // Parse JSON request bodies

// API Endpoint for Numerology Calculation (including Name)
app.post("/api/calculate", (req, res) => {
  const { dob, gender, name } = req.body // Add name

  // Basic validation for presence of dob and gender (name is optional here)
  if (!dob || !gender) {
    return res.status(400).json({ error: "Missing required fields: dob and gender" })
  }

  try {
    // Calculate DOB-based numerology
    const numerologyData = calculateNumerologyData(dob, gender)

    if (numerologyData) {
      let responseData = { ...numerologyData }; // Start with DOB data

      // Calculate Name Numerology if name is provided
      if (name && name.trim().length > 0) {
        const nameData = calculateNameNumbers(name);
        if (nameData) {
          responseData.nameNumerology = nameData; // Add name data to the response
        } else {
          // Optionally inform the client if name calculation failed but DOB was ok
          console.warn(`Name numerology calculation failed for name: ${name}`);
          responseData.nameNumerology = null; // Indicate failure or absence
        }
      } else {
        responseData.nameNumerology = null; // Indicate name was not provided or empty
      }

      // Return the combined data
      res.json(responseData)
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
  const { dob, gender, name } = req.query // Get data from query parameters, add name

  // Basic validation
  if (!dob || !gender) {
    return res.status(400).json({ error: "Missing required query parameters: dob and gender" })
  }
  // Name is optional for the report, but good to have

  try {
    // Calculate DOB numerology
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

    // Set headers for PDF download - include name if available
    const namePart = name ? `_${name.replace(/\s+/g, "_")}` : "";
    const filename = `Numerology_Report_${dob.replace(/-/g, "")}${namePart}.pdf`
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
      .fillColor(colors.muted);
    // Include name in sub-header if available
    const subHeaderText = name
        ? `For: ${name} (DOB: ${dob}, Gender: ${gender})`
        : `For Date of Birth: ${dob} (${gender})`;
    doc.text(subHeaderText, { align: "center" });
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

    // 5. Name Numerology Analysis (if name provided)
    let nameData = null;
    if (name && name.trim().length > 0) {
        nameData = calculateNameNumbers(name);
    }

    if (nameData) {
        addSection("Name Numerology Analysis", () => {
            const { destinyNumber, soulUrgeNumber, personalityNumber } = nameData;

            doc.font(fonts.bodyBold).text("Destiny Number: ", { continued: true });
            doc.font(fonts.body).text(`${destinyNumber} - ${nameDestinyMeanings[destinyNumber] || "No specific meaning found."}`);
            doc.moveDown(0.5);

            doc.font(fonts.bodyBold).text("Soul Urge Number: ", { continued: true });
            doc.font(fonts.body).text(`${soulUrgeNumber} - ${nameSoulUrgeMeanings[soulUrgeNumber] || "No specific meaning found."}`);
            doc.moveDown(0.5);

            doc.font(fonts.bodyBold).text("Personality Number: ", { continued: true });
            doc.font(fonts.body).text(`${personalityNumber} - ${namePersonalityMeanings[personalityNumber] || "No specific meaning found."}`);
        });
    } else if (name) {
         addSection("Name Numerology Analysis", () => {
            doc.text("Could not calculate name numerology. Please ensure the name contains valid letters.");
         });
    }


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


// --- NEW: API Endpoint for Compatibility PDF Report Generation ---
app.get("/api/report/compatibility/pdf", async (req, res) => {
    const { dob1, gender1, name1, dob2, gender2, name2 } = req.query;

    // Basic validation
    if (!dob1 || !gender1 || !name1 || !dob2 || !gender2 || !name2) {
        return res.status(400).json({ error: "Missing required query parameters for compatibility report." });
    }

    try {
        // Calculate data for both individuals
        const person1Data = calculateNumerologyData(dob1, gender1);
        const person2Data = calculateNumerologyData(dob2, gender2);

        if (!person1Data || !person2Data) {
            return res.status(400).json({ error: "Invalid input data provided for one or both individuals." });
        }

        // --- Compatibility Calculation (Bidirectional) ---
        // Helper functions (assuming compatibilityData is loaded globally)
        const getScore = (num1, num2) => {
            const rules1 = compatibilityData[num1];
            if (!rules1) return 1; // Default to neutral
            if (rules1.friendly?.includes(num2)) return 3;
            if (rules1.enemy?.includes(num2)) return 0;
            return 1; // Neutral
        };
        const getRelationship = (num1, num2) => {
            const rules1 = compatibilityData[num1];
            if (!rules1) return "Neutral (No data)";
            if (rules1.friendly?.includes(num2)) return "Friendly";
            if (rules1.enemy?.includes(num2)) return "Enemy";
            return "Neutral";
        };

        const m1 = person1Data.moolank;
        const b1 = person1Data.bhagyank;
        const m2 = person2Data.moolank;
        const b2 = person2Data.bhagyank;

        // Calculate scores for all 8 comparisons
        const scoreM1M2 = getScore(m1, m2); const relationM1M2 = getRelationship(m1, m2);
        const scoreB1B2 = getScore(b1, b2); const relationB1B2 = getRelationship(b1, b2);
        const scoreM1B2 = getScore(m1, b2); const relationM1B2 = getRelationship(m1, b2);
        const scoreB1M2 = getScore(b1, m2); const relationB1M2 = getRelationship(b1, m2);
        const scoreM2M1 = getScore(m2, m1); const relationM2M1 = getRelationship(m2, m1);
        const scoreB2B1 = getScore(b2, b1); const relationB2B1 = getRelationship(b2, b1);
        const scoreM2B1 = getScore(m2, b1); const relationM2B1 = getRelationship(m2, b1);
        const scoreB2M1 = getScore(b2, m1); const relationB2M1 = getRelationship(b2, m1);

        // Calculate total score and percentage
        const totalScore = scoreM1M2 + scoreB1B2 + scoreM1B2 + scoreB1M2 +
                           scoreM2M1 + scoreB2B1 + scoreM2B1 + scoreB2M1;
        const maxScore = 24; // 8 comparisons * 3 points max
        const compatibilityPercentage = Math.round((totalScore / maxScore) * 100);

        // Determine final verdict
        let finalVerdict = "";
        const allRelations = [
            relationM1M2, relationB1B2, relationM1B2, relationB1M2,
            relationM2M1, relationB2B1, relationM2B1, relationB2M1
        ];
        if (allRelations.includes("Enemy")) {
            finalVerdict = "Not Compatible (Due to Enemy Relationship)";
        } else {
            if (compatibilityPercentage >= 75) finalVerdict = "High Compatibility";
            else if (compatibilityPercentage <= 35) finalVerdict = "Low Compatibility";
            else finalVerdict = "Average Compatibility";
        }
        // --- End Compatibility Calculation ---


        // --- PDF Setup (reusing styles and helpers) ---
        const colors = { /* ... same colors as in /api/report/pdf ... */
            primary: "#ff8c00", secondary: "#a0522d", text: "#333333", muted: "#666666",
            gridLine: "#cccccc", gridText: "#111111", gridBg: "#f9f9f9", heading: "#111111",
        };
        const fonts = { /* ... same fonts as in /api/report/pdf ... */
            heading: "Helvetica-Bold", subheading: "Helvetica-Bold", body: "Helvetica", bodyBold: "Helvetica-Bold",
        };
        const margin = 50;
        const doc = new PDFDocument({ size: "A4", margin: margin });

        const filename = `Compatibility_Report_${name1}_${name2}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        doc.pipe(res);

        // --- PDF Content ---
        // Header
        doc.font(fonts.heading).fontSize(20).fillColor(colors.heading)
           .text("Numerology Compatibility Report", { align: "center" });
        doc.moveDown(0.5);
        doc.font(fonts.body).fontSize(12).fillColor(colors.muted)
           .text(`${name1} & ${name2}`, { align: "center" });
        doc.moveDown(2);

        // Section Helper (assuming it's defined globally or copy it here if needed)
        const addSection = (title, contentFn) => {
            doc.font(fonts.subheading).fontSize(14).fillColor(colors.secondary).text(title, { underline: true });
            doc.moveDown(0.7);
            doc.font(fonts.body).fontSize(10).fillColor(colors.text); // Reset font
            contentFn();
            doc.moveDown(1.5);
        };

        // Grid Drawing Helper (assuming it's defined globally or copy it here if needed)
        const drawLoShuGrid = (gridNumbers, startX, startY, cellSize = 30, gap = 3) => {
            const positionMap = { 4: 0, 9: 1, 2: 2, 3: 3, 5: 4, 7: 5, 8: 6, 1: 7, 6: 8 };
            let cells = Array(9).fill("");
            if (gridNumbers && Array.isArray(gridNumbers)) {
                gridNumbers.forEach((num) => {
                    if (num !== 0 && positionMap.hasOwnProperty(num)) {
                        let cellIndex = positionMap[num];
                        cells[cellIndex] += (cells[cellIndex] ? " " : "") + num;
                    }
                });
            }
            doc.save();
            doc.lineWidth(0.5).strokeColor(colors.gridLine);
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const cellIndex = row * 3 + col;
                    const x = startX + col * (cellSize + gap);
                    const y = startY + row * (cellSize + gap);
                    doc.rect(x, y, cellSize, cellSize).fillAndStroke(colors.gridBg, colors.gridLine);
                    if (cells[cellIndex]) {
                        doc.font(fonts.bodyBold).fontSize(10).fillColor(colors.gridText)
                           .text(cells[cellIndex], x, y + cellSize / 2 - 5, { width: cellSize, align: "center" });
                    }
                }
            }
            doc.restore();
            return startY + 3 * cellSize + 2 * gap; // Return Y position after the grid
        };

        // --- Individual Details Sections ---
        const addPersonSection = (name, dob, gender, data) => {
            addSection(`${name}'s Details`, () => {
                const gridStartY = doc.y;
                const gridWidth = 3 * 30 + 2 * 3;
                const gridStartX = doc.page.width - margin - gridWidth; // Align grid to the right
                const gridEndY = drawLoShuGrid(data.gridNumbers, gridStartX, gridStartY);

                const textStartY = gridStartY;
                const textStartX = margin;
                const textWidth = gridStartX - margin - 20; // Width for text column

                doc.font(fonts.bodyBold).text("DOB:", textStartX, textStartY, { width: textWidth, continued: true });
                doc.font(fonts.body).text(` ${dob} (${gender})`);
                doc.moveDown(0.5);

                doc.font(fonts.bodyBold).text("Moolank:", textStartX, doc.y, { width: textWidth, continued: true });
                doc.font(fonts.body).text(` ${data.moolank} (${houseMeanings[data.moolank] || "N/A"})`);
                doc.moveDown(0.5);

                doc.font(fonts.bodyBold).text("Bhagyank:", textStartX, doc.y, { width: textWidth, continued: true });
                doc.font(fonts.body).text(` ${data.bhagyank} (${houseMeanings[data.bhagyank] || "N/A"})`);
                doc.moveDown(0.5);

                doc.font(fonts.bodyBold).text("Kua Number:", textStartX, doc.y, { width: textWidth, continued: true });
                doc.font(fonts.body).text(` ${data.kua}`);
                doc.moveDown(0.5);

                // Add Moolank-Bhagyank Relation
                const mbRelation = moolankBhagyankRelations[data.moolank]?.[data.bhagyank];
                doc.font(fonts.bodyBold).text(`Moolank-Bhagyank (${data.moolank}-${data.bhagyank}):`, textStartX, doc.y, { width: textWidth });
                if (mbRelation) {
                    doc.font(fonts.body).text(`  ${mbRelation.indication || 'N/A'} (Rating: ${mbRelation.rating || 'N/A'})`, { width: textWidth });
                } else {
                    doc.font(fonts.body).text("  No specific data", { width: textWidth });
                }

                // Ensure content starts below the grid/text block
                doc.y = Math.max(doc.y, gridEndY) + 10;
            });
        };

        addPersonSection(name1, dob1, gender1, person1Data);
        addPersonSection(name2, dob2, gender2, person2Data);

        // --- Compatibility Analysis Section ---
        addSection("Compatibility Analysis", () => {
            // Display Overall Score and Verdict
            doc.font(fonts.bodyBold).text("Overall Compatibility Score: ", { continued: true });
            doc.font(fonts.body).text(`${totalScore} / ${maxScore} (${compatibilityPercentage}%)`);
            doc.moveDown(0.5);
            doc.font(fonts.bodyBold).text("General Indication: ", { continued: true });
            doc.font(fonts.body).text(finalVerdict); // Use the calculated final verdict
            doc.moveDown(1);

            // Display Bidirectional Relationship Breakdown
            doc.font(fonts.bodyBold).text("Relationship Breakdown (Bidirectional):");
            doc.moveDown(0.5);
            const breakdown = [
                { n1: `Moolank (${m1})`, n2: `Moolank (${m2})`, rel: relationM1M2, score: scoreM1M2 },
                { n1: `Bhagyank (${b1})`, n2: `Bhagyank (${b2})`, rel: relationB1B2, score: scoreB1B2 },
                { n1: `Moolank (${m1})`, n2: `Bhagyank (${b2})`, rel: relationM1B2, score: scoreM1B2 },
                { n1: `Bhagyank (${b1})`, n2: `Moolank (${m2})`, rel: relationB1M2, score: scoreB1M2 },
                { n1: `Moolank (${m2})`, n2: `Moolank (${m1})`, rel: relationM2M1, score: scoreM2M1 },
                { n1: `Bhagyank (${b2})`, n2: `Bhagyank (${b1})`, rel: relationB2B1, score: scoreB2B1 },
                { n1: `Moolank (${m2})`, n2: `Bhagyank (${b1})`, rel: relationM2B1, score: scoreM2B1 },
                { n1: `Bhagyank (${b2})`, n2: `Moolank (${m1})`, rel: relationB2M1, score: scoreB2M1 },
            ];

            // Use list format for better readability in PDF
            breakdown.forEach(item => {
                doc.font(fonts.body).text(`  - ${item.n1} vs ${item.n2}: ${item.rel} (Score: ${item.score})`);
                doc.moveDown(0.3);
            });

        });


        // --- Finalize PDF ---
        doc.end();

    } catch (error) {
        console.error("Compatibility PDF Generation error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "An internal server error occurred during PDF generation." });
        } else {
            res.end();
        }
    }
});


// Start the server
app.listen(port, () => {
  console.log(`Numerology API server listening on port ${port}`)
})

// --- NEW: API Endpoint for Team Win Percentage ---
app.post('/api/win-percentage', (req, res) => {
    console.log("Received request for /api/win-percentage"); // Log endpoint hit
    const { teamKey, matchDate } // Expect team key (e.g., "CSK") and match date "YYYY-MM-DD"
        = req.body;
    console.log(`Team Key: ${teamKey}, Match Date: ${matchDate}`); // Log input

    // --- Input Validation ---
    if (!teamKey || !matchDate) {
        return res.status(400).json({ error: 'Missing required fields: teamKey and matchDate' });
    }

    // Log the state of iplTeamsData just before access
    console.log(`Attempting to access teamKey "${teamKey}" in iplTeamsData. Available keys: ${Object.keys(iplTeamsData).join(', ')}`);
    const teamInfo = iplTeamsData[teamKey];
    if (!teamInfo) {
        console.error(`Team data not found for key: ${teamKey}. iplTeamsData is potentially empty or missing keys.`);
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
