import { User } from "@/types/user";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  login: (
    accessToken: string,
    refreshToken?: string,
    user?: User,
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (
      set: (fn: (state: AuthState) => AuthState | Partial<AuthState>) => void
    ) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setUser: (user: User) => set((state) => ({ ...state, user })),
      setAccessToken: (accessToken: string) =>
        set((state) => ({ ...state, accessToken })),
      setRefreshToken: (refreshToken: string) =>
        set((state) => ({ ...state, refreshToken })),
      login: (
        accessToken: string,
        refreshToken?: string,
        user?: User,
      ) =>
        set((state) => ({
          user,
          accessToken,
          refreshToken: refreshToken || null,
        })),
      logout: () =>
        set((state) => ({
          ...state,
          user: null,
          accessToken: null,
          refreshToken: null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
