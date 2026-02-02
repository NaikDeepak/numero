# Phase 1 Deployment Guide

## Firebase Setup

### 1. Get Firebase Configuration

The legacy app already has a Firebase project. Reuse it:

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select existing project (check .firebaserc for project ID)
3. Go to **Project Settings → General**
4. Scroll to "Your apps" section
5. If no web app exists, click **Add app → Web**
6. Copy the configuration values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

### 2. Create .env.local

In project root, create `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=numero-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=numero-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=numero-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Replace values with your actual Firebase config.

### 3. Test Firebase Connection

```bash
pnpm dev
```

Open browser console. Should see no Firebase errors.

## Vercel Deployment

### 1. Add Environment Variables to Vercel

Option A: Via Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (numero)
3. Go to **Settings → Environment Variables**
4. Add each variable from .env.local:
   - Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Value: (paste from .env.local)
   - Environment: **Production, Preview, Development** (select all)
5. Repeat for all 6 Firebase variables

Option B: Via CLI
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production preview development
# Paste value when prompted
# Repeat for all variables
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

This will:
- Build the Next.js app
- Deploy to production
- Return deployment URL

### 3. Verify Deployment

Visit the deployment URL (e.g., https://numero.vercel.app)

Check:
- [ ] Page loads without errors
- [ ] Theme toggle works
- [ ] No Firebase errors in browser console

## Troubleshooting

**Firebase error in browser console:**
- Check .env.local values match Firebase Console
- Verify all variables have NEXT_PUBLIC_ prefix
- Restart dev server after changing .env.local

**Vercel build fails:**
- Check environment variables are set in Vercel dashboard
- Verify all 6 Firebase variables are present
- Check build logs for specific error

**Theme doesn't persist:**
- Check cookies are enabled in browser
- Verify no ad blockers blocking localStorage

## Next Steps

After deployment succeeds, Phase 1 is complete. Proceed to Phase 2 (Core Numerology).
