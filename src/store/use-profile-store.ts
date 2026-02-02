import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { NumerologyInput } from "@/lib/numerology/types"

export type UserProfile = NumerologyInput

interface ProfileState {
  profile: UserProfile | null
  isHydrated: boolean
  isSyncing: boolean
  lastSyncSource: "local" | "remote" | null
  setProfile: (profile: UserProfile) => void
  setProfileRemote: (profile: UserProfile) => void
  clearProfile: () => void
  setHydrated: (state: boolean) => void
  setSyncing: (syncing: boolean) => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      isHydrated: false,
      isSyncing: false,
      lastSyncSource: null,
      setProfile: (profile) => set({ profile, lastSyncSource: "local" }),
      setProfileRemote: (profile) => set({ profile, lastSyncSource: "remote" }),
      clearProfile: () => set({ profile: null, lastSyncSource: null }),
      setHydrated: (state) => set({ isHydrated: state }),
      setSyncing: (isSyncing) => set({ isSyncing }),
    }),
    {
      name: "user-profile-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => {
          state?.setHydrated(true)
        }
      },
    },
  ),
)

/**
 * Hook to use the profile store with hydration awareness.
 * This helps prevent SSR hydration mismatches.
 */
export function useHydratedProfile() {
  const profile = useProfileStore((state) => state.profile)
  const isHydrated = useProfileStore((state) => state.isHydrated)

  return {
    profile: isHydrated ? profile : null,
    isHydrated,
  }
}
