# Phase 01: Foundation Setup - Research

**Researched:** 2026-02-01
**Domain:** Next.js App Router with TypeScript, Vercel deployment, Firebase integration
**Confidence:** HIGH

## Summary

Phase 01 establishes a modern Next.js development environment with production deployment pipeline. The research confirms that the user's technology decisions align with current industry standards and best practices for 2026. The stack combines Next.js 15+ (App Router), TypeScript with strict mode, Tailwind CSS + shadcn/ui for styling, Vercel for hosting, and Firebase for backend services.

Key findings indicate that this phase focuses purely on infrastructure setup without implementing any numerology features. The "Backend Services Only" model for Firebase (not hosting) is well-supported by Vercel's Firebase integration patterns. Biome successfully replaces ESLint + Prettier with superior performance, and pnpm offers significant speed improvements over npm.

**Primary recommendation:** Use `create-next-app` for initial scaffolding with TypeScript, Tailwind, and App Router enabled. Configure strict TypeScript, install shadcn/ui via CLI, set up Biome for linting/formatting, configure Husky for pre-commit hooks, and establish Vercel + Firebase connections with proper environment variable management.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.1+ (latest) | React framework with SSR/SSG | Official Vercel framework, best-in-class DX, App Router is production-ready |
| TypeScript | 5.8+ | Type-safe JavaScript | Industry standard for large React apps, catches errors at compile time |
| React | 18.2+ (bundled) | UI library | Server Components are stable, concurrent features production-ready |
| Tailwind CSS | v4 (latest) | Utility-first CSS | 97%+ adoption in modern React apps, zero-runtime CSS |
| pnpm | 9+ | Package manager | 3x faster than npm, disk space efficient, strict dependency resolution |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | Latest | Component library | Copy-paste customizable components, not a dependency |
| next-themes | 0.4+ | Theme management | Dark mode with system detection, localStorage persistence |
| Motion (formerly Framer Motion) | Latest | Animation library | Phase 3 prep, install early for zero migration cost |
| Biome | 1.9+ | Linter + Formatter | Replaces ESLint + Prettier, 100x faster, 97% Prettier compatibility |
| Husky | 9+ | Git hooks | Pre-commit quality gates, prevents bad commits from reaching CI |
| Firebase SDK | 12+ | Auth + Firestore | Modular v9+ SDK, tree-shakeable, smaller bundle sizes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel | Netlify, Railway | Vercel has native Next.js integration (same company), automatic optimizations |
| Firebase | Supabase, PlanetScale | Firebase already integrated in legacy app, migration cost not justified for v1 |
| Biome | ESLint + Prettier | Biome is 100x faster, single tool vs two, but ESLint has more plugins (not needed here) |
| pnpm | npm, yarn, bun | pnpm is proven stable, bun still maturing for production monorepos |

**Installation:**
```bash
# Install pnpm globally
npm install -g pnpm

# Create Next.js project (interactive CLI)
pnpm create next-app@latest numero-nextgen --typescript --tailwind --app --src-dir --import-alias "@/*"

# Install core dependencies
pnpm add firebase next-themes motion

# Install dev dependencies
pnpm add -D @biomejs/biome husky

# Install shadcn/ui (run after Next.js setup)
pnpm dlx shadcn@latest init
```

## Architecture Patterns

### Recommended Project Structure
```
numero/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with ThemeProvider
│   │   ├── page.tsx            # Homepage (minimal for Phase 1)
│   │   └── globals.css         # Tailwind base + shadcn variables
│   ├── components/
│   │   ├── ui/                 # shadcn components (auto-generated)
│   │   └── theme-provider.tsx  # next-themes wrapper
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization
│   │   └── utils.ts            # Utility functions (shadcn cn() helper)
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # Local environment variables (gitignored)
├── .env.example                # Example env file (committed)
├── biome.json                  # Biome configuration
├── components.json             # shadcn/ui configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

### Pattern 1: Server Components by Default
**What:** All components in `app/` directory are React Server Components unless marked `"use client"`
**When to use:** Default for data fetching, static content, layouts
**Example:**
```typescript
// Source: /vercel/next.js Context7 docs
// src/app/page.tsx - Server Component (default)
export default async function HomePage() {
  // Can fetch data directly, runs on server
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Numero Next Gen</h1>
    </main>
  )
}
```

### Pattern 2: Client Components for Interactivity
**What:** Mark components with `"use client"` directive when using state, effects, or browser APIs
**When to use:** Theme toggles, animations, forms, event handlers
**Example:**
```typescript
// Source: /websites/ui_shadcn Context7 docs
// src/components/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Pattern 3: Firebase Initialization (Singleton Pattern)
**What:** Initialize Firebase once using singleton pattern to prevent multiple instances
**When to use:** Always for Firebase client SDK setup
**Example:**
```typescript
// Source: /websites/firebase_google Context7 docs
// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
}

// Singleton pattern - only initialize if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
```

### Pattern 4: Environment Variable Security
**What:** Prefix client-side env vars with `NEXT_PUBLIC_`, keep server-side vars unprefixed
**When to use:** Always for any environment configuration
**Example:**
```bash
# Source: /vercel/next.js Context7 docs
# .env.local (gitignored)
# Client-side (exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="numero-app"

# Server-side only (never exposed to browser)
FIREBASE_ADMIN_KEY="..."
GEMINI_API_KEY="..."
```

### Pattern 5: Dark Mode with CSS Variables
**What:** Use CSS variables for theme colors, toggle via class on `<html>` element
**When to use:** Required for shadcn/ui, enables seamless theme switching
**Example:**
```tsx
// Source: /websites/ui_shadcn Context7 docs
// src/app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Anti-Patterns to Avoid
- **Mixing Pages Router and App Router:** Stick to App Router only, Pages Router is legacy (migration not needed for new projects)
- **Client Components at Root:** Don't mark layout.tsx as "use client", only wrap specific interactive components
- **Importing Firebase in Client Components:** Firebase client SDK works in client components, but admin SDK must stay server-side only
- **Committing .env files:** Always gitignore .env.local, only commit .env.example with placeholder values
- **Manual Tailwind class concatenation:** Use `cn()` utility from shadcn for conditional classes (handles conflicts properly)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle | Custom theme context with localStorage | `next-themes` package | Handles SSR hydration mismatch, system detection, flash prevention |
| CSS class merging | String concatenation or classnames library | `clsx` + `tailwind-merge` (cn util) | Properly handles Tailwind class conflicts (e.g., "p-2 p-4" → "p-4") |
| UI components | Custom button/dialog/dropdown from scratch | shadcn/ui components | Accessible (ARIA), customizable source code, TypeScript types included |
| Git pre-commit hooks | Manual git hook scripts | Husky + lint-staged | Cross-platform, automatic setup, integrates with package.json scripts |
| Code formatting | Manual ESLint rules for style | Biome formatter | Deterministic formatting, 100x faster than Prettier, handles malformed code |
| Environment validation | Runtime checks in code | Vercel's environment variable validation | Type-safe env vars, fails at build time not runtime |

**Key insight:** The modern Next.js ecosystem has mature solutions for every common infrastructure need. Custom implementations introduce bugs (SSR hydration mismatches, accessibility issues, security gaps) and maintenance burden. Trust the ecosystem.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from Theme Flash
**What goes wrong:** Page loads with light theme, then flashes to dark theme after JavaScript loads, causing React hydration errors
**Why it happens:** Server renders without knowing user's theme preference (stored in localStorage/browser)
**How to avoid:**
- Use `next-themes` with `suppressHydrationWarning` on `<html>` element
- Set `disableTransitionOnChange` to prevent flash during initial load
- Never access `localStorage` directly in Server Components
**Warning signs:** Console errors about hydration mismatch, visible flash of wrong theme on page load

### Pitfall 2: Exposing Secrets via NEXT_PUBLIC_ Prefix
**What goes wrong:** Accidentally prefix sensitive API keys with `NEXT_PUBLIC_`, bundling them into client JavaScript where anyone can view source and steal them
**Why it happens:** Misunderstanding that `NEXT_PUBLIC_` means "accessible everywhere" not "public to the world"
**How to avoid:**
- Only use `NEXT_PUBLIC_` for truly public values (Firebase config for client SDK is safe)
- Server-only secrets (Gemini API key, admin keys) NEVER get NEXT_PUBLIC_ prefix
- Use Vercel's environment variable types: mark sensitive vars as "Secret" in dashboard
**Warning signs:** API keys visible in browser DevTools → Network → View page source

### Pitfall 3: Firebase Double Initialization
**What goes wrong:** Calling `initializeApp()` multiple times causes "Firebase app already exists" error in development with hot module replacement
**Why it happens:** Next.js dev server reloads modules, re-executing initialization code
**How to avoid:**
- Use singleton pattern: `getApps().length === 0 ? initializeApp() : getApps()[0]`
- Export initialized services (`auth`, `db`) not initialization functions
**Warning signs:** Firebase errors in console only in development mode, not production builds

### Pitfall 4: Client Component Overuse
**What goes wrong:** Marking root layout or entire page trees as `"use client"`, losing SSR benefits and increasing bundle size
**Why it happens:** Misunderstanding when "use client" is needed (only for state/effects/browser APIs)
**How to avoid:**
- Default to Server Components (no directive)
- Only add "use client" to specific components that need interactivity
- Pass data from Server Components to Client Components via props (composition pattern)
**Warning signs:** Large bundle sizes, slow initial page load, unnecessary JavaScript shipped to browser

### Pitfall 5: Import Alias Misconfiguration
**What goes wrong:** TypeScript can't resolve `@/` imports, or IDE autocomplete doesn't work
**Why it happens:** `tsconfig.json` and `next.config.ts` have mismatched path aliases
**How to avoid:**
- Use `create-next-app` with `--import-alias "@/*"` flag (sets both configs correctly)
- Ensure `tsconfig.json` has: `"paths": { "@/*": ["./src/*"] }`
- Restart TypeScript server in IDE after changes
**Warning signs:** Import errors, red squiggles in IDE, build failures for valid imports

### Pitfall 6: Mixing Biome and Prettier/ESLint
**What goes wrong:** Conflicting formatting rules, slower performance, complex configuration
**Why it happens:** Installing Biome without removing old tooling
**How to avoid:**
- Remove `eslint`, `prettier`, and related packages from `package.json`
- Delete `.eslintrc`, `.prettierrc` config files
- Update scripts: `"lint": "biome check ."`, `"format": "biome format --write ."`
**Warning signs:** Two formatters fighting over style, pre-commit hooks slow

### Pitfall 7: Vercel Environment Variables Not Loading
**What goes wrong:** App works locally but crashes on Vercel with "undefined env variable" errors
**Why it happens:** `.env.local` is gitignored (correct), but forgot to add variables to Vercel dashboard
**How to avoid:**
- Always commit `.env.example` with all required keys (values as placeholders)
- Configure environment variables in Vercel dashboard for each deployment target
- Use Vercel CLI `vercel env pull .env.local` to sync remote vars to local dev
**Warning signs:** Build succeeds but runtime crashes, "process.env.X is undefined" errors in Vercel logs

## Code Examples

Verified patterns from official sources:

### Create Next.js Project with Correct Options
```bash
# Source: /vercel/next.js Context7 docs
# Use pnpm for faster installs, specify all options upfront
pnpm create next-app@latest numero-nextgen \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

### TypeScript Configuration (Strict Mode)
```json
// Source: /vercel/next.js Context7 docs
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "src/**/*"],
  "exclude": ["node_modules"]
}
```

### Biome Configuration
```json
// Source: /websites/biomejs_dev Context7 docs
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "include": ["src/**/*.ts", "src/**/*.tsx"],
    "ignore": ["node_modules", ".next", "dist"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded",
      "quoteStyle": "double"
    }
  }
}
```

### Husky Pre-Commit Hook Setup
```bash
# Source: https://typicode.github.io/husky/ (WebFetch)
# Initialize Husky
pnpm add -D husky
pnpm exec husky init

# Edit .husky/pre-commit
#!/usr/bin/env sh
pnpm biome check --write .
pnpm exec biome check --write --staged
```

### shadcn/ui Initialization
```bash
# Source: /websites/ui_shadcn Context7 docs
# Initialize shadcn (interactive CLI)
pnpm dlx shadcn@latest init

# Example configuration (from CLI prompts):
# - Style: New York
# - Base color: Zinc
# - CSS variables: Yes
# - React Server Components: Yes
# - Import alias: @/components

# Install first component (button)
pnpm dlx shadcn@latest add button
```

### Tailwind Config for Dark Mode
```typescript
// Source: /websites/tailwindcss Context7 docs
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"], // Enable class-based dark mode for next-themes
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... shadcn/ui adds these during init
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### Vercel Deployment Environment Variables
```bash
# Source: /websites/vercel Context7 docs
# Install Vercel CLI
pnpm add -g vercel

# Link project to Vercel
vercel link

# Add environment variables via CLI (or use dashboard)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview
vercel env add GEMINI_API_KEY production

# Pull remote env vars to local .env.local
vercel env pull .env.local
```

### Package.json Scripts
```json
// Updated scripts for Biome + Next.js
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13 (stable in 14) | Server Components default, nested layouts, streaming SSR |
| ESLint + Prettier | Biome | 2024 (v1.0 stable) | 100x faster formatting, single tool replaces two, zero config |
| getServerSideProps | async Server Components | Next.js 13 | Simpler API, better composition, automatic request deduplication |
| npm | pnpm | 2021+ (mainstream 2024) | 3x faster installs, disk space efficient, strict peer deps |
| Framer Motion | Motion | 2025 (Motion v11 stable) | Smaller bundle (10KB vs 50KB), faster runtime, same API |
| Firebase v8 compat | Firebase v9 modular | 2021 (fully adopted 2023) | Tree-shakeable, ~80% smaller bundle size |
| Vercel env via CLI only | Vercel dashboard + CLI | 2023 | UI for bulk env management, encrypted secrets, preview environment vars |

**Deprecated/outdated:**
- **Pages Router patterns:** `getServerSideProps`, `getStaticProps`, `_app.js`, `_document.js` are legacy (still supported but not recommended for new projects)
- **Firebase compat SDK:** `firebase/compat/app` is deprecated, use modular imports like `firebase/app`
- **Prettier + ESLint for formatting:** Biome achieves 97% Prettier compatibility with 100x performance
- **npm/yarn for Next.js:** pnpm is now recommended by Vercel for monorepos and large projects

## Open Questions

Things that couldn't be fully resolved:

1. **Biome React Plugin Maturity**
   - What we know: Biome has React linting rules, but ecosystem is newer than ESLint
   - What's unclear: Whether all React-specific rules from eslint-plugin-react are covered
   - Recommendation: Start with Biome recommended rules, add custom rules only if specific gaps found during Phase 2 development

2. **Motion vs Framer Motion Naming**
   - What we know: Motion is the new brand, package is still `motion` on npm
   - What's unclear: Whether Framer Motion package will be deprecated or if both coexist
   - Recommendation: Install `motion` package (latest), use `motion` import paths for future compatibility

3. **shadcn/ui Update Frequency**
   - What we know: Components are copied into your codebase, not npm dependencies
   - What's unclear: How to update components when shadcn releases fixes/improvements
   - Recommendation: Track shadcn/ui changelog, manually update individual components as needed (treat as source code, not library)

4. **Firebase Hosting Integration with Vercel**
   - What we know: User chose Vercel for frontend, Firebase for backend services only
   - What's unclear: Whether Firebase Hosting config (firebase.json) should be removed to avoid confusion
   - Recommendation: Keep firebase.json for potential future serverless functions, but ensure all frontend deployments target Vercel only

## Sources

### Primary (HIGH confidence)
- `/vercel/next.js` Context7 - Installation, TypeScript config, App Router patterns, environment variables, SSR data fetching
- `/websites/tailwindcss` Context7 - Next.js integration, PostCSS setup, dark mode configuration
- `/websites/vercel` Context7 - Deployment process, environment variable management, production/preview environments
- `/websites/firebase_google` Context7 - Firebase SDK setup, Authentication initialization, Firestore configuration
- `/websites/ui_shadcn` Context7 - Installation with Next.js, component structure, dark mode with next-themes
- `/websites/motion_dev` Context7 - Motion installation for React, basic animation patterns, Next.js App Router usage
- `/websites/biomejs_dev` Context7 - Installation, configuration file structure, formatting/linting commands

### Secondary (MEDIUM confidence)
- https://pnpm.io/installation - pnpm installation methods
- https://pnpm.io/motivation - pnpm workspace architecture and benefits
- https://typicode.github.io/husky/ - Husky git hooks setup and configuration
- https://biomejs.dev/reference/configuration/ - Biome configuration reference
- https://ui.shadcn.com/docs/dark-mode/next - Dark mode setup with next-themes in Next.js

### Tertiary (LOW confidence)
- None - All research verified against authoritative sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7 official documentation
- Architecture: HIGH - Patterns sourced from Next.js and shadcn/ui official docs
- Pitfalls: MEDIUM - Based on common issues documented in official guides + general Next.js experience

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable stack, Next.js 16 may introduce changes)

---

**Notes for Planner:**
- This phase is infrastructure-only, zero numerology features
- Success = dev server running + production build deploying + Firebase connected
- All decisions locked by user in CONTEXT.md, no alternatives explored
- Claude has discretion on exact directory structure within `src/` (follow Next.js App Router conventions)
- Biome configuration specifics (line width, quote style) at Claude's discretion
- Husky hook contents flexible (must run Biome before commit)
