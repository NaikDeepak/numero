# Phase 7: Enhanced Compatibility Reports & Remedies - Research

**Researched:** 2026-02-02
**Domain:** Numerology Compatibility & Remedial Measures
**Confidence:** HIGH

## Summary
This phase focuses on deepening the compatibility report by adding structured numerological data (Lo Shu Grids, Missing Numbers) and actionable remedies. We will leverage existing JSON data for remedies and extend the current PDF generation logic to support dual-profile reports.

**Primary recommendation:** Use a deterministic approach for "Missing Numbers" and "Remedies" while using AI to synthesize the "how they complete each other" narrative.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pdfkit | ^0.15.0 | PDF Generation | Already used in `src/lib/pdf/generator.ts` |
| framer-motion | ^10.16.4 | Animations | Used for UI transitions and grid rendering |
| lucide-react | ^0.284.0 | Icons | Project standard for iconography |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown | ^9.0.0 | Rendering AI text | Used in `CompatibilityResult` |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── numerology/
│   │   └── remedies.ts      # New: Logic to extract missing numbers and map remedies
│   └── pdf/
│       └── compatibility.ts # New: PDF layout for dual-profile reports
├── components/
│   └── numerology/
│       ├── compatibility-grid.tsx  # New: Side-by-side Lo Shu grids
│       └── remedy-section.tsx      # New: UI for displaying missing number remedies
```

### Pattern 1: Deterministic Analysis + AI Synthesis
Don't ask AI to "find missing numbers". Calculate them in code and pass the list to the AI prompt or display them directly from the JSON data. This ensures 100% accuracy for the "Remedies" section.

### Anti-Patterns to Avoid
- **Duplicating Logic:** Don't rewrite the Lo Shu grid SVG/CSS. Refactor `LoShuGrid.tsx` to be reusable or create a `ComparisonGrid` that composes it.
- **Client-side PDF:** Avoid `html2canvas` for reports. The current `pdfkit` server-side approach is more professional and consistent.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Remedy Content | Custom Strings | `api/data/missingNumberRemedies.json` | Already contains curated content for all 9 numbers. |
| Grid Calculation | New Logic | `calculateNumerologyData` | The engine already produces the correct `gridNumbers` array. |

## Common Pitfalls

### Pitfall 1: Bloated PDF Prompt
**What goes wrong:** Passing too much data to Gemini causes generic summaries.
**How to avoid:** Specifically ask for the "Synergy" and "Completion" narrative, but use local code/JSON for the "Remedies" and "Number Meanings" sections.

### Pitfall 2: Mobile Grid Overflow
**What goes wrong:** Two Lo Shu grids side-by-side will break on mobile.
**How to avoid:** Stack them vertically on mobile (`flex-col`) and side-by-side on desktop (`md:flex-row`).

## Code Examples

### Calculating Missing Numbers & Remedies
```typescript
// Proposed in src/lib/numerology/remedies.ts
import remediesData from '@/api/data/missingNumberRemedies.json';

export function getMissingNumbers(gridNumbers: number[]) {
  const present = new Set(gridNumbers);
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !present.has(n));
}

export function getRemediesForUser(gridNumbers: number[]) {
  const missing = getMissingNumbers(gridNumbers);
  return missing.map(num => ({
    number: num,
    ...remediesData[num as keyof typeof remediesData]
  }));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic Compatibility | Profile-specific Grid Analysis | Phase 7 | Users see *why* they match based on missing number completion. |

## Open Questions

1. **Overlay vs Side-by-Side:** Should we offer an "Overlay" grid view where Person A and Person B numbers are highlighted in different colors on one grid?
   - *Recommendation:* Start with side-by-side for clarity, consider overlay as a "Synergy Grid" visual.
2. **Export Format:** Should we support PNG export for social sharing?
   - *Recommendation:* Stick to PDF for Phase 7, add "Share Image" in a later UI-specific phase.

## Sources

### Primary (HIGH confidence)
- `api/data/missingNumberRemedies.json` - Content for remedies.
- `src/lib/pdf/generator.ts` - Existing PDF implementation reference.
- `src/lib/numerology/grid-utils.ts` - Grid analysis logic.

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: MEDIUM

**Research date:** 2026-02-02
**Valid until:** 2026-03-02
