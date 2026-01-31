# Phase 2: Core Numerology - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Working numerology application with grid calculations and interpretations.
(Core engine porting and basic UI implementation.)

</domain>

<decisions>
## Implementation Decisions

### Input Flow
- **Single Form** layout (all fields visible)
- **Masked Input** for Date of Birth (DD/MM/YYYY)
- **Full Name Field** (single input)
- **Real-time validation** for immediate feedback
- **No Time of Birth** field (not needed for v1)
- **Include Gender** dropdown for tailored interpretations
- **Auto-fill Last** used details for persistence
- **Reveal Below** behavior on submit (no page navigation)

### Grid & Results
- **3x3 Lo Shu Grid** layout (Classic)
- **Static** grid (non-interactive)
- **Hero Badges** for Moolank and Bhagyank
- **Sequential Reveal** animation for results
- **Empty Cells** for missing numbers
- **Elemental Colors** (Wood, Fire, Earth, Metal, Water) for grid cells
- **Scale Down** grid for mobile screens
- **Progressive Disclosure** for interpretation text (Summary -> Read More)

### Interpretation Data
- **Local JSON** files as data source
- **Structured Objects** schema (not flat key-value)
- **Multi-language Ready** structure (even if English-only initially)
- **Static Only** content (no AI generation in this phase)
- **Typed Schema** with Zod for validation
- **Plain Text** content (no Markdown)
- **File Versioning** (e.g., `interpretations-v1.json`)
- **Server Fetch** pattern via API routes

### Logic Porting
- **Legacy JS** as the source of truth
- **A/B Testing** verification script to compare outputs
- **Clean & Optimize** refactoring (TypeScript, performance)
- **Strict Validation** for inputs (throw on ambiguity)
- **Lib Functions** location (`src/lib/numerology`)
- **date-fns** for date manipulation
- **Raw Data** engine output (UI handles formatting)
- **CLI Script** for running A/B verification

### Claude's Discretion
- Specific folder structure for JSON data
- Exact Zod schema definition
- Animation timing curves
- Color palette specifics for elements

</decisions>

<specifics>
## Specific Ideas

- "Modern minimal design" applied to the grid (Elemental colors should be subtle/modern, not garish)
- Use the `.legacy-app/` directory heavily for logic extraction
- CLI script should run in CI to ensure no regression from legacy logic

</specifics>

<deferred>
## Deferred Ideas

- AI-generated interpretations (Phase 4)
- User accounts/cloud sync (Phase 2 requirement says local only)
- Social sharing of grid (Future phase)

</deferred>

---

*Phase: 02-core-numerology*
*Context gathered: 2026-02-01*
