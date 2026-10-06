import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { keys, queryClient } from "@/lib/query-client";
import { AdminDashboardStats, KycSubmission, UserStats } from "@/types/admin";
import { User } from "@/types/user";

export function useAdminStats() {
  return useQuery({
    queryKey: [...keys.admin, "stats"],
    queryFn: async () => {
      const [dashboard, users] = await Promise.all([
        api.get<AdminDashboardStats>("/statistics/admin/dashboard"),
        api.get<UserStats>("/users/admin/stats"),
      ]);
      return { dashboard: dashboard.data, users: users.data };
    },
  });
}

export type KycFilter = "pending" | "approved" | "rejected" | "all";

export function useKycSubmissions(status: KycFilter) {
  return useQuery({
    queryKey: [...keys.admin, "kyc", status],
    queryFn: async () =>
      (await api.get<KycSubmission[]>(status === "all" ? "/kyc/admin/all" : `/kyc/admin/status/${status}`)).data,
  });
}

export function useKycSubmission(userId: number) {
  return useQuery({
    queryKey: [...keys.admin, "kyc", "user", userId],
    queryFn: async () => (await api.get<KycSubmission>(`/kyc/admin/user/${userId}`)).data,
    enabled: Number.isFinite(userId),
  });
}

export function useReviewKyc(userId: number) {
  return useMutation({
    mutationFn: (input: { status: "approved" | "rejected"; rejection_reason?: string }) =>
      api.put<unknown>(`/kyc/admin/${userId}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.admin }),
  });
}

export function useAdminUsers(search: string) {
  return useQuery({
    queryKey: [...keys.admin, "users", search],
    queryFn: async () => (await api.get<User[]>("/users/admin/all", { search: search || undefined, limit: 200 })).data,
  });
}

export function useSetUserActive() {
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      api.put<User>(`/users/admin/${userId}/status?is_active=${isActive}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.admin }),
  });
}
