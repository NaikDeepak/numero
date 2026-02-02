# Phase 1: Foundation Setup - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Modern development environment with deployment pipeline ready for Next Gen build.
(Infrastructure setup only - features come in later phases.)

</domain>

<decisions>
## Implementation Decisions

### Framework Choice
- **Next.js** as the core framework
- **Server-side rendering (SSR)** priority for SEO and initial load
- **`src/` directory** structure for clean separation
- **Strict TypeScript** configuration (no implicit any)

### Hosting Provider
- **Vercel** for frontend hosting (best Next.js integration)
- **Firebase** for backend services only (Auth, Firestore) - not hosting
- **Preview + Production** environment strategy (deploy on PR)
- **US East (N. Virginia)** region for both Vercel and Firebase

### Styling Engine
- **Tailwind CSS** for utility-first styling
- **Shadcn/UI** for component library (copy-paste customization)
- **Framer Motion** for animations (preparing for Phase 3)
- **System + Toggle** for Light/Dark mode preference

### Package Manager & Quality
- **pnpm** for package management (fast, efficient)
- **Biome** for formatting and linting (fast, all-in-one replacement for Prettier/ESLint)
- **Husky** pre-commit hooks to enforce quality locally
- **GitHub Actions** to validate builds/linting on PRs

### Claude's Discretion
- Exact directory structure within `src/` (components, lib, etc.)
- Specific configuration of `tsconfig.json` beyond strict mode
- Setup of initial boilerplate pages

</decisions>

<specifics>
## Specific Ideas

- "Modern minimal design" foundation should be established (Tailwind config)
- Ensure Vercel and Firebase are connected properly for the "Backend Services Only" model

</specifics>

<deferred>
## Deferred Ideas

- Actual numerology logic porting (Phase 2)
- Complex animations and motion design (Phase 3)
- AI integration (Phase 4)

</deferred>

---

*Phase: 01-foundation-setup*
*Context gathered: 2026-02-01*
