# Phase 02: Core Numerology - Research

**Researched:** 2026-02-01
**Domain:** Numerology Calculations, Lo Shu Grid, Data Persistence
**Confidence:** HIGH

## Summary

This phase involves porting the core "brain" of the numerology application from the legacy JS codebase to the new Next.js 16 TypeScript environment. The research confirms that the logic is stable and well-documented in `api/utils/numerologyUtils.js`.

The standard approach for this phase is a "Clean Port": move logic to a dedicated `src/lib/numerology` directory with strict typing, use Zod for validation of user inputs (DOB/Name), and implement the Lo Shu grid as a CSS Grid component. Data interpretations will be served from the existing JSON files, which are already well-structured.

**Primary recommendation:** Centralize all calculation logic in a stateless `src/lib/numerology/engine.ts` and use a Zod-validated "Profile" object for local persistence via Zustand or a custom hook.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | ^3.24 | Input Validation | Type-safe schema definitions and parsing for DOB/Name. |
| date-fns | ^3.5 | Date Manipulation | Reliable parsing and formatting of DD/MM/YYYY inputs. |
| Framer Motion | ^11.0 | Animations | Standard for staggered reveal of grid cells and hero cards. |
| Zustand | ^5.0 | State Persistence | Lightweight state for managing local profiles and calculation history. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | ^0.474 | UI Icons | Modern iconography for elements (Fire, Water, etc.). |
| clsx / tailwind-merge | latest | Dynamic Styling | Handling conditional elemental colors in grid cells. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Context + LocalStorage | More boilerplate; Zustand handles persistence middleware out of the box. |
| Framer Motion | CSS Transitions | Less control over complex stagger timings. |

**Installation:**
```bash
npm install zod date-fns framer-motion zustand lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── numerology/    # The "Engine"
│       ├── types.ts   # Shared Zod schemas and TS interfaces
│       ├── engine.ts  # Calculation logic (Moolank, Bhagyank, Grid)
│       ├── data.ts    # JSON interpretation loaders
│       └── utils.ts   # Formatting helpers (e.g., number reduction)
├── components/
│   ├── numerology/    # Phase-specific components
│   │   ├── input-form.tsx
│   │   ├── lo-shu-grid.tsx
│   │   └── result-card.tsx
│   └── ui/            # Shadcn base components
└── store/             # Zustand stores
    └── use-profile-store.ts
```

### Pattern 1: Stateless Calculation Engine
The engine should be pure functions that take a DOB and Name and return a structured `NumerologyResult`.
```typescript
// src/lib/numerology/engine.ts
export const calculateResults = (input: NumerologyInput): NumerologyResult => {
  const moolank = calculateMoolank(input.dob);
  const bhagyank = calculateBhagyank(input.dob);
  const grid = buildLoShuGrid(input.dob, moolank, bhagyank);
  // ...
  return { moolank, bhagyank, grid };
}
```

### Pattern 2: Staggered Reveal Animation
Using `staggerChildren` in Framer Motion for the "Sequential Reveal" requirement.
```typescript
// Example from Motion docs
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date Formatting | Manual string split | `date-fns` | Handles edge cases, leap years, and locale-safe parsing. |
| Data Validation | Manual `if` checks | `Zod` | Provides both runtime validation and TS types automatically. |
| Local Persistence | Manual `localStorage` | `zustand/middleware` | Handles serialization, hydration, and reactive updates automatically. |

## Common Pitfalls

### Pitfall 1: Moolank Calculation Rules
**What goes wrong:** Simple reduction of the day (e.g., 28 -> 1) is common, but the grid logic has a specific rule: *Add Moolank to the grid only if the original day (DD) is NOT 1-9, 10, 20, or 30.*
**Why it happens:** Inconsistency between different numerology systems.
**How to avoid:** Use the logic explicitly documented in `api/utils/numerologyUtils.js:96`.

### Pitfall 2: Hydration Mismatch
**What goes wrong:** Reading from `localStorage` on initial render causes SSR mismatches.
**How to avoid:** Use the "Mounted State" pattern or Zustand's `persist` middleware with a custom hydration handler.

## Code Examples

### Zod Schema for Inputs
```typescript
// Source: Official Zod Docs / Context7
import { z } from "zod";

export const numerologyInputSchema = z.object({
  name: z.string().min(2, "Name is required").regex(/^[a-zA-Z\s]+$/, "Letters only"),
  dob: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use DD/MM/YYYY format"),
  gender: z.enum(["Male", "Female", "Other"]),
});
```

### Modern Minimal Elemental Colors
Recommended hex codes/Tailwind classes for "Modern Minimal" look:
- **Water (1)**: `bg-slate-900 text-white` (Deep, mysterious)
- **Earth (2, 5, 8)**: `bg-stone-200 text-stone-800` (Grounded, neutral)
- **Wood (3, 4)**: `bg-emerald-50 text-emerald-900` (Fresh, growth)
- **Metal (6, 7)**: `bg-zinc-100 text-zinc-900` (Clean, reflective)
- **Fire (9)**: `bg-rose-50 text-rose-900` (Warm, energy)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `parseInt` + `split` | `Zod` schemas | 2023 | End-to-end type safety from form to logic. |
| React Icons | `lucide-react` | 2024 | Tree-shakeable, consistent stroke-width, modern feel. |
| `useEffect` local storage | Zustand `persist` | 2024 | Decoupled persistence logic from UI components. |

## Sources

### Primary (HIGH confidence)
- `api/utils/numerologyUtils.js` - Legacy logic verified.
- `api/data/*.json` - Interpretation data structure verified.
- `/colinhacks/zod` - Context7 documentation for schema validation.
- `/websites/motion_dev` - Context7 documentation for stagger animations.

### Secondary (MEDIUM confidence)
- Lo Shu Grid Elemental Colors - Community consensus for modern palette.
- Zustand Persistence - Standard practice for Next.js 16/React 19 local state.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified via Context7 and project dependencies.
- Architecture: HIGH - Follows established Next.js 16 patterns.
- Pitfalls: HIGH - Identified directly from legacy code analysis.

**Research date:** 2026-02-01
**Valid until:** 2026-03-01
