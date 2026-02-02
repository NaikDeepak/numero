import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import type { NumerologyInput } from "../numerology/types"

export type UserProfile = NumerologyInput

/**
 * Saves a user profile to Firestore
 */
export async function saveProfile(uid: string, profile: UserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, "users", uid)

    await setDoc(
      userDocRef,
      {
        profile: {
          ...profile,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error saving profile to Firestore:", error)
    throw error
  }
}

/**
 * Fetches a user profile from Firestore
 */
export async function getProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", uid)
    const docSnap = await getDoc(userDocRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.profile) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updatedAt, ...profile } = data.profile
        return profile as UserProfile
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching profile from Firestore:", error)
    return null
  }
}
