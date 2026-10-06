import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Appearance = "system" | "light" | "dark";

interface PreferencesState {
  appearance: Appearance;
  hideBalance: boolean;
  setAppearance: (appearance: Appearance) => void;
  setHideBalance: (hideBalance: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      appearance: "system",
      hideBalance: false,
      setAppearance: (appearance) => set({ appearance }),
      setHideBalance: (hideBalance) => set({ hideBalance }),
    }),
    { name: "preferences", storage: createJSONStorage(() => AsyncStorage) }
  )
);
