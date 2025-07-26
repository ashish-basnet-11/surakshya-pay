import { apiGet } from "@/config/api";
import { useAuthStore } from "@/store/use-auth-store";
import { ApiResponse } from "@/types/generic-types";
import { SpendingSummary } from "@/types/statistics";
import { useQuery } from "@tanstack/react-query";

async function getSpendingStatistics(): Promise<ApiResponse<SpendingSummary>> {
  const response = await apiGet<ApiResponse<SpendingSummary>>(`/statistics/`);
  return response;
}

export function useGetSpendingStatistics(options? : any) {
  return useQuery<ApiResponse<SpendingSummary>>({
    queryKey: ["spending-summary"],
    queryFn: getSpendingStatistics,
    ...options,
  });
}
