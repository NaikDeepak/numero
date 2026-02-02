# Technology Stack

**Analysis Date:** 2026-02-01

## Languages

**Primary:**
- JavaScript (ES Modules) - Used throughout the frontend and backend.

## Runtime

**Environment:**
- Node.js (Backend) - Powers the Express server in `api/server.js`.
- Browser (Frontend) - Standard web environment for the React application.

**Package Manager:**
- npm - `package-lock.json` present.
- yarn - `yarn.lock` present.
- Lockfile: Both present (standardize on one is recommended).

## Frameworks

**Core:**
- React 18.2.0 - Frontend UI framework.
- Express 4.21.2 - Backend API framework in `api/server.js`.
- Vite 5.0.8 - Frontend build tool and dev server.

**Testing:**
- Vitest 3.1.1 - Unit testing framework for the codebase.

**Build/Dev:**
- ESLint 8.55.0 - Linting.
- Prettier 3.5.3 - Formatting.

## Key Dependencies

**Critical:**
- `@google/generative-ai` ^0.24.0 - Integration with Google Gemini for AI-driven numerology interpretations.
- `firebase` ^12.6.0 - Client-side Firebase SDK for Auth and Firestore.
- `firebase-admin` ^13.6.0 - Server-side Firebase SDK for token verification and Firestore access.
- `pdfkit` ^0.15.0 - Used for generating numerology report PDFs in `api/server.js`.

**Infrastructure:**
- `react-router-dom` ^6.25.1 - Client-side routing.
- `cors` ^2.8.5 - Cross-Origin Resource Sharing for the API.
- `express-rate-limit` ^7.4.0 - API rate limiting, especially for Gemini routes.
- `dotenv` ^16.4.5 - Environment variable management.

## Configuration

**Environment:**
- `.env` files - Managed via `dotenv` in `api/server.js`.
- Key configs required: `GEMINI_API_KEY`, `PORT`.

**Build:**
- `package.json` scripts: `dev`, `build`, `preview`, `test`, `lint`, `format`.

## Platform Requirements

**Development:**
- Node.js environment.

**Production:**
- Deployment target: Firebase (inferred from `firebase.json` and `.firebaserc`).

---

*Stack analysis: 2026-02-01*
