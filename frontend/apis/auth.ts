import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/use-auth-store";
import { RegisterInput, Session, User } from "@/types/user";

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const form = new URLSearchParams({ username: email, password });
      const res = await api.post<Session>("/auth/login", form.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return res.data;
    },
    // Signing in flips the route guards in app/_layout, which redirects for us.
    onSuccess: (session) =>
      useAuthStore.getState().signIn({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: session.user,
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => (await api.post<User>("/users/", input)).data,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => api.post<null>("/auth/forgot-password", { email }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string }) => api.post<null>("/auth/verify-otp", input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string; new_password: string }) =>
      api.post<null>("/auth/reset-password", input),
  });
}
