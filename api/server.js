import path from "path"; // Move path import up
import { fileURLToPath } from "url"; // Move fileURLToPath import up
import dotenv from "dotenv"; // Import dotenv

// --- Calculate __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load Environment Variables ---
dotenv.config({ path: path.resolve(__dirname, ".env") }); // Load .env using calculated __dirname

// --- Other Imports ---
import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import { createRequire } from "module";
import rateLimit from "express-rate-limit"; // Import rate limiter
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Gemini SDK
import {
  calculateNumerologyData,
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay,
  calculateCompatibilityScore,
  calculateTimeFactorScore,
  calculateNameNumbers,
  analyzeGrid, // <-- Import the new grid analysis function
} from "./utils/numerologyUtils.js";

// --- Load JSON Data using createRequire ---
const require = createRequire(import.meta.url);
// __filename and __dirname are now defined above

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

const houseMeanings = loadJsonData("./data/houseMeanings.json");
const moolankBhagyankRelations = loadJsonData("./data/moolankBhagyankRelations.json");
const missingNumberRemedies = loadJsonData("./data/missingNumberRemedies.json");
const repeatingNumberImpact = loadJsonData("./data/repeatingNumberImpact.json");
const compatibilityData = loadJsonData("./data/compatibilityData.json"); // Load compatibility data
const iplTeamsData = loadJsonData("./data/iplTeams.json"); // Load IPL team data
const nameDestinyMeanings = loadJsonData("./data/nameDestinyMeanings.json");
const nameSoulUrgeMeanings = loadJsonData("./data/nameSoulUrgeMeanings.json");
const namePersonalityMeanings = loadJsonData("./data/namePersonalityMeanings.json");
// --- NEW: Load Grid Analysis Definitions ---
const gridAnalysisDefinitions = loadJsonData("./data/gridAnalysisDefinitions.json");
const moolankMeanings = loadJsonData("./data/moolankMeanings.json"); // <-- Add missing moolankMeanings loading
console.log(
  "Grid Analysis Definitions Loaded:",
  Array.isArray(gridAnalysisDefinitions)
    ? `${gridAnalysisDefinitions.length} definitions loaded.`
    : "FAILED TO LOAD OR NOT AN ARRAY"
);
// --- End JSON Data Loading ---

// --- Initialize Gemini ---
// IMPORTANT: Store your API key securely, preferably in environment variables.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- Enhanced API Key Logging ---
if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
  // Check if key seems present
  console.log("[Gemini Init] GEMINI_API_KEY loaded successfully from environment.");
  // Avoid logging the full key for security, just confirm its presence and partial length
  console.log(`[Gemini Init] API Key starts with: ${GEMINI_API_KEY.substring(0, 4)}...`);
} else if (GEMINI_API_KEY) {
  // Key exists but seems short/invalid
  console.warn(
    `[Gemini Init] WARNING: GEMINI_API_KEY found but seems short or invalid (length: ${GEMINI_API_KEY.length}). Please verify the key in your .env file.`
  );
} else {
  // Key not found at all
  console.warn(
    "[Gemini Init] WARNING: GEMINI_API_KEY environment variable not set or empty. Analysis rewriting will be disabled. Ensure it's defined in api/.env and the server was restarted."
  );
}
// --- End Enhanced Logging ---

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
// Try the model name from the latest documentation example: "gemini-2.0-flash"
const geminiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

// --- Function to check Gemini connection on startup ---
async function checkGeminiConnection() {
  if (!geminiModel) {
    console.log(
      "[Gemini Check] Skipping connection check: Gemini client not initialized (likely missing API key)."
    );
    return;
  }
  try {
    console.log("[Gemini Check] Attempting a test API call...");
    // Use a very simple prompt for the test
    const result = await geminiModel.generateContent("Test");
    await result.response; // Wait for the response processing
    console.log("[Gemini Check] Successfully connected to Google Generative AI.");
  } catch (error) {
    console.error(
      "[Gemini Check] Failed to connect or communicate with Google Generative AI:",
      error.message
    );
    // Optionally log the full error for more details if needed
    // console.error(error);
  }
}

// --- Run the connection check ---
checkGeminiConnection();

// --- Analysis Cache Setup ---
const analysisCache = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000; // Cache rewritten analysis for 15 minutes

function generateCacheKey(dob, gender, name) {
  // Normalize name to handle potential variations if needed
  const normalizedName = (name || "").trim().toLowerCase();
  return `${dob}-${gender}-${normalizedName}`;
}

// --- Function to generate conversational summary from Moolank details ---
async function generateConversationalMoolankSummary(meaningData) {
  if (!geminiModel || !meaningData) {
    return null; // Cannot generate if model or data is missing
  }

  const { characteristics, negativeTraits, suggestions } = meaningData;

  // Basic check if there's anything to summarize
  if (!characteristics?.length && !negativeTraits?.length && !suggestions?.length) {
    return null; // Nothing to summarize
  }

  // Construct the prompt
  // Ask for multiple paragraphs separated by double line breaks
  let prompt = `Based on the following numerology details for a Moolank number, write an engaging and insightful analysis with a conversational, friendly, yet professional tone, suitable for a seasoned numerologist's report. Structure the response into several smaller paragraphs (separated by double line breaks: '\\n\\n'), elaborating on the key points from characteristics,some possible anecdotes or examples which relate to that, potential negative traits (conveyed with finesse), and suggestions for growth. Do not add introductory phrases like "Here is the summary:".

**Key Characteristics:**
${(characteristics || []).map((c) => `- ${c}`).join("\n")}

Negative Traits to be mindful of:
${(negativeTraits || []).map((n) => `- ${n}`).join("\n")}

Suggestions for growth:
${(suggestions || []).map((s) => `- ${s}`).join("\n")}

Conversational Analysis (Multiple Paragraphs):`; // Updated final instruction

  try {
    console.log(`[Gemini] Generating conversational analysis paragraphs for Moolank...`); // Update log
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const summaryText = await response.text();
    console.log(`[Gemini] Conversational analysis generation successful.`); // Update log
    // Split the response into paragraphs based on double (or more) line breaks and trim each one
    const paragraphs = summaryText
      .trim() // Trim overall response first
      .split(/[\r\n\s*]{2,}/) // Split by two or more newline/whitespace characters
      .map(p => p.trim().replace(/^[\r\n\s*]+/, '')) // Trim and remove leading newlines/whitespace
      .filter(p => p.length > 0); // Filter out genuinely empty strings after trimming
    return paragraphs; // Return array of trimmed, non-empty paragraphs
  } catch (error) {
    console.error("[Gemini] Error generating conversational analysis paragraphs:", error); // Update log
    return null; // Return null on error
  }
}
// --- End Cache Setup ---

// --- Helper function to rewrite text using Gemini ---
async function rewriteAnalysisWithGemini(originalText) {
  if (!geminiModel || !originalText) {
    return originalText; // Return original if Gemini is not configured or text is empty
  }

  const prompt = `Rewrite the following numerology analysis text to convey the same core meaning but using different wording. Keep the tone informative and insightful. Do not add any introductory or concluding phrases like "Here's the rewritten text:". Just provide the rewritten analysis itself.\n\nOriginal Text:\n"${originalText}"\n\nRewritten Text:`;

  try {
    console.log(
      `[Gemini] Rewriting analysis for text starting with: "${originalText.substring(0, 50)}..."`
    );
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const rewrittenText = await response.text();
    console.log(`[Gemini] Rewriting successful.`);
    return rewrittenText.trim();
  } catch (error) {
    console.error("[Gemini] Error rewriting analysis:", error);
    return originalText; // Fallback to original text on error
  }
}
// --- End Gemini Setup ---

// Add logging to check loaded data
console.log(
  "IPL Teams Data Loaded:",
  Object.keys(iplTeamsData).length > 0
    ? `${Object.keys(iplTeamsData).length} teams loaded.`
    : "FAILED TO LOAD OR EMPTY"
);
console.log(
  "Compatibility Data Loaded:",
  Object.keys(compatibilityData).length > 0 ? "OK" : "FAILED TO LOAD OR EMPTY"
);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json());

// --- Rate Limiter for Gemini-dependent routes ---
const geminiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs (adjust as needed)
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Only apply this limiter if Gemini is actually configured
  skip: (req, res) => !geminiModel,
});

// API Endpoint for Numerology Calculation (including Name) - Made async
// Apply the rate limiter specifically to this route
app.post("/api/calculate", geminiLimiter, async (req, res) => {
  // <-- Add geminiLimiter middleware
  const { dob, gender, name } = req.body;

  // Basic validation
  if (!dob || !gender) {
    return res.status(400).json({ error: "Missing required fields: dob and gender" });
  }

  try {
    // Calculate DOB-based numerology
    const numerologyData = calculateNumerologyData(dob, gender);

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

      // --- NEW: Analyze Grid ---
      console.log(numerologyData.gridNumbers); // <-- Add log here
      console.log(gridAnalysisDefinitions); // <-- Add log here

      const gridAnalysis = analyzeGrid(numerologyData.gridNumbers, gridAnalysisDefinitions);
      console.log(`[/api/calculate] Grid Analysis for DOB ${dob}:`, gridAnalysis); // <-- Add console log
      responseData.gridAnalysis = gridAnalysis;

      // --- Add Moolank Meaning (with potential rewriting) ---
      const moolankMeaningData = moolankMeanings?.[responseData.moolank?.toString()];
      if (moolankMeaningData?.analysis) {
        // --- Rewrite analysis using Gemini and cache it ---
        const originalAnalysis = moolankMeaningData.analysis;
        const rewrittenAnalysis = await rewriteAnalysisWithGemini(originalAnalysis);

        // Generate cache key
        const cacheKey = generateCacheKey(dob, gender, name);
        const summaryCacheKey = `summary:${cacheKey}`; // Separate key for summary

        // --- Rewrite main analysis and cache it ---
        // const originalAnalysis = moolankMeaningData.analysis; // Already defined above
        // const rewrittenAnalysis = await rewriteAnalysisWithGemini(originalAnalysis); // Already defined above
        analysisCache.set(cacheKey, rewrittenAnalysis);
        console.log(`[Cache] Stored main analysis for key: ${cacheKey}`);
        setTimeout(() => {
          if (analysisCache.delete(cacheKey)) {
            console.log(`[Cache] Expired main analysis for key: ${cacheKey}`);
          }
        }, CACHE_DURATION_MS);
        // --- End main analysis caching ---

        // --- Generate conversational summary and cache it ---
        const conversationalSummaryParagraphs = // Rename variable
          await generateConversationalMoolankSummary(moolankMeaningData); // Generate summary (returns array or null)
        // conversationalSummary is now an array of paragraphs or null
        if (conversationalSummaryParagraphs && conversationalSummaryParagraphs.length > 0) {
          analysisCache.set(summaryCacheKey, conversationalSummaryParagraphs); // Cache the array
          console.log(`[Cache] Stored summary paragraphs for key: ${summaryCacheKey}`); // Update log
          setTimeout(() => {
            if (analysisCache.delete(summaryCacheKey)) {
              console.log(`[Cache] Expired summary for key: ${summaryCacheKey}`);
            }
          }, CACHE_DURATION_MS);
        }
        // --- End summary generation/caching ---

        // Prepare response for UI
        responseData.moolankMeaning = {
          grah: moolankMeaningData.grah,
          rashi: moolankMeaningData.rashi,
          keywords: moolankMeaningData.keywords,
          analysis: rewrittenAnalysis, // Send rewritten main analysis
          conversationalSummaryParagraphs: conversationalSummaryParagraphs, // Send array of paragraphs
          // Raw lists are no longer needed by UI
          // characteristics: moolankMeaningData.characteristics,
          // negativeTraits: moolankMeaningData.negativeTraits,
          // suggestions: moolankMeaningData.suggestions,
        };
        // --- End Gemini/Cache logic ---
      } else if (moolankMeaningData) {
        // If analysis text is missing, still try to generate summary if other fields exist
        const conversationalSummaryParagraphs = // Rename variable
          await generateConversationalMoolankSummary(moolankMeaningData);
        // Cache the generated paragraphs if successful
        const cacheKey = generateCacheKey(dob, gender, name); // Need cache key here too
        const summaryCacheKey = `summary:${cacheKey}`;
        if (conversationalSummaryParagraphs && conversationalSummaryParagraphs.length > 0) {
          analysisCache.set(summaryCacheKey, conversationalSummaryParagraphs);
          console.log(
            `[Cache] Stored summary paragraphs (no main analysis) for key: ${summaryCacheKey}`
          );
          setTimeout(() => {
            if (analysisCache.delete(summaryCacheKey)) {
              console.log(
                `[Cache] Expired summary paragraphs (no main analysis) for key: ${summaryCacheKey}`
              );
            }
          }, CACHE_DURATION_MS);
        }

        responseData.moolankMeaning = {
          grah: moolankMeaningData.grah,
          rashi: moolankMeaningData.rashi,
          keywords: moolankMeaningData.keywords,
          analysis: null, // Main analysis was missing
          conversationalSummaryParagraphs: conversationalSummaryParagraphs, // Send array of paragraphs
          // Raw lists are no longer needed by UI
          // characteristics: moolankMeaningData.characteristics,
          // negativeTraits: moolankMeaningData.negativeTraits,
          // suggestions: moolankMeaningData.suggestions,
        };
      } else {
        responseData.moolankMeaning = null;
      }

      // --- Add Grid Analysis (needed for UI) ---
      // Grid analysis was already added earlier in the try block
      // responseData.gridAnalysis = gridAnalysis; // Already present

      // --- Add Bhagyank House Meaning (needed for UI) ---
      const bhagyankString = responseData.bhagyank?.toString();
      responseData.bhagyankMeaning = houseMeanings?.[bhagyankString] || null;

      // --- Add Name Number Meanings (if nameNumerology exists, needed for UI) ---
      // Name numerology numbers are already in responseData.nameNumerology if calculated
      // No need to add meanings here as they are handled by the PDF endpoint if needed

      // --- Add Moolank-Bhagyank Relationship (needed for UI) ---
      const moolankString = responseData.moolank?.toString(); // Define moolankString if not already defined
      if (moolankString && bhagyankString) {
        responseData.moolankBhagyankRelation =
          moolankBhagyankRelations?.[moolankString]?.[bhagyankString] || null;
      } else {
        responseData.moolankBhagyankRelation = null;
      }

      // --- Add Repeating/Missing Number Info (needed for UI) ---
      const gridNums = responseData.gridNumbers || [];
      const counts = gridNums.reduce((acc, num) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
      }, {});

      responseData.repeatingNumbersInfo = Object.entries(counts)
        .filter(([num, count]) => count > 1 && num !== "0") // Exclude 0 if present
        .map(([num, count]) => {
          const repeatSequence = num.toString().repeat(count);
          return {
            number: parseInt(num),
            count: count,
            sequence: repeatSequence,
            impact: repeatingNumberImpact?.[repeatSequence] || null,
          };
        })
        .filter((info) => info.impact); // Only include if impact data exists

      const presentNumbers = new Set(gridNums.filter((n) => n !== 0)); // Exclude 0
      responseData.missingNumbersInfo = [];
      for (let i = 1; i <= 9; i++) {
        if (!presentNumbers.has(i)) {
          const remedyData = missingNumberRemedies?.[i.toString()];
          if (remedyData) {
            responseData.missingNumbersInfo.push({
              number: i,
              impact: remedyData.impact || [],
              remedies: remedyData.remedies || [],
            });
          }
        }
      }
      // --- End UI Data Enrichment ---

      // Return the data needed for the UI
      res.json(responseData);
    } else {
      // calculateNumerologyData returns null for invalid input format/values
      res.status(400).json({ error: "Invalid input data provided (e.g., date format, values)." });
    }
  } catch (error) {
    console.error("Calculation error:", error);
    res.status(500).json({ error: "An internal server error occurred during calculation." });
  }
});

// --- NEW: API Endpoint for PDF Report Generation ---
// PDFDocument import moved to top

// Made async to handle potential Gemini call
// Apply the rate limiter specifically to this route
app.get("/api/report/pdf", geminiLimiter, async (req, res) => {
  // <-- Add geminiLimiter middleware
  const { dob, gender, name } = req.query;

  // Basic validation
  if (!dob || !gender) {
    return res.status(400).json({ error: "Missing required query parameters: dob and gender" });
  }
  // Name is optional for the report, but good to have

  try {
    // Calculate DOB numerology
    const numerologyData = calculateNumerologyData(dob, gender);

    if (!numerologyData) {
      return res
        .status(400)
        .json({ error: "Invalid input data provided (e.g., date format, values)." });
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
    };
    const fonts = {
      heading: "Helvetica-Bold",
      subheading: "Helvetica-Bold",
      body: "Helvetica",
      bodyBold: "Helvetica-Bold",
    };
    const margin = 50;

    // Create a new PDF document
    const doc = new PDFDocument({ size: "A4", margin: margin });

    // Set headers for PDF download - include name if available
    const namePart = name ? `_${name.replace(/\s+/g, "_")}` : "";
    const filename = `Numerology_Report_${dob.replace(/-/g, "")}${namePart}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe the PDF document directly to the response stream
    doc.pipe(res);

    // --- PDF Content Generation ---

    // Header
    doc
      .font(fonts.heading)
      .fontSize(20)
      .fillColor(colors.heading)
      .text("Numerology Insights Report", { align: "center" });
    doc.moveDown(0.5);
    doc.font(fonts.body).fontSize(12).fillColor(colors.muted);
    // Include name in sub-header if available
    const subHeaderText = name
      ? `For: ${name} (DOB: ${dob}, Gender: ${gender})`
      : `For Date of Birth: ${dob} (${gender})`;
    doc.text(subHeaderText, { align: "center" });
    doc.moveDown(2);

    // --- Section Helper ---
    const addSection = (title, contentFn) => {
      doc
        .font(fonts.subheading)
        .fontSize(14)
        .fillColor(colors.secondary)
        .text(title, { underline: true });
      doc.moveDown(0.7);
      doc.font(fonts.body).fontSize(10).fillColor(colors.text); // Reset font for content
      contentFn();
      doc.moveDown(1.5);
    };

    // --- Draw Lo Shu Grid Function ---
    const drawLoShuGrid = (gridNumbers, startX, startY, cellSize = 30, gap = 3) => {
      const positionMap = { 4: 0, 9: 1, 2: 2, 3: 3, 5: 4, 7: 5, 8: 6, 1: 7, 6: 8 };
      let cells = Array(9).fill("");
      const counts = {};

      if (gridNumbers && Array.isArray(gridNumbers)) {
        gridNumbers.forEach((num) => {
          counts[num] = (counts[num] || 0) + 1;
          if (num !== 0 && positionMap.hasOwnProperty(num)) {
            let cellIndex = positionMap[num];
            // Append number, potentially multiple times if repeated
            cells[cellIndex] += (cells[cellIndex] ? " " : "") + num;
          }
        });
      }

      doc.save(); // Save current style state
      doc.lineWidth(0.5).strokeColor(colors.gridLine);

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const cellIndex = row * 3 + col;
          const x = startX + col * (cellSize + gap);
          const y = startY + row * (cellSize + gap);

          // Draw cell background and border
          doc.rect(x, y, cellSize, cellSize).fillAndStroke(colors.gridBg, colors.gridLine);

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
              });
          }
        }
      }
      doc.restore(); // Restore previous style state
      return startY + 3 * cellSize + 2 * gap; // Return Y position after the grid
    };

    // --- Report Sections ---
    const { moolank, bhagyank, kua, gridNumbers } = numerologyData;

    // --- Get Moolank meaning data ---
    const moolankMeaningData = moolankMeanings[moolank.toString()];
    // Log original data for debugging if needed
    // console.log("Moolank Meaning Data for PDF:", moolankMeaningData);

    // --- NEW: Get or Generate Conversational Summary for PDF ---
    let summaryParagraphsToUse = null;
    const cacheKey = generateCacheKey(dob, gender, name); // Use the helper function
    const summaryCacheKey = `summary:${cacheKey}`;

    if (analysisCache.has(summaryCacheKey)) {
      summaryParagraphsToUse = analysisCache.get(summaryCacheKey);
      console.log(`[PDF Report / Cache] Retrieved summary paragraphs for key: ${summaryCacheKey}`);
    } else if (geminiModel && moolankMeaningData) {
      // Only generate if Gemini is available and data exists
      console.log(
        `[PDF Report / Gemini] Generating conversational summary paragraphs for Moolank ${moolank}...`
      );
      summaryParagraphsToUse = await generateConversationalMoolankSummary(moolankMeaningData);
      if (summaryParagraphsToUse && summaryParagraphsToUse.length > 0) {
        analysisCache.set(summaryCacheKey, summaryParagraphsToUse); // Cache the result
        console.log(`[PDF Report / Cache] Stored summary paragraphs for key: ${summaryCacheKey}`);
        setTimeout(() => {
          if (analysisCache.delete(summaryCacheKey)) {
            console.log(`[PDF Report / Cache] Expired summary for key: ${summaryCacheKey}`);
          }
        }, CACHE_DURATION_MS);
      } else {
        console.log(`[PDF Report / Gemini] Summary generation returned null or empty array.`);
      }
    } else {
      console.log(
        `[PDF Report] Skipping summary generation (Gemini unavailable or no moolank data).`
      );
    }
    // --- End Summary Retrieval/Generation ---

    // --- Analyze Grid for PDF ---
    const gridAnalysis = analyzeGrid(gridNumbers, gridAnalysisDefinitions);
    console.log(`[/api/report/pdf] Grid Analysis for DOB ${dob}:`, gridAnalysis);

    // 1. Basic Numbers & Grid
    addSection("Core Numbers & Lo Shu Grid", () => {
      const gridStartY = doc.y;
      const gridStartX = doc.page.width / 2 - (3 * 30 + 2 * 3) / 2; // Center the grid
      const gridEndY = drawLoShuGrid(gridNumbers, gridStartX, gridStartY);

      // Place text next to or below grid
      const textStartY = gridStartY; // Start text at the same Y as grid
      const textStartX = margin;
      const textWidth = gridStartX - margin - 20;

      // Display Moolank (using pre-calculated rewritten interpretation)
      doc
        .font(fonts.bodyBold)
        .text("Moolank:", textStartX, textStartY, { width: textWidth, continued: true });
      doc.font(fonts.body).text(` ${moolank}`); // Display number first
      // Use the moolankMeaningData loaded *before* addSection
      if (moolankMeaningData) {
        doc
          .font(fonts.bodyBold)
          .fontSize(9)
          .text(
            `Grah: ${moolankMeaningData.grah || "N/A"} | Rashi: ${moolankMeaningData.rashi || "N/A"}`,
            textStartX,
            doc.y,
            { width: textWidth }
          );
        doc
          .font(fonts.body)
          .fontSize(9)
          .text(`Keywords: ${(moolankMeaningData.keywords || []).join(", ")}`, textStartX, doc.y, {
            width: textWidth,
          });
        // --- Add Moolank Analysis ---
        doc.moveDown(0.3); // Add a small space before analysis
        doc
          .font(fonts.body)
          .fontSize(9)
          .fillColor(colors.text)
          // Use the original analysis text directly from the JSON data
          .text(
            `Analysis: ${moolankMeaningData?.analysis || "N/A"}`, // <-- Use original analysis
            textStartX,
            doc.y,
            {
              width: textWidth,
              align: "justify",
            }
          );
        // --- End Moolank Analysis ---
      } else {
        doc
          .font(fonts.body)
          .fontSize(9)
          .text(`(Meaning not found)`, textStartX, doc.y, { width: textWidth });
      }
      doc.moveDown(0.7); // Adjust spacing

      doc.font(fonts.bodyBold).text("Bhagyank:", textStartX, doc.y, { width: textWidth });
      doc
        .font(fonts.body)
        .text(`${bhagyank} (${houseMeanings[bhagyank] || "N/A"})`, { width: textWidth });
      doc.moveDown(0.5);

      doc.font(fonts.bodyBold).text("Kua Number:", textStartX, doc.y, { width: textWidth });
      doc.font(fonts.body).text(`${kua}`, { width: textWidth });

      // Ensure content after this section starts below the grid
      doc.y = Math.max(doc.y, gridEndY) + 10; // Add some padding below grid/text
    });

    // 2. Moolank-Bhagyank Relationship
    addSection(`Moolank-Bhagyank (${moolank}-${bhagyank}) Relationship`, () => {
      if (moolankBhagyankRelations[moolank] && moolankBhagyankRelations[moolank][bhagyank]) {
        const relation = moolankBhagyankRelations[moolank][bhagyank];
        doc.font(fonts.bodyBold).text("Rating: ", { continued: true });
        doc.font(fonts.body).text(relation.rating || "N/A");
        doc.font(fonts.bodyBold).text("Indication: ", { continued: true });
        doc.font(fonts.body).text(relation.indication || "N/A");
      } else {
        doc.text("No specific data found for this combination.");
      }
    });

    // 3. Repeating Numbers Impact
    addSection("Impact of Repeating Numbers", () => {
      const counts = {};
      if (gridNumbers && Array.isArray(gridNumbers)) {
        gridNumbers.forEach((num) => {
          counts[num] = (counts[num] || 0) + 1;
        });
      }
      let repeatingFound = false;
      for (const num in counts) {
        if (counts[num] > 1) {
          const repeatSequence = num.toString().repeat(counts[num]);
          if (repeatingNumberImpact[repeatSequence]) {
            doc.font(fonts.bodyBold).text(`- ${repeatSequence}: `, { continued: true });
            doc.font(fonts.body).text(repeatingNumberImpact[repeatSequence]);
            repeatingFound = true;
          }
        }
      }
      if (!repeatingFound) {
        doc.text(
          "No significant repeating number patterns found with specific impacts in the data."
        );
      }
    });

    // 4. Missing Numbers Analysis
    addSection("Missing Numbers Analysis", () => {
      const presentNumbers = new Set(gridNumbers);
      let missingFound = false;
      for (let i = 1; i <= 9; i++) {
        if (!presentNumbers.has(i)) {
          missingFound = true;
          const numStr = i.toString();
          doc.font(fonts.bodyBold).text(`Missing Number ${numStr}:`);
          if (missingNumberRemedies[numStr]) {
            doc
              .font(fonts.body)
              .text(`  Impact: ${missingNumberRemedies[numStr].impact.join(" ")}`);
            doc.font(fonts.bodyBold).text(`  Remedies: `, { continued: true });
            doc.font(fonts.body).text(missingNumberRemedies[numStr].remedies.join("; "));
          } else {
            doc.font(fonts.body).text("  No specific impact/remedy data found.");
          }
          doc.moveDown(0.5);
        }
      }
      if (!missingFound) {
        doc.text("No missing numbers (1-9) found in the chart.");
      }
    });

    // 5. Name Numerology Analysis (if name provided)
    let nameData = null;
    if (name && name.trim().length > 0) {
      nameData = calculateNameNumbers(name);
    }

    if (nameData) {
      addSection("Name Numerology Analysis", () => {
        const { destinyNumber, soulUrgeNumber, personalityNumber } = nameData;

        doc.font(fonts.bodyBold).text("Destiny Number: ", { continued: true });
        doc
          .font(fonts.body)
          .text(
            `${destinyNumber} - ${nameDestinyMeanings[destinyNumber] || "No specific meaning found."}`
          );
        doc.moveDown(0.5);

        doc.font(fonts.bodyBold).text("Soul Urge Number: ", { continued: true });
        doc
          .font(fonts.body)
          .text(
            `${soulUrgeNumber} - ${nameSoulUrgeMeanings[soulUrgeNumber] || "No specific meaning found."}`
          );
        doc.moveDown(0.5);

        doc.font(fonts.bodyBold).text("Personality Number: ", { continued: true });
        doc
          .font(fonts.body)
          .text(
            `${personalityNumber} - ${namePersonalityMeanings[personalityNumber] || "No specific meaning found."}`
          );
      });
    } else if (name) {
      addSection("Name Numerology Analysis", () => {
        doc.text(
          "Could not calculate name numerology. Please ensure the name contains valid letters."
        );
      });
    }

    // --- NEW: 5. Grid Analysis Section ---
    if (gridAnalysis && gridAnalysis.length > 0) {
      addSection("Grid Analysis (Planes & Arrows)", () => {
        // Optional: Group by category
        const groupedAnalysis = gridAnalysis.reduce((acc, item) => {
          const category = item.category || "General";
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {});

        Object.entries(groupedAnalysis).forEach(([category, items]) => {
          doc.font(fonts.bodyBold).fontSize(11).text(category, { underline: true });
          doc.moveDown(0.5);
          items.forEach((item) => {
            doc.font(fonts.bodyBold).fontSize(10).text(`  • ${item.name}: `, { continued: true });
            doc.font(fonts.body).fontSize(10).text(item.interpretation);
            doc.moveDown(0.3);
          });
          doc.moveDown(0.7); // Space between categories
        });
      });
    }

    // --- NEW: Moolank Conversational Summary Section ---
    // Use the summaryParagraphsToUse variable populated earlier
    if (summaryParagraphsToUse && summaryParagraphsToUse.length > 0) {
      addSection(`Moolank ${moolank} - Personality Insights`, () => {
        // Iterate through paragraphs and add them with spacing
        summaryParagraphsToUse
          .filter((para) => para.trim() !== "\\n\\n") // Filter out entries with only \n\n
          .forEach((para, index) => {
            // Ensure 'para' is a string before passing to .text()
            const paragraphText = typeof para === "string" ? para : "";
            if (paragraphText.trim().length > 0) {
              // Avoid adding empty paragraphs
              doc.font(fonts.body).fontSize(10).text(paragraphText, { align: "justify" });
              // Add space only if it's not the last paragraph and the current one wasn't empty
              if (index < summaryParagraphsToUse.length - 1) {
                doc.moveDown(0.5); // Add space between paragraphs
              }
            }
          });
      });
    } else if (moolankMeaningData) {
      // Fallback: If summary generation failed or wasn't possible, show original lists
      addSection(`Moolank ${moolank} - Core Traits & Suggestions`, () => {
        // Slightly different title for fallback
        let contentAdded = false;
        if (moolankMeaningData.characteristics && moolankMeaningData.characteristics.length > 0) {
          doc.font(fonts.bodyBold).text("Characteristics:");
          moolankMeaningData.characteristics.forEach((item) =>
            doc.font(fonts.body).text(`- ${item}`)
          );
          doc.moveDown(0.5);
          contentAdded = true;
        }
        if (moolankMeaningData.negativeTraits && moolankMeaningData.negativeTraits.length > 0) {
          doc.font(fonts.bodyBold).text("Negative Traits:");
          moolankMeaningData.negativeTraits.forEach((item) =>
            doc.font(fonts.body).text(`- ${item}`)
          );
          doc.moveDown(0.5);
          contentAdded = true;
        }
        if (moolankMeaningData.suggestions && moolankMeaningData.suggestions.length > 0) {
          doc.font(fonts.bodyBold).text("Suggestions:");
          moolankMeaningData.suggestions.forEach((item) => doc.font(fonts.body).text(`- ${item}`));
          contentAdded = true;
        }
        if (!contentAdded) {
          doc.font(fonts.body).text("No specific trait details available.");
        }
      });
    }
    // --- End Moolank Conversational Summary Section ---

    // --- Finalize PDF ---
    doc.end();
  } catch (error) {
    console.error("PDF Generation error:", error);
    // Avoid sending partial PDF if error occurs mid-stream
    if (!res.headersSent) {
      res.status(500).json({ error: "An internal server error occurred during PDF generation." });
    } else {
      // If headers already sent, we might just have to end the response abruptly
      res.end();
    }
  }
});

// --- NEW: API Endpoint for Compatibility PDF Report Generation ---
app.get("/api/report/compatibility/pdf", async (req, res) => {
  const { dob1, gender1, name1, dob2, gender2, name2 } = req.query;

  // Basic validation
  if (!dob1 || !gender1 || !name1 || !dob2 || !gender2 || !name2) {
    return res
      .status(400)
      .json({ error: "Missing required query parameters for compatibility report." });
  }

  try {
    // Calculate data for both individuals
    // Calculate data for both individuals
    const person1Data = calculateNumerologyData(dob1, gender1);
    const person2Data = calculateNumerologyData(dob2, gender2);
    // --- Add Name Calculations ---
    const person1NameData = name1 ? calculateNameNumbers(name1) : null;
    const person2NameData = name2 ? calculateNameNumbers(name2) : null;
    // --- NEW: Add Grid Analysis ---
    const person1GridAnalysis = person1Data
      ? analyzeGrid(person1Data.gridNumbers, gridAnalysisDefinitions)
      : [];
    const person2GridAnalysis = person2Data
      ? analyzeGrid(person2Data.gridNumbers, gridAnalysisDefinitions)
      : [];
    console.log(
      `[/api/report/compatibility/pdf] Grid Analysis P1 (${name1}):`,
      person1GridAnalysis
    ); // <-- Add console log
    console.log(
      `[/api/report/compatibility/pdf] Grid Analysis P2 (${name2}):`,
      person2GridAnalysis
    ); // <-- Add console log

    if (!person1Data || !person2Data) {
      return res
        .status(400)
        .json({ error: "Invalid input data provided for one or both individuals." });
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
    const scoreM1M2 = getScore(m1, m2);
    const relationM1M2 = getRelationship(m1, m2);
    const scoreB1B2 = getScore(b1, b2);
    const relationB1B2 = getRelationship(b1, b2);
    const scoreM1B2 = getScore(m1, b2);
    const relationM1B2 = getRelationship(m1, b2);
    const scoreB1M2 = getScore(b1, m2);
    const relationB1M2 = getRelationship(b1, m2);
    const scoreM2M1 = getScore(m2, m1);
    const relationM2M1 = getRelationship(m2, m1);
    const scoreB2B1 = getScore(b2, b1);
    const relationB2B1 = getRelationship(b2, b1);
    const scoreM2B1 = getScore(m2, b1);
    const relationM2B1 = getRelationship(m2, b1);
    const scoreB2M1 = getScore(b2, m1);
    const relationB2M1 = getRelationship(b2, m1);

    // Calculate total score and percentage
    const totalScore =
      scoreM1M2 + scoreB1B2 + scoreM1B2 + scoreB1M2 + scoreM2M1 + scoreB2B1 + scoreM2B1 + scoreB2M1;
    const maxScore = 24; // 8 comparisons * 3 points max
    const compatibilityPercentage = Math.round((totalScore / maxScore) * 100);

    // Determine final verdict
    let finalVerdict = "";
    const allRelations = [
      relationM1M2,
      relationB1B2,
      relationM1B2,
      relationB1M2,
      relationM2M1,
      relationB2B1,
      relationM2B1,
      relationB2M1,
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
    const colors = {
      /* ... same colors as in /api/report/pdf ... */ primary: "#ff8c00",
      secondary: "#a0522d",
      text: "#333333",
      muted: "#666666",
      gridLine: "#cccccc",
      gridText: "#111111",
      gridBg: "#f9f9f9",
      heading: "#111111",
    };
    const fonts = {
      /* ... same fonts as in /api/report/pdf ... */ heading: "Helvetica-Bold",
      subheading: "Helvetica-Bold",
      body: "Helvetica",
      bodyBold: "Helvetica-Bold",
    };
    const margin = 50;
    const doc = new PDFDocument({ size: "A4", margin: margin });

    const filename = `Compatibility_Report_${name1}_${name2}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // --- PDF Content ---
    // Header
    doc
      .font(fonts.heading)
      .fontSize(20)
      .fillColor(colors.heading)
      .text("Numerology Compatibility Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .font(fonts.body)
      .fontSize(12)
      .fillColor(colors.muted)
      .text(`${name1} & ${name2}`, { align: "center" });
    doc.moveDown(2);

    // Section Helper (assuming it's defined globally or copy it here if needed)
    const addSection = (title, contentFn) => {
      doc
        .font(fonts.subheading)
        .fontSize(14)
        .fillColor(colors.secondary)
        .text(title, { underline: true });
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
            doc
              .font(fonts.bodyBold)
              .fontSize(10)
              .fillColor(colors.gridText)
              .text(cells[cellIndex], x, y + cellSize / 2 - 5, {
                width: cellSize,
                align: "center",
              });
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

        doc
          .font(fonts.bodyBold)
          .text("DOB:", textStartX, textStartY, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${dob} (${gender})`);
        doc.moveDown(0.5);

        doc
          .font(fonts.bodyBold)
          .text("Moolank:", textStartX, doc.y, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${data.moolank} (${houseMeanings[data.moolank] || "N/A"})`);
        doc.moveDown(0.5);

        doc
          .font(fonts.bodyBold)
          .text("Bhagyank:", textStartX, doc.y, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${data.bhagyank} (${houseMeanings[data.bhagyank] || "N/A"})`);
        doc.moveDown(0.5);

        doc
          .font(fonts.bodyBold)
          .text("Kua Number:", textStartX, doc.y, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${data.kua}`);
        doc.moveDown(0.5);

        // Add Moolank-Bhagyank Relation
        const mbRelation = moolankBhagyankRelations[data.moolank]?.[data.bhagyank];
        doc
          .font(fonts.bodyBold)
          .text(`Moolank-Bhagyank (${data.moolank}-${data.bhagyank}):`, textStartX, doc.y, {
            width: textWidth,
          });
        if (mbRelation) {
          doc
            .font(fonts.body)
            .text(`  ${mbRelation.indication || "N/A"} (Rating: ${mbRelation.rating || "N/A"})`, {
              width: textWidth,
            });
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
      breakdown.forEach((item) => {
        doc
          .font(fonts.body)
          .text(`  - ${item.n1} vs ${item.n2}: ${item.rel} (Score: ${item.score})`);
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

// --- Restored API Endpoint for Compatibility PDF Report Generation ---
// Note: Compatibility PDF does not use Gemini analysis, so no caching needed here.
app.get("/api/report/compatibility/pdf", async (req, res) => {
  const { dob1, gender1, name1, dob2, gender2, name2 } = req.query;

  // Basic validation
  if (!dob1 || !gender1 || !name1 || !dob2 || !gender2 || !name2) {
    return res
      .status(400)
      .json({ error: "Missing required query parameters for compatibility report." });
  }

  try {
    // Calculate data for both individuals
    const person1Data = calculateNumerologyData(dob1, gender1);
    const person2Data = calculateNumerologyData(dob2, gender2);
    // Name calculations are not strictly needed for the PDF content as defined, but good practice
    // const person1NameData = name1 ? calculateNameNumbers(name1) : null;
    // const person2NameData = name2 ? calculateNameNumbers(name2) : null;
    // Grid analysis is also not used in this specific PDF layout
    // const person1GridAnalysis = person1Data ? analyzeGrid(person1Data.gridNumbers, gridAnalysisDefinitions) : [];
    // const person2GridAnalysis = person2Data ? analyzeGrid(person2Data.gridNumbers, gridAnalysisDefinitions) : [];

    if (!person1Data || !person2Data) {
      return res
        .status(400)
        .json({ error: "Invalid input data provided for one or both individuals." });
    }

    // --- Compatibility Calculation ---
    const getScore = (num1, num2) => {
      /* ... scoring logic ... */ const rules1 = compatibilityData[num1];
      if (!rules1) return 1;
      if (rules1.friendly?.includes(num2)) return 3;
      if (rules1.enemy?.includes(num2)) return 0;
      return 1;
    };
    const getRelationship = (num1, num2) => {
      /* ... relationship logic ... */ const rules1 = compatibilityData[num1];
      if (!rules1) return "Neutral (No data)";
      if (rules1.friendly?.includes(num2)) return "Friendly";
      if (rules1.enemy?.includes(num2)) return "Enemy";
      return "Neutral";
    };
    const m1 = person1Data.moolank;
    const b1 = person1Data.bhagyank;
    const m2 = person2Data.moolank;
    const b2 = person2Data.bhagyank;
    const scoreM1M2 = getScore(m1, m2);
    const relationM1M2 = getRelationship(m1, m2);
    const scoreB1B2 = getScore(b1, b2);
    const relationB1B2 = getRelationship(b1, b2);
    const scoreM1B2 = getScore(m1, b2);
    const relationM1B2 = getRelationship(m1, b2);
    const scoreB1M2 = getScore(b1, m2);
    const relationB1M2 = getRelationship(b1, m2);
    const scoreM2M1 = getScore(m2, m1);
    const relationM2M1 = getRelationship(m2, m1);
    const scoreB2B1 = getScore(b2, b1);
    const relationB2B1 = getRelationship(b2, b1);
    const scoreM2B1 = getScore(m2, b1);
    const relationM2B1 = getRelationship(m2, b1);
    const scoreB2M1 = getScore(b2, m1);
    const relationB2M1 = getRelationship(b2, m1);
    const totalScore =
      scoreM1M2 + scoreB1B2 + scoreM1B2 + scoreB1M2 + scoreM2M1 + scoreB2B1 + scoreM2B1 + scoreB2M1;
    const maxScore = 24;
    const compatibilityPercentage = Math.round((totalScore / maxScore) * 100);
    let finalVerdict = "";
    const allRelations = [
      relationM1M2,
      relationB1B2,
      relationM1B2,
      relationB1M2,
      relationM2M1,
      relationB2B1,
      relationM2B1,
      relationB2M1,
    ];
    if (allRelations.includes("Enemy")) {
      finalVerdict = "Not Compatible (Due to Enemy Relationship)";
    } else {
      if (compatibilityPercentage >= 75) finalVerdict = "High Compatibility";
      else if (compatibilityPercentage <= 35) finalVerdict = "Low Compatibility";
      else finalVerdict = "Average Compatibility";
    }
    // --- End Compatibility Calculation ---

    // --- PDF Setup ---
    const colors = {
      /* ... same colors ... */ primary: "#ff8c00",
      secondary: "#a0522d",
      text: "#333333",
      muted: "#666666",
      gridLine: "#cccccc",
      gridText: "#111111",
      gridBg: "#f9f9f9",
      heading: "#111111",
    };
    const fonts = {
      /* ... same fonts ... */ heading: "Helvetica-Bold",
      subheading: "Helvetica-Bold",
      body: "Helvetica",
      bodyBold: "Helvetica-Bold",
    };
    const margin = 50;
    const doc = new PDFDocument({ size: "A4", margin: margin });
    const filename = `Compatibility_Report_${name1.replace(/\s+/g, "_")}_${name2.replace(/\s+/g, "_")}.pdf`; // Use names in filename
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // --- PDF Content ---
    // Header
    doc
      .font(fonts.heading)
      .fontSize(20)
      .fillColor(colors.heading)
      .text("Numerology Compatibility Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .font(fonts.body)
      .fontSize(12)
      .fillColor(colors.muted)
      .text(`${name1} & ${name2}`, { align: "center" });
    doc.moveDown(2);

    // Section Helper
    const addSection = (title, contentFn) => {
      /* ... same helper ... */ doc
        .font(fonts.subheading)
        .fontSize(14)
        .fillColor(colors.secondary)
        .text(title, { underline: true });
      doc.moveDown(0.7);
      doc.font(fonts.body).fontSize(10).fillColor(colors.text);
      contentFn();
      doc.moveDown(1.5);
    };
    // Grid Drawing Helper
    const drawLoShuGrid = (gridNumbers, startX, startY, cellSize = 30, gap = 3) => {
      /* ... same helper ... */ const positionMap = {
        4: 0,
        9: 1,
        2: 2,
        3: 3,
        5: 4,
        7: 5,
        8: 6,
        1: 7,
        6: 8,
      };
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
            doc
              .font(fonts.bodyBold)
              .fontSize(10)
              .fillColor(colors.gridText)
              .text(cells[cellIndex], x, y + cellSize / 2 - 5, {
                width: cellSize,
                align: "center",
              });
          }
        }
      }
      doc.restore();
      return startY + 3 * cellSize + 2 * gap;
    };

    // --- Individual Details Sections ---
    const addPersonSection = (name, dob, gender, data) => {
      addSection(`${name}'s Details`, () => {
        const gridStartY = doc.y;
        const gridWidth = 3 * 30 + 2 * 3;
        const gridStartX = doc.page.width - margin - gridWidth;
        const gridEndY = drawLoShuGrid(data.gridNumbers, gridStartX, gridStartY);
        const textStartY = gridStartY;
        const textStartX = margin;
        const textWidth = gridStartX - margin - 20;

        doc
          .font(fonts.bodyBold)
          .text("DOB:", textStartX, textStartY, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${dob} (${gender})`);
        doc.moveDown(0.5);
        doc
          .font(fonts.bodyBold)
          .text("Moolank:", textStartX, doc.y, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${data.moolank} (${houseMeanings[data.moolank] || "N/A"})`);
        doc.moveDown(0.5);
        doc
          .font(fonts.bodyBold)
          .text("Bhagyank:", textStartX, doc.y, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${data.bhagyank} (${houseMeanings[data.bhagyank] || "N/A"})`);
        doc.moveDown(0.5);
        doc
          .font(fonts.bodyBold)
          .text("Kua Number:", textStartX, doc.y, { width: textWidth, continued: true });
        doc.font(fonts.body).text(` ${data.kua}`);
        doc.moveDown(0.5);
        const mbRelation = moolankBhagyankRelations[data.moolank]?.[data.bhagyank];
        doc
          .font(fonts.bodyBold)
          .text(`Moolank-Bhagyank (${data.moolank}-${data.bhagyank}):`, textStartX, doc.y, {
            width: textWidth,
          });
        if (mbRelation) {
          doc
            .font(fonts.body)
            .text(`  ${mbRelation.indication || "N/A"} (Rating: ${mbRelation.rating || "N/A"})`, {
              width: textWidth,
            });
        } else {
          doc.font(fonts.body).text("  No specific data", { width: textWidth });
        }
        doc.y = Math.max(doc.y, gridEndY) + 10;
      });
    };
    addPersonSection(name1, dob1, gender1, person1Data);
    addPersonSection(name2, dob2, gender2, person2Data);

    // --- Compatibility Analysis Section ---
    addSection("Compatibility Analysis", () => {
      doc.font(fonts.bodyBold).text("Overall Compatibility Score: ", { continued: true });
      doc.font(fonts.body).text(`${totalScore} / ${maxScore} (${compatibilityPercentage}%)`);
      doc.moveDown(0.5);
      doc.font(fonts.bodyBold).text("General Indication: ", { continued: true });
      doc.font(fonts.body).text(finalVerdict);
      doc.moveDown(1);
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
      breakdown.forEach((item) => {
        doc
          .font(fonts.body)
          .text(`  - ${item.n1} vs ${item.n2}: ${item.rel} (Score: ${item.score})`);
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
  console.log(`Numerology API server listening on port ${port}`);
});

// --- NEW: API Endpoint for Team Win Percentage ---
app.post("/api/win-percentage", (req, res) => {
  console.log("Received request for /api/win-percentage"); // Log endpoint hit
  const { teamKey, matchDate } = req.body; // Expect team key (e.g., "CSK") and match date "YYYY-MM-DD"
  console.log(`Team Key: ${teamKey}, Match Date: ${matchDate}`); // Log input

  // --- Input Validation ---
  if (!teamKey || !matchDate) {
    return res.status(400).json({ error: "Missing required fields: teamKey and matchDate" });
  }

  // Log the state of iplTeamsData just before access
  console.log(
    `Attempting to access teamKey "${teamKey}" in iplTeamsData. Available keys: ${Object.keys(iplTeamsData).join(", ")}`
  );
  const teamInfo = iplTeamsData[teamKey];
  if (!teamInfo) {
    console.error(
      `Team data not found for key: ${teamKey}. iplTeamsData is potentially empty or missing keys.`
    );
    return res.status(404).json({ error: `Team data not found for key: ${teamKey}` });
  }

  const matchDateParts = matchDate.split("-");
  if (matchDateParts.length !== 3) {
    return res.status(400).json({ error: "Invalid matchDate format. Expected YYYY-MM-DD." });
  }
  const [matchYear, matchMonth, matchDay] = matchDateParts.map((p) => parseInt(p, 10));
  if (isNaN(matchYear) || isNaN(matchMonth) || isNaN(matchDay)) {
    return res.status(400).json({ error: "Invalid date components in matchDate." });
  }
  const matchDateParsed = { day: matchDay, month: matchMonth, year: matchYear };

  try {
    // --- Calculate Base Numbers ---
    const teamNumbers = calculateNumerologyData(teamInfo.dob, "Neutral"); // Gender might not apply to team DOB
    const captainNumbers = calculateNumerologyData(teamInfo.captainDob, "Neutral"); // Assume neutral or fetch actual gender if needed
    const matchNumbers = calculateNumerologyData(matchDate, "Neutral");

    if (!teamNumbers || !captainNumbers || !matchNumbers) {
      console.error("Failed to calculate base numbers for team, captain, or match date.");
      return res.status(500).json({ error: "Internal error during number calculation." });
    }

    // --- Calculate Compatibility Scores (CCS & TCS) ---
    const ccs = calculateCompatibilityScore(captainNumbers, matchNumbers, compatibilityData);
    const tcs = calculateCompatibilityScore(teamNumbers, matchNumbers, compatibilityData);

    // --- Calculate Time Factor Scores ---
    // Helper to parse DOB string into parts
    const parseDob = (dobString) => {
      const parts = dobString.split("-");
      return {
        day: parseInt(parts[2], 10),
        month: parseInt(parts[1], 10),
        year: parseInt(parts[0], 10),
      };
    };
    const teamDobParts = parseDob(teamInfo.dob);
    const captainDobParts = parseDob(teamInfo.captainDob);

    const captainTimeScore = calculateTimeFactorScore(
      captainDobParts,
      matchDateParsed,
      matchNumbers,
      compatibilityData
    );
    const teamTimeScore = calculateTimeFactorScore(
      teamDobParts,
      matchDateParsed,
      matchNumbers,
      compatibilityData
    );

    // Average the time scores for the final Time Factor Score
    const finalTimeFactorScore = Math.round((captainTimeScore + teamTimeScore) / 2);

    // --- Apply Weighted Formula ---
    const winPercentage = 0.4 * ccs + 0.4 * tcs + 0.2 * finalTimeFactorScore;

    // --- Return Result ---
    res.json({
      team: teamInfo.fullName,
      captain: teamInfo.captain,
      matchDate: matchDate,
      captainCompatibilityScore: ccs,
      teamCompatibilityScore: tcs,
      timeFactorScore: finalTimeFactorScore,
      calculatedWinPercentage: Math.round(winPercentage), // Round to nearest whole number
    });
  } catch (error) {
    console.error("Win Percentage Calculation error:", error);
    res
      .status(500)
      .json({ error: "An internal server error occurred during win percentage calculation." });
  }
});
