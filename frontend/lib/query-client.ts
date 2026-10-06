import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Client errors (401/403/404/422) won't fix themselves on retry.
      retry: (count, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status && status >= 400 && status < 500) return false;
        return count < 2;
      },
    },
  },
});

/** Query keys in one place so mutations invalidate exactly what they change. */
export const keys = {
  me: ["me"] as const,
  transactions: ["transactions"] as const,
  transaction: (id: number) => ["transactions", id] as const,
  statistics: ["statistics"] as const,
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
  budgets: ["budgets"] as const,
  budget: (id: number) => ["budgets", "detail", id] as const,
  budgetSummary: ["budgets", "summary"] as const,
  budgetCategories: ["budgets", "categories"] as const,
  kyc: ["kyc"] as const,
  admin: ["admin"] as const,
};

/** Anything that moves money changes the balance, history, stats, budgets and notifications. */
export function invalidateMoney() {
  return Promise.all(
    [keys.me, keys.transactions, keys.statistics, keys.notifications, keys.budgets].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  );
}
