---
phase: 08-social-engagement
title: Social Engagement & Viral Loops
tags: [opengraph, fcm, pwa, viral-growth]
depends_on: [06-auth-user-accounts]
provides: [social-sharing, push-notifications]
tech-stack:
  added: [firebase-messaging, next/og]
  patterns: [service-worker-push, dynamic-og-generation, native-share]
key-files:
  created:
    - src/app/opengraph-image.tsx
    - src/components/social/share-button.tsx
    - public/firebase-messaging-sw.js
    - src/hooks/use-fcm-token.ts
    - src/components/social/notification-manager.tsx
  modified:
    - src/app/profile/page.tsx
    - src/components/numerology/daily-forecast.tsx
    - src/components/numerology/compatibility-result.tsx
metrics:
  start_date: 2026-02-02
  end_date: 2026-02-02
  duration: 30m
---

# Phase 08: Social Engagement Summary

## Executive Summary
This phase transformed the application from a solitary experience into a socially connected platform. We implemented the "Viral Loop" through high-quality Open Graph previews and native sharing integration, and established a "Retention Loop" using Firebase Cloud Messaging for daily re-engagement.

## Key Deliverables

### 1. Viral Sharing Infrastructure
- **Dynamic Open Graph Images**: Implemented edge-generated, personalized social cards that render the Numero branding and content context (e.g., daily forecast details) dynamically.
- **Native Share Integration**: Built a smart `ShareButton` that leverages the Web Share API on mobile devices for seamless integration with Instagram/WhatsApp/etc., falling back to clipboard copying on desktop.

### 2. Push Notification System
- **Service Worker Architecture**: Deployed a robust service worker (`firebase-messaging-sw.js`) capable of handling background notifications even when the app is closed.
- **Permission & Token Management**: Created a resilient hook (`useFcmToken`) that manages the browser permission lifecycle and syncs FCM tokens to Firestore for the backend.
- **User Controls**: Added a dedicated "Preferences" section in the User Profile to give users control over their notification status.

## Decisions & Trade-offs
- **Edge Runtime for OG**: We chose `next/og` on the Edge runtime to ensure social previews load instantly, which is critical for click-through rates on social platforms.
- **Dynamic SW Config**: To avoid exposing secrets or hardcoding values in the public service worker file, we implemented a query-parameter injection strategy during SW registration.
- **Firestore Token Storage**: Tokens are stored in a `devices` subcollection to support multi-device users (phone + laptop) naturally.

## Technical Debt / Future Considerations
- **Push Campaign UI**: Currently, we have the infrastructure to *receive* notifications. A future Admin UI (or script) is needed to *send* them (e.g., "Send Daily Forecast").
- **Rich Notifications**: We are using basic notifications. Future updates could add images or action buttons to the push payload.

## Impact
Users can now share their compatibility scores and daily insights with visual fidelity, driving organic acquisition. Simultaneously, the app has the technical capability to pull users back in daily, boosting retention metrics.
