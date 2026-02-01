/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useProfileStore } from "../use-profile-store";

describe("useProfileStore", () => {
  beforeEach(() => {
    // Reset store state before each test if needed
    useProfileStore.getState().clearProfile();
    localStorage.clear();
  });

  it("should initialize with null profile", () => {
    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
  });

  it("should set profile", () => {
    const profile = { name: "John Doe", dob: "1990-01-01", gender: "male" as const };
    useProfileStore.getState().setProfile(profile);

    const state = useProfileStore.getState();
    expect(state.profile).toEqual(profile);
  });

  it("should clear profile", () => {
    const profile = { name: "John Doe", dob: "1990-01-01", gender: "male" as const };
    useProfileStore.getState().setProfile(profile);
    useProfileStore.getState().clearProfile();

    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
  });

  it("should persist profile in localStorage", () => {
    const profile = { name: "Jane Doe", dob: "1992-05-15", gender: "female" as const };
    useProfileStore.getState().setProfile(profile);

    const storedValue = localStorage.getItem("user-profile-storage");
    expect(storedValue).toBeDefined();
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      expect(parsed.state.profile).toEqual(profile);
    }
  });
});
