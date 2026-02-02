# Architecture

**Analysis Date:** 2026-02-01

## Pattern Overview

**Overall:** Client-Server Monolith (SPA + API)

**Key Characteristics:**
- **React-based Frontend:** Single Page Application (SPA) using React 18 and Vite for development/build.
- **Express-based API:** Node.js backend providing numerology calculations and external service orchestration.
- **Data-Driven Logic:** Numerology interpretations are separated into JSON datasets, making the engine configurable.

## Layers

**Frontend Layer:**
- Purpose: User interface and application state management.
- Location: `src/`
- Contains: React components, pages, context providers, and CSS.
- Depends on: API Layer (via HTTP fetches).
- Used by: End users via browser.

**API Layer:**
- Purpose: RESTful endpoints for calculations, payment processing, and PDF generation.
- Location: `api/server.js`
- Contains: Express routes, rate limiting, and auth middleware.
- Depends on: Logic Layer, Data Layer, External Services.
- Used by: Frontend Layer.

**Logic Layer:**
- Purpose: Core numerology algorithms and data processing.
- Location: `api/utils/numerologyUtils.js`
- Contains: Mathematical functions for Moolank, Bhagyank, Kua, and name calculations.
- Depends on: Data Layer (for rules).
- Used by: API Layer.

**Data Layer:**
- Purpose: Static datasets for interpretations and lookup tables.
- Location: `api/data/`
- Contains: JSON files for meanings, compatibility, and team data.
- Depends on: None.
- Used by: API Layer, Logic Layer.

## Data Flow

**Numerology Calculation Flow:**

1. User enters DOB/Name in `src/pages/GridCalculator.jsx`.
2. Frontend sends POST request to `/api/calculate`.
3. `api/server.js` invokes `calculateNumerologyData` and `analyzeGrid` from `api/utils/numerologyUtils.js`.
4. Logic Layer pulls interpretations from `api/data/*.json`.
5. API Layer optionally calls Google Gemini AI for conversational analysis.
6. JSON response returned to frontend and rendered in `src/NumerologyGrid.jsx` and `src/components/ResultCard.jsx`.

**State Management:**
- **Global Auth State:** Managed via `src/context/AuthContext.jsx` using Firebase Authentication.
- **UI State:** Managed via React `useState` and `useEffect` hooks within individual components.

## Key Abstractions

**Numerology Calculation Engine:**
- Purpose: Centralized logic for all numerology math.
- Examples: `calculateNumerologyData`, `calculateNameNumbers` in `api/utils/numerologyUtils.js`.
- Pattern: Functional utility library.

**Report Generator:**
- Purpose: PDF generation for detailed insights.
- Examples: `api/server.js` (PDFKit integration) and `api/utils/reportGenerator.js`.
- Pattern: Stream-based document generation.

## Entry Points

**Frontend Entry:**
- Location: `src/index.jsx`
- Triggers: Browser page load.
- Responsibilities: Mounts React application, provides `BrowserRouter` and `AuthProvider`.

**Backend Entry:**
- Location: `api/server.js`
- Triggers: Node.js execution.
- Responsibilities: Initializes Express, configures middleware (CORS, Rate Limit), connects to Firebase Admin, and defines routes.

## Error Handling

**Strategy:** Middleware-based error catching and consistent JSON error responses.

**Patterns:**
- **Input Validation:** API routes check for required fields (e.g., `dob`, `gender`) and return 400 status on failure.
- **Graceful Degradation:** Gemini AI integration has fallbacks to static JSON text if the API key is missing or calls fail.

## Cross-Cutting Concerns

**Logging:** Backend uses `console.log` for request tracking; some logs are written to `backend.log`.
**Validation:** Basic field validation in API routes; data type checking in `numerologyUtils.js`.
**Authentication:** Firebase ID token verification via `verifyToken` middleware in `api/server.js`.

---

*Architecture analysis: 2026-02-01*
