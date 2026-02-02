# Stack Research

**Domain:** AI-First Numerology Application
**Researched:** 2026-02-01
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.2+ | Frontend UI framework | Industry standard for component-based UIs. Already in use. React 18's concurrent features (Suspense, transitions) improve UX for AI-heavy operations. Context7 confirms v18 is current stable version with excellent documentation. |
| Vite | 7.0.0 | Build tool & dev server | **UPGRADE RECOMMENDED**: Project uses v5.0.8. Vite 7 (released late 2024) offers faster cold starts, improved HMR, and better tree-shaking. Migration from v5 is straightforward - mainly config updates. |
| Firebase | 12.6.0 (latest: 12.3.0+) | Backend (Auth, Firestore, Hosting) | Already integrated. Firebase 12.x uses modular SDK (tree-shakeable). Firestore provides real-time data sync for chatbot history and user preferences. Firebase Auth handles secure user sessions. FCM (Firebase Cloud Messaging) supports push notifications natively. |
| Node.js + Express | 4.21.2 | API server | Already in use for numerology calculations and PDF generation. Proven, stable, well-suited for backend logic that shouldn't run client-side. |
| Google Gemini AI | 0.24.0 (SDK) | AI/LLM integration | Already integrated (`@google/generative-ai`). Gemini 2.0 Flash model provides fast, cost-effective AI for chatbot, forecasts, and enhanced reports. Keep SDK updated - check for v0.25+ for latest features. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Motion (formerly Framer Motion)** | `motion/react` (latest) | Animations & transitions | **CRITICAL FOR IMMERSIVE UI**: Motion is the successor to Framer Motion (same creators). Use `motion/react` for new code - it's smaller, faster, and optimized for React 19+ compatibility. Essential for "modern minimal" aesthetic with smooth page transitions, gesture animations, and micro-interactions. |
| **Tailwind CSS** | 3.4+ | Utility-first CSS framework | **RECOMMENDED**: Not currently in project but aligns perfectly with "modern minimal" design philosophy. Tailwind v3.4 offers container queries, dynamic viewport units, and excellent design system primitives. Faster than writing custom CSS for rapid UI iteration. |
| **Zustand** | 5.0.8 | Global state management | **RECOMMENDED**: Lightweight (1KB), TypeScript-friendly state manager. Better than Redux for this use case - less boilerplate, simpler API. Use for: user auth state, chatbot conversation history, AI loading states, premium feature flags. Context API works for simple cases but Zustand scales better. |
| **React Router DOM** | 6.25.1 | Client-side routing | Already in use. v6.25+ supports data routers (loaders/actions) which can prefetch AI data before route transitions - good UX for forecast pages. |
| **React Icons** | 5.5.0 | Icon library | Already in use. Sufficient for UI needs. |
| **PDFKit** | 0.15.0 | PDF generation | Already in use for reports. Works well server-side. For enhanced AI reports, continue generating PDFs server-side to protect API keys and heavy logic. |
| **date-fns** or **Day.js** | latest | Date manipulation | **ADD THIS**: For personal year/month/day calculations and forecast date ranges. date-fns is more modular (tree-shakeable), Day.js is smaller (2KB). Choose date-fns for better TypeScript support. |
| **react-share** | 5.1.0 | Social sharing components | **ADD THIS**: Pre-built components for sharing to Facebook, Twitter, WhatsApp, etc. Handles platform-specific URLs and deep linking. Better than implementing Web Share API manually (not supported on desktop). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Vite** | Dev server & bundler | Fast HMR (<50ms), native ESM, optimized builds. Already configured. |
| **ESLint** | Code linting | Already configured. Consider adding `eslint-plugin-react-hooks` rules for AI hooks. |
| **Prettier** | Code formatting | Already configured (v3.5.3). Enforces consistency. |
| **Vitest** | Unit testing | Already configured. Works seamlessly with Vite (same config). Use for testing numerology calculation logic. |

## Installation

```bash
# Core (already installed, but upgrade Vite)
npm install vite@7.0.0

# NEW: Animation & Styling
npm install motion tailwindcss postcss autoprefixer

# NEW: State Management
npm install zustand

# NEW: Utilities
npm install date-fns react-share

# Dev dependencies (verify versions)
npm install -D @types/react@18.2.43 @types/react-dom@18.2.17 @vitejs/plugin-react@4.2.1
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Vite 7** | Webpack 5 | Never for greenfield React. Vite is 10-100x faster in dev. Only use Webpack if migrating a massive legacy app with complex custom loaders. |
| **Motion (motion/react)** | Framer Motion (`framer-motion`) | Use Framer Motion ONLY if you need exact feature parity with older projects. Motion is the future - smaller bundle, faster, better React 19 support. Migration is trivial (import swap). |
| **Tailwind CSS** | Styled Components / CSS Modules | Use Styled Components if team strongly prefers CSS-in-JS. Use CSS Modules if zero-runtime is critical (though Tailwind is zero-runtime too). Tailwind wins for rapid prototyping and design consistency. |
| **Zustand** | Redux Toolkit | Use Redux Toolkit ONLY if: (1) team already knows Redux, (2) need time-travel debugging, (3) complex middleware requirements. For this app, Zustand's simplicity wins. |
| **Zustand** | React Context API | Use Context for very simple state (theme, locale). Use Zustand when: (1) state updates frequently, (2) need computed values, (3) persist to localStorage, (4) avoid re-render issues. |
| **Firebase** | Supabase | Use Supabase if: (1) need PostgreSQL (relational data), (2) prefer open-source, (3) require row-level security out-of-box. Firebase wins for: (1) real-time sync, (2) offline support, (3) simpler auth flows, (4) better mobile SDKs. |
| **react-share** | Web Share API | Use Web Share API ONLY on mobile-first PWAs where desktop sharing isn't critical. It's not supported on desktop browsers (Chrome desktop requires HTTPS + user gesture, inconsistent). react-share provides fallback UI for all platforms. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Create React App (CRA)** | Deprecated. Slow builds, outdated tooling. React team recommends Vite/Next.js. | Vite (already using) |
| **Class Components** | Hooks are the standard since React 16.8. Class components = more boilerplate, harder to optimize. | Functional components + hooks |
| **Firebase Compat SDK** | Old API (`firebase.auth()`, `firebase.firestore()`). Larger bundle size. | Modular SDK (`getAuth()`, `getFirestore()`) - already using modular imports per Context7 docs |
| **Moment.js** | 16KB+ (huge). Unmaintained since 2020. | date-fns or Day.js (2-6KB, actively maintained) |
| **Axios** | Unnecessary dependency for most cases. Native fetch is mature (AbortController, streaming). | Native `fetch` API (consider `ky` if need retry/timeout helpers) |
| **Framer Motion (`framer-motion` package)** | Superseded by Motion (`motion/react`). Larger bundle, slower. | Motion (`motion/react`) |
| **MaterialUI / Chakra UI** | Heavy component libraries (100KB+). Overkill for "modern minimal" design. Slows initial load. | Tailwind CSS + headless UI components (Radix UI, Headless UI) if needed |

## Stack Patterns by Feature

### **AI Chatbot (Numerologist Persona)**
**Stack:**
- **UI**: Motion components for chat bubbles (slide-in animations), Tailwind for styling
- **State**: Zustand store for conversation history (messages array, loading states)
- **Backend**: Express endpoint `/api/chat` → calls Gemini API with numerology context
- **Persistence**: Firestore collection `chats/{userId}/messages` for history (optional, consider privacy)

**Pattern:**
```javascript
// Frontend: zustand store
const useChatStore = create((set) => ({
  messages: [],
  isLoading: false,
  sendMessage: async (userMessage) => {
    set({ isLoading: true });
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userMessage, context: userData })
    });
    const { reply } = await response.json();
    set(state => ({
      messages: [...state.messages, { user: userMessage, ai: reply }],
      isLoading: false
    }));
  }
}));
```

### **AI-Driven Forecasts (Daily/Monthly)**
**Stack:**
- **Calculation**: Backend (Express) calculates personal year/month/day using existing logic
- **AI Enhancement**: Gemini generates personalized forecast text based on numbers + user profile
- **Caching**: In-memory cache (15min TTL) for forecast text (already implemented in server.js)
- **UI**: Motion for reveal animations, Tailwind cards for forecast display
- **Push Notifications**: Firebase Cloud Messaging (FCM) for daily reminders

**Pattern:**
```javascript
// Backend: /api/forecast endpoint
app.post('/api/forecast', verifyToken, async (req, res) => {
  const { period } = req.body; // 'daily', 'monthly'
  const numerologyData = calculatePersonalPeriod(req.user.dob, period);

  const prompt = `Based on Personal Year ${numerologyData.year}, Month ${numerologyData.month}, Day ${numerologyData.day}, generate an inspiring daily forecast for someone with Moolank ${numerologyData.moolank}...`;

  const aiResponse = await geminiModel.generateContent(prompt);
  res.json({ forecast: aiResponse.text(), numbers: numerologyData });
});
```

### **Social Sharing**
**Stack:**
- **Library**: `react-share` (ShareButton components)
- **Fallback**: Web Share API for mobile (progressive enhancement)
- **Image Generation**: Server-side canvas (node-canvas) or client-side HTML-to-image for chart screenshots

**Pattern:**
```javascript
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';

<div className="share-buttons">
  <FacebookShareButton url={shareUrl} quote={forecastText}>
    Share on Facebook
  </FacebookShareButton>
  <TwitterShareButton url={shareUrl} title={forecastText}>
    Share on Twitter
  </TwitterShareButton>
</div>
```

### **Immersive UI Overhaul**
**Stack:**
- **Animations**: Motion (`motion/react`) for:
  - Page transitions (AnimatePresence)
  - Card reveals (viewport scroll triggers)
  - Number counting animations (useMotionValue + useSpring)
  - Gesture interactions (drag, tap)
- **Styling**: Tailwind CSS for rapid design iteration
- **Performance**: Lazy load heavy components (`React.lazy + Suspense`)

**Pattern:**
```javascript
import { motion, AnimatePresence } from 'motion/react';

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {/* Page content */}
  </motion.div>
</AnimatePresence>
```

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 18.2 | Vite 7.0.0 | `@vitejs/plugin-react@4.2.1` required |
| React 18.2 | Motion (motion/react) | Motion is React 19-ready but works with 18.2+ |
| Firebase 12.6.0 | Node.js 18+ | Firebase Admin SDK requires Node 18 LTS minimum |
| Vite 7.0.0 | Node.js 18.0.0+ | Drop Node 14/16 support. Use Node 18 LTS or 20 LTS. |
| Zustand 5.0.8 | React 18.2 | No peer dependency conflicts |
| Tailwind CSS 3.4+ | PostCSS 8+ | Vite includes PostCSS, configure in `postcss.config.js` |

## Sources

**HIGH CONFIDENCE (Context7 & Official Docs):**
- React 18 documentation: Context7 `/websites/react_dev` (91.7 benchmark score, 2197 snippets)
- Vite 7.0.0 documentation: Context7 `/vitejs/vite/v7.0.0` (76.9 benchmark score, 1011 snippets)
- Firebase Web SDK 12.x: Context7 `/websites/firebase_google` (85.2 benchmark score, 26376 snippets)
- Motion library: Context7 `/websites/motion_dev` (89.1 benchmark score, 1474 snippets)
- Tailwind CSS v3: Context7 `/websites/v3_tailwindcss` (85.9 benchmark score, 2691 snippets)
- Zustand: Context7 `/pmndrs/zustand` (68.3 benchmark score, 498 snippets)

**MEDIUM CONFIDENCE (Official sources via Context7):**
- Google Gemini AI SDK: Verified via package.json (already in use), version 0.24.0 current as of project state

**VERIFIED FROM CODEBASE:**
- Current stack analyzed from `/Users/deepaknaik/code/numero/package.json` and `/Users/deepaknaik/code/numero/api/server.js`
- Existing integrations: React 18.2.0, Vite 5.0.8, Firebase 12.6.0, Google Gemini 0.24.0, Express 4.21.2, PDFKit 0.15.0

---
*Stack research for: Numero (Next Gen) - AI-First Numerology Application*
*Researched: 2026-02-01*
*Context: Subsequent milestone - adding AI Chatbot, Forecasts, Reports, Social Sharing to existing app*
