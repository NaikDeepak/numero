# Numero (Next Gen)

## What This Is
A next-generation AI-first numerology application that combines deep mystical insights with a modern, immersive, and minimal UI. It serves users seeking personalized self-discovery, daily guidance, and relationship clarity through advanced AI interactions and social sharing capabilities.

## Core Value
Delivering deeply personalized, AI-driven numerological insights in a visually stunning, friction-free experience that users want to engage with daily.

## Requirements

### Validated
- ✓ [Core Calculation Engine] — existing (from previous codebase: Grid/Name calculations)
- ✓ [Basic Interpretations] — existing (JSON data layers)
- ✓ [Report Generation] — existing (PDF generation logic)
- ✓ [Google Gemini Integration] — existing (AI analysis capability)
- ✓ [Immersive UI] — v1.0 (smooth transitions, animated grids, dark/light mode)
- ✓ [Daily Forecasts] — v1.0 (AI-generated based on personal day)
- ✓ [AI Compatibility] — v1.0 (Synergy analysis + numeric match)
- ✓ [AI Reports] — v1.0 (Server-side PDF generation)
- ✓ [Auth & User Accounts] — v1.1 (Secure login, profile sync, premium gating)
- ✓ [Social Features] — v1.1 (Viral sharing via OG images & Native Share)
- ✓ [Daily Engagement] — v1.1 (Push notifications via FCM)

### Active
- [ ] **Launch Polish**: Final monitoring setup and production environment configuration.

### Out of Scope
- **Community Forums**: Defer complex community features to v2.
- **Friend Lists/Network**: Focus on direct sharing first, graph network later.
- **Legacy Frontend**: Complete rewrite; no code reuse from old `src/` (except logic reference).

## Current State (v1.0 MVP)
- **Tech Stack**: Next.js 15 (App Router), Tailwind CSS v4, Framer Motion, Google Gemini 2.0 Flash.
- **Status**: Production-ready MVP with full AI integration.
- **Deployment**: Vercel (Frontend + Server Actions) + Firebase (Auth/DB ready but largely unused in v1).
- **Codebase**: ~32k lines of TypeScript. Clean architecture with separated UI/Logic/AI layers.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Total Frontend Rewrite** | Legacy UI was not "next gen"; easier to build immersive UI from scratch than refactor. | ✓ Validated (v1 shipped) |
| **Retain Backend Logic** | Core math (Moolank/Bhagyank) doesn't change; re-verifying it is waste. | ✓ Validated (v1 shipped) |
| **AI-First Strategy** | Differentiator from static numerology apps; utilizing existing Gemini integration. | ✓ Validated (v1 shipped) |
| **Modern Minimal Design** | Chosen over "Cosmic Theme" to appeal to broader, modern audience. | ✓ Validated (v1 shipped) |
| **Symmetric Caching** | Normalize compatibility requests (A+B = B+A) to save AI tokens. | ✓ Validated (v1 shipped) |

---
*Last updated: 2026-02-02 after v1.0 milestone*
