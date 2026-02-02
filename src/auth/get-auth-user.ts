import { type DecodedIdToken, getTokens } from "next-firebase-auth-edge"
import { cookies } from "next/headers"
import { serverConfig } from "@/auth/config"
import type { AuthUser } from "@/auth/auth-provider"

export async function getAuthUser(): Promise<AuthUser | null> {
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
    isPremium: !!decodedToken.customClaims.premium,
  }
}
