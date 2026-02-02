# External Integrations

**Analysis Date:** 2026-02-01

## APIs & External Services

**AI & Content Generation:**
- Google Gemini AI - Used for rewriting numerology analysis and generating conversational summaries.
  - SDK/Client: `@google/generative-ai`
  - Auth: `GEMINI_API_KEY` (env var)
  - Usage in: `api/server.js`

**Payments:**
- PhonePe - Payment gateway integration (currently mocked).
  - Implementation: `api/services/phonePeService.js`
  - Auth: `SALT_KEY`, `MERCHANT_ID` (mocked)

## Data Storage

**Databases:**
- Firebase Firestore
  - Connection: `digit-destiny` (Project ID)
  - Client: `firebase-admin/firestore` (Backend), `firebase/firestore` (Frontend)
  - Usage: Storing payment records in `payments` collection.

**Local Data:**
- JSON Data Store - Extensive numerology data stored in local files.
  - Location: `api/data/` (e.g., `houseMeanings.json`, `moolankMeanings.json`, `personalYearMeanings.json`)

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
  - Implementation: Google Auth Provider
  - Frontend: `src/context/AuthContext.jsx` and `src/firebaseConfig.js`
  - Backend: JWT verification in `api/server.js` using `firebase-admin`.

## Monitoring & Observability

**Logs:**
- Console Logging - Standard `console.log` and `console.error` throughout the API.
- Gemini Init/Check Logs: Explicit startup checks for Gemini connectivity in `api/server.js`.

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting (inferred)
  - Config: `firebase.json`, `.firebaserc`

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Critical for AI features.
- `PORT` - API listening port (defaults to 3001).

**Secrets location:**
- `api/.env` (Backend secrets)
- `src/firebaseConfig.js` (Frontend public Firebase config)

## Webhooks & Callbacks

**Incoming:**
- `/api/payment-callback` (Referenced in `api/services/phonePeService.js` mock)

---

*Integration audit: 2026-02-01*
