"use client"

import { useProfileSync } from "@/hooks/use-profile-sync"

/**
 * Headless component that activates the profile synchronization logic.
 * Should be mounted inside the AuthProvider.
 */
export function ProfileSyncManager() {
  useProfileSync()
  return null
}
