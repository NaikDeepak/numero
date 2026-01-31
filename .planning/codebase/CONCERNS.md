# Codebase Concerns

**Analysis Date:** 2026-02-01

## Tech Debt

**Monolithic Server File:**
- Issue: `api/server.js` is over 1600 lines long and handles routing, Firebase initialization, Gemini AI integration, PDF generation, and payment verification.
- Files: `api/server.js`
- Impact: Difficult to maintain, test, and scale. High risk of side effects when making changes.
- Fix approach: Refactor into separate modules (routes, controllers, services, middleware).

**Large React Components:**
- Issue: `src/pages/GridCalculator.jsx` and `src/pages/CompatibilityChecker.jsx` contain extensive logic for data fetching, state management, and UI rendering.
- Files: `src/pages/GridCalculator.jsx`, `src/pages/CompatibilityChecker.jsx`
- Impact: Hard to read and test. Difficult to reuse logic across different calculators.
- Fix approach: Extract business logic into custom hooks and UI into smaller, reusable components.

**Simulated Payment Flow:**
- Issue: Payment process uses a hardcoded 2-second timeout to simulate a redirect.
- Files: `src/pages/GridCalculator.jsx`
- Impact: Not a real integration; will break or be highly confusing if moving to a real payment gateway.
- Fix approach: Implement a proper webhook-based or redirect-based payment flow with a real sandbox environment.

## Security Considerations

**API Key Exposure in Logs:**
- Issue: The server logs the first 4 characters of the `GEMINI_API_KEY`.
- Files: `api/server.js`
- Current mitigation: Only logs a prefix, not the full key.
- Recommendations: Remove all API key logging. Use environment variable validation instead.

**Permissive CORS Policy:**
- Issue: CORS is enabled for all origins using `app.use(cors())`.
- Files: `api/server.js`
- Current mitigation: None.
- Recommendations: Restrict allowed origins to specific production and development domains.

**Firebase Admin Initialization:**
- Issue: Initialized with only `projectId`, potentially relying on local environment credentials.
- Files: `api/server.js`
- Current mitigation: Try-catch block around initialization.
- Recommendations: Use a service account key file path or environment variable for more robust authentication in different environments.

## Performance Bottlenecks

**Synchronous File Loading:**
- Issue: Multiple JSON data files are loaded synchronously using `require` at server startup.
- Files: `api/server.js`
- Cause: Using `createRequire` and `path.resolve` for multiple `loadJsonData` calls.
- Improvement path: Switch to asynchronous file reading or use ESM dynamic imports for data if appropriate.

**Synchronous Gemini Integration:**
- Issue: Gemini AI rewrites and summaries are generated within the main request-response cycle for `/api/calculate`.
- Files: `api/server.js`
- Cause: Waiting for AI response before sending the calculation result to the client.
- Improvement path: Offload AI tasks to background jobs or use a streaming response if the UI supports it.

## Fragile Areas

**Date Parsing Logic:**
- Issue: Relies on `YYYY-MM-DD` string splitting with `-`.
- Files: `api/utils/numerologyUtils.js`, `api/server.js`
- Why fragile: Breaks if different date formats are sent from the client or if the browser's date input behaves differently.
- Safe modification: Use a robust date library (like `date-fns` or `dayjs`) for parsing and validation.

**Hardcoded API Fallbacks:**
- Issue: Falls back to `http://localhost:3001/api` if environment variable is missing.
- Files: `src/pages/GridCalculator.jsx`
- Why fragile: Can lead to "failed to connect" errors in staging/production if environment variables aren't perfectly synced.
- Safe modification: Fail loudly if required configuration is missing during build time.

## Test Coverage Gaps

**Integration and E2E Tests:**
- What's not tested: API endpoints, payment flow, and complex UI interactions in `GridCalculator`.
- Files: `api/server.js`, `src/pages/GridCalculator.jsx`
- Risk: Regressions in core business logic or payment verification could go unnoticed.
- Priority: High

**AI Response Handling:**
- What's not tested: How the system handles unexpected or malformed responses from Gemini AI.
- Files: `api/server.js`
- Risk: Potential crashes or poor UX if the AI returns unexpected text formats.
- Priority: Medium

---

*Concerns audit: 2026-02-01*
