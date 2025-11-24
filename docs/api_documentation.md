# Backend API Documentation

The backend is built with Express.js and provides endpoints for numerology calculations and report generation.

## Base URL
`http://localhost:3001` (Default)

## Endpoints

### 1. Calculate Numerology
Calculates core numbers (Moolank, Bhagyank, Kua), generates the Lo Shu grid, and provides AI-enhanced interpretations.

- **URL**: `/api/calculate`
- **Method**: `POST`
- **Rate Limit**: 100 requests / 15 mins (per IP)
- **Request Body**:
  ```json
  {
    "dob": "YYYY-MM-DD",  // Required
    "gender": "Male" | "Female", // Required
    "name": "Full Name"   // Optional
  }
  ```
- **Response**:
  - `moolank`, `bhagyank`, `kua`: Calculated numbers.
  - `gridNumbers`: Array of numbers for the Lo Shu grid.
  - `gridAnalysis`: Array of planes/arrows found in the grid.
  - `moolankMeaning`: Object containing `analysis` (AI rewritten), `conversationalSummaryParagraphs` (AI generated), `keywords`, etc.
  - `nameNumerology`: (If name provided) `destinyNumber`, `soulUrgeNumber`, `personalityNumber`.
  - `missingNumbersInfo`: Array of missing numbers and remedies.
  - `repeatingNumbersInfo`: Array of repeating numbers and impacts.

### 2. Generate PDF Report
Generates a downloadable PDF report containing the grid, core numbers, and analysis.

- **URL**: `/api/report/pdf`
- **Method**: `GET`
- **Query Parameters**:
  - `dob`: `YYYY-MM-DD` (Required)
  - `gender`: `Male` | `Female` (Required)
  - `name`: String (Optional)
- **Response**: Binary PDF file stream. `Content-Type: application/pdf`.

## Data Models

Static JSON data is stored in `api/data/` and loaded on server start:
- `houseMeanings.json`: Meanings for Bhagyank numbers.
- `moolankMeanings.json`: Detailed analysis for Moolank numbers.
- `compatibilityData.json`: Rules for number compatibility.
- `gridAnalysisDefinitions.json`: Definitions for Lo Shu grid planes/arrows.
- `iplTeams.json`: Data for IPL team win percentage calculator.

## AI Integration (Google Gemini)

The server uses Google's Generative AI (`gemini-2.0-flash`) for:
1.  **Rewriting Analysis**: Rewrites static interpretations to be unique and engaging.
2.  **Summarization**: Generates conversational summaries of Moolank traits.

### Caching
To optimize performance and reduce API costs, AI responses are cached in-memory:
- **Key**: `${dob}-${gender}-${normalizedName}`
- **Duration**: 15 minutes
