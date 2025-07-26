import { apiGet } from "@/config/api";
import { useAuthStore } from "@/store/use-auth-store";
import { ApiResponse } from "@/types/generic-types";
import { TransactionInterface } from "@/types/transaction";
import { useQuery } from "@tanstack/react-query";

async function getUserTransaction(): Promise<ApiResponse<TransactionInterface[]>> {
  const response = await apiGet<ApiResponse<TransactionInterface[]>>(`/transactions/user/${useAuthStore.getState().user?.id}`);
  return response;
}

export function useGetUserTransaction(options? : any) {
  return useQuery<ApiResponse<TransactionInterface[]>>({
    queryKey: ["transaction-list"],
    queryFn: getUserTransaction,
    ...options,
  });
}
