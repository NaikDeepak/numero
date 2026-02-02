# Phase 04: AI Infrastructure & Daily Forecasts

**Goal:** Implement a robust, rate-limited AI service layer to generate personalized daily numerology forecasts.

## Strategic Context
The "Next Gen" differentiator for Numero is the shift from static JSON interpretations to dynamic, personalized AI insights. Phase 4 builds the bridge to the LLM (Gemini) and implements the first consumer of this bridge: the Daily Forecast.

We are moving from a "lookup" model (checking `personalYearMeanings.json`) to a "generative" model (asking Gemini to interpret the Personal Day number in the context of the user's Life Path).

## Architecture
- **Service Layer**: `src/lib/ai/*`
  - `gemini.ts`: Typed client for Google Generative AI.
  - `prompts.ts`: Centralized prompt management (separating code from content).
  - `rate-limit.ts`: Token-bucket or sliding window limiter using generic storage (KV or memory).
  - `cache.ts`: Caching layer to prevent redundant AI calls (vital for cost control).
- **Server Actions**: `src/app/actions/forecast.ts`
  - Secure entry point for frontend components.
  - Handles validation, rate limiting, and cache checks before calling AI.

## Requirements (AI-01)
1. **Personalization**: Forecast must consider Personal Day + Bhagyank (Life Path).
2. **Persona**: Tone should be "Mystical yet Modern" (aligned with the UI).
3. **Safety**: Rate limits per user/IP.
4. **Efficiency**: Cache forecasts for 24 hours (a daily forecast doesn't change during the day).

## Dependencies
- `@google/generative-ai`: Official SDK.
- `kv` (Vercel KV) or `lru-cache`: For caching and rate limiting.
