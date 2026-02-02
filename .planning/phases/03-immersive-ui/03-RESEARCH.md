# Phase 03: Immersive UI - Research

**Researched:** 2026-02-01
**Domain:** Frontend Animations & Theming
**Confidence:** HIGH

## Summary

Phase 03 focuses on implementing a "Modern minimal aesthetic" with smooth transitions and interactions. The research confirms that the Next.js App Router's `template.tsx` is the architecturally correct place for page transitions, as it remounts on navigation (unlike `layout.tsx`).

For the "cosmic-themed" immersive feel, **Motion** (formerly Framer Motion) is the standard library. Tailwind CSS v4 (already in `package.json`) introduces a new CSS-first configuration approach for dark mode that differs from v3.

**Primary recommendation:** Use `template.tsx` with `AnimatePresence` for page transitions and a custom hook for number animations to avoid paid "Motion+" dependencies.

## Standard Stack

The established libraries for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **motion** (framer-motion) | ^12.0 | Animation primitives | The standard for React; robust `AnimatePresence` for exit animations. |
| **next-themes** | ^0.4 | Theme management | Handles system/user preference syncing and hydration mismatch prevention. |
| **tailwindcss** | ^4.0 | Styling | Zero-runtime styling; v4 simplifies dark mode via CSS variables. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **clsx / tailwind-merge** | latest | Class composition | Merging utility classes dynamically (already installed). |
| **lucide-react** | latest | Icons | Consistent iconography (Sun/Moon icons). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **template.tsx** | `layout.tsx` | Layouts don't unmount on route change, making page transitions impossible without complex key hacks. |
| **motion** | `gsap` | GSAP is powerful but imperative; Motion is declarative and React-native. |
| **custom hook** | `AnimateNumber` (Motion+) | "Motion+" components are paid/subscription; a custom hook achieves 90% of the value for free. |

**Installation:**
```bash
# Already installed in project
npm install motion next-themes
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── template.tsx       # Page transition wrapper (Client Component)
│   └── providers.tsx      # ThemeProvider wrapper
├── components/
│   ├── ui/
│   │   └── theme-toggle.tsx # Dark mode switch
│   └── effects/
│       ├── animated-number.tsx # Number reveal component
│       └── page-transition.tsx # Framer Motion wrapper
└── hooks/
    └── use-reduced-motion.ts # Accessibility helper
```

### Pattern 1: Page Transitions via Template
**What:** Using `template.tsx` instead of `layout.tsx` for route boundaries.
**When to use:** When you need animations to trigger *between* route changes.
**Example:**
```tsx
// src/app/template.tsx
"use client"

import { motion } from "motion/react"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

### Pattern 2: CSS-First Dark Mode (Tailwind v4)
**What:** Configuring dark mode using standard CSS variables and the new v4 syntax.
**When to use:** For all theme-dependent styling.
**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

/* Data attribute handled by next-themes */
[data-theme="dark"] {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.985 0 0);
}
```

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Dark Mode State** | `useState('dark')` + Context | `next-themes` | Handles hydration mismatch, system preference listeners, and local storage sync correctly. |
| **Exit Animations** | `useEffect` unmount logic | `AnimatePresence` | React unmounts components immediately; `AnimatePresence` defers removal until animation completes. |
| **Reduced Motion** | Manual media queries | `useReducedMotion` | Motion handles this automatically via props or hooks, respecting OS settings. |

**Key insight:** React's lifecycle makes exit animations hard to hand-roll because the component is removed from the DOM instantly. `AnimatePresence` is the only robust declarative solution.

## Common Pitfalls

### Pitfall 1: The "Layout vs Template" Confusion
**What goes wrong:** Developers put transition logic in `layout.tsx`.
**Why it happens:** Layouts persist state to boost performance, so they don't re-render on navigation.
**How to avoid:** Always use `template.tsx` for animations that must run on every route change.
**Warning signs:** Animations run on first load but not when navigating between sibling routes.

### Pitfall 2: Hydration Mismatch in Themes
**What goes wrong:** Screen flashes white before turning dark (FOUC) or console errors about "className prop did not match".
**Why it happens:** Server renders light mode (default), client has 'dark' in localStorage.
**How to avoid:** Use `next-themes` with `suppressHydrationWarning` on the `html` tag.

### Pitfall 3: Expensive Animations
**What goes wrong:** Animating `left`, `top`, or `margin` causes layout trashing.
**How to avoid:** Only animate `transform` (x, y, scale) and `opacity`.
**Warning signs:** Choppy animations on mobile devices (drop below 60fps).

## Code Examples

### Efficient Number Count-Up (Custom Hook)
To avoid paid "Motion+" components:

```tsx
// src/components/ui/animated-number.tsx
"use client"

import { motion, useSpring, useTransform } from "motion/react"
import { useEffect } from "react"

export function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 1000 })
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span>{display}</motion.span>
}
```

### Theme Toggle Implementation
```tsx
// src/components/theme-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **Framer Motion imports** | `import { motion } from "framer-motion"` | `motion/react` | 2024 (v12) | Better tree-shaking and smaller bundle sizes. |
| **Tailwind Config** | `tailwind.config.js` | CSS `@theme` block | 2025 (v4) | Simplified configuration, less JS glue code. |
| **Page Transitions** | `_app.js` wrapper | `template.tsx` file | Next.js 13+ | Native support for route-specific transition boundaries. |

## Sources

### Primary (HIGH confidence)
- Context7: /websites/motion_dev (Motion documentation)
- Context7: /websites/tailwindcss (Tailwind CSS v4 docs)
- Official: Next.js Documentation (Files > Template)

### Secondary (MEDIUM confidence)
- WebSearch: Verified patterns for `useReducedMotion` and count-up hooks.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - `package.json` confirms existing alignment.
- Architecture: HIGH - `template.tsx` is the unambiguous standard for this requirement.
- Pitfalls: HIGH - Common issues with hydration and layout trashing are well-documented.

**Research date:** 2026-02-01
**Valid until:** 2026-08-01 (Stable ecosystem)
