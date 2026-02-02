"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/auth/auth-provider"
import { getProfile, saveProfile } from "@/lib/firebase/firestore"
import { useProfileStore } from "@/store/use-profile-store"

/**
 * Hook to synchronize user profile between LocalStorage (Zustand) and Firestore.
 * Handles migration of guest profiles to cloud on first login.
 */
export function useProfileSync() {
  const { user, loading: authLoading } = useAuth()
  const { profile, isHydrated, setProfileRemote, lastSyncSource, setSyncing } = useProfileStore()

  // Track if we've already performed the initial sync for the current user session
  const initialSyncDoneRef = useRef<string | null>(null)

  // 1. Initial Sync/Migration on Login
  useEffect(() => {
    if (authLoading || !isHydrated || !user) {
      if (!user) {
        initialSyncDoneRef.current = null
      }
      return
    }

    // Only run initial sync once per user ID
    if (initialSyncDoneRef.current === user.uid) return

    const performInitialSync = async () => {
      setSyncing(true)
      try {
        const cloudProfile = await getProfile(user.uid)

        if (cloudProfile) {
          // Cloud profile exists, it takes precedence over local guest data
          setProfileRemote(cloudProfile)
        } else if (profile) {
          // No cloud profile found but local data exists - migrate it to Firestore
          await saveProfile(user.uid, profile)
        }

        initialSyncDoneRef.current = user.uid
      } catch (error) {
        console.error("[useProfileSync] Initial sync error:", error)
      } finally {
        setSyncing(false)
      }
    }

    performInitialSync()
  }, [user, authLoading, isHydrated, profile, setProfileRemote, setSyncing])

  // 2. Persist local changes to Firestore
  useEffect(() => {
    // Only sync if user is logged in, data is hydrated, and change came from local UI
    if (!user || !profile || !isHydrated || lastSyncSource !== "local") return

    const persistToCloud = async () => {
      try {
        await saveProfile(user.uid, profile)
      } catch (error) {
        console.error("[useProfileSync] Cloud persistence error:", error)
      }
    }

    // Debounce or immediate? For profile data (small), immediate is usually fine
    // unless the user is typing rapidly in a form that updates store on every keystroke.
    // Given the current app structure, profile updates are usually discrete actions.
    persistToCloud()
  }, [profile, user, isHydrated, lastSyncSource])
}
