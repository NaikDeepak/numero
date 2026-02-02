import { cookies } from "next/headers"
import { getTokens } from "next-firebase-auth-edge"
import type { AuthUser } from "@/auth/auth-provider"
import { serverConfig } from "@/auth/config"

export async function getAuthUser(): Promise<AuthUser | null> {
  const { clientEmail, privateKey } = serverConfig.serviceAccount

  // Ensure we have a valid service account configuration before attempting to verify tokens
  if (!clientEmail || !privateKey || !privateKey.includes("BEGIN PRIVATE KEY")) {
    if (process.env.NODE_ENV !== "production") {
      const pkStatus = privateKey
        ? `Present (starts with: ${privateKey.substring(0, 20)}...)`
        : "Missing"
      console.warn(
        `[getAuthUser] ⚠️ Missing or invalid Firebase Admin Private Key. Returning null user. Check your .env.local. PrivateKey: ${pkStatus}`,
      )
    }
    return null
  }

  // Debug private key (safe log)
  if (process.env.NODE_ENV !== "production") {
    console.log("[getAuthUser] Private Key Debug:", {
      length: privateKey.length,
      startsWithHeader: privateKey.startsWith("-----BEGIN PRIVATE KEY-----"),
      containsNewlines: privateKey.includes("\n"),
      type: typeof privateKey,
    })
  }

  try {
    const tokens = await getTokens(await cookies(), {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: serverConfig.cookieSignatureKeys,
      serviceAccount: serverConfig.serviceAccount,
    })

    if (!tokens) {
      return null
    }

    const { decodedToken } = tokens

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      displayName: (decodedToken.name as string) ?? null,
      photoURL: (decodedToken.picture as string) ?? null,
      emailVerified: !!decodedToken.email_verified,
      isPremium: !!(decodedToken.customClaims as { premium?: boolean })?.premium,
    }
  } catch (error) {
    // Catch-all for underlying library errors (like malformed keys) to prevent 500s
    console.error("[getAuthUser] Error verifying tokens:", error)
    return null
  }
}
