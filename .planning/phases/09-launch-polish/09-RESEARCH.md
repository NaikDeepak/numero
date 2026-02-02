# Phase 09: Launch Polish - Research

**Researched:** 2026-02-02
**Domain:** SEO, PWA, Error Handling
**Confidence:** HIGH

## Summary

The application functionality is complete, but it lacks the standard "production-ready" artifacts required for a high-quality web deployment. Specifically, we are missing SEO helpers, error boundaries, and PWA configuration which is crucial for the Push Notification feature we just built.

## 1. SEO & Discovery

Next.js App Router provides dynamic file-based APIs for these:

- **`src/app/robots.ts`**: Controls crawler access.
- **`src/app/sitemap.ts`**: dynamic XML sitemap. We should include static routes (`/`, `/login`) and potentially generate dynamic ones if we had public profiles (we don't yet).

## 2. Error Handling

To prevent the default Next.js white/black error screens which break immersion:

- **`src/app/not-found.tsx`**: Custom 404 page. Should maintain the "Cosmic" theme.
- **`src/app/error.tsx`**: Client component to catch runtime errors. Needs a "Try Again" button.
- **`src/app/global-error.tsx`**: Catch-all for root layout errors (optional but recommended).

## 3. PWA (Progressive Web App)

Since we added **Push Notifications** (Phase 08), users (especially on iOS) must "Add to Home Screen" for the best experience.

- **`src/app/manifest.ts`**: Generates `manifest.json`.
- **Requirements**:
  - `name`, `short_name`
  - `start_url: /`
  - `display: standalone`
  - `icons`: We need at least 192x192 and 512x512. We can use the OG image generator logic or static assets if available. *Action: Use placeholder standard icons or reuse the OG SVG code to generate a static route for icons.*

## 4. Environment Variables

We added several new env vars in Phase 06 and 08.
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- `FIREBASE_PRIVATE_KEY` (formatted)

We need to update `.env.example`.

## Architecture

```
src/app/
├── robots.ts
├── sitemap.ts
├── manifest.ts
├── not-found.tsx
└── error.tsx
```

## Metadata
**Research date:** 2026-02-02
**Valid until:** 2026-05-02
