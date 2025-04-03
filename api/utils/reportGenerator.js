import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get the directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load JSON data safely
function loadJsonData(filePath) {
  try {
    const absolutePath = path.resolve(__dirname, filePath);
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading JSON data from ${filePath}:`, error);
    return {}; // Return empty object on error
  }
}

// Load data using the helper function
const houseMeanings = loadJsonData("../data/houseMeanings.json");
const moolankBhagyankRelations = loadJsonData("../data/moolankBhagyankRelations.json");
const missingNumberRemedies = loadJsonData("../data/missingNumberRemedies.json");
const repeatingNumberImpact = loadJsonData("../data/repeatingNumberImpact.json");
// Note: compatibilityData is not used in this basic report

/**
 * Generates a basic numerology report string.
 * @param {object} numerologyData - The calculated data { moolank, bhagyank, kua, gridNumbers }.
 * @returns {string} A formatted numerology report string.
 */
function generateNumerologyReport(numerologyData) {
  if (!numerologyData) {
    return "Could not generate report due to missing calculation data.";
  }

  const { moolank, bhagyank, gridNumbers } = numerologyData;
  let report = "Numerology Report:\n\n";

  // --- Moolank and Bhagyank Meanings ---
  report += `Moolank (Root Number): ${moolank}\n`;
  if (houseMeanings[moolank]) {
    report += `  Meaning: ${houseMeanings[moolank]}\n`;
  }
  report += `Bhagyank (Destiny Number): ${bhagyank}\n`;
  if (houseMeanings[bhagyank]) {
    report += `  Meaning: ${houseMeanings[bhagyank]}\n\n`;
  }

  // --- Moolank-Bhagyank Relationship ---
  report += `Moolank-Bhagyank (${moolank}-${bhagyank}) Relationship:\n`;
  if (moolankBhagyankRelations[moolank] && moolankBhagyankRelations[moolank][bhagyank]) {
    const relation = moolankBhagyankRelations[moolank][bhagyank];
    report += `  Rating: ${relation.rating || "N/A"}\n`;
    report += `  Indication: ${relation.indication || "N/A"}\n\n`;
  } else {
    report += "  No specific data for this combination.\n\n";
  }

  // --- Repeating Numbers Impact ---
  report += "Impact of Repeating Numbers in Chart:\n";
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
        report += `  - ${repeatSequence}: ${repeatingNumberImpact[repeatSequence]}\n`;
        repeatingFound = true;
      } else if (counts[num] > 0 && repeatingNumberImpact[num]) {
        // Fallback for single number if sequence not found (e.g., 55555 not defined, use 5)
        // This might not be desired, adjust logic if needed.
        // report += `  - ${num} (repeated ${counts[num]} times): ${repeatingNumberImpact[num]} (Base impact)\n`;
      }
    }
  }
  if (!repeatingFound) {
    report +=
      "  No significant repeating number patterns found with specific impacts in the data.\n";
  }
  report += "\n";

  // --- Missing Numbers Impact and Remedies ---
  report += "Missing Numbers Analysis:\n";
  const presentNumbers = new Set(gridNumbers);
  let missingFound = false;
  for (let i = 1; i <= 9; i++) {
    if (!presentNumbers.has(i)) {
      missingFound = true;
      const numStr = i.toString();
      report += `  Missing Number: ${numStr}\n`;
      if (missingNumberRemedies[numStr]) {
        report += `    Impact: ${missingNumberRemedies[numStr].impact.join(" ")}\n`;
        report += `    Remedies: ${missingNumberRemedies[numStr].remedies.join("; ")}\n`;
      } else {
        report += "    No specific impact/remedy data found.\n";
      }
    }
  }
  if (!missingFound) {
    report += "  No missing numbers (1-9) found in the chart.\n";
  }

  return report;
}

export { generateNumerologyReport };
