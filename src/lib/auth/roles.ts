import { auth } from "@/auth/firebase-admin"

export async function setCustomUserClaims(uid: string, claims: object) {
  try {
    await auth.setCustomUserClaims(uid, claims)
    // Invalidate user sessions so they refresh the token (optional, but good practice if we could)
    // Unfortunately, with stateless sessions or long-lived cookies, we might need client-side refresh.
    // But next-firebase-auth-edge handles token refreshing if we trigger it.
  } catch (error) {
    console.error("Error setting custom claims:", error)
    throw error
  }
}

export async function getUserClaims(uid: string) {
  try {
    const userRecord = await auth.getUser(uid)
    return userRecord.customClaims
  } catch (error) {
    console.error("Error fetching user claims:", error)
    throw error
  }
}

export async function setUserPremiumStatus(uid: string, isPremium: boolean) {
  const currentClaims = (await getUserClaims(uid)) || {}
  await setCustomUserClaims(uid, {
    ...currentClaims,
    premium: isPremium,
  })
}
