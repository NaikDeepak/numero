# Testing Patterns

**Analysis Date:** 2026-02-01

## Test Framework

**Runner:**
- Vitest ^3.1.1
- Config: `vite.config.js` (integration in `test` object)

**Assertion Library:**
- Vitest's built-in `expect` (compatible with Jest).

**Run Commands:**
```bash
npm test              # Run tests using vitest
```

## Test File Organization

**Location:**
- Co-located with implementation in `utils/` directories.
- Example: `api/utils/numerologyUtils.test.js`

**Naming:**
- `[filename].test.js`

**Structure:**
```
api/utils/
├── numerologyUtils.js
└── numerologyUtils.test.js
```

## Test Structure

**Suite Organization:**
```javascript
import { describe, it, expect } from "vitest";

describe("Suite Name", () => {
  it("should perform a specific task", () => {
    // ...
  });
});
```

**Patterns:**
- `describe` blocks used to group related tests (e.g., specific functions).
- `it` or `test` for individual cases.
- Grouping by input validity (Valid Inputs vs Invalid Inputs).

## Mocking

**Framework:** Vitest (built-in `vi` or globals).

**Patterns:**
```javascript
// Minimal mocking observed in existing tests.
// For components, jsdom is configured in vite.config.js.
```

**What to Mock:**
- API calls (not yet seen in existing tests but implied by `jsdom` setup).
- External SDKs (e.g., Gemini, PhonePe).

**What NOT to Mock:**
- Pure utility functions (e.g., `numerologyUtils.js`).

## Fixtures and Factories

**Test Data:**
- Literal objects and strings defined directly within test cases.
- Example: `calculateNumerologyData("1990-10-28", "Male")`

**Location:**
- Inline within test files.

## Coverage

**Requirements:** None explicitly enforced in configuration.

**View Coverage:**
```bash
# Not explicitly defined in scripts, but vitest supports it via:
npx vitest run --coverage
```

## Test Types

**Unit Tests:**
- Focused on logic in `api/utils/numerologyUtils.js`.
- High coverage for mathematical and logical calculations.

**Integration Tests:**
- Not explicitly found, but `jsdom` setup in `vite.config.js` suggests intent for component testing.

**E2E Tests:**
- Not detected.

## Common Patterns

**Async Testing:**
- Not observed in utility tests, but required for API/Gemini integration tests.

**Error Testing:**
- Explicit tests for invalid inputs returning `null`.
- Example: `should return null for invalid date format`.

---

*Testing analysis: 2026-02-01*
