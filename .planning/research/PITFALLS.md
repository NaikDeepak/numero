# Pitfalls Research

**Domain:** AI-First Numerology Application (Chatbot, Forecasts, Reports, Social Sharing)
**Researched:** 2026-02-01
**Confidence:** HIGH (based on project context + established patterns for React/Firebase/AI apps)

## Critical Pitfalls

### Pitfall 1: Unbounded AI Token Costs

**What goes wrong:**
AI chatbot consumes excessive tokens leading to runaway costs. Users initiate long conversations, request multiple forecasts/reports, causing API bills to spike unpredictably. Without limits, a single user can generate hundreds of dollars in charges.

**Why it happens:**
- No rate limiting on AI endpoints
- Sending entire conversation history on every request (context window bloat)
- Regenerating forecasts/reports instead of caching
- Not tracking token usage per user/session
- Gemini API calls made directly from client without server-side gating

**How to avoid:**
- Implement server-side rate limiting (express-rate-limit already imported in server.js)
- Set per-user daily token budgets (store in Firestore)
- Sliding context window: only send last N messages, not entire history
- Cache AI-generated forecasts (daily/monthly) in Firestore, regenerate only on new day
- Add token usage tracking middleware that logs to Firestore
- Implement tiered usage (free tier: 10 questions/day, premium: unlimited)

**Warning signs:**
- API bills growing faster than user count
- Users complaining about slow chatbot responses (indicating large context)
- Missing analytics on token consumption per feature
- No monitoring dashboard for AI costs

**Phase to address:**
Phase 1 (AI Chatbot Foundation) - MUST implement before beta launch

---

### Pitfall 2: AI Persona Inconsistency ("Character Drift")

**What goes wrong:**
AI chatbot starts sounding generic/corporate instead of maintaining mystical numerologist persona. Breaks immersion when it says "I'm an AI" or gives contradictory interpretations across sessions.

**Why it happens:**
- System prompt not strong enough or gets diluted in long conversations
- No persona enforcement in conversation context
- Using generic Gemini model without fine-tuning instructions
- Conversation history doesn't preserve persona context
- Different system prompts used for chatbot vs forecasts vs reports

**How to avoid:**
- Strong, consistent system prompt: "You are a wise, empathetic numerologist with deep mystical knowledge. Never break character. Never mention being an AI."
- Prepend persona context to EVERY Gemini request (not just first message)
- Use consistent voice across all AI features (chatbot/forecasts/reports)
- Create persona validation tests: send test queries, check if responses stay in character
- Store conversation metadata with persona version (allows rollback if persona degrades)
- Consider Gemini's context caching to preserve persona across sessions

**Warning signs:**
- User feedback mentioning "generic responses" or "lost the mystical vibe"
- AI using phrases like "As an AI model..." or "I don't have personal beliefs"
- Different tone between chatbot and generated reports
- Responses containing disclaimers about accuracy (breaks immersion)

**Phase to address:**
Phase 1 (AI Chatbot Foundation) - Critical for user experience differentiation

---

### Pitfall 3: Firestore Real-Time Listener Memory Leaks

**What goes wrong:**
App becomes sluggish over time, eventually crashes on mobile. Users staying logged in for hours/days experience degraded performance. Memory usage grows continuously.

**Why it happens:**
- Real-time Firestore listeners (for forecasts/chat history) not unsubscribed on component unmount
- Multiple listeners stacking up as user navigates between pages
- Listeners created in useEffect without cleanup function
- Daily forecast listener stays active even when user not viewing forecast page
- Firebase subscriptions persist across route changes

**How to avoid:**
```javascript
// CORRECT pattern:
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'forecasts', userId), (doc) => {
    setForecast(doc.data());
  });

  return () => unsubscribe(); // CRITICAL: cleanup on unmount
}, [userId]);

// WRONG pattern:
useEffect(() => {
  onSnapshot(doc(db, 'forecasts', userId), (doc) => {
    setForecast(doc.data());
  });
  // NO CLEANUP = MEMORY LEAK
}, [userId]);
```

**Warning signs:**
- Chrome DevTools showing increasing memory usage over time
- Firebase "too many listeners" console warnings
- App slow after navigating between pages multiple times
- Mobile browser crashes after prolonged use

**Phase to address:**
Phase 1 (Daily Engagement Foundation) - Test during initial Firebase integration

---

### Pitfall 4: Social Sharing Privacy Exposure

**What goes wrong:**
User shares their daily forecast, accidentally exposes full birth date, real name, or other PII. Shared URLs reveal sensitive query parameters. Screenshots contain personal numerology data that can be reverse-engineered.

**Why it happens:**
- Share feature includes full user profile data in metadata
- OG tags pull from user document without sanitization
- Share URLs contain birthdate as query parameter: `?dob=1990-01-15`
- Generated images for sharing include identifiable information
- Not considering what "shareable" means for mystical/personal data
- Firebase Security Rules don't differentiate between private and shareable fields

**How to avoid:**
- Design share data model: only include minimal data (e.g., "Personal Year: 7" NOT "Born: Jan 15, 1990")
- Use anonymous IDs for share URLs: `/share/abc123` not `/share?user=deepak&dob=1990-01-15`
- Create dedicated "share" subcollection in Firestore with explicit shareable fields
- Preview modal: "This is what will be shared" before confirming
- Firestore security rules: separate `/users/{uid}/private` and `/users/{uid}/shareable` paths
- OG image generation: only include forecast text, not personal identifiers

**Warning signs:**
- Users asking "can I delete shared content?"
- Share URLs contain readable personal data
- No preview before sharing
- Same data structure used for private profiles and public shares

**Phase to address:**
Phase 2 (Social Features) - BEFORE implementing any share functionality

---

### Pitfall 5: PDF Report Generation Browser Crash

**What goes wrong:**
Generating detailed AI report (20+ pages with charts) causes browser tab to freeze or crash. Mobile users cannot generate reports. PDF generation takes 30+ seconds with no progress indicator.

**Why it happens:**
- PDFKit running entirely in browser, consuming massive memory for complex layouts
- Generating PDF client-side with embedded images/fonts loads everything into RAM
- No streaming/chunking - entire PDF built in memory before download
- Synchronous rendering blocks main thread (UI freezes)
- Mobile browsers have strict memory limits (crashes at ~100MB)
- Large reports with AI-generated content exceed typical PDF library limits

**How to avoid:**
- **Server-side generation**: Move PDF creation to backend (already using PDFKit in server.js)
- Async generation: Queue report generation, notify when ready (don't block UI)
- Progress indicator: "Generating your 24-page report... 45% complete"
- Chunked rendering: Generate PDF page-by-page, stream to client
- File size limits: Cap reports at 10 pages for free users, 50 for premium
- Fallback: If PDF fails, offer HTML version + "Print to PDF" button
- Test on actual mobile devices (iPhone Safari, Android Chrome) before launch

**Warning signs:**
- "Generate Report" button has no loading state
- No file size estimates shown to user
- PDF generation code runs in React component (client-side)
- Memory profiling shows spikes during report generation
- No timeout handling (user waits indefinitely)

**Phase to address:**
Phase 1 (Enhanced AI Reports) - Architecture decision needed before implementation

---

### Pitfall 6: Push Notification Fatigue & Permission Loss

**What goes wrong:**
Users disable notifications after being spammed. Daily forecast notifications sent at wrong times (3am, during work meetings). Push permission denied by 80%+ of users. Notifications feel generic, not personalized.

**Why it happens:**
- No timezone detection: server sends at UTC midnight, not user's midnight
- No notification preferences: can't choose time or frequency
- Generic message: "Your daily forecast is ready!" (not compelling)
- Asking for notification permission too early (on first visit before value demonstrated)
- No A/B testing of notification copy
- Sending notifications even when user already viewed forecast

**How to avoid:**
- Store user timezone (detect from browser, allow manual override)
- Notification preferences: "Send my forecast at 8am" with time picker
- Personalized copy: "Your Personal Year 7 forecast for Feb 1 is mystical today"
- Lazy permission request: ask after user has engaged with forecasts 3+ times
- Smart scheduling: don't send if user already opened app that day
- Notification digest: "3 compatibility insights this week" instead of daily spam
- Use Firebase Cloud Messaging topic subscriptions (user can unsubscribe per feature)
- Implement quiet hours: never send between 10pm-8am in user's timezone

**Warning signs:**
- Permission acceptance rate below 40%
- High notification unsubscribe rate
- Users complaining about timing in reviews
- No timezone handling in codebase
- Permission prompt shown immediately on landing

**Phase to address:**
Phase 1 (Daily Engagement) + Phase 2 (Polish) - Basic in Phase 1, refinement in Phase 2

---

### Pitfall 7: AI Hallucination in Numerological "Facts"

**What goes wrong:**
AI chatbot invents numerology concepts that don't exist. Gives contradictory interpretations ("Moolank 5 is creative" vs "Moolank 5 struggles with creativity"). Cites fake historical references. Users lose trust when they fact-check.

**Why it happens:**
- Gemini model generates plausible-sounding but incorrect numerology info
- No grounding in actual numerology data (moolankMeanings.json, gridAnalysisDefinitions.json)
- Prompt doesn't enforce "only use provided data"
- AI fills gaps with generic mysticism when it doesn't know
- No validation layer between AI output and user display
- Temperature setting too high (increases creativity = increases hallucination)

**How to avoid:**
- **RAG approach**: Inject relevant data from JSON files into prompt context
  - Example: "User has Moolank 5. Here is the ONLY valid interpretation: [paste moolankMeanings.json[5]]. Use ONLY this data."
- Strict prompt: "You MUST ONLY use the numerology data provided. If data is missing, say 'I need to calculate this first.' NEVER invent numerology meanings."
- Lower temperature: 0.3-0.5 for factual responses (0.7+ encourages hallucination)
- Validation layer: Parse AI response, check if it references non-existent numbers/concepts
- Hybrid approach: Use JSON data for core calculations, AI only for conversational tone
- Test suite: Known queries with expected answers, flag deviations

**Warning signs:**
- User reports "this contradicts what I read online"
- AI mentions numerology concepts not in your data files
- Different answers to same question in different sessions
- No references to JSON data files in prompt construction
- Temperature > 0.7 in Gemini config

**Phase to address:**
Phase 1 (AI Chatbot Foundation) - Must validate before trusting AI with user-facing content

---

### Pitfall 8: Framer Motion Animation Performance Death Spiral

**What goes wrong:**
Beautiful animations become janky slideshow on mid-range Android phones. App feels sluggish despite "modern minimal" design. Scrolling forecast list stutters. Battery drain complaints.

**Why it happens:**
- Animating expensive properties (width, height, box-shadow) instead of transforms
- Too many simultaneous animations (every list item animating independently)
- No reduce-motion detection (accessibility + performance)
- AnimatePresence on large lists (animating 100+ items in/out)
- Layout animations triggering constant reflows
- Not using `will-change` for animated elements
- Hardware acceleration not enabled (transforms not GPU-accelerated)

**How to avoid:**
- **Only animate transforms and opacity**: These are GPU-accelerated
  ```javascript
  // GOOD: GPU-accelerated
  animate={{ x: 100, opacity: 1 }}

  // BAD: triggers layout reflow
  animate={{ width: "100%", marginLeft: 20 }}
  ```
- Virtualize long lists (react-window) before animating
- Respect `prefers-reduced-motion`:
  ```javascript
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.3 };
  ```
- Stagger animations: not all at once
- Use `layout` prop sparingly (expensive)
- Profile on actual devices (not just MacBook Pro)
- Lazy load animations: don't animate offscreen elements

**Warning signs:**
- Chrome DevTools Performance tab shows dropped frames (below 60fps)
- Animations using `width`, `height`, `margin`, `padding`
- No `prefers-reduced-motion` handling
- Every component has `<motion.div>` wrapper
- Layout shifts during animation

**Phase to address:**
Phase 1 (Immersive UI) - Performance testing required during development

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding system prompt in component | Fast to iterate | Impossible to version/test prompts, scattered across codebase | Never - centralize in config |
| Client-side Gemini API calls | Simpler architecture | No rate limiting, API key exposed, costs uncontrolled | Never - always server-side |
| Regenerating forecasts on every view | Ensures fresh data | Wasteful API calls, slow UX, high costs | MVP only, cache immediately after |
| Storing full conversation in Firestore | Easy to implement | Document size limits (1MB), slow queries, expensive reads | Acceptable if truncating old messages |
| Embedding Firebase config in client | Quick setup | API keys in bundle, quotas shared across all users | Acceptable (keys are public but restrict with rules) |
| No AI response caching | Simpler code | Duplicate costs for identical queries | MVP only, add cache within first month |
| Inline animation configs | Faster prototyping | Inconsistent timing, hard to maintain theme | Acceptable in exploration, refactor before launch |
| Using free Firestore tier | Zero cost | Sudden cutoff at quota limits, unpredictable scaling | Acceptable for MVP, monitor closely |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Gemini API | Sending raw user input without sanitization | Validate input length, filter prompt injections, set max_tokens limit |
| Firebase Auth | Not handling auth state persistence across refreshes | Use `onAuthStateChanged` listener in root component, show loading state |
| Firestore Security Rules | Leaving rules in "test mode" (allow all) | Strict rules: `allow read, write: if request.auth != null && request.auth.uid == userId` |
| Firebase Cloud Messaging | Not requesting permission at right time | Delay until user has engaged 3+ times, explain value before asking |
| PDFKit | Assuming it works same in browser as Node.js | Generate server-side OR use browser-specific library (jsPDF, pdfmake) |
| Framer Motion | Wrapping everything in `<motion.div>` | Only animate what needs animation, use standard divs elsewhere |
| Google Analytics (Measurement ID in config) | Not enabling in Firebase Console | Enable Analytics in Firebase project settings first |
| Firestore Real-Time | Using `onSnapshot` when data rarely changes | Use `getDoc` for static data (user profile), `onSnapshot` only for real-time needs |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all user forecasts on load | Initial load slow, memory bloat | Pagination: load last 30 days, lazy load history | ~100+ forecast documents per user |
| N+1 Firestore queries in chat history | Slow chat loading, high read costs | Batch queries, denormalize data, use subcollections | ~50+ messages per conversation |
| Uncompressed images in shared content | Slow share preview, data costs | Use Firebase Storage with resize extensions, WebP format | Images >500KB each |
| Client-side grid calculations for compatibility | UI freezes with 100+ user comparisons | Move heavy calculations to backend, cache results | 20+ simultaneous calculations |
| No lazy loading of AI features | Large bundle size, slow initial load | Code-split: `React.lazy(() => import('./AIChatbot'))` | Bundle >500KB |
| Real-time listeners for every user doc | Firestore read costs spike | Use `getDoc` for rarely-changing data, only `onSnapshot` for active features | ~10+ active listeners per user |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing birthdates in share URLs | Privacy violation, identity theft risk | Use anonymous share IDs, store shareable data separately |
| Storing Gemini API key in client bundle | Quota abuse, cost spike if key leaked | Environment variable on server, proxy all AI calls through backend |
| No rate limiting on AI endpoints | API abuse, DDoS vulnerability | Express-rate-limit: 10 requests/minute per IP, 50/day per user |
| Firebase rules allow reading other users' data | Privacy breach, data leak | Rules: `match /users/{userId} { allow read, write: if request.auth.uid == userId; }` |
| Personal data in Firestore indexed fields | Searchable PII, compliance risk | Don't index birthdates/names, use security rules to restrict queries |
| No sanitization of user input to AI | Prompt injection attacks | Validate input, strip dangerous patterns, set max input length (500 chars) |
| Shared reports accessible by URL guessing | Unauthorized access to personal numerology data | Generate cryptographically secure share IDs (UUID v4), expire after 30 days |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Asking for birthdate before showing value | High drop-off, feels invasive | Show sample forecast first, explain why birthdate is needed, then ask |
| No explanation of numerology terms | Confusion, feels like gatekeeping | Tooltips/inline definitions: "Moolank (मूलांक) = Root Number from birthdate" |
| Generic "Loading..." during AI generation | Anxiety, feels broken | Specific status: "Consulting the cosmic patterns..." with animated mystical icon |
| Chatbot responds instantly (feels robotic) | Breaks immersion, feels fake | Add artificial 1-2 second delay with typing indicator |
| No onboarding flow | Users don't know what's possible | Guided tour: "Try asking me about your personal year" with example questions |
| Forecast same format every day | Boring, reduces engagement | Vary format: some days text, some cards, some visualizations |
| Compatibility reports too generic | "This could apply to anyone" | Use specific numbers: "Your Moolank 5 complements their Bhagyank 7 in creativity" |
| No empty states | Confusing when no forecasts yet | "Your first daily forecast will appear tomorrow at 8am" with illustration |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **AI Chatbot:** Often missing conversation history persistence — verify messages saved to Firestore and retrieved on reload
- [ ] **AI Chatbot:** Often missing context limits — verify old messages truncated after 10-20 exchanges to prevent token bloat
- [ ] **Daily Forecasts:** Often missing timezone handling — verify forecast generated at user's midnight, not server UTC midnight
- [ ] **Push Notifications:** Often missing permission state handling — verify graceful degradation when permission denied
- [ ] **Push Notifications:** Often missing FCM token refresh — verify token updated on expiration, device change
- [ ] **PDF Reports:** Often missing error handling — verify graceful fallback if generation fails (offer HTML version)
- [ ] **Social Sharing:** Often missing OG meta tags — verify preview shows correct image/title when pasted in WhatsApp/Twitter
- [ ] **Social Sharing:** Often missing privacy filters — verify birthdates/personal info NOT in shared content
- [ ] **Framer Motion:** Often missing reduced-motion support — verify animations disable for users with motion sensitivity
- [ ] **Firebase Auth:** Often missing loading states — verify UI doesn't flicker between logged-out/logged-in states
- [ ] **Firebase Auth:** Often missing session persistence — verify user stays logged in after browser refresh
- [ ] **Firestore Listeners:** Often missing unsubscribe cleanup — verify listeners removed on component unmount (check DevTools)
- [ ] **AI Features:** Often missing offline handling — verify error message when no network, not infinite loading

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Token costs spiked | HIGH ($$$ already spent) | 1. Emergency: disable AI features via Firebase Remote Config 2. Add rate limits 3. Audit usage logs 4. Implement budgets |
| Memory leak from listeners | MEDIUM (redeploy required) | 1. Add cleanup functions to all useEffect with onSnapshot 2. Use React DevTools Profiler to find remaining leaks 3. Test navigation flows |
| Privacy leak in share URLs | HIGH (can't unpublish) | 1. Rotate share IDs (invalidate old URLs) 2. Add privacy filters 3. Notify affected users 4. Add preview before share |
| AI hallucinations discovered | MEDIUM (trust damage) | 1. Add validation layer immediately 2. Review all generated content 3. Reduce temperature 4. Add RAG with JSON data |
| PDF generation crashes mobile | LOW (server-side fix) | 1. Move generation to backend 2. Add job queue 3. Email PDF when ready 4. Add progress tracking |
| Push notification spam | MEDIUM (permissions lost) | 1. Apologize via in-app message 2. Add preferences UI 3. Send re-permission request explaining new controls |
| Animation jank on Android | MEDIUM (refactor required) | 1. Profile on real devices 2. Replace layout animations with transform-only 3. Add virtualization 4. Respect reduced-motion |
| Firestore quota exceeded | HIGH (app down) | 1. Upgrade to Blaze plan 2. Add caching layer 3. Optimize queries (stop using onSnapshot everywhere) 4. Archive old data |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Unbounded AI token costs | Phase 1: AI Chatbot | Load testing with 100 simulated users, verify rate limits work, check Firestore usage logs |
| AI persona inconsistency | Phase 1: AI Chatbot | Test suite: 50 questions, verify tone/character consistency, no "I'm an AI" responses |
| Firestore listener leaks | Phase 1: Daily Engagement | Chrome DevTools Memory profiler: navigate pages 20 times, verify memory stable |
| Social sharing privacy | Phase 2: Social Features | Manual review: share every feature, verify no birthdates/names in URLs or OG tags |
| PDF generation crash | Phase 1: Enhanced Reports | Test on iPhone SE, Android mid-range, verify 20-page report completes in <10s |
| Push notification fatigue | Phase 1: Daily Engagement | A/B test: measure permission acceptance rate, notification open rate, unsubscribe rate |
| AI hallucination | Phase 1: AI Chatbot | Regression suite: known queries → expected responses using JSON data as ground truth |
| Animation performance | Phase 1: Immersive UI | FPS monitoring: verify 60fps on Moto G series (mid-range Android), iPhone 12 |

## Sources

**Domain Knowledge (HIGH confidence):**
- Project context from /Users/deepaknaik/code/numero/PROJECT.md
- Existing codebase analysis: server.js (rate limiting, Gemini integration), firebaseConfig.js
- Established patterns for React + Firebase + AI applications

**General Best Practices (MEDIUM-HIGH confidence):**
- Firebase documentation on Firestore listeners and cleanup patterns
- Google Gemini API documentation on token limits and context management
- Framer Motion performance best practices (transform-only animations, GPU acceleration)
- React performance patterns (lazy loading, virtualization)
- Web Vitals and animation performance standards (60fps target)

**Mystical/AI Domain (MEDIUM confidence):**
- Common issues in AI chatbot persona consistency (character drift)
- RAG (Retrieval-Augmented Generation) patterns to prevent hallucination
- Privacy considerations for personal/mystical data sharing

**Specific to Project:**
- Identified Firebase API keys in firebaseConfig.js (public but need security rules)
- Noted existing rate limiting import in server.js (foundation exists, needs implementation)
- PDFKit already integrated server-side (correct architecture, needs async handling)
- Data layer structure (moolankMeanings.json, gridAnalysisDefinitions.json) for grounding AI

---
*Pitfalls research for: Numero (Next Gen) - AI-First Numerology App*
*Researched: 2026-02-01*
