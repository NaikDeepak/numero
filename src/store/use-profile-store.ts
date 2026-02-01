import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserProfile {
	name: string;
	dob: string; // ISO format or YYYY-MM-DD
	gender: "male" | "female" | "other";
}

interface ProfileState {
	profile: UserProfile | null;
	isHydrated: boolean;
	setProfile: (profile: UserProfile) => void;
	clearProfile: () => void;
	setHydrated: (state: boolean) => void;
}

export const useProfileStore = create<ProfileState>()(
	persist(
		(set) => ({
			profile: null,
			isHydrated: false,
			setProfile: (profile) => set({ profile }),
			clearProfile: () => set({ profile: null }),
			setHydrated: (state) => set({ isHydrated: state }),
		}),
		{
			name: "user-profile-storage",
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: (state) => {
				return () => {
					state?.setHydrated(true);
				};
			},
		},
	),
);

/**
 * Hook to use the profile store with hydration awareness.
 * This helps prevent SSR hydration mismatches.
 */
export function useHydratedProfile() {
	const profile = useProfileStore((state) => state.profile);
	const isHydrated = useProfileStore((state) => state.isHydrated);

	return {
		profile: isHydrated ? profile : null,
		isHydrated,
	};
}
