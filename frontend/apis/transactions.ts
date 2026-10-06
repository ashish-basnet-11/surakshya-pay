import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateMoney, keys } from "@/lib/query-client";
import { SpendingSummary, Transaction, TransferInput } from "@/types/transaction";

export function useTransactions({ limit = 200 }: { limit?: number } = {}) {
  return useQuery({
    queryKey: [...keys.transactions, "list", limit],
    queryFn: async () => (await api.get<Transaction[]>("/transactions/", { limit, order_by: "latest" })).data,
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: keys.transaction(id),
    queryFn: async () => (await api.get<Transaction>(`/transactions/${id}`)).data,
    enabled: Number.isFinite(id),
  });
}

export function useStatistics() {
  return useQuery({
    queryKey: keys.statistics,
    queryFn: async () => (await api.get<SpendingSummary>("/statistics/")).data,
  });
}

export function useTopUp() {
  return useMutation({
    mutationFn: (amount: number) => api.post<unknown>("/transactions/topup", null, { params: { amount } }),
    // Refresh on failure too: the server may have moved money before erroring.
    onSettled: invalidateMoney,
  });
}

export function useWithdraw() {
  return useMutation({
    mutationFn: (amount: number) => api.post<unknown>("/transactions/withdraw", null, { params: { amount } }),
    // Refresh on failure too: the server may have moved money before erroring.
    onSettled: invalidateMoney,
  });
}

export function useTransfer() {
  return useMutation({
    mutationFn: ({ to_username, amount, category }: TransferInput) =>
      api.post<unknown>("/transactions/transfer", null, {
        params: { to_username, amount, category: category ?? "" },
      }),
    // Refresh on failure too: the server may have moved money before erroring.
    onSettled: invalidateMoney,
  });
}
