import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { keys, queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/use-auth-store";
import { ProfileInput, User } from "@/types/user";

/**
 * The signed-in user. Seeded from the persisted session so screens render instantly,
 * then refreshed from the server and written back to the store.
 */
export function useMe() {
  const cached = useAuthStore((s) => s.user);
  const query = useQuery({
    queryKey: keys.me,
    queryFn: async () => (await api.get<User>("/users/me")).data,
    placeholderData: cached ?? undefined,
  });
  useEffect(() => {
    if (query.data && !query.isPlaceholderData) useAuthStore.getState().setUser(query.data);
  }, [query.data, query.isPlaceholderData]);
  return query;
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (input: ProfileInput) => (await api.put<User>("/users/me", input)).data,
    onSuccess: (user) => {
      queryClient.setQueryData(keys.me, user);
      useAuthStore.getState().setUser(user);
    },
  });
}
