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

### Active
- [ ] **Immersive UI Overhaul**: Modern minimal aesthetic with high-quality motion design and transitions.
- [ ] **AI-First Experience**:
    - AI Chatbot (Numerologist Persona)
    - Personalized AI Forecasts (Daily/Monthly)
    - AI-Driven Compatibility Analysis
    - Enhanced AI Reports
- [ ] **Social Features**: Seamless sharing of daily forecasts and numerology charts.
- [ ] **Daily Engagement**: Real-time updates and push notifications for daily insights.

### Out of Scope
- **Community Forums**: Defer complex community features to v2.
- **Friend Lists/Network**: Focus on direct sharing first, graph network later.
- **Legacy Frontend**: Complete rewrite; no code reuse from old `src/` (except logic reference).

## Context
- **Brownfield Rewrite**: We are keeping the proven backend logic (`api/utils/`) and data layers (`api/data/`) but completely rebuilding the frontend and interaction layer.
- **Tech Stack**: React 18+, Vite, Tailwind CSS (implied for modern/minimal), Framer Motion (for motion design), Firebase (Auth/DB), Google Gemini (AI).
- **Design Philosophy**: "Modern Minimal" — clean typography, generous whitespace, subtle animations, not "cluttered mystical."

## Constraints
- **Timeline**: v1 MVP focus.
- **Performance**: High priority on smooth animations and fast load times (SPA).
- **AI Costs**: Monitor token usage for heavy AI features (Chat/Reports).

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Total Frontend Rewrite** | Legacy UI was not "next gen"; easier to build immersive UI from scratch than refactor. | — Pending |
| **Retain Backend Logic** | Core math (Moolank/Bhagyank) doesn't change; re-verifying it is waste. | — Pending |
| **AI-First Strategy** | Differentiator from static numerology apps; utilizing existing Gemini integration. | — Pending |
| **Modern Minimal Design** | Chosen over "Cosmic Theme" to appeal to broader, modern audience. | — Pending |

---
*Last updated: 2026-02-01 after initialization*
