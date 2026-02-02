# v1.1 Deployment Guide (Production)

This guide covers the deployment of the full v1.1 feature set, including Auth, Premium Tiers, AI Reports, and Push Notifications.

## 1. Prerequisites

Ensure you have accounts on:
- **Vercel** (Hosting)
- **Firebase** (Auth, Firestore, FCM)
- **Google AI Studio** (Gemini API)

## 2. Environment Variables Checklist

You need to set these 15 variables in your Vercel Project Settings.

### Client-Side (Prefix: `NEXT_PUBLIC_`)
These are safe to expose to the browser.

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Firebase Console -> Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth Domain | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| Storage Bucket | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID for FCM | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web Push Certificate | Firebase Console -> Cloud Messaging -> Web Push certs |

### Server-Side (Secrets)
**NEVER** expose these with `NEXT_PUBLIC_`.

| Variable | Description | Source |
|----------|-------------|--------|
| `GEMINI_API_KEY` | Google Gemini API Key | Google AI Studio |
| `API_KEY` | Alias for Gemini (library requirement) | Same as above |
| `AUTH_COOKIE_NAME` | Session cookie name | Set to `__session` (recommended) |
| `AUTH_COOKIE_SIGNATURE_KEY_1` | 32-char random string | Generate: `openssl rand -hex 32` |
| `AUTH_COOKIE_SIGNATURE_KEY_2` | 32-char random string | Generate: `openssl rand -hex 32` |
| `FIREBASE_PROJECT_ID` | Admin SDK Project ID | Same as client project ID |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | Firebase Console -> Service Accounts |
| `FIREBASE_PRIVATE_KEY` | Service Account Private Key | Firebase Console -> Service Accounts -> Generate Key |

> **Critical Note on Private Key**: When pasting the private key into Vercel, ensure you copy the **entire** string including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. Vercel handles newlines automatically in their UI.

## 3. Firebase Configuration

### Authentication
1. Go to **Authentication** -> **Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google** (optional but recommended).

### Firestore
1. Go to **Firestore Database**.
2. Create database (Production mode).
3. Set Security Rules (See `firestore.rules` in repo).
   - Ensure users can only read/write their own profile (`/users/{uid}`).

### Cloud Messaging (FCM)
1. Go to **Project Settings** -> **Cloud Messaging**.
2. Under "Web configuration", generate a "Web Push Certificate" (KeyPair).
3. This is your `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.

## 4. Deploying to Vercel

1. **Push code** to GitHub/GitLab/Bitbucket.
2. **Import project** in Vercel.
3. **Configure Build Settings**:
   - Framework: Next.js
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
4. **Add Environment Variables**: Copy/paste all 15 variables from Step 2.
5. **Click Deploy**.

## 5. Post-Deployment Verification

1. **Visit URL**: `https://your-project.vercel.app`
2. **Check PWA**: Open DevTools -> Application -> Manifest. It should load without errors.
3. **Test Auth**: Sign up a new user. You should be redirected to `/profile`.
4. **Test Premium**: Go to `/upgrade`, click "Dev Mode" upgrade. Verify badge appears.
5. **Test AI**: Generate a compatibility report. It should return text within 5-10s.
6. **Test SEO**: Visit `/robots.txt` and `/sitemap.xml`.

## 6. Troubleshooting

- **500 Error on Login**: Check `FIREBASE_PRIVATE_KEY` format. It must match the PEM format exactly.
- **"Application Error"**: Check Vercel Logs. Our `src/lib/logger.ts` will output structured JSON logs there.
- **Push Notifications not working**: Ensure you are on HTTPS (Vercel provides this by default). Service workers require HTTPS.
