# Phase 06: Auth & User Accounts - Research

**Researched:** 2026-02-02
**Domain:** Authentication, Session Management, and Database Synchronization
**Confidence:** HIGH

## Summary

This phase focuses on transitioning from a local-only experience to a cloud-synced user account system. Given the stack is **Next.js 16** and **React 19**, the implementation must account for fully asynchronous APIs (like `cookies()`, `headers()`, and `params()`) and the new React 19 features. The standard for Firebase in this environment remains a **hybrid cookie-based approach**.

**Primary recommendation:** Use `next-firebase-auth-edge` for session management. It is currently the most robust solution for bridging Firebase Auth with Next.js App Router, supporting both Node.js and Edge runtimes. It handles the complexities of Next.js 16's async request APIs and ensures that authentication state is available in Server Components without hydration flashes.

## Standard Stack

The established libraries for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `firebase` | ^12.8.0 | Client SDK | Current version in package.json; used for client-side auth triggers. |
| `firebase-admin` | ^12.x | Server SDK | Necessary for backend token verification and Firestore access. |
| `next-firebase-auth-edge`| ^1.x | Session Bridge | Best-in-class for bridging Firebase Auth with Next.js 16. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `stripe` | ^14.x | Payments | For premium tier gating (Phase 8 preparation). |
| `zod` | ^3.x | Validation | Schema validation for user profiles. |

**Installation:**
```bash
npm install next-firebase-auth-edge
npm install -D firebase-admin
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── auth/
│   ├── firebase.ts          # Client SDK initialization
│   ├── firebase-admin.ts    # Admin SDK initialization (server-only)
│   ├── auth-provider.tsx    # Client-side Auth Context (React 19 compatible)
│   └── to-user.ts           # Token-to-user mapping logic
├── middleware.ts            # Route protection and session cookie management
└── app/
    ├── api/
    │   ├── login/route.ts   # Endpoint to exchange ID Token for Session Cookie
    │   └── logout/route.ts  # Endpoint to clear cookies
    └── (protected)/         # Group for auth-required routes
        └── profile/
            └── page.tsx     # Uses await cookies() to fetch tokens
```

### Pattern 1: Async Session Access
**What:** In Next.js 16, accessing cookies is strictly asynchronous. All auth helpers must be awaited.
**Example:**
```typescript
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";

export async function getUser() {
  const cookieStore = await cookies();
  const tokens = await getTokens(cookieStore, { /* config */ });
  return tokens ? toUser(tokens) : null;
}
```

### Anti-Patterns to Avoid
- **Sync Cookie Access:** Trying to access `cookies()` without `await` will fail in Next.js 16.
- **Client-Side Firebase State for Gating:** Relying on `onAuthStateChanged` for route guarding causes layout shifts and poor UX. Use Middleware + Cookies instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session Management | Custom JWT logic | `next-firebase-auth-edge` | Built-in support for Next.js async APIs and Edge runtime. |
| Form Handling | Custom loading states | `useActionState` (React 19) | Native React hook for managing form state and pending transitions. |
| Database Sync | Custom fetch wrappers | Firestore SDK + Hooks | Handles offline persistence and real-time updates natively. |

## Common Pitfalls

### Pitfall 1: Next.js 16 Async API Breaking Changes
**What goes wrong:** Using older tutorials that treat `cookies()` or `params` as synchronous objects.
**How to avoid:** Always `await` headers, cookies, and params. Ensure `next-firebase-auth-edge` is on the latest version that supports Next.js 16.

### Pitfall 2: LocalStorage to Cloud Migration
**What goes wrong:** Data duplication or loss when moving existing anonymous user data from LocalStorage to Firestore.
**How to avoid:** On the first authenticated session, check if LocalStorage has data. If yes, push it to Firestore and set a "migrated" flag in LocalStorage.

## Code Examples

### React 19 Auth Provider
```typescript
"use client";

import { createContext, useContext, ReactNode } from "react";
import { User } from "./to-user";

const AuthContext = createContext<{ user: User | null } | undefined>(undefined);

export function AuthProvider({ user, children }: { user: User | null; children: ReactNode }) {
  // We use the user object passed from the Server Component (Layout)
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useFormStatus` | `useActionState` | React 19 | More robust state management for server actions. |
| Synchronous `cookies()` | Asynchronous `await cookies()` | Next.js 15/16 | Improved performance and predictability in SSR. |

## Open Questions

1. **Service Account Security:** How to best manage the private key in Vercel/Production?
   - *Recommendation:* Use environment variables, ensuring the private key is properly formatted with newlines replaced (e.g., `.replace(/\\n/g, '\n')`).
2. **Premium Tier Gating:** Should we use Custom Claims or a Firestore document?
   - *Recommendation:* Use Custom Claims for immediate gating in Middleware, but mirror in Firestore for easy auditing and metadata storage.

## Sources

### Primary (HIGH confidence)
- [/awinogrodzki/next-firebase-auth-edge](https://github.com/awinogrodzki/next-firebase-auth-edge) - Verified compatibility with Next.js 16 and React 19.
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16) - For async API documentation.
- [React 19 Documentation](https://react.dev/blog/2024/12/05/react-19) - For `useActionState` and new Context API.

## Metadata
**Research date:** 2026-02-02
**Valid until:** 2026-05-02
