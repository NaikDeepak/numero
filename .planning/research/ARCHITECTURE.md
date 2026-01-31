# Architecture Research

**Domain:** Numerology/Personalized Insights Application
**Researched:** 2026-02-01
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  React SPA (Vite) with Context-based State Management       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Context  │  │  Utils   │   │
│  │          │  │          │  │ Providers│  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │          │
├───────┴─────────────┴─────────────┴─────────────┴──────────┤
│                    API/SERVICE LAYER                         │
│              Express.js Backend + Firebase                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Core Calculation Engine (utils/)           │    │
│  │  - Numerology Math  - Grid Analysis                │    │
│  │  - Name Numbers     - Compatibility                 │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    INTEGRATION LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Gemini  │  │ Firebase │  │   PDF    │                  │
│  │   AI     │  │Auth/DB   │  │Generator │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
├─────────────────────────────────────────────────────────────┤
│                       DATA LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Static   │  │Firestore │  │  Cache   │                  │
│  │  JSON    │  │  (Cloud) │  │ (Memory) │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Frontend SPA** | UI rendering, user interaction, client-side routing | React 18+ with Vite bundler |
| **API Server** | Business logic orchestration, auth verification, rate limiting | Express.js (ES modules) on Node.js |
| **Calculation Engine** | Pure numerology math (Moolank, Bhagyank, Grid Analysis) | Functional utilities (api/utils/) |
| **AI Service** | Conversational analysis, text rewriting, personalization | Google Gemini API integration |
| **Firebase Auth** | User authentication and session management | Firebase Auth SDK (Google provider) |
| **Firestore DB** | User data persistence, payment records, premium access | Firebase Firestore (NoSQL) |
| **PDF Generator** | Report generation with styled layouts | PDFKit library server-side |
| **Data Repository** | Static numerological interpretations and meanings | JSON files loaded into memory |
| **Cache Layer** | AI response caching to reduce API costs | In-memory Map with TTL |

## Recommended Project Structure

```
numero/
├── src/                    # Frontend React application
│   ├── pages/              # Route-level components (GridCalculator, Compatibility)
│   │   ├── GridCalculator.jsx
│   │   ├── CompatibilityChecker.jsx
│   │   └── TeamWinPercentage.jsx
│   ├── components/         # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ResultCard.jsx
│   │   └── PremiumLock.jsx
│   ├── context/            # React Context providers for global state
│   │   └── AuthContext.jsx
│   ├── NumerologyGrid.jsx  # Core visualization component
│   ├── firebaseConfig.js   # Firebase client initialization
│   ├── index.jsx           # Application entry point
│   └── index.css           # Global styles
│
├── api/                    # Backend Express server
│   ├── server.js           # Main API server (routes, middleware, startup)
│   ├── utils/              # Business logic and calculation functions
│   │   ├── numerologyUtils.js      # Core numerology calculations
│   │   └── reportGenerator.js      # PDF report generation logic
│   ├── data/               # Static JSON data files
│   │   ├── moolankMeanings.json
│   │   ├── compatibilityData.json
│   │   ├── gridAnalysisDefinitions.json
│   │   └── [other JSON files]
│   └── .env                # Environment variables (API keys, config)
│
└── package.json            # Dependencies and scripts
```

### Structure Rationale

- **src/**: Clear separation of presentation concerns. Pages own routing logic, components are reusable across pages. Context providers centralize cross-cutting concerns like authentication.
- **api/**: Backend is organized by function. `server.js` handles HTTP concerns (routing, middleware), `utils/` contains pure business logic, and `data/` is the source of truth for numerological meanings.
- **Separation of Calculation from Presentation**: The same `numerologyUtils.js` functions are used by both API endpoints (for server-side calculations) and can be referenced for validation rules in the frontend.

## Architectural Patterns

### Pattern 1: API-First Architecture

**What:** Frontend communicates with backend exclusively via REST API. All calculations and sensitive operations happen server-side.

**When to use:** When you need to protect business logic, manage costs (AI API calls), or ensure consistent calculations across clients.

**Trade-offs:**
- **Pros:** Security, centralized logic, easier to add mobile clients later
- **Cons:** Network latency, requires backend infrastructure, offline functionality limited

**Example:**
```typescript
// Frontend calls API instead of doing calculations locally
async function fetchNumerologyData(dob, gender, name) {
  const response = await fetch(`${API_BASE_URL}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dob, gender, name })
  });
  return await response.json();
}
```

### Pattern 2: Server-Side AI Orchestration with Caching

**What:** AI-generated content (analysis, summaries) is generated on-demand server-side and cached using a TTL-based in-memory cache to reduce API costs.

**When to use:** When using paid AI APIs where repeated identical queries would waste money and time.

**Trade-offs:**
- **Pros:** Significant cost reduction, faster response for cached queries
- **Cons:** Cache invalidation complexity, memory usage on server, cold starts for new queries

**Example:**
```javascript
const analysisCache = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function generateCacheKey(dob, gender, name) {
  return `${dob}-${gender}-${name.trim().toLowerCase()}`;
}

// Check cache before calling Gemini
const cacheKey = generateCacheKey(dob, gender, name);
let rewrittenAnalysis = analysisCache.get(cacheKey);
if (!rewrittenAnalysis) {
  rewrittenAnalysis = await rewriteAnalysisWithGemini(originalText);
  analysisCache.set(cacheKey, rewrittenAnalysis);
  setTimeout(() => analysisCache.delete(cacheKey), CACHE_DURATION_MS);
}
```

### Pattern 3: Context-Based Authentication State

**What:** Firebase authentication state is managed in a React Context provider, making user info and auth functions available throughout the component tree.

**When to use:** Standard pattern for managing global auth state in React apps without introducing Redux.

**Trade-offs:**
- **Pros:** Simple, built-in to React, easy to consume with hooks
- **Cons:** Can cause unnecessary re-renders if not optimized, not suitable for very complex state

**Example:**
```jsx
// AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage in components
const { currentUser } = useAuth();
```

### Pattern 4: Pure Calculation Layer

**What:** All numerology calculations are pure functions with no side effects, separated from HTTP routing and data access logic.

**When to use:** Always for business logic — makes testing easier and allows reuse across different contexts.

**Trade-offs:**
- **Pros:** Testable, portable, easy to reason about
- **Cons:** Requires discipline to maintain separation

**Example:**
```javascript
// Pure function - no dependencies on external state
export function calculateNumerologyData(dob, gender) {
  const [year, month, day] = dob.split('-').map(Number);
  const moolank = reduceToSingleDigit(day);
  const bhagyank = reduceToSingleDigit(day + month + year);
  // ... more calculations
  return { moolank, bhagyank, kua, gridNumbers };
}
```

### Pattern 5: Premium Feature Gating with Backend Verification

**What:** Premium features (like Personal Year/Month forecasts) are gated both on the frontend (UI lock) and backend (payment verification in Firestore).

**When to use:** When monetizing features — never trust the client for payment verification.

**Trade-offs:**
- **Pros:** Secure, prevents unauthorized access even if frontend is bypassed
- **Cons:** Requires backend persistence, adds latency for verification

**Example:**
```javascript
// Backend endpoint
app.post('/api/get-premium-data', verifyToken, async (req, res) => {
  const userId = req.user.uid;

  // Verify payment record exists in Firestore
  const paymentDoc = await db.collection('payments').doc(userId).get();
  if (!paymentDoc.exists || paymentDoc.data().status !== 'COMPLETED') {
    return res.status(403).json({ error: 'Unauthorized. Payment required.' });
  }

  // Calculate premium data on-demand
  const personalYear = calculatePersonalYear(birthDay, birthMonth, currentYear);
  res.json({ personalYear, personalMonth, personalYearData });
});
```

## Data Flow

### Request Flow (Standard Calculation)

```
[User Input Form]
    ↓
[Client Validation]
    ↓
[POST /api/calculate] ──────→ [Express Route Handler]
                                    ↓
                              [numerologyUtils.js]
                                    ↓
                              [Load JSON Data] ← (moolankMeanings.json, etc.)
                                    ↓
                              [Gemini AI Call] ← (if enabled, with cache check)
                                    ↓
                              [Build Response JSON]
                                    ↓
[Display Results] ←───────── [HTTP 200 Response]
```

### Premium Feature Flow

```
[User Clicks Premium] → [Frontend: Show PremiumLock]
                              ↓
                        [Initiate Payment]
                              ↓
                        [POST /api/initiate-payment] (requires auth token)
                              ↓
                        [Payment Gateway] → [User Pays]
                              ↓
                        [POST /api/verify-payment]
                              ↓
                        [Save to Firestore: payments/{userId}]
                              ↓
                        [Frontend: setIsPremiumUnlocked(true)]
                              ↓
                        [POST /api/get-premium-data] (token + payment check)
                              ↓
                        [Calculate Personal Year/Month on-demand]
                              ↓
                        [Display Premium Content]
```

### AI Analysis Generation Flow

```
[Backend receives DOB + Name]
    ↓
[Generate cache key: dob-gender-name]
    ↓
[Check analysisCache Map]
    ├─ Cache HIT → Return cached analysis
    │
    └─ Cache MISS
        ↓
   [Call Gemini API with prompt]
        ↓
   [Receive AI-generated text]
        ↓
   [Store in cache with TTL]
        ↓
   [Return analysis to response]
```

### Key Data Flows

1. **Authentication Flow:** User logs in → Firebase Auth → Token stored in browser → Token sent with premium API requests → Backend verifies token using Firebase Admin SDK
2. **Report Generation Flow:** User requests PDF → Backend calculates all data → PDFKit streams PDF directly to HTTP response → Browser downloads file
3. **Real-time Premium Status:** Firestore document update (payment status) → Frontend can listen to changes via Firestore SDK (not currently implemented, but natural extension)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is sufficient. Single Express server, in-memory cache, Firestore for persistence. Gemini API rate limiting via express-rate-limit. |
| 1k-100k users | **Optimize AI costs:** Increase cache TTL, implement Redis for shared cache across instances. **Database:** Add Firestore indexes for payment queries. **Frontend:** Add CDN for static assets (Vite build). **Backend:** Deploy to serverless (Vercel/Cloud Run) with auto-scaling. |
| 100k+ users | **AI Layer:** Implement job queue (Bull/BullMQ) for async AI generation, pre-compute common analyses. **Database:** Partition Firestore collections by user segments. **Caching:** Move to Redis/Memcached cluster. **API:** API Gateway with rate limiting and DDoS protection. **Frontend:** Edge caching with CDN, progressive web app for offline support. |

### Scaling Priorities

1. **First bottleneck:** Gemini AI API costs and rate limits. **Solution:** Aggressive caching, background job processing, pre-computation of popular interpretations.
2. **Second bottleneck:** Firestore read costs for payment verification on every premium request. **Solution:** Cache payment status in Redis with user session, implement webhook-based status updates to keep cache fresh.

## Anti-Patterns

### Anti-Pattern 1: Client-Side Calculation Duplication

**What people do:** Implement numerology calculations in both frontend (for instant feedback) and backend (for reports/API).

**Why it's wrong:** Creates two sources of truth. When calculation logic changes, both must be updated. Risk of divergence leading to inconsistent results.

**Do this instead:** Always use backend API for calculations. If instant feedback is needed, implement optimistic UI updates or use a shared WASM module (advanced) that both client and server import.

### Anti-Pattern 2: Storing AI Responses in Database Without Versioning

**What people do:** Cache AI-generated analyses in Firestore permanently against a user profile.

**Why it's wrong:** When AI prompts improve or model changes, old analyses become stale but there's no way to regenerate them. Users get outdated insights indefinitely.

**Do this instead:** Use TTL-based caching (current approach), or if persisting, add a `promptVersion` field and `generatedAt` timestamp. Implement background jobs to refresh analyses when prompts are updated.

### Anti-Pattern 3: Mixing Business Logic with Route Handlers

**What people do:** Put calculation code directly in Express route handlers.

```javascript
// BAD
app.post('/api/calculate', (req, res) => {
  const moolank = req.body.dob.split('-')[2] % 9; // Logic in route
  res.json({ moolank });
});
```

**Why it's wrong:** Cannot reuse logic, hard to test, violates single responsibility.

**Do this instead:** Keep route handlers thin — they should only handle HTTP concerns (parsing request, validating, calling services, formatting response). Put all business logic in separate modules (current `numerologyUtils.js` pattern is correct).

### Anti-Pattern 4: No Authentication on Premium Endpoints

**What people do:** Rely only on frontend checks for premium features, allowing direct API access if user discovers the endpoint.

**Why it's wrong:** Anyone can bypass frontend and call `/api/get-premium-data` directly without paying.

**Do this instead:** Always verify authentication (Firebase token) and payment status on the backend. Current `verifyToken` middleware + Firestore payment check is the correct pattern.

### Anti-Pattern 5: Stateful Backend with In-Memory Session Data

**What people do:** Store user sessions or long-lived state in Express server memory (beyond short TTL cache).

**Why it's wrong:** Breaks when scaling horizontally (multiple server instances don't share memory). Lost on server restart.

**Do this instead:** Keep backend stateless. Use Firebase Auth tokens (stateless JWT-like), Firestore for persistence, and Redis for shared cache if needed. Current in-memory cache is acceptable only because TTL is short (15 min) and it's just for cost optimization, not critical data.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Google Gemini AI** | Direct REST API calls via `@google/generative-ai` SDK | API key in env vars. Implement rate limiting and caching. Current model: `gemini-2.0-flash`. Monitor token usage. |
| **Firebase Auth** | Client SDK for login, Admin SDK for server-side token verification | Google Provider enabled. Tokens sent in `Authorization: Bearer {token}` header. |
| **Firestore** | Admin SDK on backend, Client SDK on frontend (if needed) | Currently used for payment records. Can extend for user profiles, saved charts. |
| **PDFKit** | Server-side library for PDF generation | Streams directly to HTTP response. No file storage needed. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ API Server** | HTTP REST (JSON) | Base URL from env var (`VITE_API_URL`). CORS enabled for development. |
| **API Server ↔ Calculation Engine** | Direct function imports (ES modules) | Pure functions, no network calls. Synchronous. |
| **API Server ↔ Firebase** | Firebase Admin SDK (async) | Authentication via Application Default Credentials or service account. |
| **API Server ↔ Gemini** | HTTP REST via SDK (async) | Wrapped in try-catch. Fallback to original text on error. |
| **API Server ↔ Data Files** | File system read (sync, on startup) | JSON files loaded into memory once. No runtime file I/O. |

## Build Order Implications for New Features

When adding **AI Chatbot, Forecasts, Reports, Social Sharing**, follow this dependency order:

### Phase 1: Foundation (Backend Services)
**Build First:**
1. Chatbot conversation service (API endpoint for streaming chat)
2. Forecast generation utilities (extend `numerologyUtils.js` with daily/monthly forecast logic)
3. Social sharing backend (generate shareable links, store shared charts in Firestore)

**Rationale:** Backend services define the data contracts. Frontend will consume these APIs.

### Phase 2: Data Layer Extensions
**Build Second:**
1. New Firestore collections (`conversations`, `forecasts`, `shared_charts`)
2. Additional JSON data files (`dailyForecastTemplates.json`, `chatbotPersona.json`)
3. Extend caching strategy for forecast predictions

**Rationale:** Data schema must exist before implementing UI that displays it.

### Phase 3: Frontend Components
**Build Third:**
1. Chatbot UI component (message list, input, streaming responses)
2. Forecast display pages (Daily/Monthly views)
3. Social sharing buttons and preview generation
4. Enhanced Report UI (with AI insights)

**Rationale:** UI is last because it depends on both backend APIs and data schemas being stable.

### Cross-Cutting Concerns (Parallel Development)
- **Authentication:** Extend `AuthContext` to support chatbot session management
- **State Management:** Consider Zustand/Redux if chatbot state becomes complex
- **Real-time Updates:** Use Firestore listeners for live forecast updates or chat notifications

## Suggested Component Boundaries for New Features

### AI Chatbot Architecture

```
┌─────────────────────────────────────────┐
│       ChatInterface (Page)              │
│  - Message history display              │
│  - Input field & send button            │
│  - Typing indicators                    │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    ChatService (Backend API)            │
│  - POST /api/chat/send                  │
│  - GET /api/chat/history/:userId        │
│  - WebSocket for streaming (optional)   │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Gemini Conversation Engine             │
│  - Context management                   │
│  - Persona prompt injection             │
│  - Numerology data retrieval            │
└─────────────────────────────────────────┘
```

**Boundary:** Frontend sends user message → Backend enriches with user's numerology profile → Gemini generates response → Store in Firestore → Return to frontend.

### Forecast System Architecture

```
┌─────────────────────────────────────────┐
│   ForecastPage (Daily/Monthly)          │
│  - Date selector                        │
│  - Forecast card display                │
│  - Notification preferences             │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    ForecastService (Backend)            │
│  - GET /api/forecast/daily              │
│  - GET /api/forecast/monthly            │
│  - Scheduled jobs for pre-computation   │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Forecast Generator (Utils)             │
│  - calculateDailyForecast()             │
│  - AI-enhanced interpretation           │
│  - Template-based formatting            │
└─────────────────────────────────────────┘
```

**Boundary:** Forecasts can be pre-computed (background job) or on-demand. Store in Firestore with TTL. Push notifications via Firebase Cloud Messaging.

### Social Sharing Architecture

```
┌─────────────────────────────────────────┐
│   ShareButton Component                 │
│  - Platform selectors (Twitter, FB)     │
│  - Copy link button                     │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    SharingService (Backend)             │
│  - POST /api/share/create               │
│  - GET /api/share/:shareId (public)     │
│  - Generate OG image for preview        │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Firestore: shared_charts               │
│  { shareId, userId, chartData, views }  │
└─────────────────────────────────────────┘
```

**Boundary:** User clicks Share → Backend creates shareable document → Returns short URL → User shares on social media → Public route renders chart without auth.

## Sources

- **Existing Codebase Analysis:** /Users/deepaknaik/code/numero/api/server.js, /Users/deepaknaik/code/numero/api/utils/numerologyUtils.js, /Users/deepaknaik/code/numero/src/
- **Firebase Documentation:** Firebase Auth patterns, Firestore best practices (2025)
- **React Architecture Patterns:** Context-based state management, component composition (React 18+ standards)
- **AI Integration Patterns:** Caching strategies for LLM APIs, cost optimization techniques (industry best practices 2026)

---
*Architecture research for: Numerology App (Next Gen)*
*Researched: 2026-02-01*
