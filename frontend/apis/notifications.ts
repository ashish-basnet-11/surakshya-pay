import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { keys, queryClient } from "@/lib/query-client";
import { Notification } from "@/types/notifications";

export function useNotifications() {
  return useQuery({
    queryKey: [...keys.notifications, "list"],
    queryFn: async () => (await api.get<Notification[]>("/notifications/", { limit: 100 })).data,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: keys.unreadCount,
    queryFn: async () => (await api.get<number>("/notifications/unread-count")).data,
    refetchInterval: 60_000,
  });
}

const refresh = () => queryClient.invalidateQueries({ queryKey: keys.notifications });

export function useMarkRead() {
  return useMutation({
    mutationFn: (id: number) => api.post<unknown>(`/notifications/${id}/read`),
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>([...keys.notifications, "list"], (list) =>
        list?.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    },
    onSettled: refresh,
  });
}

export function useMarkAllRead() {
  return useMutation({
    mutationFn: () => api.post<unknown>("/notifications/mark-all-read"),
    onSettled: refresh,
  });
}
