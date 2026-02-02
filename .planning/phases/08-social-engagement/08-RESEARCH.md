# Phase 08: Social Engagement - Research

**Researched:** 2026-02-02
**Domain:** Social Sharing, Open Graph, Push Notifications
**Confidence:** HIGH

## Summary

This phase focuses on turning Numero into a daily habit and a viral loop. We need to implement two key systems:
1. **Viral Sharing**: Generating beautiful, dynamic images for social media previews (Open Graph) and enabling native sharing interactions.
2. **Engagement**: Re-engaging users via Push Notifications (FCM).

## 1. Dynamic Open Graph (OG) Images

Next.js 13+ (App Router) provides built-in support for dynamic Open Graph images using `ImageResponse` from `next/og`. This allows us to generate images on the fly using HTML/CSS.

**Recommendation:** Use `app/[route]/opengraph-image.tsx` convention.

### Tech Stack
- **Library**: `next/og` (Built-in)
- **Styling**: Tailwind CSS (subset supported by Satori engine)
- **Fonts**: Custom fonts must be loaded as ArrayBuffers.

### Strategy
- **Daily Forecast**: `/daily/opengraph-image.tsx` -> Shows the "Number of the Day" and a brief keyword.
- **Compatibility**: `/compatibility/opengraph-image.tsx` -> Shows two names + compatibility score.
- **Profile**: `/profile/opengraph-image.tsx` -> "Deepak's Numerology Profile".

## 2. Web Share API

For the "Share" button in the UI, we should prioritize the native Web Share API (`navigator.share`) which allows sharing to installed apps (WhatsApp, Instagram, etc.) on mobile.

**Fallback:** If `navigator.share` is not supported (Desktop), fallback to copying to clipboard or opening a modal with social links.

## 3. Push Notifications (FCM)

Since we are already using Firebase, **Firebase Cloud Messaging (FCM)** is the natural choice.

### Workflow
1. **Permission**: Request permission from user (`Notification.requestPermission()`).
2. **Token**: Get FCM Token (`getToken()`).
3. **Storage**: Save Token to Firestore under `/users/{uid}/devices`.
4. **Sending**: Use Firebase Admin SDK (Server Actions or Cloud Functions) to send messages.

### Service Worker
We need a `public/firebase-messaging-sw.js` to handle background notifications.

**Constraint:** FCM requires the service worker to be in the public root.

## Architecture

```
src/
├── app/
│   ├── daily/
│   │   └── opengraph-image.tsx    # Dynamic OG generator
│   └── compatibility/
│   │   └── opengraph-image.tsx    # Dynamic OG generator
├── components/
│   └── social/
│       ├── share-button.tsx       # Smart wrapper for navigator.share
│       └── notification-manager.tsx # Handles permission & token sync
├── lib/
│   └── social/
│       └── notifications.ts       # FCM client-side logic
└── public/
    └── firebase-messaging-sw.js   # Background worker
```

## Risks & Mitigations

- **OG Image Performance**: Generating images on every request can be slow. Vercel automatically caches these, but we should ensure `revalidate` strategy is correct.
- **Notification Spam**: Users hate spam. We must add a settings toggle for "Daily Notifications" in the profile.
- **Browser Support**: Web Share API is not on Firefox Desktop. Fallback UI is required.

## Metadata
**Research date:** 2026-02-02
**Valid until:** 2026-05-02
