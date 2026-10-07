import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { invalidateMoney, keys, queryClient } from "@/lib/query-client";
import { Budget, BudgetInput, BudgetStatus, BudgetSummary } from "@/types/budget";

export function useBudgets(filter: { status?: BudgetStatus } = {}) {
  return useQuery({
    queryKey: [...keys.budgets, "list", filter.status ?? "all"],
    queryFn: async () =>
      (await api.get<Budget[]>("/budgets/", { status: filter.status, sort_by: "created_at", sort_order: "desc", limit: 100 }))
        .data,
  });
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: keys.budget(id),
    queryFn: async () => (await api.get<Budget>(`/budgets/${id}`)).data,
    enabled: Number.isFinite(id),
  });
}

export function useBudgetSummary() {
  return useQuery({
    queryKey: keys.budgetSummary,
    queryFn: async () => (await api.get<BudgetSummary>("/budgets/summary/overview")).data,
  });
}

/** Categories the user already budgets for; transfers tagged with one count against it. */
export function useBudgetCategories() {
  return useQuery({
    queryKey: keys.budgetCategories,
    queryFn: async () => (await api.get<string[]>("/budgets/filters/categories")).data,
  });
}

const refresh = () => queryClient.invalidateQueries({ queryKey: keys.budgets });

export function useCreateBudget() {
  return useMutation({
    mutationFn: async (input: BudgetInput) => (await api.post<Budget>("/budgets/", input)).data,
    onSuccess: refresh,
  });
}

export function useUpdateBudget(id: number) {
  return useMutation({
    mutationFn: async (input: Partial<BudgetInput>) => (await api.put<Budget>(`/budgets/${id}`, input)).data,
    onSuccess: (budget) => {
      queryClient.setQueryData(keys.budget(id), budget);
      return refresh();
    },
  });
}

export function useDeleteBudget() {
  return useMutation({
    mutationFn: (id: number) => api.delete<unknown>(`/budgets/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.budget(id) });
      return refresh();
    },
  });
}

/** Lock money into a savings goal ("save") or move it back to the spendable balance ("release"), on-chain. */
export function useGoalMoney(id: number) {
  return useMutation({
    mutationFn: async ({ action, amount }: { action: "save" | "release"; amount: number }) =>
      (await api.post<Budget>(`/budgets/${id}/${action}`, null, { params: { amount } })).data,
    onSuccess: (budget) => queryClient.setQueryData(keys.budget(id), budget),
    // Refresh on failure too: the server may have moved money before erroring.
    onSettled: invalidateMoney,
  });
}
