"use server"

import { revalidatePath } from "next/cache"
import { getAuthUser } from "@/auth/get-auth-user"
import { getUserClaims, setUserPremiumStatus } from "@/lib/auth/roles"

export async function togglePremiumStatus() {
  const user = await getAuthUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const claims = (await getUserClaims(user.uid)) || {}
    const currentStatus = !!claims.premium
    const newStatus = !currentStatus

    await setUserPremiumStatus(user.uid, newStatus)

    // Note: The client needs to refresh its token for the change to be reflected immediately in the session cookie.
    // However, since we are using next-firebase-auth-edge, the middleware handles token verification.
    // If the ID token stored in the cookie is not expired, it might still have old claims.
    // For immediate update, we'd ideally want to refresh the session.

    // In a real app, this would be a webhook from Stripe.
    // For this self-service MVP, we just set it.

    revalidatePath("/")
    revalidatePath("/reports/premium")
    revalidatePath("/upgrade")

    return { success: true, isPremium: newStatus }
  } catch (error) {
    console.error("Failed to toggle premium status:", error)
    return { success: false, error: "Failed to update status" }
  }
}
