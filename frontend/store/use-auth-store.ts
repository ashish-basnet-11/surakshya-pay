import { UserInDB } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: UserInDB | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: UserInDB) => void;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  login: (
    accessToken: string,
    refreshToken?: string,
    user?: UserInDB,
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
      setUser: (user: UserInDB) => set((state) => ({ ...state, user })),
      setAccessToken: (accessToken: string) =>
        set((state) => ({ ...state, accessToken })),
      setRefreshToken: (refreshToken: string) =>
        set((state) => ({ ...state, refreshToken })),
      login: (
        accessToken: string,
        refreshToken?: string,
        user?: UserInDB,
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
      partialize: (state: AuthState) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
