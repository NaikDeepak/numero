# Phase 03: Immersive UI - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Modern minimal aesthetic with smooth animations differentiating from cosmic-themed competitors.
(Implementation of frontend visual layer: transitions, theming, and motion system.)

</domain>

<decisions>
## Implementation Decisions

### Page Transitions
- **Mode**: Next.js Template (Recommended) — Using `template.tsx` for automatic route transitions.
- **Effect**: Slide (Mobile-like) — Pages enter from right/left.
- **Stable Elements**: Persistent Header, Fixed Background, Morphing Titles.
- **Loading**: Skeleton UI to show layout structure while data fetches.
- **Scroll**: Maintain Position — Behave like a Single Page App (SPA).
- **Duration**: Fast / Snappy (200-300ms) for a responsive feel.
- **Reduced Motion**: Simplified animations (slower/fades) rather than removing them entirely.

### Animation Style
- **Physics**: Ease Curves (Bezier) — Smooth, consistent, predictable motion.
- **Stagger**: Cascading Down — Elements reveal top-to-bottom in reading order.
- **Hover**: Scale Up + Elevation Lift — subtle grow and shadow on interactive elements.
- **Clicks**: Tactile Press — Buttons scale down slightly (0.95x) on press.

### Theme Toggle
- **Mechanism**: Cycle Button (Sun -> Moon -> System).
- **Transition**: Cross-fade (smooth 300ms blend).
- **Preference**: Auto-detect system preference by default.

### Visual Language
- **Typography**: Balanced / Functional — standard app-style scaling.
- **Colors**: Ethereal Gradients — Soft, blurred backgrounds (not solid flat colors).
- **Spacing**: Open / Airy — Generous whitespace.
- **Shapes**: Soft Corners (8-12px) — Friendly but professional.

### Claude's Discretion
- **Gestures**: Implementation of mobile swipe gestures.
- **Theme Scope**: Whether themes are global-only or component-scoped.

</decisions>

<specifics>
## Specific Ideas

- "I like how Twitter shows the new posts indicator without disrupting your scroll position" (Reference for toast/notification behavior if needed).
- Transitions should feel "mobile-native" even on desktop (slide interactions).
- Background should be "Fixed" — creating a sense of depth where content slides *over* the background.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-immersive-ui*
*Context gathered: 2026-02-01*
