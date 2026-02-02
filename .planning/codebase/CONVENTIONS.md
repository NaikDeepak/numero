# Coding Conventions

**Analysis Date:** 2026-02-01

## Naming Patterns

**Files:**
- React Components: PascalCase. Example: `src/components/PremiumLock.jsx`, `src/pages/GridCalculator.jsx`
- Utility/Logic Files: camelCase. Example: `api/utils/numerologyUtils.js`, `api/server.js`
- Style Files: kebab-case or plain. Example: `src/index.css`

**Functions:**
- Standard functions: camelCase. Example: `calculateNumerologyData`, `reduceToSingleDigit`
- React Components: PascalCase. Example: `GridCalculator`, `UserCard`

**Variables:**
- Standard variables: camelCase. Example: `currentNum`, `isPremiumUnlocked`
- Constants: UPPER_SNAKE_CASE. Example: `API_BASE_URL`, `CACHE_DURATION_MS`

**Types:**
- JavaScript/React environment (no TypeScript detected), so type naming patterns are not applicable.

## Code Style

**Formatting:**
- Prettier is used for formatting.
- Config file: `.prettierrc.json`
- Key settings: `semi: true`, `trailingComma: "es5"`, `singleQuote: false`, `tabWidth: 2`, `printWidth: 100`

**Linting:**
- ESLint is configured.
- Rules defined in `package.json` lint script: `eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0`
- Plugins: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

## Import Organization

**Order:**
1. React and third-party libraries: `import React from "react";`
2. Local components: `import NumerologyGrid from "../NumerologyGrid";`
3. Utility functions: `import { calculateNumerologyData } from "./utils/numerologyUtils.js";`
4. Style files: `import "./index.css";`

**Path Aliases:**
- Not detected. Relative paths are used. Example: `../components/ResultCard`

## Error Handling

**Patterns:**
- Frontend: `try-catch` blocks around API calls with `console.error` and `alert` for user feedback. Example: `src/pages/GridCalculator.jsx`
- Backend: `try-catch` blocks in middleware and route handlers, returning JSON error responses. Example: `api/server.js`

## Logging

**Framework:** `console` (standard)

**Patterns:**
- `console.log` for initialization and success checks.
- `console.error` and `console.warn` for failures and configuration issues.
- Detailed logging for integration status (e.g., Gemini initialization).

## Comments

**When to Comment:**
- Section headers in large files: `// --- Section Name ---`
- Function-level descriptions for complex logic.
- TODOs/FIXMEs for pending improvements.

**JSDoc/TSDoc:**
- Used for core utility functions in `api/utils/numerologyUtils.js` to define parameters and return types.

## Function Design

**Size:** Functions tend to be descriptive and focused on a single task (e.g., `sumDigits`).

**Parameters:** Named parameters passed directly.

**Return Values:** Usually objects or primitives. `null` is returned for invalid inputs.

## Module Design

**Exports:**
- Default exports for React components.
- Named exports for utility functions.

**Barrel Files:**
- Not widely used; imports are direct from files.

---

*Convention analysis: 2026-02-01*
