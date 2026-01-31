---
phase: 01-foundation-setup
plan: 03
subsystem: backend-infrastructure
tags: [firebase, vercel, nextjs, deployment]
requires: ["01-01", "01-02"]
provides: [firebase-sdk-init, deployment-config, deployment-guide]
affects: [auth-integration, database-ops, production-hosting]
tech-stack:
  added: [firebase@12.8.0, vercel-cli]
  patterns: [firebase-singleton, environment-variable-contracts]
key-files:
  created: [src/lib/firebase.ts, .env.example, .planning/phases/01-foundation-setup/DEPLOYMENT.md]
  modified: [vercel.json, biome.json, .gitignore]
decisions:
  - id: firebase-singleton
    choice: getApps() check pattern
    rationale: Prevents "Firebase app already exists" errors during Next.js Hot Module Replacement (HMR).
  - id: backend-only-firebase
    choice: Vercel for hosting, Firebase for services
    rationale: Leverages Vercel's superior Next.js optimization while using Firebase's proven Auth/Firestore.
  - id: deployment-region
    choice: iad1 (US East)
    rationale: Aligning frontend hosting with Firebase backend region for minimal latency.
metrics:
  duration: 300
  tasks: 3
  commits: 4
completed: 2026-02-01
---

# Phase 01 Plan 03: Firebase & Vercel Summary

**One-liner:** Initialized Firebase SDK with singleton pattern and configured Vercel for production-ready deployment.

## What Was Built

This plan connected the Next.js frontend to the backend services (Firebase) and established the production deployment pipeline.

### Task Breakdown

1. **Firebase Initialization** (55b59d2)
   - Installed Firebase v12 SDK.
   - Created `src/lib/firebase.ts` using a singleton pattern to handle Next.js dev mode reloads.
   - Exported `app`, `auth`, and `db` for application-wide use.
   - Created `.env.example` to define the environment variable contract.

2. **Vercel Configuration** (e91e68e)
   - Linked the local repository to the Vercel project.
   - Created a optimized `vercel.json` targeting the `iad1` region.
   - Verified that the production build (`pnpm build`) succeeds locally.
   - Updated `biome.json` to include JSON files in linting/formatting.

3. **Deployment Documentation** (c6a348d)
   - Created a comprehensive `DEPLOYMENT.md` guide.
   - Provided instructions for retrieving Firebase config and setting up Vercel environment variables.
   - Included troubleshooting steps for common deployment hurdles.

## Technical Details

### Firebase Singleton
```typescript
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}
```
This pattern is critical for Next.js development to avoid re-initialization errors when code changes trigger hot-reloads.

### Deployment Strategy
- **Frontend:** Vercel (Next.js native optimizations).
- **Backend:** Firebase Auth + Firestore.
- **Latency:** Both pinned to US-East (iad1) to minimize round-trip times for API calls and database operations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Biome pre-commit hook failure**
- **Found during:** Task 2 commit
- **Issue:** Biome was configured to run on all files via `biome check .` but its `includes` list was too restrictive, causing it to error when `vercel.json` was processed.
- **Fix:** Updated `biome.json` to include `*.json` in the processed files list.
- **Files modified:** `biome.json`
- **Commit:** `e91e68e`

## Next Phase Readiness

The infrastructure foundation is now complete. The app is ready for:
1. User authentication (Phase 2).
2. Database operations (Phase 2).
3. Production deployment (upon user providing credentials).
